import httpStatus from "http-status";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import generateId from "../../../utils/generateId";
import { TStaffManagement } from "./staff_management.interface";
import bcrypt from 'bcrypt'

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

const StaffManagementServices={
   createStaffManagementIntoDb
};

export default StaffManagementServices;
