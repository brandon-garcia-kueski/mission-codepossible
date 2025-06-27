'use client'

import { useState, useEffect } from 'react'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { WorkingHours } from '@/types/calendar'

export default function UserPreferencesForm() {
  const { 
    preferences, 
    loading, 
    updateWorkingHours, 
    updateBlockedDays 
  } = useUserPreferences()

  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    start: 9,
    end: 17
  })
  const [blockedDays, setBlockedDays] = useState<number[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (preferences) {
      setWorkingHours(preferences.workingHours)
      setBlockedDays(preferences.blockedDays)
    }
  }, [preferences])

  const daysOfWeek = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' }
  ]

  const handleWorkingHoursChange = (field: 'start' | 'end', value: string) => {
    setWorkingHours(prev => ({
      ...prev,
      [field]: parseInt(value)
    }))
  }

  const handleDayToggle = (day: number) => {
    setBlockedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const handleSaveWorkingHours = async () => {
    setSaving(true)
    try {
      await updateWorkingHours(workingHours)
    } catch (error) {
      console.error('Error updating working hours:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBlockedDays = async () => {
    setSaving(true)
    try {
      await updateBlockedDays(blockedDays)
    } catch (error) {
      console.error('Error updating blocked days:', error)
    } finally {
      setSaving(false)
    }
  }

  const formatHour = (hour: number) => {
    return hour.toString().padStart(2, '0') + ':00'
  }

  if (loading && !preferences) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Working Hours */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Horario de Trabajo
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="startHour" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hora de inicio
            </label>
            <select
              id="startHour"
              value={workingHours.start}
              onChange={(e) => handleWorkingHoursChange('start', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {formatHour(i)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="endHour" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hora de fin
            </label>
            <select
              id="endHour"
              value={workingHours.end}
              onChange={(e) => handleWorkingHoursChange('end', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {formatHour(i)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <p>
            Tu horario de trabajo actual: <strong>{formatHour(workingHours.start)} - {formatHour(workingHours.end)}</strong>
          </p>
          <p className="text-xs mt-1">
            Las reuniones solo se programarán dentro de este horario.
          </p>
        </div>

        <button
          onClick={handleSaveWorkingHours}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : 'Guardar Horario'}
        </button>
      </div>

      {/* Blocked Days */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Días Bloqueados
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Selecciona los días en los que no quieres tener reuniones:
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
          {daysOfWeek.map(day => (
            <button
              key={day.value}
              onClick={() => handleDayToggle(day.value)}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                blockedDays.includes(day.value)
                  ? 'bg-red-100 text-red-800 border-2 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
                  : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>

        {blockedDays.length > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <p>
              <strong>Días bloqueados:</strong> {blockedDays.map(day => daysOfWeek.find(d => d.value === day)?.label).join(', ')}
            </p>
          </div>
        )}

        <button
          onClick={handleSaveBlockedDays}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Guardando...' : 'Guardar Días Bloqueados'}
        </button>
      </div>
    </div>
  )
}
