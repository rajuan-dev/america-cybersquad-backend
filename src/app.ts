import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import cookieParser from "cookie-parser";
import path from "path";
import bodyParser from "body-parser";
import router from "./app/routes";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";
import cors from "cors";
import cron from "node-cron";
import autoDeleteUnverifiedUser from "./utils/autoDeleteUnverifiedUser";
import catchError from "./errors/catchError";
import autoChangeStatusOnlineClass from "./utils/autoChangeStatusOnlineClass";
import autoDeleteNotification from "./utils/autoDeleteNotification";
import autoCheckedAssessmentAvailable from "./utils/assessmentAvailablity/autoCheckedAssessmentAvailable";
import config from "./config";
import requestResponseLogger from "./app/middlewares/requestResponseLogger";

declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

const app: Application = express();

// AWS / Reverse Proxy setup
app.set("trust proxy", true);

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const configuredOrigins = (config.frontend_url || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const allowList = new Set([
      ...configuredOrigins,
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
    ]);

    if (!origin || allowList.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(requestResponseLogger);
app.use(
  bodyParser.json({
    verify: function (
      req: express.Request,
      res: express.Response,
      buf: Buffer,
    ) {
      req.rawBody = buf;
    },
  }),
);

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/", (req: Request, res: Response) => {
  res.send({
    status:true,
    message: "Successfully Run America Cyber squad Backend",
  });
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads"))); 

app.use("/api/v1", router);

app.use(GlobalErrorHandler);


cron.schedule("*/5 * * * *", async () => {
  try {
    await autoDeleteUnverifiedUser();
  } catch (error: unknown) {
    catchError(error, "[Cron] Error deleting unverified users:");
  }
});



cron.schedule("*/10 * * * *", async () => {
  try {
   const result= await autoChangeStatusOnlineClass();
   console.log(`${result.message}-${result.updatedCount}`);
  } catch (error: unknown) {
    catchError(error, "[Cron] Error auto-changing online class status:");
  }
});


cron.schedule("0 0 * * *", async()=>{
  try{
    const result=await autoDeleteNotification();
    console.log(`result.message-${result.deletedCount}`);
  }
  catch(error:unknown){
  catchError(error, "[Cron] Error auto delete notification");
  }
});

cron.schedule("*/10 * * * *", async()=>{


    try{
      await autoCheckedAssessmentAvailable();

    }
    catch(error: unknown){
      catchError(error, "[Cron] Error auto checked assessment available");
    }
})


app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;

// docker stop redis-local
// docker start redis-local


