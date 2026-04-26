export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface BookingUser {
  id: string;
  fullName: string;
  phone: string;
  email: string;
}

export interface Booking {
  id: string;
  customerId: string;
  serviceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status:
    | "active"
    | "completed"
    | "cancelled_by_customer"
    | "cancelled_by_admin";
  notes?: string;
  servicePriceSnapshot: number;
  user?: BookingUser;
  service?: Service;
}

export interface CreateBookingDto {
  serviceId: string;
  date: string;
  startTime: string;
  notes?: string;
}
