import { Contact } from "@prisma/client";
import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";
import { searchableFields } from "./conatact.constant";



const createContactIntoDb = async (payload: Contact) => {
  try {

    const result = await prisma.contact.create({
      data: payload,
    });
    if(!result){ throw new ApiError(httpStatus.NOT_EXTENDED, 'issues by the contact create server section') };

    return {
      success: true,
      message: "Successfully Recorded"
    
    };

  } catch (error) {
    catchError(error);
    throw error; 
  }
};




const findByAllContactAdminIntoDb = async (query: Record<string, unknown>) => {
  try {
    const queryBuilder = new PrismaQueryBuilder(query)
      .search( searchableFields)
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    const result = await prisma.contact.findMany({
      where: queryOptions.where,
      orderBy: queryOptions.orderBy,
      skip: queryOptions.skip,
      take: queryOptions.take,
     select: {
    id: true,
    name: true,
    email: true,
    subject:true , 
    message:true,
    createdAt: true,
    updatedAt: true,
  },
    });

    const total = await prisma.contact.count({
      where: queryOptions.where,
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
  } catch (error: unknown) {
    throw error; // let global error handler manage it
  }
};

const  deleteContactIntoDb=async(id:string)=>{

       try{


   const result = await prisma.contact.delete({
      where: {
        id,
      },
      select:{
        id:true
      }
    });


        if(!result){
            throw new ApiError(httpStatus.NOT_EXTENDED, 'issues by the contact delete  server  section')
        }

       }
       catch(error){
        catchError(error);
       }
}



const ContactServices ={
    createContactIntoDb,
    findByAllContactAdminIntoDb,
    deleteContactIntoDb
};

export default  ContactServices;

