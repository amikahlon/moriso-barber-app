export interface BusinessSettings {
  id: string;
  businessName: string;
  slotIntervalMinutes: number;
  minCancelNoticeMinutes: number;
  timezone: string;
  address: string;
  googleMapsUrl: string;
  phone: string;
  isBookingEnabled: boolean;
  instagramUrl: string;
  facebookUrl: string;
  logoUrl: string;
}
