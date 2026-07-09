import { z } from "zod";

const createAnnouncementValidationSchema = z.object({
  body: z.object({
    examDate: z.coerce.date({
      required_error: "Exam date is required",
      invalid_type_error: "Invalid exam date",
    }),
    examName: z.string({required_error:"exam name is required"}),
    topic: z.string({required_error:"topic is required"}),
    totalMarks: z.string({required_error:"total marks is required"}),
    duration: z.string({required_error:"duration is required"}),
    instruction: z.string({required_error:"instruction is required"}),

    classDistributionId: z
      .string({
        required_error: "Class distribution ID is required",
      })
      .min(1, "Class distribution ID cannot be empty"),
  }),
});

const updateAnnouncementExamSchema = z.object({
  body: z.object({
    examDate: z.coerce
      .date({
        invalid_type_error: "Invalid exam date",
      })
      .optional(),

    tipTapEditor: z
      .string()
      .min(1, "TipTap editor content cannot be empty")
      .optional(),

    examName: z.string().optional(),
    topic: z.string().optional(),
    totalMarks: z.string().optional(),
    duration: z.string().optional(),
    instruction: z.string().optional(),
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

 const UpdateExamGradesValidationSchema = z.object({
  body: z.object({
    totalMarks: z
      .number({
        required_error: "Total marks is required",
      }).optional()
      ,

    marks: z
      .number({
        required_error: "Marks is required",
      })
      .optional(),

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
   ExamGradesValidationSchema,
   UpdateExamGradesValidationSchema
   
};

export default AnnouncementValidation;