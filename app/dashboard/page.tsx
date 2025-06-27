'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar'
import ChatDemoCard from '@/components/ChatDemoCard'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { getCalendarEvents, isAuthenticated } = useGoogleCalendar()
  const [events, setEvents] = useState<any[]>([])
  const [allEvents, setAllEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)

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

  const loadCalendarEvents = async (query?: string) => {
    try {
      const loadingState = query ? setSearchLoading : setLoading
      loadingState(true)
      
      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      const events = await getCalendarEvents(
        now.toISOString(),
        nextWeek.toISOString(),
        query
      )
      
      if (query) {
        setEvents(events)
      } else {
        setAllEvents(events)
        setEvents(events)
      }
    } catch (error) {
      console.error('Error loading calendar events:', error)
    } finally {
      const loadingState = query ? setSearchLoading : setLoading
      loadingState(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      await loadCalendarEvents(query.trim())
    } else {
      setEvents(allEvents)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-pink-700 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-500/20 to-pink-400/20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="w-full px-4 py-6">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src="https://cdn.prod.website-files.com/642533e2943fc871d1dc670d/642d4d9f4b2a5abd56c16739_Logo.svg"
                alt="Kueski"
                width={120}
                height={26}
                className="brightness-0 invert"
              />
              <span className="text-white/60">|</span>
              <span className="text-white font-medium">Meeting Scheduler</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/80 text-sm">
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                Salir
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{session.user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Gestiona tus reuniones y encuentra los mejores horarios para tu equipo.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Acciones Rápidas */}
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">⚡</span>
                </div>
                Acciones Rápidas
              </h2>
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/schedule')}
                  className="w-full text-left p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-300/30 rounded-2xl hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">📅</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white text-lg">
                        Programar Nueva Reunión
                      </div>
                      <div className="text-white/70">
                        Encuentra el mejor horario para tu equipo
                      </div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => router.push('/chat')}
                  className="w-full text-left p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-300/30 rounded-2xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white text-lg">
                        Chat Assistant
                      </div>
                      <div className="text-white/70">
                        Programa reuniones conversando con IA
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => loadCalendarEvents()}
                  className="w-full text-left p-6 bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-300/30 rounded-2xl hover:from-green-500/30 hover:to-teal-500/30 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">🔄</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white text-lg">
                        Actualizar Calendario
                      </div>
                      <div className="text-white/70">
                        Sincronizar con Google Calendar
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Chat Demo Card */}
            <div className="mt-12">
              <ChatDemoCard />
            </div>

            {/* Próximos Eventos */}
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📋</span>
                </div>
                Próximos Eventos
              </h2>
              
              {/* Search Input */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar eventos..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    {searchLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white/50"></div>
                    ) : (
                      <span className="text-white/50 text-lg">🔍</span>
                    )}
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => handleSearch('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    >
                      <span className="text-lg">✕</span>
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50"></div>
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-4">
                  {events.slice(0, 5).map((event, index) => (
                    <div key={index} className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border-l-4 border-gradient-to-b from-yellow-400 to-orange-500">
                      <div className="font-medium text-white text-lg">
                        {event.summary || 'Sin título'}
                      </div>
                      <div className="text-white/70 mt-1">
                        {event.start?.dateTime 
                          ? new Date(event.start.dateTime).toLocaleString('es-ES', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })
                          : 'Todo el día'
                        }
                      </div>
                      {event.description && (
                        <div className="text-white/60 mt-2 text-sm">
                          {event.description.length > 100 
                            ? `${event.description.substring(0, 100)}...` 
                            : event.description
                          }
                        </div>
                      )}
                    </div>
                  ))}
                  {searchQuery && (
                    <div className="text-center pt-4">
                      <p className="text-white/60 text-sm">
                        {events.length} evento{events.length !== 1 ? 's' : ''} encontrado{events.length !== 1 ? 's' : ''} para "{searchQuery}"
                      </p>
                    </div>
                  )}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <p className="text-white/70 text-lg">
                    No se encontraron eventos para "{searchQuery}".
                  </p>
                  <button
                    onClick={() => handleSearch('')}
                    className="mt-4 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
                  >
                    Mostrar todos los eventos
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📅</span>
                  </div>
                  <p className="text-white/70 text-lg">
                    No tienes eventos próximos en los próximos 7 días.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Estado de la Conexión */}
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
            <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-lg">🔗</span>
              </div>
              Estado de la Conexión
            </h2>
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/90 text-lg">
                Conectado a Google Calendar como <span className="font-semibold text-white">{session.user?.email}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
