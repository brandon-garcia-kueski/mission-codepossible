import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Cache en memoria para evitar requests repetidos
const imageCache = new Map<string, { data: ArrayBuffer; contentType: string; timestamp: number }>()
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutos

// Rate limiting simple
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 50 // requests por minuto
const RATE_WINDOW = 60 * 1000 // 1 minuto

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
    const imageUrl = searchParams.get('url')

    if (!imageUrl || !imageUrl.includes('googleusercontent.com')) {
      return NextResponse.json(
        { error: 'Invalid image URL' },
        { status: 400 }
      )
    }

    // Rate limiting por IP
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()
    const rateLimitKey = `${clientIP}-${imageUrl}`

    const currentCount = requestCounts.get(rateLimitKey)
    if (currentCount) {
      if (now < currentCount.resetTime) {
        if (currentCount.count >= RATE_LIMIT) {
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429 }
          )
        }
        requestCounts.set(rateLimitKey, { count: currentCount.count + 1, resetTime: currentCount.resetTime })
      } else {
        requestCounts.set(rateLimitKey, { count: 1, resetTime: now + RATE_WINDOW })
      }
    } else {
      requestCounts.set(rateLimitKey, { count: 1, resetTime: now + RATE_WINDOW })
    }

    // Verificar cache
    const cached = imageCache.get(imageUrl)
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('Serving cached image:', imageUrl)
      return new NextResponse(cached.data, {
        status: 200,
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=1800', // Cache por 30 minutos
          'Access-Control-Allow-Origin': '*',
          'X-Cache': 'HIT'
        },
      })
    }

    console.log('Proxying image:', imageUrl)

    // Hacer la petición a la imagen con autenticación y retry logic
    let response: Response
    let retryCount = 0
    const maxRetries = 3

    while (retryCount < maxRetries) {
      try {
        response = await fetch(imageUrl, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'User-Agent': 'Mozilla/5.0 (compatible; NextJS-ImageProxy/1.0)',
            'Cache-Control': 'no-cache'
          },
          // Timeout de 10 segundos
          signal: AbortSignal.timeout(10000)
        })

        if (response.ok) {
          break
        } else if (response.status === 429) {
          // Rate limited, esperar antes de reintentar
          const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000 // Exponential backoff
          console.warn(`Rate limited, waiting ${delay}ms before retry ${retryCount + 1}`)
          await new Promise(resolve => setTimeout(resolve, delay))
          retryCount++
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        retryCount++
        if (retryCount >= maxRetries) {
          throw error
        }
        console.warn(`Attempt ${retryCount} failed, retrying:`, error)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
      }
    }

    console.log('Image proxy response status:', response!.status)

    if (!response!.ok) {
      console.error('Failed to fetch image after retries:', response!.status, response!.statusText)
      return NextResponse.json(
        { error: `Failed to fetch image: ${response!.status} ${response!.statusText}` },
        { status: response!.status === 429 ? 429 : 502 }
      )
    }

    const imageBuffer = await response!.arrayBuffer()
    const contentType = response!.headers.get('content-type') || 'image/jpeg'

    // Guardar en cache
    imageCache.set(imageUrl, {
      data: imageBuffer,
      contentType,
      timestamp: now
    })

    // Limpiar cache viejo cada 100 requests
    if (imageCache.size > 100) {
      const cutoff = now - CACHE_DURATION
      for (const [key, value] of imageCache.entries()) {
        if (value.timestamp < cutoff) {
          imageCache.delete(key)
        }
      }
    }

    console.log('Successfully proxied image, content-type:', contentType)

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=1800', // Cache por 30 minutos
        'Access-Control-Allow-Origin': '*',
        'X-Cache': 'MISS'
      },
    })
  } catch (error) {
    console.error('Error proxying image:', error)
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 }
    )
  }
}
