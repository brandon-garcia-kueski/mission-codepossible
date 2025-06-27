import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserPreferences, WorkingHours } from '@/types/calendar'
import { userPreferencesStorage } from '@/lib/preferences-storage'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const preferences = userPreferencesStorage.get(session.user.email)
    
    if (!preferences) {
      return NextResponse.json(
        { error: 'Preferences not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error getting preferences:', error)
    return NextResponse.json(
      { error: 'Failed to get preferences' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { blockedDays, workingHours, timeZone } = await request.json()

    const newPreferences: UserPreferences = {
      id: generateId(),
      userId: session.user.email,
      blockedDays: blockedDays || [],
      workingHours: workingHours || { start: 9, end: 17 },
      blockedTimeSlots: [],
      timeZone: timeZone || 'America/Mexico_City',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    userPreferencesStorage.set(session.user.email, newPreferences)

    return NextResponse.json(newPreferences)
  } catch (error) {
    console.error('Error creating preferences:', error)
    return NextResponse.json(
      { error: 'Failed to create preferences' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const existingPreferences = userPreferencesStorage.get(session.user.email)
    
    if (!existingPreferences) {
      return NextResponse.json(
        { error: 'Preferences not found' },
        { status: 404 }
      )
    }

    const updates = await request.json()
    
    const updatedPreferences: UserPreferences = {
      ...existingPreferences,
      ...updates,
      updatedAt: new Date()
    }

    userPreferencesStorage.set(session.user.email, updatedPreferences)

    return NextResponse.json(updatedPreferences)
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}
