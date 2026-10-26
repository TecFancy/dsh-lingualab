/**
 * The words around the stage: when it was last heard, what the button says, and where it resumes.
 *
 * Pure, so the choices (which step the button names, which place the hint names) are tested without
 * drawing anything.
 */
import { findSegment, segmentNumber } from '../../../features/library/index.ts'
import type { EpisodeProgress, StepDefinition } from '../../../features/resume/index.ts'
import { agoOf, formatClock } from '../../../shared/lib/format.ts'
import type { EpisodeEntry } from '../../../shared/protocol.ts'
import type { Translate } from '../../../context.ts'

const AGO_KEYS = { now: 'homeAgoNow', minutes: 'homeAgoMinutes', hours: 'homeAgoHours', days: 'homeAgoDays' } as const

/** `接着上次 · 2 小时前`, or 「从这里开始」 for an episode with no place yet. */
export function stageKicker(t: Translate, summary: EpisodeProgress, now: number): string {
  if (summary.entry === null) return t('homeStart')
  const ago = agoOf(summary.entry.updatedAt, now)
  return `${t('homeContinue')} · ${t(AGO_KEYS[ago.unit], { count: ago.count })}`
}

/**
 * The stage's button: 「开始练习」 with no place yet, 「继续跟读模仿」 when the step to do next is one done
 * on this page, and 「继续练习」 when it is not (the two reviews happen in the conversation, or all five are done).
 */
export function stageAction(t: Translate, summary: EpisodeProgress, step: StepDefinition | null): string {
  if (summary.entry === null) return t('startPractice')
  if (step !== null && step.inSession) return t('homeContinueStep', { step: t(step.labelKey) })
  return t('resumePractice')
}

/**
 * Where the button picks up, in words: a clock for a whole file, a segment and a clock, or the start of
 * the next segment once the last one was heard out. `null` with no place yet.
 */
export function resumeHint(t: Translate, entry: EpisodeEntry, summary: EpisodeProgress): string | null {
  const item = summary.entry
  if (item === null) return null
  const time = formatClock(item.at)
  if (entry.segments.length === 0) return t('homeResumeTime', { time })
  const next = summary.next !== summary.segment
  const segment = findSegment(entry.segments, next ? summary.next : summary.segment)
  if (segment === null) return t('homeResumeTime', { time })
  const number = segmentNumber(segment)
  return next ? t('homeResumeSegmentStart', { segment: number }) : t('homeResumeSegment', { segment: number, time })
}
