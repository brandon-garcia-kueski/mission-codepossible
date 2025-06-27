import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface TimeSlot {
  start: string
  end: string
  score: number
  participants: string[]
}

interface MeetingDetails {
  title: string
  attendees: any[]
  startDate: string
  endDate: string
  duration: number
  description?: string
}

interface PastMeeting {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus: string
  }>
  organizer?: {
    email: string
    displayName?: string
  }
}

export const useMeetingScheduler = () => {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [pastMeetings, setPastMeetings] = useState<PastMeeting[]>([])
  const [loadingPastMeetings, setLoadingPastMeetings] = useState(false)

  const checkAvailability = async (meetingDetails: MeetingDetails) => {
    if (!session) {
      throw new Error('No hay sesión activa')
    }

    setCheckingAvailability(true)
    try {
      const response = await fetch('/api/calendar/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendees: meetingDetails.attendees,
          startDate: meetingDetails.startDate,
          endDate: meetingDetails.endDate,
          duration: meetingDetails.duration,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al consultar disponibilidad')
      }

      const data = await response.json()
      setAvailableSlots(data.availableSlots || [])
      return data.availableSlots || []
    } catch (error) {
      console.error('Error checking availability:', error)
      throw error
    } finally {
      setCheckingAvailability(false)
    }
  }

  const createMeeting = async (
    meetingDetails: MeetingDetails,
    selectedSlot: TimeSlot
  ) => {
    if (!session) {
      throw new Error('No hay sesión activa')
    }

    setLoading(true)
    try {
      const response = await fetch('/api/calendar/create-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: meetingDetails.title,
          start: selectedSlot.start,
          end: selectedSlot.end,
          attendees: meetingDetails.attendees,
          description: meetingDetails.description,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear la reunión')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating meeting:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchPastMeetings = async (daysBack: number = 30) => {
    if (!session) {
      throw new Error('No hay sesión activa')
    }

    setLoadingPastMeetings(true)
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysBack)

      const response = await fetch(
        `/api/calendar/events?timeMin=${startDate.toISOString()}&timeMax=${endDate.toISOString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al obtener reuniones pasadas')
      }

      const events = await response.json()

      // Filter only meetings that have attendees (not personal events)
      const meetings = events.filter(
        (event: any) =>
          event.attendees &&
          event.attendees.length > 0 &&
          event.summary &&
          !event.summary.toLowerCase().includes('disponible') &&
          !event.summary.toLowerCase().includes('available') &&
          !event.summary.toLowerCase().includes('busy')
      )

      setPastMeetings(meetings)
      return meetings
    } catch (error) {
      console.error('Error fetching past meetings:', error)
      throw error
    } finally {
      setLoadingPastMeetings(false)
    }
  }

  const clearAvailableSlots = () => {
    setAvailableSlots([])
  }

  return {
    loading,
    availableSlots,
    checkingAvailability,
    checkAvailability,
    createMeeting,
    clearAvailableSlots,
    pastMeetings,
    loadingPastMeetings,
    fetchPastMeetings,
    isAuthenticated: !!session,
  }
}
