import catchError from "../errors/catchError";
import prisma from "../shared/prisma";

const autoChangeStatusOnlineClass = async () => {
  try {
    
    const EXPIRY_TIME = 36 * 60 * 60 * 1000;
    const timeThreshold = new Date(Date.now() - EXPIRY_TIME);

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

    console.log({
      updatedCount: result.count,
      message: "Online classes auto-stopped successfully after expiry time",
    })

    return {
      updatedCount: result.count,
      message: "Online classes auto-stopped successfully after expiry time",
    };
  } catch (error) {
    return catchError(error);
  }
};

export default autoChangeStatusOnlineClass;