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
});

const findBySpecificClassDistribution:RequestHandler=catchAsync(async(req , res)=>{


    const result=await ClassDistributionServices.findBySpecificClassDistributionIntoDb(req.params.id);
    sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By Specific Class Distribution",
    data: result,
  });
});


const updateClassDistribution:RequestHandler=catchAsync(async(req , res)=>{


   const result=await ClassDistributionServices.updateClassDistributionIntoDb(req.params.id, req.body);
 sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Update Class Distribution",
    data: result,
  });

});


const deleteClassDistribution:RequestHandler=catchAsync(async(req , res)=>{


   const result=await ClassDistributionServices.deleteClassDistributionIntoDb(req.params.id);
   sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Delete",
    data: result,
  });
});


const findByBranchAdminClassSchedule:RequestHandler=catchAsync(async(req , res)=>{

    const result=await ClassDistributionServices.findByBranchAdminClassScheduleIntoDb(req.params.subscriptionId, req.query);
     sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By All Class Schedule",
    data: result,
  });
});

const  classSchedule:RequestHandler=catchAsync(async(req , res)=>{

    const result=await ClassDistributionServices.classScheduleIntoDb(req.params.classDistributionId, req.body);

 sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: result,
  });


});

const findByAllDistributedClass:RequestHandler=catchAsync(async(req , res)=>{

    const result=await ClassDistributionServices.findByAllDistributedClassIntoDb(req.user.id);
     sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Successfully Find By All Subject',
    data: result,
  });

})



const ClassDistributionController={
    recordedClassDistribution,
    findByBranchAdminDistribution,
    findBySpecificClassDistribution,
    updateClassDistribution,
    deleteClassDistribution,
    findByBranchAdminClassSchedule,
     classSchedule,
     findByAllDistributedClass
};

export default ClassDistributionController;

