import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import ApiError from "../../errors/ApiErrors";
import { IGenericErrorMessage } from "../../interfaces/error";
import config from "../../config";
import logError from "./logError";

const GlobalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong!";
  let errorMessages: IGenericErrorMessage[] = [];
  logError(error, req);
 
  if (error instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Error";

    errorMessages = error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  }


  else if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    statusCode = httpStatus.CONFLICT;

    const field = (error.meta?.target as string[])?.join(", ");

    message = `${field} already exists`;

    errorMessages = [
      {
        path: field,
        message: `${field} must be unique`,
      },
    ];
  }

  
  else if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    statusCode = httpStatus.NOT_FOUND;

    message = "Record not found";

    errorMessages = [
      {
        path: "",
        message: "Requested resource does not exist",
      },
    ];
  }

 
  else if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2003"
  ) {
    statusCode = httpStatus.BAD_REQUEST;

    message = "Invalid reference id";

    errorMessages = [
      {
        path: "",
        message: "Foreign key constraint failed",
      },
    ];
  }

  else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Prisma validation error";

    errorMessages = [
      {
        path: "",
        message: error.message,
      },
    ];
  }


  else if (error instanceof Prisma.PrismaClientInitializationError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;

    message = "Database connection failed";

    errorMessages = [
      {
        path: "",
        message: "Failed to initialize Prisma Client",
      },
    ];
  }

 
  else if (error instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;

    message = "Database engine crashed";

    errorMessages = [
      {
        path: "",
        message: "Prisma engine panic error",
      },
    ];
  }


  else if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;

    errorMessages = [
      {
        path: "",
        message: error.message,
      },
    ];
  }


  else if (error instanceof Error) {
    message = error.message;

    errorMessages = [
      {
        path: "",
        message: error.message,
      },
    ];
  }


  else {
    message = "Unexpected error occurred";

    errorMessages = [
      {
        path: "",
        message: "Unexpected error occurred",
      },
    ];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: config.env !== "production" ? error?.stack : undefined,
  });
};

export default GlobalErrorHandler;