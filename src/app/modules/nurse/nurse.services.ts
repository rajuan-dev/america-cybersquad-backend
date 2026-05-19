import { UserStatus, bloodTypeEnum } from "@prisma/client";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { IHealthRecord } from "./nurse.interface";

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

const nurseServices = {
  healthRecordIntoDb,
};

export default nurseServices;