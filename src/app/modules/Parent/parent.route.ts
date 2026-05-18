import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import ParentController from "./parent.controller";

const router = express.Router();
router.get(
  "/find_my_children_all_result",
  auth(UserRole.parent),
  ParentController.findMyChildrenAllResult,
);

router.get(
  "/find_by_specific_student_attendance_report_parent/:subscriptionId",
  auth(UserRole.parent),
  ParentController.findBySpecificStudentAttendanceReportParent,
);

router.get("/avg_attendance_calculation/:subscriptionId",
     auth(UserRole.parent),
      ParentController.avgAttendanceCalculation
)

const ParentRouter = router;
export default ParentRouter;
