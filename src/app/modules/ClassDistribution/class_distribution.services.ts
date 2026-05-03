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
    const { classLevel, roomNumber, capacity, subscriptionId, teacherId, assignableSubject } =
      payload;

    const result = await prisma.$transaction(async (tx) => {

      const existing = await tx.classDistribution.findFirst({
        where: {
          subscriptionId,
        },
        select: { id: true },
      });

      if (!existing) {
        throw new ApiError(400, "this subscription does not exist");
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
          assignableSubject,

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
        assignableSubject: true,
        createdAt: true,


        // 👇 Teacher relation
        teacher: {
          select: {
            id: true,
            teacherName: true,
            email: true,
            phoneNumber: true,
            teacherId: true,
            subject: true, 
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
    return catchError(error);
  }
};

const findBySpecificClassDistributionIntoDb=async(id: string)=>{

  try{

    return await prisma.classDistribution.findUnique({where:{id}, select:{
      id: true ,
      capacity:true , 
      roomNumber: true , 
      classLevel: true ,
      assignableSubject: true,
      createdAt: true ,
      updatedAt: true 
    }});

  }
  catch(error){
     return catchError(error);
  };
};


const updateClassDistributionIntoDb = async (
  id: string,
  payload: {
    classLevel?: string;
    roomNumber?: string;
    capacity?: number;
    assignableSubject?: string;
  }
) => {
  try {
    const { classLevel, roomNumber, capacity, assignableSubject } = payload;

    const result = await prisma.$transaction(async (tx) => {

      const existing = await tx.classDistribution.findUnique({
        where: { id },
        include: { students: true },
      });

      if (!existing) {
        throw new ApiError(404, "Class distribution not found");
      }

      if (classLevel || roomNumber) {
        const duplicate = await tx.classDistribution.findFirst({
          where: {
            id: { not: id },
            classLevel: classLevel ?? existing.classLevel,
            roomNumber: roomNumber ?? existing.roomNumber,
            subscriptionId: existing.subscriptionId,
          },
        });

        if (duplicate) {
          throw new ApiError(400, "Same class & room already exists");
        }
      }

      if (
        capacity !== undefined &&
        existing.students.length > capacity
      ) {
        throw new ApiError(
          httpStatus.NOT_EXTENDED,
          `Capacity too small. Already ${existing.students.length} students assigned`
        );
      }

      const updatedClass = await tx.classDistribution.update({
        where: { id },
        data: {
          ...(classLevel && { classLevel }),
          ...(roomNumber && { roomNumber }),
          ...(capacity !== undefined && { capacity }),
          ...(assignableSubject && { assignableSubject }), // ✅ added
        },
        include: {
          teacher: true,
          students: true,
        },
      });

      return updatedClass;
    });

    return result && {
      success: true,
      message: "Class distribution updated successfully",
    };

  } catch (error) {
    return catchError(error);
  }
};


const deleteClassDistributionIntoDb = async (id: string) => {
  try {
    const result = await prisma.$transaction(async (tx) => {

      const existing = await tx.classDistribution.findUnique({
        where: { id },
        include: {
          students: {
            select: { id: true },
          },
        },
      });

      if (!existing) {
        throw new ApiError(404, "Class distribution not found");
      }

      if (existing.students.length > 0) {
        await tx.classDistribution.update({
          where: { id },
          data: {
            students: {
              disconnect: existing.students.map((s) => ({
                id: s.id,
              })),
            },
          },
        });
      }

    
      const deletedClass = await tx.classDistribution.delete({
        where: { id },
      });

      return deletedClass;
    });

    return  result && {
      success: true,
      message: "Class distribution deleted successfully"
     
    };
  } catch (error) {
    return catchError(error);
  }
};


const findByBranchAdminClassScheduleIntoDb=async( subscriptionId: string,query: Record<string, unknown>)=>{

  try{

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
        roomNumber: true,
        classLevel: true,
        assignableSubject: true,
        time: true , 
        day: true ,
        isOnline:true, 
        createdAt: true,


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
  }
  catch(error){
    return  catchError(error);

  }

};

const classScheduleIntoDb = async (
  classDistributionId: string,
  payload: { day?: string; time?: string }
): Promise<{
  status: boolean;
  message: string;
}> => {
  try {
    const result = await prisma.classDistribution.update({
      where: {
        id: classDistributionId,
      },
      data: {
        ...(payload.day !== undefined && { day: payload.day }),
        ...(payload.time !== undefined && { time: payload.time }),
      },
    });

    return result && {
      status: true,
      message: "Successfully recorded",
    };
  } catch (error) {
    return catchError(error);
  }
};



const ClassDistributionServices = {
  recordedClassDistributionIntoDb,
  findByBranchAdminDistributionIntoDb,
  findBySpecificClassDistributionIntoDb,
  updateClassDistributionIntoDb,
  deleteClassDistributionIntoDb,
  findByBranchAdminClassScheduleIntoDb,
  classScheduleIntoDb
  
};

export default ClassDistributionServices;