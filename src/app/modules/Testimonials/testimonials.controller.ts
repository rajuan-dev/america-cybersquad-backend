import { RequestHandler, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";

import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import TestimonialServices from "./testimonials.services";



const  createTestimonials:RequestHandler=catchAsync(async(req:Request , res:Response)=>{

      const result=await  TestimonialServices.createTestimonialsIntoDb(req);
   sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Successfully Create New Testimonials",
    data: result,
  });

});


const  findByAllTestimonials:RequestHandler=catchAsync(async(req , res)=>{

      const result=await TestimonialServices.findByAllTestimonialsIntoDb(req.query);
   sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully  find by all Testimonials",
    data: result,
  });

});


const deleteTestimonials:RequestHandler=catchAsync(async(req:Request , res:Response)=>{

      const result=await TestimonialServices.deleteTestimonialsFromDb(req.params.id);
sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully  Delete Testimonials",
    data: result,
  });


})


const TestimonialController={
    createTestimonials,
     findByAllTestimonials,
      deleteTestimonials
};

export default TestimonialController;

