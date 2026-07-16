import type { GameLevel } from '../types'

export default function SparkBar({
  level,
  nextLevel,
  sparksIntoLevel,
  sparksForLevel,
  levelProgress,
}: {
  level: GameLevel
  nextLevel: GameLevel | null
  sparksIntoLevel: number
  sparksForLevel: number
  levelProgress: number
}) {
  const pct = Math.round(Math.min(1, Math.max(0, levelProgress)) * 100)
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-semibold text-ink">
          Level {level.level} · {level.title}
        </p>
        <p className="text-[11px] text-ink/55">
          {nextLevel ? `${sparksIntoLevel} / ${sparksForLevel} sparks` : 'Max level'}
        </p>
      </div>
      <div className="mt-1.5 h-2 w-full rounded-full bg-warmgray overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold to-terracotta transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
