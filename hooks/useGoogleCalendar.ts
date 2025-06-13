'use client'

import { useSession } from 'next-auth/react'

export const useGoogleCalendar = () => {
  const { data: session } = useSession()

  const getCalendarEvents = async (timeMin: string, timeMax: string) => {
    if (!session) {
      throw new Error('No session available')
    }

    try {
      const response = await fetch(`/api/calendar/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch calendar events')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      throw error
    }
  }

  const createEvent = async (eventDetails: any) => {
    if (!session) {
      throw new Error('No session available')
    }

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventDetails),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create calendar event')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating calendar event:', error)
      throw error
    }
  }

  return {
    getCalendarEvents,
    createEvent,
    isAuthenticated: !!session
  }
}
