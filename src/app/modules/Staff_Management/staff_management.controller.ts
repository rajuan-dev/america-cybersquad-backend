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
});


const findByAllStaffManagement:RequestHandler=catchAsync(async(req , res)=>{

    const result=await StaffManagementServices.findByAllStaffManagementIntoDb(req.params.subscriptionId, req.query);
        sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By All Staff ",
    data: result,
  });
});


const findBySpecificStaff:RequestHandler=catchAsync(async(req , res)=>{


    const result=await StaffManagementServices.findBySpecificStaffIntoDb(req.params.staffId);
            sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find  By Specific Staff ",
    data: result,
  });
});

const updateStaffInformation:RequestHandler=catchAsync(async(req , res)=>{

    const result=await StaffManagementServices.updateStaffInformationIntoDb(req.params.staffId, req.body);
     sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Update",
    data: result,
  });

});

const deleteStaffManagement:RequestHandler=catchAsync(async(req , res)=>{

   const result=await StaffManagementServices.deleteStaffManagementIntoDb(req.params.staffId);
               sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.message,
    data: result,
  });
})


const StaffManagementController={
    createStaffManagement,
    loginStaffManagement,
    findByAllStaffManagement,
    findBySpecificStaff,
    updateStaffInformation,
     deleteStaffManagement
};
export default  StaffManagementController;
