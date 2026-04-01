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


const  findByAllSubscriptionsAdmin:RequestHandler=catchAsync(async(req , res)=>{


      const result=await subscriptionServices.findByAllSubscriptionsAdminIntoDb(req.query);
   sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By The All Subscription",
    data: result,
  });

});


const hardDeleteSubscriptionById:RequestHandler=catchAsync(async(req , res)=>{

     const result=await subscriptionServices.hardDeleteSubscriptionByIdIntoDb(req.params.subscriptionId);
    //  subscriptionId
    sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Delete Subscription",
    data: result,
  });
});



const findMyAllSubscriptions:RequestHandler=catchAsync(async(req , res)=>{

      const result=await subscriptionServices.findMyAllSubscriptionsIntoDb(req.user.id, req.query);
    sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find My All Subscription",
    data: result,
  });

})




const subscriptionController={
    saveUserSubscription,
     findByAllSubscriptionsAdmin,
     hardDeleteSubscriptionById,
     findMyAllSubscriptions
};

export default subscriptionController;



