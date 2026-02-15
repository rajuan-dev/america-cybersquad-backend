import { Router } from "express";
import { NewsletterController } from "./newsletter.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = Router();

// anyone can subscribe
router.post(
  "/",
  NewsletterController.createNewsletterSubscriber
);

// admin only routes
router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  NewsletterController.getAllNewsletterSubscribers
);

// admin only routes
router.patch(
  "/:id/status",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  NewsletterController.updateNewsletterSubscriberStatus
);

// admin only routes
router.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  NewsletterController.deleteNewsletterSubscriber
);

export const newsletterRoutes = router;
