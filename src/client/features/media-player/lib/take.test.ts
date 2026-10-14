import { describe, expect, it, vi } from 'vitest'
import { NO_TAKES, allTakes, putTake, revokeTake, type Take } from './take.ts'

const take: Take = { url: 'blob:take', mime: 'audio/webm', ms: 2000 }

describe('the takes', () => {
  it('keeps the newest take of a sentence and says which one it replaced', () => {
    const first = putTake(NO_TAKES, 3, take)
    expect(first).toEqual({ takes: { 3: take }, stale: [] })
    const newer: Take = { ...take, url: 'blob:newer' }
    expect(putTake(first.takes, 3, newer)).toEqual({ takes: { 3: newer }, stale: [take] })
    expect(allTakes({ 1: take, 3: newer })).toEqual([take, newer])
  })

  it('revokes the object URL, and never throws', () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    revokeTake(take)
    expect(revoke).toHaveBeenCalledWith('blob:take')
    revoke.mockImplementation(() => {
      throw new Error('gone')
    })
    expect(() => revokeTake(take)).not.toThrow()
    revoke.mockRestore()
  })
})
