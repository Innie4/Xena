import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backTo?: string
  showBell?: boolean
}

export default function PageHeader({ title, subtitle, backTo, showBell = true }: PageHeaderProps) {
  const navigate = useNavigate()
  const { notifications } = useApp()
  const unread = notifications.filter((n) => !n.read).length

  return (
    <header className="bg-card border-b border-warmgray sticky top-0 z-20">
      <div className="w-full lg:max-w-6xl lg:mx-auto lg:px-8 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {backTo && (
            <button
              onClick={() => navigate(backTo)}
              className="text-ink/70 hover:text-terracotta mr-1"
              aria-label="Back"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="font-serif text-xl text-ink leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-ink/55">{subtitle}</p>}
          </div>
        </div>
        {showBell && (
          <button
            onClick={() => navigate('/notifications')}
            className="relative text-ink/70 hover:text-terracotta"
            aria-label="Notifications"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-terracotta text-card text-[10px] flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  )
}
