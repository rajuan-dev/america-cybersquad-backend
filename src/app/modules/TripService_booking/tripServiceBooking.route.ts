import express from "express";
import { TripServiceBookingController } from "./tripServiceBooking.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { TripServiceBookingValidation } from "./tripServiceBooking.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

// create trip service booking
router.post(
  "/:tripServiceId",
  auth(UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(
    TripServiceBookingValidation.createTripServiceBookingValidation,
  ),
  TripServiceBookingController.createTripServiceBooking,
);

export const tripServiceBookingRoute = router;
