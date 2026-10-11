/**
 * SHA-256 of a byte array, as lower-case hex.
 *
 * The page sends the hash of the subtitle bytes it parsed with every timing edit, and the host
 * refuses the edit when the file on disk no longer hashes the same. `crypto.subtle` would do
 * this in one line, but it only exists in a secure context, and dsh web is often opened over
 * plain HTTP from another machine on the LAN, where the editor would then simply not work. A
 * subtitle file is a few hundred kilobytes at most, which this hashes in milliseconds.
 *
 * The algorithm is FIPS 180-4, written out once; the test compares it with Node's.
 */

/** The first 32 bits of the fractional parts of the cube roots of the first 64 primes. */
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98,
  0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8,
  0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
  0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
  0xc67178f2,
])

/** Rotate a 32-bit word right. */
function rotr(value: number, bits: number): number {
  return (value >>> bits) | (value << (32 - bits))
}

/**
 * Hash some bytes.
 * @param input - the bytes, as fetched.
 * @returns 64 lower-case hex characters.
 */
export function sha256Hex(input: Uint8Array): string {
  // The message, a 0x80 byte, zero padding, and the bit length in the last eight bytes.
  const length = input.length
  const padded = new Uint8Array((((length + 9 + 63) >> 6) << 6))
  padded.set(input)
  padded[length] = 0x80
  const view = new DataView(padded.buffer)
  const bits = length * 8
  view.setUint32(padded.length - 8, Math.floor(bits / 0x1_0000_0000))
  view.setUint32(padded.length - 4, bits >>> 0)

  const hash = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ])
  const words = new Uint32Array(64)
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let index = 0; index < 16; index += 1) words[index] = view.getUint32(offset + index * 4)
    for (let index = 16; index < 64; index += 1) {
      const w15 = words[index - 15] ?? 0
      const w2 = words[index - 2] ?? 0
      const s0 = rotr(w15, 7) ^ rotr(w15, 18) ^ (w15 >>> 3)
      const s1 = rotr(w2, 17) ^ rotr(w2, 19) ^ (w2 >>> 10)
      words[index] = ((words[index - 16] ?? 0) + s0 + (words[index - 7] ?? 0) + s1) >>> 0
    }
    let [a, b, c, d, e, f, g, h] = [hash[0] ?? 0, hash[1] ?? 0, hash[2] ?? 0, hash[3] ?? 0, hash[4] ?? 0, hash[5] ?? 0, hash[6] ?? 0, hash[7] ?? 0]
    for (let index = 0; index < 64; index += 1) {
      const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)
      const choice = (e & f) ^ (~e & g)
      const t1 = (h + s1 + choice + (K[index] ?? 0) + (words[index] ?? 0)) >>> 0
      const s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)
      const majority = (a & b) ^ (a & c) ^ (b & c)
      const t2 = (s0 + majority) >>> 0
      h = g
      g = f
      f = e
      e = (d + t1) >>> 0
      d = c
      c = b
      b = a
      a = (t1 + t2) >>> 0
    }
    hash[0] = (hash[0] ?? 0) + a
    hash[1] = (hash[1] ?? 0) + b
    hash[2] = (hash[2] ?? 0) + c
    hash[3] = (hash[3] ?? 0) + d
    hash[4] = (hash[4] ?? 0) + e
    hash[5] = (hash[5] ?? 0) + f
    hash[6] = (hash[6] ?? 0) + g
    hash[7] = (hash[7] ?? 0) + h
  }
  return Array.from(hash, (word) => word.toString(16).padStart(8, '0')).join('')
}
