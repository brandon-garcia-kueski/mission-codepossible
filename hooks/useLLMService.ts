import { useState } from 'react'
import { Contact } from './useGoogleContacts'

interface GeneratedMeetingContent {
  title: string
  description: string
}

export const useLLMService = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateMeetingContent = async (
    attendees: Contact[],
    context?: string
  ): Promise<GeneratedMeetingContent | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/llm/generate-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendees,
          context,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate meeting content')
      }

      const result = await response.json()
      return result
    } catch (err) {
      console.error('Error generating meeting content:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    generateMeetingContent,
    loading,
    error,
  }
}
