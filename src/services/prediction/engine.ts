// Phase 3: deterministic in-browser implementation of the PredictionEngine.
// Pure functions over the typed inputs; no UI, no fake numbers. A real model
// can later implement the same PredictionEngine interface and be dropped in.

import {
  Confidence,
  TimingPrediction,
  ReliabilityScore,
  ReliabilityFactor,
  FeeTier,
  FraudInput,
  FraudInputWorker,
  FraudFlag,
  FraudSeverity,
  FraudSignal,
  WorkerPayoutRecord,
  PredictionEngine,
} from './types'

const DAY_MS = 24 * 60 * 60 * 1000

const FEE_TIERS: FeeTier[] = [
  {
    id: 'standard',
    label: 'Standard',
    rate: 0.05,
    minScore: 0,
    blurb: 'Default advance fee. Build a clean sweep record to drop it.',
  },
  {
    id: 'trusted',
    label: 'Trusted',
    rate: 0.035,
    minScore: 70,
    blurb: 'Consistently on time. Lower fee, can vouch for one neighbour.',
  },
  {
    id: 'cornerstone',
    label: 'Cornerstone',
    rate: 0.02,
    minScore: 85,
    blurb: 'Reliable corner of the street. Can vouch for two neighbours.',
  },
  {
    id: 'elder',
    label: 'Street Elder',
    rate: 0.01,
    minScore: 95,
    blurb: 'The street leans on you. Smallest fee, vouch for three.',
  },
]

function tierForScore(score: number): FeeTier {
  let chosen = FEE_TIERS[0]
  for (const tier of FEE_TIERS) {
    if (score >= tier.minScore) chosen = tier
  }
  return chosen
}

function isoDaysAgo(n: number, now: Date): string {
  return new Date(now.getTime() - n * DAY_MS).toISOString()
}

function dayOfMonth(d: Date): number {
  return d.getDate()
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}

export const browserEngine: PredictionEngine = {
  predictTiming(profile, now = new Date()): TimingPrediction {
    const events = [...profile.events].sort(
      (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
    )
    const sampleSize = events.length

    if (sampleSize < 2) {
      const fallback = isoDaysAgo(-14, now)
      return {
        windowStart: fallback,
        windowEnd: isoDaysAgo(-14 + 7, now),
        confidence: 0.15,
        basis:
          sampleSize === 0
            ? 'No contribution history yet. Showing a gentle 2-week nudge.'
            : 'Only one contribution on record. Too little to read a rhythm.',
        sampleSize,
      }
    }

    // Recency-weighted intervals between consecutive contributions.
    const intervals: number[] = []
    const weights: number[] = []
    for (let i = 1; i < events.length; i++) {
      const gap = (new Date(events[i].at).getTime() - new Date(events[i - 1].at).getTime()) / DAY_MS
      if (gap <= 0) continue
      intervals.push(gap)
      // More recent gaps count more.
      weights.push(i)
    }

    const totalWeight = weights.reduce((s, w) => s + w, 0) || 1
    const avgInterval =
      intervals.reduce((s, gap, i) => s + gap * weights[i], 0) / totalWeight

    // Spread reflects how steady (vs erratic) the giver is.
    const variance =
      intervals.reduce((s, gap, i) => {
        const dev = gap - avgInterval
        return s + weights[i] * dev * dev
      }, 0) / totalWeight
    const std = Math.sqrt(variance)
    const spread = clamp01(std / Math.max(avgInterval, 1))

    const lastAt = new Date(events[events.length - 1].at)
    const predictedAt = new Date(lastAt.getTime() + avgInterval * DAY_MS)

    // Confidence grows with sample size and steadiness.
    const sizeConf = clamp01((sampleSize - 2) / 10)
    const steadiness = 1 - spread
    const confidence: Confidence = clamp01(0.25 + 0.5 * sizeConf + 0.25 * steadiness)

    const win = Math.max(2, Math.round(avgInterval * (0.35 + spread * 0.4)))
    const windowStart = new Date(predictedAt.getTime() - win * DAY_MS)
    const windowEnd = new Date(predictedAt.getTime() + win * DAY_MS)

    return {
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      confidence,
      expectedDayOfMonth: dayOfMonth(predictedAt),
      expectedWeekday: predictedAt.getDay(),
      basis: `Read from ${sampleSize} contributions, weighted to recent months; typical gap ≈ ${Math.round(
        avgInterval,
      )} days, ${spread < 0.4 ? 'steady' : 'a bit irregular'}.`,
      sampleSize,
    }
  },

  scoreReliability(profile, peers = []): ReliabilityScore {
    const events = [...profile.events].sort(
      (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
    )
    const sampleSize = events.length

    // We treat "on time" as within 3 days of that contributor's own median gap.
    let onTimeRate = 0
    let consistency = 0
    let recentStreak = 0
    if (sampleSize >= 2) {
      const gaps: number[] = []
      for (let i = 1; i < events.length; i++) {
        gaps.push(
          (new Date(events[i].at).getTime() - new Date(events[i - 1].at).getTime()) / DAY_MS,
        )
      }
      const sorted = [...gaps].sort((a, b) => a - b)
      const median = sorted[Math.floor(sorted.length / 2)]
      const tol = Math.max(3, median * 0.25)
      const onTime = gaps.filter((g) => Math.abs(g - median) <= tol).length
      onTimeRate = clamp01(onTime / gaps.length)

      const mean = gaps.reduce((s, g) => s + g, 0) / gaps.length
      const variance = gaps.reduce((s, g) => s + (g - mean) ** 2, 0) / gaps.length
      const cv = Math.sqrt(variance) / (mean || 1)
      consistency = clamp01(1 - cv)

      // Streak: count back from the most recent event while gaps stay on-time-ish.
      for (let i = gaps.length - 1; i >= 0; i--) {
        if (Math.abs(gaps[i] - median) <= tol) recentStreak++
        else break
      }
    }

    const disputes = profile.disputes ?? 0
    const resolutions = profile.resolutions ?? 0
    const disputeRate = clamp01(disputes / Math.max(1, sampleSize + disputes))
    const resolvedShare = resolutions > 0 ? clamp01(resolutions / Math.max(1, disputes)) : 0
    const disputesQuality = clamp01(1 - disputeRate + 0.3 * resolvedShare * disputeRate)

    const factors: ReliabilityFactor[] = [
      {
        key: 'onTime',
        label: 'Pays when expected',
        value: onTimeRate,
        weight: 0.4,
        note:
          sampleSize < 2
            ? 'Not enough history to judge timing yet.'
            : `${Math.round(onTimeRate * 100)}% of contributions landed near their usual rhythm.`,
      },
      {
        key: 'consistency',
        label: 'Steady rhythm',
        value: consistency,
        weight: 0.25,
        note:
          sampleSize < 2
            ? 'Needs more data to see a pattern.'
            : consistency > 0.7
              ? 'Very predictable cadence.'
              : 'Cadence varies. That is normal for some streets.',
      },
      {
        key: 'streak',
        label: 'Current streak',
        value: clamp01(recentStreak / 4),
        weight: 0.2,
        note:
          recentStreak === 0
            ? 'No active streak right now.'
            : `${recentStreak} recent contribution${recentStreak > 1 ? 's' : ''} in a row on rhythm.`,
      },
      {
        key: 'disputes',
        label: 'Disputes handled',
        value: disputesQuality,
        weight: 0.15,
        note:
          disputes === 0
            ? 'No disputes on record.'
            : `${disputes} dispute${disputes > 1 ? 's' : ''}, ${Math.round(
                resolvedShare * 100,
              )}% resolved.`,
      },
    ]

    let raw = factors.reduce((s, f) => s + f.value * f.weight, 0)

    // Peer comparison: a notch up if this contributor is notably better than
    // the street average (only when peers exist).
    if (peers.length > 0) {
      const peerEvents = peers.flatMap((p) => p.events)
      const peerSize = peerEvents.length / Math.max(1, peers.length)
      if (sampleSize >= peerSize) raw = clamp01(raw + 0.05)
    }

    const score = Math.round(clamp01(raw) * 100)
    const tier = tierForScore(score)

    return {
      contributorId: profile.id,
      score,
      tier,
      factors,
      canVouch: score >= 70,
      recentStreak,
    }
  },

  detectFraud(input: FraudInput): FraudFlag[] {
    const flags: FraudFlag[] = []
    const now = new Date()

    // shared_wallet: multiple workers banking to the same wallet address.
    const byWallet = new Map<string, FraudInputWorker[]>()
    for (const w of input.workers) {
      if (!w.wallet) continue
      const list = byWallet.get(w.wallet) ?? []
      list.push(w)
      byWallet.set(w.wallet, list)
    }
    for (const [wallet, group] of byWallet) {
      if (group.length < 2) continue
      const signals: FraudSignal[] = [
        {
          type: 'shared_wallet',
          detail: `${group.length} workers share wallet ${wallet}: ${group
            .map((g) => g.name)
            .join(', ')}.`,
          weight: 0.6,
        },
      ]
      flags.push({
        id: `fraud-shared-${wallet}`,
        entityType: 'wallet',
        entityId: wallet,
        entityLabel: `Wallet ${wallet}`,
        severity: 'high',
        signals,
        createdAt: now.toISOString(),
        reviewed: false,
      })
    }

    // payout_velocity_spike: one worker paid several times in a short window,
    // or a single payout far above the street norm.
    const byWorker = new Map<string, WorkerPayoutRecord[]>()
    for (const p of input.payouts) {
      const list = byWorker.get(p.workerId) ?? []
      list.push(p)
      byWorker.set(p.workerId, list)
    }
    const amounts = input.payouts.map((p) => p.amount)
    const norm = amounts.length ? amounts.reduce((s, a) => s + a, 0) / amounts.length : 0
    for (const [workerId, pays] of byWorker) {
      if (pays.length < 2) continue
      const within7 = pays.filter(
        (p) => now.getTime() - new Date(p.at).getTime() <= 7 * DAY_MS,
      ).length
      const signals: FraudSignal[] = []
      if (within7 >= 2) {
        signals.push({
          type: 'payout_velocity_spike',
          detail: `${within7} payouts to this worker in the last 7 days.`,
          weight: 0.5,
        })
      }
      for (const p of pays) {
        if (norm > 0 && p.amount > norm * 3) {
          signals.push({
            type: 'payout_velocity_spike',
            detail: `Payout of ${p.amount} is >3x the street average (${Math.round(norm)}).`,
            weight: 0.4,
          })
          break
        }
      }
      if (signals.length) {
        const worker = input.workers.find((w) => w.id === workerId)
        flags.push({
          id: `fraud-velocity-${workerId}`,
          entityType: 'worker',
          entityId: workerId,
          entityLabel: worker?.name ?? workerId,
          severity: signals.length >= 2 ? 'high' : 'medium',
          signals,
          createdAt: now.toISOString(),
          reviewed: false,
        })
      }
    }

    // geo_mismatch: worker operating in a city different from their registered street.
    // Only fires when the street string carries a "City · Street" prefix (seed format),
    // so plain street names never false-positive.
    for (const w of input.workers) {
      if (!w.city) continue
      const parts = w.street.split('·')
      if (parts.length < 2) continue
      const registeredCity = parts[0].trim().toLowerCase()
      if (registeredCity && w.city.toLowerCase() !== registeredCity) {
        flags.push({
          id: `fraud-geo-${w.id}`,
          entityType: 'worker',
          entityId: w.id,
          entityLabel: w.name,
          severity: 'medium',
          signals: [
            {
              type: 'geo_mismatch',
              detail: `Registered on ${w.street} but active in ${w.city}.`,
              weight: 0.45,
            },
          ],
          createdAt: now.toISOString(),
          reviewed: false,
        })
      }
    }

    // new_before_large_payout: recently joined worker with an outsized payout.
    for (const w of input.workers) {
      const big = w.payoutAmount ?? 0
      const joined = w.joinedAt ? (now.getTime() - new Date(w.joinedAt).getTime()) / DAY_MS : 9999
      if (joined < 30 && big > 0 && big > norm * 2) {
        flags.push({
          id: `fraud-new-${w.id}`,
          entityType: 'worker',
          entityId: w.id,
          entityLabel: w.name,
          severity: 'low' as FraudSeverity,
          signals: [
            {
              type: 'new_before_large_payout',
              detail: `Joined ${Math.round(joined)} days ago yet drew a ${big} payout.`,
              weight: 0.3,
            },
          ],
          createdAt: now.toISOString(),
          reviewed: false,
        })
      }
    }

    return flags
  },

  summarizePattern(profile): string {
    const events = profile.events
    if (events.length === 0) return 'No contributions recorded yet. The street is waiting on a first sweep.'
    const pred = this.predictTiming(profile)
    const rel = this.scoreReliability(profile)
    const cadence =
      pred.sampleSize >= 2
        ? `usually gives around day ${pred.expectedDayOfMonth ?? '-'} of the month`
        : 'has only just started giving'
    const tierLine = rel.tier.id === 'standard' ? 'still building trust' : `sits at ${rel.tier.label}`
    return `${profile.name} ${cadence}, with about ${Math.round(
      pred.confidence * 100,
    )}% confidence, and ${tierLine} (reliability ${rel.score}/100).`
  },
}

export interface StreetRank {
  id: 'newcomer' | 'neighbour' | 'cornerstone' | 'elder' | 'legend'
  label: string
  blurb: string
}

const STREET_RANKS: { min: number; rank: StreetRank }[] = [
  {
    min: 95,
    rank: {
      id: 'legend',
      label: 'Street Legend',
      blurb: 'The whole street knows they can count on you.',
    },
  },
  {
    min: 85,
    rank: {
      id: 'elder',
      label: 'Street Elder',
      blurb: 'A steady hand the corner relies on.',
    },
  },
  {
    min: 70,
    rank: {
      id: 'cornerstone',
      label: 'Cornerstone',
      blurb: 'Reliable. Your sweep lands on rhythm.',
    },
  },
  {
    min: 50,
    rank: {
      id: 'neighbour',
      label: 'Neighbour',
      blurb: 'Settling in nicely. Keep the sweep going.',
    },
  },
  {
    min: 0,
    rank: {
      id: 'newcomer',
      label: 'Newcomer',
      blurb: 'New on the street. Every sweep builds your standing.',
    },
  },
]

export function streetRankForScore(score: number): StreetRank {
  return (STREET_RANKS.find((r) => score >= r.min) ?? STREET_RANKS[STREET_RANKS.length - 1]).rank
}

export default browserEngine
