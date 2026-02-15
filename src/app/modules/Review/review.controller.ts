import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ReviewService } from "./review.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";


// create trip service review
const createTripServiceReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { tripServiceId, rating, comment } = req.body;

  const result = await ReviewService.createTripServiceReview(
    userId,
    tripServiceId,
    rating,
    comment
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

export const ReviewController = {
  createTripServiceReview,
};
