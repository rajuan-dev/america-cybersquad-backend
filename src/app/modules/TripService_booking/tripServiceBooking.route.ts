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
  auth(UserRole.USER, UserRole.AGENT, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(
    TripServiceBookingValidation.createTripServiceBookingValidation,
  ),
  TripServiceBookingController.createTripServiceBooking,
);

// get my trip service booking
router.get(
  "/my-bookings",
  auth(UserRole.USER, UserRole.AGENT),
  TripServiceBookingController.getMyTripServiceBookings,
);

export const tripServiceBookingRoute = router;
