import express from "express";
import { TripServiceBookingController } from "./tripServiceBooking.controller";

const router = express.Router();

// create trip service booking
router.post("/", TripServiceBookingController.createTripServiceBooking);

export const tripServiceBookingRoute = router;
