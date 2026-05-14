import { z } from "zod";

const createAnnouncementValidationSchema = z.object({
  body: z.object({
    examDate: z.coerce.date({
      required_error: "Exam date is required",
      invalid_type_error: "Invalid exam date",
    }),

    tipTapEditor: z
      .string({
        required_error: "Exam announcement content is required",
      })
      .min(1, "TipTap editor content cannot be empty"),

    subscriptionId: z
      .string({
        required_error: "Subscription ID is required",
      })
      .min(1, "Subscription ID cannot be empty"),

    classDistributionId: z
      .string({
        required_error: "Class distribution ID is required",
      })
      .min(1, "Class distribution ID cannot be empty"),
  }),
});


const  updateAnnouncementExamSchema=z.object({
  body: z.object({
    examDate: z.coerce.date({
      required_error: "Exam date is required",
      invalid_type_error: "Invalid exam date",
    }).optional(),

    tipTapEditor: z
      .string({
        required_error: "Exam announcement content is required",
      })
      .min(1, "TipTap editor content cannot be empty").optional()
  }),
});


 const ExamGradesValidationSchema = z.object({
  body: z.object({
    examAnnouncementId: z
      .string({
        required_error: "Exam announcement ID is required",
      })
      .uuid("Invalid exam announcement ID format"),

    studentId: z
      .string({
        required_error: "Student ID is required",
      })
      .uuid("Invalid student ID format"),

    totalMarks: z
      .number({
        required_error: "Total marks is required",
      })
      .positive("Total marks must be greater than 0"),

    marks: z
      .number({
        required_error: "Marks is required",
      })
      .min(0, "Marks cannot be negative"),

    instructions: z
      .string()
      .max(555, "Instructions cannot exceed 555 characters")
      .optional(),

    isDelete: z.boolean().optional(),
  }),
});

const AnnouncementValidation={
   createAnnouncementValidationSchema,
   updateAnnouncementExamSchema,
   ExamGradesValidationSchema
};

export default AnnouncementValidation;