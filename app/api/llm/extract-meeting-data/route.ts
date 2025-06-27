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
    const { userMessage, currentData } = body

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json({ error: 'userMessage is required and must be a string' }, { status: 400 })
    }

    const result = await llmService.extractMeetingDataFromChat(userMessage, currentData || {})

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in extract-meeting-data API route:', error)
    return NextResponse.json(
      { error: 'Failed to extract meeting data' },
      { status: 500 }
    )
  }
}
