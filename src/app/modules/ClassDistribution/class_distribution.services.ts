import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { IClassDistribution } from "./class_distribution.interface";
import catchError from "../../../errors/catchError";
import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";
const recordedClassDistributionIntoDb = async (
  payload: IClassDistribution
) => {
  try {
    const { classLevel, roomNumber, capacity, subscriptionId, teacherId } =
      payload;

    const result = await prisma.$transaction(async (tx) => {

      const existing = await tx.classDistribution.findFirst({
        where: {
          classLevel,
          roomNumber,
          subscriptionId,
        },
        select: { id: true },
      });

      if (existing) {
        throw new ApiError(400, "Class distribution already exists");
      }

      const teacher = await tx.teacher.findFirst({
        where: { teacherId },
        select: { id: true },
      });

      if (!teacher) {
        throw new ApiError(404, "Teacher not found");
      }

      const students = await tx.student.findMany({
        where: {
          className: classLevel,
          subscriptionId,
        },
        select: { id: true },
        take: capacity,
      });

      if (students.length === 0) {
        throw new ApiError(404, "No students available");
      }

      const classDistribution = await tx.classDistribution.create({
        data: {
          subscriptionId,
          roomNumber,
          capacity,
          classLevel,
          teacherId: teacher.id,

          students: {
            connect: students.map((s) => ({ id: s.id })),
          },
        },
        include: {
          students: true,
          teacher: true,
        },
      });

      return classDistribution;
    });

    return {
      success: true,
      message: "Class distribution created successfully",
      assignedStudents: result.students.length,
      data: {
        message:" successfully recorded"
      },
    };
  } catch (error) {
    return catchError(error);
  }
};

const findByBranchAdminDistributionIntoDb = async (
  subscriptionId: string,
  query: Record<string, unknown>
) => {
  try {
    const queryBuilder = new PrismaQueryBuilder(query)
      .search(["classLevel", "roomNumber"])
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    const { teacherId, classLevel } = query;

    const extraFilter: any = {};

    // 1️⃣ Teacher filter (safe mapping)
    if (teacherId) {
      const teacher = await prisma.teacher.findFirst({
        where: { teacherId: teacherId as string },
        select: { id: true },
      });

      if (!teacher) {
        return {
          meta: { page: 1, limit: 10, total: 0, totalPage: 0 },
          data: [],
        };
      }

      extraFilter.teacherId = teacher.id;
    }

    // 2️⃣ Class level filter
    if (classLevel) {
      extraFilter.classLevel = classLevel;
    }

    // 3️⃣ Main query
    const result = await prisma.classDistribution.findMany({
      where: {
        subscriptionId,
        ...queryOptions.where,
        ...extraFilter,
      },

      select: {
        id: true,
        capacity: true,
        roomNumber: true,
        classLevel: true,
        createdAt: true,

        // 👇 Teacher relation
        teacher: {
          select: {
            id: true,
            teacherName: true,
            email: true,
            phoneNumber: true,
            teacherId: true,
            photo: true,
            createdAt: true,
          },
        },

        // // 🔥 NEW: Students relation (many-to-many)
        // students: {
        //   select: {
        //     id: true,
        //     name: true,
        //     email: true,
        //     studentId: true,
        //     className: true,
        //     guardianName: true,
        //     guardianPhone: true,
        //     photo: true,
        //   },
        // },
      },

      orderBy: queryOptions.orderBy,
      skip: queryOptions.skip,
      take: queryOptions.take,
    });

    // 4️⃣ Count query
    const total = await prisma.classDistribution.count({
      where: {
        subscriptionId,
        ...queryOptions.where,
        ...extraFilter,
      },
    });

    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;

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
    throw error;
  }
};

const ClassDistributionServices = {
  recordedClassDistributionIntoDb,
  findByBranchAdminDistributionIntoDb,
  
};

export default ClassDistributionServices;