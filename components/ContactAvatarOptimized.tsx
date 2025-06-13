'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useGoogleImage } from '@/hooks/useGoogleImage'

interface ContactAvatarOptimizedProps {
  src?: string | null
  alt: string
  size?: number
  className?: string
}

export default function ContactAvatarOptimized({ 
  src, 
  alt, 
  size = 32, 
  className = '' 
}: ContactAvatarOptimizedProps) {
  const [imageLoadError, setImageLoadError] = useState(false)
  const { imageSrc, isLoading, hasError, retry } = useGoogleImage({ src })

  // Función para obtener las iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  // Si no hay imagen o falló la carga completamente, mostrar avatar con iniciales
  if (!src || hasError || imageLoadError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold rounded-full ${className}`}
        style={{ width: size, height: size }}
        title={hasError ? 'Click to retry loading image' : alt}
        onClick={hasError ? retry : undefined}
        role={hasError ? 'button' : undefined}
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
          className="absolute inset-0 bg-gray-300 dark:bg-gray-600 animate-pulse rounded-full z-10"
          style={{ width: size, height: size }}
        />
      )}
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={alt}
          width={size}
          height={size}
          className="rounded-full object-cover"
          onError={() => setImageLoadError(true)}
          unoptimized={imageSrc.includes('/api/image-proxy')}
          priority={size > 64} // Priorizar imágenes grandes
        />
      )}
    </div>
  )
}
