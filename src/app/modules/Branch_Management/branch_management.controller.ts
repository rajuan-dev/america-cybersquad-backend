import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import BranchManagementServices from "./branch_management.services";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";



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

})


const BranchManagementController={
    create_branch_admin,
    findSubscriptionBranchById
};

export default BranchManagementController;

