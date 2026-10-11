import type { NotePhrase } from '../../../shared/protocol.ts'

/** One phrase with its place in the stored list, which is what an edit addresses. */
export interface NoteRow {
  readonly phrase: NotePhrase
  readonly index: number
}

/** The rows of one segment, or the rows of an episode that has none (`segment` undefined). */
export interface NoteGroup {
  readonly segment: string | undefined
  readonly rows: readonly NoteRow[]
}

/**
 * Group the notes drawer's rows by the segment they are from.
 *
 * The groups come in the episode's segment order, so the drawer reads the way the episode
 * plays, and a segment with no rows has no group. A phrase from a segment the episode no longer
 * has (the file was renamed) keeps a group of its own after the known ones, in the order its
 * phrases first appear, rather than vanishing from the drawer. A phrase with no segment in an
 * episode that has them belongs to the first one, the same rule the notes file applies.
 * Within a group the rows keep the order they came in.
 *
 * An episode without segments is one group with no heading.
 * @param rows - the rows to show, after the view's filter.
 * @param order - the episode's segment ids in order; empty for an episode without segments.
 */
export function groupBySegment(rows: readonly NoteRow[], order: readonly string[]): NoteGroup[] {
  if (order.length === 0 && rows.every((row) => row.phrase.segment === undefined)) {
    return rows.length === 0 ? [] : [{ segment: undefined, rows }]
  }
  const groups = new Map<string | undefined, NoteRow[]>()
  for (const row of rows) {
    const segment = row.phrase.segment ?? order[0]
    const group = groups.get(segment)
    if (group === undefined) groups.set(segment, [row])
    else group.push(row)
  }
  const known = order.filter((id) => groups.has(id))
  const strangers = [...groups.keys()].filter((id): id is string => id !== undefined && !known.includes(id))
  // Rows with no segment at all (an episode that has none, mixed with headed ones) come first.
  const sequence: Array<string | undefined> = [...(groups.has(undefined) ? [undefined] : []), ...known, ...strangers]
  return sequence.map((segment) => ({ segment, rows: groups.get(segment) ?? [] }))
}
