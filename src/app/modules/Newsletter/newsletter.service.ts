import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { INewsletterFilter, INewsletterResponse } from "./newsletter.interface";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import emailSender from "../../../helpars/emailSender";

// anyone can subscribe
const createNewsletterSubscriber = async (email: string) => {
  // check if email already exists
  const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
    where: { email },
  });

  if (existingSubscriber) {
    throw new ApiError(httpStatus.CONFLICT, "Email already subscribed");
  }

  const subscriber = await prisma.newsletterSubscriber.create({
    data: {
      email,
    },
  });

  // send welcome email
  const welcomeHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Welcome to Our Newsletter!</h2>
      <p>Hi,</p>
      <p>Thank you for subscribing to our newsletter. You're now part of our community!</p>
      <p>You'll receive the latest updates, news, and exclusive content directly in your inbox.</p>
      <p>Stay tuned for exciting updates!</p>
      <p>Best regards,<br>Wasiq Ali Team</p>
    </div>
  `;

  await emailSender("Welcome to Our Newsletter!", email, welcomeHtml);

  return subscriber;
};

// admin only routes
const getAllNewsletterSubscribers = async (
  filters: INewsletterFilter,
  options: IPaginationOptions,
): Promise<INewsletterResponse> => {
  const { page, limit, skip } = paginationHelpers.calculatedPagination(options);
  const { searchTerm, isActive } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      email: {
        contains: searchTerm,
      },
    });
  }

  if (isActive !== undefined) {
    andConditions.push({
      isActive: isActive,
    });
  }

  const where =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.newsletterSubscriber.count({
    where,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: subscribers,
  };
};

// admin only routes
const deleteNewsletterSubscriber = async (id: string) => {
  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { id },
  });

  if (!subscriber) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subscriber not found");
  }

  await prisma.newsletterSubscriber.delete({
    where: { id },
  });

  return subscriber;
};

// admin only routes
const updateNewsletterSubscriberStatus = async (
  id: string,
  isActive: boolean,
) => {
  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { id },
  });

  if (!subscriber) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subscriber not found");
  }

  const updatedSubscriber = await prisma.newsletterSubscriber.update({
    where: { id },
    data: { isActive },
  });

  return updatedSubscriber;
};

export const NewsletterService = {
  createNewsletterSubscriber,
  getAllNewsletterSubscribers,
  deleteNewsletterSubscriber,
  updateNewsletterSubscriberStatus,
};
