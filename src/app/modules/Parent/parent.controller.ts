import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import ParentServices from "./parent.services";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";



const findMyChildrenAllResult:RequestHandler=catchAsync(async(req , res)=>{

      const result=await ParentServices.findMyChildrenAllResultIntoDb(req.user.id, req.query);
             sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By The  Specific Exam Grades",
    data: result,
  });
});

const findBySpecificStudentAttendanceReportParent:RequestHandler=catchAsync(async(req , res)=>{

    const result=await ParentServices.findBySpecificStudentAttendanceReportParentIntoDb(req.user.id, req.params.subscriptionId, req.query);
    sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By Specific Student Attendance",
    data: result,
  });
});

const avgAttendanceCalculation:RequestHandler=catchAsync(async(req , res)=>{

    const result=await ParentServices.avgAttendanceCalculationIntoDb(req.user.id, req.params.subscriptionId, req.query);
    sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By Avg Attendance",
    data: result,
  });
})


const  ParentController={
    findMyChildrenAllResult,
    findBySpecificStudentAttendanceReportParent,
    avgAttendanceCalculation
};

export default ParentController