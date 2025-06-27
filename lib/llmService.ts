import { GoogleGenerativeAI } from '@google/generative-ai'

class LLMService {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables')
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' })
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

  async analyzePastMeetings(meetings: any[]): Promise<{
    summary: string
    insights: string[]
    keyTopics: string[]
    recommendedActions: string[]
  }> {
    try {
      // Prepare the meetings data for analysis
      const meetingsData = meetings.map((meeting, index) => ({
        title: meeting.summary || 'Sin título',
        description: meeting.description || '',
        attendees: meeting.attendees?.map((attendee: any) => ({
          email: attendee.email,
          name: attendee.displayName || attendee.email.split('@')[0]
        })) || [],
        date: meeting.start?.dateTime || meeting.start?.date,
        organizer: meeting.organizer?.displayName || meeting.organizer?.email
      }))

      const prompt = `
Analiza las siguientes ${meetings.length} reuniones pasadas y genera un resumen ejecutivo profesional:

${meetingsData.map((meeting, index) => `
Reunión ${index + 1}:
- Título: ${meeting.title}
- Descripción: ${meeting.description}
- Fecha: ${meeting.date}
- Organizador: ${meeting.organizer}
- Asistentes: ${meeting.attendees.map((a: any) => a.name).join(', ')}
`).join('\n')}

Por favor, proporciona un análisis profesional con:
1. Un resumen ejecutivo conciso de las reuniones analizadas
2. Entre 3-5 insights clave sobre los patrones identificados en las reuniones
3. Entre 3-5 temas principales que se discutieron
4. Entre 3-5 acciones recomendadas para mejorar la efectividad de las reuniones

Responde ÚNICAMENTE en formato JSON con esta estructura exacta:
{
  "summary": "resumen ejecutivo aquí",
  "insights": ["insight1", "insight2", "insight3"],
  "keyTopics": ["tema1", "tema2", "tema3"],
  "recommendedActions": ["acción1", "acción2", "acción3"]
}

Importante: Solo devuelve el objeto JSON, sin formato markdown ni texto adicional.
`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Clean and parse the JSON response
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim()
      const parsed = JSON.parse(cleanedText)

      return {
        summary: parsed.summary || `Se analizaron ${meetings.length} reuniones con enfoque en colaboración y coordinación.`,
        insights: parsed.insights || [
          'Las reuniones muestran patrones de colaboración regulares',
          'Participación activa de múltiples stakeholders',
          'Enfoque en coordinación de equipos'
        ],
        keyTopics: parsed.keyTopics || [
          'Planificación de proyectos',
          'Coordinación de equipos',
          'Seguimiento de objetivos'
        ],
        recommendedActions: parsed.recommendedActions || [
          'Implementar agendas más estructuradas',
          'Documentar follow-ups de manera consistente',
          'Evaluar la duración y frecuencia de las reuniones'
        ]
      }
    } catch (error) {
      console.error('Error analyzing past meetings:', error)

      // Fallback response
      return {
        summary: `Se analizaron ${meetings.length} reuniones. Las reuniones muestran un enfoque en colaboración y coordinación de equipos con participación activa de múltiples stakeholders.`,
        insights: [
          'Las reuniones tienden a involucrar múltiples departamentos',
          'Hay una frecuencia regular de reuniones de seguimiento',
          'Los títulos sugieren enfoque en planificación y coordinación',
          'Participación activa de diferentes niveles organizacionales'
        ],
        keyTopics: [
          'Planificación de proyectos',
          'Coordinación de equipos',
          'Seguimiento de objetivos',
          'Toma de decisiones estratégicas',
          'Revisión de procesos'
        ],
        recommendedActions: [
          'Considerar reuniones más estructuradas con agendas claras',
          'Implementar follow-ups documentados',
          'Evaluar la necesidad de todas las reuniones recurrentes',
          'Mejorar la preparación previa de los participantes',
          'Establecer objetivos específicos para cada reunión'
        ]
      }
    }
  }
}

export const llmService = new LLMService()
