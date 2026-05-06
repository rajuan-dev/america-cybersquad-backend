import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { TAssignments } from "./assignments.interface";
import { getSocketIO } from "../../../socket/connectSocket";
import { UserRole } from "@prisma/client";


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


const AssignmentsServices={
    createAssignmentsIntoDb
};

export default AssignmentsServices;

