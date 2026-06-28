import { UserRole } from '@prisma/client';
import auth from '../../middlewares/auth';

import  express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import landingPageValidation from './landingPage.validation';
import LandingPageController from './landingPage.controller';


const router=express.Router();

router.post("/mission", 
      auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
       validateRequest(landingPageValidation.missionSchema),
       LandingPageController.mission
      );
router.get("/find_by_mission", LandingPageController.findByMission)
const LandingPageRouter= router;
export default LandingPageRouter;
