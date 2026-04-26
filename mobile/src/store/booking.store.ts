import { create } from "zustand";
import type { Service } from "../types";

interface BookingState {
  selectedDate: string | null;
  selectedService: Service | null;
  selectedTimeSlot: string | null;

  setSelectedDate: (date: string) => void;
  setSelectedService: (service: Service) => void;
  setSelectedTimeSlot: (time: string) => void;
  resetBookingFlow: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedDate: null,
  selectedService: null,
  selectedTimeSlot: null,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedService: (service) => set({ selectedService: service }),
  setSelectedTimeSlot: (time) => set({ selectedTimeSlot: time }),

  resetBookingFlow: () =>
    set({
      selectedDate: null,
      selectedService: null,
      selectedTimeSlot: null,
    }),
}));
