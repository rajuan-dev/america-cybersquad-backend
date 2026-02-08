import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatisticsService } from "./statistics.service";
import httpStatus from "http-status";
import { pick } from "../../../shared/pick";
import { filterField } from "./statistics.constant";
import { paginationFields } from "../../../constants/pagination";

// get overview total users, total agents,total revenue
const getOverview = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, filterField);

  const result = await StatisticsService.getOverview(filter);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Statistics fetched successfully",
    data: result,
  });
});

// get agent total earings and bookings
const getAgentTotalEarningsAndBookings = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { timeRange } = req.query;

    const result = await StatisticsService.getAgentTotalEarningsAndBookings(
      userId,
      timeRange as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Agent earnings and bookings fetched successfully",
      data: result,
    });
  },
);

// get agent bookings
const getAgentBookings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { timeRange, status } = req.query;

  const result = await StatisticsService.getAgentBookings(
    userId,
    timeRange as string,
    status as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Agent bookings fetched successfully",
    data: result,
  });
});

// get user dashboard tab info
const getUserDashboardTabInfo = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { status } = req.query;

    const result = await StatisticsService.getUserDashboardTabInfo(
      userId,
      status as string,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Agent bookings fetched successfully",
      data: result,
    });
  },
);

// admin total earnings
const getAdminTotalEarnings = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, paginationFields);

    const result = await StatisticsService.getAdminTotalEarnings(options);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin earnings fetched successfully",
      data: result,
    });
  },
);

// get my properties, services bookings, guest bookings, earnings
const getMyDashboardForPropertyOwner = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const result =
      await StatisticsService.getMyDashboardForPropertyOwner(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My dashboard fetched successfully",
      data: result,
    });
  },
);

// get my services, services bookings,  earnings
const getMyDashboardForServiceProvider = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const result =
      await StatisticsService.getMyDashboardForServiceProvider(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My dashboard fetched successfully",
      data: result,
    });
  },
);

export const StatisticsController = {
  getOverview,

  // sales
  getAgentTotalEarningsAndBookings,
  getAgentBookings,
  getUserDashboardTabInfo,
  getMyDashboardForPropertyOwner,
  getMyDashboardForServiceProvider,

  // admin earns
  getAdminTotalEarnings,
};
