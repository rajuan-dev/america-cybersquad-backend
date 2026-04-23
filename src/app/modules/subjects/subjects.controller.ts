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
});


const findBySpecificBranchUnderSubject: RequestHandler=catchAsync(async(req , res)=>{

      const result=await SubjectsServices.findBySpecificBranchUnderSubjectIntoDb(req.user.id , req.params.id);
       sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Find By The Subject",
    data: result,
  });
});


const updateSubject:RequestHandler=catchAsync(async(req , res)=>{

      const result=await SubjectsServices.updateSubjectIntoDb(req.params.id, req.user.id, req.body);
        sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message:result.message,
    data: result,
  });
});


const deleteSubject: RequestHandler=catchAsync(async(req , res)=>{

      const result=await SubjectsServices.deleteSubjectIntoDb(req.params.id, req.user.id);
       sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message:result.message,
    data: result,
});

  });




const SubjectController={
    createSubject,
     findBySpecificBranchSubject,
     findBySpecificBranchAdminAllSubject,
    findBySpecificBranchUnderSubject,
    updateSubject,
    deleteSubject
};

export default SubjectController;