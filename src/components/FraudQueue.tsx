import { useState } from 'react'
import Card from './Card'
import Button from './Button'
import { FraudFlag } from '../services/prediction/types'

export default function FraudQueue({
  flags,
  title = 'Fraud review queue',
}: {
  flags: FraudFlag[]
  title?: string
}) {
  const [reviewed, setReviewed] = useState<Set<string>>(new Set())
  const open = flags.filter((f) => !reviewed.has(f.id))

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-serif text-lg text-ink">{title}</h2>
        <span className="text-xs text-ink/55">
          {open.length} open · {flags.length} flagged
        </span>
      </div>
      {flags.length === 0 ? (
        <Card className="text-sm text-ink/55 text-center py-8">
          No suspicious patterns right now.
        </Card>
      ) : (
        <div className="space-y-2">
          {flags.map((f) => {
            const isReviewed = reviewed.has(f.id)
            const sev =
              f.severity === 'high'
                ? 'bg-brick/10 text-brick border-brick/40'
                : f.severity === 'medium'
                  ? 'bg-gold/15 text-[#8a6516] border-gold/50'
                  : 'bg-warmgray/60 text-ink/60 border-warmgray'
            return (
              <Card key={f.id} className={`${isReviewed ? 'opacity-60' : ''} border-warmgray`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${sev}`}
                      >
                        {f.severity}
                      </span>
                      <p className="font-medium text-ink">{f.entityLabel}</p>
                    </div>
                    <ul className="mt-2 space-y-1 text-xs text-ink/65">
                      {f.signals.map((s, i) => (
                        <li key={i}>• {s.detail}</li>
                      ))}
                    </ul>
                  </div>
                  {!isReviewed && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReviewed((prev) => new Set(prev).add(f.id))}
                    >
                      Mark reviewed
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}
