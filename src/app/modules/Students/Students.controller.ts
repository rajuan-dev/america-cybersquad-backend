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

  const StudentsController = {
    createStudent,
    findByAllStudents
  }
  export default StudentsController;