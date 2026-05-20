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

const findByAllHealthRecord:RequestHandler=catchAsync(async(req , res)=>{

    const result=await nurseServices.findByAllHealthRecordIntoDb(req.user.id, req.user.subscriptionId, req.query);
           sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By All Health Record",
    data: result,
  });
});


const  findBySpecificHealthRecord:RequestHandler=catchAsync(async(req , res)=>{
  const result=await  nurseServices.findBySpecificHealthRecordIntoDb(req.params.id);
   sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By Specific Health Record",
    data: result,
  });
});

const updateSpecificHealthRecord:RequestHandler=catchAsync(async(req , res)=>{

   const result=await nurseServices.updateSpecificHealthRecordIntoDb(req.params.id, req.body);
    sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Specific Update Health Record",
    data: result,
  });
});

const deleteHealthRecord:RequestHandler=catchAsync(async(req , res)=>{

  const result=await nurseServices.deleteHealthRecordIntoDb(req.params.id);
      sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: result,
  });
})

const nurseController={
    healthRecord,
    findByAllHealthRecord,
    findBySpecificHealthRecord,
    updateSpecificHealthRecord,
    deleteHealthRecord
    
};

export default nurseController;

