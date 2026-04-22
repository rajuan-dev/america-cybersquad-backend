import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { TBranchAdmin } from "./branch_management.interface";
import bcrypt from "bcrypt";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";
import branchManagementConstants from "./branch_management.constant";
import { JwtPayload } from "jsonwebtoken";
import { generateOtp } from "../../../utils/generateOtp";
import sendEmail from "../../../utils/sendEmail";
import emailContext from "../../../utils/emailcontext/sendvarificationData";

const create_branch_admin_IntoDb = async (
  userId: string,
  payload: TBranchAdmin
) => {
  try {
    const {
      fullName,
      phoneNumber,
      emailAddress,
      password,
      role,
      joinDate,
      assignBranch,
    } = payload;
    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.bcrypt_salt_rounds)
    );

    // ⚡ Parallel duplicate checks
    const [ branchExists] = await Promise.all([
     
      prisma.branchAdmin.findUnique({ where: { assignBranch } }),
    ]);


    if (branchExists) {
      throw new ApiError(httpStatus.CONFLICT, "Branch already assigned");
    }

  
    const result = await prisma.branchAdmin.create({
      data: {
        fullName,
        phoneNumber,
        emailAddress,
        password: hashedPassword,
        joinDate: new Date(joinDate),
        assignBranch,
        role,
        userId,
      },
    });

    if(!result){
        throw new ApiError(httpStatus.NOT_EXTENDED, 'issues by the branch admin recorded section ')
    }

    return {
      status: true,
      message: "Branch admin created successfully"
    };
  } catch (error) {
    return catchError(error);
  }
};

const findSubscriptionBranchByIdIntoDb = async (
  userId: string,
  subscriptionId: string
) => {
  try {
    const result = await prisma.subscriptions.findUnique({
      where: {
        id: subscriptionId,
        userId,
      },
      select: {
        id: true,
        price: true,

        subscriptiondetails: {
          select: {
            id: true,
            subscriptionType: true
            
          },
        },
      },
    });

    if (!result) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Subscription not found or unauthorized"
      );
    }

    return {
      status: true,
      message: "Subscription fetched successfully",
      data: result,
    };
  } catch (error) {
    catchError(error);

    return {
      status: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch subscription",
    };
  }
};


const login_branch_admin_IntoDb = async (payload: { emailAddress: string; password: string }) => {


  try {
    const { emailAddress, password } = payload; 

   const branchAdmin = await prisma.branchAdmin.findUnique({
      where: { emailAddress },
      select: {
        id: true,
        role: true,
        emailAddress: true,
        password: true,
        
      }
    });

    if (!branchAdmin) {
      throw new ApiError(httpStatus.NOT_FOUND, "Branch admin not found");
    };

    const isPasswordMatched = await bcrypt.compare(
        password,
        branchAdmin.password
      );

      if (!isPasswordMatched) {
        throw new ApiError(httpStatus.FORBIDDEN, "Password not matched", "");
      }

      const jwtPayload = {
        id: branchAdmin.id,
        role: branchAdmin.role,
        email: branchAdmin.emailAddress,
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

  } catch (error) {
    return catchError(error);
  }};


const findByAllBranchIntoDb = async (
  userId: string,
  query: Record<string, unknown>
) => {
  try {
    const queryBuilder = new PrismaQueryBuilder(query)
      .search(branchManagementConstants.searchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    // 👉 custom filters
    const { joinDateFrom, joinDateTo, branchName } = query;

    const extraFilter: any = {};

    // ✅ branch filter
    if (branchName) {
      extraFilter.assignBranch = {
        contains: String(branchName),
        mode: "insensitive",
      };
    }

    // ✅ join date range filter
    if (joinDateFrom || joinDateTo) {
      extraFilter.joinDate = {};

      if (joinDateFrom) {
        extraFilter.joinDate.gte = new Date(joinDateFrom as string);
      }

      if (joinDateTo) {
        extraFilter.joinDate.lte = new Date(joinDateTo as string);
      }
    }

    // ✅ FINAL WHERE
    const whereCondition = {
      ...queryOptions.where,
      userId: userId,
      ...extraFilter,
    };

    // ✅ DATA QUERY
    const result = await prisma.branchAdmin.findMany({
      where: whereCondition,
      orderBy: queryOptions.orderBy,
      skip: queryOptions.skip,
      take: queryOptions.take,

      select: queryOptions.select || {
        id: true,
        fullName: true,
        phoneNumber: true,
        emailAddress: true,
        role: true,
        joinDate: true,
        assignBranch: true,
        createdAt: true,
        updatedAt: true

      },
    });

    // ✅ TOTAL COUNT
    const total = await prisma.branchAdmin.count({
      where: whereCondition,
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
  } catch (error) {
    return catchError(error);
  }
};

const updateByBranchAdminIntoDb = async (
  id: string,
  payload: Partial<TBranchAdmin>,
  userId: string
): Promise<{ status: boolean; message: string }> => {
  try {
    // 🔍 Step 1: Check ownership + existence
    const existingBranchAdmin = await prisma.branchAdmin.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingBranchAdmin) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Branch admin not found or unauthorized"
      );
    }

    const updatedPayload: Partial<TBranchAdmin> = { ...payload };

    if (updatedPayload.joinDate) {
      updatedPayload.joinDate = new Date(
        updatedPayload.joinDate
      );
    }

    await prisma.branchAdmin.update({
      where: {
        id
      },
      data: updatedPayload,
    });

  
    return {
      status: true,
      message: "Branch admin updated successfully",
    };
  } catch (error) {
    return catchError(error);
  }
};



const deleteBranchAdminIntoDb = async (id: string, userId: string) : Promise<{ status: boolean; message: string }> => {
  try {
    const existingBranchAdmin = await prisma.branchAdmin.findFirst({  where: { id, userId }, select: { id: true } }); 

    if (!existingBranchAdmin) {
      throw new ApiError(httpStatus.NOT_FOUND, "Branch admin not found or unauthorized");
    } 
    await prisma.branchAdmin.delete({ where: { id } });

    return { 
      status: true,
      message: "Branch admin deleted successfully",
    };
  } catch (error) {
    return catchError(error);
  };      
     }
  

const findByAllBranchAdminIntoDb = async (
  query: Record<string, unknown>
) => {
  try {
    const queryBuilder = new PrismaQueryBuilder(query)
      .search(branchManagementConstants.searchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    const { joinDateFrom, joinDateTo, branchName } = query;
    const extraFilters: any[] = [];
    if (branchName) {
      extraFilters.push({
        assignBranch: {
          contains: String(branchName),
          mode: "insensitive",
        },
      });
    }
    if (joinDateFrom || joinDateTo) {
      const dateFilter: any = {};

      if (joinDateFrom && !isNaN(Date.parse(joinDateFrom as string))) {
        dateFilter.gte = new Date(joinDateFrom as string);
      }

      if (joinDateTo && !isNaN(Date.parse(joinDateTo as string))) {
        dateFilter.lte = new Date(joinDateTo as string);
      }

      if (Object.keys(dateFilter).length > 0) {
        extraFilters.push({ joinDate: dateFilter });
      }
    }
    const whereCondition = {
      AND: [queryOptions.where, ...extraFilters],
    };

    // ✅ DATA QUERY (FIXED: no select + include conflict)
    const result = await prisma.branchAdmin.findMany({
      where: whereCondition,
      orderBy: queryOptions.orderBy,
      skip: queryOptions.skip,
      take: queryOptions.take,

      select: {
        ...(queryOptions.select || {
          id: true,
          fullName: true,
          phoneNumber: true,
          emailAddress: true,
          role: true,
          joinDate: true,
          assignBranch: true,
          createdAt: true,
          updatedAt: true,
        }),

        // ✅ include relation via select
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            city: true,
            country: true,
            role: true,
          },
        },
      },
    });

    const total = await prisma.branchAdmin.count({
      where: whereCondition,
    });

    const page = Number(query?.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query?.limit) > 0 ? Number(query.limit) : 10;
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
  } catch (error) {
    return catchError(error);
  }
};


const changePasswordBranchAdminIntoDb = async (
  id: string,
  payload: { oldPassword: string; newPassword: string }
  
) => {


  console.log("Changing password for branch admin ID:", id, payload);
  try {
    const user = await prisma.branchAdmin.findFirst({
      where: {
        id,
      },
      select: {
        password: true,
      },
    });

  

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "Branch admin not found", "");
    }

    // 2️⃣ Compare old password
    const isMatch = await bcrypt.compare(payload.oldPassword, user.password);
    console.log("Old password match result:", isMatch);

    if (!isMatch) {
      throw new ApiError(httpStatus.FORBIDDEN, "Old password does not match", "");
    }

    const hashedPassword = await bcrypt.hash(payload.newPassword, Number(config.bcrypt_salt_rounds));
    
    const result=await prisma.branchAdmin.update({
      where: { id },
      data: { password: hashedPassword },
    });
    if(!result){
        throw new ApiError(httpStatus.NOT_EXTENDED, 'Issue occurred while changing password')
    }

    

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
     return  catchError(error);
  }
};


const refreshTokenBranchAdminIntoDb = async (token: string) => {
  try {
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized", "");
    }

    const decoded = jwtHelpers.verifyToken(
      token,
      config.jwt_refresh_secret as string
    ) as JwtPayload;

    const { id } = decoded;
    const isUserExist = await prisma.branchAdmin.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
       emailAddress: true,
        role: true,
  
      },
    });

    if (!isUserExist) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found", "");
    }


    const jwtPayload = {
      id: isUserExist.id,
      email: isUserExist.emailAddress,
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


const forgotPasswordBranchADminIntoDb = async (
  payload: string | { emailAddress: string }
): Promise<{ status: boolean; message: string }> => {
  try {
    let emailString: string;

    if (typeof payload === "string") {
      emailString = payload;
    } else if (
      payload &&
      typeof payload === "object" &&
      "emailAddress" in payload
    ) {
      emailString = payload.emailAddress;
    } else {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid email format"
      );
    }

 
    const result = await prisma.$transaction(async (tx) => {
      const isExistUser = await tx.branchAdmin.findUnique({
        where: {
          emailAddress: emailString, // 🔥 FIXED
        },
        select: {
          id: true,
          emailAddress: true,
        },
      });

      if (!isExistUser) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "Branch admin not found"
        );
      }
      const otp = Number(generateOtp());

      const updatedUser = await tx.branchAdmin.update({
        where: {
          id: isExistUser.id,
        },
        data: {
          verificationCode: otp,
          createdAt: new Date(), // 🔥 track OTP creation time
        },
        select: {
          id: true,
          emailAddress: true,
        },
      });

      if (!updatedUser) {
        throw new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Failed to save OTP"
        );
      }

      try {
        await sendEmail(
          emailString,
          emailContext.sendVerificationData(
            emailString,
            otp,
            "Forgot Password Email"
          ),
          "Forgot Password Verification OTP Code"
        );
      } catch (emailError: any) {
        throw new ApiError(
          httpStatus.SERVICE_UNAVAILABLE,
          "Failed to send verification email",
          emailError
        );
      }
      return {
        status: true,
        message: "Check your email for OTP",
      };
    });

    return result;
  } catch (error) {
    return catchError(error);
  }
};

const verificationForgotBranchAdminIntoDb = async (
  otp: number | { verificationCode: number }
): Promise<{ status: boolean; resetToken: string }> => {
  try {
    let code: number;

    // ✅ 1. Extract OTP safely
    if (typeof otp === "object" && typeof otp.verificationCode === "number") {
      code = otp.verificationCode;
    } else if (typeof otp === "number") {
      code = otp;
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP format");
    }

    // ✅ 2. Find Branch Admin (FIXED TABLE)
    const isExistOtp = await prisma.branchAdmin.findFirst({
      where: {
        verificationCode: code,
      },
      select: {
        id: true,
        emailAddress: true,
        role: true,
        createdAt: true,
       
      },
    });

    if (!isExistOtp) {
      throw new ApiError(httpStatus.NOT_FOUND, "Invalid OTP");
    }

    

    // ✅ 3. OTP Expiry Check (CORRECT WAY)
    const now = Date.now();
    const otpTime = new Date(isExistOtp.createdAt).getTime();
    const FIVE_MINUTES = 5 * 60 * 1000;

    if (now - otpTime > FIVE_MINUTES) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "OTP has expired. Please request a new one."
      );
    }

    // ✅ 4. Generate RESET TOKEN (NOT access token)
    const resetToken = jwtHelpers.generateToken(
      {
        id: isExistOtp.id,
        email: isExistOtp.emailAddress,
        role: isExistOtp.role,
        purpose: "RESET_PASSWORD", // 🔥 important
      },
      config.jwt_access_secret as string,
      "10m" 
    );

    await prisma.branchAdmin.update({
      where: { id: isExistOtp.id },
      data: {
        verificationCode: null
        
      },
    });

    return {
      status: true,
      resetToken,
    };
  } catch (error) {
    return catchError(error);
  }
};


const resetPasswordBranchAdminIntoDb = async (payload: {
  resetToken: string;
  newPassword: string;
}): Promise<{ status: boolean; message: string }> => {
  try {
    const { resetToken, newPassword } = payload;

    if (!resetToken || !newPassword) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Reset token and new password are required"
      );
    }

    const decoded = jwtHelpers.verifyToken(
      resetToken,
      config.jwt_access_secret as string
    ) as any;

    if (!decoded || decoded.purpose !== "RESET_PASSWORD") {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Invalid or expired reset token"
      );
    }


    const user = await prisma.branchAdmin.findUnique({
      where: { id: decoded.id },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }


    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "New password must be different from old password"
      );
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      Number(config.bcrypt_salt_rounds)
    );

  
    await prisma.branchAdmin.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return {
      status: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    return catchError(error);
  }
};


const BranchManagementServices = {
  create_branch_admin_IntoDb,
   findSubscriptionBranchByIdIntoDb,
   login_branch_admin_IntoDb,
    findByAllBranchIntoDb,
     updateByBranchAdminIntoDb,
     deleteBranchAdminIntoDb ,
      findByAllBranchAdminIntoDb,
      changePasswordBranchAdminIntoDb,
      refreshTokenBranchAdminIntoDb,
      forgotPasswordBranchADminIntoDb,
      verificationForgotBranchAdminIntoDb,
       resetPasswordBranchAdminIntoDb
};

export default BranchManagementServices;