export const bookingQueryKeys = {
  services: ["booking-services"] as const,
  openDays: ["open-days"] as const,
  slots: (date: string, duration: number) => ["slots", date, duration] as const,
};
