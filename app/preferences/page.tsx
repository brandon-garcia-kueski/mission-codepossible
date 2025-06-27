'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import UserPreferencesForm from '@/components/UserPreferencesForm'
import BlockSlotForm from '@/components/BlockSlotForm'
import BlockedSlotsList from '@/components/BlockedSlotsList'

export default function PreferencesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'preferences' | 'block-slots'>('preferences')
  const [showBlockForm, setShowBlockForm] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/')
      return
    }
  }, [session, status, router])

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

  const tabs = [
    { id: 'preferences' as const, label: 'Preferencias Generales', icon: '⚙️' },
    { id: 'block-slots' as const, label: 'Bloquear Horarios', icon: '🚫' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Configuración de Disponibilidad
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Configura tus horarios de trabajo, días bloqueados y horarios específicos no disponibles.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'preferences' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Configuración General
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Define tu horario de trabajo habitual y los días en los que no quieres tener reuniones.
                </p>
              </div>
              <UserPreferencesForm />
            </div>
          )}

          {activeTab === 'block-slots' && (
            <div>
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Horarios Bloqueados
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Bloquea horarios específicos cuando no estés disponible para reuniones.
                  </p>
                </div>
                
                {!showBlockForm && (
                  <button
                    onClick={() => setShowBlockForm(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    + Bloquear Horario
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {showBlockForm && (
                  <BlockSlotForm
                    onSuccess={() => setShowBlockForm(false)}
                    onCancel={() => setShowBlockForm(false)}
                  />
                )}
                
                <BlockedSlotsList />
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 Consejos para Horarios de Trabajo
            </h3>
            <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
              <li>• Define un horario consistente para mejorar la productividad</li>
              <li>• Considera tu zona horaria y la de tus colaboradores</li>
              <li>• Deja tiempo entre reuniones para descansos</li>
            </ul>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
              🚫 Bloqueando Horarios
            </h3>
            <ul className="text-orange-800 dark:text-orange-200 text-sm space-y-1">
              <li>• Usa recurrencia para patrones regulares</li>
              <li>• Puedes activar/desactivar bloqueos temporalmente</li>
              <li>• Los bloqueos tienen prioridad sobre horarios de trabajo</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              📅 Ejemplos de Uso
            </h3>
            <ul className="text-green-800 dark:text-green-200 text-sm space-y-1">
              <li>• "No reuniones los miércoles" (semanal)</li>
              <li>• Almuerzo de 12:00-13:00 (diario)</li>
              <li>• Focus time de 9:00-11:00 los viernes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
