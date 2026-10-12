/**
 * The order every listing in the host shares.
 *
 * Episode folders, segments, subtitle files and browse entries are all sorted the same way, so
 * the order lives below every module that lists something. It is pure and imports nothing, which
 * is what keeps the scan, the pairing rule and the subtitle choice from importing each other just
 * to sort.
 */

/** Natural order: `S01E2` sorts before `S01E10`, which a plain string sort gets wrong. */
export function compareIds(left: string, right: string): number {
  const split = (value: string): Array<string | number> =>
    value
      .split(/(\d+)/)
      .filter((part) => part.length > 0)
      .map((part) => (/^\d+$/.test(part) ? Number(part) : part.toLowerCase()))
  const a = split(left)
  const b = split(right)
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const one = a[index]
    const two = b[index]
    if (one === undefined) return -1
    if (two === undefined) return 1
    if (one === two) continue
    if (typeof one === 'number' && typeof two === 'number') return one - two
    return String(one).localeCompare(String(two))
  }
  return 0
}
