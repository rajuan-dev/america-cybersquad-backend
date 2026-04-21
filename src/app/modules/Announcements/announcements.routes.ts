import { UserRole } from '@prisma/client';
import express from  'express';
import validateRequest from '../../middlewares/validateRequest';
import AnnouncementsValidation from './announcements.validation';
import AnnouncementsController from './announcements.controller';
import auth from '../../middlewares/auth';


const router=express.Router();
router.post("/send_new_announcement", validateRequest(AnnouncementsValidation.announcementsSchema), AnnouncementsController.sendAnnouncements);
router.get("/find_by_announcement", AnnouncementsController.findByAnnouncement);
router.get("/find_by_all_announcement", auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), AnnouncementsController.findAllAnnouncement);



const announcementRouter=router;

export default announcementRouter;

