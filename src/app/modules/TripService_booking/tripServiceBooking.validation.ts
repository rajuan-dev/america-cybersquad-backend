import { z } from "zod";

const createTripServiceBookingValidation = z.object({
  body: z.object({
    clientName: z.string().optional(),
    from: z.string().min(1, "From location is required"),
    fromLat: z.number().optional(),
    fromLng: z.number().optional(),
    to: z.string().min(1, "To location is required"),
    toLat: z.number().optional(),
    toLng: z.number().optional(),
    serviceType: z.enum([
      "BY_THE_HOUR",
      "DAY_TRIP",
      "MULTI_DAY_TOUR",
      "PRIVATE_TRANSFER",
      "AIRPORT_TRANSFER",
    ]),
    travelDate: z.string().transform((val) => new Date(val)),
    timeSlot: z.any().optional(),
    passengers: z.number().int().min(1, "Passengers must be at least 1"),
    luggage: z.number().int().min(0).optional(),
    isReturn: z.boolean().default(false),
    returnDate: z
      .string()
      .transform((val) => new Date(val))
      .optional(),
    bookingVehicles: z
      .array(
        z.object({
          vehicleId: z.string().min(1, "Vehicle ID is required"),
          quantity: z.number().int().min(1, "Quantity must be at least 1"),
        }),
      )
      .optional(),
    bookingStoppages: z
      .array(
        z.object({
          stoppageId: z.string().min(1, "Stoppage ID is required"),
          quantity: z.number().int().min(1, "Quantity must be at least 1"),
        }),
      )
      .optional(),
  }),
});

export const TripServiceBookingValidation = {
  createTripServiceBookingValidation,
};
