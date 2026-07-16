import { NavLink, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useGame } from '../game'
import RankPill from '../game/components/RankPill'
import StreakFlame from '../game/components/StreakFlame'
import SparkBar from '../game/components/SparkBar'
import SparkPop from '../game/components/SparkPop'

const items = [
  {
    to: '/app',
    label: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 10.5L12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 9.5V21h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/bills',
    label: 'Bills',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/community',
    label: 'Community',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" strokeLinecap="round" />
        <path d="M16 5.5a3 3 0 010 5.8M17 20c0-2.5-1-4-3-4.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/vote',
    label: 'Vote',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="4" y="4" width="16" height="16" rx="3" />
      </svg>
    ),
  },
  {
    to: '/notifications',
    label: 'Notifications',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const { user, walletBalance, getStreetName, activeStreetId, notifications, openPropose } = useApp()
  const game = useGame()
  const unread = notifications.filter((n) => !n.read).length

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen bg-olive text-card border-r border-olive-dark">
      <div className="px-5 py-5 flex items-center gap-2 border-b border-card/10">
        <img src="/actual-xena.png" alt="Xena" className="h-9 w-9 rounded-card object-contain" />
        <span className="font-display text-xl font-extrabold tracking-tight">Xena</span>
      </div>

      <div className="px-3 pt-4">
        <button
          onClick={openPropose}
          className="w-full flex items-center gap-3 rounded-btn bg-gradient-to-r from-terracotta to-gold px-3 py-2.5 text-card shadow-sm hover:opacity-95 active:opacity-90 transition-opacity"
        >
          <span className="h-8 w-8 rounded-full bg-card/20 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </span>
          <span className="font-medium">Propose</span>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-card/15 text-card'
                  : 'text-card/70 hover:bg-card/10 hover:text-card'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
            {item.to === '/notifications' && unread > 0 && (
              <span className="ml-auto h-5 min-w-5 px-1.5 rounded-full bg-terracotta text-card text-[11px] flex items-center justify-center">
                {unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-card/10 space-y-3">
        <div className="rounded-card bg-card/10 px-3 py-3 relative">
          <SparkPop sparks={game.sparks} />
          <div className="flex items-center justify-between flex-wrap gap-2">
            <RankPill rank={game.rank} light />
            <StreakFlame streak={game.streak} />
          </div>
          <div className="mt-2">
            <SparkBar
              level={game.level}
              nextLevel={game.nextLevel}
              sparksIntoLevel={game.sparksIntoLevel}
              sparksForLevel={game.sparksForLevel}
              levelProgress={game.levelProgress}
            />
          </div>
        </div>
        <div className="rounded-card bg-card/10 px-3 py-3">
          <p className="text-xs text-card/60">Wallet</p>
          <p className="num text-card mt-0.5">{`₦${walletBalance.toLocaleString('en-NG')}`}</p>
          <p className="text-[11px] text-card/50 mt-1 truncate">{getStreetName(activeStreetId)}</p>
        </div>
        <div className="flex items-center gap-2 mt-3 px-1">
          <div className="h-8 w-8 rounded-full bg-terracotta text-card flex items-center justify-center text-sm font-semibold">
            {user?.firstName?.[0] ?? 'X'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName}</p>
            <Link to="/profile" className="text-[11px] text-card/50 hover:text-card/80">
              View profile
            </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
