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


  const updateAnnouncementExam:RequestHandler=catchAsync(async(req , res)=>{

     const result=await ExamAnnouncementServices.updateAnnouncementExamIntoDb(req.params.id, req.body);
     sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Update Announcement Exam",
    data: result,
  });
  });

  const deleteAnnouncementExam:RequestHandler=catchAsync(async(req , res)=>{

      const result=await ExamAnnouncementServices.deleteAnnouncementExamIntoDb(req.params.id);
       sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Delete Announcement Exam",
    data: result,
  });
  });


  const findBySpecificStudentAnnouncementExamList:RequestHandler=catchAsync(async(req , res)=>{

      const result=await ExamAnnouncementServices.findBySpecificStudentAnnouncementExamListIntoDb(req.params.subscriptionId, req.user.id, req.query);
        sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By Exam Announcement List",
    data: result,
  });
  });


  const findByParticipantStudentList:RequestHandler=catchAsync(async(req , res)=>{


      const result=await ExamAnnouncementServices.findByParticipantStudentListIntoDb(req.params.examAnnouncementId, req.query);
        sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find My Participant Student List",
    data: result,
  });
  });

  const recordedExamGrades:RequestHandler=catchAsync(async(req , res)=>{

     const result=await ExamAnnouncementServices.recordedExamGradesIntoDb(req.user.id, req.body);
    sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Recorded  Grades",
    data: result,
  });

  });


  const findByExamGradesSpecificTeacher:RequestHandler=catchAsync(async(req , res)=>{

     const result=await ExamAnnouncementServices.findByExamGradesSpecificTeacherIntoDb(req.params.subscriptionId, req.user.id, req.query);
         sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find My Student Grate",
    data: result,
  });
  });

  const findBySpecificExamGrades:RequestHandler=catchAsync(async(req , res)=>{


     const  result=await ExamAnnouncementServices.findBySpecificExamGradesIntoDb(req.params.id);
      sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By The Specific Exam Grades",
    data: result,
  });
  });

  const updateExamGradesSpecificTeacher:RequestHandler=catchAsync(async(req , res)=>{

      const result=await ExamAnnouncementServices.updateExamGradesSpecificTeacherIntoDb(req.params.id, req.body);
       sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Update Exam Grades",
    data: result,
  });

  });

  const deleteExamGradesSpecificTeacher:RequestHandler=catchAsync(async(req , res)=>{
     const result=await ExamAnnouncementServices.deleteExamGradesSpecificTeacherIntoDb(req.params.id);
      sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Delete Exam Grades",
    data: result,
  });
  })
  




const ExamAnnouncementController={
    examAnnouncementService,
    findMyAnnouncementExamList,
    findBySpecificAnnouncementExam,
    updateAnnouncementExam,
    deleteAnnouncementExam,
    findBySpecificStudentAnnouncementExamList,
    findByParticipantStudentList,
    recordedExamGrades,
    findByExamGradesSpecificTeacher,
    findBySpecificExamGrades,
    updateExamGradesSpecificTeacher,
    deleteExamGradesSpecificTeacher
};

export default ExamAnnouncementController;


