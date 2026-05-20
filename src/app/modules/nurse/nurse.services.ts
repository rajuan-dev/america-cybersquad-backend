import { Prisma, UserStatus, bloodTypeEnum } from "@prisma/client";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { IHealthRecord } from "./nurse.interface";
import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";
import { deleteByPattern, deleteCache, getCache, setCache } from "../../../config/redis";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";

// ✅ Blood Group Mapper
const bloodTypeMapper: Record<string, bloodTypeEnum> = {
  "A+": bloodTypeEnum.A_POSITIVE,
  "A-": bloodTypeEnum.A_NEGATIVE,
  "B+": bloodTypeEnum.B_POSITIVE,
  "B-": bloodTypeEnum.B_NEGATIVE,
  "AB+": bloodTypeEnum.AB_POSITIVE,
  "AB-": bloodTypeEnum.AB_NEGATIVE,
  "O+": bloodTypeEnum.O_POSITIVE,
  "O-": bloodTypeEnum.O_NEGATIVE,
};

const healthRecordIntoDb = async (
  payload: IHealthRecord,
  nurseId: string
) :Promise<{success: boolean, message: string}>=> {
  try {
   
    const isExistStudent = await prisma.student.findFirstOrThrow({
      where: {
        studentId: payload.studentId,
        isVerified: true,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    });

   
    const convertedBloodType = bloodTypeMapper[payload.bloodType];

    
    if (!convertedBloodType) {
      throw new Error("Invalid blood type");
    }
    const result = await prisma.healthRecords.create({
      data: {
        studentId: isExistStudent.id,
        subscriptionId: payload.subscriptionId,
        tipTapEditor: payload.tipTapEditor,
        emergencyContact: payload.emergencyContact,
        nurseId,
        bloodType: convertedBloodType,
      },
    });

    return result && {
        success: true , 
        message:"successfully recorded"
    };
  } catch (error) {
    return catchError(error);
  }
};

const findByAllHealthRecordIntoDb = async (
  nurseId: string,
  subscriptionId: string,
  query: Record<string, unknown>
) => {
  try {
   
    const cacheKey = `health-records:${nurseId}:${subscriptionId}:${JSON.stringify(
      query
    )}`;


    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }


    const queryBuilder = new PrismaQueryBuilder(query)
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    const { bloodType, studentId, date, search } = query;

  
    const extraFilter: Prisma.HealthRecordsWhereInput = {};


    const bloodTypeMap: Record<string, bloodTypeEnum> = {
      "A+": bloodTypeEnum.A_POSITIVE,
      "A-": bloodTypeEnum.A_NEGATIVE,
      "B+": bloodTypeEnum.B_POSITIVE,
      "B-": bloodTypeEnum.B_NEGATIVE,
      "AB+": bloodTypeEnum.AB_POSITIVE,
      "AB-": bloodTypeEnum.AB_NEGATIVE,
      "O+": bloodTypeEnum.O_POSITIVE,
      "O-": bloodTypeEnum.O_NEGATIVE,
    };

    if (search) {
      const searchValue = search as string;

      const orConditions: Prisma.HealthRecordsWhereInput[] = [
        {
          students: {
            name: { contains: searchValue, mode: "insensitive" },
          },
        },
        {
          students: {
            email: { contains: searchValue, mode: "insensitive" },
          },
        },
        {
          students: {
            studentId: { contains: searchValue, mode: "insensitive" },
          },
        },
      ];

     
      if (bloodTypeMap[searchValue]) {
        orConditions.push({
          bloodType: bloodTypeMap[searchValue],
        });
      }

      extraFilter.OR = orConditions;
    }

    if (bloodType) {
      const mapped = bloodTypeMap[bloodType as string];
      if (mapped) {
        extraFilter.bloodType = mapped;
      }
    }


    if (studentId) {
      extraFilter.students = {
        studentId: studentId as string,
      };
    }

    if (date) {
      extraFilter.createdAt = {
        gte: new Date(`${date}T00:00:00.000Z`),
        lte: new Date(`${date}T23:59:59.999Z`),
      };
    }

    const [result, total] = await Promise.all([
      prisma.healthRecords.findMany({
        where: {
          subscriptionId,
          nurseId,
          ...queryOptions.where,
          ...extraFilter,
        },

        select: {
          id: true,
          bloodType: true,
          emergencyContact: true,
          tipTapEditor: true,
          createdAt: true,
          updatedAt: true,

          students: {
            select: {
              id: true,
              name: true,
              email: true,
              photo: true,
              studentId: true,
            },
          },
        },

        orderBy: queryOptions.orderBy || {
          createdAt: "desc",
        },

        skip: queryOptions.skip,
        take: queryOptions.take,
      }),

      prisma.healthRecords.count({
        where: {
          subscriptionId,
          nurseId,
          ...queryOptions.where,
          ...extraFilter,
        },
      }),
    ]);


    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;

    const response = {
      

      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },

      data: result,
    };

  
    await setCache(cacheKey, response, 3600);

    return response;
  } catch (error) {
    return catchError(error);
  }
};

const findBySpecificHealthRecordIntoDb=async(id: string)=>{
  try{

     const result=await prisma.healthRecords.findUnique({where:{id},select:{
         id: true,
          bloodType: true,
          emergencyContact: true,
          tipTapEditor: true,
          createdAt: true,
          
     }});

     return result;


  }
  catch(error){
    return catchError(error)
  }
};

const updateSpecificHealthRecordIntoDb = async (
  id: string,
  payload: Partial<IHealthRecord>
):Promise<{success: boolean, message : string}> => {
  try {
   
    const isExist = await prisma.healthRecords.findFirst({
      where: {
        id,
        isDelete: false,
      },
    });

    if (!isExist) {
      throw new ApiError(httpStatus.NOT_EXTENDED, "Health record not found");
    }

    const updateData: Prisma.HealthRecordsUpdateInput = {};
    if (payload.emergencyContact !== undefined) {
      updateData.emergencyContact = payload.emergencyContact;
    }

    if (payload.tipTapEditor !== undefined) {
      updateData.tipTapEditor = payload.tipTapEditor;
    }

    if (payload.bloodType !== undefined) {
      const mappedBloodType = bloodTypeMapper[payload.bloodType];

      if (!mappedBloodType) {
        throw new ApiError(httpStatus.NOT_EXTENDED,"Invalid blood type");
      }

      updateData.bloodType = mappedBloodType;
    }


    const result = await prisma.healthRecords.update({
      where: {
        id,
      },
      data: updateData,
    });

    return result &&  {
      success: true,
      message: "Health record updated successfully",
    
    };
  } catch (error) {
    return catchError(error);
  }
};

 const deleteHealthRecordIntoDb = async (id: string) => {
  try {

    const result = await prisma.healthRecords.delete({
      where: { id },
    });
    await deleteCache(`healthRecord:${id}`);
    await deleteByPattern(`healthRecords:*`);

    return result && {
      success: true,
      message: "Successfully deleted health record",
    };
  } catch (error) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Health record not found or already deleted"
    );
  }
};
const nurseServices = {
  healthRecordIntoDb,
  findByAllHealthRecordIntoDb,
  findBySpecificHealthRecordIntoDb,
  updateSpecificHealthRecordIntoDb,
  deleteHealthRecordIntoDb
};

export default nurseServices;