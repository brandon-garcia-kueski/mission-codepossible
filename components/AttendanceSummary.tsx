import React from 'react'
import { Contact } from '@/hooks/useGoogleContacts'

interface TimeSlot {
  start: string
  end: string
  score: number
  participants: string[]
  availableParticipants?: string[]
  optionalConflicts?: number
}

interface AttendanceSummaryProps {
  slot: TimeSlot
  attendees: Contact[]
  organizerEmail?: string
}

export default function AttendanceSummary({ slot, attendees, organizerEmail }: AttendanceSummaryProps) {
  // Create a map of emails to contact details for easy lookup
  const emailToContact = new Map<string, Contact>()
  attendees.forEach(contact => {
    emailToContact.set(contact.email, contact)
  })

  // Add organizer if provided
  const organizer = organizerEmail ? { email: organizerEmail, name: 'Tú', id: 'organizer' } : null

  // Separate attendees by availability and status
  const availableRequired: Contact[] = []
  const availableOptional: Contact[] = []
  const unavailableRequired: Contact[] = []
  const unavailableOptional: Contact[] = []

  // Check organizer availability
  const organizerAvailable = organizer && slot.availableParticipants?.includes(organizer.email)

  // Process each attendee
  attendees.forEach(attendee => {
    const isAvailable = slot.availableParticipants?.includes(attendee.email) ?? false
    
    if (attendee.optional) {
      if (isAvailable) {
        availableOptional.push(attendee)
      } else {
        unavailableOptional.push(attendee)
      }
    } else {
      if (isAvailable) {
        availableRequired.push(attendee)
      } else {
        unavailableRequired.push(attendee)
      }
    }
  })

  const renderAttendeeList = (attendees: Contact[], status: 'available' | 'unavailable', type: 'required' | 'optional') => {
    if (attendees.length === 0) return null

    const statusIcon = status === 'available' ? '✅' : '❌'
    const statusColor = status === 'available' 
      ? 'text-green-700 dark:text-green-300' 
      : 'text-red-700 dark:text-red-300'
    const typeLabel = type === 'required' ? 'Requeridos' : 'Opcionales'
    const statusLabel = status === 'available' ? 'Disponibles' : 'No disponibles'

    return (
      <div className="mb-3">
        <h5 className={`text-sm font-medium ${statusColor} mb-2 flex items-center gap-2`}>
          {statusIcon} {typeLabel} {statusLabel} ({attendees.length})
        </h5>
        <div className="space-y-1">
          {attendees.map(attendee => (
            <div key={attendee.id} className="flex items-center gap-2 text-sm">
              {attendee.photo ? (
                <img 
                  src={attendee.photo} 
                  alt={attendee.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300">
                  {attendee.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-gray-700 dark:text-gray-300">{attendee.name}</span>
              <span className="text-gray-500 dark:text-gray-400 text-xs">({attendee.email})</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const totalRequired = availableRequired.length + unavailableRequired.length
  const totalOptional = availableOptional.length + unavailableOptional.length
  const availableRequiredCount = availableRequired.length + (organizer && organizerAvailable ? 1 : 0)
  const totalRequiredCount = totalRequired + (organizer ? 1 : 0)

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Resumen de Asistencia
        </h4>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {availableRequiredCount}/{totalRequiredCount} requeridos disponibles
        </div>
      </div>

      {/* Overall summary */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
            {availableRequired.length + availableOptional.length + (organizerAvailable ? 1 : 0)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Pueden asistir</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600 dark:text-red-400">
            {unavailableRequired.length + unavailableOptional.length + (organizer && !organizerAvailable ? 1 : 0)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">No pueden asistir</div>
        </div>
      </div>

      {/* Organizer status */}
      {organizer && (
        <div className="mb-3">
          <h5 className={`text-sm font-medium mb-2 flex items-center gap-2 ${
            organizerAvailable 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-red-700 dark:text-red-300'
          }`}>
            {organizerAvailable ? '✅' : '❌'} Organizador
          </h5>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">
              {organizer.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-700 dark:text-gray-300">{organizer.name}</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs">({organizer.email})</span>
          </div>
        </div>
      )}

      {/* Required attendees */}
      {renderAttendeeList(availableRequired, 'available', 'required')}
      {renderAttendeeList(unavailableRequired, 'unavailable', 'required')}

      {/* Optional attendees */}
      {renderAttendeeList(availableOptional, 'available', 'optional')}
      {renderAttendeeList(unavailableOptional, 'unavailable', 'optional')}

      {/* Warning if required attendees are unavailable */}
      {unavailableRequired.length > 0 && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-red-500 text-sm">⚠️</span>
            <div className="text-red-700 dark:text-red-300 text-sm">
              <strong>Atención:</strong> {unavailableRequired.length} asistente{unavailableRequired.length !== 1 ? 's' : ''} requerido{unavailableRequired.length !== 1 ? 's' : ''} no puede{unavailableRequired.length !== 1 ? 'n' : ''} asistir en este horario.
            </div>
          </div>
        </div>
      )}

      {/* Info if optional attendees are unavailable */}
      {unavailableOptional.length > 0 && (
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-amber-500 text-sm">ℹ️</span>
            <div className="text-amber-700 dark:text-amber-300 text-sm">
              {unavailableOptional.length} asistente{unavailableOptional.length !== 1 ? 's' : ''} opcional{unavailableOptional.length !== 1 ? 'es' : ''} no puede{unavailableOptional.length !== 1 ? 'n' : ''} asistir, pero la reunión puede continuar.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
