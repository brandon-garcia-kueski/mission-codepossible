export interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    extractedData?: Partial<MeetingData>
    suggestions?: string[]
    requiresInput?: boolean
    showSlots?: boolean
    availableSlots?: TimeSlot[]
    selectedSlot?: TimeSlot
  }
}

export interface MeetingData {
  title: string
  attendees: Contact[]
  duration: number // in minutes
  startDate: string
  endDate: string
  description?: string
  timezone?: string
}

export interface TimeSlot {
  start: string
  end: string
  score: number
  participants: string[]
}

export interface Contact {
  id: string
  name: string
  email: string
  photo?: string | null
  optional?: boolean
  timezone?: string
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  currentMeetingData: Partial<MeetingData>
  status: 'collecting_info' | 'showing_slots' | 'confirming' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface ExtractedIntent {
  intent: 'schedule_meeting' | 'modify_meeting' | 'cancel_meeting' | 'check_availability' | 'general_question'
  confidence: number
  extractedData: Partial<MeetingData>
  missingFields: string[]
  clarificationNeeded: string[]
}
