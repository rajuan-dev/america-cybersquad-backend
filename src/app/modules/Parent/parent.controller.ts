import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import ParentServices from "./parent.services";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";



const findMyChildrenAllResult:RequestHandler=catchAsync(async(req , res)=>{

      const result=await ParentServices.findMyChildrenAllResultIntoDb(req.user.id, req.query);
             sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By The  Specific Exam Grades",
    data: result,
  });
});


const  ParentController={
    findMyChildrenAllResult
};

export default ParentController