import express from "express";
import { TripServiceBookingController } from "./tripServiceBooking.controller";

const router = express.Router();

//
router.post("/", TripServiceBookingController.createTripServiceBooking);

export const tripServiceBookingRoute = router;
