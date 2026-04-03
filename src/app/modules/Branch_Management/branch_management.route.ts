

import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import branchManagementValidation from './branch_management.validation';
import BranchManagementController from './branch_management.controller';

const route=express.Router();
route.post("/create_branch_admin", auth(UserRole.INSTITUTIONAL_OWNER),validateRequest( branchManagementValidation.createBranchAdminValidation),BranchManagementController.create_branch_admin );
route.get("/find_by_subscription_branch/:subscriptionId", auth(UserRole.INSTITUTIONAL_OWNER), BranchManagementController.findSubscriptionBranchById);
route.post("/login_branch_admin", validateRequest( branchManagementValidation.branchAdminLoginSchema), BranchManagementController.login_branch_admin);
route.get("/find_my_all_branch_admin", auth(UserRole.INSTITUTIONAL_OWNER), BranchManagementController.findByAllBranches);
route.patch("/update_branch_admin/:id", auth(UserRole.INSTITUTIONAL_OWNER), validateRequest( branchManagementValidation.updateBranchAdminValidation), BranchManagementController.updateByBranchAdmin);
route.delete("/delete_branch_admin/:id", auth(UserRole.INSTITUTIONAL_OWNER), BranchManagementController.deleteBranchAdmin);
// admin route ---- admin display the all  institutional owner branch admin and also update and delete the branch admin by id and also find the branch admin by subscription id and also login the branch admin by email and password
const branchManagement=route;

export default  branchManagement;

