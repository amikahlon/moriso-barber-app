import type { Booking } from "../../../types";

export const formatBookingDate = (bookingDate: string | null | undefined) => {
  if (!bookingDate) {
    return "תאריך לא זמין";
  }

  return new Date(bookingDate).toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

export const sortBookingsByStart = (bookings: Booking[]) =>
  bookings.slice().sort((a, b) => {
    const dateDiff =
      new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime();

    if (dateDiff !== 0) {
      return dateDiff;
    }

    return a.startTime.localeCompare(b.startTime);
  });
