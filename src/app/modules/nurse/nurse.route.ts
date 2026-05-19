import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import HealthRecordValidation from './nurse.validation';
import nurseController from './nurse.controller';

const router=express.Router();


router.post("/create_health_record",
     auth(UserRole.NURSE),
     validateRequest(HealthRecordValidation.HealthRecordSchema), 
      nurseController.healthRecord );


      const nurseRoute=router;
      export default nurseRoute;
      
   

