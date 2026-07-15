import { describe, it, expect } from 'vitest'
import { browserEngine } from '../services/prediction/engine'
import { ContributorProfile, FraudInput } from '../services/prediction/types'

function profileWithGaps(gapsDays: number[], start = '2025-01-01T10:00:00Z'): ContributorProfile {
  const events = []
  let t = new Date(start).getTime()
  events.push({ id: 'e0', contributorId: 'c1', amount: 100, at: new Date(t).toISOString() })
  for (const g of gapsDays) {
    t += g * 24 * 60 * 60 * 1000
    events.push({ id: `e${events.length}`, contributorId: 'c1', amount: 100, at: new Date(t).toISOString() })
  }
  return { id: 'c1', name: 'Test', streetId: 'st', events }
}

describe('browserEngine.predictTiming', () => {
  it('returns low confidence with no history', () => {
    const p = { id: 'c', name: 'x', streetId: 's', events: [] }
    const t = browserEngine.predictTiming(p)
    expect(t.confidence).toBeLessThan(0.2)
    expect(t.sampleSize).toBe(0)
  })

  it('predicts a window for steady monthly giving', () => {
    const p = profileWithGaps([30, 31, 29, 30])
    const t = browserEngine.predictTiming(p)
    expect(t.sampleSize).toBe(5)
    expect(t.confidence).toBeGreaterThan(0.4)
    expect(new Date(t.windowEnd).getTime()).toBeGreaterThan(new Date(t.windowStart).getTime())
  })
})

describe('browserEngine.scoreReliability', () => {
  it('scores a steady contributor above a thin one', () => {
    const steady = profileWithGaps([30, 30, 30, 30, 30])
    const thin = { id: 'c2', name: 'y', streetId: 's', events: [{ id: 'a', contributorId: 'c2', amount: 50, at: '2025-05-01T10:00:00Z' }] }
    const a = browserEngine.scoreReliability(steady)
    const b = browserEngine.scoreReliability(thin)
    expect(a.score).toBeGreaterThan(b.score)
    expect(a.factors.length).toBe(4)
  })

  it('grants vouch power at trusted tier or above', () => {
    const steady = profileWithGaps([30, 30, 30, 30, 30, 30, 30])
    const r = browserEngine.scoreReliability(steady)
    expect(r.canVouch).toBe(true)
  })
})

describe('browserEngine.detectFraud', () => {
  it('flags a shared wallet across workers', () => {
    const input: FraudInput = {
      workers: [
        { id: 'w1', name: 'A', street: 'Uyo · Abak Road', city: 'Uyo', wallet: 'WALLET-1' },
        { id: 'w2', name: 'B', street: 'Uyo · Abak Road', city: 'Uyo', wallet: 'WALLET-1' },
      ],
      payouts: [],
    }
    const flags = browserEngine.detectFraud(input)
    expect(flags.some((f) => f.signals.some((s) => s.type === 'shared_wallet'))).toBe(true)
  })

  it('flags a geo mismatch', () => {
    const input: FraudInput = {
      workers: [{ id: 'w1', name: 'A', street: 'Uyo · Abak Road', city: 'Lagos' }],
      payouts: [],
    }
    const flags = browserEngine.detectFraud(input)
    expect(flags.some((f) => f.signals.some((s) => s.type === 'geo_mismatch'))).toBe(true)
  })

  it('returns no flags for clean input', () => {
    const input: FraudInput = {
      workers: [{ id: 'w1', name: 'A', street: 'Uyo · Abak Road', city: 'Uyo', wallet: 'W1' }],
      payouts: [],
    }
    expect(browserEngine.detectFraud(input)).toHaveLength(0)
  })
})
