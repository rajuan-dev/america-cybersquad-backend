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

      const shortMessage =
        payload.message.length > 20
          ? payload.message.slice(0, 20) + "..."
          : payload.message;

      switch (role) {
        // ======================================================
        // BRANCH ADMIN
        // ======================================================
        case UserRole.BRANCH_ADMIN: {
          const isExistSubscription = await tx.subscriptions.findUnique({
            where: { id: payload.subscriptionId },
            select: {
              userId: true,
            },
          });

          if (!isExistSubscription) {
            throw new ApiError(
              httpStatus.NOT_FOUND,
              "Subscription not found"
            );
          }

          // create support
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

          // notification for owner
          await tx.notification.create({
            data: {
              title: payload.subject,
              message: shortMessage,
              userId: isExistSubscription.userId,
              subscriptionId: payload.subscriptionId,
              isDelete: false,
            },
          });

          break;
        }

        // ======================================================
        // INSTITUTIONAL OWNER
        // ======================================================
        case UserRole.INSTITUTIONAL_OWNER: {
          const isExistSubscription = await tx.subscriptions.findUnique({
            where: { id: payload.subscriptionId },
            select: {
              userId: true,
              branchAdmins: {
                select: {
                  id: true,
                },
              },
            },
          });

          if (!isExistSubscription) {
            throw new ApiError(
              httpStatus.NOT_FOUND,
              "Subscription not found"
            );
          }

          // create support
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

          // notification for all branch admins
          await Promise.all(
            isExistSubscription.branchAdmins.map((admin) =>
              tx.notification.create({
                data: {
                  title: payload.subject,
                  message: shortMessage,
                  branchAdminId: admin.id,
                  subscriptionId: payload.subscriptionId,
                  isDelete: false,
                },
              })
            )
          );

          break;
        }

        // ======================================================
        // TEACHER
        // ======================================================
        case UserRole.TEACHER: {
          
          const isExistSubscription = await tx.subscriptions.findUnique({
            where: { id: payload.subscriptionId },
            select: {
              userId: true,
              branchAdmins: {
                select: {
                  id: true,
                },
              },
              user: {
                select: {
                  role: true,
                },
              },
            },
          });

          if (!isExistSubscription) {
            throw new ApiError(
              httpStatus.NOT_FOUND,
              "Subscription not found"
            );
          }

          // create support
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

          // notification for branch admins
          await Promise.all(
            isExistSubscription.branchAdmins.map((admin) =>
              tx.notification.create({
                data: {
                  title: payload.subject,
                  message: shortMessage,
                  branchAdminId: admin.id,
                  subscriptionId: payload.subscriptionId,
                  isDelete: false,
                },
              })
            )
          );

          // notification for institutional owner
          if (
            isExistSubscription.user.role ===
            UserRole.INSTITUTIONAL_OWNER
          ) {
            await tx.notification.create({
              data: {
                title: payload.subject,
                message: shortMessage,
                userId: isExistSubscription.userId,
                subscriptionId: payload.subscriptionId,
                isDelete: false,
              },
            });
          }

          break;
        }

        // ======================================================
        // DEFAULT
        // ======================================================
        default:
          throw new ApiError(
            httpStatus.FORBIDDEN,
            "Role not allowed"
          );
      }

      return supportResult;
    });

    // ======================================================
    // RESULT CHECK
    // ======================================================
    if (!result) {
      throw new ApiError(
        httpStatus.NOT_EXTENDED,
        "Issues sending support message"
      );
    }

    // ======================================================
    // SOCKET NOTIFICATION
    // ======================================================
    const io = getSocketIO() as any;

    const shortMessage =
      payload.message.length > 20
        ? payload.message.slice(0, 20) + "..."
        : payload.message;

    // ----------------------------------------------
    // Teacher Socket Notification
    // ----------------------------------------------
    if (role === UserRole.TEACHER) {
      const subscription = await prisma.subscriptions.findUnique({
        where: { id: payload.subscriptionId },
        select: {
          userId: true,
          branchAdmins: {
            select: {
              id: true,
            },
          },
        },
      });

      // branch admins
      subscription?.branchAdmins.forEach((admin) => {
        io.emit(`notification::${admin.id}`, {
          id: Date.now(),
          title: payload.subject,
          message: shortMessage,
          createdBy: role,
          timestamp: new Date().toISOString(),
        });
      });

      // institutional owner
      io.emit(`notification::${subscription?.userId}`, {
        id: Date.now(),
        title: payload.subject,
        message: shortMessage,
        createdBy: role,
        timestamp: new Date().toISOString(),
      });
    }

    // ----------------------------------------------
    // Branch Admin Socket Notification
    // ----------------------------------------------
    if (role === UserRole.BRANCH_ADMIN) {
      const subscription = await prisma.subscriptions.findUnique({
        where: { id: payload.subscriptionId },
        select: {
          userId: true,
        },
      });

      io.emit(`notification::${subscription?.userId}`, {
        id: Date.now(),
        title: payload.subject,
        message: shortMessage,
        createdBy: role,
        timestamp: new Date().toISOString(),
      });
    }

    // ----------------------------------------------
    // Institutional Owner Socket Notification
    // ----------------------------------------------
    if (role === UserRole.INSTITUTIONAL_OWNER) {
      const subscription = await prisma.subscriptions.findUnique({
        where: { id: payload.subscriptionId },
        select: {
          branchAdmins: {
            select: {
              id: true,
            },
          },
        },
      });

      subscription?.branchAdmins.forEach((admin) => {
        io.emit(`notification::${admin.id}`, {
          id: Date.now(),
          title: payload.subject,
          message: shortMessage,
          createdBy: role,
          timestamp: new Date().toISOString(),
        });
      });
    }

    return {
      success: true,
      message: "Successfully Send Support Message",
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

