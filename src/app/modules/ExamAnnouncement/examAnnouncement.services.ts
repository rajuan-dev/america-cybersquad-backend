import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { TExamAnnouncement } from "./examAnnouncement.interface";
import { getSocketIO } from "../../../socket/connectSocket";
import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";
import { deleteByPattern, getCache, setCache } from "../../../config/redis";
import { searchableAttendedStudent, searchableStudentField, searchableTeacherField } from "./examAnnouncement.constant";

const examAnnouncementServiceIntoDb = async (payload: TExamAnnouncement):Promise<{success:boolean, message:string}> => {
  try {
    const { examDate, tipTapEditor, classDistributionId, subscriptionId } =
      payload;

    const {  students } = await prisma.$transaction(async (tx) => {
     
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
          "Class distribution does not exist"
        );
      }

      
      const announcement = await tx.examAnnouncement.create({
        data: {
          examDate,
          tipTapEditor,
          classDistributionId,
          subscriptionId,
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

    
    const io = getSocketIO() 

    students.forEach((student) => {
      io.to(`user::${student.id}`).emit("notification", {
        title: "📚 Exam Announcement",
        message: "New exam has been published",
        timestamp: new Date().toISOString(),
      });
    });

    return {
      success: true,
      message: "Successfully sent this announcement"
      
    };
  } catch (error) {
    return catchError(error);
  }
};

 const findMyAnnouncementExamListIntoDb = async (
  subscriptionId: string,
  teacherId: string,
  query: Record<string, unknown>
) => {
  try {
    const cacheKey = `exam-announcement:${subscriptionId}:${teacherId}:${JSON.stringify(
      query
    )}`;

    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const queryBuilder = new PrismaQueryBuilder(query)
      .search(searchableTeacherField)
      .filter()
      .sort()
      .paginate()
      .fields();

    const { where, orderBy, skip, take, select } = queryBuilder.build();


    const baseWhere = {
      subscriptionId,
      classDistribution: {
        teacherId,
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
            },
          },
        },
      }),

      prisma.examAnnouncement.count({
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


const findBySpecificAnnouncementExamIntoDb=async(id: string)=>{

   try{

      return await prisma.examAnnouncement.findUnique({where:{
        id
      }, select:{
        id:true,
        tipTapEditor: true,
        examDate: true,
        createdAt: true
      }})

   }
 catch (error) {
    return catchError(error);
  }
   
};

const updateAnnouncementExamIntoDb = async (
  id: string,
  payload: Partial<TExamAnnouncement>
):Promise<{
  success: boolean,
   message: string
}> => {
  try {
    
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([_, value]) => value !== undefined
      )
    );

   
    const result = await prisma.examAnnouncement.update({
      where: { id },
      data: cleanPayload
     
    });

    
    return  result && {
      success: true,
      message: "Successfully updated announcement exam"
      
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
        "Exam announcement not found"
      );
    }

    await prisma.examAnnouncement.delete({
      where: { id },
    });

    await Promise.all([
      deleteByPattern(
        `exam-announcement:${announcement.subscriptionId}:*`
      ),
      deleteByPattern(
        `exam-announcement:*:${announcement.classDistributionId}:*`
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
  query: Record<string, unknown>
) => {
  try {

    const cacheKey = `student-exam-announcement:${subscriptionId}:${studentId}:${JSON.stringify(
      query
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
  query: Record<string, unknown>
) => {
  try {
   
    const cacheKey = `participant-students:${examAnnouncementId}:${JSON.stringify(
      query
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

    const { where, orderBy, skip, take, select } =
      queryBuilder.build();

   
    const examAnnouncement =
      await prisma.examAnnouncement.findUnique({
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

        select:
          select ?? {
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
        totalPages: Math.ceil(
          total / (Number(query.limit) || 10)
        ),
      },

      data,
    };

    await setCache(cacheKey, result, 300);

    return result;
  } catch (error) {
    return catchError(error);
  }
};



const ExamAnnouncementServices={
    examAnnouncementServiceIntoDb,
    findMyAnnouncementExamListIntoDb,
    findBySpecificAnnouncementExamIntoDb,
    updateAnnouncementExamIntoDb,
    deleteAnnouncementExamIntoDb,
    findBySpecificStudentAnnouncementExamListIntoDb,
    findByParticipantStudentListIntoDb
};


export default ExamAnnouncementServices;