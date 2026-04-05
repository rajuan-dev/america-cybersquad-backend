import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync"
import { CreateStudentDto } from "./Students.interface";
import StudentsService from "./Students.services";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";



const createStudent:RequestHandler = catchAsync(async (req, res) => {

    const result = await StudentsService.createStudentIntoDb(req.user.id, req.body as CreateStudentDto);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message:"Successfully Create Student",
      data: result,
    });
  } );


  const findByAllStudents:RequestHandler = catchAsync(async (req, res) => {

    const result = await StudentsService.findByAllStudentsIntoDb(req.user.id, req.query);   
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:"Successfully Get All Students",
        data: result,
    });
    } );

    const findByAllStudents_Institutional_Owner:RequestHandler = catchAsync(async (req, res) => {

      const result = await StudentsService.findByAllStudents_Institutional_OwnerIntoDb(req.params.subscriptionId, req.query);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message:"Successfully Get All Students",
          data: result,
      });
      } );  

      const deleteStudent:RequestHandler = catchAsync(async (req, res) => {

        const result = await StudentsService.deleteStudentFromDb(req.params.studentId); 
        sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: result.message,
          data:result
        });
        }
        );





  const StudentsController = {
    createStudent,
    findByAllStudents,
    findByAllStudents_Institutional_Owner,
    deleteStudent
  }
  export default StudentsController;