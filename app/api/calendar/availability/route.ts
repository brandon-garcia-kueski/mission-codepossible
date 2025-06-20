import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { google } from 'googleapis'
import { authOptions } from '@/lib/auth'
import { UserPreferences, AvailabilityRequest, BlockedDay } from '@/types/calendar'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'No access token available' },
        { status: 401 }
      )
    }

    const { attendees, startDate, endDate, duration } = await request.json()

    if (!attendees || !startDate || !endDate || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user preferences
    const userPreferences = await getUserPreferences(session.user?.email)

    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: session.accessToken as string })

    const calendar = google.calendar({ version: 'v3', auth })

    // Buscar eventos ocupados para cada asistente
    const busyTimes: any[] = []

    // Incluir el calendario del usuario autenticado
    const allEmails = [session.user?.email, ...attendees.map((a: any) => a.email)].filter(Boolean)

    for (const email of allEmails) {
      try {
        const response = await calendar.freebusy.query({
          requestBody: {
            timeMin: new Date(startDate).toISOString(),
            timeMax: new Date(new Date(endDate).setHours(23, 59, 59)).toISOString(),
            items: [{ id: email }],
            timeZone: userPreferences.timeZone
          }
        })

        const busyForUser = response.data.calendars?.[email]?.busy || []
        busyTimes.push({
          email,
          busy: busyForUser
        })
      } catch (error) {
        console.error(`Error checking availability for ${email}:`, error)
        // Si no podemos acceder al calendario de un usuario externo, asumimos que está libre
        busyTimes.push({
          email,
          busy: []
        })
      }
    }

    // Generar franjas horarias disponibles respetando las preferencias del usuario
    const availableSlots = generateAvailableSlots(
      new Date(startDate),
      new Date(endDate),
      parseInt(duration),
      busyTimes,
      userPreferences
    )

    return NextResponse.json({
      availableSlots,
      busyTimes,
      userPreferences: {
        workingHours: userPreferences.workingHours,
        workingDays: userPreferences.workingDays,
        blockedDaysCount: userPreferences.blockedDays.length
      }
    })
  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}

function generateAvailableSlots(
  startDate: Date,
  endDate: Date,
  durationMinutes: number,
  busyTimes: any[],
  userPreferences: UserPreferences
): any[] {
  const slots: any[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    // Check if the day is allowed based on user preferences
    if (isDayAllowed(currentDate, userPreferences)) {
      const daySlots = generateDaySlots(currentDate, userPreferences, durationMinutes, busyTimes)
      slots.push(...daySlots)
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Ordenar por fecha y puntuación
  return slots.sort((a, b) => {
    const dateCompare = new Date(a.start).getTime() - new Date(b.start).getTime()
    if (dateCompare !== 0) return dateCompare
    return b.score - a.score
  }).slice(0, 10) // Mostrar solo las 10 mejores opciones
}

function generateDaySlots(
  date: Date,
  userPreferences: UserPreferences,
  durationMinutes: number,
  busyTimes: any[]
): any[] {
  const slots: any[] = []
  const slotDuration = 30 // Intervalos de 30 minutos
  const now = new Date()
  // Aplicar el tiempo mínimo de aviso según las preferencias del usuario
  const minimumStartTime = new Date(now.getTime() + userPreferences.minimumNotice * 60 * 60 * 1000)

  // Use working hours from user preferences
  const workHours = userPreferences.workingHours

  for (let hour = workHours.start; hour < workHours.end; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const slotStart = new Date(date)
      slotStart.setHours(hour, minute, 0, 0)

      const slotEnd = new Date(slotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes)

      // Verificar que el slot termine dentro del horario laboral
      if (slotEnd.getHours() > workHours.end) break

      // Verificar que el slot no sea anterior a la fecha y hora actual + tiempo mínimo de aviso
      const today = new Date()
      const isToday = slotStart.toDateString() === today.toDateString()

      if (isToday && slotStart <= minimumStartTime) continue

      // Check if the time slot is blocked by user preferences
      if (isTimeSlotBlocked(slotStart, slotEnd, userPreferences)) continue

      // Verificar si hay conflictos con eventos existentes
      const hasConflict = busyTimes.some(userBusy =>
        userBusy.busy.some((busy: any) => {
          const busyStart = new Date(busy.start)
          const busyEnd = new Date(busy.end)

          return (
            (slotStart >= busyStart && slotStart < busyEnd) ||
            (slotEnd > busyStart && slotEnd <= busyEnd) ||
            (slotStart <= busyStart && slotEnd >= busyEnd)
          )
        })
      )

      if (!hasConflict) {
        // Calcular puntuación basada en preferencias del usuario
        const score = calculateSlotScore(slotStart, userPreferences)

        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          score,
          participants: busyTimes.map(bt => bt.email)
        })
      }
    }
  }

  return slots
}

function calculateSlotScore(slotStart: Date, userPreferences: UserPreferences): number {
  const hour = slotStart.getHours()
  let score = 40 // Base score

  // Apply user's preferred meeting times
  if (userPreferences.preferredMeetingTimes) {
    if (hour >= 9 && hour < 12 && userPreferences.preferredMeetingTimes.morning) {
      score = 100
    } else if (hour >= 12 && hour < 15 && userPreferences.preferredMeetingTimes.afternoon) {
      score = 80
    } else if (hour >= 15 && hour < 18 && userPreferences.preferredMeetingTimes.evening) {
      score = 60
    }
  } else {
    // Default scoring if no preferences set
    if (hour >= 9 && hour < 12) score = 100
    else if (hour >= 12 && hour < 15) score = 80
    else if (hour >= 15 && hour < 18) score = 60
  }

  return score
}

// Helper function to get user preferences
async function getUserPreferences(userEmail?: string | null): Promise<UserPreferences> {
  // In a real application, this would fetch from a database
  // For now, return default preferences
  const defaultPreferences: UserPreferences = {
    userId: userEmail || 'anonymous',
    email: userEmail || 'anonymous@example.com',
    workingHours: { start: 9, end: 17 },
    workingDays: {
      monday: true,
      tuesday: true,
      wednesday: true, // Can be set to false to block Wednesdays
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    blockedDays: [], // This will contain PTO days, holidays, etc.
    timeZone: 'America/Mexico_City',
    minimumNotice: 2, // 2 hours minimum notice
    bufferTime: 15, // 15 minutes between meetings
    maxMeetingsPerDay: 8,
    preferredMeetingTimes: {
      morning: true,
      afternoon: true,
      evening: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  return defaultPreferences
}

// Helper function to check if a day is allowed based on user preferences
function isDayAllowed(date: Date, userPreferences: UserPreferences): boolean {
  const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
  const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD format

  // Check if the day is blocked by specific date (PTO, holidays, etc.)
  const isSpecificallyBlocked = userPreferences.blockedDays.some(blockedDay =>
    blockedDay.date === dateString && (blockedDay.allDay !== false)
  )

  if (isSpecificallyBlocked) return false

  // Check weekly preferences
  const dayMapping = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
  } as const

  const dayName = dayMapping[dayOfWeek as keyof typeof dayMapping]
  return userPreferences.workingDays[dayName]
}

// Helper function to check if a specific time slot is blocked
function isTimeSlotBlocked(
  slotStart: Date,
  slotEnd: Date,
  userPreferences: UserPreferences
): boolean {
  const dateString = slotStart.toISOString().split('T')[0]

  // Check if there are specific time-based blocks for this date
  const dayBlocks = userPreferences.blockedDays.filter(blockedDay =>
    blockedDay.date === dateString &&
    blockedDay.allDay === false &&
    blockedDay.timeRanges
  )

  for (const dayBlock of dayBlocks) {
    if (dayBlock.timeRanges) {
      for (const timeRange of dayBlock.timeRanges) {
        const blockStart = new Date(slotStart)
        const blockEnd = new Date(slotStart)

        const [startHour, startMinute] = timeRange.start.split(':').map(Number)
        const [endHour, endMinute] = timeRange.end.split(':').map(Number)

        blockStart.setHours(startHour, startMinute, 0, 0)
        blockEnd.setHours(endHour, endMinute, 0, 0)

        // Check if the slot overlaps with the blocked time range
        if (
          (slotStart >= blockStart && slotStart < blockEnd) ||
          (slotEnd > blockStart && slotEnd <= blockEnd) ||
          (slotStart <= blockStart && slotEnd >= blockEnd)
        ) {
          return true
        }
      }
    }
  }

  return false
}
