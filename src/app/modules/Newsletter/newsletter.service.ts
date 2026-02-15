import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { INewsletterFilter, INewsletterResponse } from "./newsletter.interface";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";

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

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.newsletterSubscriber.count({
    where: whereConditions,
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
