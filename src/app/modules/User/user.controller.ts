import { userRoute } from './user.route';
import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import UserService from "./user.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";


// create user
const createUser:RequestHandler = catchAsync(async (req, res) => {

  const result = await UserService.createUserIntoDb( req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User created successfully",
    data: result,
  });
});

const  userVerification:RequestHandler =catchAsync(async(req, res)=>{

  const { verificationCode } = req.body;

  const result = await UserService.userVerificationIntoDb(Number(verificationCode));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User verification successful",
    data: result,
});
});

const changePassword:RequestHandler=catchAsync(async(req , res)=>{

  const result = await UserService.changePasswordIntoDb(req.body, req.user.id);
 sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Change Password Successful",
    data: result,
});

});


const forgotPassword:RequestHandler=catchAsync(async(req , res)=>{

  const result = await UserService.forgotPasswordIntoDb(req.body);  
 sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Checked Your Email",
    data: result,
});

});

const verificationForgotUser:RequestHandler=catchAsync(async(req , res)=>{

  const result = await UserService.verificationForgotUserIntoDb(req.body);  
 sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Verification Successful",
    data: result,
});

});

const resetPassword:RequestHandler=catchAsync(async(req , res)=>{

  const result = await UserService.resetPasswordIntoDb(req.body);

   sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Successfully Reset Password",
    data: result,
});
});

const getUserGrowth:RequestHandler=catchAsync(async(req , res)=>{

  const result = await UserService.getUserGrowthIntoDb(req.query);
     sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Successfully found user growth",
    data: result,
});
  });

  const resendVerificationOtp:RequestHandler=catchAsync(async(req , res)=>{

  const result = await UserService.resendVerificationOtpIntoDb(req.params.email);
       sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Successfully sent verification otp",
    data: result,
});
 });

const UserController={
  createUser,
  userVerification,
  changePassword,
   forgotPassword,
    verificationForgotUser,
     resetPassword,
     getUserGrowth,
     resendVerificationOtp
};
export default UserController;























