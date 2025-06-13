'use client'

import { signOut, signIn } from 'next-auth/react'

export default function ReauthorizeButton() {
  const handleReauthorize = async () => {
    if (confirm('Para habilitar la búsqueda de contactos de Google, necesitas volver a autorizar la aplicación. ¿Deseas continuar?')) {
      await signOut({ redirect: false })
      await signIn('google', { 
        callbackUrl: '/schedule',
        prompt: 'consent'
      })
    }
  }

  return (
    <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-5 h-5 text-yellow-500">⚠️</div>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Función de contactos limitada
          </h3>
          <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
            Para buscar tus contactos de Google automáticamente, necesitas volver a autorizar la aplicación.
          </p>
          <button
            onClick={handleReauthorize}
            className="mt-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
          >
            Habilitar búsqueda de contactos
          </button>
        </div>
      </div>
    </div>
  )
}
