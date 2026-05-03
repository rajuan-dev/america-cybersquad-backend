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

router.get("/find_by_specific_class_listOf_teacher", auth(UserRole.TEACHER), TeacherController.findBySpecificClassListOfTeacher);
router.get("/find_by_specific_student_listOf_teacher/:subscriptionId", auth(UserRole.TEACHER), TeacherController.findBySpecificStudentListOfTeachers); 
router.get("/find_by_specific_student_attendance_of_teacher/:subscriptionId", auth(UserRole.TEACHER), TeacherController.findBySpecificStudentAttendanceOfTeachers);  











const TeacherRoute = router;
export default TeacherRoute;