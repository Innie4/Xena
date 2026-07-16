import { useReducedMotion } from 'framer-motion'

export default function StreakFlame({
  streak,
  suffix = 'mo',
}: {
  streak: number
  suffix?: string
}) {
  const reduce = useReducedMotion()
  const active = streak >= 3
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
        active ? 'text-terracotta' : 'text-ink/45'
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={active && !reduce ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-1 0-1 0-1 2 1 3 3 3 5a5 5 0 0 1-10 0c0-4 4-6 5-11z"
          strokeLinejoin="round"
        />
      </svg>
      <span className="num">{streak}</span>
      <span>{suffix} streak</span>
    </span>
  )
}
