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

export const useMeetingScheduler = () => {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [checkingAvailability, setCheckingAvailability] = useState(false)

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
    isAuthenticated: !!session,
  }
}
