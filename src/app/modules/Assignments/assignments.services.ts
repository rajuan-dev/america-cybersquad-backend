import catchError from "../../../errors/catchError";
import { TAssignments } from "./assignments.interface";


const createAssignmentsIntoDb=async(teacherId: string,payload:Partial<TAssignments > )=>{

    try{

        return {
            teacherId, payload
        }

    }
    catch(error){
        return catchError(error);
    }


};


const AssignmentsServices={
    createAssignmentsIntoDb
};

export default AssignmentsServices;

