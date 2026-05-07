import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { TAssignments } from "./assignments.interface";
import { getSocketIO } from "../../../socket/connectSocket";
import { UserRole } from "@prisma/client";
import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";
import { getCache, setCache } from "../../../config/redis";
import { searchableAssignment } from "./assignments.constant";


const createAssignmentsIntoDb = async (
  teacherId: string,
  payload: TAssignments
):Promise<{status: boolean, message: string}> => {
  try {
   
    if (
      !payload.assignmentTitle ||
      !payload.assignmentType ||
      !payload.assignmentDueDate ||
      !payload.description ||
      !payload.classDistributionId ||
      !payload.subscriptionId
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Required fields missing"
      );
    }
    const isExistClassDistributionId =
      await prisma.classDistribution.findFirst({
        where: {
          id: payload.classDistributionId,
          subscriptionId: payload.subscriptionId,
          teacherId,
        },
        select: {
          students: {
            select: {
              id: true,
            },
          },
        },
      });

    if (!isExistClassDistributionId) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Class distribution not found"
      );
    };
    

    const result = await prisma.$transaction(async (tx) => {
      const assignment = await tx.classAssignment.create({
        data: {
          assignmentTitle: payload.assignmentTitle,
          assignmentType: payload.assignmentType,
          assignmentDueDate: payload.assignmentDueDate,
          description: payload.description,
          attachmentFiles: payload.attachmentFiles ?? [],
          classDistributionId: payload.classDistributionId,
          subscriptionId: payload.subscriptionId,
        },
      });

     
      if (isExistClassDistributionId.students?.length) {
        await tx.notification.createMany({
          data: isExistClassDistributionId.students.map((student) => ({
            title: "📚 New Assignment Added",
            message: `A new assignment has been uploaded.`,
            studentId: student.id,
            subscriptionId: payload.subscriptionId!,
          })),
        });
      }

      return assignment;
    });

    const io = getSocketIO() as any;

    const notificationPayload = {
      id: Date.now(),
      title: "📚 New Assignment Added",
      message: `A new assignment has been uploaded.`,
      createdBy: UserRole.TEACHER,
      timestamp: new Date().toISOString(),
    };

   
    io.to(`class::${payload.classDistributionId}`).emit(
      "notification",
      notificationPayload
    );

    if (isExistClassDistributionId.students?.length) {
      isExistClassDistributionId.students.forEach((student) => {
        io.to(`user::${student.id}`).emit(
          "notification",
          notificationPayload
        );
      });
    }

    return result  && {
        status: true , 
        message:"A new assignment has been uploaded"
    };
  } catch (error) {
    return catchError(error);
  }
};

const findBySpecificTeacherAssignmentIntoDb = async (
  classDistributionId: string,
  teacherId: string,
  query: Record<string, unknown>
) => {
  try {

    const cacheKey = `teacher-assignments:${teacherId}:${classDistributionId}:${JSON.stringify(
      query
    )}`;

    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const queryBuilder = new PrismaQueryBuilder(query)
      .search(searchableAssignment)
      .filter()
      .sort()
      .paginate();

    const queryOptions = queryBuilder.build();

    
    const {
      assignmentType,
      assessmentAvailable,
      fromDate,
      toDate,
    } = query;

    const extraFilter: Record<string, any> = {};

    // ✅ Assignment Type
    if (assignmentType) {
      extraFilter.assignmentType = assignmentType;
    }

    // ✅ Assessment
    if (assessmentAvailable !== undefined) {
      extraFilter.assessmentAvailable =
        assessmentAvailable === "true";
    }

    // ✅ Date Range
    if (fromDate || toDate) {
      extraFilter.assignmentDueDate = {};

      if (fromDate) {
        extraFilter.assignmentDueDate.gte = new Date(
          fromDate as string
        );
      }

      if (toDate) {
        extraFilter.assignmentDueDate.lte = new Date(
          toDate as string
        );
      }
    };

    

    // ✅ Main Query
    const result = await prisma.classAssignment.findMany({
      where: {
        classDistributionId,

        classDistributions: {
          teacherId,
        },

        ...extraFilter,
        ...queryOptions.where,
      },

      orderBy: queryOptions.orderBy,

      skip: queryOptions.skip,
      take: queryOptions.take,

      select: {
        id: true,
        assignmentTitle: true,
        assignmentType: true,
        assignmentDueDate: true,
        description: true,
        attachmentFiles: true,
        assessmentAvailable: true,
        createdAt: true,
        updatedAt: true,

        classDistributions: {
          select: {
            id: true,
            classLevel: true,
          },
        },
      },
    });

    // ✅ Total Count
    const totalAssignments =
      await prisma.classAssignment.count({
        where: {
          classDistributionId,

          classDistributions: {
            teacherId,
          },

          ...extraFilter,
          ...queryOptions.where,
        },
      });

    // ✅ Pagination Meta
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    // ✅ Final Response
    const responseData = {
      meta: {
        page,
        limit,
        total: totalAssignments,
        totalPage: Math.ceil(
          totalAssignments / limit
        ),
      },

      data: result,
    };

    // ✅ Store Cache (10 Minutes)
    await setCache(cacheKey, responseData, 600);

    return responseData;
  } catch (error) {
    return catchError(
      error,
      "Error fetching teacher assignments"
    );
  }
};

const AssignmentsServices={
    createAssignmentsIntoDb,
    findBySpecificTeacherAssignmentIntoDb
};

export default AssignmentsServices;

