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




const BranchManagementServices = {
  create_branch_admin_IntoDb,
   findSubscriptionBranchByIdIntoDb,
   login_branch_admin_IntoDb,
    findByAllBranchIntoDb
};

export default BranchManagementServices;