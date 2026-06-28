import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import LandingPageServices from "./landingPage.services";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";



const mission:RequestHandler=catchAsync(async(req , res)=>{

        const result=await LandingPageServices.missionIntoDb(req.body);
        sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully Recorded",
    data: result,
  });
});

const findByMission:RequestHandler=catchAsync(async(req , res)=>{
      const result=await LandingPageServices.findByMissionIntoDb();
       sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully  Find My Mission Data ",
    data: result,
  });
});

const vision: RequestHandler = catchAsync(async (req, res) => {
  const result = await LandingPageServices.visionIntoDb(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Vision saved successfully",
    data: result,
  });
});

const findByVision: RequestHandler = catchAsync(async (req, res) => {
  const result = await LandingPageServices.findByVisionIntoDb();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully found vision data",
    data: result,
  });
});

const LandingPageController={
      mission, 
      findByMission,
      vision,
      findByVision
};
export default LandingPageController;
