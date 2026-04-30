
import {z} from 'zod';
import { PaymentStatus } from './fees_management.constant';



const createFeesManagementSchema= z.object({
    body: z.object({
         subscriptionId: z.string({required_error:" subscriptionId is required"}),
         totalFees: z.number({required_error:"totalFees is required"}),
         classLevel: z.string({required_error:"class level is required"}),
         
        //  paidAmount: z.number({required_error:"paidAmount is required"}),
        //  unpaidAmount: z.number({required_error:"unpaidAmount is required"}),
        //  classLevel: z.string({required_error:"classLevel is required"}),
         paymentStatus: z.enum([PaymentStatus.paid, PaymentStatus.unpaid]).default(PaymentStatus.unpaid)
    })
});

 const updateFeesManagementSchema =z.object({
     body: z.object({
        totalFees: z.number({required_error:"totalFees is not  required"}).optional(),
        classLevel: z.string({required_error:"class level is not required"}).optional(),
     })
 });

 const studentFeesManuallyReceivedSchema=z.object({
    body: z.object({
        studentId: z.string({required_error:"student Id is required"}),
        paidAmount: z.number({required_error:" paid amount is required"})
    })
 });

  const updateStudentFeesManuallyReceivedSchema=z.object({
    body: z.object({
        paidAmount: z.number({required_error:" paid amount is required"})
    })
 });




 

const FessManagementValidation ={
    createFeesManagementSchema,
    updateFeesManagementSchema,
    studentFeesManuallyReceivedSchema,
    updateStudentFeesManuallyReceivedSchema
};

export default FessManagementValidation;

