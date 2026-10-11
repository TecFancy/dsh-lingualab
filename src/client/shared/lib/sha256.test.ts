import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { sha256Hex } from './sha256.ts'

/** Node's answer, which the host uses: the two halves must agree byte for byte. */
const node = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex')

describe('sha256Hex', () => {
  it('matches the published digest of the empty input and of "abc"', () => {
    expect(sha256Hex(new Uint8Array())).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    expect(sha256Hex(new TextEncoder().encode('abc'))).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
  })

  it('agrees with Node at every padding boundary and on a large file', () => {
    for (const size of [1, 55, 56, 63, 64, 65, 119, 120, 128, 1000, 300_000]) {
      const bytes = Uint8Array.from({ length: size }, (_, index) => (index * 31 + 7) % 256)
      expect(sha256Hex(bytes), `${String(size)} bytes`).toBe(node(bytes))
    }
  })
})
