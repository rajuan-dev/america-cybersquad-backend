import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { TAssignments, TMaterials } from "./assignments.interface";
import { getSocketIO } from "../../../socket/connectSocket";
import { UserRole } from "@prisma/client";
import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";
import { deleteByPattern, deleteCache, getCache, setCache } from "../../../config/redis";
import { searchableAssignment } from "./assignments.constant";
import { deleteFileIfExists } from "../../../utils/deleteFiles/deleteFileIfExists";
import { AppErrorCodes } from "firebase-admin/app";


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

    
    await setCache(cacheKey, responseData, 600);

    return responseData;
  } catch (error) {
    return catchError(
      error,
      "Error fetching teacher assignments"
    );
  }
};

const findBySpecificAssignmentIntoDb=async(id:string)=>{

   try{

     return await prisma.classAssignment.findUnique({where:{id},
     select:{
         id: true,
        assignmentTitle: true,
        assignmentType: true,
        assignmentDueDate: true,
        description: true,
        attachmentFiles: true,
        createdAt: true,
        updatedAt: true,
    }});


   }
   catch(error){
    return catchError(
      error,
      "Error fetching teacher assignments"
    );
   }

  
};



const updateClassTeacherAssignmentIntoDb = async (
  id: string,
  payload: Partial<TAssignments>
):Promise<{status: boolean, message:string}> => {
  try {
    const existing = await prisma.classAssignment.findUnique({
      where: { id },
      select: {
        id: true,
        attachmentFiles: true,
      },
    });

    if (!existing) {
      throw new ApiError(httpStatus.NOT_FOUND, "Assignment not found", "");
    }


    const updateData: Partial<TAssignments> = {};

    const fieldMap: (keyof TAssignments)[] = [
      "assignmentTitle",
      "assignmentType",
      "assignmentDueDate",
      "description"
     
    ];

    fieldMap.forEach((field) => {
      const value = payload[field];

      if (value !== undefined) {
        if (typeof value === "string") {
          updateData[field] = value.trim() as any;
        } else {
          updateData[field] = value as any;
        }
      }
    });
    if (payload.attachmentFiles?.length) {
      updateData.attachmentFiles = payload.attachmentFiles;

      existing.attachmentFiles?.forEach(deleteFileIfExists);
    }


   await prisma.classAssignment.update({
      where: { id },
      data: updateData,
    });

    return {
      status: true,
      message: "Assignment updated successfully",
      
    };
  } catch (error) {
    return catchError(error);
  }
};

const deleteClassAssignmentIntoDb = async (
  id: string
): Promise<{ status: boolean; message: string }> => {
  try {

    const existing = await prisma.classAssignment.findUnique({
      where: { id },
      select: {
        id: true,
        attachmentFiles: true,
      },
    });

    if (!existing) {
      throw new ApiError(httpStatus.NOT_FOUND, "Assignment not found", "");
    }

    if (existing.attachmentFiles?.length) {
      existing.attachmentFiles.forEach(deleteFileIfExists);
    }

    await prisma.classAssignment.delete({
      where: { id },
    });

    await deleteCache(`class-assignment:${id}`);


    await deleteByPattern(`class-assignment:*`);

    return {
      status: true,
      message: "Assignment deleted successfully",
    };
  } catch (error) {
    throw catchError(error);
  }
};


const createClassMaterialsIntoDb=async(payload:Partial<TMaterials>)=>{

  try{

    return payload
    

  }
  catch (error) {
    throw catchError(error);
  }





}



const AssignmentsServices={
    createAssignmentsIntoDb,
    findBySpecificTeacherAssignmentIntoDb,
    findBySpecificAssignmentIntoDb,
    updateClassTeacherAssignmentIntoDb,
    deleteClassAssignmentIntoDb,
    createClassMaterialsIntoDb
};

export default AssignmentsServices;

