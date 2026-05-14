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

const AnnouncementValidation={
   createAnnouncementValidationSchema
};

export default AnnouncementValidation;