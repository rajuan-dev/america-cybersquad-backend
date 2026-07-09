import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { TExamAnnouncement, TExamGrades } from "./examAnnouncement.interface";
import { getSocketIO } from "../../../socket/connectSocket";
import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";
import { deleteByPattern, getCache, setCache } from "../../../config/redis";
import {
  searchableAttendedStudent,
  searchableStudentField,
  searchableTeacherField,
} from "./examAnnouncement.constant";

const examAnnouncementServiceIntoDb = async (
  payload: TExamAnnouncement,
  subscriptionId: string
): Promise<{ success: boolean; message: string }> => {
  try {
   
    const { 
      examDate, 
      classDistributionId,
      examName,      
      topic,           
      totalMarks,      
      duration,        
      instruction     
    } = payload;

    const { students } = await prisma.$transaction(async (tx) => {
      const classDistribution = await tx.classDistribution.findUnique({
        where: { id: classDistributionId },
        select: {
          id: true,
          assignableSubject: true,
          students: { select: { id: true } },
        },
      });

      if (!classDistribution) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "Class distribution does not exist",
        );
      }

      // ২. ডাটাবেজে ক্রিয়েট করার সময় নতুন ফিল্ডগুলো পাস করা হলো
      const announcement = await tx.examAnnouncement.create({
        data: {
          examDate,
          classDistributionId,
          subscriptionId,
          examName,        // <-- ডাটাবেজে সেভ হবে
          topic,           // <-- ডাটাবেজে সেভ হবে
          totalMarks,      // <-- ডাটাবেজে সেভ হবে
          duration,        // <-- ডাটাবেজে সেভ হবে
          instruction,     // <-- ডাটাবেজে সেভ হবে
        },
      });

      if (classDistribution.students.length) {
        await tx.notification.createMany({
          data: classDistribution.students.map((student) => ({
            title: `📚 Exam: ${classDistribution.assignableSubject}`,
            message: "New exam announcement published",
            studentId: student.id,
            subscriptionId,
          })),
        });
      }

      return {
        announcement,
        students: classDistribution.students,
      };
    });

    const io = getSocketIO();

    students.forEach((student) => {
      io.to(`user::${student.id}`).emit("notification", {
        title: "📚 Exam Announcement",
        message: "New exam has been published",
        timestamp: new Date().toISOString(),
      });
    });

    return {
      success: true,
      message: "Successfully sent this announcement",
    };
  } catch (error) {
    return catchError(error);
  }
};

const findMyAnnouncementExamListIntoDb = async (
  subscriptionId: string,
  teacherId: string,
  query: Record<string, unknown>,
) => {
  try {
    // const cacheKey = `exam-announcement:${subscriptionId}:${teacherId}:${JSON.stringify(
    //   query,
    // )}`;

    // const cachedData = await getCache(cacheKey);
    // if (cachedData) {
    //   return cachedData;
    // }

    const {
      classLevel,
      assignableSubject,
      page,
      limit,
      ...restQuery
    } = query;

    const queryBuilder = new PrismaQueryBuilder(restQuery)
      .search(searchableTeacherField)
      .filter()
      .sort()
      .paginate()
      .fields();

    const { where, orderBy, skip, take, select } = queryBuilder.build();

    const classDistributionWhere: any = {
      teacherId,
    };

    if (typeof classLevel === "string" && classLevel.trim()) {
      classDistributionWhere.classLevel = classLevel;
    }

    if (
      typeof assignableSubject === "string" &&
      assignableSubject.trim()
    ) {
      classDistributionWhere.assignableSubject = {
        contains: assignableSubject,
        mode: "insensitive" as const,
      };
    }

    const baseWhere = {
      subscriptionId,
      ...where,
      classDistribution: classDistributionWhere,
    };

    const currentDate = new Date();

  
    const [data, total, completedCount, upcomingCount, pendingCount] = await prisma.$transaction([
     
      prisma.examAnnouncement.findMany({
        where: baseWhere,
        orderBy,
        skip,
        take,
        select: select ?? {
          id: true,
          examName: true,
          topic: true,
          totalMarks: true,
          duration: true,
          instruction: true,
          examDate: true,
          createdAt: true,
          isCompleted: true,
          classDistribution: {
            select: {
              id: true,
              classLevel: true,
              assignableSubject: true,
              teacherId: true,
            },
          },
        },
      }),

     
      prisma.examAnnouncement.count({
        where: baseWhere,
      }),

      
      prisma.examAnnouncement.count({
        where: {
          ...baseWhere,
          isCompleted: true,
        },
      }),

     
      prisma.examAnnouncement.count({
        where: {
          ...baseWhere,
          isCompleted: false,
          examDate: { gt: currentDate },
        },
      }),

      
      prisma.examAnnouncement.count({
        where: {
          ...baseWhere,
          isCompleted: false,
          examDate: { lte: currentDate },
        },
      }),
    ]);

    const result = {
      success: true,
      meta: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        totalPages: Math.ceil(total / (Number(limit) || 10)),
      },
      statusCount: {
        completed: completedCount,
        upcoming: upcomingCount,
        pending: pendingCount,
      },
      data: data, 
    };

    // await setCache(cacheKey, result, 300);

    return result;
  } catch (error) {
    return catchError(error);
  }
};

const findBySpecificAnnouncementExamIntoDb = async (id: string) => {
  try {
    return await prisma.examAnnouncement.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        examName: true, 
        duration: true , 
        instruction: true ,
        topic: true ,

        examDate: true,
        createdAt: true,
      },
    });
  } catch (error) {
    return catchError(error);
  }
};

const updateAnnouncementExamIntoDb = async (
  id: string,
  payload: Partial<TExamAnnouncement>,
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
  
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value !== undefined),
    );

    const result = await prisma.examAnnouncement.update({
      where: { id },
      data: cleanPayload,
    });


    return {
      success: true,
      message: "Successfully updated announcement exam",
    };
  } catch (error) {
    return catchError(error);
  }
};
const deleteAnnouncementExamIntoDb = async (id: string) => {
  try {
    const announcement = await prisma.examAnnouncement.findUnique({
      where: { id },
      select: {
        id: true,
        subscriptionId: true,
        classDistributionId: true,
      },
    });

    if (!announcement) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Exam announcement not found",
      );
    }

    await prisma.$transaction(async (tx) => {
      // Delete child records first
      await tx.examGrades.deleteMany({
        where: {
          examAnnouncementId: id,
        },
      });

      // Then delete parent
      await tx.examAnnouncement.delete({
        where: {
          id,
        },
      });
    });

    await Promise.all([
      deleteByPattern(`exam-announcement:${announcement.subscriptionId}:*`),
      deleteByPattern(
        `exam-announcement:*:${announcement.classDistributionId}:*`,
      ),
    ]);

    return {
      success: true,
      message: "Successfully deleted exam announcement",
    };
  } catch (error) {
    return catchError(error);
  }
};

const findBySpecificStudentAnnouncementExamListIntoDb = async (
  subscriptionId: string,
  studentId: string,
  query: Record<string, unknown>,
) => {
  try {
    const cacheKey = `student-exam-announcement:${subscriptionId}:${studentId}:${JSON.stringify(
      query,
    )}`;

    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return cachedData;
    }
    const queryBuilder = new PrismaQueryBuilder(query)
      .search(searchableStudentField)
      .filter()
      .sort()
      .paginate()
      .fields();

    const { where, orderBy, skip, take, select } = queryBuilder.build();

    const baseWhere = {
      subscriptionId,
      classDistribution: {
        students: {
          some: {
            id: studentId,
          },
        },
      },
      ...where,
    };

    const [data, total] = await prisma.$transaction([
      prisma.examAnnouncement.findMany({
        where: baseWhere,
        orderBy,
        skip,
        take,
        select: select ?? {
          id: true,
          tipTapEditor: true,
          examDate: true,
          createdAt: true,
          classDistribution: {
            select: {
              classLevel: true,
              assignableSubject: true,
              teacher: {
                select: {
                  teacherName: true,
                  teacherId: true,
                },
              },
            },
          },
        },
      }),

      prisma.examAnnouncement.count({
        where: baseWhere,
      }),
    ]);

    const result = {
      meta: {
        total,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        totalPages: Math.ceil(total / (Number(query.limit) || 10)),
      },
      data,
    };

    await setCache(cacheKey, result, 300);

    return result;
  } catch (error) {
    return catchError(error);
  }
};

//participants user list
const findByParticipantStudentListIntoDb = async (
  examAnnouncementId: string,
  query: Record<string, unknown>,
) => {
  try {
    const cacheKey = `participant-students:${examAnnouncementId}:${JSON.stringify(
      query,
    )}`;

    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const queryBuilder = new PrismaQueryBuilder(query)
      .search(searchableAttendedStudent)
      .filter()
      .sort()
      .paginate()
      .fields();

    const { where, orderBy, skip, take, select } = queryBuilder.build();

    const examAnnouncement = await prisma.examAnnouncement.findUnique({
      where: {
        id: examAnnouncementId,
      },
      select: {
        id: true,
        classDistributionId: true,
      },
    });

    if (!examAnnouncement) {
      return {
        success: false,
        message: "Exam announcement not found",
      };
    }

    const baseWhere = {
      classDistributions: {
        some: {
          id: examAnnouncement.classDistributionId,
        },
      },

      ...where,
    };

    const [data, total] = await prisma.$transaction([
      prisma.student.findMany({
        where: baseWhere,

        orderBy,

        skip,

        take,

        select: select ?? {
          id: true,
          name: true,
          studentId: true,
          createdAt: true,
        },
      }),

      prisma.student.count({
        where: baseWhere,
      }),
    ]);

    const result = {
      success: true,

      meta: {
        total,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        totalPages: Math.ceil(total / (Number(query.limit) || 10)),
      },

      data,
    };

    await setCache(cacheKey, result, 300);

    return result;
  } catch (error) {
    return catchError(error);
  }
};
const recordedExamGradesIntoDb = async (
  teacherId: string,
  payload: TExamGrades,
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const examAnnouncement = await tx.examAnnouncement.findFirst({
        where: {
          id: payload.examAnnouncementId,

          classDistribution: {
            teacherId,

            students: {
              some: {
                id: payload.studentId,
              },
            },
          },
        },

        select: {
          id: true,
          subscriptionId: true,
        },
      });

      if (!examAnnouncement) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "Exam announcement not found or access denied",
        );
      }

      const isAlreadyExist = await tx.examGrades.findFirst({
        where: {
          examAnnouncementId: payload.examAnnouncementId,

          studentId: payload.studentId,
        },
      });

      if (isAlreadyExist) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Exam grade already recorded",
        );
      }
      const examGrade = await tx.examGrades.create({
        data: {
          teacherId,

          studentId: payload.studentId,

          examAnnouncementId: payload.examAnnouncementId,

          totalMarks: payload.totalMarks,

          marks: payload.marks,

          instructions: payload.instructions,
        },
      });

      await tx.notification.create({
        data: {
          title: "📚 Exam Result Published",
          message: "Your exam result has been published",

          studentId: payload.studentId,

          subscriptionId: examAnnouncement.subscriptionId,
        },
      });

      return examGrade;
    });

    const io = getSocketIO();
    io.to(`user::${payload.studentId}`).emit("notification", {
      title: "📚 Exam Result Published",
      message: "Your exam result has been published",

      timestamp: new Date().toISOString(),
    });

    return (
      result && {
        success: true,
        message: "Successfully recorded exam grade",
      }
    );
  } catch (error) {
    return catchError(error);
  }
};

const findByExamGradesSpecificTeacherIntoDb = async (
  subscriptionId: string,
  teacherId: string,
  query: Record<string, unknown>,
) => {
  try {

    const cacheKey = `teacher-exam-grades:${subscriptionId}:${teacherId}:${JSON.stringify(
      query,
    )}`;

    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return cachedData;
    }

   

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = (query.sortBy as string) || "createdAt";
    const sortOrder = (query.sortOrder as string) || "desc";

    const searchTerm = (query.searchTerm as string) || "";

   

    const baseWhere: any = {
      teacherId,

      examAnnouncement: {
        subscriptionId,
      },
    };

   

    if (searchTerm) {
      baseWhere.OR = [
        {
          instructions: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },

        {
          students: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },

        {
          students: {
            email: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },

        {
          students: {
            studentId: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },

        {
          examAnnouncement: {
            tipTapEditor: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },

        {
          examAnnouncement: {
            classDistribution: {
              classLevel: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

   
    const [data, total] = await prisma.$transaction([
      prisma.examGrades.findMany({
        where: baseWhere,

        orderBy: {
          [sortBy]: sortOrder,
        },

        skip,
        take: limit,

        select: {
          id: true,

          studentId: true,

          totalMarks: true,

          marks: true,

          instructions: true,

          createdAt: true,

          examAnnouncement: {
            select: {
              examDate: true,

              classDistribution: {
                select: {
                  classLevel: true,
                  assignableSubject: true,
                },
              },
            },
          },

          students: {
            select: {
              name: true,
              email: true,
              photo: true,
              studentId: true,
            },
          },
        },
      }),

      prisma.examGrades.count({
        where: baseWhere,
      }),
    ]);

    

    const result = {
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },

      data,
    };

    
    await setCache(cacheKey, result, 300);

    return result;
  } catch (error) {
    return catchError(error);
  }
};


const findBySpecificExamGradesIntoDb=async(id: string)=>{

   try{

       return await prisma.examGrades.findUnique({where:{
        id
       },select:{
        id: true ,
        totalMarks: true , 
        marks: true , 
        instructions: true,
        createdAt: true 
       }})

   }
   catch (error) {
    return catchError(error);
  }
};


const updateExamGradesSpecificTeacherIntoDb = async (
  id: string,
  payload: Partial<TExamGrades>,
):Promise<{
  success: boolean,
  message: string
}> => {
  try {
    

    const isExist = await prisma.examGrades.findUnique({
      where: {
        id,
      },
      select:{
        id:true
      }
    });

    if (!isExist) {
      throw new ApiError(httpStatus.NOT_FOUND, "Exam grade not found");
    }

    const updateData = Object.fromEntries(
      Object.entries(payload).filter(
        ([_, value]) => value !== undefined,
      ),
    );
    const result = await prisma.examGrades.update({
      where: {
        id,
      },
      data: updateData,
    });

    return  result && {
      success: true,
      message: "Successfully Updated"
    };
  } catch (error) {
    return catchError(error);
  }
};

const deleteExamGradesSpecificTeacherIntoDb = async (id: string):Promise<{
  success: boolean,
  message: string
}> => {
  try {
  

    const isExist = await prisma.examGrades.findUnique({
      where: {
        id,
      },
      select:{
        id: true
      }
    });

    if (!isExist) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Exam grade not found",
      );
    }

    

    const result = await prisma.examGrades.delete({
      where: {
        id,
      },
    });
    return result && {
      success: true,
      message: "Successfully Deleted"
    
    };
  } catch (error) {
    return catchError(error);
  }
};

// student  role  api 

const findByExamGradesSpecificStudentIntoDb = async (
  subscriptionId: string,
  studentId: string,
  query: Record<string, unknown>,
) => {
  try {
    // ============================================
    // CACHE KEY
    // ============================================

    const cacheKey = `student-exam-grades:${subscriptionId}:${studentId}:${JSON.stringify(
      query,
    )}`;

    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    
    const page = Number(query.page) || 1;

    const limit = Number(query.limit) || 10;

    const skip = (page - 1) * limit;

    const sortBy = (query.sortBy as string) || "createdAt";

    const sortOrder = (query.sortOrder as string) || "desc";

    const searchTerm = (query.searchTerm as string) || "";

    // ============================================
    // BASE WHERE
    // ============================================

    const baseWhere: any = {
      studentId,

      examAnnouncement: {
        subscriptionId,
      },
    };



    if (searchTerm) {
      baseWhere.OR = [
        {
          instructions: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },

        {
          examAnnouncement: {
            tipTapEditor: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },

        {
          examAnnouncement: {
            classDistribution: {
              classLevel: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          },
        },

        {
          examAnnouncement: {
            classDistribution: {
              assignableSubject: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    // ============================================
    // DATABASE QUERY
    // ============================================

    const [data, total] = await prisma.$transaction([
      prisma.examGrades.findMany({
        where: baseWhere,

        orderBy: {
          [sortBy]: sortOrder,
        },

        skip,

        take: limit,

        select: {
          id: true,

          totalMarks: true,

          marks: true,

          instructions: true,

          createdAt: true,

          examAnnouncement: {
            select: {
              examDate: true,

             

              classDistribution: {
                select: {
                  classLevel: true,
                    assignableSubject: true,
                },
              },
            },
          },
        },
      }),

      prisma.examGrades.count({
        where: baseWhere,
      }),
    ]);

    

    const result = {
      meta: {
        total,

        page,

        limit,

        totalPages: Math.ceil(total / limit),
      },

      data,
    };


    await setCache(cacheKey, result, 300);

    return result;
  } catch (error) {
    return catchError(error);
  }
};


const ExamAnnouncementServices = {
  examAnnouncementServiceIntoDb,
  findMyAnnouncementExamListIntoDb,
  findBySpecificAnnouncementExamIntoDb,
  updateAnnouncementExamIntoDb,
  deleteAnnouncementExamIntoDb,
  findBySpecificStudentAnnouncementExamListIntoDb,
  findByParticipantStudentListIntoDb,
  recordedExamGradesIntoDb,
  findByExamGradesSpecificTeacherIntoDb,
  findBySpecificExamGradesIntoDb,
  updateExamGradesSpecificTeacherIntoDb,
  deleteExamGradesSpecificTeacherIntoDb,
  findByExamGradesSpecificStudentIntoDb,
  
};

export default ExamAnnouncementServices;
