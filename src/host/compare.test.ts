import { describe, expect, it } from 'vitest'
import { compareIds } from './compare.ts'

describe('compareIds', () => {
  it('orders by number, not by character', () => {
    expect(['S01E10', 'S01E2', 'S01E1'].sort(compareIds)).toEqual(['S01E1', 'S01E2', 'S01E10'])
  })
})
