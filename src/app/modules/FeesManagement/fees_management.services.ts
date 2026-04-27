import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { TFeesManagement } from "./fees_management.interface";

const recordedFeesManagementIntoDb = async (payload: TFeesManagement) => {
  try {

    const { subscriptionId, classLevel, totalFees } = payload;

    const isExistFeesManagement=await prisma.feesManagement.findFirst({
        where:{
            subscriptionId,
            classLevel
        }
    })

   

    if (isExistFeesManagement) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "This class level fee already exists"
      );
    }

    // ✅ create
    await prisma.feesManagement.create({
      data: {
        subscriptionId,
        classLevel,
        totalFees,
      },
    });

    return {
      status: true,
      message: "Successfully recorded",
    };

  } catch (error) {
    return catchError(error);
  }
};

const FeesManagementServices = {
  recordedFeesManagementIntoDb,
};

export default FeesManagementServices;