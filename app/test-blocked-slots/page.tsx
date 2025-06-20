'use client'

import { useState } from 'react'
import { UserPreferences } from '@/types/calendar'

export default function TestBlockedSlotsPage() {
    const [testResult, setTestResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const testBlockedSlots = async () => {
        setLoading(true)
        try {
            // First, set up example preferences
            const setupResponse = await fetch('/api/demo/setup-preferences', {
                method: 'POST'
            })

            if (setupResponse.ok) {
                const setupData = await setupResponse.json()
                console.log('Example preferences set:', setupData)
            }

            // Now test availability with blocked slots
            const testData = {
                attendees: [{ email: 'test@example.com', name: 'Test User' }],
                startDate: '2025-06-23', // Monday
                endDate: '2025-06-27',   // Friday (includes blocked Wednesday)
                duration: 60
            }

            const response = await fetch('/api/calendar/availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            })

            if (response.ok) {
                const result = await response.json()
                setTestResult(result)
            } else {
                const error = await response.json()
                setTestResult({ error: error.error })
            }
        } catch (error) {
            console.error('Test error:', error)
            setTestResult({ error: 'Test failed' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Test Blocked Slots Feature
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Prueba la funcionalidad de bloqueo de slots basada en preferencias del usuario
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Características del Test:
                            </h2>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• <strong>Miércoles bloqueados:</strong> No se mostrarán slots para miércoles</li>
                                <li>• <strong>Horario laboral:</strong> 9:00 AM - 5:00 PM</li>
                                <li>• <strong>Días bloqueados específicos:</strong> 25 y 26 de junio (PTO)</li>
                                <li>• <strong>Tiempo mínimo de aviso:</strong> 2 horas</li>
                                <li>• <strong>Bloqueo parcial:</strong> 27 de junio de 2:00 PM - 4:00 PM (cita médica)</li>
                            </ul>
                        </div>

                        <button
                            onClick={testBlockedSlots}
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                        >
                            {loading ? 'Probando...' : 'Probar Blocked Slots'}
                        </button>

                        {testResult && (
                            <div className="mt-8">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Resultados del Test:</h3>

                                {testResult.error ? (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-red-800">Error: {testResult.error}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* User Preferences Summary */}
                                        {testResult.userPreferences && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <h4 className="font-medium text-blue-900 mb-2">Preferencias Aplicadas:</h4>
                                                <div className="text-sm text-blue-800 space-y-1">
                                                    <p>• Horario: {testResult.userPreferences.workingHours.start}:00 - {testResult.userPreferences.workingHours.end}:00</p>
                                                    <p>• Días laborales: {Object.entries(testResult.userPreferences.workingDays)
                                                        .filter(([_, enabled]) => enabled)
                                                        .map(([day, _]) => day.charAt(0).toUpperCase() + day.slice(1, 3))
                                                        .join(', ')}</p>
                                                    <p>• Días bloqueados: {testResult.userPreferences.blockedDaysCount} día(s)</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Available Slots */}
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <h4 className="font-medium text-green-900 mb-2">
                                                Slots Disponibles ({testResult.availableSlots?.length || 0}):
                                            </h4>
                                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                                {testResult.availableSlots?.map((slot: any, index: number) => {
                                                    const startTime = new Date(slot.start)
                                                    const endTime = new Date(slot.end)
                                                    const dayName = startTime.toLocaleDateString('es-ES', { weekday: 'long' })

                                                    return (
                                                        <div key={index} className="text-sm text-green-800 bg-white p-2 rounded border">
                                                            <div className="flex justify-between">
                                                                <span>
                                                                    {dayName.charAt(0).toUpperCase() + dayName.slice(1)}, {startTime.toLocaleDateString('es-ES')}
                                                                </span>
                                                                <span>Score: {slot.score}</span>
                                                            </div>
                                                            <div className="text-gray-600">
                                                                {startTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} -
                                                                {endTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    )
                                                }) || <p className="text-green-700">No hay slots disponibles</p>}
                                            </div>
                                        </div>

                                        {/* Analysis */}
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <h4 className="font-medium text-yellow-900 mb-2">Análisis:</h4>
                                            <div className="text-sm text-yellow-800 space-y-1">
                                                <p>• ✅ Miércoles bloqueados: {testResult.availableSlots?.some((slot: any) => new Date(slot.start).getDay() === 3) ? '❌ FALLO' : '✅ CORRECTO'}</p>
                                                <p>• ✅ Solo horario laboral: {testResult.availableSlots?.every((slot: any) => {
                                                    const hour = new Date(slot.start).getHours()
                                                    return hour >= 9 && hour < 17
                                                }) ? '✅ CORRECTO' : '❌ FALLO'}</p>
                                                <p>• ✅ Solo días laborales: {testResult.availableSlots?.every((slot: any) => {
                                                    const day = new Date(slot.start).getDay()
                                                    return day >= 1 && day <= 5 && day !== 3 // Lun-Vie excepto miércoles
                                                }) ? '✅ CORRECTO' : '❌ FALLO'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
