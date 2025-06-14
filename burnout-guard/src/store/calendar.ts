// src/store/calendar.ts
import { create } from 'zustand';

// Define types for calendar data
interface CalendarData {
  date: string;
  meetings: number;
  breaks: number;
  afterHoursWork: number;
}

type CalendarState = {
  data: CalendarData | null;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
};

// Mock API fetch function (can be replaced with real API calls)
const fetchCalendarData = async (): Promise<CalendarData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mock data
  return {
    date: new Date().toISOString(),
    meetings: Math.floor(Math.random() * 10),
    breaks: Math.floor(Math.random() * 5),
    afterHoursWork: Math.floor(Math.random() * 3)
  };
};

// Zustand store
export const useCalendarStore = create<CalendarState>((set) => ({
  data: null,
  loading: false,
  error: null,
  fetchData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchCalendarData();
      set({ data, loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  }
}));
