import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { TMission, TTeam, TVision } from "./landingPage.interface";
import PrismaRelationQueryBuilder from "../../builder/PrismaQueryBuilder";

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


const visionIntoDb = async (payload: TVision) => {
  try {
    const visionText = payload.vision?.trim() ?? "";

    if (!visionText) {
      await prisma.vision.deleteMany();

      return {
        success: true,
        message: "Vision content cleared successfully",
      };
    }

    const existingVision = await prisma.vision.findFirst();

    if (existingVision) {
      await prisma.vision.update({
        where: {
          id: existingVision.id,
        },
        data: {
          vision: visionText,
        },
      });
    } else {
      await prisma.vision.create({
        data: {
          vision: visionText,
        },
      });
    }

    return {
      success: true,
      message: "Vision saved successfully",
    };
  } catch (error) {
    throw catchError(error);
  }
};

const findByVisionIntoDb = async () => {
  try {
    const result = await prisma.vision.findFirst({
      select: {
        id: true,
        vision: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return result;
  } catch (error) {
    throw catchError(error);
  }
};

const createTeamIntoDb=async(payload: TTeam)=>{

   try{

      const result=await prisma.team.create({
        data: payload
      });
      if(!result){
        throw new ApiError(httpStatus.NOT_EXTENDED, "ISSUES BY THE TEAM SECTION", "")
      }
      return {
        success: true ,
        message:"successfully create a team"
      }

   }
catch (error) {
    throw catchError(error);
  }
   
};

const findByAllTeamsIntoDb = async (
  query: Record<string, unknown>
) => {
  try {
    const queryBuilder = new PrismaRelationQueryBuilder(query)
      .search(["name", "designation"])
      .filter()
      .sort()
      .paginate()
      .fields();

    const { where, orderBy, skip, take, select } = queryBuilder.build();

    const [result, total] = await Promise.all([
      prisma.team.findMany({
        where,
        orderBy,
        skip,
        take,
        ...(select ? { select } : {}),
      }),

      prisma.team.count({
        where,
      }),
    ]);

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    return {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      result,
    };
  } catch (error) {
    throw catchError(error);
  }
};

const findBySpecificTeamIntoDb=async(id: string)=>{

   try{

     const result=await prisma.team.findFirst({where:{id}});
     return result

   }
   catch (error) {
    throw catchError(error);
  }
};

const updateTeamIntoDb = async (
  id: string,
  payload: Partial<TTeam>
) => {
  try {
    const team = await prisma.team.findUnique({
      where: {
        id,
      },
    });

    if (!team) {
      throw new ApiError(httpStatus.NOT_FOUND, "Team Not Found");
    }

    // Remove undefined fields
    const updateData = Object.fromEntries(
      Object.entries(payload).filter(
        ([_, value]) => value !== undefined
      )
    );

    const result = await prisma.team.update({
      where: {
        id,
      },
      data: updateData,
    });

    return result;
  } catch (error) {
    throw catchError(error);
  }
};

const deleteTeamIntoDb = async (id: string) => {
  try {
    // Check if team exists
    const team = await prisma.team.findUnique({
      where: {
        id,
      },
    });

    if (!team) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Team not found"
      );
    }

    // Delete team
    const result = await prisma.team.delete({
      where: {
        id,
      },
    });

    return result;
  } catch (error) {
    throw catchError(error);
  }
};


const createFaqIntoDb = async (
  payload: {
    question: string;
    answer: string;
  }
) => {
  try {
   

    const result = await prisma.fAQ.create({
      data: {
        question: payload.question,
        answer: payload.answer,
        isDelete: false,
      },
    });

    return result;
  } catch (error) {
    throw catchError(error);
  }
};

const findByAllFAQIntoDb = async (
  query: Record<string, unknown>
) => {
  try {
    const queryBuilder = new PrismaRelationQueryBuilder(query)
      .search([])
      .filter()
      .sort()
      .paginate()
      .fields();

    const { where, orderBy, skip, take, select } = queryBuilder.build();

    const [result, total] = await Promise.all([
      prisma.fAQ.findMany({
        where,
        orderBy,
        skip,
        take,
        ...(select ? { select } : {}),
      }),

      prisma.fAQ.count({
        where,
      }),
    ]);

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    return {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      result,
    };
  } catch (error) {
    throw catchError(error);
  }
};




const   LandingPageServices= {
  missionIntoDb,
  findByMissionIntoDb,
  visionIntoDb, 
  findByVisionIntoDb,
  createTeamIntoDb,
  findByAllTeamsIntoDb,
  findBySpecificTeamIntoDb,
  updateTeamIntoDb,
  deleteTeamIntoDb,
  createFaqIntoDb,
  findByAllFAQIntoDb

};
export default LandingPageServices