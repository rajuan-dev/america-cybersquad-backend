import z from "zod";
import { Router } from "express";

import studentValidation from "./Students.validation";
import validateRequest from "../../middlewares/validateRequest";    
import StudentsController from "./Students.controller";
import branchAdminAuth from "../../middlewares/branchAdminAuth";
import { UserRole } from "@prisma/client";



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


const  studentRoute=router;
export default studentRoute;