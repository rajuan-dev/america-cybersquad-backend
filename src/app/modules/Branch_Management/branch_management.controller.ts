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


const BranchManagementController={
    create_branch_admin,
    findSubscriptionBranchById,
    login_branch_admin,
    findByAllBranches
};

export default BranchManagementController;

