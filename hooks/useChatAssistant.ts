import { useState, useCallback } from 'react'
import { ChatMessage, MeetingData, TimeSlot } from '@/types/chat'
import { useMeetingScheduler } from './useMeetingScheduler'
import { chatMeetingService } from '@/lib/chatMeetingService'

export const useChatAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMeetingData, setCurrentMeetingData] = useState<Partial<MeetingData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>()
  const [status, setStatus] = useState<'collecting_info' | 'showing_slots' | 'confirming' | 'completed'>('collecting_info')

  const { checkAvailability, createMeeting, availableSlots, loading: schedulerLoading } = useMeetingScheduler()

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    // Add user message
    addMessage({
      type: 'user',
      content: content.trim()
    })

    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          currentData: currentMeetingData,
          sessionId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get assistant response')
      }

      const data = await response.json()

      // Update session ID if new
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId)
      }

      // Update current meeting data
      setCurrentMeetingData(data.currentData)

      // Add assistant response
      addMessage({
        type: 'assistant',
        content: data.response,
        metadata: {
          extractedData: data.extractedData,
          requiresInput: !data.isComplete
        }
      })

      // Check if we have all data and should search for slots
      if (data.isComplete && status === 'collecting_info') {
        setStatus('showing_slots')
        // Use data with defaults applied
        const completeData = chatMeetingService.getDataWithDefaults(data.currentData)
        setCurrentMeetingData(completeData)
        await searchAvailableSlots(completeData)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      addMessage({
        type: 'assistant',
        content: '❌ Lo siento, ocurrió un error. ¿Podrías intentar de nuevo?'
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentMeetingData, sessionId, addMessage, status])

  const searchAvailableSlots = useCallback(async (meetingData: Partial<MeetingData>) => {
    if (!meetingData.attendees || !meetingData.startDate || !meetingData.endDate || !meetingData.duration) {
      return
    }

    try {
      addMessage({
        type: 'assistant',
        content: '🔍 Buscando horarios disponibles para tu reunión...'
      })

      const slots = await checkAvailability({
        title: meetingData.title || 'Reunión',
        attendees: meetingData.attendees,
        startDate: meetingData.startDate,
        endDate: meetingData.endDate,
        duration: meetingData.duration,
        description: meetingData.description
      })

      if (slots && slots.length > 0) {
        addMessage({
          type: 'assistant',
          content: `✅ ¡Encontré ${slots.length} horarios disponibles! Selecciona el que mejor te funcione:`,
          metadata: {
            showSlots: true,
            availableSlots: slots
          }
        })
      } else {
        addMessage({
          type: 'assistant',
          content: '😔 No encontré horarios disponibles para todos los participantes en el rango de fechas especificado. ¿Te gustaría intentar con fechas diferentes?'
        })
        setStatus('collecting_info')
      }
    } catch (error) {
      console.error('Error searching slots:', error)
      addMessage({
        type: 'assistant',
        content: '❌ Error al buscar horarios disponibles. ¿Podrías verificar los datos e intentar de nuevo?'
      })
      setStatus('collecting_info')
    }
  }, [checkAvailability, addMessage])

  const selectSlot = useCallback(async (slot: TimeSlot) => {
    setStatus('confirming')

    addMessage({
      type: 'assistant',
      content: `✅ Perfecto! Has seleccionado el horario del ${new Date(slot.start).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })} de ${new Date(slot.start).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })} a ${new Date(slot.end).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })}. ¿Confirmas que quieres crear la reunión?`,
      metadata: {
        selectedSlot: slot
      }
    })
  }, [addMessage])

  const confirmMeeting = useCallback(async (slot: TimeSlot) => {
    if (!currentMeetingData.attendees || !currentMeetingData.title) {
      addMessage({
        type: 'assistant',
        content: '❌ Faltan datos para crear la reunión. Empecemos de nuevo.'
      })
      return
    }

    try {
      addMessage({
        type: 'assistant',
        content: '⏳ Creando tu reunión...'
      })

      await createMeeting({
        title: currentMeetingData.title,
        attendees: currentMeetingData.attendees,
        startDate: currentMeetingData.startDate!,
        endDate: currentMeetingData.endDate!,
        duration: currentMeetingData.duration!,
        description: currentMeetingData.description
      }, slot)

      addMessage({
        type: 'assistant',
        content: '🎉 ¡Reunión creada exitosamente! Se han enviado las invitaciones a todos los participantes. ¿Hay algo más en lo que pueda ayudarte?'
      })

      setStatus('completed')

      // Reset for next meeting
      setTimeout(() => {
        setCurrentMeetingData({})
        setStatus('collecting_info')
      }, 2000)

    } catch (error) {
      console.error('Error creating meeting:', error)
      addMessage({
        type: 'assistant',
        content: '❌ Error al crear la reunión. ¿Podrías intentar de nuevo?'
      })
      setStatus('showing_slots')
    }
  }, [currentMeetingData, createMeeting, addMessage])

  const startNewConversation = useCallback(() => {
    setMessages([])
    setCurrentMeetingData({})
    setStatus('collecting_info')
    setSessionId(undefined)

    addMessage({
      type: 'assistant',
      content: '👋 ¡Hola! Soy tu asistente para programar reuniones. Puedes decirme algo como "Quiero programar una reunión con juan@ejemplo.com para mañana" o simplemente "Necesito programar una reunión" y te ayudo paso a paso. ¿En qué puedo ayudarte?'
    })
  }, [addMessage])

  const cancelMeeting = useCallback(() => {
    addMessage({
      type: 'assistant',
      content: '❌ Reunión cancelada. ¿Hay algo más en lo que pueda ayudarte?'
    })
    setCurrentMeetingData({})
    setStatus('collecting_info')
  }, [addMessage])

  return {
    messages,
    currentMeetingData,
    isLoading: isLoading || schedulerLoading,
    status,
    availableSlots,
    sendMessage,
    selectSlot,
    confirmMeeting,
    cancelMeeting,
    startNewConversation
  }
}
