import { Student } from './../../../../node_modules/.prisma/client/index.d';

import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { CreateStudentDto } from "./Students.interface";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import PrismaQueryBuilder from '../../builder/PrismaQueryBuilder';
import { searchableFields } from './Students.constant';
import fs from "fs";
import path from "path";



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


const findByAllStudents_Institutional_OwnerIntoDb = async (
  subscriptionId: string,
  query: Record<string, unknown>
) => {

  
  try {
    const queryBuilder = new PrismaQueryBuilder(query)
      .search(searchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    const { className, branchName, subscriptionId: querySubscriptionId } = query;

    const studentFilter: Record<string, any> = {};

    if (className) {
      studentFilter.className = className;
    }

    if (branchName) {
      studentFilter.branchName = branchName;
    }

    const subscriptionFilter: Record<string, any> = {};

    if (querySubscriptionId) {
      subscriptionFilter.id = querySubscriptionId;
    }

    const whereCondition = {
      subscriptionId, // from function param
      ...queryOptions.where,
      ...studentFilter,
      ...(Object.keys(subscriptionFilter).length > 0 && {
        subscription: {
          is: subscriptionFilter,
        },
      }),
    };

    const result = await prisma.student.findMany({
      where: whereCondition,
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
        select:{
            studentLimit:true
        }
       }
      },
    });

    const total = await prisma.student.count({
      where: whereCondition, // ✅ reuse same condition
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

const deleteStudentFromDb = async (
  studentId: string
): Promise<{ status: boolean; message: string }> => {
  try {

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { photo: true }, 
    });

    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, "Student not found");
    }

    if (student.photo) {
      const photoArray = Array.isArray(student.photo) ? student.photo : [student.photo];

      photoArray.forEach((photoPath) => {
        const fullPath = path.resolve(photoPath);
        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
            console.log(`Deleted photo file: ${fullPath}`);
          } catch (err) {
            console.warn(`Failed to delete file ${fullPath}:`, err);
          }
        }
      });
    }

    await prisma.student.delete({
      where: { id: studentId },
    });

    return {
      status: true,
      message: "Student and associated photo(s) deleted successfully",
    };
  } catch (error) {
    return catchError(error, "Error deleting student from database");
  }
};



 const updateStudentIntoDb = async (
  studentId: string,
  payload: Partial<CreateStudentDto>  ): Promise<{ status: boolean; message: string }> => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    }); 
    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, "Student not found");
    } 
      await prisma.student.update({ 
        where: { id: studentId },
        data: payload,
      });

    return {  
      status: true,
      message: "Student updated successfully",
    };
  } catch (error) {
    return catchError(error, "Error updating student in database");
  }
};


// student authentication and verification services can be added here in the future
// now is pending for future implementation if needed


const StudentsService = {
  createStudentIntoDb,
  findByAllStudentsIntoDb,
  findByAllStudents_Institutional_OwnerIntoDb,
  deleteStudentFromDb,
  updateStudentIntoDb
};
export default StudentsService;