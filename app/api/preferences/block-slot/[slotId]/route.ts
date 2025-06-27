import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { userPreferencesStorage } from '@/lib/preferences-storage'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { slotId } = await params
    const existingPreferences = userPreferencesStorage.get(session.user.email)

    if (!existingPreferences) {
      return NextResponse.json(
        { error: 'User preferences not found' },
        { status: 404 }
      )
    }

    // Remove the blocked slot
    const updatedPreferences = {
      ...existingPreferences,
      blockedTimeSlots: existingPreferences.blockedTimeSlots.filter(
        (slot: any) => slot.id !== slotId
      ),
      updatedAt: new Date()
    }

    userPreferencesStorage.set(session.user.email, updatedPreferences)

    return NextResponse.json(updatedPreferences)
  } catch (error) {
    console.error('Error removing blocked slot:', error)
    return NextResponse.json(
      { error: 'Failed to remove blocked slot' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slotId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { slotId } = await params
    const { isActive } = await request.json()

    const existingPreferences = userPreferencesStorage.get(session.user.email)

    if (!existingPreferences) {
      return NextResponse.json(
        { error: 'User preferences not found' },
        { status: 404 }
      )
    }

    // Update the blocked slot
    const updatedPreferences = {
      ...existingPreferences,
      blockedTimeSlots: existingPreferences.blockedTimeSlots.map(
        (slot: any) => slot.id === slotId ? { ...slot, isActive } : slot
      ),
      updatedAt: new Date()
    }

    userPreferencesStorage.set(session.user.email, updatedPreferences)

    return NextResponse.json(updatedPreferences)
  } catch (error) {
    console.error('Error updating blocked slot:', error)
    return NextResponse.json(
      { error: 'Failed to update blocked slot' },
      { status: 500 }
    )
  }
}
