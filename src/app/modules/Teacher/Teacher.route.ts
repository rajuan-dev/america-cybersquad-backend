import express from "express";
import TeacherController from "./Teacher.controller";
import validateRequest from "../../middlewares/validateRequest";
import teacherValidation from "./Teacher.validation";

import { UserRole } from "@prisma/client";
import branchAdminAuth from "../../middlewares/branchAdminAuth";
import auth from "../../middlewares/auth";



const router = express.Router();

router.post(    
    "/create-teacher",
    branchAdminAuth(UserRole.BRANCH_ADMIN),
    validateRequest(teacherValidation.TeacherSchema),
    TeacherController.createTeacher
);
router.get(
  "/find-specific-branch-all-teachers",
  branchAdminAuth(UserRole.BRANCH_ADMIN),
  TeacherController.findByAllTeachersBranchAdmin
);
router.get(
  "/find-single-teacher/:teacherId",
  branchAdminAuth(UserRole.BRANCH_ADMIN),
  TeacherController.findBySingleTeacher
);


router.patch(
  "/update-teacher/:teacherId",
  branchAdminAuth(UserRole.BRANCH_ADMIN),
  validateRequest(teacherValidation.TeacherUpdateSchema),
  TeacherController.updateTeacher
);

router.delete(
  "/delete-teacher/:teacherId",
  branchAdminAuth(UserRole.BRANCH_ADMIN),
  TeacherController.deleteTeacher
);

router.get(
  "/find-specific-institution-all-teachers/:subscriptionId",
  auth(UserRole.INSTITUTIONAL_OWNER),
  TeacherController.findByAllTeachers_Institutional_Owner
);








const TeacherRoute = router;
export default TeacherRoute;