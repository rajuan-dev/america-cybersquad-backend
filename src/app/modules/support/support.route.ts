import express from 'express';
import branchAdminAuth from '../../middlewares/branchAdminAuth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import SupportValidation from './support.validation';
import SupportController from './support.controller';
import auth from '../../middlewares/auth';

const router= express.Router();

router.post("/send_support_message", branchAdminAuth(UserRole.BRANCH_ADMIN, UserRole.INSTITUTIONAL_OWNER), validateRequest(SupportValidation.createSupportSchema), SupportController.sendSupportMessage);
router.get("/find_by_all_support", auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), SupportController. findByAllSupport);
router.delete("/delete_support/:supportId",auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), SupportController.deleteSupport);

const SupportRouter=router;
export  default  SupportRouter;
