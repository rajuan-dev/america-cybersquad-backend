import catchError from "../errors/catchError";
import prisma from "../shared/prisma";

const autoChangeStatusOnlineClass = async () => {
  try {
   const ONE_DAY = 18 * 60 * 60 * 1000;
const timeThreshold = new Date(Date.now() - ONE_DAY);

    const onlineClasses = await prisma.classDistribution.findMany({
      where: {
        isOnline: true,
        createdAt: {
          lt: timeThreshold, 
        },
      },
      select: {
        id: true,
      },
    });
    

    await prisma.classDistribution.updateMany({
      where: {
        id: {
          in: onlineClasses.map((c) => c.id),
        },
      },
      data: {
        isOnline: false,
       
      },
    });




    return {
      updatedCount: onlineClasses.length,
      message: "Online class auto-stopped after 10 minutes",
    };
  } catch (error) {
    return catchError(error);
  }
};

export default autoChangeStatusOnlineClass;
