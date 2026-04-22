import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import StaffManagementServices from "./staff_management.services";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import config from "../../../config";



const createStaffManagement:RequestHandler=catchAsync(async(req , res)=>{


     const result=await StaffManagementServices.createStaffManagementIntoDb(req.user.id, req.body);
    sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully Create Staff",
    data: result,
  });

});


const  loginStaffManagement:RequestHandler=catchAsync(async(req , res)=>{

    const result=await StaffManagementServices.loginStaffManagementIntoDb(req.body);
      const { accessToken, refreshToken } = result;
      
        res.cookie("refreshToken", refreshToken, {
          secure: config.env === "production",
          httpOnly: true,
          sameSite: "strict",
          maxAge: 1000 * 60 * 60 * 24 * 365,
        });

    sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully Login  Staff Management ",
    data: {
      accessToken
    },
  });
})


const StaffManagementController={
    createStaffManagement,
    loginStaffManagement
};
export default  StaffManagementController;
