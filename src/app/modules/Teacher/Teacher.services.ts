import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { ClassRecordedOfTeachers, RecordAttendancePayload, Teacher } from "./Teacher.interface";
import bcrypt from "bcrypt";
import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";
import { searchableTeacherFields, teacherFilterableFields, teacherSearchableFields } from "./Teacher.constant";
import fs from "fs";
import path from "path";
import generateTeacherId from "../../../utils/generateId/generateTeacherId";
import { AttendanceStatus, UserRole } from "@prisma/client";

import { getCache,  setCache } from "../../../config/redis";
import { getSocketIO } from "../../../socket/connectSocket";



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
      subscriptionId, 
      isDeleted: false,
      ...queryOptions.where,
      ...teacherFilter,

      ...(Object.keys(subscriptionFilter).length > 0 && {
        subscriptions: {
          is: subscriptionFilter,
        },
      }),
    };


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

const findBySpecificClassListOfTeachersIntoDb = async (
  teacherId: string,
  query: Record<string, unknown>
) => {
  try {
   

    const queryBuilder = new PrismaQueryBuilder(query)
      .search(teacherSearchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    // Optional extra filters
    const { classLevel, day } = query;

    const extraFilter: Record<string, any> = {};

    if (classLevel) {
      extraFilter.classLevel = classLevel;
    }

    if (day) {
      extraFilter.day = day;
    }

    // Final where condition
    const whereCondition = {
      teacherId,
      ...queryOptions.where,
      ...extraFilter,
    };

    const result = await prisma.classDistribution.findMany({
      where: whereCondition,
      orderBy: queryOptions.orderBy,
      skip: queryOptions.skip,
      take: queryOptions.take,
      select: {
        id: true,
        classLevel: true,
        capacity: true,
        roomNumber: true,
        assignableSubject: true,
        day: true,
        time: true,
        isOnline: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // ✅ Total count
    const total = await prisma.classDistribution.count({
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
    return catchError(
      error,
      "Error fetching class list for specific teacher"
    );
  }
};
const findBySpecificStudentListOfTeachersIntoDb = async (
  teacherId: string,
  subscriptionId: string,
  query: Record<string, unknown>
) => {
  try {
    const queryBuilder = new PrismaQueryBuilder(query)
      .search(teacherFilterableFields)
      .filter()
      .sort()
      .paginate();

    const queryOptions = queryBuilder.build();

    const { classLevel, day } = query;
    const extraFilter: Record<string, any> = {};

    if (classLevel) extraFilter.classLevel = classLevel;
    if (day) extraFilter.day = day;

    // ✅ SINGLE QUERY (no ids.map)
    const result = await prisma.student.findMany({
      where: {
        subscriptions: {
          is: { id: subscriptionId },
        },
        classDistributions: {
          some: {
            teacherId,
            ...extraFilter,
          },
        },
        ...queryOptions.where,
      },
      orderBy: queryOptions.orderBy,
      skip: queryOptions.skip,
      take: queryOptions.take,
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        className: true,
        photo: true,
        classDistributions: {
          where: {
            teacherId,
            ...extraFilter,
          },
          select: {
            id: true,
            classLevel: true,
            day: true,
            time: true,
          },
        },
      },
    });


    const total = await prisma.student.count({
      where: {
        subscriptions: {
          is: { id: subscriptionId },
        },
        classDistributions: {
          some: {
            teacherId,
            ...extraFilter,
          },
        },
        ...queryOptions.where,
      },
    });

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
    return catchError(
      error,
      "Error fetching student list for specific teacher"
    );
  }
};

const findBySpecificStudentAttendanceOfTeachersIntoDb = async (
  teacherId: string,
  subscriptionId: string,
  query: Record<string, unknown>
) => {
  try {
    const queryBuilder = new PrismaQueryBuilder(query)
      .search(teacherFilterableFields)
      .filter()
      .sort()
      .paginate();

    const queryOptions = queryBuilder.build();

    const { classLevel, day } = query;
    const extraFilter: Record<string, any> = {};

    if (classLevel) extraFilter.classLevel = classLevel;
    if (day) extraFilter.day = day;

    // ✅ SINGLE QUERY (no ids.map)
    const result = await prisma.student.findMany({
      where: {
        subscriptions: {
          is: { id: subscriptionId },
        },
        classDistributions: {
          some: {
            teacherId,
            ...extraFilter,
          },
        },
        ...queryOptions.where,
      },
      orderBy: queryOptions.orderBy,
      skip: queryOptions.skip,
      take: queryOptions.take,
      select: {
        id: true,
        name: true,
        studentId: true,
        className: true,
        photo: true,
        staffs:{
          select:{
            name: true,
            role: true,
            generateId: true,
            phoneNumber: true,
            
          }
        },
        
      },
    });


    const total = await prisma.student.count({
      where: {
        subscriptions: {
          is: { id: subscriptionId },
        },
        classDistributions: {
          some: {
            teacherId,
            ...extraFilter,
          },
        },
        ...queryOptions.where,
      },
    });

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
    return catchError(
      error,
      "Error fetching student list for specific teacher"
    );
  }
};


const recordedStudentAttendanceOfTeachersIntoDb = async (
  teacherId: string,
  payload: RecordAttendancePayload
) => {
  try {
    const { attendanceDate, subscriptionId, students } = payload;

    const date = new Date(attendanceDate);
    date.setHours(0, 0, 0, 0);
    const existingStudents = await prisma.student.findMany({
      where: {
        studentId: { in: students.map((s) => s.studentId) },
        subscriptionId: subscriptionId, // 🔥 simplify
      },
      select: {
        id: true,
        studentId: true,
      },
    });

    const studentMap = new Map(
      existingStudents.map((s) => [s.studentId, s.id])
    );

    
    const existingAttendance = await prisma.attendanceSheet.findMany({
      where: {
        teacherId,
        AttendanceDate: date,
        studentId: {
          in: Array.from(studentMap.values()),
        },
      },
      select: {
        studentId: true,
      },
    });

    const existingStudentIds = new Set(
      existingAttendance.map((a) => a.studentId)
    );

  
    const newStudents = students.filter((s) => {
      const dbId = studentMap.get(s.studentId);
      return dbId && !existingStudentIds.has(dbId);
    });

    if (newStudents.length === 0) {
      return {
        success: false,
        message: "Attendance already recorded for all students today",
      };
    }

    const data = newStudents.map((s) => ({
      studentId: studentMap.get(s.studentId)!, 
      teacherId,
      subscriptionId,
      AttendanceDate: date,
      attendanceStatus: s.attendanceStatus,
    }));

    const result = await prisma.attendanceSheet.createMany({
      data,
      skipDuplicates: true,
    });

    return {
      success: true,
      message: "Attendance recorded successfully",
       insertedCount: result.count,
      skipped: existingStudentIds.size,
    };
  } catch (error) {
    return catchError(
      error,
      "Error recording student attendance for specific teacher"
    );
  }
};



const updateStudentAttendanceOfTeachersIntoDb = async (
  teacherId: string,
  payload: RecordAttendancePayload
) => {
  try {
    const { attendanceDate, subscriptionId, students } = payload;

   
    const date = new Date(attendanceDate);
    date.setHours(0, 0, 0, 0);

    const existingStudents = await prisma.student.findMany({
      where: {
        studentId: { in: students.map((s) => s.studentId) },
        subscriptionId,
      },
      select: {
        id: true,        
        studentId: true, 
      },
    });

    const studentMap = new Map(
      existingStudents.map((s) => [s.studentId, s.id])
    );
    const invalidStudents = students.filter(
      (s) => !studentMap.has(s.studentId)
    );

    if (invalidStudents.length > 0) {
      return {
        success: false,
        message: "Invalid studentIds found",
        invalidStudents,
      };
    }
    const operations = students.map((s) => {
      const dbId = studentMap.get(s.studentId)!;

      return prisma.attendanceSheet.upsert({
        where: {
          studentId_AttendanceDate_teacherId: {
            studentId: dbId,
            AttendanceDate: date,
            teacherId,
          },
        },
        update: {
          attendanceStatus: s.attendanceStatus,
        },
        create: {
          teacherId,
          studentId: dbId,
          subscriptionId,
          AttendanceDate: date,
          attendanceStatus: s.attendanceStatus,
        },
      });
    });
    const result = await prisma.$transaction(operations);

    return {
      success: true,
      message: "Attendance updated successfully",
      totalProcessed: result.length,
    };
  } catch (error) {
    return catchError(
      error,
      "Error updating student attendance for specific teacher"
    );
  }
};

const teacherAttendanceDataIntoDb = async (
  teacherId: string,
  subscriptionId: string,
  query: Record<string, unknown>
) => {
  try {
    const { classLevel, day } = query;


    const cacheKey = `attendance:${teacherId}:${subscriptionId}:${classLevel || "all"}:${day || "all"}`;


    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return {
        success: true,
        data: cachedData,
        source: "cache", 
      };
    }

    const extraFilter: Record<string, any> = {};
    if (classLevel) extraFilter.classLevel = classLevel;
    if (day) extraFilter.day = day;

    const totalPresent = await prisma.attendanceSheet.count({
      where: {
        teacherId,
        subscriptionId,
        attendanceStatus: AttendanceStatus.PRESENT,
        ...extraFilter,
      },
    });

    const totalAbsent = await prisma.attendanceSheet.count({
      where: {
        teacherId,
        subscriptionId,
        attendanceStatus: AttendanceStatus.ABSENT,
        ...extraFilter,
      },
    });

    const resultData = {
      totalPresent,
      totalAbsent,
    };

    // ✅ Save to Redis (TTL 10 min)
    await setCache(cacheKey, resultData, 600);

    return {
      success: true,
      data: resultData,
      source: "db", 
    };
  } catch (error) {
    return catchError(
      error,
      "Error fetching attendance summary"
    );
  }
};

const onlineClassRecordedOfTeachersIntoDb = async (
  payload: Partial<ClassRecordedOfTeachers>
): Promise<{ success: boolean; message: string }> => {
  try {
    const { subscriptionId, classDistributionId, link } = payload;

    if (!subscriptionId || !classDistributionId || !link) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "subscriptionId, classDistributionId and link are required"
      );
    }

    const isExistSubscription = await prisma.subscriptions.findUnique({
      where: { id: subscriptionId },
      select: { id: true },
    });

    if (!isExistSubscription) {
      throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
    }

    const classData = await prisma.classDistribution.findUnique({
      where: { id: classDistributionId },
      include: {
        students: {
          select: { id: true },
        },
      },
    });

    if (!classData) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Class distribution not found"
      );
    }

    // ✅ TRANSACTION START
    await prisma.$transaction(async (tx) => {
      // 1️⃣ Create online class
      const onlineClassRecord = await tx.onlineClass.create({
        data: {
          subscriptionId,
          classDistributionId,
          link,
        },
      });

      if (!onlineClassRecord) {
        throw new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Failed to record online class"
        );
      }

  
      await tx.classDistribution.update({
        where: { id: classDistributionId },
        data: { isOnline: true },
      });

      // 3️⃣ Create notifications in bulk (BEST PRACTICE)
      if (classData.students?.length) {
        await tx.notification.createMany({
          data: classData.students.map((student) => ({
            title: "📢 Live Class Started",
            message: `Join your class now: ${link}`,
            studentId : student.id,
            subscriptionId,
          })),
        });
      }
    });
    
    const io = getSocketIO() as any;

    const notificationPayload = {
      id: Date.now(),
      title: "📢 Live Class Started",
      message: `Join your class now: ${link}`,
      createdBy: UserRole.TEACHER,
      timestamp: new Date().toISOString(),
      classDistributionId,
    };


    io.to(`class::${classDistributionId}`).emit(
      "notification",
      notificationPayload
    );

    if (classData.students?.length) {
      classData.students.forEach((student) => {
        io.to(`user::${student.id}`).emit(
          "notification",
          notificationPayload
        );
      });
    }

    return {
      success: true,
      message: "Online class created & notification sent",
    };
  } catch (error) {
    return catchError(error, "Error recording online class");
  }
};





const TeacherService = {
  createTeacherIntoDb,
  findByAllTeachersBranchAdminIntoDb,
  findBySingleTeacherIntoDb ,
  updateTeacherIntoDb,
   deleteTeacherFromDb,
   findByAllTeachers_Institutional_OwnerIntoDb,
   findBySpecificClassListOfTeachersIntoDb,
  findBySpecificStudentListOfTeachersIntoDb,
  findBySpecificStudentAttendanceOfTeachersIntoDb,
  recordedStudentAttendanceOfTeachersIntoDb,
  updateStudentAttendanceOfTeachersIntoDb,
   teacherAttendanceDataIntoDb ,
   onlineClassRecordedOfTeachersIntoDb


};

export default TeacherService;