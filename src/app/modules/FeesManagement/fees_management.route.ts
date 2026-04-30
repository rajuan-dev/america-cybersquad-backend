import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import FessManagementValidation from './fees_management.validation';
import FeesManagementController from './fees_management.controller';
import branchAdminAuth from '../../middlewares/branchAdminAuth';

const router=express.Router();


router.post("/recorded_frees_management", branchAdminAuth(UserRole.BRANCH_ADMIN), validateRequest(FessManagementValidation.createFeesManagementSchema), FeesManagementController.recordedFeesManagement);
router.get("/find_by_fees_management/:subscriptionId",branchAdminAuth(UserRole.BRANCH_ADMIN), FeesManagementController.findByFeesManagement );
router.patch("/update_fees_management/:feesManagementId", branchAdminAuth(UserRole.BRANCH_ADMIN), validateRequest(FessManagementValidation.updateFeesManagementSchema), FeesManagementController.updateFeesManagement);
router.get("/find_by_specific_fees_management/:feesManagementId", branchAdminAuth(UserRole.BRANCH_ADMIN),FeesManagementController.findBySpecificFeesManagement );
router.post("/student_fees_manually_received", branchAdminAuth(UserRole.BRANCH_ADMIN), validateRequest(FessManagementValidation.studentFeesManuallyReceivedSchema), FeesManagementController.studentFeesManuallyReceived);
router.get("/find_by_all_payable_fees/:subscriptionId", branchAdminAuth(UserRole.BRANCH_ADMIN), FeesManagementController.findByAllPayableFees)
const FeesManagementRouter=router;

export default FeesManagementRouter;



