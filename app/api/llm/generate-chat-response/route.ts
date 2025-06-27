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
    const { extractedData, missingFields, currentData, userMessage } = body

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json({ error: 'userMessage is required and must be a string' }, { status: 400 })
    }

    const response = await llmService.generateChatResponse(
      extractedData || {},
      missingFields || [],
      currentData || {},
      userMessage
    )

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error in generate-chat-response API route:', error)
    return NextResponse.json(
      { error: 'Failed to generate chat response' },
      { status: 500 }
    )
  }
}
