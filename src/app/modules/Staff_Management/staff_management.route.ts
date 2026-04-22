import express from 'express';
import branchAdminAuth from '../../middlewares/branchAdminAuth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import StaffManagementValidation from './staff_management.validation';
import StaffManagementController from './staff_management.controller';


const router=express.Router();

router.post("/create_new_staff", branchAdminAuth(UserRole.BRANCH_ADMIN), validateRequest(StaffManagementValidation.staffManagementSchema),StaffManagementController.createStaffManagement );
router.post("/login_staff_management", validateRequest(StaffManagementValidation.loginStaffManagementSchema),StaffManagementController.loginStaffManagement );

const StaffManagementRouter=router;

export default StaffManagementRouter;
