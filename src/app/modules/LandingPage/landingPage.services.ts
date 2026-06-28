import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { TMission } from "./landingPage.interface";

const missionIntoDb = async (payload: TMission) => {
  try {
    const missionText = payload.mission?.trim() ?? "";

    if (!missionText) {
      await prisma.mission.deleteMany();

      return {
        success: true,
        message: "Mission content cleared successfully",
      };
    }
    const existingMission = await prisma.mission.findFirst();

    if (existingMission) {

      await prisma.mission.update({
        where: {
          id: existingMission.id,
        },
        data: {
          mission: missionText,
         
        },
      });
    } else {
      await prisma.mission.create({
        data: {
          mission: missionText,
          
        },
      });
    }

    return {
      success: true,
      message: "Mission saved successfully",
    };
  } catch (error) {
    throw catchError(error);
  }
};

const findByMissionIntoDb = async () => {
  try {
    const result = await prisma.mission.findFirst({
      select: {
        id: true,
        mission: true,
        createdAt: true, 
        updatedAt: true
      },
    });

    return result;
  } catch (error) {
    throw catchError(error);
  }
};

const   LandingPageServices= {
  missionIntoDb,
  findByMissionIntoDb
};
export default LandingPageServices