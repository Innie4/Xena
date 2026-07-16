export interface ContributionRequest {
  amount: number
  purpose: string
  destination?: string
  fee?: number
  balanceAfter?: number
  meta?: Record<string, string>
}

export interface Receipt {
  id: string
  amount: number
  purpose: string
  destination?: string
  fee: number
  method: string
  timestamp: string
}

export type AuthMethod = 'pin' | 'fingerprint' | 'face'

// Amounts above this always require confirmation, even with quick-pay on.
export const SKIP_THRESHOLD = 20000
export const MAX_PIN_ATTEMPTS = 5
