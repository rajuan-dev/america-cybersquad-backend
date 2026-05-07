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
  // origin: [
  //   "http://localhost:5173",
  //   "http://localhost:3000",
  //   "https://timothy-dashboard.netlify.app",
  //   "https://temothy-dashboard.vercel.app",
  // ],
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

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

// Route handler for the root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send({
    status:true,
    message: "Successfully Run America Cyber squad Backend",
  });
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads"))); 

app.use("/api/v1", router);

app.use(GlobalErrorHandler);

// autoDeleteUnverifiedUser

// Delete unverified users every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  try {
    await autoDeleteUnverifiedUser();
  } catch (error: unknown) {
    catchError(error, "[Cron] Error deleting unverified users:");
  }
});

// autoChangeStatusOnlineClass

cron.schedule("*/10 * * * *", async () => {
  try {
    await autoChangeStatusOnlineClass();
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


