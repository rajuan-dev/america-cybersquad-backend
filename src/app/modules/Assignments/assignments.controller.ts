import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import AssignmentsServices from "./assignments.services";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";



const createAssignments:RequestHandler=catchAsync(async(req , res)=>{


      const  result=await AssignmentsServices.createAssignmentsIntoDb(req.user.id, req.body);
          sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully  Sending Assignments",
    data: result,
  });
});
const findBySpecificTeacherAssignment:RequestHandler=catchAsync(async(req , res)=>{


   const result=await AssignmentsServices.findBySpecificTeacherAssignmentIntoDb(req.params.classDistributionId, req.user.id, req.query);
   sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully  Find By Specific Assignment",
    data: result,
  });
});

const findBySpecificAssignment:RequestHandler=catchAsync(async(req , res)=>{

   const result=await AssignmentsServices.findBySpecificAssignmentIntoDb(req.params.id);
   sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully  Find By Specific Assignment",
    data: result,
  });
});

const  updateClassTeacherAssignment:RequestHandler=catchAsync(async(req , res)=>{


    const result=await AssignmentsServices.updateClassTeacherAssignmentIntoDb(req.params.id, req.body);
     sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: result,
  });
});


const deleteClassAssignment:RequestHandler=catchAsync(async(req , res)=>{


     const result=await AssignmentsServices.deleteClassAssignmentIntoDb(req.params.id);
       sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Delete",
    data: result,
  });
});


const createClassMaterials:RequestHandler=catchAsync(async(req , res)=>{


    const result=await AssignmentsServices.createClassMaterialsIntoDb(req.body, req.user.id);
     sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Recorded Class Materials",
    data: result,
  });
});

const findBySpecificTeacherClassMaterials:RequestHandler=catchAsync(async(req , res)=>{
  const result=await  AssignmentsServices.findBySpecificTeacherClassMaterialsIntoDb(req.params.classDistributionId, req.user.id, req.query);
   sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find My All Materials",
    data: result,
  });
})



const AssignmentsController={
    createAssignments,
    findBySpecificTeacherAssignment,
    findBySpecificAssignment,
    updateClassTeacherAssignment,
    deleteClassAssignment,
    createClassMaterials,
    findBySpecificTeacherClassMaterials
    
};

export default AssignmentsController;

