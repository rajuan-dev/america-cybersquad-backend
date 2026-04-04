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
import { stat } from "fs";
import { JwtPayload } from "jsonwebtoken";

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

const findSubscriptionBranchByIdIntoDb= async (
  userId: string,
  subscriptionId: string
) => {
  try {
    const result = await prisma.subscriptions.findFirst({
      where: {
        id: subscriptionId,
        userId,
      },
      select: {
        id: true,
        subscriptiondetails: {
          select: {
            branchName: true,
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

    return result
  } catch (error) {
    return catchError(error);
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

const BranchManagementServices = {
  create_branch_admin_IntoDb,
   findSubscriptionBranchByIdIntoDb,
   login_branch_admin_IntoDb,
    findByAllBranchIntoDb,
     updateByBranchAdminIntoDb,
     deleteBranchAdminIntoDb ,
      findByAllBranchAdminIntoDb,
      changePasswordBranchAdminIntoDb,
      refreshTokenBranchAdminIntoDb
};

export default BranchManagementServices;