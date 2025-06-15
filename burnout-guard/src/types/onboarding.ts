// src/types/onboarding.ts
export interface UserPreferences {
    id?: string
    user_id: string
    onboarding_step?: number
    onboarding_complete?: boolean
    stress_factors?: string[]
    workload_concerns?: string[]
    sleep_patterns?: string
    work_schedule?: string
    wellness_priorities?: string[]
    notification_preferences?: Record<string, any>
    created_at?: string
    updated_at?: string
  }
  
  export interface UserGoals {
    id?: string
    user_id: string
    primary_goals?: string[]
    wellness_targets?: Record<string, any>
    daily_goals?: Record<string, any>
    weekly_goals?: Record<string, any>
    monthly_goals?: Record<string, any>
    goal_priority?: 'high' | 'medium' | 'low'
    target_completion_date?: string
    created_at?: string
    updated_at?: string
  }
  
  export interface WatchData {
    id?: string
    user_id: string
    date: string
    sleep_duration_minutes?: number
    sleep_efficiency_percentage?: number
    resting_heart_rate?: number
    steps?: number
    stress_score?: number
    recovery_score?: number
    readiness_score?: number
    deep_sleep_minutes?: number
    rem_sleep_minutes?: number
    light_sleep_minutes?: number
    calories_burned?: number
    active_minutes?: number
    raw_data?: Record<string, any>
    data_source?: string
    synced_at?: string
    created_at?: string
    updated_at?: string
  }
  
  // Update your CalendarData interface in /src/types/onboarding.ts

export interface CalendarData {
  id?: string
  user_id: string
  date: string  // DATE field - daily aggregation
  
  // Meeting analysis
  total_meeting_minutes?: number
  meeting_count?: number
  back_to_back_meetings?: number
  longest_meeting_minutes?: number
  
  // Work timing
  first_event_time?: string  // TIME field
  last_event_time?: string   // TIME field  
  work_duration_minutes?: number
  after_hours_minutes?: number
  
  // Focus time analysis
  focus_blocks_count?: number
  longest_focus_block_minutes?: number
  fragmented_time_minutes?: number
  
  // Meeting types
  one_on_one_count?: number
  team_meeting_count?: number
  external_meeting_count?: number
  
  // Raw calendar events for this day
  raw_events?: any[]  // JSON array of Google Calendar events
  
  created_at?: string
}

export interface CalendarData {
    id?: string
    user_id: string
    date: string  // DATE field - daily aggregation
    
    // Meeting analysis
    total_meeting_minutes?: number
    meeting_count?: number
    back_to_back_meetings?: number
    longest_meeting_minutes?: number
    
    // Work timing
    first_event_time?: string  // TIME field
    last_event_time?: string   // TIME field  
    work_duration_minutes?: number
    after_hours_minutes?: number
    
    // Focus time analysis
    focus_blocks_count?: number
    longest_focus_block_minutes?: number
    fragmented_time_minutes?: number
    
    // Meeting types
    one_on_one_count?: number
    team_meeting_count?: number
    external_meeting_count?: number
    
    // Raw calendar events for this day
    raw_events?: any[]  // JSON array of Google Calendar events
    
    created_at?: string
  }
  
  // Individual calendar event (for processing, not stored directly)
  export interface CalendarEvent {
    id: string
    summary: string
    start: {
      dateTime?: string
      date?: string
      timeZone?: string
    }
    end: {
      dateTime?: string  
      date?: string
      timeZone?: string
    }
    attendees?: Array<{
      email: string
      responseStatus: string
    }>
    organizer?: {
      email: string
      self?: boolean
    }
    recurring?: boolean
    location?: string
    description?: string
  }
  
  export interface DailyWellnessScore {
    id?: string
    user_id: string
    date: string
    overall_wellness_score?: number
    sleep_score?: number
    stress_score?: number
    workload_score?: number
    physical_activity_score?: number
    burnout_risk_score?: number
    factors_analyzed?: Record<string, any>
    recommendations?: string[]
    calculation_method?: string
    confidence_level?: number
    created_at?: string
    updated_at?: string
  }
  
  export interface AIIntervention {
    id?: string
    user_id: string
    intervention_type: 'reminder' | 'suggestion' | 'alert' | 'coaching'
    title: string
    message: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    trigger_condition?: Record<string, any>
    scheduled_for?: string
    is_delivered?: boolean
    delivered_at?: string
    user_response?: 'accepted' | 'dismissed' | 'snoozed'
    effectiveness_rating?: number
    created_at?: string
    updated_at?: string
  }
  
  export interface Integration {
    id?: string
    user_id: string
    integration_type: 'calendar' | 'watch' | 'email' | 'slack' | 'other'
    provider_name: string
    status: 'connected' | 'disconnected' | 'error' | 'pending'
    connection_config?: Record<string, any>
    last_sync_at?: string
    last_sync_error?: string
    sync_frequency?: 'real-time' | 'hourly' | 'daily' | 'manual'
    permissions_granted?: string[]
    created_at?: string
    updated_at?: string
  }

export interface OnboardingFormState {
    // Step 1: Work Context
    job_role?: string;
    industry?: string;
    company_size?: string;
    work_location?: string;
    working_hours_start?: number;
    working_hours_end?: number;
    timezone?: string;
    team_size?: number;
    manager_relationship?: string;
    work_autonomy?: string;
    
    // Step 2: AI Preferences  
    communication_style?: string;
    intervention_frequency?: string;
    focus_areas?: string[];
    preferred_checkin_times?: number[];
    
    // Step 3: Goals & Motivations
    primary_goals?: string[];
    specific_goals?: string[];
    motivation_text?: string;
    biggest_challenges?: string[];
    previous_burnout_experience?: boolean;
    burnout_severity?: number;
    success_metrics?: string[];
    goal_timeline?: string;
    commitment_level?: string;
  }
  
  // Form errors
  export interface OnboardingFormErrors {
    step1?: Partial<Record<keyof UserPreferences, string>>;
    step2?: Partial<Record<keyof UserPreferences, string>>;
    step3?: Partial<Record<keyof UserGoals, string>>;
  }
  
  // Constants that the hooks expect
  export const COMPANY_SIZES = [
    { value: 'startup', label: 'Startup (1-10 people)' },
    { value: 'small', label: 'Small (11-50 people)' },
    { value: 'medium', label: 'Medium (51-200 people)' },
    { value: 'large', label: 'Large (201-1000 people)' },
    { value: 'enterprise', label: 'Enterprise (1000+ people)' }
  ] as const;
  
  export const FOCUS_AREAS = [
    { value: 'sleep', label: 'Sleep Quality', icon: '😴' },
    { value: 'stress', label: 'Stress Management', icon: '🧘' },
    { value: 'workload', label: 'Workload Balance', icon: '⚖️' },
    { value: 'boundaries', label: 'Work-Life Boundaries', icon: '🚧' },
    { value: 'energy', label: 'Energy Levels', icon: '⚡' },
  ] as const;
  
  export const PRIMARY_GOALS = [
    { id: 'prevent_burnout', label: 'Prevent Burnout', icon: '🛡️' },
    { id: 'reduce_stress', label: 'Reduce Work Stress', icon: '🧘' },
    { id: 'improve_sleep', label: 'Improve Sleep Quality', icon: '😴' },
    { id: 'work_boundaries', label: 'Set Work Boundaries', icon: '🚧' },
    { id: 'increase_energy', label: 'Boost Energy Levels', icon: '⚡' },
  ] as const;