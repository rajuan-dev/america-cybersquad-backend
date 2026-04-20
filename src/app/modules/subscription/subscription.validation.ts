import { z } from "zod";
import { schoolArea, subscriptionType } from "./subscription.constant";


 
export const SubscriptionTypeEnum = z.enum([subscriptionType.free_trial,subscriptionType.paid]);

export const SchoolAreaEnum = z.enum([ schoolArea.Rural, schoolArea.Urban]);


const subscriptionDetailsSchema = z.object({
  subscriptionType: SubscriptionTypeEnum,

  schoolName: z.string().min(1, "School name is required"),

  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),

  area: SchoolAreaEnum,

  schoolType: z.string().min(1, "School type is required"),

  studentLimit: z.string().min(1, "Student limit is required"),
});


const subscriptionsSchema = z.object({
  body: z.object({
   

    price: z.number().min(0, "Price must be >= 0").optional(),

    subscriptiondetails: z
      .array(subscriptionDetailsSchema)
      .min(1, "At least one subscription detail is required"),
  }),
});


 const subscriptionValidation = {
  subscriptionsSchema,
};
export default subscriptionValidation;

