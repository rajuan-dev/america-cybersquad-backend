import httpStatus from "http-status";
import prisma from "../shared/prisma";
import ApiError from "../errors/ApiErrors";


const autoDeleteUnverifiedUser = async () => {
  try {
    const currentTime = new Date();
    const timeThreshold = new Date(currentTime.getTime() - 10 * 60 * 1000);


    const unverifiedUsers = await prisma.user.findMany({
      where: {
        isVerified: false,
        createdAt: {
          lt: timeThreshold,
        },
      },
      select: {
        id: true,
      },
    });

    if (unverifiedUsers.length === 0) {
      return { deletedCount: 0, message: "No unverified users to delete" };
    }

    const userIds = unverifiedUsers.map((user) => user.id);

    const deleteResult = await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    if (!deleteResult || deleteResult.count === 0) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to delete unverified accounts",
        ""
      );
    }

    return {
      deletedCount: deleteResult.count,
      message: "Unverified users deleted successfully",
    };
  } catch (error: any) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Unverified user cron job failed",
      error?.message || error
    );
  }
};

export default autoDeleteUnverifiedUser;