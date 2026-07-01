import { Response } from "express"

const sendResponse = <T>(res: Response, jsonData: {
    statusCode: number,
    success: boolean,
    message: string,
    meta?: {
        page: number,
        limit: number,
        total: number
    },
    data: T | null | undefined
}) => {
    const payload = {
        success: jsonData.success,
        message: jsonData.message,
        meta: jsonData.meta ?? null,
        data: jsonData.data ?? null
    };

    res.locals.responseBody = payload;
    res.status(jsonData.statusCode).json(payload)
}

export default sendResponse;
