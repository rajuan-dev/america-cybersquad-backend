import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import FeesManagementServices from "./fees_management.services";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";


const recordedFeesManagement:RequestHandler=catchAsync(async(req , res)=>{


     const result=await  FeesManagementServices.recordedFeesManagementIntoDb( req.body);
      sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: result,
  });
});

const findByFeesManagement:RequestHandler=catchAsync(async(req , res)=>{

  const result=await FeesManagementServices.findByFeesManagementIntoDb(req.params.subscriptionId, req.query);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: result,
  });

});

const updateFeesManagement:RequestHandler=catchAsync(async(req , res)=>{


    const result=await FeesManagementServices.updateFeesManagementIntoDb(req.params.feesManagementId, req.body);
     sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: result,
  });
});


const  findBySpecificFeesManagement:RequestHandler=catchAsync(async(req , res)=>{

   const result=await FeesManagementServices.findBySpecificFeesManagementIntoDb(req.params.feesManagementId);
    sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By Specific Fees Management",
    data: result,
  });
})

const FeesManagementController={
    recordedFeesManagement,
    findByFeesManagement,
    updateFeesManagement,
    findBySpecificFeesManagement
};

export default FeesManagementController;

