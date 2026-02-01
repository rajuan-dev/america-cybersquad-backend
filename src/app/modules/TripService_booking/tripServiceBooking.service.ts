import prisma from "../../../shared/prisma";

// create trip service booking
const createTripServiceBooking = async (userId: string, body: any) => {
  const result = await prisma.tripServiceBooking.create({
    data: {},
  });
};

export const TripServiceBookingService = {
  createTripServiceBooking,
};
