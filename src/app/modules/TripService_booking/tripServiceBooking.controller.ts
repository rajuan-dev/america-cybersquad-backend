import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { TripServiceBookingService } from "./tripServiceBooking.service";

// create trip service booking
const createTripServiceBooking = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const {} = req.body;

    const result = await TripServiceBookingService.createTripServiceBooking(
      userId,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Trip service booking created successfully",
      data: result,
    });
  },
);

export const TripServiceBookingController = {
  createTripServiceBooking,
};
