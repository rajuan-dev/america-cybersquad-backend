import { Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import config from "../../../config";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthServices } from "./auth.service";

// login user
const loginUser :RequestHandler= catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUserIntoDb(req.body);

  const { accessToken, refreshToken } = result;

  // store refresh token in cookie
  res.cookie("refreshToken", refreshToken, {
    secure: config.env === "production",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

const refreshToken: RequestHandler = catchAsync(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: "No refresh token provided",
      data: null,
    });
  }


  const result = await AuthServices.refreshTokenIntoDb(token);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Access token retrieved successfully",
    data: result,
  });
});


const myProfile: RequestHandler = catchAsync(async (req, res) => {
  

  const result = await AuthServices.myProfileIntoDb(req.user?.id, req.user.role);
   sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully retrieved user profile",
    data: result,
  });

});
  
const  changeMyProfile: RequestHandler = catchAsync(async (req, res) => {
  const {id, role} = req.user;    
  const result = await AuthServices.changeMyProfileIntoDb(req as any,id , role);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully changed user profile",
    data: result,
  });
   });

   const findByAllUsersAdmin: RequestHandler = catchAsync(async (req, res) => {
    const result = await AuthServices.findByAllUsersAdminIntoDb(req.query as Record<string, unknown>);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Successfully find All Users",
      data: result,
    });
  });


  const deleteAccount:RequestHandler = catchAsync(async (req, res) => {

     const result = await AuthServices.deleteAccountIntoDb(req.user?.id as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Successfully deleted account",
      data: result,
    });
  });


  const  isBlockAccount:RequestHandler = catchAsync(async (req, res) => {
    const result = await AuthServices.isBlockAccountIntoDb(req.params?.id as string, req.body, req.user?.role as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Successfully retrieved block status",
      data: result,
    });
  });

// create user and login facebook and google
const socialLogin = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.socialLogin(req.body);

  res.cookie("token", result.accessToken, {
    secure: config.env === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

// website login after booking
const loginWebsite = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginWebsite(req.body);

  // res.cookie("token", result.accessToken, {
  //   secure: config.env === "production",
  //   httpOnly: true,
  //   sameSite: "none",
  //   maxAge: 1000 * 60 * 60 * 24 * 365,
  // });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered and logged in successfully",
    data: result,
  });
});



// logout user
const logoutUser = catchAsync(async (req: Request, res: Response) => {
  // Clear the token cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Successfully logged out",
    data: null,
  });
});

// change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { oldPassword, newPassword } = req.body;

  const result = await AuthServices.changePassword(
    userId,
    oldPassword,
    newPassword
  );

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Password changed successfully",
    data: result,
  });
});





export const AuthController = {
  loginUser,
  refreshToken,
  myProfile,
  changeMyProfile,
  findByAllUsersAdmin,
   deleteAccount,
    isBlockAccount,
  socialLogin,
  loginWebsite,
  logoutUser,
  changePassword
 
};
