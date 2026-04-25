import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { Teacher } from "./Teacher.interface";
import bcrypt from "bcrypt";
import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";
import { searchableTeacherFields } from "./Teacher.constant";
import fs from "fs";
import path from "path";
import generateTeacherId from "../../../utils/generateId/generateTeacherId";
import { UserRole } from "@prisma/client";



const createTeacherIntoDb = async (
  branchAdminId: string,
  payload: Partial<Teacher>
): Promise<{ status: true; message: string }> => {
  try {
    const { teacherName, email, password, phoneNumber, branchName, subject, assignClass, address, subscriptionId } = payload;

    if (!teacherName || !email || !password) {
      throw new Error("teacherName, email, and password are required");
    }

    const isExistTeacher = await prisma.teacher.findUnique({
      where: { email },
      select: { id: true },
    });
    if (isExistTeacher) {
      throw new ApiError(httpStatus.FOUND, "Teacher with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(
          payload.password as string,
          Number(config.bcrypt_salt_rounds)
        );

        console.log("Hashed password:", hashedPassword); // Debugging log

    const teacher = await prisma.teacher.create({
      data: {
        teacherName,
        email,
        password: hashedPassword,
        branchAdminId,
        role : UserRole.TEACHER,
        teacherId: await generateTeacherId(UserRole.TEACHER),
        phoneNumber: phoneNumber ?? "",
        branchName: branchName ?? "",
        subject: subject ?? [],
        assignClass: assignClass ?? [],
        address: address ?? "",
        subscriptionId: subscriptionId ?? "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    if (!teacher) {
      throw new Error("Failed to create teacher");
    };



    return {
      status: true,
      message: "Teacher created successfully",
    };
  } catch (error) {
    return catchError(error, "Error creating teacher in database");
  }
};


const findByAllTeachersBranchAdminIntoDb = async (
  branchAdminId: string,
  query: Record<string, unknown>
) => {
  try {
    

    const queryBuilder = new PrismaQueryBuilder(query)
      .search(searchableTeacherFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    const { branchName, subscriptionId } = query;

    const teacherFilter: any = {};

    if (branchName) {
      teacherFilter.branchName = branchName;
    }

    const subscriptionFilter: any = {};

    if (subscriptionId) {
      subscriptionFilter.id = subscriptionId;
    }

    const result = await prisma.teacher.findMany({
      where: {
        branchAdminId, // 🔐 restrict to logged-in admin

        ...queryOptions.where,
        ...teacherFilter,

        ...(Object.keys(subscriptionFilter).length > 0 && {
          subscriptions: {
            is: subscriptionFilter,
          },
        }),
      },

      orderBy: queryOptions.orderBy,
      skip: queryOptions.skip,
      take: queryOptions.take,

      select: {
        id: true,
        teacherName: true,
        email: true,
        teacherId:true, 
        phoneNumber: true,
        branchName: true,
        subject: true,
        assignClass: true,
        address: true,
        photo: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true
      },
    });

    const total = await prisma.teacher.count({
      where: {
        branchAdminId,
        ...queryOptions.where,
        ...teacherFilter,
        ...(Object.keys(subscriptionFilter).length > 0 && {
          subscriptions: {
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
    return catchError(error, "Error finding teachers in database");
  }
};


const findBySingleTeacherIntoDb = async (teacherId: string) => {
  try {
    const teacher = await prisma.teacher.findUnique({   
        where: { id: teacherId },
        select: {   
            id: true,
            teacherName: true,
            email: true,
            phoneNumber: true,
            teacherId:true,
            branchName: true,
            subject: true,
            assignClass: true,
            address: true,
            photo: true,
            isDeleted: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!teacher) {
        throw new ApiError(httpStatus.NOT_FOUND, "Teacher not found");
    }

    return teacher;
  } catch (error) {
    return catchError(error, "Error finding teacher in database");
  } 
};


const updateTeacherIntoDb = async (teacherId: string, payload: Partial<Teacher>) => {
  try {
    const { teacherName, email, phoneNumber, branchName, subject, assignClass, address } = payload;

    const teacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        teacherName,
        email,
        phoneNumber,
        branchName,
        subject,
        assignClass,
        address
      }
    });

   if (!teacher) {
    throw new ApiError(httpStatus.NOT_FOUND, "Failed to update teacher");
   }    
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update teacher");
  }
};


const deleteTeacherFromDb = async (
  teacherId: string
): Promise<{ status: boolean; message: string }> => {
  try {
    // 🔍 Find teacher
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { photo: true },
    });

    if (!teacher) {
      throw new ApiError(httpStatus.NOT_FOUND, "Teacher not found");
    }
    if (teacher.photo) {
      const photoArray = Array.isArray(teacher.photo)
        ? teacher.photo
        : [teacher.photo];

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


    await prisma.teacher.delete({
      where: { id: teacherId },
    });

    return {
      status: true,
      message: "Teacher and associated photo(s) deleted successfully",
    };
  } catch (error) {
    return catchError(error, "Error deleting teacher from database");
  }
};



const findByAllTeachers_Institutional_OwnerIntoDb = async (
  subscriptionId: string,
  query: Record<string, unknown>
) => {
  try {
    const searchableFields = [
      "teacherName",
      "email",
      "phoneNumber",
      "branchName",
    ];

    const queryBuilder = new PrismaQueryBuilder(query)
      .search(searchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    const { branchName, subscriptionId: querySubscriptionId } = query;

    const teacherFilter: Record<string, any> = {};

    if (branchName) {
      teacherFilter.branchName = branchName;
    }

    const subscriptionFilter: Record<string, any> = {};

    if (querySubscriptionId) {
      subscriptionFilter.id = querySubscriptionId;
    }

    const whereCondition = {
      subscriptionId, // 🔐 restrict by institution owner
      isDeleted: false, // ✅ recommended
      ...queryOptions.where,
      ...teacherFilter,

      ...(Object.keys(subscriptionFilter).length > 0 && {
        subscriptions: {
          is: subscriptionFilter,
        },
      }),
    };

    // ✅ Fetch data
    const result = await prisma.teacher.findMany({
      where: whereCondition,
      orderBy: queryOptions.orderBy,
      skip: queryOptions.skip,
      take: queryOptions.take,

      select: {
        id: true,
        teacherName: true,
        email: true,
        phoneNumber: true,
        branchName: true,
        subject: true,
        assignClass: true,
        address: true,
        photo: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
        branchAdmin: {
          select: {
            id: true,
            fullName : true,
    phoneNumber: true,
    emailAddress: true,
    joinDate: true ,
    role : true,
    assignBranch: true

          }
        }
       
      },
    });

    // ✅ Count total
    const total = await prisma.teacher.count({
      where: whereCondition,
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
    return catchError(error, "Error fetching teachers from database");
  }
};

const TeacherService = {
  createTeacherIntoDb,
  findByAllTeachersBranchAdminIntoDb,
  findBySingleTeacherIntoDb ,
  updateTeacherIntoDb,
   deleteTeacherFromDb,
   findByAllTeachers_Institutional_OwnerIntoDb
};

export default TeacherService;