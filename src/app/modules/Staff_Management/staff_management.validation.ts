import { z } from "zod";
import { staffRole } from "./staff_management.constant";

 const staffManagementSchema = z.object({
   body: z.object({
    name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name cannot be empty"),

  role: z.enum([staffRole.bursar, staffRole.nurse, staffRole.parent], {
    required_error: "Role is required",
    invalid_type_error: "Role must be parent, nurse or bursar",
  }),

  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format"),

  phoneNumber: z
    .string({ required_error: "Phone number is required" })
    .min(6, "Phone number is too short")
    .max(20, "Phone number is too long"),

  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
  studentId: z.string({required_error:"studentId is required"}).optional(),
  subscriptionId: z
    .string({ required_error: "Subscription ID is required" })
   })
   
});

const loginStaffManagementSchema=z.object({
  body: z.object({
    email: z.string({required_error:" email is required"}),
    password: z.string({required_error:"password is required"})
  })
});

const updateStaffManagementSchema = z.object({
   body: z.object({
      name: z.string().min(1, "Name cannot be empty").optional(),

  email: z.string().email("Invalid email format").optional(),

  phoneNumber: z
    .string()
    .min(6, "Phone number is too short")
    .max(20, "Phone number is too long")
    .optional(),

  profileImage: z.string().optional(),
   })
});

const StaffManagementValidation ={
    staffManagementSchema,
    loginStaffManagementSchema,
    updateStaffManagementSchema
};
export default StaffManagementValidation