'use client'

import { useState, useEffect } from 'react'
import { useMeetingScheduler } from '@/hooks/useMeetingScheduler'
import { useLLMService } from '@/hooks/useLLMService'

interface PastMeetingsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface PastMeeting {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus: string
  }>
  organizer?: {
    email: string
    displayName?: string
  }
}

export default function PastMeetingsModal({ isOpen, onClose }: PastMeetingsModalProps) {
  const { pastMeetings, loadingPastMeetings, fetchPastMeetings } = useMeetingScheduler()
  const { generatePastMeetingsBrief, loading: llmLoading } = useLLMService()
  const [brief, setBrief] = useState<any>(null)
  const [selectedDays, setSelectedDays] = useState(30)

  useEffect(() => {
    if (isOpen && pastMeetings.length === 0) {
      fetchPastMeetings(selectedDays)
    }
  }, [isOpen])

  const handleGenerateBrief = async () => {
    if (pastMeetings.length === 0) return
    
    try {
      setBrief(null) // Clear previous brief
      const result = await generatePastMeetingsBrief(pastMeetings)
      setBrief(result)
    } catch (error) {
      console.error('Error generating brief:', error)
      // Show a user-friendly error message
      setBrief({
        summary: 'No se pudo generar el análisis. Por favor, intenta nuevamente.',
        insights: ['Error al conectar con el servicio de IA'],
        keyTopics: [],
        recommendedActions: ['Verifica tu conexión e intenta nuevamente']
      })
    }
  }

  const handleDaysChange = async (days: number) => {
    setSelectedDays(days)
    setBrief(null)
    await fetchPastMeetings(days)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">📊 Análisis de Reuniones Pasadas</h2>
              <p className="text-blue-100">Revisa y analiza tus reuniones anteriores con IA</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Controls */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período de análisis:
              </label>
              <select
                value={selectedDays}
                onChange={(e) => handleDaysChange(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={7}>Últimos 7 días</option>
                <option value={30}>Últimos 30 días</option>
                <option value={60}>Últimos 60 días</option>
                <option value={90}>Últimos 90 días</option>
              </select>
            </div>

            {pastMeetings.length > 0 && (
              <div>
                <button
                  onClick={handleGenerateBrief}
                  disabled={llmLoading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-2"
                >
                  {llmLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Analizando...
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      Generar Análisis con IA
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loadingPastMeetings && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Cargando reuniones...</span>
            </div>
          )}

          {/* No Meetings */}
          {!loadingPastMeetings && pastMeetings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No se encontraron reuniones
              </h3>
              <p className="text-gray-500">
                No hay reuniones en los últimos {selectedDays} días con asistentes.
              </p>
            </div>
          )}

          {/* AI Brief */}
          {llmLoading && (
            <div className="mb-8 bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-2xl border border-purple-200">
              <div className="flex items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">🤖 Analizando reuniones con IA...</h3>
                  <p className="text-gray-600">Esto puede tomar unos segundos</p>
                </div>
              </div>
            </div>
          )}

          {brief && !llmLoading && (
            <div className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>🤖</span>
                Análisis Inteligente
              </h3>
              
              <div className="space-y-6">
                {/* Summary */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">📋 Resumen Ejecutivo</h4>
                  <p className="text-gray-600 bg-white p-4 rounded-lg border">{brief.summary}</p>
                </div>

                {/* Key Insights */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">💡 Insights Clave</h4>
                  <ul className="space-y-2">
                    {brief.insights?.map((insight: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600 bg-white p-3 rounded-lg border">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Topics */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">🎯 Temas Principales</h4>
                  <div className="flex flex-wrap gap-2">
                    {brief.keyTopics?.map((topic: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">🚀 Acciones Recomendadas</h4>
                  <ul className="space-y-2">
                    {brief.recommendedActions?.map((action: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-gray-600 bg-white p-3 rounded-lg border">
                        <span className="text-green-500 font-bold">→</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Meetings List */}
          {!loadingPastMeetings && pastMeetings.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                📋 Reuniones Encontradas ({pastMeetings.length})
              </h3>
              <div className="space-y-4">
                {pastMeetings.map((meeting: PastMeeting) => (
                  <div key={meeting.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800 text-lg">
                        {meeting.summary || 'Sin título'}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {formatDate(meeting.start.dateTime || meeting.start.date || '')}
                      </span>
                    </div>
                    
                    {meeting.description && (
                      <p className="text-gray-600 mb-3 text-sm">
                        {meeting.description.length > 200 
                          ? `${meeting.description.substring(0, 200)}...`
                          : meeting.description
                        }
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm">
                      {meeting.organizer && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">👤 Organizador:</span>
                          <span className="text-gray-700 font-medium">
                            {meeting.organizer.displayName || meeting.organizer.email}
                          </span>
                        </div>
                      )}
                      
                      {meeting.attendees && meeting.attendees.length > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">👥 Asistentes:</span>
                          <span className="text-gray-700 font-medium">
                            {meeting.attendees.length} personas
                          </span>
                        </div>
                      )}
                    </div>

                    {meeting.attendees && meeting.attendees.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {meeting.attendees.slice(0, 5).map((attendee, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {attendee.displayName || attendee.email.split('@')[0]}
                          </span>
                        ))}
                        {meeting.attendees.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{meeting.attendees.length - 5} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
