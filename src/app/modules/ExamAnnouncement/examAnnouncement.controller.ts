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


const ExamAnnouncementController={
    examAnnouncementService
};

export default ExamAnnouncementController;


