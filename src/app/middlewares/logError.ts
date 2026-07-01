import { Request } from "express";
import { logger } from "../../config/logger";

const logError = (err: Error, req: Request) => {
  const logerror = {
    timestamp: new Date().toISOString(),
    error: {
      name: err.name,
      message: err.message,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query,
    },
  };
  logger.error({ ...logerror, err }, "Request failed");
  return logerror;
};

export default logError;
