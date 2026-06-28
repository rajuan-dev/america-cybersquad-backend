import { UserRole } from '@prisma/client';
import auth from '../../middlewares/auth';

import  express, { NextFunction, Response, Request } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import landingPageValidation from './landingPage.validation';
import LandingPageController from './landingPage.controller';
import { uploadFile } from '../../../utils/uploadToS3';
import ApiError from '../../../errors/ApiErrors';
import httpStatus from 'http-status';
import path from "path";

const router=express.Router();

router.post("/mission", 
      auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
       validateRequest(landingPageValidation.missionSchema),
       LandingPageController.mission
      );
router.get("/find_by_mission", LandingPageController.findByMission)

/**
 * Vision
 */
router.post(
  "/vision",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(landingPageValidation.visionSchema),
  LandingPageController.vision
);

router.get(
  "/find_by_vision",
  LandingPageController.findByVision
);

router.post(
  "/create_team",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  uploadFile.profileImage,

  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse JSON
      if (req.body.data && typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
      }

      // Save only relative image path
      if (req.file?.path) {
        req.body.photo = path
          .relative(process.cwd(), req.file.path)
          .replace(/\\/g, "/");
      }

      next();
    } catch (error) {
      next(
        new ApiError(
          httpStatus.BAD_REQUEST,
          "Invalid JSON data",
          ""
        )
      );
    }
  },

  validateRequest(landingPageValidation.teamSchema),

  LandingPageController.createTeam
);

router.get("/find_by_team", 
 
LandingPageController.findByAllTeams);
router.get("/find_by_specific_team/:id", 
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  LandingPageController.findBySpecificTeam

);

router.patch(
  "/update_team/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  uploadFile.profileImage,

  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data && typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
      }

      // Save uploaded image path
      if (req.file?.path) {
        req.body.photo = path
          .relative(process.cwd(), req.file.path)
          .replace(/\\/g, "/");
      }

      next();
    } catch (error) {
      next(
        new ApiError(
          httpStatus.BAD_REQUEST,
          "Invalid JSON Data",
          ""
        )
      );
    }
  },

  validateRequest(landingPageValidation.updateTeamSchema),

  LandingPageController.updateTeam
);
router.delete(
  "/delete_team/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  LandingPageController.deleteTeam
);

router.post(
  "/create_faq",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(landingPageValidation.faqSchema),
  LandingPageController.createFaq
);

router.get("/find_by_all_faq", LandingPageController.findByAllFAQ);

router.post(
  "/create_blog",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  uploadFile.profileImage,

  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data && typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
      }

      if (req.file?.path) {
        req.body.photo = path
          .relative(process.cwd(), req.file.path)
          .replace(/\\/g, "/");
      }

      next();
    } catch (error) {
      next(
        new ApiError(
          httpStatus.BAD_REQUEST,
          "Invalid JSON Data",
          ""
        )
      );
    }
  },

  validateRequest(landingPageValidation.blogSchema),

  LandingPageController.createBlog
);

router.get("/find_by_all_blogs", LandingPageController.findByAllBlogs)

router.post(
  "/create_newsletter",
  validateRequest(landingPageValidation.newsletterSchema),
  LandingPageController.createNewsletter
);

const LandingPageRouter= router;
export default LandingPageRouter;
