'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ContactAvatarProps {
  src?: string | null
  alt: string
  size?: number
  className?: string
}

export default function ContactAvatar({ 
  src, 
  alt, 
  size = 32, 
  className = '' 
}: ContactAvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  // Usar proxy por defecto para URLs de Google para evitar rate limits
  const [useProxy, setUseProxy] = useState(src?.includes('googleusercontent.com') || false)

  // Función para obtener las iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  // Función para crear URL del proxy si es necesario
  const getImageUrl = (originalUrl: string) => {
    if (useProxy && originalUrl.includes('googleusercontent.com')) {
      return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`
    }
    return originalUrl
  }

  const handleImageError = () => {
    console.warn('Image load error for:', src)
    if (!useProxy && src && src.includes('googleusercontent.com')) {
      // Primer intento falló, probar con proxy
      console.log('Retrying with proxy for:', src)
      setUseProxy(true)
      setIsLoading(true)
    } else {
      // Si ya estábamos usando proxy o no es de Google, mostrar avatar con iniciales
      console.log('Falling back to initials for:', src)
      setImageError(true)
      setIsLoading(false)
    }
  }

  // Si no hay imagen o falló la carga completamente, mostrar avatar con iniciales
  if (!src || imageError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.4 }}>
          {getInitials(alt)}
        </span>
      </div>
    )
  }

  return (
    <div className={`relative rounded-full overflow-hidden ${className}`} style={{ width: size, height: size }}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-300 dark:bg-gray-600 animate-pulse rounded-full"
          style={{ width: size, height: size }}
        />
      )}
      <Image
        key={`${src}-${useProxy}`} // Key para forzar re-render cuando cambie useProxy
        src={getImageUrl(src)}
        alt={alt}
        width={size}
        height={size}
        className="rounded-full object-cover"
        onLoad={() => setIsLoading(false)}
        onError={handleImageError}
        unoptimized={src.includes('googleusercontent.com')} // Solo para URLs de Google
      />
    </div>
  )
}