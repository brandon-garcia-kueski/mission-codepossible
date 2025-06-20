export interface CalendarEvent {
  id?: string
  summary?: string
  description?: string
  start?: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end?: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted'
  }>
  location?: string
}

export interface TimeSlot {
  start: Date
  end: Date
  available: boolean
}

export interface Person {
  id: string
  email: string
  name: string
  calendar?: CalendarEvent[]
}

export interface MeetingRequest {
  title: string
  description?: string
  duration: number // in minutes
  attendees: Person[]
  proposedTimes: TimeSlot[]
}

// New interfaces for user preferences and blocked slots
export interface WorkingHours {
  start: number // Hour in 24-hour format (e.g., 9 for 9 AM)
  end: number   // Hour in 24-hour format (e.g., 17 for 5 PM)
}

export interface BlockedDay {
  date: string // ISO date string (YYYY-MM-DD)
  reason?: string // e.g., "PTO", "Holiday", "Personal"
  allDay?: boolean // If false, specific time ranges can be blocked
  timeRanges?: Array<{
    start: string // Time in HH:MM format
    end: string   // Time in HH:MM format
  }>
}

export interface WeeklyPreferences {
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
}

export interface UserPreferences {
  id?: string
  userId: string
  email: string
  workingHours: WorkingHours
  workingDays: WeeklyPreferences // true = available, false = blocked
  blockedDays: BlockedDay[] // Specific dates that are blocked (PTO, holidays, etc.)
  timeZone: string
  minimumNotice: number // Minimum hours of notice required for meetings
  bufferTime: number // Minutes between meetings
  maxMeetingsPerDay?: number
  preferredMeetingTimes?: {
    morning: boolean // 9-12
    afternoon: boolean // 12-15
    evening: boolean // 15-18
  }
  createdAt?: Date
  updatedAt?: Date
}

export interface AvailabilityRequest {
  attendees: Array<{ email: string; name?: string }>
  startDate: string
  endDate: string
  duration: number
  userPreferences?: UserPreferences
}

export interface AvailableSlot {
  start: string
  end: string
  score: number
  participants: string[]
  blockedReasons?: string[] // Reasons why this slot might be suboptimal
}
