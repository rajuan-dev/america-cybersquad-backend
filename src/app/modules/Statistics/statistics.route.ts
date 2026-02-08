import express from "express";
import { StatisticsController } from "./statistics.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = express.Router();

// get overview total users, total agents,total revenue
router.get(
  "/overview",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  StatisticsController.getOverview,
);

// get agent total earings and bookings
router.get(
  "/earnings-bookings-agent-dashboard",
  auth(UserRole.AGENT),
  StatisticsController.getAgentTotalEarningsAndBookings,
);

// get agent bookings
router.get(
  "/agent-bookings",
  auth(UserRole.AGENT),
  StatisticsController.getAgentBookings,
);

// get user dashboard tab info
router.get(
  "/user-dashboard-tab-info",
  auth(UserRole.USER),
  StatisticsController.getUserDashboardTabInfo,
);

// admin total earnings
router.get(
  "/admin-earnings",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  StatisticsController.getAdminTotalEarnings,
);

// get my properties, services bookings, guest bookings, earnings
router.get(
  "/my-dashboard/property-owner",
  auth(UserRole.AGENT),
  StatisticsController.getMyDashboardForPropertyOwner,
);

// get my services, services bookings,  earnings
router.get(
  "/my-dashboard/service-provider",
  auth(UserRole.AGENT),
  StatisticsController.getMyDashboardForServiceProvider,
);

export const statisticsRoutes = router;
