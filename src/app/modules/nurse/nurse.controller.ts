import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import nurseServices from "./nurse.services";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";



const healthRecord:RequestHandler=catchAsync(async(req , res)=>{

      const result=await nurseServices.healthRecordIntoDb(req.body, req.user.id);
       sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully Recorded",
    data: result,
  });
});

const nurseController={
    healthRecord
};

export default nurseController;

