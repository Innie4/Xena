// Phase 3 — Xena "agent" layer.
// Three capabilities, isolated behind a clean interface so a real backend /
// model / LLM can be swapped in later without touching any UI component:
//   1. predictTiming  — next likely inflow as a WINDOW + confidence (not a date)
//   2. scoreReliability — explainable 0..100 score -> fee tier + vouch power
//   3. detectFraud   — rules-based flags -> human review queue (never auto-blocks)
//
// Today these run deterministically in the browser on seed/history data.
// Everything the UI shows routes through this module; no fake numbers live in components.

export interface ContributionEvent {
  id: string
  contributorId: string
  amount: number
  at: string // ISO timestamp
}

export interface ContributorProfile {
  id: string
  name: string
  streetId: string
  events: ContributionEvent[]
  disputes?: number
  resolutions?: number
  joinedAt?: string
}

export type Confidence = number // 0..1

export interface TimingPrediction {
  windowStart: string // ISO date
  windowEnd: string // ISO date
  confidence: Confidence
  expectedDayOfMonth?: number
  expectedWeekday?: number // 0..6
  basis: string
  sampleSize: number
}

export interface ReliabilityFactor {
  key: 'onTime' | 'consistency' | 'streak' | 'disputes'
  label: string
  value: number // 0..1 quality
  weight: number
  note: string
}

export type FeeTierId = 'standard' | 'trusted' | 'cornerstone' | 'elder'

export interface FeeTier {
  id: FeeTierId
  label: string
  rate: number // financing fee as a fraction of the advanced amount
  minScore: number
  blurb: string
}

export interface ReliabilityScore {
  contributorId: string
  score: number // 0..100
  tier: FeeTier
  factors: ReliabilityFactor[]
  canVouch: boolean
  recentStreak: number
}

export type FraudSeverity = 'low' | 'medium' | 'high'

export interface FraudSignal {
  type:
    | 'shared_wallet'
    | 'payout_velocity_spike'
    | 'geo_mismatch'
    | 'new_before_large_payout'
  detail: string
  weight: number
}

export interface FraudFlag {
  id: string
  entityType: 'worker' | 'wallet' | 'payout'
  entityId: string
  entityLabel: string
  severity: FraudSeverity
  signals: FraudSignal[]
  createdAt: string
  reviewed: boolean
  note?: string
}

export interface WorkerPayoutRecord {
  id: string
  workerId: string
  wallet: string
  amount: number
  at: string // ISO
  streetId: string
  city: string
}

export interface FraudInputWorker {
  id: string
  name: string
  street: string
  city: string
  wallet?: string
  payoutAmount?: number
  joinedAt?: string
}

export interface FraudInput {
  workers: FraudInputWorker[]
  payouts: WorkerPayoutRecord[]
}

export interface PredictionEngine {
  predictTiming(profile: ContributorProfile, now?: Date): TimingPrediction
  scoreReliability(profile: ContributorProfile, peers?: ContributorProfile[]): ReliabilityScore
  detectFraud(input: FraudInput): FraudFlag[]
  summarizePattern(profile: ContributorProfile): string
}
