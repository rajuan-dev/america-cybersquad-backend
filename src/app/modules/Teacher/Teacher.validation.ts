import { z } from "zod";

 const TeacherSchema = z.object({
   body: z.object({
     teacherName: z.string({
    required_error: "Teacher name is required",
  }),
  email: z.string({
    required_error: "Email is required",
  }).email("Invalid email address"),
  phoneNumber: z.string({
    required_error: "Phone number is required",
  }),
  branchName: z.string({
    required_error: "Branch name is required",
  }),
  subject: z.array(z.string(), {
    required_error: "Subject array is required",
  }),
  assignClass: z.array(z.string(), {
    required_error: "Assign class array is required",
  }),
  password: z.string({
    required_error: "Password is required",
  }).min(6, "Password must be at least 6 characters"),
  address: z.string({
    required_error: "Address is required",
  }),
  photo: z.string().optional(),
  subscriptionId: z.string({
    required_error: "Subscription ID is required",
  }),
   })
});



 const TeacherUpdateSchema = z.object({
   body: z.object({
     teacherName: z.string({
    required_error: "Teacher name is required",
  }),
  email: z.string({
    required_error: "Email is required",
  }).email("Invalid email address"),
  phoneNumber: z.string({
    required_error: "Phone number is required",
  }),
  branchName: z.string({
    required_error: "Branch name is required",
  }),
  subject: z.array(z.string(), {
    required_error: "Subject array is required",
  }),
  assignClass: z.array(z.string(), {
    required_error: "Assign class array is required",
  }),
  address: z.string({
    required_error: "Address is required",
  }),
  photo: z.string().optional()

   })
});


const teacherValidation = {
  TeacherSchema,
   TeacherUpdateSchema
};

export default teacherValidation;
