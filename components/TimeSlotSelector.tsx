import React, { useState } from 'react'
import { formatTimeInTimezone, formatDateTimeInTimezone, getTimezoneInfo, getBrowserTimezone } from '@/lib/timezone'
import { Contact } from '@/hooks/useGoogleContacts'

interface TimeSlot {
  start: string
  end: string
  score: number
  participants: string[]
  availableParticipants?: string[]
  optionalConflicts?: number
}

interface TimeSlotSelectorProps {
  slots: TimeSlot[]
  onSlotSelect: (slot: TimeSlot) => void
  loading?: boolean
  attendees?: Contact[] // Add attendees to show timezone info
}

export default function TimeSlotSelector({ slots, onSlotSelect, loading = false, attendees = [] }: TimeSlotSelectorProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)

  // Get unique timezones from attendees
  const getUniqueTimezones = () => {
    const timezones = new Set<string>()
    timezones.add(getBrowserTimezone()) // Always include browser timezone
    
    attendees.forEach(attendee => {
      if (attendee.timezone) {
        timezones.add(attendee.timezone)
      }
    })
    
    return Array.from(timezones)
  }

  const uniqueTimezones = getUniqueTimezones()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let dayText = ''
    if (date.toDateString() === today.toDateString()) {
      dayText = 'Hoy'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dayText = 'Mañana'
    } else {
      dayText = date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      })
    }

    return `${dayText} a las ${date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`
  }

  const formatDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60)
    
    if (duration < 60) {
      return `${duration} min`
    }
    
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60
    
    if (minutes === 0) {
      return `${hours}h`
    }
    
    return `${hours}h ${minutes}min`
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400'
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-orange-600 dark:text-orange-400'
  }

  const getScoreText = (score: number) => {
    if (score >= 90) return 'Excelente'
    if (score >= 70) return 'Bueno'
    return 'Aceptable'
  }

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    onSlotSelect(slot)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Buscando horarios disponibles...
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
          📅
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No hay horarios disponibles
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          No se encontraron horarios libres para todos los participantes en el rango de fechas seleccionado.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Horarios disponibles ({slots.length} opciones)
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {slots.map((slot, index) => (
          <div
            key={index}
            onClick={() => handleSlotClick(slot)}
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedSlot === slot
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-base font-medium text-gray-900 dark:text-white">
                    {formatDate(slot.start)}
                  </div>
                  <span className={`text-sm font-medium ${getScoreColor(slot.score)}`}>
                    {getScoreText(slot.score)}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Duración: {formatDuration(slot.start, slot.end)}
                </div>
                
                {/* Show times in different timezones */}
                {uniqueTimezones.length > 1 && (
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Horarios por zona:</div>
                    <div className="grid grid-cols-1 gap-1">
                      {uniqueTimezones.map((timezone) => {
                        const timezoneInfo = getTimezoneInfo(timezone)
                        const timeRange = `${formatTimeInTimezone(slot.start, timezone)} - ${formatTimeInTimezone(slot.end, timezone)}`
                        return (
                          <div key={timezone} className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
                            <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">
                              {timeRange}
                            </span>
                            <span className="text-gray-500">
                              {timezoneInfo?.label.split(' ')[0] || timezone.split('/')[1]}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-4">
                  <span>
                    {slot.participants.length} participante{slot.participants.length !== 1 ? 's' : ''}
                  </span>
                  {slot.optionalConflicts !== undefined && slot.optionalConflicts > 0 && (
                    <span className="text-amber-600 dark:text-amber-400">
                      {slot.optionalConflicts} opcional{slot.optionalConflicts !== 1 ? 'es' : ''} ocupado{slot.optionalConflicts !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {selectedSlot === slot && (
                  <div className="w-5 h-5 text-blue-500">
                    ✓
                  </div>
                )}
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(slot.start).toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(slot.end).toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedSlot && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Horario seleccionado
          </h4>
          <p className="text-blue-800 dark:text-blue-200 text-sm mb-2">
            {formatDate(selectedSlot.start)} - {formatDuration(selectedSlot.start, selectedSlot.end)}
          </p>
          
          {/* Show selected time in all relevant timezones */}
          {uniqueTimezones.length > 1 && (
            <div className="mb-2">
              <div className="text-xs text-blue-700 dark:text-blue-300 mb-1">Horarios confirmados:</div>
              <div className="space-y-1">
                {uniqueTimezones.map((timezone) => {
                  const timezoneInfo = getTimezoneInfo(timezone)
                  const timeRange = `${formatTimeInTimezone(selectedSlot.start, timezone)} - ${formatTimeInTimezone(selectedSlot.end, timezone)}`
                  return (
                    <div key={timezone} className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <span className="font-mono bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                        {timeRange}
                      </span>
                      <span>
                        {timezoneInfo?.label || timezone}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
          {selectedSlot.optionalConflicts !== undefined && selectedSlot.optionalConflicts > 0 && (
            <p className="text-amber-700 dark:text-amber-300 text-xs">
              ⚠️ {selectedSlot.optionalConflicts} asistente{selectedSlot.optionalConflicts !== 1 ? 's' : ''} opcional{selectedSlot.optionalConflicts !== 1 ? 'es' : ''} no podrá{selectedSlot.optionalConflicts !== 1 ? 'n' : ''} asistir en este horario
            </p>
          )}
        </div>
      )}
    </div>
  )
}
