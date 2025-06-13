'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AttendeeInput from '@/components/AttendeeInput'
import { Contact } from '@/hooks/useGoogleContacts'
import ReauthorizeButton from '@/components/ReauthorizeButton'

export default function SchedulePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

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
      alert('Por favor, agrega al menos un asistente.')
      return
    }
    
    setIsSubmitting(true)
    setSuccessMessage('')

    try {
      // Mock API call - simulamos el envío
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Datos del formulario:', formData)
      
      setSuccessMessage('¡Reunión programada exitosamente! Te notificaremos cuando encontremos el mejor horario.')
      
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
    } catch (error) {
      console.error('Error al programar reunión:', error)
    } finally {
      setIsSubmitting(false)
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
        >
          ← Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Programar Nueva Reunión
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Completa el formulario para encontrar el mejor horario para tu reunión.
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center">
            <div className="w-5 h-5 text-green-500 mr-3">✓</div>
            <p className="text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        </div>
      )}

      <ReauthorizeButton />

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
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Programando...
                </>
              ) : (
                '📅 Programar Reunión'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Información adicional */}
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
            <span>Te enviamos las mejores opciones de horario</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">4.</span>
            <span>Una vez confirmado, creamos la reunión en todos los calendarios</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
