import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import StaffManagementServices from "./staff_management.services";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";



const createStaffManagement:RequestHandler=catchAsync(async(req , res)=>{


     const result=await StaffManagementServices.createStaffManagementIntoDb(req.user.id, req.body);
sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully Create Staff",
    data: result,
  });

});


const StaffManagementController={
    createStaffManagement
};
export default  StaffManagementController;
