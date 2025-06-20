/**
 * Common timezone utilities for the meeting scheduler
 */

export interface TimezoneInfo {
  value: string
  label: string
  offset: string
}

// Common timezones used in business
export const COMMON_TIMEZONES: TimezoneInfo[] = [
  { value: 'America/Mexico_City', label: 'Mexico City (CDT/CST)', offset: 'UTC-6/-5' },
  { value: 'America/New_York', label: 'New York (EDT/EST)', offset: 'UTC-4/-5' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PDT/PST)', offset: 'UTC-7/-8' },
  { value: 'America/Chicago', label: 'Chicago (CDT/CST)', offset: 'UTC-5/-6' },
  { value: 'America/Denver', label: 'Denver (MDT/MST)', offset: 'UTC-6/-7' },
  { value: 'Europe/London', label: 'London (BST/GMT)', offset: 'UTC+1/+0' },
  { value: 'Europe/Paris', label: 'Paris (CEST/CET)', offset: 'UTC+2/+1' },
  { value: 'Europe/Berlin', label: 'Berlin (CEST/CET)', offset: 'UTC+2/+1' },
  { value: 'Europe/Madrid', label: 'Madrid (CEST/CET)', offset: 'UTC+2/+1' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 'UTC+9' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 'UTC+8' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 'UTC+8' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)', offset: 'UTC+11/+10' },
]

/**
 * Get the user's browser timezone
 */
export const getBrowserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Get timezone info for a given timezone
 */
export const getTimezoneInfo = (timezone: string): TimezoneInfo | null => {
  const info = COMMON_TIMEZONES.find(tz => tz.value === timezone)
  if (info) return info
  
  // If not in common list, try to create a basic one
  try {
    const now = new Date()
    const offset = -now.getTimezoneOffset() / 60
    const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`
    return {
      value: timezone,
      label: timezone.replace('_', ' '),
      offset: `UTC${offsetStr}`
    }
  } catch {
    return null
  }
}

/**
 * Format time in a specific timezone
 */
export const formatTimeInTimezone = (date: Date | string, timezone: string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  
  try {
    return d.toLocaleTimeString('es-ES', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch {
    // Fallback to local time
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }
}

/**
 * Format date and time in a specific timezone
 */
export const formatDateTimeInTimezone = (date: Date | string, timezone: string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  
  try {
    return d.toLocaleString('es-ES', {
      timeZone: timezone,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch {
    // Fallback to local time
    return d.toLocaleString('es-ES', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }
}

/**
 * Get the current offset in hours for a timezone
 */
export const getTimezoneOffset = (timezone: string): number => {
  try {
    const now = new Date()
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
    const local = new Date(utc.toLocaleString('en-US', { timeZone: timezone }))
    return (local.getTime() - utc.getTime()) / (1000 * 60 * 60)
  } catch {
    return 0
  }
}

/**
 * Check if timezone is valid
 */
export const isValidTimezone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}
