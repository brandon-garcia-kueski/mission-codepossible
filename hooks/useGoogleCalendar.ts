'use client'

import { useSession } from 'next-auth/react'
import { google } from 'googleapis'

export const useGoogleCalendar = () => {
  const { data: session } = useSession()

  const getCalendarEvents = async (timeMin: string, timeMax: string) => {
    if (!session?.accessToken) {
      throw new Error('No access token available')
    }

    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: session.accessToken as string })

    const calendar = google.calendar({ version: 'v3', auth })

    try {
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime'
      })

      return response.data.items || []
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      throw error
    }
  }

  const createEvent = async (eventDetails: any) => {
    if (!session?.accessToken) {
      throw new Error('No access token available')
    }

    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: session.accessToken as string })

    const calendar = google.calendar({ version: 'v3', auth })

    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventDetails
      })

      return response.data
    } catch (error) {
      console.error('Error creating calendar event:', error)
      throw error
    }
  }

  return {
    getCalendarEvents,
    createEvent,
    isAuthenticated: !!session?.accessToken
  }
}
