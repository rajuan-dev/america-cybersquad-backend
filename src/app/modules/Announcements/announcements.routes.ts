import { UserRole } from '@prisma/client';
import express from  'express';
import validateRequest from '../../middlewares/validateRequest';
import AnnouncementsValidation from './announcements.validation';
import AnnouncementsController from './announcements.controller';
import auth from '../../middlewares/auth';


const router=express.Router();
router.post("/send_new_announcement", validateRequest(AnnouncementsValidation.announcementsSchema), AnnouncementsController.sendAnnouncements);

const announcementRouter=router;

export default announcementRouter;

