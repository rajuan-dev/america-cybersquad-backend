import catchError from "../errors/catchError";
import prisma from "../shared/prisma";

const autoChangeStatusOnlineClass = async () => {
  try {
    
    const currentTime = new Date();

    const timeThreshold = new Date(
      currentTime.getTime() - 18 * 60 * 60 * 1000
    );

    const result = await prisma.classDistribution.updateMany({
      where: {
        isOnline: true,
        createdAt: {
          lt: timeThreshold,
        },
      },
      data: {
        isOnline: false,
      },
    });

    

    return {
      updatedCount: result.count,
      message: "Online classes auto-stopped successfully after expiry time",
    };
  } catch (error) {
    return catchError(error);
  }
};

export default autoChangeStatusOnlineClass;