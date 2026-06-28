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

const createTeam:RequestHandler=catchAsync(async(req , res)=>{
   const result=await LandingPageServices.createTeamIntoDb(req.body);
    sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully Create Team",
    data: result,
  });
});

const findByAllTeams:RequestHandler=catchAsync(async(req , res)=>{

   const result=await LandingPageServices.findByAllTeamsIntoDb(req.query);
    sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully Find By Team",
    data: result,
  });
});

const findBySpecificTeam:RequestHandler=catchAsync(async(req , res)=>{
   const result=await LandingPageServices.findBySpecificTeamIntoDb(req.params.id);
sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully Find By Specific Team",
    data: result,
  });
})
const updateTeam = catchAsync(async (req, res) => {
  const result = await LandingPageServices.updateTeamIntoDb(
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Successfully Updated Team",
    data: result,
  });
});
const deleteTeam = catchAsync(async (req, res) => {
  const result = await LandingPageServices.deleteTeamIntoDb(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Successfully Deleted Team",
    data: result,
  });
});


const createFaq = catchAsync(async (req, res) => {
  const result = await LandingPageServices.createFaqIntoDb(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Successfully Created FAQ",
    data: result,
  });
});


const findByAllFAQ:RequestHandler=catchAsync(async(req , res)=>{
   const result=await LandingPageServices.findByAllFAQIntoDb(req.query);
    sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Successfully find My All FAQ",
    data: result,
  });
})

const LandingPageController={
      mission, 
      findByMission,
      vision,
      findByVision,
      createTeam,
      findByAllTeams,
      findBySpecificTeam,
      updateTeam,
      deleteTeam,
      createFaq,
      findByAllFAQ
      
};
export default LandingPageController;
