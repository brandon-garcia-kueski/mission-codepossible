import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { google } from 'googleapis'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'No access token available' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: session.accessToken as string })

    const people = google.people({ version: 'v1', auth })

    console.log('Making request to Google People API...')
    console.log('Access token available:', !!session.accessToken)

    let response
    let otherContactsResponse

    try {
      // Buscar en contactos principales
      response = await people.people.connections.list({
        resourceName: 'people/me',
        personFields: 'names,emailAddresses,photos',
        pageSize: 50,
        sortOrder: 'LAST_MODIFIED_DESCENDING'
      })

      console.log('Main contacts response status:', response.status)
      console.log('Main contacts data:', JSON.stringify(response.data, null, 2))
      console.log('Main connections count:', response.data.connections?.length || 0)

      // Buscar en "otros contactos" 
      console.log('Searching in other contacts...')
      try {
        otherContactsResponse = await people.otherContacts.list({
          pageSize: 100,
          readMask: 'names,emailAddresses,photos'
        })
        console.log('Other contacts response status:', otherContactsResponse.status)
        console.log('Other contacts data:', JSON.stringify(otherContactsResponse.data, null, 2))
        console.log('Other contacts count:', otherContactsResponse.data.otherContacts?.length || 0)
      } catch (otherContactsError: any) {
        console.log('Could not access other contacts - insufficient scope or permission:', otherContactsError.message)
        // Continuar sin otros contactos si no hay permisos
        otherContactsResponse = { data: { otherContacts: [] } }
      }

      // Si no hay conexiones principales, intentar una segunda llamada con parámetros diferentes
      if (!response.data.connections || response.data.connections.length === 0) {
        console.log('No main connections found, trying with different parameters...')

        // Intentar con todos los tipos de fuente disponibles
        const alternativeResponse = await people.people.connections.list({
          resourceName: 'people/me',
          personFields: 'names,emailAddresses,photos,metadata',
          pageSize: 100,
          sources: ['READ_SOURCE_TYPE_CONTACT', 'READ_SOURCE_TYPE_PROFILE']
        })

        console.log('Alternative response:', JSON.stringify(alternativeResponse.data, null, 2))

        if (alternativeResponse.data.connections && alternativeResponse.data.connections.length > 0) {
          response = alternativeResponse
        } else {
          // Si aún no hay resultados, intentar sin especificar sources
          console.log('Still no main connections, trying without source specification...')
          const finalResponse = await people.people.connections.list({
            resourceName: 'people/me',
            personFields: 'names,emailAddresses,photos,phoneNumbers,organizations',
            pageSize: 1000
          })

          console.log('Final response:', JSON.stringify(finalResponse.data, null, 2))

          if (finalResponse.data.connections && finalResponse.data.connections.length > 0) {
            response = finalResponse
          }
        }
      }
    } catch (apiError) {
      console.error('Google People API Error:', apiError)
      throw apiError
    }

    // Combinar contactos principales y otros contactos
    const mainConnections = response.data.connections || []
    const otherConnections = otherContactsResponse.data.otherContacts || []

    console.log('Total main connections:', mainConnections.length)
    console.log('Total other connections:', otherConnections.length)

    // Combinar ambas listas
    const allConnections = [
      ...mainConnections,
      ...otherConnections
    ]

    console.log('Total combined connections:', allConnections.length)

    // Si no hay conexiones después de todos los intentos, informar al usuario
    if (allConnections.length === 0) {
      console.log('No contacts found after all attempts. User may have no contacts in Google Contacts.')
      return NextResponse.json({
        contacts: [],
        message: 'No se encontraron contactos. Asegúrate de tener contactos guardados en tu cuenta de Google.',
        suggestion: 'Puedes agregar contactos en contacts.google.com'
      })
    }

    // Filtrar contactos que tengan al menos nombre o email y coincidan con la búsqueda
    console.log('Processing contacts...')
    const contacts = allConnections
      .filter((person: any) => {
        // Aceptar contactos que tengan al menos nombre o email
        const hasName = person.names && person.names.length > 0
        const hasEmail = person.emailAddresses && person.emailAddresses.length > 0

        if (!hasName && !hasEmail) {
          console.log('Skipping contact without name or email:', person.resourceName)
          return false
        }

        if (!query) return true

        const name = person.names?.[0]?.displayName?.toLowerCase() || ''
        const email = person.emailAddresses?.[0]?.value?.toLowerCase() || ''
        const searchQuery = query.toLowerCase()

        const matches = name.includes(searchQuery) || email.includes(searchQuery)

        if (query && !matches) {
          console.log(`Contact "${name || email}" doesn't match query "${query}"`)
        }

        return matches
      })
      .map((person: any) => {
        // Simplificar la lógica de selección de fotos
        const photos = person.photos || []
        let photoUrl = null

        if (photos.length > 0) {
          // Buscar la primera foto disponible con URL válida
          const validPhoto = photos.find((photo: any) => photo.url && !photo.url.includes('default'))

          // Si no hay foto válida, usar la primera disponible
          const fallbackPhoto = photos[0]

          const selectedPhoto = validPhoto || fallbackPhoto
          photoUrl = selectedPhoto?.url || null

          // Log para debugging
          if (photoUrl) {
            console.log(`Photo found for ${person.names?.[0]?.displayName || person.emailAddresses?.[0]?.value}: ${photoUrl}`)
          }
        }

        const contact = {
          id: person.resourceName || '',
          name: person.names?.[0]?.displayName || person.emailAddresses?.[0]?.value || 'Sin nombre',
          email: person.emailAddresses?.[0]?.value || 'Sin email',
          photo: photoUrl
        }

        // Log del contacto completo para debugging
        console.log('Processed contact:', JSON.stringify(contact, null, 2))

        return contact
      })
      .slice(0, 10) // Limitar a 10 resultados

    console.log(`Returning ${contacts.length} contacts`)
    console.log('Final contacts:', JSON.stringify(contacts.map(c => ({ name: c.name, email: c.email, hasPhoto: !!c.photo })), null, 2))

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}
