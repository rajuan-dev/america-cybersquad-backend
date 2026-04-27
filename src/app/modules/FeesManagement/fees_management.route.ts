import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import FessManagementValidation from './fees_management.validation';
import FeesManagementController from './fees_management.controller';

const router=express.Router();


router.post("/recorded_frees_management", auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), validateRequest(FessManagementValidation.createFeesManagementSchema), FeesManagementController.recordedFeesManagement);
router.get("/find_by_fees_management",auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), FeesManagementController.findByFeesManagement );

const FeesManagementRouter=router;
export default FeesManagementRouter;



