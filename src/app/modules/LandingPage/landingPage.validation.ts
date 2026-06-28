import {z} from 'zod';


const missionSchema=z.object({
      body: z.object({
            mission: z.string({required_error:"mission is required"})
      })
});

const visionSchema=z.object({
      body: z.object({
            vision: z.string({required_error:"vision is required"})
      })
});

const teamSchema=z.object({
      body: z.object({
            name : z.string({required_error:"name is required"}),
      designation: z.string({required_error:"designation is required"}),
      linkedinUrl: z.string({required_error:"linkedinUrl is required"}),
      whatsAppNumber:z.string({required_error:"whatsAppNumber is required"}),
      photo: z.string({required_error:"photo is required"}).optional()
      })
})

const updateTeamSchema = z.object({
  body: z
    .object({
      name: z.string().min(1).optional(),
      designation: z.string().min(1).optional(),
      linkedinUrl: z.string().url().optional(),
      whatsAppNumber: z.string().optional(),
      photo: z.string().optional(),
    })
    .partial(),
});
const faqSchema = z.object({
  body: z.object({
    question: z
      .string({
        required_error: "Question is required",
      })
      .min(1, "Question cannot be empty"),

    answer: z
      .string({
        required_error: "Answer is required",
      })
      .min(1, "Answer cannot be empty"),
  }),
});

const blogSchema = z.object({
  body: z.object({
    blogCategory: z
      .string({
        required_error: "Blog category is required",
      })
      .min(1),

    title: z
      .string({
        required_error: "Title is required",
      })
      .min(1),

    description: z
      .string({
        required_error: "Description is required",
      })
      .min(1),

    photo: z.string().optional(),
  }),
});

const newsletterSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: "Email is required",
      })
      .email("Please provide a valid email address"),
  }),
});



const landingPageValidation={
   missionSchema,
   visionSchema, 
   teamSchema,
   updateTeamSchema,
   faqSchema,
   blogSchema,
   newsletterSchema
};
export default landingPageValidation