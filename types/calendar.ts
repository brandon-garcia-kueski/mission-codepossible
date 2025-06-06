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
