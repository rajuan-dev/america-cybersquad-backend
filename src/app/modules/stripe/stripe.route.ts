import express from "express";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import subscriptionValidation from "../subscription/subscription.validation";
import stripeController from "./stripe.controller";

const route = express.Router();

route.post(
  "/create-checkout-session",
  auth(UserRole.ADMIN, UserRole.INSTITUTIONAL_OWNER),
  validateRequest(subscriptionValidation.subscriptionsSchema),
  stripeController.createCheckoutSession
);

route.post("/webhook", stripeController.handleWebhook);

const stripeRoute = route;

export default stripeRoute;
