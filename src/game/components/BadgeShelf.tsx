import type { BadgeDef, EarnedBadge } from '../types'

const CATEGORY_LABEL: Record<string, string> = {
  milestone: 'Milestones',
  community: 'Community',
  streak: 'Streaks',
}

export default function BadgeShelf({
  badges,
  all,
}: {
  badges: EarnedBadge[]
  all: BadgeDef[]
}) {
  const earnedIds = new Set(badges.map((b) => b.id))
  const groups = ['milestone', 'community', 'streak']
  return (
    <div className="space-y-3">
      {groups.map((g) => {
        const defs = all.filter((b) => b.category === g)
        if (defs.length === 0) return null
        return (
          <div key={g}>
            <p className="label-text mb-2">{CATEGORY_LABEL[g]}</p>
            <div className="flex flex-wrap gap-2">
              {defs.map((d) => {
                const earned = earnedIds.has(d.id)
                return (
                  <div
                    key={d.id}
                    title={d.blurb}
                    className={`flex items-center gap-2 rounded-btn border px-2.5 py-1.5 ${
                      earned
                        ? 'border-gold/50 bg-gold/10'
                        : 'border-warmgray bg-sand/40 opacity-60'
                    }`}
                  >
                    <span
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        earned
                          ? 'bg-gradient-to-br from-terracotta to-gold text-card'
                          : 'bg-warmgray text-ink/40'
                      }`}
                    >
                      {d.glyph}
                    </span>
                    <span
                      className={`text-xs font-medium ${earned ? 'text-ink' : 'text-ink/45'}`}
                    >
                      {d.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
