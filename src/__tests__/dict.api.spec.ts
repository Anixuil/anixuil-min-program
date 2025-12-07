import { describe, it, expect, vi } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: (opts: any) => {
    return Promise.resolve(true)
  }
}))

import DictAPI from '@/api/dict'

describe('dict api', () => {
  it('list types', async () => {
    const ok = await DictAPI.listSysDictType({ page: 1, pageSize: 10 })
    expect(ok).toBeTruthy()
  })
  it('create type', async () => {
    const ok = await DictAPI.createSysDictType({ dictTypeName: 'x', dictTypeCode: 'y' })
    expect(ok).toBeTruthy()
  })
  it('update type', async () => {
    const ok = await DictAPI.updateSysDictType({ id: '1', dictTypeName: 'x', dictTypeCode: 'y' })
    expect(ok).toBeTruthy()
  })
  it('delete type', async () => {
    const ok = await DictAPI.deleteSysDictType({ ids: ['1'] })
    expect(ok).toBeTruthy()
  })
  it('create dict', async () => {
    const ok = await DictAPI.createSysDict({ dictTypeCode: 't', label: 'l', value: 'v' })
    expect(ok).toBeTruthy()
  })
  it('list dict', async () => {
    const ok = await DictAPI.listSysDict({ page: 1, pageSize: 10, dictTypeCode: 't' })
    expect(ok).toBeTruthy()
  })
  it('update dict', async () => {
    const ok = await DictAPI.updateSysDict({ id: '1', label: 'l' })
    expect(ok).toBeTruthy()
  })
  it('delete dict', async () => {
    const ok = await DictAPI.deleteSysDict({ ids: ['1'] })
    expect(ok).toBeTruthy()
  })
})
