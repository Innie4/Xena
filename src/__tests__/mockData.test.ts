import { describe, it, expect } from 'vitest'
import {
  formatNaira,
  formatDate,
  timeAgo,
  lookupBVN,
  partnerBanks,
} from '../mockData'

describe('formatNaira', () => {
  it('formats whole naira amounts with the naira sign and commas', () => {
    expect(formatNaira(0)).toBe('₦0')
    expect(formatNaira(1500)).toBe('₦1,500')
    expect(formatNaira(2405500)).toBe('₦2,405,500')
  })

  it('rounds fractional amounts', () => {
    expect(formatNaira(1499.6)).toBe('₦1,500')
  })
})

describe('formatDate', () => {
  it('returns a non-empty localized date string', () => {
    const out = formatDate('2026-07-15')
    expect(typeof out).toBe('string')
    expect(out.length).toBeGreaterThan(0)
  })
})

describe('timeAgo', () => {
  it('returns a human relative string', () => {
    const out = timeAgo('2026-07-15T07:42:00')
    expect(typeof out).toBe('string')
    expect(out).toMatch(/min ago|hr ago|day/)
  })
})

describe('lookupBVN (mock Open Banking)', () => {
  const bvn = '22345678901'

  it('derives a Nigerian phone number from the BVN', () => {
    const res = lookupBVN(bvn)
    expect(res.phone).toMatch(/^\+234 \d{3} \d{3} \d{4}$/)
  })

  it('returns the linked accounts tied to the BVN', () => {
    const res = lookupBVN(bvn)
    expect(res.accounts).toHaveLength(3)
    for (const acc of res.accounts) {
      expect(acc.accountNumber).toMatch(/^\d{10}$/)
      expect(acc.bank.length).toBeGreaterThan(0)
      expect(acc.accountName.length).toBeGreaterThan(0)
    }
  })

  it('is deterministic for the same BVN', () => {
    expect(lookupBVN(bvn)).toEqual(lookupBVN(bvn))
  })

  it('produces different accounts for different BVNs', () => {
    const a = lookupBVN('12345678901').accounts[0].accountNumber
    const b = lookupBVN('99887766554').accounts[0].accountNumber
    expect(a).not.toBe(b)
  })
})

describe('partnerBanks', () => {
  it('includes the major partner banks', () => {
    expect(partnerBanks).toContain('Kuda Microfinance Bank')
    expect(partnerBanks).toContain('Opay')
    expect(partnerBanks.length).toBeGreaterThanOrEqual(5)
  })
})
