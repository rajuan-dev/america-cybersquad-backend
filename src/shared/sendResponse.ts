import { Response } from "express";

type TMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

const sendResponse = <T>(
  res: Response,
  jsonData: {
    statusCode: number;
    success: boolean;
    message: string;
    meta?: TMeta;
    data: T | null;
  }
) => {
  const payload = {
    success: jsonData.success,
    message: jsonData.message,
    meta: jsonData.meta ,
    data: jsonData.data ?? null,
  };

  res.locals.responseBody = payload;

  return res.status(jsonData.statusCode).json(payload);
};

export default sendResponse;