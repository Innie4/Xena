import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ResolvedBanner() {
  const { lastWinner, clearLastWinner } = useApp()
  if (!lastWinner) return null

  return (
    <div className="card-base bg-gold/10 border-gold/40 p-3 flex items-start gap-3">
      <div className="h-8 w-8 shrink-0 rounded-full bg-gold/20 flex items-center justify-center mt-0.5">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D9A441" strokeWidth="2.5">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink">
          “{lastWinner.title}” won the street vote
        </p>
        <div className="flex gap-4 mt-1 text-xs font-medium">
          <Link
            to="/bills"
            onClick={clearLastWinner}
            className="text-terracotta hover:text-terracotta-dark"
          >
            See bill →
          </Link>
          <Link
            to="/community"
            onClick={clearLastWinner}
            className="text-terracotta hover:text-terracotta-dark"
          >
            See project →
          </Link>
        </div>
      </div>
      <button
        onClick={clearLastWinner}
        aria-label="Dismiss"
        className="text-ink/40 hover:text-ink text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}
