

import { AttendanceStatus, Prisma, UserStatus } from "@prisma/client";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";
import { getCache, setCache } from "../../../config/redis";

const findMyChildrenAllResultIntoDb = async (
  parentId: string,
  query: Record<string, unknown>
) => {
  try {
   
    const cacheKey = `children-results:${parentId}:${JSON.stringify(query)}`;

    // 1️⃣ CHECK CACHE FIRST
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return {
        success: true,
        message: "Fetched from cache",
        meta: cachedData.meta,
        data: cachedData.data,
      };
    }
    const queryBuilder = new PrismaQueryBuilder(query)
      .search(["name", "studentId"])
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    const whereClause = (queryOptions.where ?? {}) as Prisma.StudentWhereInput;

    const classLevel = query?.classLevel as string | undefined;
    const teacherId = query?.teacherId as string | undefined;

    const examGradeFilter: Prisma.ExamGradesWhereInput = teacherId
      ? { teacherId }
      : {};

    const studentWhere: Prisma.StudentWhereInput = {
      ...whereClause,
    };

    if (classLevel) {
      studentWhere.examGrades = {
        some: {
          examAnnouncement: {
            classDistribution: {
              classLevel,
            },
          },
        },
      };
    }
    const [result, total] = await Promise.all([
      prisma.staff.findMany({
        where: {
          id: parentId,
          isVerified: true,
          status: UserStatus.ACTIVE,
        },
        select: {
          students: {
            where: studentWhere,
            select: {
              id: true,
              studentId: true,
              name: true,
              createdAt: true,
              updatedAt: true,

              examGrades: {
                where: examGradeFilter,
                select: {
                  id: true,
                  totalMarks: true,
                  marks: true,
                  instructions: true,
                  createdAt: true,
                  updatedAt: true,

                  teachers: {
                    select: {
                      teacherName: true,
                      teacherId: true,
                    },
                  },

                  examAnnouncement: {
                    select: {
                      examDate: true,
                      tipTapEditor: true,
                      classDistribution: {
                        select: {
                          classLevel: true,
                          assignableSubject: true
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),

      prisma.student.count({
        where: studentWhere,
      }),
    ]);

    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;

    const response = {
      success: true,
      message: "Successfully fetched children exam results",
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      data: result,
    };

    // 4️⃣ SAVE TO CACHE
    await setCache(cacheKey, response, 3600); 
    return response;
  } catch (error) {
    return catchError(error);
  }
};

const findBySpecificStudentAttendanceReportParentIntoDb = async (
  parentId: string,
  subscriptionId: string,
  query: Record<string, unknown>
) => {
  try {
    const cacheKey = `attendance-report:${parentId}:${subscriptionId}:${JSON.stringify(query)}`;

    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = query.search as string | undefined;
    const teacherName = query.teacherName as string | undefined;
    const teacherId = query.teacherId as string | undefined;
    const date = query.date as string | undefined;

    const where: Prisma.AttendanceSheetWhereInput = {
      subscriptionId,
      students: {
        staffs: {
          id: parentId,
        },
      },
      ...(date && {
        AttendanceDate: {
          gte: new Date(date),
          lte: new Date(date),
        },
      }),
      ...(teacherId || teacherName
        ? {
            teachers: {
              ...(teacherId && { teacherId }),
              ...(teacherName && {
                teacherName: {
                  contains: teacherName,
                  mode: "insensitive",
                },
              }),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.attendanceSheet.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          AttendanceDate: "desc",
        },
        select: {
          AttendanceDate: true,
          attendanceStatus: true,
          

          teachers: {
            select: {
              teacherName: true,
              teacherId: true,
              photo: true,
            },
          },

          students: {
            select: {
              name: true,
              studentId: true,
            },
          },
        },
      }),

      prisma.attendanceSheet.count({ where }),
    ]);

    const response = {
      success: true,
      message: "Successfully fetched attendance report",
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      data,
    };

    await setCache(cacheKey, response, 3600);

    return response;
  } catch (error) {
    throw catchError(error);
  }
};

const avgAttendanceCalculationIntoDb = async (
  parentId: string,
  subscriptionId: string,
  query: Record<string, unknown>
) => {
  try {
    const year = String(query.year);

    const cacheKey = `attendance:avg:${parentId}:${subscriptionId}:${year}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      return {
        success: true,
        fromCache: true,
        ...cached,
      };
    }

    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    const whereCondition = {
      subscriptionId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      students: {
        staffs: {
          id: parentId,
        },
      },
    };

    const presentCount = await prisma.attendanceSheet.count({
      where: {
        ...whereCondition,
        attendanceStatus: AttendanceStatus.PRESENT,
      },
    });

    const absentCount = await prisma.attendanceSheet.count({
      where: {
        ...whereCondition,
        attendanceStatus: AttendanceStatus.ABSENT,
      },
    });

    const total = presentCount + absentCount;

    const presentAvg = total ? (presentCount / total) * 100 : 0;
    const absentAvg = total ? (absentCount / total) * 100 : 0;

    const result = {
      presentCount,
      absentCount,
      presentAvg,
      absentAvg,
      total,
    };

    
    await setCache(cacheKey, result, 60 * 60 * 6); 

    return {
      success: true,
      fromCache: false,
      ...result,
    };
  } catch (error) {
    throw catchError(error);
  }
};


const ParentServices = {
  findMyChildrenAllResultIntoDb,
  findBySpecificStudentAttendanceReportParentIntoDb,
  avgAttendanceCalculationIntoDb
};

export default ParentServices;