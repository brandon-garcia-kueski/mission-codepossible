import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { google } from 'googleapis'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'No access token available' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const timeMin = searchParams.get('timeMin')
    const timeMax = searchParams.get('timeMax')
    const searchQuery = searchParams.get('q')

    console.log('API Request params:', {
      timeMin,
      timeMax,
      searchQuery,
      url: request.url
    })

    if (!timeMin || !timeMax) {
      return NextResponse.json(
        { error: 'timeMin and timeMax are required' },
        { status: 400 }
      )
    }

    // Validate date format
    const timeMinDate = new Date(timeMin)
    const timeMaxDate = new Date(timeMax)
    
    if (isNaN(timeMinDate.getTime()) || isNaN(timeMaxDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format for timeMin or timeMax' },
        { status: 400 }
      )
    }

    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: session.accessToken as string })

    const calendar = google.calendar({ version: 'v3', auth })

    const requestParams: any = {
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime'
    }

    // Add search query if provided
    if (searchQuery && searchQuery.trim()) {
      requestParams.q = searchQuery.trim()
    }

    console.log('Google Calendar API request params:', requestParams)

    const response = await calendar.events.list(requestParams)

    return NextResponse.json(response.data.items || [])
  } catch (error: any) {
    console.error('Error fetching calendar events:', error)
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      response: error.response?.data
    })
    return NextResponse.json(
      { error: 'Failed to fetch calendar events', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'No access token available' },
        { status: 401 }
      )
    }

    const eventDetails = await request.json()

    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: session.accessToken as string })

    const calendar = google.calendar({ version: 'v3', auth })

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventDetails
    })

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}
