'use client'

import Image from "next/image";
import AuthButton from "@/components/AuthButton";
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    
    if (session) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (session) {
    return null // Will redirect to dashboard
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-pink-700 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-500/20 to-pink-400/20"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        {/* Header */}
        <header className="w-full max-w-6xl flex justify-between items-center">
          <Image
            src="https://cdn.prod.website-files.com/642533e2943fc871d1dc670d/642d4d9f4b2a5abd56c16739_Logo.svg"
            alt="Kueski"
            width={120}
            height={26}
            priority
            className="brightness-0 invert"
          />
          <nav className="hidden md:flex items-center gap-8 text-white/90">
            <a href="#" className="hover:text-white transition-colors">Préstamos</a>
            <a href="#" className="hover:text-white transition-colors">Créditos</a>
            <a href="#" className="hover:text-white transition-colors">Conócenos</a>
            <a href="#" className="hover:text-white transition-colors">Recursos</a>
          </nav>
        </header>

        <main className="flex flex-col lg:flex-row gap-16 items-center max-w-6xl w-full">
          <div className="flex flex-col gap-8 text-center lg:text-left lg:flex-1">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              Meeting
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Scheduler
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl leading-relaxed">
              Encuentra el mejor momento para reunirte con tu equipo. Conecta tu Google Calendar 
              y programa reuniones de manera inteligente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center lg:items-start">
              <AuthButton />
            </div>
          </div>

          {/* Card flotante */}
          <div className="lg:flex-1 max-w-md w-full">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Programa tu Reunión
                  </h3>
                  <p className="text-sm text-gray-600">
                    Desde ahora hasta tu próxima cita
                  </p>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  Disponible 24/7
                </div>
                <p className="text-gray-600">
                  Calendario inteligente sin comisiones ocultas
                </p>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl">
                Solicitar mi reunión
              </button>
            </div>
          </div>
        </main>

        {/* Sección de características */}
        <div className="w-full max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Para lo que necesites,
            </h2>
            <p className="text-white/70 text-lg">
              cuando lo necesites
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🗓️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Conecta Calendarios
              </h3>
              <p className="text-white/70">
                Sincroniza con Google Calendar para ver la disponibilidad de todos.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Encuentra Horarios
              </h3>
              <p className="text-white/70">
                Nuestro algoritmo encuentra automáticamente los mejores horarios disponibles.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Envía Invitaciones
              </h3>
              <p className="text-white/70">
                Crea eventos automáticamente y envía invitaciones a todos los participantes.
              </p>
            </div>
          </div>
        </div>

        <footer className="flex gap-6 flex-wrap items-center justify-center text-sm text-white/60">
          <span>© 2025 Kueski Meeting Scheduler</span>
          <span>•</span>
          <a href="#" className="hover:text-white/80 transition-colors">Términos y Condiciones</a>
          <span>•</span>
          <a href="#" className="hover:text-white/80 transition-colors">Privacidad</a>
        </footer>
      </div>
    </div>
  );
}
