import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number // current
  max: number // goal
  showPercent?: boolean
  color?: 'olive' | 'terracotta' | 'gold'
  size?: 'sm' | 'md'
}

const colorMap = {
  olive: '#3F4B2B',
  terracotta: '#C1552C',
  gold: '#D9A441',
}

const percent = (value: number, max: number) => (max <= 0 ? 0 : Math.min(100, (value / max) * 100))

export default function ProgressBar({
  value,
  max,
  showPercent = true,
  color = 'olive',
  size = 'md',
}: ProgressBarProps) {
  const pct = percent(value, max)
  const reached = pct >= 100
  const barColor = reached && color === 'olive' ? colorMap.gold : colorMap[color]

  return (
    <div className="w-full">
      <div
        className={`w-full bg-warmgray/70 rounded-full overflow-hidden ${
          size === 'sm' ? 'h-2' : 'h-3'
        }`}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      {showPercent && (
        <div className="flex justify-between mt-1 text-xs text-ink/60">
          <span>{Math.round(pct)}% funded</span>
          <span className="num">{Math.round(pct)}%</span>
        </div>
      )}
    </div>
  )
}
