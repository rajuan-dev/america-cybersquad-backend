import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { TBranchAdmin } from "./branch_management.interface";
import bcrypt from "bcrypt";

const create_branch_admin_IntoDb = async (
  userId: string,
  payload: TBranchAdmin
) => {
  try {
    const {
      fullName,
      phoneNumber,
      emailAddress,
      password,
      joinDate,
      assignBranch,
    } = payload;
    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_rounds)
    );

    // ⚡ Parallel duplicate checks
    const [ branchExists] = await Promise.all([
     
      prisma.branchAdmin.findUnique({ where: { assignBranch } }),
    ]);


    if (branchExists) {
      throw new ApiError(httpStatus.CONFLICT, "Branch already assigned");
    }

  
    const result = await prisma.branchAdmin.create({
      data: {
        fullName,
        phoneNumber,
        emailAddress,
        password: hashedPassword,
        joinDate: new Date(joinDate),
        assignBranch,
        userId,
      },
    });

    if(!result){
        throw new ApiError(httpStatus.NOT_EXTENDED, 'issues by the branch admin recorded section ')
    }

    return {
      status: true,
      message: "Branch admin created successfully"
    };
  } catch (error) {
    return catchError(error);
  }
};

const findSubscriptionBranchByIdIntoDb= async (
  userId: string,
  subscriptionId: string
) => {
  try {
    const result = await prisma.subscriptions.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
      select: {
        id: true,
        subscriptiondetails: {
          select: {
            branchName: true,
          },
        },
      },
    });
    if (!result) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Subscription not found or unauthorized"
      );
    }

    return result
  } catch (error) {
    return catchError(error);
  }
};

const BranchManagementServices = {
  create_branch_admin_IntoDb,
   findSubscriptionBranchByIdIntoDb
};

export default BranchManagementServices;