import { Secret } from "jsonwebtoken";
import config from "../../../config";
import catchError from "../../../errors/catchError";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import { TAnnouncements } from "./announcements.interface";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { getSocketIO } from "../../../socket/connectSocket";


const sendAnnouncementsIntoDb = async (
  payload: TAnnouncements,
  token: string
) => {
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
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Token expired. Please login again."
        );
      }

      if (error.name === "JsonWebTokenError") {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token.");
      }

      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized access.");
    }

    const io = getSocketIO() as any;

    payload.audience.forEach((v) => {
      const role = v.trim();

      io.emit(`notification::${role}`, {
        id: Date.now(),
        title: payload.title,
        message: payload.description,
        timestamp: new Date().toISOString(),
      });
    });

    return {
      payload,
      verifiedUser,
    };
  } catch (error) {
    return catchError(error);
  }
};


const AnnouncementsServices={
    sendAnnouncementsIntoDb
};

export default  AnnouncementsServices;

