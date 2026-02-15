import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { NewsletterService } from "./newsletter.service";
import { pick } from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import httpStatus from "http-status";

// anyone can subscribe
const createNewsletterSubscriber = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const result = await NewsletterService.createNewsletterSubscriber(email);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Newsletter subscriber created successfully",
      data: result,
    });
  }
);

// admin only routes
const getAllNewsletterSubscribers = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, ["searchTerm", "isActive"]);
    const options = pick(req.query, paginationFields);

    const result = await NewsletterService.getAllNewsletterSubscribers(
      filters,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Newsletter subscribers retrieved successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

// admin only routes
const deleteNewsletterSubscriber = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await NewsletterService.deleteNewsletterSubscriber(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Newsletter subscriber deleted successfully",
      data: result,
    });
  }
);

// admin only routes
const updateNewsletterSubscriberStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const result = await NewsletterService.updateNewsletterSubscriberStatus(
      id,
      isActive
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Newsletter subscriber status updated successfully",
      data: result,
    });
  }
);

export const NewsletterController = {
  createNewsletterSubscriber,
  getAllNewsletterSubscribers,
  deleteNewsletterSubscriber,
  updateNewsletterSubscriberStatus,
};
