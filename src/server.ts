import { Server } from "http";
import app from "./app";

import config from "./config";
import { connectSocket } from "./socket/connectSocket";
import { connectRedis, disconnectRedis } from "./config/redis";
import { logger } from "./config/logger";

let server: Server;

async function main() {
  const port = Number(config.port) || 5000;
   await connectRedis();
  server = app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`✅ Redis connected successfully : ${config.redis.url}`);

   
    connectSocket(server);
  });
}

main().catch((err) => {
  console.error("❌ Fatal bootstrap error:", err);
  process.exit(1);
});

// ---------- Process-level safety ----------

function shutdown(signal: string) {
  console.log(`👋 ${signal} received. Shutting down server...`);

  if (server) {
    server.close(async () => {
      await disconnectRedis();
      logger.info("Process terminated");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on("unhandledRejection", (err) => {
  console.error("😈 Unhandled Rejection:", err);
  shutdown("UNHANDLED_REJECTION");
});

process.on("uncaughtException", (err) => {
  console.error("😈 Uncaught Exception:", err);
  shutdown("UNCAUGHT_EXCEPTION");
});

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));