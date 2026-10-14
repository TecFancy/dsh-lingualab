/**
 * What the stage offers about the smooth version of a video: a pure reading of the host's status.
 *
 * The host decides whether the smooth version can be made, whether one exists and how far a running job has
 * got; this only turns that into the one control the picture's corner shows, and into the wording of the
 * estimate and of the time left.
 */
import type { VideoStatusPayload } from '../../../shared/protocol.ts'

/** The control the corner of a playing picture carries. */
export type SmoothControl =
  /** A smooth job runs and the picture keeps playing: its progress, and 「取消」. */
  | { readonly kind: 'running'; readonly fraction: number }
  /** The smooth file plays: the label, and 「改回原画质」. */
  | { readonly kind: 'revert' }
  /** 「准备流畅版」, with the estimate. */
  | { readonly kind: 'offer' }

/**
 * Which control, if any, a playing picture carries.
 * @param status - what the host said about the segment's video.
 * @returns the control, or `null` when there is nothing to offer.
 */
export function smoothControlOf(status: VideoStatusPayload | null): SmoothControl | null {
  if (status === null || status.state !== 'playable') return null
  if (status.jobKind === 'smooth' && status.progress !== null) return { kind: 'running', fraction: status.progress.fraction }
  if (status.smooth.revert) return { kind: 'revert' }
  if (status.smooth.offer) return { kind: 'offer' }
  return null
}

/** Whole minutes, at least one: how long an encode is said to take. */
export function wholeMinutes(seconds: number): number {
  return Math.max(1, Math.ceil(seconds / 60))
}

/** How the estimate is worded: the key of the string and its parameters. */
export interface EstimateText {
  readonly key: 'smoothEstimate' | 'smoothEstimateShort' | 'smoothEstimateSize'
  readonly params: Readonly<Record<string, string | number>>
}

/**
 * The estimate next to 「准备流畅版」.
 * @param bytes - the size the host expects, or `null`.
 * @param seconds - the time the host expects, or `null`.
 * @param size - the size already written out (`330 MB`).
 * @returns the wording, or `null` when nothing is known.
 */
export function estimateText(bytes: number | null, seconds: number | null, size: string): EstimateText | null {
  if (bytes === null) return null
  if (seconds === null) return { key: 'smoothEstimateSize', params: { size } }
  if (seconds < 60) return { key: 'smoothEstimateShort', params: { size } }
  return { key: 'smoothEstimate', params: { size, minutes: wholeMinutes(seconds) } }
}

/** The time left of a long job: seconds below two minutes, whole minutes after. */
export function etaUnit(seconds: number): { readonly unit: 'seconds' | 'minutes'; readonly value: number } {
  return seconds < 120 ? { unit: 'seconds', value: seconds } : { unit: 'minutes', value: wholeMinutes(seconds) }
}
