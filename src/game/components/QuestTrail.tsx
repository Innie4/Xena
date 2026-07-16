import type { QuestDef } from '../types'

export default function QuestTrail({ quests }: { quests: QuestDef[] }) {
  return (
    <div className="space-y-3">
      {quests.map((q) => {
        const done = q.steps.filter((s) => s.done).length
        const total = q.steps.length
        const complete = done === total
        return (
          <div key={q.id} className="rounded-btn border border-warmgray bg-card p-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-ink">{q.title}</p>
              <span
                className={`text-[11px] font-semibold ${
                  complete ? 'text-olive' : 'text-ink/55'
                }`}
              >
                {done}/{total}
              </span>
            </div>
            <p className="text-[11px] text-ink/55 mt-0.5">{q.blurb}</p>
            <ul className="mt-2 space-y-1">
              {q.steps.map((s) => (
                <li key={s.id} className="flex items-center gap-2 text-xs">
                  <span
                    className={`h-4 w-4 rounded-full flex items-center justify-center ${
                      s.done ? 'bg-olive text-card' : 'border border-warmgray text-ink/40'
                    }`}
                  >
                    {s.done && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path
                          d="M20 6L9 17l-5-5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className={s.done ? 'text-ink' : 'text-ink/55'}>{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
