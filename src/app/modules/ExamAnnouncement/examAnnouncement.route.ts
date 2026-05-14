import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";

import ExamAnnouncementController from "./examAnnouncement.controller";
import AnnouncementValidation from "./examAnnouncement.validation";



const router = express.Router();

router.post(
  "/create_exam_announcement",
  auth(UserRole.TEACHER),
  validateRequest(
   AnnouncementValidation.createAnnouncementValidationSchema
  ),
  ExamAnnouncementController.examAnnouncementService
);
router.get("/find_my_announcement_exam_list/:subscriptionId",  auth(UserRole.TEACHER), ExamAnnouncementController.findMyAnnouncementExamList);
router.get("/find_by_specific_announcement_exam/:id",
  auth(UserRole.TEACHER),
ExamAnnouncementController.findBySpecificAnnouncementExam);

router.patch("/update_announcement_exam/:id", 
  auth(UserRole.TEACHER),
  validateRequest(AnnouncementValidation.updateAnnouncementExamSchema) , 
  ExamAnnouncementController.updateAnnouncementExam);


router.delete("/delete_announcement_exam/:id", 
  auth(UserRole.TEACHER),
 ExamAnnouncementController.deleteAnnouncementExam);

 router.get("/find_by_specific_student_announcement_list/:subscriptionId",
  auth(UserRole.STUDENT),
  ExamAnnouncementController.findBySpecificStudentAnnouncementExamList);


  router.get("/find_by_participant_student_list/:examAnnouncementId", 
    auth(UserRole.TEACHER),
  ExamAnnouncementController.findByParticipantStudentList);
  
  


const examAnnouncementRouter = router;

export default examAnnouncementRouter;