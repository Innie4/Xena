import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

interface TopNavProps {
  title: string
  subtitle?: string
  right?: ReactNode
  backTo?: string
}

export default function TopNav({ title, subtitle, right, backTo }: TopNavProps) {
  const navigate = useNavigate()
  const { user } = useApp()
  return (
    <header className="bg-olive text-card">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {backTo && (
            <button
              onClick={() => navigate(backTo)}
              className="text-card/80 hover:text-card"
              aria-label="Back"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <div>
            <Link to="/operator" className="font-serif text-lg font-semibold">
              Xena <span className="text-gold">Ops</span>
            </Link>
            <p className="text-xs text-card/70">{title}</p>
            {subtitle && <p className="text-[11px] text-card/50">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {right}
          {user && (
            <div className="text-right">
              <p className="text-sm font-medium">{user.firstName}</p>
              <p className="text-[11px] text-card/60">Operator</p>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
