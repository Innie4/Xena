import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Card from './Card'
import { browserEngine, streetRankForScore } from '../services/prediction/engine'
import { ContributorProfile } from '../services/prediction/types'
import { formatDate } from '../mockData'

function useCountUp(target: number, duration = 700) {
  const reduce = useReducedMotion()
  const [value, setValue] = useState(reduce ? target : 0)
  useEffect(() => {
    if (reduce) {
      setValue(target)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, reduce])
  return value
}

const RANK_STYLES: Record<string, string> = {
  legend: 'bg-gold/20 text-[#8a6516] border-gold',
  elder: 'bg-olive/15 text-olive border-olive',
  cornerstone: 'bg-terracotta/10 text-terracotta border-terracotta',
  neighbour: 'bg-ink/5 text-ink/70 border-warmgray',
  newcomer: 'bg-warmgray/50 text-ink/55 border-warmgray',
}

export default function StandingCard({
  profile,
  peers,
}: {
  profile: ContributorProfile
  peers?: ContributorProfile[]
}) {
  const reduce = useReducedMotion()
  const reliability = browserEngine.scoreReliability(profile, peers)
  const timing = browserEngine.predictTiming(profile)
  const rank = streetRankForScore(reliability.score)
  const score = useCountUp(reliability.score)

  const win = timing.confidence >= 0.3
  const windowLabel = win
    ? `${formatDate(timing.windowStart)} – ${formatDate(timing.windowEnd)}`
    : 'Building a read on your rhythm…'

  return (
    <Card className="bg-card border-warmgray">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="label-text">Your street standing</p>
          <motion.span
            initial={reduce ? false : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}
            className={`mt-1.5 inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${RANK_STYLES[rank.id]}`}
          >
            {rank.label}
          </motion.span>
        </div>
        <div className="text-right">
          <p className="num text-2xl text-ink leading-none">{score}</p>
          <p className="text-[10px] text-ink/45 mt-0.5">reliability / 100</p>
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full bg-warmgray rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-terracotta to-gold rounded-full"
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${reliability.score}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-btn bg-sand px-3 py-2">
          <p className="text-ink/50">Sweep fee</p>
          <p className="font-medium text-ink mt-0.5">
            {(reliability.tier.rate * 100).toFixed(1)}%
            <span className="text-ink/45 font-normal"> · {reliability.tier.label}</span>
          </p>
        </div>
        <div className="rounded-btn bg-sand px-3 py-2">
          <p className="text-ink/50">Next contribution</p>
          <p className="font-medium text-ink mt-0.5">{windowLabel}</p>
        </div>
      </div>

      {reliability.canVouch && (
        <p className="mt-3 text-[11px] text-olive font-medium">
          You can vouch for {reliability.tier.id === 'elder' ? 3 : reliability.tier.id === 'cornerstone' ? 2 : 1} neighbour
          {reliability.tier.id === 'cornerstone' || reliability.tier.id === 'elder' ? 's' : ''} on the street.
        </p>
      )}

      <p className="mt-2 text-[11px] text-ink/45">
        {reliability.factors[0].note} {rank.blurb}
      </p>

      {reliability.recentStreak > 0 && (
        <p className="mt-1 text-[11px] text-terracotta font-medium">
          {reliability.recentStreak} sweeps in a row, right on rhythm
        </p>
      )}

      {(rank.id === 'elder' || rank.id === 'legend') && (
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.3 }}
          className="mt-2 text-[11px] text-gold font-medium"
        >
          Top of the street — neighbours lean on you.
        </motion.p>
      )}
    </Card>
  )
}
