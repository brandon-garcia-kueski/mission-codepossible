import { GoogleGenerativeAI } from '@google/generative-ai'

class LLMService {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables')
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  }

  async generateMeetingTitleAndDescription(attendees: string[], context?: string): Promise<{
    title: string
    description: string
  }> {
    try {
      const attendeeList = attendees.length > 0 ? attendees.join(', ') : 'team members'
      
      const prompt = `
Generate a professional meeting title and description based on the following information:

Attendees: ${attendeeList}
${context ? `Additional context: ${context}` : ''}

Please provide:
1. A concise, professional meeting title (max 60 characters)
2. A brief meeting description/agenda (2-3 sentences, max 200 characters)

The meeting should sound collaborative and purposeful. If no specific context is provided, assume it's a general coordination/planning meeting.

Respond in JSON format:
{
  "title": "Meeting Title Here",
  "description": "Meeting description here..."
}

Important: Only return the JSON object, no additional text or markdown formatting.
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse the JSON response
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim()
      const parsed = JSON.parse(cleanedText)
      
      return {
        title: parsed.title || 'Team Meeting',
        description: parsed.description || 'Discussion and coordination meeting with team members.'
      }
    } catch (error) {
      console.error('Error generating meeting content:', error)
      
      // Fallback to default content
      return {
        title: 'Team Meeting',
        description: 'Discussion and coordination meeting with team members.'
      }
    }
  }

  async generateMeetingContext(attendees: string[], previousContext?: string): Promise<string> {
    try {
      const attendeeList = attendees.length > 0 ? attendees.join(', ') : 'team members'
      
      const prompt = `
Based on the attendees: ${attendeeList}
${previousContext ? `Previous context: ${previousContext}` : ''}

Generate a brief, professional context for what this meeting might be about. Consider:
- The roles or departments the attendees might represent
- Common business objectives
- Collaborative activities

Provide a single sentence (max 100 characters) describing the likely meeting purpose.
Only return the sentence, no additional formatting.
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text().trim()
      
      return text || 'General coordination and planning discussion'
    } catch (error) {
      console.error('Error generating meeting context:', error)
      return 'General coordination and planning discussion'
    }
  }
}

export const llmService = new LLMService()
