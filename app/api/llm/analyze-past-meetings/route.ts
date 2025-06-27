import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { llmService } from '@/lib/llmService'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { meetings } = await request.json()

    if (!meetings || !Array.isArray(meetings)) {
      return NextResponse.json(
        { error: 'Invalid meetings data' },
        { status: 400 }
      )
    }

    // Prepare the meetings data for analysis
    const meetingsData = meetings.map((meeting: any) => ({
      title: meeting.summary || 'Sin título',
      description: meeting.description || '',
      attendees: meeting.attendees?.map((attendee: any) => ({
        email: attendee.email,
        name: attendee.displayName || attendee.email.split('@')[0]
      })) || [],
      date: meeting.start?.dateTime || meeting.start?.date,
      organizer: meeting.organizer?.displayName || meeting.organizer?.email
    }))

    // Use the LLM service to analyze the past meetings
    const analysis = await llmService.analyzePastMeetings(meetings)

    return NextResponse.json(analysis)

  } catch (error: any) {
    console.error('Error analyzing past meetings:', error)
    return NextResponse.json(
      { error: 'Failed to analyze past meetings', details: error.message },
      { status: 500 }
    )
  }
}
