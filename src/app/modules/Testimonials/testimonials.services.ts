import { Request } from "express";

import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import path from "path";
import fs from "fs";
import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";
import catchError from "../../../errors/catchError";

const createTestimonialsIntoDb = async (req: Request) => {
  const file = req.file;
  const bodyData = req.body;

  // Validate that a video file was provided
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Video file is required", "");
  }



const payload = {
  ...bodyData,
  ...(file?.path && {
    videoUrl: file.path
      .replace(/\\/g, "/")
      .replace(process.cwd().replace(/\\/g, "/") + "/", ""),
  }),
};

  const result=await prisma.testimonials.create({
    data:payload
  });
  if(!result){
    throw new ApiError(httpStatus.NOT_EXTENDED,'issues by the  Testimonials create section')
  };

  return{
    status:true ,
    message:"successfully created"
  }
};

const findByAllTestimonialsIntoDb = async (query: Record<string, unknown>) => {
  try {
    const queryBuilder = new PrismaQueryBuilder(query)
      .search( [])
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    const result = await prisma.testimonials.findMany({
      where: queryOptions.where,
      orderBy: queryOptions.orderBy,
      skip: queryOptions.skip,
      take: queryOptions.take,
     select: {
    id: true,
    name: true,
    designation:true,
    videoUrl:true,
    workingPlace:true,
     createdAt: true,
    updatedAt: true,
  },
    });

    const total = await prisma.testimonials.count({
      where: queryOptions.where,
    });

    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      meta: {
        page,
        limit,
        total,
        totalPage,
      },
      data: result,
    };
  } catch (error: unknown) {
    throw error; // let global error handler manage it
  }
};


const deleteTestimonialsFromDb = async (id: string) => {

  try{

     const testimonial = await prisma.testimonials.findUnique({
    where: { id },
    select:{
      videoUrl:true
    }
  }) as any;

  if (!testimonial) {
    throw new ApiError(httpStatus.NOT_FOUND, "Testimonial not found", "");
  }

  const filePath = path.join(process.cwd(), testimonial.videoUrl);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await prisma.testimonials.delete({
    where: { id }
  });

  return {
    status: true,
    message: "Testimonial deleted successfully"
  };

  }
  catch(error){
    catchError(error);
  }
};




const TestimonialServices = {
  createTestimonialsIntoDb,
  findByAllTestimonialsIntoDb,
  deleteTestimonialsFromDb
};

export default TestimonialServices;