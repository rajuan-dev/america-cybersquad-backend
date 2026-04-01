import { z } from "zod";

 const createBranchAdminValidation = z.object({
  body: z.object({
    fullName: z.string().min(1),
    phoneNumber: z.string().min(5),
    emailAddress: z.string().email(),
    password: z.string().min(6),
    joinDate: z.string(),
    assignBranch: z.string().min(1),
  }),
});


const branchManagementValidation={
    createBranchAdminValidation
};

export default branchManagementValidation;


