import { z} from 'zod';


const createClassDistributionSchema=z.object({
    body: z.object({
        subscriptionId:z.string({required_error:"subscriptionId is required"}), 
        teacherId: z.string({required_error:"teacherId is required"}),
        classLevel: z.string({required_error:"class level is required"}), 
        roomNumber:  z.string({required_error:"room number is required"}),
        capacity:z.number({required_error:"capacity is required"}),


    })
});

const ClassDistributionValidation ={
    createClassDistributionSchema
};
export default ClassDistributionValidation;

