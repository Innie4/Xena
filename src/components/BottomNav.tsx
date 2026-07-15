import { NavLink } from 'react-router-dom'

const items = [
  {
    to: '/app',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#C1552C' : '#1C2129'} strokeWidth="1.8">
        <path d="M3 10.5L12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 9.5V21h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/bills',
    label: 'Bills',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#C1552C' : '#1C2129'} strokeWidth="1.8">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/community',
    label: 'Community',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#C1552C' : '#1C2129'} strokeWidth="1.8">
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" strokeLinecap="round" />
        <path d="M16 5.5a3 3 0 010 5.8M17 20c0-2.5-1-4-3-4.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#C1552C' : '#1C2129'} strokeWidth="1.8">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 bg-card/95 backdrop-blur border-t border-warmgray">
      <div className="max-w-md mx-auto flex justify-around items-stretch">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-0.5 py-2 px-3 flex-1"
          >
            {({ isActive }) => (
              <>
                {item.icon(isActive)}
                <span
                  className={`text-[11px] mt-0.5 ${isActive ? 'text-terracotta font-medium' : 'text-ink/60'}`}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
