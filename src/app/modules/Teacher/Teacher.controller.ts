import e from "express";
import catchAsync from "../../../shared/catchAsync";
import TeacherService from "./Teacher.services";
import httpStatus from "http-status";
import sendResponse from "../../../shared/sendResponse";
import { RequestHandler } from "express-serve-static-core";



const createTeacher:RequestHandler = catchAsync(async (req, res) => {

    const result = await TeacherService.createTeacherIntoDb(req.user.id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
        message:"Successfully Create Teacher",
        data: result,
    });
    } );


    const findByAllTeachersBranchAdmin:RequestHandler = catchAsync(async (req, res) => {

      const result = await TeacherService.findByAllTeachersBranchAdminIntoDb(req.user.id, req.query);
        sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
            message:"Successfully Get All Teachers",

            data: result,
        });
        } );


        const findBySingleTeacher:RequestHandler = catchAsync(async (req, res) => {

          const result = await TeacherService.findBySingleTeacherIntoDb(req.params.teacherId);
            sendResponse(res, {
              statusCode: httpStatus.OK,
              success: true,
                
                
                
                message:"Successfully Get Teacher",

                data: result,
            });
            } );


            const updateTeacher:RequestHandler = catchAsync(async (req, res) => {    
               const result= await TeacherService.updateTeacherIntoDb(req.params.teacherId, req.body);
                sendResponse(res, {
                    statusCode: httpStatus.OK,
                    success: true,
                    message:"Successfully Update Teacher",
                    data: result
                });
            } );

            const deleteTeacher:RequestHandler = catchAsync(async (req, res) => {   
                const result= await TeacherService.deleteTeacherFromDb(req.params.teacherId);
                sendResponse(res, {
                    statusCode: httpStatus.OK,
                    success: true,
                    message: result.message,
                    data: result
                });
            } );


            const findByAllTeachers_Institutional_Owner:RequestHandler = catchAsync(async (req, res) => {

              const result = await TeacherService.findByAllTeachers_Institutional_OwnerIntoDb(req.params.subscriptionId, req.query);
                sendResponse(res, {
                    statusCode: httpStatus.OK,

                    success: true,
                    message:"Successfully Get All Teachers",
                    data: result,
                });
                } );


                const findBySpecificClassListOfTeacher:RequestHandler = catchAsync(async (req, res) => {

                  const result = await TeacherService.findBySpecificClassListOfTeachersIntoDb(req.user.id, req.query);
                    sendResponse(res, {
                        statusCode: httpStatus.OK,
                        success: true,
                        message:"Successfully Get All Teachers",
                        data: result,
                    });
                    } );


      const findBySpecificStudentListOfTeachers:RequestHandler = catchAsync(async (req, res) => {

        const result = await TeacherService.findBySpecificStudentListOfTeachersIntoDb(req.user.id, req.params.subscriptionId, req.query);

          sendResponse(res, {
              statusCode: httpStatus.OK,
              success: true,
              message:"Successfully Get All Students",
              data: result,
          });
          } );





const TeacherController = {
  createTeacher,
   findByAllTeachersBranchAdmin,
   findBySingleTeacher,
   updateTeacher,
   deleteTeacher,
   findByAllTeachers_Institutional_Owner,
   findBySpecificClassListOfTeacher,
   findBySpecificStudentListOfTeachers
};
export default TeacherController;