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
  query: Record<string, any>
) => {
  try {
    const queryBuilder = new PrismaQueryBuilder(query)
      .search(searchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    // ✅ safe extraction
    const className = query.className;
    const branchName = query.branchName;
    const subscriptionId = query.subscriptionId;

    // ✅ student filters
    const studentFilter: Record<string, any> = {};

    if (className) studentFilter.className = className;
    if (branchName) studentFilter.branchName = branchName;

    // ✅ subscription filter (safe)
    const subscriptionFilter =
      subscriptionId
        ? {
            id: subscriptionId,
          }
        : undefined;

    const whereCondition: any = {
      branchAdminId,

      ...queryOptions.where,

      ...(Object.keys(studentFilter).length && studentFilter),

      ...(subscriptionFilter && {
        subscription: {
          is: subscriptionFilter,
        },
      }),
    };

    // ✅ main query
    const [result, total] = await Promise.all([
      prisma.student.findMany({
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

          // ✅ FIXED subscription select
          subscriptions: {
            select: {
              id: true,
              price: true,
              subscriptiondetails: {
                select: {
                  id: true,
                  subscriptionType: true,
                  schoolName: true,
                  city: true,
                  state: true,
                  country: true,
                },
              },
            },
          },
        },
      }),

      prisma.student.count({
        where: whereCondition,
      }),
    ]);

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    return {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      data: result,
    };
  } catch (error) {
    return catchError(error, "Error fetching students from database");
  }
};


const findByAllStudents_Institutional_OwnerIntoDb = async (
  subscriptionId: string,
  query: Record<string, any>
) => {
  try {
    const queryBuilder = new PrismaQueryBuilder(query)
      .search(searchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    // ✅ safe extraction (no conflict)
    const className = query.className;
    const branchName = query.branchName;

    // ✅ student filter
    const studentFilter: Record<string, any> = {};

    if (className) studentFilter.className = className;
    if (branchName) studentFilter.branchName = branchName;

    // ❌ REMOVE duplicate subscription filter logic
    const whereCondition: any = {
      subscriptionId, // main owner filter

      ...queryOptions.where,

      ...studentFilter,
    };

    const [result, total] = await Promise.all([
      prisma.student.findMany({
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

          // ✅ clean relation select
          subscriptions: {
            select: {
              id: true,
              price: true,
             
            },
          },
        },
      }),

      prisma.student.count({
        where: whereCondition,
      }),
    ]);

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    return {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
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