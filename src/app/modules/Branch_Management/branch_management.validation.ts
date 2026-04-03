
import { UserRole } from "@prisma/client";
import { z } from "zod";

 const createBranchAdminValidation = z.object({
  body: z.object({
    fullName: z.string().min(1),
    phoneNumber: z.string().min(5),
    emailAddress: z.string().email(),
    password: z.string().min(6),
    role: z.enum([UserRole.BRANCH_ADMIN]),
    joinDate: z.string(),
    assignBranch: z.string().min(1),
  }),
});


const branchAdminLoginSchema = z.object({
  body: z.object({
    emailAddress: z.string().email(),
    password: z.string().min(6),
  }),
});


const branchManagementValidation={
    createBranchAdminValidation,
    branchAdminLoginSchema
};

export default branchManagementValidation;


