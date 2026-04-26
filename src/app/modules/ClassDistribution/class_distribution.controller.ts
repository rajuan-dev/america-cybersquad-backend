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

const findByBranchAdminDistribution:RequestHandler=catchAsync(async(req , res)=>{


  const result=await ClassDistributionServices.findByBranchAdminDistributionIntoDb(req.params.subscriptionId, req.query);
        sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By Branch Admin Distribution",
    data: result,
  });
})

const ClassDistributionController={
    recordedClassDistribution,
    findByBranchAdminDistribution
};

export default ClassDistributionController;

