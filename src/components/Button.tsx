import { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  icon?: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta/40 disabled:cursor-not-allowed'

const variants: Record<Variant, string> = {
  primary: 'bg-terracotta text-card hover:bg-terracotta-dark disabled:bg-warmgray disabled:text-ink/40',
  secondary:
    'bg-transparent text-olive border border-olive hover:bg-olive hover:text-card disabled:opacity-40',
  danger: 'bg-brick text-card hover:bg-[#822f23] disabled:opacity-40',
  ghost: 'bg-transparent text-ink hover:bg-warmgray/60 disabled:opacity-40',
}

const sizes: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-5 py-3',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  icon,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
