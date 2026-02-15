import { z } from "zod";

// create newsletter
const createNewsletterSubscriberSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email format")
      .min(1, "Email is required")
      .max(100, "Email must be less than 100 characters"),
  }),
});

// update newsletter
const updateNewsletterSubscriberStatusSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: "Subscriber ID is required",
    }),
  }),
  body: z.object({
    isActive: z.boolean({
      required_error: "isActive status is required",
    }),
  }),
});

export const NewsletterValidation = {
  createNewsletterSubscriberSchema,
  updateNewsletterSubscriberStatusSchema,
};
