import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { google } from 'googleapis'
import { authOptions } from '@/lib/auth'

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

    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: session.accessToken as string })

    const calendar = google.calendar({ version: 'v3', auth })

    // Buscar eventos ocupados para cada asistente
    const busyTimes: any[] = []

    // Incluir el calendario del usuario autenticado
    const allEmails = [session.user?.email, ...attendees.map((a: any) => a.email)].filter(Boolean)

    for (const attendeeData of [{ email: session.user?.email, optional: false }, ...attendees]) {
      const email = attendeeData.email
      if (!email) continue

      try {
        const response = await calendar.freebusy.query({
          requestBody: {
            timeMin: new Date(startDate).toISOString(),
            timeMax: new Date(new Date(endDate).setHours(23, 59, 59)).toISOString(),
            items: [{ id: email }],
            timeZone: 'America/Mexico_City'
          }
        })

        const busyForUser = response.data.calendars?.[email]?.busy || []
        busyTimes.push({
          email,
          busy: busyForUser,
          optional: attendeeData.optional || false
        })
      } catch (error) {
        console.error(`Error checking availability for ${email}:`, error)
        // Si no podemos acceder al calendario de un usuario externo, asumimos que está libre
        busyTimes.push({
          email,
          busy: [],
          optional: attendeeData.optional || false
        })
      }
    }

    // Generar franjas horarias disponibles
    const availableSlots = generateAvailableSlots(
      new Date(startDate),
      new Date(endDate),
      parseInt(duration),
      busyTimes
    )

    return NextResponse.json({
      availableSlots,
      busyTimes
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
  busyTimes: any[]
): any[] {
  const slots: any[] = []
  const workHours = { start: 9, end: 18 } // 9 AM a 6 PM

  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    // Solo días laborables (lunes a viernes)
    if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {
      const daySlots = generateDaySlots(currentDate, workHours, durationMinutes, busyTimes)
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
  workHours: { start: number, end: number },
  durationMinutes: number,
  busyTimes: any[]
): any[] {
  const slots: any[] = []
  const slotDuration = 30 // Intervalos de 30 minutos
  const now = new Date() // Fecha y hora actual
  // Agregar 30 minutos de margen mínimo para que la reunión no sea inmediata
  const minimumStartTime = new Date(now.getTime() + 30 * 60 * 1000)

  for (let hour = workHours.start; hour < workHours.end; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const slotStart = new Date(date)
      slotStart.setHours(hour, minute, 0, 0)

      const slotEnd = new Date(slotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes)

      // Verificar que el slot termine dentro del horario laboral
      if (slotEnd.getHours() > workHours.end) break

      // Verificar que el slot no sea anterior a la fecha y hora actual + margen mínimo
      // Solo aplicar esta validación si es el día de hoy
      const today = new Date()
      const isToday = slotStart.toDateString() === today.toDateString()

      if (isToday && slotStart <= minimumStartTime) continue

      // Verificar si hay conflictos con asistentes requeridos
      const hasRequiredConflict = busyTimes.filter(userBusy => !userBusy.optional).some(userBusy =>
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

      // Contar conflictos con asistentes opcionales para ajustar la puntuación
      const optionalConflicts = busyTimes.filter(userBusy => userBusy.optional).filter(userBusy =>
        userBusy.busy.some((busy: any) => {
          const busyStart = new Date(busy.start)
          const busyEnd = new Date(busy.end)

          return (
            (slotStart >= busyStart && slotStart < busyEnd) ||
            (slotEnd > busyStart && slotEnd <= busyEnd) ||
            (slotStart <= busyStart && slotEnd >= busyEnd)
          )
        })
      ).length

      if (!hasRequiredConflict) {
        // Calcular puntuación basada en preferencias y conflictos opcionales
        const baseScore = calculateSlotScore(slotStart)
        // Reducir puntuación por cada conflicto opcional (pero no bloquear el slot)
        const score = Math.max(baseScore - (optionalConflicts * 15), 10)

        // Calcular lista de participantes disponibles
        const availableParticipants = busyTimes.filter(userBusy => {
          const hasConflict = userBusy.busy.some((busy: any) => {
            const busyStart = new Date(busy.start)
            const busyEnd = new Date(busy.end)

            return (
              (slotStart >= busyStart && slotStart < busyEnd) ||
              (slotEnd > busyStart && slotEnd <= busyEnd) ||
              (slotStart <= busyStart && slotEnd >= busyEnd)
            )
          })
          return !hasConflict
        }).map(bt => bt.email)

        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          score,
          participants: busyTimes.map(bt => bt.email),
          availableParticipants,
          optionalConflicts
        })
      }
    }
  }

  return slots
}

function calculateSlotScore(slotStart: Date): number {
  const hour = slotStart.getHours()

  // Preferir horarios matutinos (9-12) = puntuación alta
  if (hour >= 9 && hour < 12) return 100

  // Horarios de tarde temprano (12-15) = puntuación media-alta
  if (hour >= 12 && hour < 15) return 80

  // Horarios de tarde (15-18) = puntuación media
  if (hour >= 15 && hour < 18) return 60

  return 40
}
