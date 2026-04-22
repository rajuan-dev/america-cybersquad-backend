import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import generateId from "../../../utils/generateId";
import { TStaffManagement } from "./staff_management.interface";
import bcrypt from 'bcrypt'
import { jwtHelpers } from "../../../helpars/jwtHelpers";

const createStaffManagementIntoDb=async(userId: string, payload:TStaffManagement)=>{


     try{

        const isExistAccount=await prisma.staff.findFirst({where:{
            email:payload.email
        }});

        if(isExistAccount){
            throw new ApiError(httpStatus.NOT_EXTENDED, 'this account already exist')
        };

          const gId= await generateId(payload.role);
          const hashedPassword = await bcrypt.hash(
               payload.password,
               Number(config.bcrypt_salt_rounds)
             );

              const result=await prisma.staff.create({
                data:{
                  email: payload.email,
                  generateId: gId,
                  password: hashedPassword,
                  name: payload.name,
                  role: payload.role,
                  phoneNumber: payload.phoneNumber,
                  subscriptionId: payload.subscriptionId

                }
              });

              if(!result){
                throw new ApiError(httpStatus.NOT_EXTENDED, 'issues by the ')
              };

              return {
                success:true , 
                message:" successfully create account "
              }
     }
     catch(error){
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

const StaffManagementServices={
   createStaffManagementIntoDb,
   loginStaffManagementIntoDb
};

export default StaffManagementServices;
