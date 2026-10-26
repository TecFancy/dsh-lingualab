/**
 * What the home says about an episode, one short item at a time.
 *
 * The stage and the table say the same things in the same order, so the items are built once and
 * drawn by whoever shows them: the stage as chips, a table row as one line joined by ` · `. An item
 * with nothing to say is left out, never printed as a zero. The size of the file is not said at all:
 * it is a fact about the disk, not about the practice.
 */
import { hasMedia, videoMarkOf } from '../../../features/library/index.ts'
import type { EpisodeEntry } from '../../../shared/protocol.ts'
import type { Translate } from '../../../context.ts'

/** One item: what it says, and whether it is a warning. */
export interface SayPart {
  readonly text: string
  readonly warn: boolean
}

/** What an episode's subtitles amount to, in one short word, and whether that is a warning. */
function subtitlePart(t: Translate, entry: EpisodeEntry): SayPart {
  if (!hasMedia(entry)) return { text: t('pickerNoAudio'), warn: false }
  const en = entry.subtitleEn !== null
  const zh = entry.subtitleZh !== null
  if (en && zh) return { text: t('subtitleBadgeBoth'), warn: false }
  if (en) return { text: t('subtitleBadgeEn'), warn: false }
  if (zh) return { text: t('subtitleBadgeZh'), warn: false }
  return { text: t('subtitleBadgeNone'), warn: true }
}

/** What the material is: subtitles, video, and how many segments. */
export function materialSay(t: Translate, entry: EpisodeEntry): readonly SayPart[] {
  const parts: SayPart[] = [subtitlePart(t, entry)]
  const video = videoMarkOf(entry)
  if (video === 'ready') parts.push({ text: t('videoMark'), warn: false })
  else if (video === 'unprepared') parts.push({ text: t('videoMarkUnprepared'), warn: true })
  if (entry.segments.length > 0) parts.push({ text: t('homeSegmentTotal', { total: entry.segments.length }), warn: false })
  return parts
}

/** What was kept from it: phrases (and how many are still in practice), then hard ones. */
export function keptSay(t: Translate, entry: EpisodeEntry): readonly SayPart[] {
  const parts: SayPart[] = []
  const { count, review, hard } = entry.notes
  if (count > 0) {
    parts.push({
      text: review > 0 ? t('homeKeptReview', { count, review }) : t('homeKept', { count }),
      warn: false,
    })
  }
  if (hard > 0) parts.push({ text: t('homeHard', { count: hard }), warn: false })
  return parts
}
