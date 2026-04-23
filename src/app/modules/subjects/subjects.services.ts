import catchError from "../../../errors/catchError";
import { TSubject } from "./subjects.interface";


const createSubjectIntoDb=async(userId: string, payload:TSubject)=>{

    try{
        return{
            userId, payload
        }

    }
    catch(error){
        return catchError(error);
    }


};

const SubjectsServices={
    createSubjectIntoDb
};

export  default SubjectsServices;

