import express from "express";
import { ReviewController } from "./review.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();


// create trip service review
router.post(
  "/service",
  auth(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.USER,
    UserRole.AGENT
  ),
  ReviewController.createTripServiceReview
);

export const reviewRoute = router;
