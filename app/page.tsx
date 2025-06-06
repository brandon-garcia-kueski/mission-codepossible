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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[40px] row-start-2 items-center sm:items-start max-w-4xl">
        <div className="flex flex-col items-center gap-8 text-center">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Programador de Reuniones
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            Encuentra el mejor momento para reunirte con tu equipo. Conecta tu Google Calendar 
            y programa reuniones de manera inteligente.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 w-full">
          <AuthButton />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                🗓️ Conecta Calendarios
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sincroniza con Google Calendar para ver la disponibilidad de todos.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                🎯 Encuentra Horarios
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Nuestro algoritmo encuentra automáticamente los mejores horarios disponibles.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                📧 Envía Invitaciones
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Crea eventos automáticamente y envía invitaciones a todos los participantes.
              </p>
            </div>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        <span>© 2025 Programador de Reuniones</span>
        <a
          className="hover:underline hover:underline-offset-4"
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Desarrollado con Next.js
        </a>
      </footer>
    </div>
  );
}
