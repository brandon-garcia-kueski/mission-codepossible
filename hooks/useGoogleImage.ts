'use client'

import { useState, useCallback, useEffect } from 'react'

interface UseGoogleImageOptions {
  src?: string | null
  retryDelay?: number
  maxRetries?: number
}

interface UseGoogleImageReturn {
  imageSrc: string | null
  isLoading: boolean
  hasError: boolean
  retry: () => void
}

export function useGoogleImage({
  src,
  retryDelay = 2000,
  maxRetries = 3
}: UseGoogleImageOptions): UseGoogleImageReturn {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const getImageUrl = useCallback((originalUrl: string, useProxy: boolean = false) => {
    if (useProxy && originalUrl.includes('googleusercontent.com')) {
      return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`
    }
    return originalUrl
  }, [])

  const loadImage = useCallback(async (url: string, useProxy: boolean = false) => {
    return new Promise<string>((resolve, reject) => {
      const img = new Image()
      const finalUrl = getImageUrl(url, useProxy)

      img.onload = () => resolve(finalUrl)
      img.onerror = () => reject(new Error('Failed to load image'))

      // Para URLs de Google, usar proxy desde el primer intento
      img.src = finalUrl
    })
  }, [getImageUrl])

  const attemptLoad = useCallback(async () => {
    if (!src) {
      setImageSrc(null)
      setIsLoading(false)
      setHasError(false)
      return
    }

    setIsLoading(true)
    setHasError(false)

    try {
      // Para URLs de Google, intentar con proxy inmediatamente
      const shouldUseProxy = src.includes('googleusercontent.com')
      const finalSrc = await loadImage(src, shouldUseProxy)
      setImageSrc(finalSrc)
      setRetryCount(0)
    } catch (error) {
      console.warn('Failed to load image:', src, error)

      if (retryCount < maxRetries) {
        // Reintentar después de un delay
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          attemptLoad()
        }, retryDelay * Math.pow(2, retryCount)) // Exponential backoff
      } else {
        setHasError(true)
        setImageSrc(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [src, retryCount, maxRetries, retryDelay, loadImage])

  const retry = useCallback(() => {
    setRetryCount(0)
    attemptLoad()
  }, [attemptLoad])

  useEffect(() => {
    attemptLoad()
  }, [src]) // Solo ejecutar cuando cambie src, no attemptLoad

  return {
    imageSrc,
    isLoading,
    hasError,
    retry
  }
}
