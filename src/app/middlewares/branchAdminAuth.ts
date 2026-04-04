import { NextFunction, Request, Response } from "express";
import { Secret } from "jsonwebtoken";
import config from "../../config";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiErrors";
import { jwtHelpers } from "../../helpars/jwtHelpers";
import prisma from "../../shared/prisma";

const branchAdminAuth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization;
      // console.log(token,"check token")

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

    
      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt_access_secret as Secret
      ) as {
        id: string;
        email: string;
        role: string;
      };

    
      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
      }


      const user = await prisma.branchAdmin.findUnique({
        where: {
          id: verifiedUser.id,
        },
        select: {
          id: true,
          emailAddress: true,
          role: true,
          
        },
      });

    


      if (!user) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "Branch admin not found"
        );
      }

      // ✅ 5. Attach user info
      req.user = user;

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default branchAdminAuth;