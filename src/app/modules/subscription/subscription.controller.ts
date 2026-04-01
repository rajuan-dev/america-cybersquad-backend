import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import subscriptionServices from "./subscription.services";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";



const saveUserSubscription:RequestHandler=catchAsync(async(req , res)=>{


      const result=await subscriptionServices.saveUserSubscriptionIntoDb(req.user.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully  Completed Your Subscription",
    data: result,
  });


});


const subscriptionController={
    saveUserSubscription
};

export default subscriptionController;



