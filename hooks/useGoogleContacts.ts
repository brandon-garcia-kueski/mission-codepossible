'use client'

import { useSession } from 'next-auth/react'
import { useState, useCallback } from 'react'

export interface Contact {
  id: string
  name: string
  email: string
  photo?: string | null
}

export const useGoogleContacts = () => {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  const searchContacts = useCallback(async (query: string = ''): Promise<Contact[]> => {
    if (!session) {
      throw new Error('No session available')
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/contacts?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        // Si es un error de permisos, devolver array vacío en lugar de throw
        if (response.status === 403) {
          console.warn('Insufficient permissions for Google Contacts API')
          return []
        }
        throw new Error(error.error || 'Failed to fetch contacts')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching contacts:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [session])

  return {
    searchContacts,
    loading,
    isAuthenticated: !!session
  }
}
