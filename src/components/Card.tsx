import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  padded?: boolean
}

export default function Card({ children, className = '', onClick, padded = true }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`card-base ${padded ? 'p-4' : ''} ${onClick ? 'cursor-pointer hover:border-terracotta/50 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
