
import catchError from "../errors/catchError";
import prisma from "../shared/prisma";

const autoDeleteNotification = async () => {
  try {
  
    const currentTime = new Date();

    const timeThreshold = new Date(
      currentTime.getTime() - 24 * 60 * 60 * 1000
    );

    const notifications = await prisma.notification.findMany({
      where: {
        createdAt: {
          lt: timeThreshold,
        },
      },
      select: {
        id: true,
      },
    });

    if (notifications.length === 0) {
      return {
        deletedCount: 0,
        message: "No notifications to delete",
      };
    }

    const deleteResult = await prisma.notification.deleteMany({
      where: {
        id: {
          in: notifications.map((n) => n.id),
        },
      },
    });

    return {
      deletedCount: deleteResult.count,
      message: "Notifications deleted successfully",
    };
  } catch (error) {
    throw catchError(error);
  }
};

export default autoDeleteNotification;