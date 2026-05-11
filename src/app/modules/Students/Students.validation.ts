import { z } from "zod";

 const createStudentZodSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100),

    email: z
      .string()
      .email("Invalid email format"),

    branchName: z
      .string()
      .min(2, "Branch name is required"),

    className: z
      .string()
      .min(1, "Class name is required"),

    guardianName: z
      .string()
      .min(2, "Guardian name is required"),

    guardianPhone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),

    subscriptionId: z
      .string()
      .uuid("Invalid subscription ID"),

    photo: z
      .string()

      .optional(),
  }),
});

 const updateStudentZodSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100),

    email: z
      .string()
      .email("Invalid email format"),

    branchName: z
      .string()
      .min(2, "Branch name is required"),

    className: z
      .string()
      .min(1, "Class name is required"),

    guardianName: z
      .string()
      .min(2, "Guardian name is required"),

    guardianPhone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15)
  }),
});

// ================================
// student.validation.ts
// ================================



const submitAssignmentSchema = z.object({
  body: z.object({
    classAssignmentId: z.string({
      required_error: "classAssignmentId is required",
    }),

    uploadFiles: z
      .array(
        z.object({
          fileUrl: z.string({
            required_error: "file url is required",
          }),
        })
      )
      .optional(),
  }),
});




const studentValidation = {
  createStudentZodSchema,
  updateStudentZodSchema,
  submitAssignmentSchema
};

export default studentValidation;