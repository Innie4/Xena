import { useEffect, useState } from 'react'

interface CountdownRingProps {
  deadline: string
  startedAt: string
  size?: number
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'Ended'
  const totalMin = Math.floor(ms / 60000)
  const d = Math.floor(totalMin / 1440)
  const h = Math.floor((totalMin % 1440) / 60)
  const m = totalMin % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function CountdownRing({ deadline, startedAt, size = 56 }: CountdownRingProps) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const start = new Date(startedAt).getTime()
  const end = new Date(deadline).getTime()
  const total = Math.max(1, end - start)
  const remaining = Math.max(0, end - now)
  const elapsedFrac = Math.min(1, Math.max(0, (now - start) / total))

  const stroke = 5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const center = size / 2

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" style={{ width: size, height: size }}>
        <circle cx={center} cy={center} r={r} fill="none" stroke="#E4DCCB" strokeWidth={stroke} />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#C1552C"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - elapsedFrac)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="num text-ink text-[11px] font-medium leading-none">{formatRemaining(remaining)}</span>
      </div>
    </div>
  )
}
