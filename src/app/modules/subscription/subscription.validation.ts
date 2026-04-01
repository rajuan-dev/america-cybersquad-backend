import { z } from "zod";

/**
 * Child Schema (NO body here)
 */
const subscriptionDetailsSchema = z.object({
  branchName: z.string().min(1, "Branch name is required"),

  locationContext: z.string().min(1, "Location context is required"),

  student: z.number().int().min(1, "Student must be at least 1"),

  state: z.string().min(1, "State is required"),
  region: z.string().min(1, "Region is required"),
  province: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City is required"),
});

/**
 * Parent Schema (ONLY here we use body)
 */
const subscriptionsSchema = z.object({
  body: z.object({
    studentLimit: z.number().int().min(1),
    price: z.number().min(0),

    subscriptiondetails: z
      .array(subscriptionDetailsSchema)
      .optional(),
  }),
});

 const subscriptionValidation = {
  subscriptionsSchema,
};

export default subscriptionValidation