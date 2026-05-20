import express from 'express';
import branchAdminAuth from '../../middlewares/branchAdminAuth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import ClassDistributionValidation from './class_distribution.validation';
import ClassDistributionController from './class_distribution.controller';

const router=express.Router();

router.post("/recorded_class_distribution", branchAdminAuth(UserRole.BRANCH_ADMIN), validateRequest(ClassDistributionValidation.createClassDistributionSchema),  ClassDistributionController.recordedClassDistribution);
router.get("/find_by_branch_class_distribution/:subscriptionId", branchAdminAuth(UserRole.BRANCH_ADMIN),ClassDistributionController.findByBranchAdminDistribution);
router.get("/find_by_specific_class_distribution/:id",  branchAdminAuth(UserRole.BRANCH_ADMIN), ClassDistributionController.findBySpecificClassDistribution);
router.patch("/update_class_distribution/:id", branchAdminAuth(UserRole.BRANCH_ADMIN), validateRequest(ClassDistributionValidation.updateClassDistributionSchema),  ClassDistributionController.updateClassDistribution);
router.delete("/delete_class_distribution/:id", branchAdminAuth(UserRole.BRANCH_ADMIN),ClassDistributionController.deleteClassDistribution);
router.get("/find_by_class_schedule/:subscriptionId", branchAdminAuth(UserRole.BRANCH_ADMIN), ClassDistributionController.findByBranchAdminClassSchedule);
router.patch("/class_schedule/:classDistributionId", branchAdminAuth(UserRole.BRANCH_ADMIN),validateRequest(ClassDistributionValidation.classScheduleSchema), ClassDistributionController.classSchedule);

        
const ClassDistributionRouter= router;
export default ClassDistributionRouter;

