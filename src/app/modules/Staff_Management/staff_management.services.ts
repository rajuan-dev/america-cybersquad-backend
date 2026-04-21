import catchError from "../../../errors/catchError";
import generateId from "../../../utils/generateId";
import { TStaffManagement } from "./staff_management.interface";


const createStaffManagementIntoDb=async(userId: string, payload:TStaffManagement)=>{


     try{

         const gId= await generateId(payload.role);

        return {
            userId, payload, gId
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
