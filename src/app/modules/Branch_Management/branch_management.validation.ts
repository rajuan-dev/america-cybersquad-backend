
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

 const updateBranchAdminValidation = z.object({
  body: z.object({
    fullName: z.string().min(1).optional(),
    phoneNumber: z.string().min(5).optional(),
    emailAddress: z.string().email().optional(),
    joinDate: z.string().optional(),
    assignBranch: z.string().min(1).optional(),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(6),
    newPassword: z
      .string({
        required_error: "Password is required",
      })
      .min(6, "Password must be at least 6 characters long"),
  }),
});


const requestTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({ required_error: "Refresh Token is Required" }),
  }),
});


const branchAdminForgotPasswordValidationSchema = z.object({
  body: z.object({
    emailAddress: z.string({required_error:"email address is required"}).email(),
  }),
});

const branchAdminVerificationCodeSchema = z.object({
  body: z.object({
    verificationCode: z.number({ required_error: "Verification code is required" }),
  }),
});

const  resetPasswordBrachAdminSchema= z.object({
   body: z.object({
    resetToken: z.string({ required_error: "Reset token is required" }),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(6, "Password must be at least 6 characters long"),
  }),   


   })


const branchManagementValidation={
    createBranchAdminValidation,
    branchAdminLoginSchema,
    updateBranchAdminValidation,
    changePasswordValidationSchema,
     requestTokenValidationSchema,
     branchAdminForgotPasswordValidationSchema,
     branchAdminVerificationCodeSchema,
     resetPasswordBrachAdminSchema
};

export default branchManagementValidation;


