import { Request } from "express";

import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";

const createTestimonialsIntoDb = async (req: Request) => {
  const file = req.file;
  const bodyData = req.body;

  // Validate that a video file was provided
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Video file is required", "");
  }

   const payload = {
      ...bodyData,
      ...(file?.path && { videoUrl: file.path.replace(/\\/g, "/") }),
    };


  const result=await prisma.testimonials.create({
    data:payload
  });

  if(!result){
    throw new ApiError(httpStatus.NOT_EXTENDED,'issues by the  Testimonials create section')
  }

 

  return{
    status:true ,
    message:"successfully created"
  }
};

const TestimonialServices = {
  createTestimonialsIntoDb,
};

export default TestimonialServices;