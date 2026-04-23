import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import generateId from "../../../utils/generateId";
import { TStaffManagement } from "./staff_management.interface";
import bcrypt from 'bcrypt'
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";

const createStaffManagementIntoDb = async (
  userId: string,
  payload: TStaffManagement
) => {
  try {
    const isExistAccount = await prisma.staff.findFirst({
      where: { email: payload.email },
    });

    if (isExistAccount) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "This account already exists"
      );
    }

    const gId = await generateId(payload.role);
    const hashedPassword = await bcrypt.hash(
      payload.password,
      Number(config.bcrypt_salt_rounds)
    );

    let result;

    switch (payload.role) {
      case "nurse": {
        result = await prisma.staff.create({
          data: {
            email: payload.email,
            generateId: gId,
            password: hashedPassword,
            name: payload.name,
            role: payload.role,
            phoneNumber: payload.phoneNumber,
            subscriptionId: payload.subscriptionId,
          },
        });
        break;
      }

      case "bursar": {
        result = await prisma.staff.create({
          data: {
            email: payload.email,
            generateId: gId,
            password: hashedPassword,
            name: payload.name,
            role: payload.role,
            phoneNumber: payload.phoneNumber,
            subscriptionId: payload.subscriptionId,
          },
        });
        break;
      }

      case "parent": {
        if (!payload.studentId) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Student ID is required"
          );
        }

        const isExistStudent = await prisma.student.findFirst({
          where: { studentId: payload.studentId },
        });

        if (!isExistStudent) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            "Student not found in database"
          );
        }

        result = await prisma.staff.create({
          data: {
            email: payload.email,
            generateId: gId,
            password: hashedPassword,
            name: payload.name,
            role: payload.role,
            phoneNumber: payload.phoneNumber,
            subscriptionId: payload.subscriptionId,
            studentId: payload.studentId,
          },
        });

        break;
      }

      default: {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid role");
      }
    }

    // 4️⃣ Final response
    return {
      status: true,
      message: "Successfully account created"
     
    };
  } catch (error) {
    return catchError(error);
  }
};


const loginStaffManagementIntoDb = async (payload: { email: string; password: string }) => {


  try {
    const {email, password } = payload; 

   const staff_management = await prisma.staff.findFirst({
      where: { email },
      select: {
        id: true,
        role: true,
        email: true,
        password: true,
        
      }
    });

    if (!staff_management) {
      throw new ApiError(httpStatus.NOT_FOUND, "Not not found");
    };

    const isPasswordMatched = await bcrypt.compare(
        password,
        staff_management.password
      );

      if (!isPasswordMatched) {
        throw new ApiError(httpStatus.FORBIDDEN, "Password not matched", "");
      }

      const jwtPayload = {
        id: staff_management.id,
        role: staff_management.role,
        email: staff_management.email,
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


const findByAllStaffManagementIntoDb = async (
  subscriptionId: string,
  query: Record<string, unknown>
) => {
  try {
  
    const queryBuilder = new PrismaQueryBuilder(query)
      .search(["name", "email", "phoneNumber", "generateId", "studentId"])
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    // 2️⃣ Extract extra filters
    const { role, studentId } = query;

    const staffFilter: any = {};

    if (role) {
      staffFilter.role = role;
    }

    if (studentId) {
      staffFilter.studentId = studentId;
    }

    // 3️⃣ Main query
    const result = await prisma.staff.findMany({
      where: {
        subscriptionId, // ✅ mandatory filter
        ...queryOptions.where,
        ...staffFilter,
      },

      orderBy: queryOptions.orderBy,
      skip: queryOptions.skip,
      take: queryOptions.take,

      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        generateId: true,
        role: true,
        studentId: true,
        photo: true,
        createdAt: true,
        updatedAt: true,

    
      },
    });

    // 4️⃣ Total count
    const total = await prisma.staff.count({
      where: {
        subscriptionId,
        ...queryOptions.where,
        ...staffFilter,
      },
    });

    // 5️⃣ Pagination meta
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    // 6️⃣ Final response
    return {
      status: true,
      message: "Successfully fetched staff list",
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

const findBySpecificStaffIntoDb=async(id:string)=>{

  try{

     return await prisma.staff.findUnique({where:{id}, select:{
      id:true ,
      name: true,
      email: true , 
      phoneNumber:true , 
      photo:true,
      createdAt:true , 
      updatedAt:true
     }})

  }
  catch (error) {
    return catchError(error);
  }


};

const updateStaffInformationIntoDb=async(id:string, payload:Partial<TStaffManagement>)=>{

   try{

    return {
      id, payload
    }

   }
   catch(error){
     return catchError(error);
   }
}

const StaffManagementServices={
   createStaffManagementIntoDb,
   loginStaffManagementIntoDb,
   findByAllStaffManagementIntoDb ,
   findBySpecificStaffIntoDb,
   updateStaffInformationIntoDb
};

export default StaffManagementServices;
