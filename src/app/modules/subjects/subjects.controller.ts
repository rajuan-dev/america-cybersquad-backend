import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import SubjectsServices from "./subjects.services";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";



const createSubject:RequestHandler=catchAsync(async(req , res)=>{

     const result=await SubjectsServices.createSubjectIntoDb(req.user.id, req.body);
    sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Create Subject",
    data: result,
  });

});

const findBySpecificBranchSubject:RequestHandler=catchAsync(async(req , res)=>{

     const result=await SubjectsServices.findBySpecificBranchSubjectIntoDb(req.user.id, req.params.subscriptionId);
      sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find My All Subject",
    data: result,
  });
});

const findBySpecificBranchAdminAllSubject:RequestHandler=catchAsync(async(req , res)=>{

     const result=await SubjectsServices.findBySpecificBranchAdminAllSubjectIntoDb(req.user.id, req.query);
           sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find My All Subject",
    data: result,
  });
})




const SubjectController={
    createSubject,
     findBySpecificBranchSubject,
     findBySpecificBranchAdminAllSubject
};

export default SubjectController;