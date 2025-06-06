'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { getCalendarEvents, isAuthenticated } = useGoogleCalendar()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/')
      return
    }

    if (isAuthenticated) {
      loadCalendarEvents()
    }
  }, [session, status, isAuthenticated])

  const loadCalendarEvents = async () => {
    try {
      setLoading(true)
      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      const events = await getCalendarEvents(
        now.toISOString(),
        nextWeek.toISOString()
      )
      setEvents(events)
    } catch (error) {
      console.error('Error loading calendar events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Bienvenido, {session.user?.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Gestiona tus reuniones y encuentra los mejores horarios para tu equipo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Acciones Rápidas
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/schedule')}
              className="w-full text-left px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <div className="font-medium text-blue-900 dark:text-blue-100">
                📅 Programar Nueva Reunión
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Encuentra el mejor horario para tu equipo
              </div>
            </button>
            <button
              onClick={loadCalendarEvents}
              className="w-full text-left px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <div className="font-medium text-green-900 dark:text-green-100">
                🔄 Actualizar Calendario
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Sincronizar con Google Calendar
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Próximos Eventos
          </h2>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-3">
              {events.slice(0, 5).map((event, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-3 py-2">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {event.summary || 'Sin título'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {event.start?.dateTime 
                      ? new Date(event.start.dateTime).toLocaleString('es-ES', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })
                      : 'Todo el día'
                    }
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No tienes eventos próximos en los próximos 7 días.
            </p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Estado de la Conexión
        </h2>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-700 dark:text-gray-300">
            Conectado a Google Calendar como {session.user?.email}
          </span>
        </div>
      </div>
    </div>
  )
}
