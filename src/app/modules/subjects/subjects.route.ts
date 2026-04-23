import express from 'express';
import branchAdminAuth from '../../middlewares/branchAdminAuth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import SubjectValidation from './subjects.validation';
import SubjectController from './subjects.controller';

const router=express.Router();

router.post("/create_subject", branchAdminAuth(UserRole.BRANCH_ADMIN), validateRequest(SubjectValidation.subjectValidationSchema), SubjectController.createSubject);
router.get("/find_by_specific_branch_subject/:subscriptionId", branchAdminAuth(UserRole.BRANCH_ADMIN),SubjectController.findBySpecificBranchSubject);
router.get("/find_by_specific_branch_all_subject", branchAdminAuth(UserRole.BRANCH_ADMIN), SubjectController.findBySpecificBranchAdminAllSubject);


const SubjectRouter=router;

export default SubjectRouter;

