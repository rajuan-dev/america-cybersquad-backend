import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import stripe from "../../../helpars/stripe";
import {
  BookingStatus,
  EveryServiceStatus,
  PaymentStatus,
  UserStatus,
} from "@prisma/client";
import config from "../../../config";
import Stripe from "stripe";

// stripe account onboarding
const stripeAccountOnboarding = async (userId: string) => {
  // find user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // if user already has stripe account
  if (user.stripeAccountId) {
    const account = await stripe.accounts.retrieve(user.stripeAccountId);

    const cardPayments = account.capabilities?.card_payments;
    const transfers = account.capabilities?.transfers;
    const requirements = account.requirements?.currently_due || [];

    // if verified
    if (cardPayments === "active" && transfers === "active") {
      // update DB to mark as connected
      await prisma.user.update({
        where: { id: user.id },
        data: { isStripeConnected: true },
      });

      return {
        status: "verified",
        message: "Stripe account verified successfully.",
        capabilities: account.capabilities,
      };
    }

    // if not verified → generate onboarding link
    const accountLinks = await stripe.accountLinks.create({
      account: user.stripeAccountId,
      refresh_url: `${config.stripe.refreshUrl}?accountId=${user.stripeAccountId}`,
      return_url: `${config.stripe.returnUrl}?accountId=${user.stripeAccountId}`,
      type: "account_onboarding",
    });

    // update DB to store stripeAccountId & mark connected
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeAccountId: user.stripeAccountId,
        isStripeConnected: true,
      },
    });

    return {
      status: requirements.length > 0 ? "requirements_due" : "pending",
      message:
        requirements.length > 0
          ? "Additional information required for Stripe verification."
          : "Your Stripe account verification is under review.",
      requirements,
      onboardingLink: accountLinks.url,
    };
  }

  // if user has no stripe account → create new account
  const account = await stripe.accounts.create({
    type: "express",
    country: "US",
    email: user?.email,
    business_type: "individual",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    settings: {
      payouts: {
        schedule: {
          delay_days: 2, // minimum allowed
        },
      },
    },
  });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${config.stripe.refreshUrl}?accountId=${account.id}`,
    return_url: `${config.stripe.returnUrl}?accountId=${account.id}`,
    type: "account_onboarding",
  });

  // update DB with stripeAccountId & mark connected
  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeAccountId: account.id,
      isStripeConnected: true,
    },
  });

  return {
    status: "pending",
    message: "Your Stripe account verification is under review.",
    capabilities: account.capabilities,
    onboardingLink: accountLink.url,
  };
};

// checkout session on stripe
const createStripeCheckoutSession = async (
  userId: string,
  tripServiceBookingId: string,
  description: string,
) => {
  // find user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // find booking
  const booking = await prisma.tripServiceBooking.findUnique({
    where: { id: tripServiceBookingId },
  });

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
  }

  // ownership check
  if (booking.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Unauthorized booking");
  }

  // prevent duplicate payment
  if (booking.status === BookingStatus.CONFIRMED) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Booking already paid");
  }

  const amount = Math.round(booking.totalPrice * 100);

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "EUR",
          product_data: {
            name: "Trip Service Booking",
            description: description || "Service Payment",
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],

    success_url: config.stripe.checkout_success_url,
    cancel_url: config.stripe.checkout_cancel_url,

    metadata: {
      userId,
      tripServiceBookingId,
    },
  });

  await prisma.payment.create({
    data: {
      amount: booking.totalPrice,
      currency: "EUR",
      description,
      sessionId: checkoutSession.id,
      paymentIntentId: null,
      status: PaymentStatus.UNPAID,
      serviceType: booking.serviceType,
      userId,
      tripServiceBookingId: booking.id,
      tripServiceId: booking.tripServiceId,
    },
  });

  return {
    id: checkoutSession.id,
    url: checkoutSession.url,
  };
};

// stripe handle webhook
const stripeHandleWebhook = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const sessionId = session.id;
      const paymentIntentId = session.payment_intent as string;

      if (!paymentIntentId) break;

      // find payment record
      const payment = await prisma.payment.findFirst({
        where: { sessionId },
      });

      if (!payment) break;

      // duplicate protection
      if (payment.status === "PAID") break;

      // retrieve payment intent from Stripe
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      // amount validation
      if (paymentIntent.amount_received !== payment.amount * 100) {
        throw new Error("Payment amount mismatch");
      }

      // transaction update
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            paymentIntentId,
            status: "PAID",
          },
        }),

        prisma.tripServiceBooking.update({
          where: { id: payment.tripServiceBookingId! },
          data: {
            status: "CONFIRMED",
          },
        }),

        prisma.tripService.update({
          where: { id: payment.tripServiceId! },
          data: {
            isService: "BOOKED",
          },
        }),
      ]);

      break;
    }

    default:
      console.log("Event ignored:", event.type);
      break;
  }
};

// get my all my transactions
const getMyTransactions = async (userId: string) => {
  const transactions = await prisma.payment.findMany({
    where: { userId, status: PaymentStatus.PAID },
  });

  if (!transactions || transactions.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No transactions found");
  }

  return transactions;
};

export const PaymentService = {
  stripeAccountOnboarding,
  createStripeCheckoutSession,
  stripeHandleWebhook,
  getMyTransactions,
};
