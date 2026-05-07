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


const AssignmentsController={
    createAssignments,
    findBySpecificTeacherAssignment
};

export default AssignmentsController;

