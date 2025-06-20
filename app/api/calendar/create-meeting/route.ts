import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { google } from 'googleapis'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'No access token available' },
        { status: 401 }
      )
    }

    const {
      title,
      start,
      end,
      attendees,
      description
    } = await request.json()

    if (!title || !start || !end || !attendees) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: session.accessToken as string })

    const calendar = google.calendar({ version: 'v3', auth })

    // Crear el evento en el calendario del organizador
    const eventDetails = {
      summary: title,
      description: description || '',
      start: {
        dateTime: start,
        timeZone: 'America/Mexico_City'
      },
      end: {
        dateTime: end,
        timeZone: 'America/Mexico_City'
      },
      attendees: attendees.map((attendee: any) => ({
        email: attendee.email,
        displayName: attendee.name || attendee.email,
        optional: attendee.optional || false
      })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 15 },
          { method: 'popup', minutes: 10 }
        ]
      },
      sendNotifications: true,
      sendUpdates: 'all'
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventDetails,
      sendNotifications: true
    })

    return NextResponse.json({
      success: true,
      event: response.data,
      message: 'Reunión creada exitosamente y invitaciones enviadas'
    })
  } catch (error) {
    console.error('Error creating meeting:', error)
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    )
  }
}
