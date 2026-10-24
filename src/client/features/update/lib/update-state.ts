/**
 * What the version line says, decided from the host's answer alone.
 *
 * The mapping lives here rather than in the component so the rule that matters can be tested on its
 * own: a failed check is never shown as "up to date". While the first answer is on its way the line
 * says it is checking; once it answers, the release tag decides.
 */
import type { UpdatePayload } from '../../../shared/protocol.ts'

export type UpdateStatus =
  | { readonly kind: 'checking' }
  | { readonly kind: 'latest' }
  | { readonly kind: 'same-version' }
  | { readonly kind: 'available'; readonly version: string }
  | { readonly kind: 'ahead'; readonly version: string }
  | { readonly kind: 'unknown' }

/** Turn the host's payload, still on its way or not, into what the line says. */
export function updateStatus(payload: UpdatePayload | null, checking: boolean): UpdateStatus {
  if (payload === null) return checking ? { kind: 'checking' } : { kind: 'unknown' }
  if (payload.state === 'unknown') return { kind: 'unknown' }
  if (payload.latest === null) return { kind: 'unknown' }
  if (payload.state === 'available') return { kind: 'available', version: payload.latest.version }
  if (payload.state === 'ahead') return { kind: 'ahead', version: payload.latest.version }
  if (payload.state === 'same-version') return { kind: 'same-version' }
  return { kind: 'latest' }
}

/** The short label of the running build: `v0.17.0 · 8609774`, with `+` when the checkout was dirty. */
export function versionLabel(payload: UpdatePayload | null): string {
  if (payload === null || payload.current.version.length === 0) return ''
  const mark = payload.current.dirty ? '+' : ''
  const commit = payload.current.commit === null ? '' : ` · ${payload.current.commit}`
  return `v${payload.current.version}${mark}${commit}`
}
