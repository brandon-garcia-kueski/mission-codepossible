'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useChatAssistant } from '@/hooks/useChatAssistant'
import { ChatMessage, TimeSlot } from '@/types/chat'

const ChatAssistant: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const {
    messages,
    currentMeetingData,
    isLoading,
    status,
    sendMessage,
    selectSlot,
    confirmMeeting,
    cancelMeeting,
    startNewConversation
  } = useChatAssistant()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (messages.length === 0) {
      startNewConversation()
    }
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const message = inputMessage.trim()
    setInputMessage('')
    await sendMessage(message)
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    selectSlot(slot)
  }

  const handleConfirmMeeting = (slot: TimeSlot) => {
    confirmMeeting(slot)
  }

  const formatSlotTime = (slot: TimeSlot) => {
    const startDate = new Date(slot.start)
    const endDate = new Date(slot.end)
    
    return {
      date: startDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: `${startDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })} - ${endDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })}`
    }
  }

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.type === 'user'
    
    return (
      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
            : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
        }`}>
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          {/* Show available slots */}
          {message.metadata?.showSlots && message.metadata.availableSlots && (
            <div className="mt-4 space-y-2">
              {message.metadata.availableSlots.slice(0, 5).map((slot, index) => {
                const formatted = formatSlotTime(slot)
                return (
                  <button
                    key={index}
                    onClick={() => handleSlotSelect(slot)}
                    className="w-full text-left p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
                  >
                    <div className="text-sm font-medium">{formatted.date}</div>
                    <div className="text-xs text-white/80">{formatted.time}</div>
                    <div className="text-xs text-green-300 mt-1">
                      ✅ Disponible para {slot.participants.length} participantes
                    </div>
                  </button>
                )
              })}
            </div>
          )}
          
          {/* Show confirmation buttons for selected slot */}
          {message.metadata?.selectedSlot && status === 'confirming' && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleConfirmMeeting(message.metadata!.selectedSlot!)}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
              >
                ✅ Sí, crear reunión
              </button>
              <button
                onClick={cancelMeeting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm font-medium"
              >
                ❌ Cancelar
              </button>
            </div>
          )}
          
          <div className="text-xs text-white/60 mt-2">
            {message.timestamp.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              🤖 Asistente de Reuniones
            </h2>
            <p className="text-white/70 text-sm">
              Te ayudo a programar reuniones de forma conversacional
            </p>
          </div>
          <button
            onClick={startNewConversation}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 text-sm font-medium"
          >
            🔄 Nueva conversación
          </button>
        </div>
        
        {/* Show current meeting data */}
        {Object.keys(currentMeetingData).length > 0 && (
          <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="text-xs text-white/70 mb-2">Información recopilada:</div>
            <div className="space-y-1 text-sm text-white/90">
              {currentMeetingData.title && (
                <div>📝 <strong>Título:</strong> {currentMeetingData.title}</div>
              )}
              {currentMeetingData.attendees && currentMeetingData.attendees.length > 0 && (
                <div>👥 <strong>Participantes:</strong> {currentMeetingData.attendees.map(a => a.email).join(', ')}</div>
              )}
              {currentMeetingData.duration && (
                <div>⏱️ <strong>Duración:</strong> {currentMeetingData.duration} minutos</div>
              )}
              {currentMeetingData.startDate && (
                <div>📅 <strong>Fecha:</strong> {currentMeetingData.startDate} {currentMeetingData.endDate !== currentMeetingData.startDate ? `- ${currentMeetingData.endDate}` : ''}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-4 py-3 rounded-2xl max-w-xs">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm">Escribiendo...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe tu mensaje aquí... (ej: 'Quiero programar una reunión con juan@empresa.com para mañana')"
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-white/60 backdrop-blur-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center gap-2"
          >
            <span>📤</span>
            Enviar
          </button>
        </form>
        
        <div className="mt-2 text-xs text-white/60">
          💡 Puedes decir cosas como: "Reunión con ana@empresa.com mañana 1 hora", "Necesito programar una junta", etc.
        </div>
      </div>
    </div>
  )
}

export default ChatAssistant
