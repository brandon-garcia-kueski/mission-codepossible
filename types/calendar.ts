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

export interface WorkingHours {
  start: number // hour in 24h format (e.g., 9 for 9 AM)
  end: number // hour in 24h format (e.g., 17 for 5 PM)
}

export interface UserPreferences {
  id: string
  userId: string
  blockedDays: number[] // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  workingHours: WorkingHours
  blockedTimeSlots: BlockedTimeSlot[]
  timeZone: string
  createdAt: Date
  updatedAt: Date
}

export interface BlockedTimeSlot {
  id: string
  title: string
  start: string // ISO date time
  end: string // ISO date time
  recurrence?: RecurrenceRule
  isActive: boolean
  createdAt: Date
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly'
  interval: number // every N days/weeks/months
  endDate?: string // ISO date when recurrence ends
  daysOfWeek?: number[] // for weekly recurrence: 0 = Sunday, 1 = Monday, etc.
}

export interface BlockSlotRequest {
  title: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  recurrence?: RecurrenceRule
}
