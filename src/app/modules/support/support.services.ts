import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { TSupport } from "./support.interface";
import { getSocketIO } from "../../../socket/connectSocket";
import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";
import { searchable_support_filed } from "./support.constant";
import { UserRole } from "@prisma/client";


const sendSupportMessageIntoDb = async (
  userId: string,
  role: string,
  payload: TSupport
) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      let supportResult: any = null;

      switch (role) {
        case UserRole.BRANCH_ADMIN: {
          const isExistSubscription = await tx.subscriptions.findUnique({
            where: { id: payload.subscriptionId },
            select: { userId: true },
          });

          if (!isExistSubscription) {
            throw new ApiError(
              httpStatus.NOT_FOUND,
              "Subscription not found"
            );
          }

          supportResult = await tx.support.create({
            data: {
              subscriptionId: payload.subscriptionId,
              name: payload.name,
              email: payload.email,
              subject: payload.subject,
              message: payload.message,
              isDelete: payload.isDelete ?? false,
              branchAdminId: userId,
            },
          });

          await tx.notification.create({
            data: {
              title: payload.subject,
              message:
                payload.message.length > 20
                  ? payload.message.slice(0, 20) + "..."
                  : payload.message,
              branchAdminId: isExistSubscription.userId,
              subscriptionId: payload.subscriptionId,
            },
          });

          break;
        }

        // ✅ EMPTY CASE (no action)
        case UserRole.INSTITUTIONAL_OWNER: {

         const isExistSubscription = await tx.subscriptions.findUnique({
            where: { id: payload.subscriptionId },
            select: { userId: true },
          });

          if (!isExistSubscription) {
            throw new ApiError(
              httpStatus.NOT_FOUND,
              "Subscription not found"
            );
          }

          supportResult = await tx.support.create({
            data: {
              subscriptionId: payload.subscriptionId,
              name: payload.name,
              email: payload.email,
              subject: payload.subject,
              message: payload.message,
              isDelete: payload.isDelete ?? false,
              userId: userId,
            },
          });

          await tx.notification.create({
            data: {
              title: payload.subject,
              message:
                payload.message.length > 20
                  ? payload.message.slice(0, 20) + "..."
                  : payload.message,
              userId: isExistSubscription.userId,
              subscriptionId: payload.subscriptionId,
            },
          });

          break;
          
         
        }
        case UserRole.TEACHER:{

           const isExistSubscription = await tx.subscriptions.findUnique({
            where: { id: payload.subscriptionId },
            select: { userId: true },
          });

          if (!isExistSubscription) {
            throw new ApiError(
              httpStatus.NOT_FOUND,
              "Subscription not found"
            );
          };

           supportResult = await tx.support.create({
            data: {
              subscriptionId: payload.subscriptionId,
              name: payload.name,
              email: payload.email,
              subject: payload.subject,
              message: payload.message,
              isDelete: payload.isDelete ?? false,
              teacherId: userId,
            },
          });

          //recorded notification 
          


          // await tx.notification.create({
          //   data: {
          //     title: payload.subject,
          //     message:
          //       payload.message.length > 20
          //         ? payload.message.slice(0, 20) + "..."
          //         : payload.message,
          //     teacherId: userId,
          //     subscriptionId: payload.subscriptionId,
          //   },
          // });
          //send notification 







          break;

        }

        default:
          throw new ApiError(httpStatus.FORBIDDEN, "Role not allowed");
      }

      return supportResult;
    });
    if(! result){
        throw new ApiError(httpStatus.NOT_EXTENDED, 'ISSUES BY THE SEND SUPPORT MESSAGE INTO SERVER')
    }

    const io = getSocketIO() as any;

    io.emit(`notification::${userId}`, {
      id: Date.now(),
      title: payload.subject,
      message:
        payload.message.length > 20
          ? payload.message.slice(0, 20) + "..."
          : payload.message,
      createdBy: role,
      timestamp: new Date().toISOString(),
    });


    return {
      success: true,
      message:"Successfully Send Support Message"
    };
  } catch (error) {
    return catchError(error);
  }
};

const findByAllSupportIntoDb = async (
  query: Record<string, unknown>
) => {
  try {
    const queryBuilder = new PrismaQueryBuilder(query)
      .search(searchable_support_filed)
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    const { isDelete, subscriptionId } = query;

    const extraFilter: any = {};

    if (isDelete !== undefined) {
      extraFilter.isDelete = isDelete === "true";
    }

    if (subscriptionId) {
      extraFilter.subscriptionId = String(subscriptionId);
    }

    const result = await prisma.support.findMany({
      where: {
        ...queryOptions.where,
        ...extraFilter,
      },

      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        message: true,
        createdAt: true,
        updatedAt: true,
        subscriptions: {
          select: {
            id: true,
            price: true,
            createdAt: true,
            subscriptiondetails: {
              select: {
                subscriptionType: true,
                schoolName: true,
                country: true,
                state: true,
                city: true,
                area: true,
              },
            },
          },
        },

        branchAdmin: {
          select: {
            id: true,
            fullName: true,
            emailAddress: true,
            phoneNumber: true,
            photo: true,
          },
        },

        user: {
          select: {
            id: true,
            schoolName: true,
            city: true,
            country: true,
            photo: true,
          },
        },
      },

      orderBy: queryOptions.orderBy,
      skip: queryOptions.skip,
      take: queryOptions.take,
    });

    const total = await prisma.support.count({
      where: {
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

const deleteSupportIntoDb = async (id: string) => {
  try {
    await prisma.support.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Successfully deleted support message",
    };
  } catch (error) {
    return catchError(error);
  }
};

const SupportServices={
    sendSupportMessageIntoDb,
    findByAllSupportIntoDb,
     deleteSupportIntoDb
};
export default SupportServices;

