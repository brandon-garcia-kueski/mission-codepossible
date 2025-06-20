import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserPreferences } from '@/types/calendar'

// This is a demo endpoint to set up example preferences with blocked days
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

        // Create example preferences with some blocked days
        const examplePreferences: UserPreferences = {
            userId: session.user.id || userEmail,
            email: userEmail,
            workingHours: { start: 9, end: 17 },
            workingDays: {
                monday: true,
                tuesday: true,
                wednesday: false, // Block Wednesdays as requested
                thursday: true,
                friday: true,
                saturday: false,
                sunday: false
            },
            blockedDays: [
                {
                    date: '2025-06-25', // Example PTO day
                    reason: 'PTO - Vacaciones',
                    allDay: true
                },
                {
                    date: '2025-06-26', // Another example
                    reason: 'Día personal',
                    allDay: true
                },
                {
                    date: '2025-06-27', // Example partial day block
                    reason: 'Cita médica',
                    allDay: false,
                    timeRanges: [
                        {
                            start: '14:00',
                            end: '16:00'
                        }
                    ]
                }
            ],
            timeZone: 'America/Mexico_City',
            minimumNotice: 2, // 2 hours minimum notice
            bufferTime: 15, // 15 minutes between meetings
            maxMeetingsPerDay: 6,
            preferredMeetingTimes: {
                morning: true,
                afternoon: true,
                evening: false // Don't prefer evening meetings
            },
            createdAt: new Date(),
            updatedAt: new Date()
        }

        // In a real app, this would save to a database
        // For now, we'll just return the example data
        return NextResponse.json({
            message: 'Example preferences created',
            preferences: examplePreferences,
            explanation: {
                blockedDays: 'Se han configurado días bloqueados de ejemplo',
                wednesdays: 'Los miércoles están deshabilitados',
                ptoExample: 'Se incluyen ejemplos de días de PTO',
                workingHours: 'Horario laboral configurado de 9 AM a 5 PM'
            }
        })
    } catch (error) {
        console.error('Error creating example preferences:', error)
        return NextResponse.json(
            { error: 'Failed to create example preferences' },
            { status: 500 }
        )
    }
}
