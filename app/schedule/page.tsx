'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AttendeeInput from '@/components/AttendeeInput'
import TimeSlotSelector from '@/components/TimeSlotSelector'
import { Contact } from '@/hooks/useGoogleContacts'
import { useMeetingScheduler } from '@/hooks/useMeetingScheduler'
import ReauthorizeButton from '@/components/ReauthorizeButton'

export default function SchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { 
    loading, 
    availableSlots, 
    checkingAvailability, 
    checkAvailability, 
    createMeeting, 
    clearAvailableSlots 
  } = useMeetingScheduler()
  
  const [formData, setFormData] = useState({
    attendees: [] as Contact[],
    title: '',
    duration: '60',
    dateRange: {
      startDate: '',
      endDate: ''
    },
    reason: ''
  })
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [step, setStep] = useState<'form' | 'slots' | 'confirmation'>('form')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/')
      return
    }
  }, [session, status, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'startDate' || name === 'endDate') {
      setFormData(prev => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          [name]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleAttendeesChange = (attendees: Contact[]) => {
    setFormData(prev => ({
      ...prev,
      attendees
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar que haya al menos un asistente
    if (formData.attendees.length === 0) {
      setErrorMessage('Por favor, agrega al menos un asistente.')
      return
    }

    // Validar que las fechas sean válidas
    const today = new Date()
    const startDate = new Date(formData.dateRange.startDate)
    const endDate = new Date(formData.dateRange.endDate)
    
    // Resetear las horas para comparar solo fechas
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())

    if (startDateOnly < todayDate) {
      setErrorMessage('La fecha inicial no puede ser anterior a hoy.')
      return
    }

    if (endDate < startDate) {
      setErrorMessage('La fecha final no puede ser anterior a la fecha inicial.')
      return
    }
    
    setErrorMessage('')
    setSuccessMessage('')

    try {
      // Consultar disponibilidad de calendarios
      await checkAvailability({
        title: formData.title,
        attendees: formData.attendees,
        startDate: formData.dateRange.startDate,
        endDate: formData.dateRange.endDate,
        duration: parseInt(formData.duration),
        description: formData.reason
      })
      
      // Cambiar a la vista de selección de horarios
      setStep('slots')
    } catch (error: any) {
      console.error('Error al consultar disponibilidad:', error)
      setErrorMessage(error.message || 'Error al consultar disponibilidad')
    }
  }

  const handleSlotSelect = (slot: any) => {
    setSelectedSlot(slot)
  }

  const handleConfirmMeeting = async () => {
    if (!selectedSlot) return

    try {
      await createMeeting({
        title: formData.title,
        attendees: formData.attendees,
        startDate: formData.dateRange.startDate,
        endDate: formData.dateRange.endDate,
        duration: parseInt(formData.duration),
        description: formData.reason
      }, selectedSlot)
      
      setSuccessMessage('¡Reunión creada exitosamente! Se han enviado las invitaciones a todos los participantes.')
      setStep('confirmation')
      
      // Limpiar formulario
      setFormData({
        attendees: [],
        title: '',
        duration: '60',
        dateRange: {
          startDate: '',
          endDate: ''
        },
        reason: ''
      })
      setSelectedSlot(null)
      clearAvailableSlots()
    } catch (error: any) {
      console.error('Error al crear reunión:', error)
      setErrorMessage(error.message || 'Error al crear la reunión')
    }
  }

  const handleBackToForm = () => {
    setStep('form')
    setSelectedSlot(null)
    setErrorMessage('')
    clearAvailableSlots()
  }

  const handleStartNew = () => {
    setStep('form')
    setSelectedSlot(null)
    setSuccessMessage('')
    setErrorMessage('')
    clearAvailableSlots()
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => step === 'form' ? router.back() : handleBackToForm()}
          className="mb-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
        >
          ← {step === 'form' ? 'Volver' : 'Volver al formulario'}
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {step === 'form' && 'Programar Nueva Reunión'}
          {step === 'slots' && 'Seleccionar Horario'}
          {step === 'confirmation' && 'Reunión Confirmada'}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {step === 'form' && 'Completa el formulario para encontrar el mejor horario para tu reunión.'}
          {step === 'slots' && 'Selecciona el horario que mejor funcione para todos los participantes.'}
          {step === 'confirmation' && 'Tu reunión ha sido programada exitosamente.'}
        </p>
      </div>

      {/* Mensajes de éxito y error */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center">
            <div className="w-5 h-5 text-green-500 mr-3">✓</div>
            <p className="text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <div className="w-5 h-5 text-red-500 mr-3">⚠</div>
            <p className="text-red-800 dark:text-red-200">{errorMessage}</p>
          </div>
        </div>
      )}

      <ReauthorizeButton />

      {/* Paso 1: Formulario */}
      {step === 'form' && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Asistentes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Asistentes *
            </label>
            <AttendeeInput
              attendees={formData.attendees}
              onAttendeesChange={handleAttendeesChange}
              placeholder="Buscar contactos de Google o escribir emails..."
            />
          </div>

          {/* Título de la reunión */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título de la reunión *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Ej: Reunión de planificación del proyecto"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Duración de la reunión */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duración de la reunión *
            </label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="30">30 minutos</option>
              <option value="60">1 hora</option>
              <option value="90">1 hora 30 minutos</option>
              <option value="120">2 horas</option>
              <option value="180">3 horas</option>
            </select>
          </div>

          {/* Rango de fechas posibles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rango de fechas posibles *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Fecha inicial
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.dateRange.startDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Fecha final
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.dateRange.endDate}
                  onChange={handleInputChange}
                  required
                  min={formData.dateRange.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Motivo de la reunión */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motivo de la reunión
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe brevemente el propósito y agenda de la reunión..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-vertical"
            />
          </div>

          {/* Botón de envío */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={checkingAvailability}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {checkingAvailability ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Consultando disponibilidad...
                </>
              ) : (
                '🔍 Buscar Horarios Disponibles'
              )}
            </button>
          </div>
          </form>
        </div>
      )}

      {/* Paso 2: Selección de horarios */}
      {step === 'slots' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <TimeSlotSelector
              slots={availableSlots}
              onSlotSelect={handleSlotSelect}
              loading={checkingAvailability}
            />
            
            {selectedSlot && (
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleBackToForm}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Volver al formulario
                </button>
                <button
                  onClick={handleConfirmMeeting}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creando reunión...
                    </>
                  ) : (
                    '📅 Confirmar y Crear Reunión'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Paso 3: Confirmación */}
      {step === 'confirmation' && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-green-500">
              ✅
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              ¡Reunión creada exitosamente!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Se han enviado las invitaciones a todos los participantes y la reunión ha sido agregada a sus calendarios.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Ver Dashboard
              </button>
              <button
                onClick={handleStartNew}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Programar Nueva Reunión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional - solo mostrar en el primer paso */}
      {step === 'form' && (
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            ¿Cómo funciona?
          </h3>
          <ul className="text-blue-800 dark:text-blue-200 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>Analizamos los calendarios de todos los asistentes</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>Encontramos los horarios disponibles que funcionen para todos</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>Te presentamos las mejores opciones de horario</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">4.</span>
              <span>Una vez confirmado, creamos la reunión en todos los calendarios</span>
            </li>
          </ul>
          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-800/30 rounded-md">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Nota:</strong> Puedes programar reuniones para hoy, pero solo se mostrarán horarios con al menos 30 minutos de anticipación desde el momento actual.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
