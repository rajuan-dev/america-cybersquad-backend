import httpStatus from "http-status";

import catchError from "../../../errors/catchError";
import prisma from "../../../shared/prisma";
import { TSubject } from "./subjects.interface";
import ApiError from "../../../errors/ApiErrors";
import PrismaQueryBuilder from "../../builder/PrismaQueryBuilder";
import { searchable_subject } from "./subjects.constant";

const createSubjectIntoDb = async (
  userId: string,
  payload: TSubject
): Promise<{ success: boolean; message: string }> => {
  try {
    const code = payload.code.toUpperCase();
    const isExistSubject = await prisma.subject.findFirst({
      where: {
        code,
        branchAdminId: userId,
      },
    });

    if (isExistSubject) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "This subject already exists"
      );
    }

    await prisma.subject.create({
      data: {
        ...payload,
        code,
        branchAdminId: userId,
      },
    });

    return {
      success: true,
      message: "Successfully Recorded",
    };
  } catch (error) {
    return catchError(error);
  }
};

const findBySpecificBranchSubjectIntoDb=async(userId: string, subscriptionId: string)=>{

    try{

        return await prisma.subject.findMany({where:{
            branchAdminId: userId,
            subscriptionId
        }, select:{
            id: true ,
            subjectName:true ,
            code: true
        }});

    }
catch (error) {
    return catchError(error);
  }

};


const findBySpecificBranchAdminAllSubjectIntoDb = async (
  userId: string,
  query: Record<string, unknown>
) => {
  try {
    const queryBuilder = new PrismaQueryBuilder(query)
      .search(searchable_subject)
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    // 2️⃣ Main query
    const result = await prisma.subject.findMany({
      where: {
        branchAdminId: userId,    
        ...queryOptions.where,
      },

      orderBy: queryOptions.orderBy,
      skip: queryOptions.skip,
      take: queryOptions.take,

      select: {
        id: true,
        subjectName: true,
        code: true,
        department: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const total = await prisma.subject.count({
      where: {
        branchAdminId: userId,
        isDelete: false,
        ...queryOptions.where,
      },
    });
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      status: true,
      message: "Successfully fetched subjects",
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

const findBySpecificBranchUnderSubjectIntoDb=async(userId: string, id: string)=>{

    try{
        return await prisma.subject.findUnique({where:{id}, select:{
            id: true , 
            code: true , 
            department: true , 
            createdAt: true 
        }});

    }
    catch (error) {
    return catchError(error);
  }

};


const updateSubjectIntoDb = async (
  id: string,
  userId: string,
  payload: Partial<TSubject>
):Promise<{success: boolean , message: string }> => {
  try {
    const isExistSubject = await prisma.subject.findFirst({
      where: {
        id,
        branchAdminId: userId
       
      },
    });

    if (!isExistSubject) {
      throw new ApiError(httpStatus.NOT_FOUND, "Subject not found");
    }
    const updateData: any = {};

    if (payload.subjectName) {
      updateData.subjectName = payload.subjectName;
    }

    if (payload.department) {
      updateData.department = payload.department;
    }

    if (payload.code) {
      const code = payload.code.toUpperCase();

      const duplicate = await prisma.subject.findFirst({
        where: {
          code,
          branchAdminId: userId,
          NOT: { id },
        },
      });

      if (duplicate) {
        throw new ApiError(
          httpStatus.CONFLICT,
          "This subject code already exists"
        );
      }

      updateData.code = code;
    }

    if (payload.subscriptionId) {
      updateData.subscriptionId = payload.subscriptionId;
    }

     await prisma.subject.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      message: "Successfully Updated"
    
    };
  } catch (error) {
    return catchError(error);
  }
};

const deleteSubjectIntoDb = async (id: string, userId: string) => {
  try {

    const isExistSubject = await prisma.subject.findFirst({
      where: {
        id,
        branchAdminId: userId
        
      },
    });

    if (!isExistSubject) {
      throw new ApiError(httpStatus.NOT_FOUND, "Subject not found");
    }

    const result = await prisma.subject.delete({
      where: { id }
     
    });

    return {
      success: true,
      message: "Subject deleted successfully"
   
    };
  } catch (error) {
    return catchError(error);
  }
};


const findBySpecificGlobalAdminAllSubjectIntoDb = async (
  subscriptionId: string,
  query: Record<string, unknown>
) => {
  try {
    const queryBuilder = new PrismaQueryBuilder(query)
      .search(searchable_subject)
      .filter()
      .sort()
      .paginate()
      .fields();

    const queryOptions = queryBuilder.build();

    // ✅ Fetch subscription with related data
    const result = await prisma.subscriptions.findUnique({
      where: {
        id: subscriptionId,
      },
      select: {
        price: true,
        subscriptiondetails: {
          select: {
            schoolName: true,
            schoolType: true,
            city: true,
            country: true,

            
           
          },
        },
        subjects: {
          select: {
            subjectName: true,
            department: true,
            code: true,
            createdAt: true,
          },
        },
      },
    });

  
    const total = await prisma.subject.count({
      where: {
        subscriptionId: subscriptionId,
        ...queryOptions.where,
      },
    });

    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      status: true,
      message: "Successfully fetched subscription subjects",
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



const SubjectsServices = {
  createSubjectIntoDb,
  findBySpecificBranchSubjectIntoDb,
   findBySpecificBranchAdminAllSubjectIntoDb,
    findBySpecificBranchUnderSubjectIntoDb,
    updateSubjectIntoDb,
    deleteSubjectIntoDb,
    findBySpecificGlobalAdminAllSubjectIntoDb
   
};

export default SubjectsServices;