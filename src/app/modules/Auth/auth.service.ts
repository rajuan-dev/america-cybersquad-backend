import { UserRole, UserStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";
import httpStatus from "http-status";

import ApiError from "../../../errors/ApiErrors";

import prisma from "../../../shared/prisma";
import { ISignupRequest, RequestWithFile } from "./auth.interface";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import config from "../../../config";
import { JwtPayload } from "jsonwebtoken";
import catchError from "../../../errors/catchError";
import { uploadFile } from "../../../helpars/fileUploader";

import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";
import { TUser } from "../User/user.interface";
import authConstants from "./auth.constant";

const loginUserIntoDb = async (payload: Partial<TUser>) => {
  try {
    if (!payload.email || !payload.password) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Email and password are required",
        "",
      );
    }

    let result;

    switch (payload?.role) {
      case UserRole.INSTITUTIONAL_OWNER: {
        const user = await prisma.user.findFirst({
          where: {
            email: payload.email,
            isVerified: true,
            status: UserStatus.ACTIVE,
          },
          select: {
            id: true,
            password: true,
            email: true,
            role: true,
          },
        });

        if (!user) {
          throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
        }

        if (payload.role && user.role !== payload.role) {
          throw new ApiError(
            httpStatus.FORBIDDEN,
            "Invalid role for this user",
            "",
          );
        }

        const isPasswordMatched = await bcrypt.compare(
          payload.password as string,
          user.password,
        );

        if (!isPasswordMatched) {
          throw new ApiError(httpStatus.FORBIDDEN, "Password not matched", "");
        }

        const jwtPayload = {
          id: user.id,
          role: user.role,
          email: user.email,
        };

        const accessToken = jwtHelpers.generateToken(
          jwtPayload,
          config.jwt_access_secret as string,
          config.expires_in as string,
        );

        const refreshToken = jwtHelpers.generateToken(
          jwtPayload,
          config.jwt_refresh_secret as string,
          config.refresh_expires_in as string,
        );

        result = {
          accessToken,
          refreshToken,
        };

        break;
      }
      case UserRole.ADMIN:{

        const user = await prisma.user.findFirst({
          where: {
            email: payload.email,
            isVerified: true,
            status: UserStatus.ACTIVE,
          },
          select: {
            id: true,
            password: true,
            email: true,
            role: true,
          },
        });

        if (!user) {
          throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
        }

        if (payload.role && user.role !== payload.role) {
          throw new ApiError(
            httpStatus.FORBIDDEN,
            "Invalid role for this user",
            "",
          );
        }

        const isPasswordMatched = await bcrypt.compare(
          payload.password as string,
          user.password,
        );

        if (!isPasswordMatched) {
          throw new ApiError(httpStatus.FORBIDDEN, "Password not matched", "");
        }

        const jwtPayload = {
          id: user.id,
          role: user.role,
          email: user.email,
        };

        const accessToken = jwtHelpers.generateToken(
          jwtPayload,
          config.jwt_access_secret as string,
          config.expires_in as string,
        );

        const refreshToken = jwtHelpers.generateToken(
          jwtPayload,
          config.jwt_refresh_secret as string,
          config.refresh_expires_in as string,
        );

        result = {
          accessToken,
          refreshToken,
        };

        break;
      }
      case UserRole.TEACHER: {
        const user = await prisma.teacher.findFirst({
          where: {
            email: payload.email,
            isVerified: true,
            status: UserStatus.ACTIVE,
          },
          select: {
            id: true,
            password: true,
            email: true,
            role: true,
          },
        });

        if (!user) {
          throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
        }

        if (payload.role && user.role !== payload.role) {
          throw new ApiError(
            httpStatus.FORBIDDEN,
            "Invalid role for this user",
            "",
          );
        }

        const isPasswordMatched = await bcrypt.compare(
          payload.password as string,
          user.password,
        );

        if (!isPasswordMatched) {
          throw new ApiError(httpStatus.FORBIDDEN, "Password not matched", "");
        }

        const jwtPayload = {
          id: user.id,
          role: user.role,
          email: user.email,
        };

        const accessToken = jwtHelpers.generateToken(
          jwtPayload,
          config.jwt_access_secret as string,
          config.expires_in as string,
        );

        const refreshToken = jwtHelpers.generateToken(
          jwtPayload,
          config.jwt_refresh_secret as string,
          config.refresh_expires_in as string,
        );

        result = {
          accessToken,
          refreshToken,
        };

        break;
      }

      case UserRole.STUDENT: {
        const user = await prisma.student.findFirst({
          where: {
            email: payload.email,
            isVerified: true,
            status: UserStatus.ACTIVE,
          },
          select: {
            id: true,
            password: true,
            email: true,
            role: true,
            subscriptionId: true,
          },
        });

        if (!user) {
          throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
        }

        if (payload.role && user.role !== payload.role) {
          throw new ApiError(
            httpStatus.FORBIDDEN,
            "Invalid role for this user",
            "",
          );
        }

        const isPasswordMatched = await bcrypt.compare(
          payload.password as string,
          user.password,
        );

        if (!isPasswordMatched) {
          throw new ApiError(httpStatus.FORBIDDEN, "Password not matched", "");
        }

        const jwtPayload = {
          id: user.id,
          role: user.role,
          email: user.email,
          subscriptionId: user.subscriptionId,
        };

        const accessToken = jwtHelpers.generateToken(
          jwtPayload,
          config.jwt_access_secret as string,
          config.expires_in as string,
        );

        const refreshToken = jwtHelpers.generateToken(
          jwtPayload,
          config.jwt_refresh_secret as string,
          config.refresh_expires_in as string,
        );

        result = {
          accessToken,
          refreshToken,
        };

        break;
      }
      case UserRole.parent: {
        const user = await prisma.staff.findFirst({
          where: {
            email: payload.email,
            isVerified: true,
            status: UserStatus.ACTIVE,
          },
          select: {
            id: true,
            password: true,
            email: true,
            role: true,
          },
        });

        if (!user) {
          throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
        }

        if (payload.role && user.role !== payload.role) {
          throw new ApiError(
            httpStatus.FORBIDDEN,
            "Invalid role for this user",
            "",
          );
        }

        const isPasswordMatched = await bcrypt.compare(
          payload.password as string,
          user.password,
        );

        if (!isPasswordMatched) {
          throw new ApiError(httpStatus.FORBIDDEN, "Password not matched", "");
        }

        const jwtPayload = {
          id: user.id,
          role: user.role,
          email: user.email,
        };

        const accessToken = jwtHelpers.generateToken(
          jwtPayload,
          config.jwt_access_secret as string,
          config.expires_in as string,
        );

        const refreshToken = jwtHelpers.generateToken(
          jwtPayload,
          config.jwt_refresh_secret as string,
          config.refresh_expires_in as string,
        );

        result = {
          accessToken,
          refreshToken,
        };

        break;
      }

      case UserRole.NURSE: {
        const user = await prisma.staff.findFirst({
          where: {
            email: payload.email,
            isVerified: true,
            status: UserStatus.ACTIVE,
          },
          select: {
            id: true,
            password: true,
            email: true,
            role: true,
            subscriptionId: true,
          },
        });

        if (!user) {
          throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
        }

        if (payload.role && user.role !== payload.role) {
          throw new ApiError(
            httpStatus.FORBIDDEN,
            "Invalid role for this user",
            "",
          );
        }

        const isPasswordMatched = await bcrypt.compare(
          payload.password as string,
          user.password,
        );

        if (!isPasswordMatched) {
          throw new ApiError(httpStatus.FORBIDDEN, "Password not matched", "");
        }

        const jwtPayload = {
          id: user.id,
          role: user.role,
          email: user.email,
          subscriptionId: user.subscriptionId,
        };

        const accessToken = jwtHelpers.generateToken(
          jwtPayload,
          config.jwt_access_secret as string,
          config.expires_in as string,
        );

        const refreshToken = jwtHelpers.generateToken(
          jwtPayload,
          config.jwt_refresh_secret as string,
          config.refresh_expires_in as string,
        );

        result = {
          accessToken,
          refreshToken,
        };

        break;
      }

      case UserRole.BRANCH_ADMIN: {
        const user = await prisma.branchAdmin.findFirst({
          where: {
            emailAddress: payload.email,
            isVerified: true,
            status: UserStatus.ACTIVE,
          },
          select: {
            id: true,
            password: true,
            emailAddress: true,
            role: true,
            subscriptionId: true,
          },
        });

        if (!user) {
          throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
        }

        if (payload.role && user.role !== payload.role) {
          throw new ApiError(
            httpStatus.FORBIDDEN,
            "Invalid role for this user",
            "",
          );
        }

        const isPasswordMatched = await bcrypt.compare(
          payload.password as string,
          user.password,
        );

        if (!isPasswordMatched) {
          throw new ApiError(httpStatus.FORBIDDEN, "Password not matched", "");
        }

        const jwtPayload = {
          id: user.id,
          role: user.role,
          email: user.emailAddress,
          subscriptionId: user.subscriptionId,
        };

        const accessToken = jwtHelpers.generateToken(
          jwtPayload,
          config.jwt_access_secret as string,
          config.expires_in as string,
        );

        const refreshToken = jwtHelpers.generateToken(
          jwtPayload,
          config.jwt_refresh_secret as string,
          config.refresh_expires_in as string,
        );

        result = {
          accessToken,
          refreshToken,
        };

        break;
      }

      default: {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user role", "");
      }
    }

    return result;
  } catch (error) {
    catchError(error);
    throw error;
  }
};

const refreshTokenIntoDb = async (token: string) => {
  try {
    if (!token) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "You are not authorized",
        ""
      );
    }

    const decoded = jwtHelpers.verifyToken(
      token,
      config.jwt_refresh_secret as string
    ) as JwtPayload;

    const { id, role } = decoded;

    let user: any = null;
    let email: string | null = null;

    // 🔁 Fetch user based on role
    switch (role) {
      case UserRole.INSTITUTIONAL_OWNER:
      case UserRole.ADMIN:
        user = await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            role: true,
            isVerified: true,
            status: true,
          },
        });
        email = user?.email;
        break;

      case UserRole.BRANCH_ADMIN:
        user = await prisma.branchAdmin.findUnique({
          where: { id },
          select: {
            id: true,
            emailAddress: true,
            role: true,
            isVerified: true,
            status: true,
          },
        });
        email = user?.emailAddress;
        break;

      case UserRole.STUDENT:
        user = await prisma.student.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            role: true,
            isVerified: true,
            status: true,
          },
        });
        email = user?.email;
        break;

      case UserRole.TEACHER:
        user = await prisma.teacher.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            role: true,
            isVerified: true,
            status: true,
          },
        });
        email = user?.email;
        break;

      case UserRole.NURSE:
        user = await prisma.staff.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            role: true,
            isVerified: true,
            status: true,
          },
        });
        email = user?.email;
        break;

      default:
        throw new ApiError(httpStatus.FORBIDDEN, "Invalid user role", "");
    }

    // 🔒 Shared validation logic (no repetition)
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
    }

    if (!user.isVerified) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Please verify your account",
        ""
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ApiError(httpStatus.FORBIDDEN, "User access denied", "");
    }

    // 🔐 Shared token generation
    const accessToken = jwtHelpers.generateToken(
      {
        id: user.id,
        email,
        role: user.role,
      },
      config.jwt_access_secret as string,
      config.expires_in as string
    );

    return { accessToken };
  } catch (error) {
    catchError(error);
    throw error;
  }
};

const myProfileIntoDb = async (id: string, role: string) => {
  try {
    let user: any = null;

    switch (role) {
      case UserRole.INSTITUTIONAL_OWNER:
      case UserRole.ADMIN:
        user = await prisma.user.findUnique({
          where: { id },
          select: {
            name: true,
            email: true,
            city: true,
            country: true,
            state: true,
            schoolName: true,
            isVerified: true,
            photo: true,
            role: true,
            status: true,
            createdAt: true,
          },
        });
        break;

      case UserRole.BRANCH_ADMIN:
        user = await prisma.branchAdmin.findUnique({
          where: { id },
          select: {
            fullName: true,
            emailAddress: true,
            phoneNumber: true,
            assignBranch: true,
            isVerified: true,
            photo: true,
            role: true,
            status: true,
            createdAt: true,
          },
        });
        break;

      case UserRole.STUDENT:
        user = await prisma.student.findUnique({
          where: { id },
          select: {
            name: true,
            email: true,
            branchName: true,
            className: true,
            guardianName: true,
            guardianPhone: true,
            photo: true,
            status: true,
            createdAt: true,
          },
        });
        break;

      case UserRole.TEACHER:
        user = await prisma.teacher.findUnique({
          where: { id },
          select: {
            teacherName: true,
            email: true,
            phoneNumber: true,
            branchName: true,
            subject: true,
            assignClass: true,
            teacherId: true,
            address: true,
            isVerified: true,
            photo: true,
            status: true,
            createdAt: true,
          },
        });
        break;

      case UserRole.NURSE:
        user = await prisma.staff.findUnique({
          where: { id },
          select: {
            name: true,
            email: true,
            role: true,
            phoneNumber: true,
            generateId: true,
            isVerified: true,
            photo: true,
            status: true,
            createdAt: true,
          },
        });
        break;

      default:
        throw new ApiError(httpStatus.FORBIDDEN, "Invalid user role", "");
    }

    // shared validation
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
    }

    if (!user.isVerified) {
      throw new ApiError(httpStatus.FORBIDDEN, "Please verify your account", "");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ApiError(httpStatus.FORBIDDEN, "User access denied", "");
    }

    return user;
  } catch (error) {
    catchError(error);
    throw error;
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

const changeMyProfileIntoDb = async (req: RequestWithFile, id: string, role: string) => {
  try {
    const file = req.file;

    const {
      name,
      phoneNumber,
      location,
      city,
      country,
    } = req.body as ProfileUpdatePayload;

    let updateData: any = {};

    // build dynamic update payload
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (location) updateData.location = location;
    if (city) updateData.city = city;
    if (country) updateData.country = country;

    // upload file safely
    if (file) {
      const { secure_url } = (await uploadFile.uploadToCloudinary(file)) as any;
      updateData.photo = secure_url;
    }

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "No data provided for update",
        ""
      );
    }

    let updatedUser: any;

    switch (role) {
      case UserRole.INSTITUTIONAL_OWNER:
      case UserRole.ADMIN:
        updatedUser = await prisma.user.update({
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
        break;

      case UserRole.BRANCH_ADMIN:
        updatedUser = await prisma.branchAdmin.update({
          where: { id },
          data: updateData,
          select: {
            fullName: true,
            emailAddress: true,
            phoneNumber: true,
            assignBranch: true,
            isVerified: true,
            photo: true,
            role: true,
            status: true,
            createdAt: true,
          },
        });
        break;

      case UserRole.STUDENT:
        updatedUser = await prisma.student.update({
          where: { id },
          data: updateData,
          select: {
            name: true,
            email: true,
            branchName: true,
            className: true,
            guardianName: true,
            guardianPhone: true,
            isVerified: true,
            photo: true,
            role: true,
            status: true,
            createdAt: true,
          },
        });
        break;

      case UserRole.TEACHER:
        updatedUser = await prisma.teacher.update({
          where: { id },
          data: updateData,
          select: {
            teacherName: true,
            email: true,
            phoneNumber: true,
            branchName: true,
            subject: true,
            assignClass: true,
            address: true,
            isVerified: true,
            photo: true,
            status: true,
            createdAt: true,
          },
        });
        break;

      case UserRole.NURSE:
        updatedUser = await prisma.staff.update({
          where: { id },
          data: updateData,
          select: {
            name: true,
            email: true,
            phoneNumber: true,
            role: true,
            isVerified: true,
            photo: true,
            status: true,
            createdAt: true,
          },
        });
        break;

      default:
        throw new ApiError(httpStatus.FORBIDDEN, "Invalid role", "");
    }

    if (!updatedUser) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
    }

    return {
      status: true,
      message: "Profile updated successfully",
      data: updatedUser,
    };
  } catch (error) {
    catchError(error);
    throw error;
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
        schoolName: true,
        state: true,
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
  userRole: string,
) => {
  try {
    let result: any = null;

    if (!payload.status) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Status is required", "");
    }

    const validStatuses = [
      UserStatus.ACTIVE,
      UserStatus.INACTIVE,
      UserStatus.REJECTED,
    ];

    if (!validStatuses.includes(payload.status as UserStatus)) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid status value", "");
    }

    switch (userRole) {
      case UserRole.ADMIN:
      case UserRole.INSTITUTIONAL_OWNER: {
        const user = await prisma.user.findUnique({
          where: { id, isVerified: true },
          select: { id: true },
        });

        if (!user) {
          throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
        }

        result = await prisma.user.update({
          where: { id },
          data: {
            status: payload.status as UserStatus,
          },
        });

        break;
      }

      case UserRole.BRANCH_ADMIN: {
        const user = await prisma.branchAdmin.findUnique({
          where: { id, isVerified: true },
          select: { id: true },
        });

        if (!user) {
          throw new ApiError(httpStatus.NOT_FOUND, "Branch admin not found", "");
        }

        result = await prisma.branchAdmin.update({
          where: { id },
          data: {
            status: payload.status as UserStatus,
          },
        });

        break;
      }

      case UserRole.STUDENT: {
        const user = await prisma.student.findUnique({
          where: { id },
          select: { id: true },
        });

        if (!user) {
          throw new ApiError(httpStatus.NOT_FOUND, "Student not found", "");
        }

        result = await prisma.student.update({
          where: { id },
          data: {
            status: payload.status as UserStatus,
          },
        });

        break;
      }

      case UserRole.TEACHER: {
        const user = await prisma.teacher.findUnique({
          where: { id },
          select: { id: true },
        });

        if (!user) {
          throw new ApiError(httpStatus.NOT_FOUND, "Teacher not found", "");
        }

        result = await prisma.teacher.update({
          where: { id },
          data: {
            status: payload.status as UserStatus,
          },
        });

        break;
      }

      case  UserRole.NURSE: {
        const user = await prisma.staff.findUnique({
          where: { id },
          select: { id: true },
        });

        if (!user) {
          throw new ApiError(httpStatus.NOT_FOUND, "Staff not found", "");
        }

        result = await prisma.staff.update({
          where: { id },
          data: {
            status: payload.status as UserStatus,
          },
        });

        break;
      }

        case  UserRole.parent: {
        const user = await prisma.staff.findUnique({
          where: { id },
          select: { id: true },
        });

        if (!user) {
          throw new ApiError(httpStatus.NOT_FOUND, "Staff not found", "");
        }

        result = await prisma.staff.update({
          where: { id },
          data: {
            status: payload.status as UserStatus,
          },
        });

        break;
      }


      default: {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "Invalid role for blocking operation",
          "",
        );
      }
    }

    return {
      success: true,
      message: `User account ${
        payload.status === UserStatus.INACTIVE ? "blocked" : "activated"
      } successfully`,
      data: result,
    };
  } catch (error: unknown) {
    catchError(error, "Block account operation failed");
    throw error;
  }
};
const deleteAccountIntoDb = async (userId: string) => {
  try {
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
  } catch (error: unknown) {
    catchError(error);
  }
};

const socialLogin = async (payload: any) => {
  return payload;
};

// website login before booking
const loginWebsite = async (payload: ISignupRequest) => {
  return payload;
};

// change password
const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
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
    userData.password,
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
  findByAllUsersAdminIntoDb,
};
