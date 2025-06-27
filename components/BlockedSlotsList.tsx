'use client'

import { useUserPreferences } from '@/hooks/useUserPreferences'
import { BlockedTimeSlot } from '@/types/calendar'

export default function BlockedSlotsList() {
  const { preferences, loading, removeBlockedSlot, toggleBlockedSlot } = useUserPreferences()

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!preferences || preferences.blockedTimeSlots.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Horarios Bloqueados
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          No tienes horarios bloqueados actualmente.
        </p>
      </div>
    )
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatRecurrence = (slot: BlockedTimeSlot) => {
    if (!slot.recurrence) return null

    const { frequency, interval, daysOfWeek, endDate } = slot.recurrence
    
    let text = ''
    
    switch (frequency) {
      case 'daily':
        text = interval === 1 ? 'Diario' : `Cada ${interval} días`
        break
      case 'weekly':
        if (daysOfWeek && daysOfWeek.length > 0) {
          const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
          const days = daysOfWeek.map(d => dayNames[d]).join(', ')
          text = `Semanal (${days})`
        } else {
          text = interval === 1 ? 'Semanal' : `Cada ${interval} semanas`
        }
        break
      case 'monthly':
        text = interval === 1 ? 'Mensual' : `Cada ${interval} meses`
        break
    }

    if (endDate) {
      const end = new Date(endDate)
      text += ` hasta ${end.toLocaleDateString('es-ES')}`
    }

    return text
  }

  const handleToggle = async (slotId: string, currentState: boolean) => {
    try {
      await toggleBlockedSlot(slotId, !currentState)
    } catch (error) {
      console.error('Error toggling blocked slot:', error)
    }
  }

  const handleRemove = async (slotId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este bloqueo?')) {
      try {
        await removeBlockedSlot(slotId)
      } catch (error) {
        console.error('Error removing blocked slot:', error)
      }
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Horarios Bloqueados ({preferences.blockedTimeSlots.length})
      </h3>

      <div className="space-y-4">
        {preferences.blockedTimeSlots.map((slot: BlockedTimeSlot) => (
          <div
            key={slot.id}
            className={`p-4 rounded-lg border ${
              slot.isActive
                ? 'border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className={`font-medium ${
                    slot.isActive 
                      ? 'text-red-800 dark:text-red-200' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {slot.title}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    slot.isActive
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                  }`}>
                    {slot.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>
                    <strong>Inicio:</strong> {formatDateTime(slot.start)}
                  </p>
                  <p>
                    <strong>Fin:</strong> {formatDateTime(slot.end)}
                  </p>
                  {slot.recurrence && (
                    <p>
                      <strong>Repetición:</strong> {formatRecurrence(slot)}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Creado: {new Date(slot.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleToggle(slot.id, slot.isActive)}
                  className={`px-3 py-1 text-xs rounded-md font-medium ${
                    slot.isActive
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800'
                      : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                  }`}
                >
                  {slot.isActive ? 'Desactivar' : 'Activar'}
                </button>
                
                <button
                  onClick={() => handleRemove(slot.id)}
                  className="px-3 py-1 text-xs rounded-md font-medium bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
