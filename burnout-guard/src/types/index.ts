export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
}

export interface WorkPattern {
  meetingHours: number
  emailsAfterHours: number
  breakTime: number
  stressLevel: number
}

export interface BurnoutScore {
  overall: number
  workload: number
  boundaries: number
  recovery: number
}

export interface AIInteraction {
  id: string;
  userId: string;
  message: string;
  timestamp: string; // or Date
}
