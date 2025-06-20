import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { BlockSlotRequest, BlockedTimeSlot, RecurrenceRule } from '@/types/calendar'
import { userPreferencesStorage } from '@/lib/preferences-storage'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const blockRequest: BlockSlotRequest = await request.json()
    
    if (!blockRequest.title || !blockRequest.startDate || !blockRequest.endDate || 
        !blockRequest.startTime || !blockRequest.endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const existingPreferences = userPreferencesStorage.get(session.user.email)
    
    if (!existingPreferences) {
      return NextResponse.json(
        { error: 'User preferences not found' },
        { status: 404 }
      )
    }

    // Create the blocked time slot
    const blockedSlot: BlockedTimeSlot = {
      id: generateId(),
      title: blockRequest.title,
      start: combineDateTime(blockRequest.startDate, blockRequest.startTime),
      end: combineDateTime(blockRequest.endDate, blockRequest.endTime),
      recurrence: blockRequest.recurrence,
      isActive: true,
      createdAt: new Date()
    }

    // Add to user preferences
    const updatedPreferences = {
      ...existingPreferences,
      blockedTimeSlots: [...existingPreferences.blockedTimeSlots, blockedSlot],
      updatedAt: new Date()
    }

    userPreferencesStorage.set(session.user.email, updatedPreferences)

    return NextResponse.json(updatedPreferences)
  } catch (error) {
    console.error('Error blocking time slot:', error)
    return NextResponse.json(
      { error: 'Failed to block time slot' },
      { status: 500 }
    )
  }
}

function combineDateTime(date: string, time: string): string {
  return `${date}T${time}:00.000Z`
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}
