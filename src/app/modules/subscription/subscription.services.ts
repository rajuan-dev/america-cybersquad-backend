import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { ISubscriptionDetails, ISubscriptions } from "./subscription.interface";
import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";



const saveUserSubscriptionIntoDb = async (
  userId: string,
  payload: ISubscriptions & ISubscriptionDetails
): Promise<{
  status: boolean;
  message: string;
  data?: unknown;
}> => {
  try {
    const { studentLimit, price, subscriptiondetails = [] } = payload;

    const subscription = await prisma.subscriptions.create({
      data: {
        studentLimit,
        price,
        userId,
        subscriptiondetails: {
          create: subscriptiondetails, 
        },
      },
      include: {
        subscriptiondetails: true,
      },
    });

    if(!subscription){
        throw new ApiError(httpStatus.NOT_EXTENDED, 'not extended subscription ');
    }

    return {
      status: true,
      message: "Successfully Recorded"
    };
  } catch (error) {
    catchError(error);

    return {
      status: false,
      message: "Failed to create subscription",
    };
  }
};


const findByAllSubscriptionsAdminIntoDb = async (query: Record<string, any>) => {
  try {
   
    const queryBuilder = new PrismaQueryBuilder(query)
      .filter() 
      .sort()
      .paginate()
      .fields()
      .search(["price", "studentLimit"]);

    const queryOptions = queryBuilder.build();

    const detailsFilter: Record<string, any> = {};
    const nestedFields = ["branchName", "locationContext", "city", "state", "region", "province"];
    nestedFields.forEach((field) => {
      if (query[field]) {
        detailsFilter[field] = { contains: String(query[field]), mode: "insensitive" };
      }
    });

    if (Object.keys(detailsFilter).length > 0) {
      queryOptions.where.subscriptiondetails = {
        some: detailsFilter,
      };
    }

    const subscriptions = await prisma.subscriptions.findMany({
      where: queryOptions.where,
      include: {
        subscriptiondetails: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            isVerified: true,
          },
        },
      },
      skip: queryOptions.skip,
      take: queryOptions.take,
      orderBy: queryOptions.orderBy,
    });

    const total = await prisma.subscriptions.count({
      where: queryOptions.where,
    });

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      meta: { page, limit, total, totalPage },
      data: subscriptions,
    };
  } catch (error) {
    catchError(error);
  }
};

const hardDeleteSubscriptionByIdIntoDb = async (subscriptionId: string) => {
  try {
    const subscription = await prisma.subscriptions.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
    }

    await prisma.$transaction([
      prisma.subscriptionDetails.deleteMany({
        where: { subscriptionId },
      }),
      prisma.subscriptions.delete({
        where: { id: subscriptionId },
      }),
    ]);

    return {
      status: true,
      message: "Subscription and its details deleted permanently",
    };
  } catch (error) {
     catchError(error);

  }
};






const subscriptionServices = {
  saveUserSubscriptionIntoDb,
  findByAllSubscriptionsAdminIntoDb,
   hardDeleteSubscriptionByIdIntoDb
};

export default subscriptionServices;