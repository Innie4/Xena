import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import Button from '../components/Button'
import { EmptyState } from '../components/states'
import { useApp } from '../context/AppContext'
import { timeAgo } from '../mockData'
import { useFakeLoad } from '../hooks/useFakeLoad'

const typeStyle: Record<string, { color: string; bg: string; icon: JSX.Element }> = {
  sweep: {
    color: '#C1552C',
    bg: 'bg-terracotta/10',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
      </svg>
    ),
  },
  community: {
    color: '#3F4B2B',
    bg: 'bg-olive/10',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" strokeLinecap="round" />
      </svg>
    ),
  },
  bill: {
    color: '#9C3B2E',
    bg: 'bg-brick/10',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
  system: {
    color: '#8a6516',
    bg: 'bg-gold/15',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
      </svg>
    ),
  },
}

export default function Notifications() {
  const { notifications, markAllRead } = useApp()
  const loading = useFakeLoad(600)
  const [read, setRead] = useState(false)
  useEffect(() => {
    if (read) markAllRead()
  }, [read, markAllRead])

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="pb-4">
      <PageHeader title="Notifications" subtitle={`${unread} unread`} backTo="/app" />

      <div className="max-w-md mx-auto px-5 py-5">
        {loading ? (
          <div className="card-base p-6 text-center text-ink/50 text-sm">Loading notifications…</div>
        ) : notifications.length === 0 ? (
          <EmptyState title="You’re all caught up" message="New updates will appear here." />
        ) : (
          <>
            <div className="flex justify-end mb-3">
              <Button variant="ghost" size="sm" onClick={() => setRead(true)}>
                Mark all as read
              </Button>
            </div>
            <div className="space-y-2">
              {notifications.map((n) => {
                const s = typeStyle[n.type] ?? typeStyle.system
                return (
                  <Card key={n.id} className={n.read ? 'opacity-70' : ''}>
                    <div className="flex gap-3">
                      <div className={`h-9 w-9 shrink-0 rounded-full ${s.bg} flex items-center justify-center`} style={{ color: s.color }}>
                        {s.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-ink">{n.message}</p>
                        <p className="text-xs text-ink/45 mt-0.5">{timeAgo(n.timestamp)}</p>
                      </div>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-terracotta mt-2 shrink-0" />}
                    </div>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
