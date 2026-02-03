import { ServiceType } from "@prisma/client";

export interface ICreateTripServiceBooking {
  tripServiceId: string;
  from: string;
  fromLat?: number;
  fromLng?: number;
  to: string;
  toLat?: number;
  toLng?: number;
  serviceType: ServiceType;
  travelDate: Date;
  timeSlot?: any;
  passengers: number;
  distanceKm?: number;
  luggage?: number;
  isReturn?: boolean;
  returnDate?: Date;
  bookingVehicles?: Array<{
    vehicleId: string;
    quantity: number;
  }>;
  bookingStoppages?: Array<{
    stoppageId: string;
    quantity: number;
  }>;
}
