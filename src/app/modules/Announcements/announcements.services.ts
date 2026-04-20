import { Secret } from "jsonwebtoken";
import config from "../../../config";
import catchError from "../../../errors/catchError";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import { TAnnouncements } from "./announcements.interface";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { getSocketIO } from "../../../socket/connectSocket";
import prisma from "../../../shared/prisma";


const sendAnnouncementsIntoDb = async (
  payload: TAnnouncements,
  token: string
) :Promise<{success:true , message:string}>=> {
  try {
    let verifiedUser;
    try {
      verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt_access_secret as Secret
      ) as {
        id: string;
        email: string;
        role: string;
        iat: number;
        exp: number;
      };
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Token expired");
      }
      if (error.name === "JsonWebTokenError") {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
      }
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized access");
    }

    const { isDelete, title, description, audience } = payload;

    const shortMsg =
      description.length > 20
        ? description.slice(0, 20) + "..."
        : description;

    let result;

    switch (verifiedUser.role) {
      case "BRANCH_ADMIN": {
        result = await prisma.$transaction(async (tx) => {
          const announcement = await tx.announcement.create({
            data: {
              title,
              description,
              audience,
              isDelete: isDelete ?? false,
              branchAdminId: verifiedUser.id,
            },
          });

          await tx.notification.create({
            data: {
              title,
              message: shortMsg,
              branchAdminId: verifiedUser.id,
            },
          });

          return announcement;
        });

        break;
      }

      case "INSTITUTIONAL_OWNER":
      case "SUPER_ADMIN":
      case "ADMIN": {
        result = await prisma.$transaction(async (tx) => {
          const announcement = await tx.announcement.create({
            data: {
              title,
              description,
              audience,
              isDelete: isDelete ?? false,
              userId: verifiedUser.id,
            },
          });

          await tx.notification.create({
            data: {
              title,
              message: shortMsg,
              userId: verifiedUser.id,
            },
          });

          return announcement;
        });

        break;
      }

      case "TEACHER": {
        result = await prisma.$transaction(async (tx) => {
          const announcement = await tx.announcement.create({
            data: {
              title,
              description,
              audience,
              isDelete: isDelete ?? false,
              teacherId: verifiedUser.id,
            },
          });

          await tx.notification.create({
            data: {
              title,
              message: shortMsg,
              teacherId: verifiedUser.id,
            },
          });

          return announcement;
        });

        break;
      }

      case "STUDENT": {
        result = await prisma.$transaction(async (tx) => {
          const announcement = await tx.announcement.create({
            data: {
              title,
              description,
              audience,
              isDelete: isDelete ?? false,
              studentId: verifiedUser.id,
            },
          });

          await tx.notification.create({
            data: {
              title,
              message: shortMsg,
              studentId: verifiedUser.id,
            },
          });

          return announcement;
        });

        break;
      }

      default:
        throw new ApiError(httpStatus.FORBIDDEN, "Role not allowed");
    }


    const io = getSocketIO() as any;

    audience.forEach((v) => {
      const role = v.trim().toUpperCase();

      io.emit(`notification::${role}`, {
        id: Date.now(),
        title,
        message: description,
        createdBy: verifiedUser.role,
        timestamp: new Date().toISOString(),
      });
    });

    return {
      success: true,
      message: "Successfully sent the announcements"
      
    };
  } catch (error) {
    return catchError(error);
  }
};

const AnnouncementsServices={
    sendAnnouncementsIntoDb
};

export default  AnnouncementsServices;

