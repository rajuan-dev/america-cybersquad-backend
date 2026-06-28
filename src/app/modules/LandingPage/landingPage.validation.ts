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
})

const landingPageValidation={
   missionSchema,
   visionSchema
};
export default landingPageValidation