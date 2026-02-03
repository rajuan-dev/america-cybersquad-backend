import prisma from "../../../shared/prisma";
import {
  TripServiceBooking,
  ServiceType,
  BookingStatus,
  ServiceStatus,
  Prisma,
} from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { ICreateTripServiceBooking } from "./tripServiceBooking.interface";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelpers } from "../../../helpars/paginationHelper";

// create trip service booking
const createTripServiceBooking = async (
  userId: string,
  tripServiceId: string,
  payload: ICreateTripServiceBooking,
): Promise<TripServiceBooking> => {
  const {
    from,
    fromLat,
    fromLng,
    to,
    toLat,
    toLng,
    serviceType,
    distanceKm,
    travelDate,
    timeSlot,
    passengers,
    luggage,
    isReturn,
    returnDate,
    bookingVehicles = [],
    bookingStoppages = [],
  } = payload;

  // find user
  const findUser = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!findUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // trip service exists
  const tripService = await prisma.tripService.findUnique({
    where: { id: tripServiceId },
    include: {
      tripServiceStoppages: {
        include: { stoppage: true },
      },
    },
  });

  if (!tripService) {
    throw new ApiError(httpStatus.NOT_FOUND, "Trip service not found");
  }

  if (tripService.status !== ServiceStatus.ACTIVE) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Trip service is not available");
  }

  // vehicles exist and are active
  let vehicles: any[] = [];
  if (bookingVehicles.length > 0) {
    const vehicleIds = bookingVehicles.map((v) => v.vehicleId);
    vehicles = await prisma.vehicle.findMany({
      where: {
        id: { in: vehicleIds },
        isActive: true,
      },
    });

    if (vehicles.length !== vehicleIds.length) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Some vehicles are not available",
      );
    }
  }

  // stoppages exist
  let stoppages: any[] = [];
  if (bookingStoppages.length > 0) {
    const stoppageIds = bookingStoppages.map((s) => s.stoppageId);
    stoppages = await prisma.stoppage.findMany({
      where: { id: { in: stoppageIds } },
    });

    if (stoppages.length !== stoppageIds.length) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Some stoppages are not available",
      );
    }
  }

  // check passenger capacity
  const totalSeat = bookingVehicles.reduce((sum, bv) => {
    const vehicle = vehicles.find((v) => v.id === bv.vehicleId);
    return sum + (vehicle?.seatCount || 0) * bv.quantity;
  }, 0);

  if (passengers > totalSeat) {
    throw new ApiError(400, "Passenger exceeds vehicle capacity");
  }

  // calculate prices vehicle and stoppage
  let vehiclePrice = 0;
  let stoppagePrice = 0;

  // calculate vehicle prices
  for (const bookingVehicle of bookingVehicles) {
    const vehicle = vehicles.find((v) => v.id === bookingVehicle.vehicleId);
    if (!vehicle) continue;

    let price = vehicle.basePrice;
    if (vehicle.pricePerKm && tripService.distanceKm) {
      price += vehicle.pricePerKm * tripService.distanceKm;
    }
    vehiclePrice += price * bookingVehicle.quantity;
  }

  // calculate stoppage prices
  for (const bookingStoppage of bookingStoppages) {
    const stoppage = stoppages.find((s) => s.id === bookingStoppage.stoppageId);
    if (!stoppage) continue;
    stoppagePrice += stoppage.price * bookingStoppage.quantity;
  }

  // calculate total price
  const basePrice = tripService.price || 0;
  let totalPrice = basePrice + vehiclePrice + stoppagePrice;

  // return price calculation
  let returnPrice: number | null = null;

  if (isReturn && returnDate) {
    returnPrice = totalPrice; // can be dynamic
    totalPrice += returnPrice;
  }

  // create booking with transaction
  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.tripServiceBooking.create({
      data: {
        from,
        fromLat,
        fromLng,
        to,
        toLat,
        toLng,
        serviceType: tripService.serviceType,
        timeSlot,
        travelDate,
        passengers,
        luggage,
        basePrice,
        distanceKm,
        vehiclePrice,
        stoppagePrice,
        totalPrice,
        returnPrice,
        isReturn,
        returnDate,
        status: BookingStatus.PENDING,
        userId,
        tripServiceId,
      },
    });

    // create booking vehicles
    if (bookingVehicles.length > 0) {
      const bookingVehicleData = bookingVehicles.map((bv) => {
        const vehicle = vehicles.find((v) => v.id === bv.vehicleId);
        if (!vehicle) return null;

        let price = vehicle.basePrice;
        if (vehicle.pricePerKm && tripService.distanceKm) {
          price += vehicle.pricePerKm * tripService.distanceKm;
        }

        return tx.bookingVehicle.create({
          data: {
            bookingId: booking.id,
            vehicleId: bv.vehicleId,
            quantity: bv.quantity,
            price,
          },
        });
      });

      await Promise.all(bookingVehicleData.filter(Boolean));
    }

    // create booking stoppages
    if (bookingStoppages.length > 0) {
      const bookingStoppageData = bookingStoppages.map((bs) => {
        const stoppage = stoppages.find((s) => s.id === bs.stoppageId);
        if (!stoppage) return null;

        return tx.bookingStoppage.create({
          data: {
            bookingId: booking.id,
            stoppageId: bs.stoppageId,
            quantity: bs.quantity,
            price: stoppage.price,
          },
        });
      });

      await Promise.all(bookingStoppageData.filter(Boolean));
    }

    // update booking count trip service
    // await tx.tripService.update({
    //   where: { id: tripServiceId },
    //   data: {
    //     bookingCount: {
    //       increment: 1,
    //     },
    //   },
    // });

    return booking;
  });

  return result;
};

// get my trip service booking
const getMyTripServiceBookings = async (
  userId: string,
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = paginationHelpers.calculatedPagination(options);

  const filters: Prisma.TripServiceBookingWhereInput[] = [];

  filters.push({
    userId,
  });

  const where: Prisma.TripServiceBookingWhereInput = {
    AND: filters,
  };

  const result = await prisma.tripServiceBooking.findMany({
    where,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { id: "desc" },
  });

  const total = await prisma.tripServiceBooking.count({
    where,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

export const TripServiceBookingService = {
  createTripServiceBooking,
  getMyTripServiceBookings,
};
