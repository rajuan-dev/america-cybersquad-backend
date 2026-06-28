import {z} from 'zod';


const missionSchema=z.object({
      body: z.object({
            mission: z.string({required_error:"mission is required"})
      })
});

const landingPageValidation={
missionSchema
};
export default landingPageValidation