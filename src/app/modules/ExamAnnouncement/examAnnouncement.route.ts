import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";

import ExamAnnouncementController from "./examAnnouncement.controller";
import AnnouncementValidation from "./examAnnouncement.validation";
import ExamAnnouncementServices from "./examAnnouncement.services";

const router = express.Router();

router.post(
  "/create_exam_announcement",
  auth(UserRole.TEACHER),
  validateRequest(AnnouncementValidation.createAnnouncementValidationSchema),
  ExamAnnouncementController.examAnnouncementService,
);
router.get(
  "/find_my_announcement_exam_list",
  auth(UserRole.TEACHER),
  ExamAnnouncementController.findMyAnnouncementExamList,
);
router.get(
  "/find_by_specific_announcement_exam/:id",
  auth(UserRole.TEACHER),
  ExamAnnouncementController.findBySpecificAnnouncementExam,
);

router.patch(
  "/update_announcement_exam/:id",
  auth(UserRole.TEACHER),
  validateRequest(AnnouncementValidation.updateAnnouncementExamSchema),
  ExamAnnouncementController.updateAnnouncementExam,
);

router.delete(
  "/delete_announcement_exam/:id",
  auth(UserRole.TEACHER),
  ExamAnnouncementController.deleteAnnouncementExam,
);

router.get(
  "/find_by_specific_student_announcement_list/:subscriptionId",
  auth(UserRole.STUDENT),
  ExamAnnouncementController.findBySpecificStudentAnnouncementExamList,
);

router.get(
  "/find_by_participant_student_list/:examAnnouncementId",
  auth(UserRole.TEACHER),
  ExamAnnouncementController.findByParticipantStudentList,
);

router.post(
  "/recorded_exam_grades",
  auth(UserRole.TEACHER),
  validateRequest(AnnouncementValidation.ExamGradesValidationSchema),
  ExamAnnouncementController.recordedExamGrades,
);

router.get(
  "/find_by_exam_grades_specific_teacher",
  auth(UserRole.TEACHER),
  ExamAnnouncementController.findByExamGradesSpecificTeacher,
);

router.get(
  "/find_by_specific_exam_grades/:id",
  auth(UserRole.TEACHER),
  ExamAnnouncementController.findBySpecificExamGrades,
);
router.patch("/update_exam_grades_specific_teacher/:id", auth(UserRole.TEACHER),validateRequest(AnnouncementValidation.UpdateExamGradesValidationSchema),ExamAnnouncementController.updateExamGradesSpecificTeacher)


router.delete("/delete_exam_grades_specific_teacher/:id", auth(UserRole.TEACHER),ExamAnnouncementController.deleteExamGradesSpecificTeacher);

router.get("/find_by_exam_grades_specific_student/:subscriptionId", auth(UserRole.STUDENT), ExamAnnouncementController.findByExamGradesSpecificStudent);


const examAnnouncementRouter = router;

export default examAnnouncementRouter;

// database password: 7s*n3BQN.Nb6jd4



