import {z} from 'zod';

const subjectValidationSchema = z.object({
  body: z.object({
    subjectName: z
      .string({ required_error: "subject name is required" })
      .min(2, "Subject name must be at least 2 characters")
      .max(100, "Subject name must be at most 100 characters"),

    code: z
      .string({ required_error: "code is required" })
      .min(2, "Code must be at least 2 characters")
      .max(20, "Code must be at most 20 characters"),

    department: z
      .string({ required_error: "department is required" })
      .min(2, "Department must be at least 2 characters")
      .max(100, "Department must be at most 100 characters"),

    subscriptionId: z
      .string({ required_error: "subscriptionId is required" })
      .min(5, "subscriptionId is too short")
      .max(100, "subscriptionId is too long"),
  }),
});

const SubjectValidation={
    subjectValidationSchema
};

export default SubjectValidation;

