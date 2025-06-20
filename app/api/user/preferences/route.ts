import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserPreferences } from '@/types/calendar'

// In a real application, you would store this in a database
// For this example, we'll use an in-memory store
const userPreferencesStore = new Map<string, UserPreferences>()

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const userEmail = session.user.email
        const preferences = userPreferencesStore.get(userEmail)

        if (!preferences) {
            // Return default preferences if none exist
            const defaultPreferences: UserPreferences = {
                userId: session.user.id || userEmail,
                email: userEmail,
                workingHours: { start: 9, end: 17 },
                workingDays: {
                    monday: true,
                    tuesday: true,
                    wednesday: true,
                    thursday: true,
                    friday: true,
                    saturday: false,
                    sunday: false
                },
                blockedDays: [],
                timeZone: 'America/Mexico_City',
                minimumNotice: 2, // 2 hours
                bufferTime: 15, // 15 minutes
                maxMeetingsPerDay: 8,
                preferredMeetingTimes: {
                    morning: true,
                    afternoon: true,
                    evening: false
                },
                createdAt: new Date(),
                updatedAt: new Date()
            }

            return NextResponse.json(defaultPreferences)
        }

        return NextResponse.json(preferences)
    } catch (error) {
        console.error('Error fetching user preferences:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user preferences' },
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

        const userEmail = session.user.email
        const preferences: UserPreferences = await request.json()

        // Validate required fields
        if (!preferences.workingHours || !preferences.workingDays) {
            return NextResponse.json(
                { error: 'Missing required preference fields' },
                { status: 400 }
            )
        }

        // Ensure the preferences belong to the authenticated user
        preferences.userId = session.user.id || userEmail
        preferences.email = userEmail
        preferences.updatedAt = new Date()

        if (!preferences.createdAt) {
            preferences.createdAt = new Date()
        }

        // Store preferences (in a real app, save to database)
        userPreferencesStore.set(userEmail, preferences)

        return NextResponse.json(preferences)
    } catch (error) {
        console.error('Error saving user preferences:', error)
        return NextResponse.json(
            { error: 'Failed to save user preferences' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    return POST(request) // Same logic for updates
}
