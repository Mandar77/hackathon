import { create } from 'zustand'
import { useAuthStore } from '@/store/auth'

interface CalendarData {
  userId: string
  date: string
  meetings: number
  breaks: number
  afterHoursWork: number
}

interface CalendarState {
  data: CalendarData | null
  loading: boolean
  error: string | null
  fetchData: () => Promise<void>
}

const fetchCalendarData = async (userId: string): Promise<CalendarData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Return mock data with the provided userId
  return {
    userId,
    date: new Date().toISOString(),
    meetings: Math.floor(Math.random() * 10),
    breaks: Math.floor(Math.random() * 5),
    afterHoursWork: Math.floor(Math.random() * 3)
  }
}

export const useCalendarStore = create<CalendarState>((set) => ({
  data: null,
  loading: false,
  error: null,
  fetchData: async () => {
    set({ loading: true, error: null })
    try {
      const userId = useAuthStore.getState().user?.id || ''
      const data = await fetchCalendarData(userId)
      set({ data, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      })
    }
  }
}))
