import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import AnnouncementsServices from "./announcements.services";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";



const sendAnnouncements:RequestHandler=catchAsync(async(req , res)=>{

    const token = req.headers.authorization;

if (!token) {
  throw new ApiError(httpStatus.UNAUTHORIZED, "Authorization token missing");
}

const result = await AnnouncementsServices.sendAnnouncementsIntoDb(
  req.body,
  token
);

      sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully Send Notification",
    data: result,
  });


});


const findByAnnouncement:RequestHandler=catchAsync(async(req , res)=>{

   const token = req.headers.authorization;

   if (!token) 
    {throw new ApiError(httpStatus.UNAUTHORIZED, "Authorization token missing");}
   const result=await AnnouncementsServices.findByAnnouncementIntoDb(req.query, token);
      sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By All Announcement",
    data: result,
  });

});

const  findAllAnnouncement: RequestHandler=catchAsync(async(req , res)=>{

    const result=await AnnouncementsServices.findAllAnnouncementIntoDb(req.query);
    sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By All Announcement",
    data: result,
  });
})


const AnnouncementsController={
    sendAnnouncements,
    findByAnnouncement,
     findAllAnnouncement
};

export default AnnouncementsController;

