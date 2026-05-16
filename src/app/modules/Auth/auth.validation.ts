import { UserRole, UserStatus } from "@prisma/client";
import { z } from "zod";

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

const resetPasswordSchema = z.object({
  body: z
    .object({
      // id: z.string(),
      password: z.string().min(6),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});


const LoginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "email is required" }).email(),
    role: z.enum([UserRole.INSTITUTIONAL_OWNER, UserRole.STUDENT,  UserRole.ADMIN, UserRole.BRANCH_ADMIN, UserRole.parent, UserRole.TEACHER], {
      required_error: "Role is required",
      invalid_type_error: "Invalid role value",
    }),
    password: z
      .string({  required_error: "password is required" })
      .min(6, { message: "min 6 character accepted" }),
  }),
  fcm: z.string({ required_error: "fcm is not required" }).optional(),
});

const requestTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({ required_error: "Refresh Token is Required" }),
  }),
});


const blockUserZodSchema = z.object({
  body: z.object({
    status: z.nativeEnum(UserStatus, {
      required_error: "Status is required",
      invalid_type_error: "Invalid status value",
    }),
  }),
});


export const authValidation = {
  changePasswordValidationSchema,
  resetPasswordSchema,
  LoginSchema ,
  blockUserZodSchema,
  requestTokenValidationSchema
};
