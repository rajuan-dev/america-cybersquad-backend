import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { ISubscriptionDetails, ISubscriptions } from "./subscription.interface";



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

const subscriptionServices = {
  saveUserSubscriptionIntoDb,
};

export default subscriptionServices;