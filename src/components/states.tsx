import { ReactNode } from 'react'
import Button from './Button'

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-8 w-8 rounded-full border-2 border-warmgray border-t-terracotta animate-spin" />
      <p className="mt-3 text-sm text-ink/60">{label}</p>
    </div>
  )
}

export function EmptyState({
  title,
  message,
  icon,
  action,
}: {
  title: string
  message: string
  icon?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-6">
      <div className="h-14 w-14 rounded-full bg-warmgray/60 flex items-center justify-center text-ink/50">
        {icon ?? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <h3 className="font-serif text-lg mt-3 text-ink">{title}</h3>
      <p className="mt-1 text-sm text-ink/60 max-w-xs">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-6">
      <div className="h-14 w-14 rounded-full bg-brick/10 flex items-center justify-center text-brick">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="font-serif text-lg mt-3 text-ink">Something went wrong</h3>
      <p className="mt-1 text-sm text-ink/60 max-w-xs">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  )
}
