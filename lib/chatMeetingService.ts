import { Contact } from '@/types/chat'

class ChatMeetingService {
  async extractMeetingData(userMessage: string, currentData: any = {}): Promise<{
    extractedData: any
    missingFields: string[]
    nextQuestion?: string
    intent: string
    confidence: number
  }> {
    try {
      const response = await fetch('/api/llm/extract-meeting-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userMessage,
          currentData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error extracting meeting data:', error)

      // Fallback extraction using simple pattern matching
      return this.fallbackExtraction(userMessage, currentData)
    }
  }

  private async fallbackExtraction(userMessage: string, currentData: any) {
    const extracted: any = {}
    const missing: string[] = []
    const lowerMessage = userMessage.toLowerCase()

    // Extract emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const emails = userMessage.match(emailRegex)
    if (emails && emails.length > 0) {
      extracted.attendees = await this.resolveContacts(emails)
    }

    // Extract duration (enhanced patterns)
    if (lowerMessage.includes('30 min') || lowerMessage.includes('media hora') || lowerMessage.includes('30min')) {
      extracted.duration = 30
    } else if (lowerMessage.includes('1 hora') || lowerMessage.includes('60 min') || lowerMessage.includes('una hora') || lowerMessage.includes('60min')) {
      extracted.duration = 60
    } else if (lowerMessage.includes('1.5 hora') || lowerMessage.includes('90 min') || lowerMessage.includes('hora y media') || lowerMessage.includes('90min')) {
      extracted.duration = 90
    } else if (lowerMessage.includes('2 horas') || lowerMessage.includes('120 min') || lowerMessage.includes('dos horas') || lowerMessage.includes('120min')) {
      extracted.duration = 120
    } else if (lowerMessage.includes('15 min') || lowerMessage.includes('15min')) {
      extracted.duration = 15
    } else if (lowerMessage.includes('45 min') || lowerMessage.includes('45min')) {
      extracted.duration = 45
    }

    // Extract dates (enhanced patterns)
    const today = new Date('2025-06-27') // Use current date from context

    // Try various date patterns
    if (lowerMessage.includes('mañana') || lowerMessage.includes('tomorrow')) {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      extracted.startDate = tomorrow.toISOString().split('T')[0]
      extracted.endDate = extracted.startDate
    } else if (lowerMessage.includes('hoy') || lowerMessage.includes('today')) {
      extracted.startDate = today.toISOString().split('T')[0]
      extracted.endDate = extracted.startDate
    } else if (lowerMessage.includes('pasado mañana')) {
      const dayAfterTomorrow = new Date(today)
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
      extracted.startDate = dayAfterTomorrow.toISOString().split('T')[0]
      extracted.endDate = extracted.startDate
    } else if (lowerMessage.includes('próxima semana') || lowerMessage.includes('next week')) {
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      extracted.startDate = nextWeek.toISOString().split('T')[0]
      extracted.endDate = nextWeek.toISOString().split('T')[0]
    } else if (lowerMessage.includes('lunes')) {
      const nextMonday = new Date(today)
      const daysUntilMonday = (1 + 7 - today.getDay()) % 7 || 7
      nextMonday.setDate(today.getDate() + daysUntilMonday)
      extracted.startDate = nextMonday.toISOString().split('T')[0]
      extracted.endDate = extracted.startDate
    } else if (lowerMessage.includes('viernes')) {
      const nextFriday = new Date(today)
      const daysUntilFriday = (5 + 7 - today.getDay()) % 7 || 7
      nextFriday.setDate(today.getDate() + daysUntilFriday)
      extracted.startDate = nextFriday.toISOString().split('T')[0]
      extracted.endDate = extracted.startDate
    } else {
      // Look for specific date formats
      const dateMatch = userMessage.match(/(\d{4}-\d{2}-\d{2})/g)
      if (dateMatch) {
        extracted.startDate = dateMatch[0]
        extracted.endDate = dateMatch[0]
      }
    }

    // Check what's missing from CRITICAL fields only
    const criticalFields = ['attendees', 'startDate']
    const currentFields = { ...currentData, ...extracted }

    for (const field of criticalFields) {
      if (!currentFields[field] || (Array.isArray(currentFields[field]) && currentFields[field].length === 0)) {
        missing.push(field)
      }
    }

    return {
      extractedData: extracted,
      missingFields: missing,
      intent: 'schedule_meeting',
      confidence: 0.6
    }
  }

  async generateResponse(
    extractedData: any,
    missingFields: string[],
    currentData: any,
    userMessage: string
  ): Promise<string> {
    try {
      const response = await fetch('/api/llm/generate-chat-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          extractedData,
          missingFields,
          currentData,
          userMessage
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.response
    } catch (error) {
      console.error('Error generating response:', error)
      return this.generateFallbackResponse(missingFields, extractedData)
    }
  }

  private generateFallbackResponse(missingFields: string[], extractedData: any): string {
    if (missingFields.length === 0) {
      return '✅ ¡Perfecto! Busco horarios disponibles para tu reunión.'
    }

    const responses = {
      attendees: '👥 ¿Con quién será la reunión? Dame los emails de los participantes.',
      startDate: '📅 ¿Para qué fecha quieres la reunión? (ej: mañana, 2024-12-28, etc.)'
    }

    const nextField = missingFields[0]
    return responses[nextField as keyof typeof responses] || '¿Podrías darme más información?'
  }

  mergeData(currentData: any, newData: any): any {
    const merged = { ...currentData }

    for (const [key, value] of Object.entries(newData)) {
      if (key === 'attendees' && Array.isArray(value)) {
        // Merge attendees, avoiding duplicates
        const existingEmails = new Set(
          (merged.attendees || []).map((a: any) => a.email)
        )
        const newAttendees = (value as any[]).filter(
          (a: any) => !existingEmails.has(a.email)
        )
        merged.attendees = [...(merged.attendees || []), ...newAttendees]
      } else if (value !== null && value !== undefined && value !== '') {
        merged[key] = value
      }
    }

    return merged
  }

  isDataComplete(data: any): boolean {
    // More aggressive completion check - only require essential fields
    const criticalFields = ['attendees', 'startDate']

    for (const field of criticalFields) {
      if (!data[field]) return false
      if (field === 'attendees' && (!Array.isArray(data[field]) || data[field].length === 0)) {
        return false
      }
    }

    return true
  }

  // Get data with smart defaults applied
  getDataWithDefaults(data: any): any {
    const withDefaults = { ...data }

    // Default title if missing
    if (!withDefaults.title) {
      const attendeeNames = (withDefaults.attendees || [])
        .map((a: any) => a.name || a.email.split('@')[0])
        .join(', ')
      withDefaults.title = attendeeNames
        ? `Reunión con ${attendeeNames}`
        : 'Reunión de Trabajo'
    }

    // Default duration if missing
    if (!withDefaults.duration) {
      withDefaults.duration = 60 // Default to 1 hour
    }

    // Default end date to start date if missing
    if (!withDefaults.endDate && withDefaults.startDate) {
      withDefaults.endDate = withDefaults.startDate
    }

    // Default description if missing
    if (!withDefaults.description) {
      withDefaults.description = 'Reunión de trabajo y coordinación'
    }

    return withDefaults
  }

  async resolveContacts(attendeeEmails: string[]): Promise<Contact[]> {
    // This method will try to resolve emails to contact objects
    // If Google Contacts fails, we create basic contact objects
    const contacts: Contact[] = []

    for (const email of attendeeEmails) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        continue // Skip invalid emails
      }

      contacts.push({
        id: `manual-${email}`,
        name: email.split('@')[0], // Use email prefix as name
        email: email,
        optional: false
      })
    }

    return contacts
  }
}

export const chatMeetingService = new ChatMeetingService()
