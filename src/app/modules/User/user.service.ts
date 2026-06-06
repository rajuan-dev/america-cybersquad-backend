import * as bcrypt from "bcrypt";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import config from "../../../config";
import { generateOtp } from "../../../utils/generateOtp";
import sendEmail from "../../../utils/sendEmail";
import emailContext from "../../../utils/emailcontext/sendvarificationData";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import { UserRole, UserStatus } from "@prisma/client";
import { TUser } from "./user.interface";
import { collaborateDatabase, collaborateVerificationDatabase } from "../../../utils/collaborateDatabase";

const createUserIntoDb = async (payload: TUser) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ApiError(httpStatus.CONFLICT, "User already exists");
    }

    const verificationCode = Number(generateOtp());

    const hashedPassword = await bcrypt.hash(
      payload.password,
      Number(config.bcrypt_salt_rounds),
    );

    const user = await prisma.user.create({
      data: {
        ...payload,
        password: hashedPassword,
        verificationCode,
        isVerified: false,
      },
    });

    await sendEmail(
      user.email,
      emailContext.sendVerificationData(
        user.email,
        verificationCode,
        "User Verification Email",
      ),
      "Verification OTP Code",
    );

    return {
      status: true,
      message: "Check your email",
    };
  } catch (error) {
    throw catchError(error);
  }
};

const userVerificationIntoDb = async (verificationCode: number) => {
  try {
    if (!verificationCode) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Verification code is required",
        "",
      );
    }

    return verificationCode

    // const user = await prisma.user.update({
    //   where: { verificationCode },
    //   data: { isVerified: true },
    //   select: {
    //     id: true,
    //     role: true,
    //     email: true,
    //     isVerified: true,
    //   },
    // });

    // if (!user || !user.isVerified) {
    //   throw new ApiError(
    //     httpStatus.SERVICE_UNAVAILABLE,
    //     "Verification failed after update",
    //     "",
    //   );
    // }

    // const jwtPayload = {
    //   id: user.id,
    //   role: user.role,
    //   email: user.email,
    // };

    // const accessToken = jwtHelpers.generateToken(
    //   jwtPayload,
    //   config.jwt_access_secret as string,
    //   config.expires_in as string,
    // );

    // return {
    //   message: "User verification successful",
    //   accessToken,
    // };
  } catch (error) {
    catchError(error);
  }
};

const changePasswordIntoDb = async (
  payload: { oldpassword: string; newpassword: string },
  id: string,
  role: string,
) => {
  try {
    let user: any = null;

    switch (role) {
      case UserRole.INSTITUTIONAL_OWNER:
      case UserRole.ADMIN: {
        user = await prisma.user.findFirst({
          where: {
            id,
            isVerified: true,
            status: UserStatus.ACTIVE,
          },
          select: {
            password: true,
          },
        });
        break;
      }

      case UserRole.BRANCH_ADMIN: {
        user = await prisma.branchAdmin.findFirst({
          where: {
            id,
            isVerified: true,
            status: UserStatus.ACTIVE,
          },
          select: {
            password: true,
          },
        });
        break;
      }

      case UserRole.STUDENT: {
        user = await prisma.student.findFirst({
          where: {
            id,
            isVerified: true,
            status: UserStatus.ACTIVE,
          },
          select: {
            password: true,
          },
        });
        break;
      }

      case UserRole.TEACHER: {
        user = await prisma.teacher.findFirst({
          where: {
            id,
            isVerified: true,
            status: UserStatus.ACTIVE,
          },
          select: {
            password: true,
          },
        });
        break;
      }
      case UserRole.parent:
      case UserRole.NURSE: {
        user = await prisma.staff.findFirst({
          where: {
            id,
            isVerified: true,
            status: UserStatus.ACTIVE,
          },
          select: {
            password: true,
          },
        });
        break;
      }

      default: {
        throw new ApiError(httpStatus.FORBIDDEN, "Invalid user role", "");
      }
    }
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
    }

    // 2️⃣ Check old password
    const isMatch = await bcrypt.compare(payload.oldpassword, user.password);

    if (!isMatch) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "Old password does not match",
        "",
      );
    }


    const hashedPassword = await bcrypt.hash(
      payload.newpassword,
      Number(config.bcrypt_salt_rounds),
    );


    switch (role) {
      case UserRole.INSTITUTIONAL_OWNER:
      case UserRole.ADMIN:
        await prisma.user.update({
          where: { id },
          data: { password: hashedPassword },
        });
        break;

      case UserRole.BRANCH_ADMIN:
        await prisma.branchAdmin.update({
          where: { id },
          data: { password: hashedPassword },
        });
        break;

      case UserRole.STUDENT:
        await prisma.student.update({
          where: { id },
          data: { password: hashedPassword },
        });
        break;

      case UserRole.TEACHER:
        await prisma.teacher.update({
          where: { id },
          data: { password: hashedPassword },
        });
        break;

      case UserRole.parent:
      case UserRole.NURSE:
        await prisma.staff.update({
          where: { id },
          data: { password: hashedPassword },
        });
        break;

      default:
        throw new ApiError(httpStatus.FORBIDDEN, "Invalid user role", "");
    }

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    catchError(error);
    throw error;
  }
};

const forgotPasswordIntoDb = async (
  payload: string | { email: string }
) => {
  try {
    // 1️⃣ Normalize email
    let emailString: string;

    if (typeof payload === "string") {
      emailString = payload;
    } else if (payload && typeof payload === "object" && "email" in payload) {
      emailString = payload.email;
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid email format", "");
    }

    const isExistUser = await collaborateDatabase(emailString) as any;
    const otp = Number(generateOtp());
    let updatedUser: any;
    switch (isExistUser.role) {
      case UserRole.INSTITUTIONAL_OWNER:
      case UserRole.ADMIN: {
        updatedUser = await prisma.user.update({
          where: { id: isExistUser.id },
          data: {
            verificationCode: otp,
          },
          select: {
            id: true,
            email: true,
          },
        });
        break;
      }

      case UserRole.BRANCH_ADMIN: {
        updatedUser = await prisma.branchAdmin.update({
          where: { id: isExistUser.id },
          data: {
            verificationCode: otp,
          },
          select: {
            id: true,
            emailAddress: true,
          },
        });
        break;
      }

      case UserRole.STUDENT: {
        updatedUser = await prisma.student.update({
          where: { id: isExistUser.id },
          data: {
            verificationCode: otp,
          },
          select: {
            id: true,
            email: true,
          },
        });
        break;
      }

      case UserRole.TEACHER: {
        updatedUser = await prisma.teacher.update({
          where: { id: isExistUser.id },
          data: {
            verificationCode: otp,
          },
          select: {
            id: true,
            email: true,
          },
        });
        break;
      }

  
      case UserRole.parent:
      case UserRole.NURSE: {
        updatedUser = await prisma.staff.update({
          where: { id: isExistUser.id },
          data: {
            verificationCode: otp,
          },
          select: {
            id: true,
            email: true,
          },
        });
        break;
      }

      default: {
        throw new ApiError(httpStatus.FORBIDDEN, "Invalid user role", "");
      }
    }

    // 5️⃣ Safety check
    if (!updatedUser) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Failed to update OTP",
        ""
      );
    }

    // 6️⃣ Send email (safe email selection)
    const userEmail =
      isExistUser.email || isExistUser.emailAddress;

    await sendEmail(
      userEmail,
      emailContext.sendVerificationData(
        userEmail,
        otp,
        "User Verification Email"
      ),
      "Verification OTP Code"
    );

    // 7️⃣ Response
    return {
      success: true,
      message: "OTP sent successfully",
      data: updatedUser,
    };
  } catch (error) {
    catchError(error);
    throw error;
  }
};
const verificationForgotUserIntoDb = async (
  otp: number | { verificationCode: number },
) => {
  try {
    let code: number;

    if (typeof otp === "object" && typeof otp.verificationCode === "number") {
      code = otp.verificationCode;
    } else if (typeof otp === "number") {
      code = otp;
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP format", "");
    }

    const isExistOtp=await collaborateVerificationDatabase(code)

    if (!isExistOtp) {
      throw new ApiError(httpStatus.NOT_FOUND, "OTP not found", "");
    }

   

    const updatedAt =
      isExistOtp.updatedAt instanceof Date
        ? isExistOtp.updatedAt.getTime()
        : new Date(isExistOtp.updatedAt).getTime();

    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;

    if (now - updatedAt > FIVE_MINUTES) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "OTP has expired. Please request a new one.",
        "",
      );
    }

    const jwtPayload = {
      id: isExistOtp.id,
      role: isExistOtp.role,
      email: isExistOtp.email,
    };

    const accessToken = jwtHelpers.generateToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.expires_in as string,
    );

    await prisma.user.update({
      where: { id: isExistOtp.id },
      data: { verificationCode: null }, 
    });

    return accessToken;
  } catch (error) {
    catchError(error);
  }
};

const resetPasswordIntoDb = async (payload: {
  userId: string;
  password: string;
}) => {
  try {
    const isExistUser = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        isVerified: true,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
      },
    });

    if (!isExistUser) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "some issues by the reset password section",
        "",
      );
    }

    payload.password = await bcrypt.hash(
      payload.password,
      Number(config.bcrypt_salt_rounds),
    );

    const result = await prisma.user.update({
      where: {
        id: isExistUser.id,
      },
      data: {
        password: payload.password,
      },
    });

    return result && { status: true, message: "successfully reset password" };
  } catch (error: any) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "server unavailable reset password into db function",
      error,
    );
  }
};

const getUserGrowthIntoDb = async (query: { year?: string }) => {
  try {
    const year = query.year ? parseInt(query.year) : new Date().getFullYear();
    const previousYear = year - 1;

    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    const startOfPrevYear = new Date(`${previousYear}-01-01T00:00:00.000Z`);
    const endOfPrevYear = new Date(`${previousYear}-12-31T23:59:59.999Z`);

    const currentYearUsers = await prisma.user.findMany({
      where: {
        isVerified: true,
        status: UserStatus.ACTIVE,
        createdAt: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      select: {
        createdAt: true,
      },
    });

    const previousYearTotal = await prisma.user.count({
      where: {
        isVerified: true,
        status: UserStatus.ACTIVE,
        createdAt: {
          gte: startOfPrevYear,
          lte: endOfPrevYear,
        },
      },
    });

    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
      year,
      month: i + 1,
      count: 0,
    }));

    currentYearUsers.forEach((user) => {
      const month = new Date(user.createdAt).getMonth();
      monthlyStats[month].count += 1;
    });

    const currentYearTotal = currentYearUsers.length;

    let yearlyGrowth = 0;

    if (previousYearTotal > 0) {
      yearlyGrowth =
        ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100;
    } else if (currentYearTotal > 0) {
      yearlyGrowth = 100;
    }

    return {
      monthlyStats,
      yearlyGrowth: parseFloat(yearlyGrowth.toFixed(2)),
      year,
    };
  } catch (error) {
    catchError(error);
  }
};

const resendVerificationOtpIntoDb = async (email: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        isVerified: true,
      },
    });

    if (!user) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "This user does not exist in our database.",
      );
    }

    if (user?.isVerified) {
      return {
        status: false,
        message: "This user is already verified.",
      };
    }

    const otp = Number(generateOtp());

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        verificationCode: otp,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!updatedUser) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to update verification code.",
      );
    }

    await sendEmail(
      email,
      emailContext.sendVerificationData(email, otp, "User Verification Email"),
      "Verification OTP Code",
    );

    return { status: true, message: "successfully send email" };
  } catch (error) {
    catchError(error);
  }
};

const UserService = {
  createUserIntoDb,
  userVerificationIntoDb,
  changePasswordIntoDb,
  forgotPasswordIntoDb,
  verificationForgotUserIntoDb,
  resetPasswordIntoDb,
  getUserGrowthIntoDb,
  resendVerificationOtpIntoDb,
};

export default UserService;
