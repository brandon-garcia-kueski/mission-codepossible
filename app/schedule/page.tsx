'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AttendeeInput from '@/components/AttendeeInput'
import TimeSlotSelector from '@/components/TimeSlotSelector'
import { Contact } from '@/hooks/useGoogleContacts'
import { useMeetingScheduler } from '@/hooks/useMeetingScheduler'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-pink-700 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-500/20 to-pink-400/20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="w-full px-4 py-6">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
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
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20"
              >
                Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <button
              onClick={() => step === 'form' ? router.back() : handleBackToForm()}
              className="mb-6 text-white/80 hover:text-white flex items-center gap-2 font-medium"
            >
              <span className="text-lg">←</span>
              {step === 'form' ? 'Volver' : 'Volver al formulario'}
            </button>
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                {step === 'form' && (
                  <>
                    Programar <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Nueva Reunión</span>
                  </>
                )}
                {step === 'slots' && (
                  <>
                    Seleccionar <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Horario</span>
                  </>
                )}
                {step === 'confirmation' && (
                  <>
                    Reunión <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Confirmada</span>
                  </>
                )}
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                {step === 'form' && 'Completa el formulario para encontrar el mejor horario para tu reunión.'}
                {step === 'slots' && 'Selecciona el horario que mejor funcione para todos los participantes.'}
                {step === 'confirmation' && 'Tu reunión ha sido programada exitosamente.'}
              </p>
            </div>
          </div>

          {/* Mensajes de éxito y error */}
          {successMessage && (
            <div className="mb-8 p-6 bg-green-500/20 backdrop-blur-sm border border-green-300/30 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-400 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">✓</span>
                </div>
                <p className="text-white font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-8 p-6 bg-red-500/20 backdrop-blur-sm border border-red-300/30 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-red-400 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">⚠</span>
                </div>
                <p className="text-white font-medium">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Paso 1: Formulario */}
          {step === 'form' && (
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Asistentes */}
                <div>
                  <label className="block text-lg font-semibold text-white mb-3">
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
                  <label htmlFor="title" className="block text-lg font-semibold text-white mb-3">
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
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-white/60 backdrop-blur-sm"
                  />
                </div>

                {/* Duración de la reunión */}
                <div>
                  <label htmlFor="duration" className="block text-lg font-semibold text-white mb-3">
                    Duración de la reunión *
                  </label>
                  <select
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white backdrop-blur-sm"
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
                  <label className="block text-lg font-semibold text-white mb-3">
                    Rango de fechas posibles *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="startDate" className="block text-sm text-white/70 mb-2">
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
                        className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm text-white/70 mb-2">
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
                        className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white backdrop-blur-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Motivo de la reunión */}
                <div>
                  <label htmlFor="reason" className="block text-lg font-semibold text-white mb-3">
                    Motivo de la reunión
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe brevemente el propósito y agenda de la reunión..."
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-white/60 backdrop-blur-sm resize-vertical"
                  />
                </div>

                {/* Botón de envío */}
                <div className="flex flex-col sm:flex-row justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={checkingAvailability}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    {checkingAvailability ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Consultando disponibilidad...
                      </>
                    ) : (
                      <>
                        <span className="text-lg">🔍</span>
                        Buscar Horarios Disponibles
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Paso 2: Selección de horarios */}
          {step === 'slots' && (
            <div className="space-y-8">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
                <TimeSlotSelector
                  slots={availableSlots}
                  onSlotSelect={handleSlotSelect}
                  loading={checkingAvailability}
                />
                
                {selectedSlot && (
                  <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
                    <button
                      type="button"
                      onClick={handleBackToForm}
                      className="px-8 py-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 font-semibold"
                    >
                      Volver al formulario
                    </button>
                    <button
                      onClick={handleConfirmMeeting}
                      disabled={loading}
                      className="px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-2xl hover:from-green-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Creando reunión...
                        </>
                      ) : (
                        <>
                          <span className="text-lg">📅</span>
                          Confirmar y Crear Reunión
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paso 3: Confirmación */}
          {step === 'confirmation' && (
            <div className="bg-white/10 backdrop-blur-sm p-12 rounded-3xl border border-white/20">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl flex items-center justify-center">
                  <span className="text-4xl">✅</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-6">
                  ¡Reunión creada exitosamente!
                </h3>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Se han enviado las invitaciones a todos los participantes y la reunión ha sido agregada a sus calendarios.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-8 py-4 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 font-semibold"
                  >
                    Ver Dashboard
                  </button>
                  <button
                    onClick={handleStartNew}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Programar Nueva Reunión
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Información adicional - solo mostrar en el primer paso */}
          {step === 'form' && (
            <div className="mt-12 bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">💡</span>
                ¿Cómo funciona?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Analizamos calendarios</h4>
                      <p className="text-white/70">Revisamos los calendarios de todos los asistentes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Encontramos disponibilidad</h4>
                      <p className="text-white/70">Identificamos horarios que funcionen para todos</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Presentamos opciones</h4>
                      <p className="text-white/70">Te mostramos las mejores opciones de horario</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Creamos la reunión</h4>
                      <p className="text-white/70">Una vez confirmado, la agregamos a todos los calendarios</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-6 bg-white/10 rounded-2xl border border-white/20">
                <p className="text-white/90 font-medium">
                  <span className="text-yellow-400">💡 Nota:</span> Puedes programar reuniones para hoy y días futuros. Para reuniones del mismo día, solo se mostrarán horarios con al menos 30 minutos de anticipación desde el momento actual.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
