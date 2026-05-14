import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import ExamAnnouncementServices from "./examAnnouncement.services";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";



const examAnnouncementService:RequestHandler=catchAsync(async(req , res)=>{


      const result=await ExamAnnouncementServices.examAnnouncementServiceIntoDb(req.body);
    sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully Send Exam Announcement",
    data: result,
  });

});


const  findMyAnnouncementExamList:RequestHandler=catchAsync(async(req , res)=>{

    const result=await ExamAnnouncementServices.findMyAnnouncementExamListIntoDb(req.params.subscriptionId, req.user.id, req.query)
   sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find My All Announcement",
    data: result,
  });
  });


  const findBySpecificAnnouncementExam:RequestHandler=catchAsync(async(req , res)=>{

    const result=await ExamAnnouncementServices.findBySpecificAnnouncementExamIntoDb(req.params.id);
    sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find Specific Announcement Exam",
    data: result,
  });

     
  });


const ExamAnnouncementController={
    examAnnouncementService,
    findMyAnnouncementExamList,
    findBySpecificAnnouncementExam
};

export default ExamAnnouncementController;


