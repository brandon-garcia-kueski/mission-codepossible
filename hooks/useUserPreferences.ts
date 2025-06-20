import { useState, useEffect } from 'react'
import { UserPreferences } from '@/types/calendar'

export function useUserPreferences() {
    const [preferences, setPreferences] = useState<UserPreferences | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchPreferences = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/user/preferences')

            if (!response.ok) {
                throw new Error('Failed to fetch preferences')
            }

            const data = await response.json()
            setPreferences(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            console.error('Error fetching preferences:', err)
        } finally {
            setLoading(false)
        }
    }

    const updatePreferences = async (updatedPreferences: UserPreferences) => {
        try {
            setError(null)

            const response = await fetch('/api/user/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedPreferences)
            })

            if (!response.ok) {
                throw new Error('Failed to update preferences')
            }

            const data = await response.json()
            setPreferences(data)
            return data
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            console.error('Error updating preferences:', err)
            throw err
        }
    }

    const addBlockedDay = async (date: string, reason?: string, allDay: boolean = true) => {
        if (!preferences) return

        const newBlockedDay = {
            date,
            reason: reason || 'Bloqueado',
            allDay,
            timeRanges: allDay ? undefined : []
        }

        const updatedPreferences = {
            ...preferences,
            blockedDays: [...preferences.blockedDays, newBlockedDay]
        }

        return updatePreferences(updatedPreferences)
    }

    const removeBlockedDay = async (index: number) => {
        if (!preferences) return

        const updatedPreferences = {
            ...preferences,
            blockedDays: preferences.blockedDays.filter((_, i) => i !== index)
        }

        return updatePreferences(updatedPreferences)
    }

    const updateWorkingDays = async (day: keyof UserPreferences['workingDays'], enabled: boolean) => {
        if (!preferences) return

        const updatedPreferences = {
            ...preferences,
            workingDays: {
                ...preferences.workingDays,
                [day]: enabled
            }
        }

        return updatePreferences(updatedPreferences)
    }

    const updateWorkingHours = async (start: number, end: number) => {
        if (!preferences) return

        const updatedPreferences = {
            ...preferences,
            workingHours: { start, end }
        }

        return updatePreferences(updatedPreferences)
    }

    useEffect(() => {
        fetchPreferences()
    }, [])

    return {
        preferences,
        loading,
        error,
        fetchPreferences,
        updatePreferences,
        addBlockedDay,
        removeBlockedDay,
        updateWorkingDays,
        updateWorkingHours
    }
}
