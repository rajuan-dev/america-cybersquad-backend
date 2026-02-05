import express from "express";
import { StatisticsController } from "./statistics.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = express.Router();

// get overview total clients, total providers,total revenue
router.get(
  "/overview",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  StatisticsController.getOverview,
);

// partner total earings hotel
router.get(
  "/earnings-hotel",
  auth(UserRole.AGENT),
  StatisticsController.getPartnerTotalEarningsHotel,
);

// service provider total earnings service
router.get(
  "/earnings-service",
  auth(UserRole.AGENT),
  StatisticsController.getServiceProviderTotalEarningsService,
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
