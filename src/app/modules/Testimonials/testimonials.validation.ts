import {z} from 'zod';

const testimonialsValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .min(2, "Name must be at least 2 characters"),

    designation: z
      .string({ required_error: "Designation is required" })
      .min(2, "Designation must be at least 2 characters"),

    workingPlace: z
      .string({ required_error: "Working place is required" })
      .min(2, "Working place must be at least 2 characters"),

    videoUrl: z
      .string({ required_error: "Video URL is required" }).optional()
      
  }),
});

const TestimonialsValidation={
    testimonialsValidationSchema
};



export default TestimonialsValidation;