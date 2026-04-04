import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import BranchManagementServices from "./branch_management.services";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import config from "../../../config";



const  create_branch_admin:RequestHandler=catchAsync(async(req , res)=>{

      const result=await BranchManagementServices.create_branch_admin_IntoDb(req.user.id, req.body);

    sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully  Recorded Branch Admin",
    data: result,
  });

});


const findSubscriptionBranchById:RequestHandler=catchAsync(async(req , res)=>{

      const result=await BranchManagementServices.findSubscriptionBranchByIdIntoDb(req.user.id, req.params.subscriptionId);
    sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully Find By All Branches",
    data: result,
  });

});


const  login_branch_admin:RequestHandler=catchAsync(async(req , res)=>{

      const result=await BranchManagementServices.login_branch_admin_IntoDb(req.body);  

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
    message: "Successfully Login Branch Admin",
    data: {
      accessToken
    },
  });
});


const findByAllBranches:RequestHandler=catchAsync(async(req , res)=>{

      const result=await BranchManagementServices.findByAllBranchIntoDb(req.user.id, req.query); 

    sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By All Branches",
    data: result,
  });
  });



  const updateByBranchAdmin:RequestHandler=catchAsync(async(req , res)=>{

      const result=await BranchManagementServices.updateByBranchAdminIntoDb( req.params.id, req.body,req.user.id);  
      sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Updated Branch Admin",
    data: result,
  });
});


const deleteBranchAdmin:RequestHandler=catchAsync(async(req , res)=>{

      const result=await BranchManagementServices.deleteBranchAdminIntoDb( req.params.id,req.user.id);  
      sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Deleted Branch Admin",
    data: result,
  });
});


const findByAllBranchAdmin:RequestHandler=catchAsync(async(req , res)=>{

      const result=await BranchManagementServices.findByAllBranchAdminIntoDb( req.query); 
      sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By All Branch Admins",
    data: result,
  });
});


const changePasswordBranchAdmin:RequestHandler=catchAsync(async(req , res)=>{

      const result=await BranchManagementServices.changePasswordBranchAdminIntoDb( req.user.id,req.body);
      sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Changed Password Branch Admin",
    data: result,
  });
});

  
const refreshTokenBranchAdmin: RequestHandler = catchAsync(
  async (req, res) => {
    // ✅ 1. Safely get token
    const token = req.cookies?.refreshToken;

    // ✅ 2. Validate BEFORE service call
    if (!token) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.UNAUTHORIZED,
        message: "No refresh token provided",
        data: null,
      });
    }

    // ✅ 3. Call service AFTER validation
    const result =
      await BranchManagementServices.refreshTokenBranchAdminIntoDb(token);

    // ✅ 4. Send success response
    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Token refreshed successfully",
      data: result,
    });
  }
);
  
            




const BranchManagementController={
    create_branch_admin,
    findSubscriptionBranchById,
    login_branch_admin,
    findByAllBranches,
    updateByBranchAdmin,
    deleteBranchAdmin,
    findByAllBranchAdmin,
    changePasswordBranchAdmin,
    refreshTokenBranchAdmin
};

export default BranchManagementController;

