import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { chatMeetingService } from '@/lib/chatMeetingService'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, currentData = {}, sessionId } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Extract meeting data from the user's message
    const extraction = await chatMeetingService.extractMeetingData(message, currentData)

    // Merge the extracted data with current data
    const mergedData = chatMeetingService.mergeData(currentData, extraction.extractedData)

    // Check if we have critical data (more aggressive)
    const isComplete = chatMeetingService.isDataComplete(mergedData)

    // Get complete data with defaults if ready to proceed
    const responseData = isComplete ? chatMeetingService.getDataWithDefaults(mergedData) : mergedData

    // Generate appropriate response
    const responseText = await chatMeetingService.generateResponse(
      extraction.extractedData,
      extraction.missingFields,
      mergedData,
      message
    )

    return NextResponse.json({
      response: responseText,
      extractedData: extraction.extractedData,
      currentData: responseData,
      missingFields: extraction.missingFields,
      isComplete,
      intent: extraction.intent,
      confidence: extraction.confidence,
      sessionId: sessionId || `session-${Date.now()}`
    })

  } catch (error) {
    console.error('Error in chat assistant:', error)
    return NextResponse.json(
      { error: 'Error processing chat message' },
      { status: 500 }
    )
  }
}
