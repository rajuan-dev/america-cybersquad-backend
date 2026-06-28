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

const landingPageValidation={
   missionSchema,
   visionSchema, 
   teamSchema,
   updateTeamSchema
};
export default landingPageValidation