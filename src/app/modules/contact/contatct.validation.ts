import { z } from "zod";

 const contactValidationSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .min(2, "Name must be at least 2 characters"),

    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Invalid email address"),

    phoneNumber: z
      .string({
        required_error: "Phone number is required",
      })
      .min(6, "Phone number is too short"),

    subject: z
      .string({
        required_error: "Subject is required",
      })
      .min(3, "Subject must be at least 3 characters"),

    message: z
      .string({
        required_error: "Message is required",
      })
      .min(10, "Message must be at least 10 characters"),
  }),
});


const ContactValidation={
     contactValidationSchema
};


export default ContactValidation;


