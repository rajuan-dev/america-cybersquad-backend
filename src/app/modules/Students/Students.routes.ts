import z from "zod";
import { Router } from "express";

import studentValidation from "./Students.validation";
import validateRequest from "../../middlewares/validateRequest";    
import StudentsController from "./Students.controller";
import branchAdminAuth from "../../middlewares/branchAdminAuth";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";



const router = Router();

router.post(
  "/create-student",
  branchAdminAuth(UserRole.BRANCH_ADMIN),
  validateRequest(studentValidation.createStudentZodSchema),
  StudentsController.createStudent,
);

router.get(
  "/find-specific-branch-all-students",
  branchAdminAuth(UserRole.BRANCH_ADMIN),
  StudentsController.findByAllStudents
);

router.get(
  "/find-specific-institution-all-students/:subscriptionId",
  auth(UserRole.INSTITUTIONAL_OWNER),
  StudentsController.findByAllStudents_Institutional_Owner
);


router.delete(
  "/delete-student/:studentId",
  branchAdminAuth(UserRole.BRANCH_ADMIN),
  StudentsController.deleteStudent
);

router.patch(
  "/update-student/:studentId",
  branchAdminAuth(UserRole.BRANCH_ADMIN),
  validateRequest(studentValidation.updateStudentZodSchema),
  StudentsController.updateStudent
);

router.get("/find_my_all_class_list", branchAdminAuth(UserRole.STUDENT),StudentsController.findMyAllClassList);
router.get("/find_my_class_assignment",branchAdminAuth(UserRole.STUDENT), StudentsController.findMyClassAssignment)


const  studentRoute=router;
export default studentRoute;