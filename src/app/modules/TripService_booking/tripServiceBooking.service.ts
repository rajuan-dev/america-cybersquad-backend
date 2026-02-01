import prisma from "../../../shared/prisma";
import { TripServiceBooking, ServiceType, BookingStatus } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { ICreateTripServiceBooking } from "./tripServiceBooking.interface";

// create trip service booking
const createTripServiceBooking = async (
  userId: string,
  payload: ICreateTripServiceBooking,
): Promise<TripServiceBooking> => {
  const {
    tripServiceId,
    from,
    fromLat,
    fromLng,
    to,
    toLat,
    toLng,
    travelDate,
    timeSlot,
    passengers,
    luggage,
    isReturn,
    returnDate,
    bookingVehicles = [],
    bookingStoppages = [],
  } = payload;

  // trip service exists and is available
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

  if (tripService.status !== "ACTIVE") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Trip service is not available");
  }

  // vehicles exist and are active
  if (bookingVehicles.length > 0) {
    const vehicleIds = bookingVehicles.map((v) => v.vehicleId);
    const vehicles = await prisma.vehicle.findMany({
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
  if (bookingStoppages.length > 0) {
    const stoppageIds = bookingStoppages.map((s) => s.stoppageId);
    const stoppages = await prisma.stoppage.findMany({
      where: { id: { in: stoppageIds } },
    });

    if (stoppages.length !== stoppageIds.length) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Some stoppages are not available",
      );
    }
  }

  // calculate prices
  let vehiclePrice = 0;
  let stoppagePrice = 0;

  // get all vehicles for pricing calculation
  const vehicleIds = bookingVehicles.map((v) => v.vehicleId);
  const vehicles =
    vehicleIds.length > 0
      ? await prisma.vehicle.findMany({
          where: { id: { in: vehicleIds } },
        })
      : [];

  // get all stoppages for pricing calculation
  const stoppageIds = bookingStoppages.map((s) => s.stoppageId);
  const stoppages =
    stoppageIds.length > 0
      ? await prisma.stoppage.findMany({
          where: { id: { in: stoppageIds } },
        })
      : [];

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
  const totalPrice = basePrice + vehiclePrice + stoppagePrice;

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
        serviceType: tripService.serviceType as ServiceType,
        timeSlot,
        travelDate,
        passengers,
        luggage,
        basePrice,
        distanceKm: tripService.distanceKm,
        vehiclePrice,
        stoppagePrice,
        totalPrice,
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

export const TripServiceBookingService = {
  createTripServiceBooking,
};
