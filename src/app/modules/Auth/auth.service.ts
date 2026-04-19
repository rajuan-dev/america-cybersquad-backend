import { UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import httpStatus from "http-status";

import ApiError from "../../../errors/ApiErrors";

import prisma from "../../../shared/prisma";
import {
  ISignupRequest,
  RequestWithFile,
} from "./auth.interface";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import config from "../../../config";
import { JwtPayload } from "jsonwebtoken";
import catchError from "../../../errors/catchError";
import { uploadFile } from "../../../helpars/fileUploader";

import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";
import { TUser } from "../User/user.interface";
import authConstants from "./auth.constant";

const loginUserIntoDb = async (payload: {
  email: string;
  password: string;
}) => {
  try {
    const result = await prisma.$transaction(async (tx) => {

      const isUserExist = await tx.user.findFirst({
        where: {
          email: payload.email,
          isVerified: true,
          status: UserStatus.ACTIVE
        },
        select: {
          id: true,
          password: true,
          isVerified: true,
          email: true,
          role: true,
        },
      });

      if (!isUserExist) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
      }

      const isPasswordMatched = await bcrypt.compare(
        payload.password,
        isUserExist.password
      );

      if (!isPasswordMatched) {
        throw new ApiError(httpStatus.FORBIDDEN, "Password not matched", "");
      }

      const jwtPayload = {
        id: isUserExist.id,
        role: isUserExist.role,
        email: isUserExist.email,
      };

      const accessToken = jwtHelpers.generateToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.expires_in as string
      );

      const refreshToken = jwtHelpers.generateToken(
        jwtPayload,
        config.jwt_refresh_secret as string,
        config.refresh_expires_in as string
      );

      return {
        accessToken,
        refreshToken,
      };
    });

    return result;

  } catch (error) {
    catchError(error);
    throw error;
  }
};


const refreshTokenIntoDb = async (token: string) => {
  try {
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized", "");
    }

    const decoded = jwtHelpers.verifyToken(
      token,
      config.jwt_refresh_secret as string
    ) as JwtPayload;

    const { id } = decoded;
    const isUserExist = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        status: true,
      },
    });

    if (!isUserExist) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
    }

    if (
      !isUserExist.isVerified||
      
      isUserExist.status !==UserStatus.ACTIVE
    ) {
      throw new ApiError(httpStatus.FORBIDDEN, "User access denied", "");
    }

    const jwtPayload = {
      id: isUserExist.id,
      email: isUserExist.email,
      role: isUserExist.role,
    };

    const accessToken = jwtHelpers.generateToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.expires_in as string
    );

    return {
      accessToken,
    };
  } catch (error) {
    catchError(error);
   
  }
};


const myProfileIntoDb = async (id: string) => {
  try {
     const user = await prisma.user.findUnique({
      where: { id },
      select: {
        name: true,
        email: true,
        city: true,
        country: true,
        isVerified: true,
        photo: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
    }

    return user;
  } catch (error) {
    catchError(error);
  }
};


interface ProfileUpdatePayload {
  name?: string;
  phoneNumber?: string;
  location?: string;
  city?: string;
  country?: string;
  photo?: string; // URL or file path
}

interface ProfileUpdateResponse {
  name: string;
  email: string;
  city?: string;
  country?: string;
  isVerified: boolean;
  photo?: string;
  role: string;
  status: string;
  createdAt: Date;
}

const changeMyProfileIntoDb = async (
  req: RequestWithFile,
  id: string
) => {
  try {
    const file = req.file;
    const { name, phoneNumber, location, city, country } =
      req.body as ProfileUpdatePayload;

    // Build dynamic update data
    const updateData: ProfileUpdatePayload = {
      ...(name && { name }),
      ...(phoneNumber && { phoneNumber }),
      ...(location && { location }),
      ...(city && { city }),
      ...(country && { country }),
      ...(file && { photo: file.path }), 
    };
   const { secure_url }=await uploadFile.uploadToCloudinary(file ) as any;;
     updateData.photo=  secure_url;


    if (Object.keys(updateData).length === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "No data provided for update",
        ""
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        name: true,
        email: true,
        city: true,
        country: true,
        isVerified: true,
        photo: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!updatedUser) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
    }
    return {
       status:true,
       message:"Profile updated successfully"
      
    }

   
  } catch (error: unknown) {
    catchError(error);
  }
};


const findByAllUsersAdminIntoDb = async (query: Record<string, unknown>) => {
  try {
    const queryBuilder = new PrismaQueryBuilder(query)
      .search(authConstants.searchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

  
    const { owner, typeOfOwner, branches } = query;

    // ✅ Build relation filter
    const questionFilter: any = {};

    if (owner !== undefined) {
      questionFilter.owner = owner === "true";
    }

    if (typeOfOwner) {
      questionFilter.typeOfOwner = typeOfOwner;
    }

    if (branches) {
      questionFilter.branches = Number(branches);
    }

    const result = await prisma.user.findMany({
      where: {
        ...queryOptions.where,

        // ✅ relation filter
        ...(Object.keys(questionFilter).length > 0 && {
          questions: {
            is: questionFilter, // ⚠️ use `is` for one-to-one
          },
        }),
      },

      orderBy: queryOptions.orderBy,
      skip: queryOptions.skip,
      take: queryOptions.take,

      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        country: true,
        city: true,
        schoolName:true ,
        state:true,
        role: true,
        status: true,
        isVerified: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
       branches: true,
      },
    });

    const total = await prisma.user.count({
      where: {
        ...queryOptions.where,
        ...(Object.keys(questionFilter).length > 0 && {
          questions: {
            is: questionFilter,
          },
        }),
      },
    });

    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      meta: {
        page,
        limit,
        total,
        totalPage,
      },
      data: result,
    };
  } catch (error: unknown) {
    throw error;
  }
};


const isBlockAccountIntoDb = async (
  id: string,
  payload: Partial<TUser>,
  userRole: string
) => {
  try {
    // ✅ Only admin can block/unblock
    if (userRole !== "ADMIN") {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Only administrators can block/unblock accounts",
        ""
      );
    }

    if (!payload.status) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Status is required",
        ""
      );
    }

    // ✅ Validate status
    const validStatuses = [
      UserStatus.ACTIVE,
      UserStatus.INACTIVE,
      UserStatus.REJECTED
    ];

    if (!validStatuses.includes(payload.status as UserStatus)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid status value",
        ""
      );
    }

    const user = await prisma.user.findUnique({
      where: { id,isVerified:true },
      select: { id: true }
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
    }


    const result = await prisma.user.update({
      where: { id, },
      data: {
        status: payload.status as UserStatus
      }
    });

    return {
      success: true,
      message: `User account ${
        payload.status === UserStatus.INACTIVE ? "blocked" : "activated"
      } successfully`
    
    };

  } catch (error: unknown) {
    catchError(error, "Block account operation failed");
  }
};

const  deleteAccountIntoDb =async(userId:string) =>{
  try{

      return userId;

      //  const result = await prisma.user.delete({
      //   where:{
      //     id:userId
      //   }
      //  });

      //  if(!result){
      //   throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
      //  }

      //  return result;

  }
  catch(error:unknown){
     catchError(error);
  }
};
  




const socialLogin = async (payload: any) => {
    return payload
};

// website login before booking
const loginWebsite = async (payload: ISignupRequest) => {
   return payload
};



// change password
const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: userId,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      password: true,
    },
  });
  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const isPasswordMatch: boolean = await bcrypt.compare(
    oldPassword,
    userData.password
  );
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: "Password changed successfully",
  };
};



export const AuthServices = {
 loginUserIntoDb,
 refreshTokenIntoDb,
  myProfileIntoDb,
  changeMyProfileIntoDb,
  deleteAccountIntoDb,
  isBlockAccountIntoDb,
  socialLogin,
  loginWebsite,
  changePassword,
  findByAllUsersAdminIntoDb
};
