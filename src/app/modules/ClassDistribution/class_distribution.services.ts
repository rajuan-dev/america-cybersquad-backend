import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { IClassDistribution } from "./class_distribution.interface";
import catchError from "../../../errors/catchError";

const recordedClassDistributionIntoDb = async (payload: IClassDistribution) => {
  try {
    const { classLevel, roomNumber, capacity, subscriptionId, teacherId } = payload;

    const result = await prisma.$transaction(async (tx) => {

      const existing = await tx.classDistribution.findFirst({
        where: {
          classLevel,
          roomNumber,
          subscriptionId,
        },
      });

      if (existing) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Class distribution already exists"
        );
      }

      const students = await tx.student.findMany({
        where: {
          className: classLevel,
        },
        select: {
          id: true,
        },
      });

      
      const teacher = await tx.teacher.findFirst({
        where: {
          id: teacherId, 
        },
      });

      if (!teacher) {
        throw new ApiError(httpStatus.NOT_FOUND, "Teacher not found");
      }


      if (students.length >= capacity) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `${classLevel} ${roomNumber} is full (limit: ${capacity})`
        );
      }

  
      const classDistribution = await tx.classDistribution.create({
        data: {
          subscriptionId,
          teacherId: teacher.id,
          roomNumber,
          capacity,
          classLevel,
        },
      });


      const studentIds = students.slice(0, capacity).map((s) => s.id);

      await tx.student.updateMany({
        where: {
          id: {
            in: studentIds,
          },
        },
        data: {
          classDistributionId: classDistribution.id,
        },
      });

      return {
        classDistribution,
        studentIds,
      };
    });

    return {
      success: true,
      assignedStudents: result.studentIds.length,
      message: "Class distribution recorded successfully",
    };
  } catch (error) {
    catchError(error)
  }
};

const ClassDistributionServices = {
  recordedClassDistributionIntoDb,
};

export default ClassDistributionServices;