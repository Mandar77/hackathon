export interface User {
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
