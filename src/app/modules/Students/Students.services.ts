import { Student } from './../../../../node_modules/.prisma/client/index.d';

import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { CreateStudentDto } from "./Students.interface";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import PrismaQueryBuilder from '../../builder/PrismaQueryBuilder';
import { searchableFields } from './Students.constant';



const createStudentIntoDb = async (
  branchAdminId: string,
  payload: CreateStudentDto
):Promise<{ status: boolean; message: string }> => {
  try {
    if (!branchAdminId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Branch admin id is required");
    }

    const isStudentExist = await prisma.student.findUnique({
      where: { email: payload.email },
      select: { id: true },
    });

    if (isStudentExist) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Student with this email already exists"
      );
    }

    // ✅ remove unsafe override possibility
    const { branchAdminId: _ignored, ...safePayload } = payload as CreateStudentDto;

   const result= await prisma.student.create({
      data: {
        branchAdminId,
        ...safePayload,
      },
    });
    if(!result){
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create student");
    }

    return {
      status: true,
      message: "Student created successfully",
    };
  } catch (error) {
    return catchError(error, "Error creating student in database");
  }
};


const findByAllStudentsIntoDb = async (
  branchAdminId: string,
  query: Record<string, unknown>
) => {
  try {
  
    const queryBuilder = new PrismaQueryBuilder(query)
      .search( searchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();
    const { className, branchName, subscriptionId } = query;
    const studentFilter: any = {};

    if (className) {
      studentFilter.className = className;
    }

    if (branchName) {
      studentFilter.branchName = branchName;
    }
    const subscriptionFilter: any = {};

    if (subscriptionId) {
      subscriptionFilter.id = subscriptionId;
    }
    const result = await prisma.student.findMany({
      where: {
        branchAdminId, // 🔐 always restrict to logged-in admin

        ...queryOptions.where,
        ...studentFilter,

        // ✅ relation filter (many-to-one → use `is`)
        ...(Object.keys(subscriptionFilter).length > 0 && {
          subscription: {
            is: subscriptionFilter,
          },
        }),
      },

      orderBy: queryOptions.orderBy,
      skip: queryOptions.skip,
      take: queryOptions.take,

      select: {
        id: true,
        name: true,
        email: true,
        branchName: true,
        className: true,
        guardianName: true,
        guardianPhone: true,
        photo: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        subscriptions:{
            select:{  studentLimit:true}
        }
      },
    });


    const total = await prisma.student.count({
      where: {
        branchAdminId,
        ...queryOptions.where,
        ...studentFilter,
        ...(Object.keys(subscriptionFilter).length > 0 && {
          subscription: {
            is: subscriptionFilter,
          },
        }),
      },
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
  } catch (error) {
    return catchError(error, "Error fetching students from database");
  }
};

const StudentsService = {
  createStudentIntoDb,
  findByAllStudentsIntoDb
};
export default StudentsService;