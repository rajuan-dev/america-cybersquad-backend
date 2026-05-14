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

const examAnnouncementRouter = router;

export default examAnnouncementRouter;