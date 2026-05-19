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

const  HealthRecordValidation={
    HealthRecordSchema
};

export default HealthRecordValidation;

