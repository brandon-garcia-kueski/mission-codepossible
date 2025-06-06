import { useSession } from 'next-auth/react'
import { google } from 'googleapis'

export const useGoogleCalendar = () => {
  const { data: session } = useSession()

  const getCalendarEvents = async (timeMin: string, timeMax: string) => {
    if (!session?.accessToken) return []

    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: session.accessToken })

    const calendar = google.calendar({ version: 'v3', auth })

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime'
    })

    return response.data.items || []
  }

  return { getCalendarEvents }
}