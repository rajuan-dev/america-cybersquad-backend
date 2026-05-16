import { UserStatus } from "@prisma/client";
import catchError from "../../../errors/catchError"
import prisma from "../../../shared/prisma";





const findMyChildrenAllResultIntoDb=async(parentId: string,query: Record<string, unknown>)=>{


     try{

        const result=await prisma.staff.findMany({
            where:{id:parentId, isVerified:true , status:UserStatus.ACTIVE},
            select:{
                students:{
                    select:{
                        name:true ,
                        studentId: true ,
                        classDistributions:{
                            select:{
                                assignableSubject: true ,
                                classLevel: true ,
                                examAnnouncement:{
                                    select:{
                                        examDate: true ,
                                        tipTapEditor: true ,
                                        examGrades:{
                                            select:{
                                                totalMarks:true ,
                                                marks:true,
                                                teachers:{
                                                    select:{
                                                        teacherId: true ,
                                                        teacherName: true 
                                                    }

                                                },
                                                instructions: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return result

     }
     catch(error){
        return catchError(error);

     }

    


};

 const ParentServices={
        findMyChildrenAllResultIntoDb
     };
export default ParentServices;
