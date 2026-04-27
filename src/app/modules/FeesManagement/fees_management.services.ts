import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { TFeesManagement } from "./fees_management.interface";
import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";
import { searchable_fees_management } from "./fees_management.constant";

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

const findByFeesManagementIntoDb = async (
  subscriptionId: string,
  query: Record<string, unknown>
) => {
  try {
    const queryBuilder = new PrismaQueryBuilder(query)
      .search(searchable_fees_management)
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    const result = await prisma.feesManagement.findMany({
      where: {
        subscriptionId,
        isDelete: false,
        ...queryOptions.where,
      },

      orderBy: queryOptions.orderBy,
      skip: queryOptions.skip,
      take: queryOptions.take,

      select: {
        id: true,
        classLevel: true,
        totalFees: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const total = await prisma.feesManagement.count({
      where: {
        subscriptionId,
        isDelete: false,
        ...queryOptions.where,
      },
    });

    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      status: true,
      message: "Successfully fetched fees management data",
      meta: {
        page,
        limit,
        total,
        totalPage,
      },
      data: result,
    };

  } catch (error) {
    return catchError(error);
  }
};

const FeesManagementServices = {
  recordedFeesManagementIntoDb,
  findByFeesManagementIntoDb
};

export default FeesManagementServices;