'use client'

import React from 'react'

const ChatDemoCard: React.FC = () => {
  const demoMessages = [
    {
      type: 'user',
      content: 'Hola, necesito programar una reunión'
    },
    {
      type: 'assistant',  
      content: '👋 ¡Perfecto! Te ayudo a programar tu reunión. ¿Cuál será el título de la reunión?'
    },
    {
      type: 'user',
      content: 'Reunión de planificación Q1 con juan@empresa.com y ana@startup.co para mañana 1 hora'
    },
    {
      type: 'assistant',
      content: '✅ ¡Excelente! He extraído la información:\n📝 Título: Reunión de planificación Q1\n👥 Participantes: juan@empresa.com, ana@startup.co\n⏱️ Duración: 1 hora\n📅 Fecha: mañana\n\n¿Quieres que busque los horarios disponibles?'
    }
  ]

  return (
    <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
          <span className="text-xl">🤖</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Chat Assistant</h3>
          <p className="text-white/70 text-sm">Conversa naturalmente para programar reuniones</p>
        </div>
      </div>
      
      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
        {demoMessages.map((message, index) => (
          <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
              message.type === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/10 text-white border border-white/20'
            }`}>
              {message.content}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-xs text-white/60">
        💡 El asistente entiende lenguaje natural y extrae automáticamente la información de las reuniones
      </div>
    </div>
  )
}

export default ChatDemoCard
