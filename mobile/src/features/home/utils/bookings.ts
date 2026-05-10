import type { Booking } from "../../../types";

const ACTIVE_STATUS: Booking["status"] = "active";
const UNAVAILABLE_DATE_LABEL =
  "\u05ea\u05d0\u05e8\u05d9\u05da \u05dc\u05d0 \u05d6\u05de\u05d9\u05df";

const parseBookingDateTime = (
  bookingDate: string | null | undefined,
  time: string | null | undefined,
) => {
  if (!bookingDate) {
    return null;
  }

  const [datePart] = bookingDate.split("T");
  const [year, month, day] = datePart.split("-").map(Number);

  if (!year || !month || !day) {
    const fallbackDate = new Date(bookingDate);
    return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
  }

  const [hours = 0, minutes = 0] = (time ?? "00:00")
    .slice(0, 5)
    .split(":")
    .map(Number);

  return new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
};

export const formatBookingDate = (bookingDate: string | null | undefined) => {
  const date = parseBookingDateTime(bookingDate, "12:00");

  if (!date) {
    return UNAVAILABLE_DATE_LABEL;
  }

  return date.toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

export const isUpcomingBooking = (booking: Booking, now = new Date()) => {
  if (booking.status !== ACTIVE_STATUS) {
    return false;
  }

  const relevantTime = booking.endTime || booking.startTime;
  const bookingDateTime = parseBookingDateTime(
    booking.bookingDate,
    relevantTime,
  );

  return !!bookingDateTime && bookingDateTime.getTime() >= now.getTime();
};

export const getUpcomingBookings = (bookings: Booking[], now = new Date()) =>
  bookings.filter((booking) => isUpcomingBooking(booking, now));

export const sortBookingsByStart = (bookings: Booking[]) =>
  bookings.slice().sort((a, b) => {
    const firstDate = parseBookingDateTime(a.bookingDate, a.startTime);
    const secondDate = parseBookingDateTime(b.bookingDate, b.startTime);
    const dateDiff =
      (firstDate?.getTime() ?? Number.MAX_SAFE_INTEGER) -
      (secondDate?.getTime() ?? Number.MAX_SAFE_INTEGER);

    if (dateDiff !== 0) {
      return dateDiff;
    }

    return a.startTime.localeCompare(b.startTime);
  });
