'use client'

import { useState, useEffect } from 'react'
import { UserPreferences, BlockedDay } from '@/types/calendar'

export default function PreferencesPage() {
    const [preferences, setPreferences] = useState<UserPreferences | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [newBlockedDay, setNewBlockedDay] = useState<Partial<BlockedDay>>({
        date: '',
        reason: '',
        allDay: true
    })

    useEffect(() => {
        fetchPreferences()
    }, [])

    const fetchPreferences = async () => {
        try {
            const response = await fetch('/api/user/preferences')
            if (response.ok) {
                const data = await response.json()
                setPreferences(data)
            }
        } catch (error) {
            console.error('Error fetching preferences:', error)
        } finally {
            setLoading(false)
        }
    }

    const savePreferences = async () => {
        if (!preferences) return

        setSaving(true)
        try {
            const response = await fetch('/api/user/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(preferences)
            })

            if (response.ok) {
                alert('Preferencias guardadas exitosamente')
            } else {
                alert('Error al guardar las preferencias')
            }
        } catch (error) {
            console.error('Error saving preferences:', error)
            alert('Error al guardar las preferencias')
        } finally {
            setSaving(false)
        }
    }

    const addBlockedDay = () => {
        if (!preferences || !newBlockedDay.date) return

        const blockedDay: BlockedDay = {
            date: newBlockedDay.date,
            reason: newBlockedDay.reason || 'Bloqueado',
            allDay: newBlockedDay.allDay ?? true,
            timeRanges: newBlockedDay.allDay ? undefined : []
        }

        setPreferences({
            ...preferences,
            blockedDays: [...preferences.blockedDays, blockedDay]
        })

        setNewBlockedDay({ date: '', reason: '', allDay: true })
    }

    const removeBlockedDay = (index: number) => {
        if (!preferences) return

        const updatedBlockedDays = preferences.blockedDays.filter((_, i) => i !== index)
        setPreferences({
            ...preferences,
            blockedDays: updatedBlockedDays
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg">Cargando preferencias...</div>
            </div>
        )
    }

    if (!preferences) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg text-red-600">Error al cargar las preferencias</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Preferencias de Calendario
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Configura tus horarios laborales, días bloqueados y preferencias de reuniones
                        </p>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Working Hours */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Horario Laboral</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hora de inicio</label>
                                    <select
                                        value={preferences.workingHours.start}
                                        onChange={(e) => setPreferences({
                                            ...preferences,
                                            workingHours: {
                                                ...preferences.workingHours,
                                                start: parseInt(e.target.value)
                                            }
                                        })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {Array.from({ length: 24 }, (_, i) => (
                                            <option key={i} value={i}>
                                                {i.toString().padStart(2, '0')}:00
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hora de fin</label>
                                    <select
                                        value={preferences.workingHours.end}
                                        onChange={(e) => setPreferences({
                                            ...preferences,
                                            workingHours: {
                                                ...preferences.workingHours,
                                                end: parseInt(e.target.value)
                                            }
                                        })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {Array.from({ length: 24 }, (_, i) => (
                                            <option key={i} value={i}>
                                                {i.toString().padStart(2, '0')}:00
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Working Days */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Días Laborales</h3>
                            <div className="grid grid-cols-7 gap-2">
                                {Object.entries(preferences.workingDays).map(([day, enabled]) => (
                                    <label key={day} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={enabled}
                                            onChange={(e) => setPreferences({
                                                ...preferences,
                                                workingDays: {
                                                    ...preferences.workingDays,
                                                    [day]: e.target.checked
                                                }
                                            })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm capitalize">{day.slice(0, 3)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Minimum Notice */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Tiempo Mínimo de Aviso</h3>
                            <div className="w-32">
                                <label className="block text-sm font-medium text-gray-700">Horas</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="168"
                                    value={preferences.minimumNotice}
                                    onChange={(e) => setPreferences({
                                        ...preferences,
                                        minimumNotice: parseInt(e.target.value) || 0
                                    })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Preferred Meeting Times */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Horarios Preferidos para Reuniones</h3>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={preferences.preferredMeetingTimes?.morning ?? true}
                                        onChange={(e) => setPreferences({
                                            ...preferences,
                                            preferredMeetingTimes: {
                                                morning: e.target.checked,
                                                afternoon: preferences.preferredMeetingTimes?.afternoon ?? true,
                                                evening: preferences.preferredMeetingTimes?.evening ?? false
                                            }
                                        })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm">Mañana (9:00 - 12:00)</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={preferences.preferredMeetingTimes?.afternoon ?? true}
                                        onChange={(e) => setPreferences({
                                            ...preferences,
                                            preferredMeetingTimes: {
                                                morning: preferences.preferredMeetingTimes?.morning ?? true,
                                                afternoon: e.target.checked,
                                                evening: preferences.preferredMeetingTimes?.evening ?? false
                                            }
                                        })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm">Tarde (12:00 - 15:00)</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={preferences.preferredMeetingTimes?.evening ?? false}
                                        onChange={(e) => setPreferences({
                                            ...preferences,
                                            preferredMeetingTimes: {
                                                morning: preferences.preferredMeetingTimes?.morning ?? true,
                                                afternoon: preferences.preferredMeetingTimes?.afternoon ?? true,
                                                evening: e.target.checked
                                            }
                                        })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm">Tarde noche (15:00 - 18:00)</span>
                                </label>
                            </div>
                        </div>

                        {/* Blocked Days */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Días Bloqueados (PTO, Vacaciones, etc.)</h3>

                            {/* Add new blocked day */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Agregar día bloqueado</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div>
                                        <input
                                            type="date"
                                            value={newBlockedDay.date}
                                            onChange={(e) => setNewBlockedDay({ ...newBlockedDay, date: e.target.value })}
                                            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Motivo (ej: PTO, Vacaciones)"
                                            value={newBlockedDay.reason}
                                            onChange={(e) => setNewBlockedDay({ ...newBlockedDay, reason: e.target.value })}
                                            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={newBlockedDay.allDay ?? true}
                                                onChange={(e) => setNewBlockedDay({ ...newBlockedDay, allDay: e.target.checked })}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="text-sm">Todo el día</span>
                                        </label>
                                    </div>
                                    <div>
                                        <button
                                            onClick={addBlockedDay}
                                            disabled={!newBlockedDay.date}
                                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300"
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* List of blocked days */}
                            <div className="space-y-2">
                                {preferences.blockedDays.map((blockedDay, index) => (
                                    <div key={index} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3">
                                        <div>
                                            <span className="font-medium text-red-800">{blockedDay.date}</span>
                                            {blockedDay.reason && (
                                                <span className="ml-2 text-red-600">- {blockedDay.reason}</span>
                                            )}
                                            <span className="ml-2 text-sm text-red-500">
                                                ({blockedDay.allDay ? 'Todo el día' : 'Horario específico'})
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => removeBlockedDay(index)}
                                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                                {preferences.blockedDays.length === 0 && (
                                    <p className="text-gray-500 text-sm">No hay días bloqueados</p>
                                )}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-6 border-t border-gray-200">
                            <button
                                onClick={savePreferences}
                                disabled={saving}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300"
                            >
                                {saving ? 'Guardando...' : 'Guardar Preferencias'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
