'use client'

import { useState, useEffect } from 'react'
import { UserPreferences, BlockedTimeSlot, BlockSlotRequest, WorkingHours } from '@/types/calendar'

const DEFAULT_WORKING_HOURS: WorkingHours = {
  start: 9, // 9 AM
  end: 17  // 5 PM
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user preferences
  const loadPreferences = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/preferences')
      
      if (!response.ok) {
        if (response.status === 404) {
          // No preferences found, create default ones
          await createDefaultPreferences()
          return
        }
        throw new Error('Failed to load preferences')
      }
      
      const data = await response.json()
      setPreferences(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences')
      console.error('Error loading preferences:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create default preferences for new user
  const createDefaultPreferences = async () => {
    try {
      const defaultPrefs = {
        blockedDays: [], // No blocked days by default
        workingHours: DEFAULT_WORKING_HOURS,
        blockedTimeSlots: [],
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }

      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(defaultPrefs)
      })

      if (!response.ok) {
        throw new Error('Failed to create default preferences')
      }

      const data = await response.json()
      setPreferences(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create preferences')
      console.error('Error creating default preferences:', err)
    }
  }

  // Update working hours
  const updateWorkingHours = async (workingHours: WorkingHours) => {
    if (!preferences) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workingHours })
      })

      if (!response.ok) {
        throw new Error('Failed to update working hours')
      }

      const updatedPrefs = await response.json()
      setPreferences(updatedPrefs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update working hours')
      console.error('Error updating working hours:', err)
    } finally {
      setLoading(false)
    }
  }

  // Update blocked days
  const updateBlockedDays = async (blockedDays: number[]) => {
    if (!preferences) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ blockedDays })
      })

      if (!response.ok) {
        throw new Error('Failed to update blocked days')
      }

      const updatedPrefs = await response.json()
      setPreferences(updatedPrefs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update blocked days')
      console.error('Error updating blocked days:', err)
    } finally {
      setLoading(false)
    }
  }

  // Block time slot
  const blockTimeSlot = async (request: BlockSlotRequest) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/preferences/block-slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error('Failed to block time slot')
      }

      const updatedPrefs = await response.json()
      setPreferences(updatedPrefs)
      return updatedPrefs
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to block time slot')
      console.error('Error blocking time slot:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Remove blocked time slot
  const removeBlockedSlot = async (slotId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/preferences/block-slot/${slotId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to remove blocked slot')
      }

      const updatedPrefs = await response.json()
      setPreferences(updatedPrefs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove blocked slot')
      console.error('Error removing blocked slot:', err)
    } finally {
      setLoading(false)
    }
  }

  // Toggle blocked slot active state
  const toggleBlockedSlot = async (slotId: string, isActive: boolean) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/preferences/block-slot/${slotId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      })

      if (!response.ok) {
        throw new Error('Failed to toggle blocked slot')
      }

      const updatedPrefs = await response.json()
      setPreferences(updatedPrefs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle blocked slot')
      console.error('Error toggling blocked slot:', err)
    } finally {
      setLoading(false)
    }
  }

  // Check if a time slot is blocked by preferences
  const isTimeSlotBlocked = (start: Date, end: Date): boolean => {
    if (!preferences) return false

    const dayOfWeek = start.getDay()
    const startHour = start.getHours()
    const endHour = end.getHours()

    // Check blocked days
    if (preferences.blockedDays.includes(dayOfWeek)) {
      return true
    }

    // Check working hours
    if (startHour < preferences.workingHours.start || endHour > preferences.workingHours.end) {
      return true
    }

    // Check blocked time slots
    for (const blockedSlot of preferences.blockedTimeSlots) {
      if (!blockedSlot.isActive) continue

      const blockedStart = new Date(blockedSlot.start)
      const blockedEnd = new Date(blockedSlot.end)

      // Check if the time slot overlaps with blocked slot
      if (start < blockedEnd && end > blockedStart) {
        return true
      }

      // Check recurrence if applicable
      if (blockedSlot.recurrence && isRecurringSlotBlocked(start, end, blockedSlot)) {
        return true
      }
    }

    return false
  }

  // Helper function to check recurring blocked slots
  const isRecurringSlotBlocked = (start: Date, end: Date, blockedSlot: BlockedTimeSlot): boolean => {
    if (!blockedSlot.recurrence) return false

    const { frequency, interval, endDate, daysOfWeek } = blockedSlot.recurrence
    const blockedStart = new Date(blockedSlot.start)
    const recurEndDate = endDate ? new Date(endDate) : null

    // If recurrence has ended, not blocked
    if (recurEndDate && start > recurEndDate) {
      return false
    }

    switch (frequency) {
      case 'daily':
        const daysDiff = Math.floor((start.getTime() - blockedStart.getTime()) / (1000 * 60 * 60 * 24))
        return daysDiff >= 0 && daysDiff % interval === 0
      
      case 'weekly':
        if (daysOfWeek && !daysOfWeek.includes(start.getDay())) {
          return false
        }
        const weeksDiff = Math.floor((start.getTime() - blockedStart.getTime()) / (1000 * 60 * 60 * 24 * 7))
        return weeksDiff >= 0 && weeksDiff % interval === 0
      
      case 'monthly':
        const monthsDiff = (start.getFullYear() - blockedStart.getFullYear()) * 12 + 
                          (start.getMonth() - blockedStart.getMonth())
        return monthsDiff >= 0 && monthsDiff % interval === 0
      
      default:
        return false
    }
  }

  useEffect(() => {
    loadPreferences()
  }, [])

  return {
    preferences,
    loading,
    error,
    loadPreferences,
    updateWorkingHours,
    updateBlockedDays,
    blockTimeSlot,
    removeBlockedSlot,
    toggleBlockedSlot,
    isTimeSlotBlocked
  }
}
