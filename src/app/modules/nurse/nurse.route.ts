import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import HealthRecordValidation from './nurse.validation';
import nurseController from './nurse.controller';

const router = express.Router();


router.post("/create_health_record",
     auth(UserRole.NURSE),
     validateRequest(HealthRecordValidation.HealthRecordSchema),
     nurseController.healthRecord);

router.get("/find_by_all_health_record",
     auth(UserRole.NURSE),
     nurseController.findByAllHealthRecord);

router.get("/find_by_specific_health_record/:id",
     auth(UserRole.NURSE),
     nurseController.findBySpecificHealthRecord);

router.patch("/update_health_record/:id",
     auth(UserRole.NURSE),
     validateRequest(HealthRecordValidation.updateHealthRecordSchema),
     nurseController.updateSpecificHealthRecord);

router.delete("/delete_health_record/:id",
     auth(UserRole.NURSE),
     nurseController.deleteHealthRecord
);

router.get("/find_by_specific_student_health_record/:subscriptionId",   auth(UserRole.STUDENT), nurseController.findBySpecificStudentHealthRecord)





const nurseRoute = router;
export default nurseRoute;



