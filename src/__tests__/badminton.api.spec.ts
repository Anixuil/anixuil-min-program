import { describe, it, expect, vi } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: (opts: any) => {
    if (opts.url === '/badminton/createMatchGameByMode' && opts.method === 'POST') return Promise.resolve(true)
    if (opts.url === '/badminton/registrationScore' && opts.method === 'POST') return Promise.resolve(21)
    return Promise.resolve(true)
  }
}))

import BadmintonAPI from '@/api/badminton'

describe('badminton api', () => {
  it('create match game by mode', async () => {
    const ok = await BadmintonAPI.createMatchGameByMode({ matchId: 'x' })
    expect(ok).toBe(true)
  })
  it('registration score', async () => {
    const s = await BadmintonAPI.registrationScore({ matchGameId: 'g', matchGamePlayerId: 'p', score: 21 })
    expect(s).toBe(21)
  })
})
