import { describe, it, expect } from 'vitest'
import { normalizeRates, fairMultipliers } from '@/utils/winrate'

describe('winrate util', () => {
  it('normalizes rates', () => {
    const n = normalizeRates(0.5, 0.5)
    expect(n.a).toBeCloseTo(0.5)
    expect(n.b).toBeCloseTo(0.5)
  })
  it('handles zeros', () => {
    const n = normalizeRates(0, 0)
    expect(n.a).toBe(0.5)
    expect(n.b).toBe(0.5)
  })
  it('fair multipliers', () => {
    const m = fairMultipliers(0.5, 0.8)
    expect(m.a).toBeGreaterThan(1)
    expect(m.b).toBeGreaterThan(1)
  })
})
