

import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { CreateStudentDto, TSubmitAssignment } from "./Students.interface";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import PrismaQueryBuilder from '../../builder/PrismaQueryBuilder';
import { searchableFields } from './Students.constant';
import fs from "fs";
import path from "path";
import generateStudentId from '../../../utils/generateId/generateStudentId';
import { Prisma, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import config from "../../../config";
import { getCache, setCache } from "../../../config/redis";


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

       
    
        const hashedPassword = await bcrypt.hash(
          payload.password,
          Number(config.bcrypt_salt_rounds)
        );
        payload.password = hashedPassword;
    

    // ✅ remove unsafe override possibility
    const { branchAdminId: _ignored, ...safePayload } = payload as CreateStudentDto;

   const result= await prisma.student.create({
      data: {
        branchAdminId,
        role: UserRole.STUDENT,
        studentId: await generateStudentId(UserRole.STUDENT),
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
          studentId:true , 
          branchName: true,
          className: true,
          guardianName: true,
          guardianPhone: true,
          photo: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,

          // ✅ FIXED subscription select
          // subscriptions: {
          //   select: {
          //     id: true,
          //     price: true,
          //     subscriptiondetails: {
          //       select: {
          //         id: true,
          //         subscriptionType: true,
          //         schoolName: true,
          //         city: true,
          //         state: true,
          //         country: true,
          //       },
          //     },
          //   },
          // },
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

const findMyAllClassListIntoDb = async (
  userId: string,
  query: Record<string, any>
) => {
  try {


    const page = Number(query.page) || 1;

    const limit = Number(query.limit) || 10;

    const skip = (page - 1) * limit;



    const sortBy = query.sortBy || "createdAt";

    const sortOrder: Prisma.SortOrder =
      query.sortOrder === "asc" ? "asc" : "desc";


    const searchTerm = query.searchTerm;

    const classLevel = query.classLevel;

    const day = query.day;

    const assignableSubject = query.assignableSubject;

    const teacherId = query.teacherId;

    const isOnline =
      query.isOnline !== undefined
        ? query.isOnline === "true"
        : undefined;

    
    const cacheKey = `student-class-list:${userId}:${JSON.stringify(
      query
    )}`;


    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return cachedData;
    }


    const searchCondition: Prisma.ClassDistributionWhereInput =
      searchTerm
        ? {
            OR: [
              {
                roomNumber: {
                  contains: searchTerm,
                  mode: Prisma.QueryMode.insensitive,
                },
              },

              {
                classLevel: {
                  contains: searchTerm,
                  mode: Prisma.QueryMode.insensitive,
                },
              },

              {
                assignableSubject: {
                  contains: searchTerm,
                  mode: Prisma.QueryMode.insensitive,
                },
              },

              {
                day: {
                  contains: searchTerm,
                  mode: Prisma.QueryMode.insensitive,
                },
              },

              // ✅ Teacher Name Search
              {
                teacher: {
                  is: {
                    teacherName: {
                      contains: searchTerm,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                },
              },

              // ✅ Teacher ID Search
              {
                teacher: {
                  is: {
                    teacherId: {
                      contains: searchTerm,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                },
              },
            ],
          }
        : {};



    const classFilter: Prisma.ClassDistributionWhereInput = {};

  
    if (classLevel) {
      classFilter.classLevel = classLevel;
    }

  
    if (day) {
      classFilter.day = day;
    }

    
    if (assignableSubject) {
      classFilter.assignableSubject = assignableSubject;
    }

  
    if (typeof isOnline === "boolean") {
      classFilter.isOnline = isOnline;
    }


    if (teacherId) {
      classFilter.teacher = {
        is: {
          teacherId,
        },
      };
    }



    const classDistributionWhereCondition: Prisma.ClassDistributionWhereInput =
      {
        ...classFilter,

        ...searchCondition,

        students: {
          some: {
            id: userId,
            
          },
        },
      };


    const [studentData, total] = await Promise.all([
      prisma.student.findFirst({
        where: {
          id: userId,

          isVerified: true,

          status: UserStatus.ACTIVE,
        },

        select: {
          id: true,
          branchName:true,
          classDistributions: {
            where: classDistributionWhereCondition,

            orderBy: {
              [sortBy]: sortOrder,
            },

            skip,

            take: limit,

            select: {
              id: true,

              roomNumber: true,

              classLevel: true,

              assignableSubject: true,

              day: true,

              time: true,

              isOnline: true,

             

              teacher: {
                select: {
                  id: true,

                  teacherName: true,

                  teacherId: true,

                  email: true,

                  photo: true,
                },
              },
            },
          },
        },
      }),

      prisma.classDistribution.count({
        where: classDistributionWhereCondition,
      }),
    ]);

 

    const responseData = {
      meta: {
        page,

        limit,

        total,

        totalPage: Math.ceil(total / limit),
      },

      data: studentData,
    };



    await setCache(cacheKey, responseData, 60 * 5);

  
    return responseData;
  } catch (error) {
    return catchError(error, "Error fetching class list from database");
  }
};

const findMyClassAssignmentIntoDb = async (
  userId: string,
  query: Record<string, any>
) => {
  try {
   
    const cacheKey = `class-assignment:${userId}:${JSON.stringify(query)}`;

    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return cachedData;
    }

 

    const queryBuilder = new PrismaQueryBuilder(query)
      .search(["assignmentTitle"])
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    const isVerified = query.isVerified;
    const status = query.status;
    const assignmentType = query.assignmentType;
    const classDistributionId = query.classDistributionId;

    const whereCondition: any = {
      id: userId,

      ...(isVerified !== undefined && {
        isVerified: isVerified === "true",
      }),

      ...(status && { status }),

      ...(queryOptions.where || {}),

      ...(classDistributionId && {
        classDistributions: {
          some: {
            id: classDistributionId,
          },
        },
      }),
    };

   

    const [result, total] = await Promise.all([
      prisma.student.findMany({
        where: whereCondition,
        orderBy: queryOptions.orderBy,
        skip: queryOptions.skip,
        take: queryOptions.take,

        select: {
          id: true,
          

          classDistributions: {
            select: {
              id: true,

              teacher: {
                select: {
                  teacherName: true,
                  email: true,
                  phoneNumber: true,
                  teacherId: true,
                },
              },

              classAssignments: {
                where: {
                  ...(assignmentType && {
                    assignmentType,
                  }),
                },

                select: {
                  id: true,
                  assignmentTitle: true,
                  assignmentType: true,
                  assessmentAvailable: true,
                  attachmentFiles: true,
                  assignmentDueDate: true,
                  createdAt: true,
                  classDistributions:{
                    select:{
                      classLevel:true ,
                      assignableSubject:true,
                      
                    }
                  }
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

    const responseData = {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      data: result,
    };

    

    await setCache(cacheKey, responseData, 60 * 5);

    return responseData;
  } catch (error) {
    return catchError(error, "Error fetching class assignments");
  }
};


const submitAssignmentIntoDb = async (
  studentId: string,
  payload: TSubmitAssignment
) => {
  try {
  
    const isExistAssignment =
      await prisma.classAssignment.findUnique({
        where: {
          id: payload.classAssignmentId,
        },
        select: {
          id: true,
          assessmentAvailable: true,
        },
      });

      
    if (!isExistAssignment) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "This assignment does not exist"
      );
    }

  
    if (isExistAssignment.assessmentAvailable) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Submission deadline finished"
      );
    }

   
    const alreadyUploaded =
      await prisma.submitAssignment.findFirst({
        where: {
          studentId,
          classAssignmentId: payload.classAssignmentId,
        },
        select:{
          id:true
        }
      });

    if (alreadyUploaded) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "You already uploaded this assignment"
      );
    }

    
    if (
      !payload.uploadFiles ||
      !Array.isArray(payload.uploadFiles) ||
      payload.uploadFiles.length < 1
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "At least one file is required"
      );
    }

    
    const result = await prisma.submitAssignment.create({
      data: {
        studentId,
        classAssignmentId: payload.classAssignmentId,

        uploadFiles: {
          create: payload.uploadFiles.map((file) => ({
            fileUrl: file.fileUrl,
          })),
        },
      },

      include: {
        uploadFiles: true,
      },
    });

    return result && {
      status: true,
      message: "Assignment submitted successfully"

    };
  } catch (error) {
    catchError(error);
  }
};



const StudentsService = {
  createStudentIntoDb,
  findByAllStudentsIntoDb,
  findByAllStudents_Institutional_OwnerIntoDb,
  deleteStudentFromDb,
  updateStudentIntoDb,
  findMyAllClassListIntoDb,
  findMyClassAssignmentIntoDb,
  submitAssignmentIntoDb
};
export default StudentsService;