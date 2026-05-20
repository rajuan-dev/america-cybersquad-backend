import { z } from "zod";

 const HealthRecordSchema = z.object({
   body: z.object({
    studentId: z.string().min(1, "studentId is required"),
    subscriptionId: z.string().min(1, "subscriptionId is required"),
    bloodType: z.enum([
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
  ]),
   tipTapEditor: z.string().min(1, "tipTapEditor is required"),
   emergencyContact: z.string().min(1, "emergencyContact is required"),
   })
});



const updateHealthRecordSchema= z.object({
   body: z.object({
    studentId: z.string().min(1, "studentId is required").optional(),
    subscriptionId: z.string().min(1, "subscriptionId is required").optional(),
    bloodType: z.enum([
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
  ]).optional(),
   tipTapEditor: z.string().min(1, "tipTapEditor is required").optional(),
   emergencyContact: z.string().min(1, "emergencyContact is required").optional(),
   })
});

const  HealthRecordValidation={
    HealthRecordSchema,
    updateHealthRecordSchema
    
};

export default HealthRecordValidation;

