import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import ClassDistributionServices from "./class_distribution.services";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";


const  recordedClassDistribution:RequestHandler=catchAsync(async(req , res)=>{


      const  result=await ClassDistributionServices.recordedClassDistributionIntoDb(req.body);
      sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully Recorded",
    data: result,
  });


});

const ClassDistributionController={
    recordedClassDistribution
};

export default ClassDistributionController;

