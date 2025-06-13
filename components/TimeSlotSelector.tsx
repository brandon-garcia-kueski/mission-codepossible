import React, { useState } from 'react'

interface TimeSlot {
  start: string
  end: string
  score: number
  participants: string[]
}

interface TimeSlotSelectorProps {
  slots: TimeSlot[]
  onSlotSelect: (slot: TimeSlot) => void
  loading?: boolean
}

export default function TimeSlotSelector({ slots, onSlotSelect, loading = false }: TimeSlotSelectorProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)

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
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="text-base font-medium text-gray-900 dark:text-white">
                    {formatDate(slot.start)}
                  </div>
                  <span className={`text-sm font-medium ${getScoreColor(slot.score)}`}>
                    {getScoreText(slot.score)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Duración: {formatDuration(slot.start, slot.end)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {slot.participants.length} participante{slot.participants.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
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
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            {formatDate(selectedSlot.start)} - {formatDuration(selectedSlot.start, selectedSlot.end)}
          </p>
        </div>
      )}
    </div>
  )
}
