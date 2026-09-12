import React from 'react'
import logoPng from '../../assets/logo.png'

interface BodhiLogoProps {
  size?: number | string
  className?: string
  alt?: string
  glow?: boolean
}

export const BodhiLogo: React.FC<BodhiLogoProps> = ({
  size = 24,
  className = '',
  alt = 'BODHI',
  glow = false
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size

  return (
    <img
      src={logoPng}
      alt={alt}
      role="img"
      style={{
        width: pixelSize,
        height: pixelSize,
        filter: glow
          ? 'drop-shadow(0 0 10px var(--bodhi-accent-glow, rgba(93, 214, 44, 0.35)))'
          : undefined
      }}
      className={`inline-block select-none shrink-0 object-contain rounded-lg ${className}`}
      draggable={false}
    />
  )
}

