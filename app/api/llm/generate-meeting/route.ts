import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { llmService } from '@/lib/llmService'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { attendees, context } = body

    if (!Array.isArray(attendees)) {
      return NextResponse.json({ error: 'Attendees must be an array' }, { status: 400 })
    }

    // Extract email addresses from attendees for the LLM service
    const attendeeEmails = attendees.map(attendee => {
      if (typeof attendee === 'string') {
        return attendee
      }
      return attendee.email || attendee.name || 'Unknown'
    })

    const result = await llmService.generateMeetingTitleAndDescription(
      attendeeEmails,
      context
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in LLM API route:', error)
    return NextResponse.json(
      { error: 'Failed to generate meeting content' },
      { status: 500 }
    )
  }
}
