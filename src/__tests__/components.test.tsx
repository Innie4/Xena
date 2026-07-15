import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import StandingCard from '../components/StandingCard'
import FraudQueue from '../components/FraudQueue'
import { browserEngine } from '../services/prediction/engine'
import { ContributorProfile, FraudFlag, FraudInputWorker, WorkerPayoutRecord } from '../services/prediction/types'
import { workerQueue } from '../mockData'

function profile(events: number): ContributorProfile {
  return {
    id: 'u-test',
    name: 'Test Neighbour',
    streetId: 'st-abak',
    events: Array.from({ length: events }, (_, i) => ({
      id: `e${i}`,
      contributorId: 'u-test',
      amount: 1500,
      at: new Date(2026, i, 15).toISOString(),
    })),
  }
}

describe('AI UI components render without throwing', () => {
  it('StandingCard handles a rich history', () => {
    const html = renderToStaticMarkup(<StandingCard profile={profile(6)} />)
    expect(html).toContain('reliability')
  })

  it('StandingCard handles an empty history (no crash, low score)', () => {
    const html = renderToStaticMarkup(<StandingCard profile={profile(0)} />)
    expect(html).toContain('reliability')
  })

  it('FraudQueue renders detectFraud output from seeded worker queue', () => {
    const workers: FraudInputWorker[] = workerQueue.map((w) => ({
      id: w.id,
      name: w.name,
      street: w.street,
      city: w.city ?? '',
      wallet: w.wallet,
      payoutAmount: w.payoutAmount,
      joinedAt: w.joinedAt,
    }))
    const payouts: WorkerPayoutRecord[] = workerQueue
      .filter((w) => w.payoutAmount)
      .map((w) => ({
        id: `p-${w.id}`,
        workerId: w.id,
        wallet: w.wallet ?? '',
        amount: w.payoutAmount ?? 0,
        at: w.joinedAt ?? new Date().toISOString(),
        streetId: w.street,
        city: w.city ?? '',
      }))
    const flags: FraudFlag[] = browserEngine.detectFraud({ workers, payouts })
    const html = renderToStaticMarkup(<FraudQueue flags={flags} />)
    expect(html).toContain('review')
  })
})
