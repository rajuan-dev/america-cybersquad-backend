import { RequestHandler } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import stripeService from "./stripe.service";

const createCheckoutSession: RequestHandler = catchAsync(async (req, res) => {
  const result = await stripeService.createCheckoutSessionIntoStripe(
    req.user.id,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Stripe checkout session created successfully",
    data: result,
  });
});

const handleWebhook: RequestHandler = catchAsync(async (req, res) => {
  const result = await stripeService.handleStripeWebhookEvent(
    req.headers["stripe-signature"],
    req.rawBody
  );

  res.locals.responseBody = result;
  res.status(httpStatus.OK).json(result);
});

const stripeController = {
  createCheckoutSession,
  handleWebhook,
};

export default stripeController;
