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

  subscriptionId: z
    .string({ required_error: "Subscription ID is required" })
   })
   
});

const StaffManagementValidation ={
    staffManagementSchema
};
export default StaffManagementValidation