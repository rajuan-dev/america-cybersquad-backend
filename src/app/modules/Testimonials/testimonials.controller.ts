import { RequestHandler } from "express";
import catchAsync from "../../../shared/catchAsync";
import TestimonialServices from "./testimonials.services";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";



const  createTestimonials:RequestHandler=catchAsync(async(req , res)=>{

      const result=await  TestimonialServices.createTestimonialsIntoDb(req);
   sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Successfully Create New Testimonials",
    data: result,
  });

});


const TestimonialController={
    createTestimonials
};

export default TestimonialController;

