import { useId } from 'react'
import { motion } from 'framer-motion'

interface FlameRingProps {
  value: number
  max: number
  size?: number // px, default 128 (h-32/w-32 equivalent)
  strokeWidth?: number // default 10
  centerLabel?: string // e.g. "funded", "reliability"
  showPercent?: boolean // default true, shows Math.round(pct*100) + '%' in center
}

export default function FlameRing({
  value,
  max,
  size = 128,
  strokeWidth = 10,
  centerLabel,
  showPercent = true,
}: FlameRingProps) {
  const rawId = useId()
  const gradId = 'flame-' + rawId.replace(/:/g, '')
  const r = 60 - strokeWidth / 2 - 1
  const circ = 2 * Math.PI * r
  const pct = max > 0 ? Math.min(1, value / max) : 0

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="-rotate-90" style={{ width: size, height: size }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#E4DCCB" strokeWidth={strokeWidth} />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C1552C" />
            <stop offset="100%" stopColor="#D9A441" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercent && (
          <span className="num text-ink leading-none" style={{ fontSize: Math.round(size * 0.1875) }}>
            {Math.round(pct * 100)}%
          </span>
        )}
        {centerLabel && (
          <span
            className="text-ink/50 mt-0.5 leading-none"
            style={{ fontSize: Math.max(8, Math.round(size * 0.08)) }}
          >
            {centerLabel}
          </span>
        )}
      </div>
    </div>
  )
}
