import { describe, it, expect, vi } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: (opts: any) => {
    if (opts.method === 'GET') return Promise.resolve({ list: [], total: 0, page: 1, pageSize: 10 })
    return Promise.resolve(true)
  }
}))

import BadmintonAPI from '@/api/badminton'

describe('badminton api more', () => {
  it('create match', async () => {
    const ok = await BadmintonAPI.createMatch({ name: 'n', planStartTime: '2025-01-01', planEndTime: '2025-01-02', status: 'notStart' })
    expect(ok).toBeTruthy()
  })
  it('get match', async () => {
    const m = await BadmintonAPI.getMatch('id')
    expect(m).toBeDefined()
  })
  it('update match', async () => {
    const ok = await BadmintonAPI.updateMatch({ id: 'id', status: 'end' })
    expect(ok).toBeTruthy()
  })
  it('delete match', async () => {
    const ok = await BadmintonAPI.deleteMatch('id')
    expect(ok).toBeTruthy()
  })
  it('list match games', async () => {
    const res = await BadmintonAPI.listMatchGame({ page: 1, pageSize: 10 })
    expect(res.list).toBeDefined()
  })
  it('batch create games', async () => {
    const ok = await BadmintonAPI.batchCreateMatchGame({ matchId: 'm', matchGameNum: 2 })
    expect(Array.isArray(ok) || typeof ok === 'boolean').toBeTruthy()
  })
  it('bind players', async () => {
    const ok = await BadmintonAPI.batchMatchGameBindPlayer([{ matchGameId: 'g', playerId: 'p' }])
    expect(ok).toBeTruthy()
  })
  it('unbind player', async () => {
    const ok = await BadmintonAPI.unbindMatchGamePlayer({ id: 'x', matchGameId: 'g' })
    expect(ok).toBeTruthy()
  })
  it('bind player', async () => {
    const ok = await BadmintonAPI.bindMatchGamePlayer({ id: 'x', matchGameId: 'g', playerId: 'p' })
    expect(ok).toBeTruthy()
  })
})
