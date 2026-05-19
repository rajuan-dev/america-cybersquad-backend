import { bloodTypeEnum } from "@prisma/client";




export interface IHealthRecord {
  studentId: string;
  subscriptionId: string;
  bloodType: bloodTypeEnum;
  tipTapEditor: string;
  emergencyContact: string;
}