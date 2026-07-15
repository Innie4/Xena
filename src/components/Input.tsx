import { InputHTMLAttributes, ReactNode, forwardRef } from 'react'

type InputType = 'text' | 'phone' | 'otp' | 'currency' | 'number'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'prefix'> {
  label?: string
  type?: InputType
  hint?: string
  error?: string
  leading?: ReactNode
  trailing?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, type = 'text', hint, error, leading, trailing, className = '', id, ...rest },
  ref,
) {
  const inputType = type === 'phone' ? 'tel' : type === 'otp' || type === 'currency' ? 'text' : type

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label-text block mb-1.5">
          {label}
        </label>
      )}
      <div className="flex items-center bg-card border border-warmgray rounded-btn px-3 focus-within:ring-2 focus-within:ring-terracotta/40">
        {leading && <span className="text-ink/60 mr-1">{leading}</span>}
        <input
          ref={ref}
          id={id}
          type={inputType}
          inputMode={type === 'phone' || type === 'otp' || type === 'currency' ? 'numeric' : undefined}
          className={`w-full bg-transparent py-2.5 outline-none text-ink placeholder:text-ink/35 ${
            type === 'currency' ? 'num' : ''
          } ${className}`}
          {...rest}
        />
        {trailing && <span className="ml-2">{trailing}</span>}
      </div>
      {error ? (
        <p className="text-brick text-xs mt-1">{error}</p>
      ) : hint ? (
        <p className="text-ink/50 text-xs mt-1">{hint}</p>
      ) : null}
    </div>
  )
})

export default Input
