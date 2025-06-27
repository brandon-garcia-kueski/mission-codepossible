'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ChatAssistant from '@/components/ChatAssistant'

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-pink-700">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
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
      
      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <header className="w-full px-4 py-6">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src="https://cdn.prod.website-files.com/642533e2943fc871d1dc670d/642d4d9f4b2a5abd56c16739_Logo.svg"
                alt="Kueski"
                width={120}
                height={26}
                className="brightness-0 invert"
              />
              <span className="text-white/60">|</span>
              <span className="text-white font-medium">Chat Assistant</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-white/80 text-sm hidden sm:block">
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => router.push('/schedule')}
                className="px-3 sm:px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 text-sm sm:text-base"
              >
                📅 Formulario
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-3 sm:px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 text-sm sm:text-base"
              >
                Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 pb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 h-full flex flex-col">
            <ChatAssistant />
          </div>
        </div>
      </div>
    </div>
  )
}
