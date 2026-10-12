/**
 * The review list across the library: every kept sentence not yet graded 「记住了」.
 *
 * One read, so the home can say how much there is to review (and the review can start) without
 * a request per episode. It walks the library as the scan lists it, folders first and then the
 * loose files at the root, and reads each episode's phrases through {@link readNotes}, the same
 * reader and the same safety checks as `GET /lingualab/notes`; a folder episode whose summary
 * says it has no notes is not opened at all. Nothing here writes: a grade given during review
 * is saved by the episode that is open, through the notes route, like any other edit.
 *
 * An episode opened from outside the library (through 「浏览已有文件」) is not in the scan, so it
 * is not in this list either: the review spans the library, which is what the home shows.
 */
import { inPlayOrder } from '../../../../shared/notes-format.ts'
import type { EpisodeEntry, ReviewEpisode, ReviewPayload } from '../../../../shared/protocol.ts'
import { scanLibrary } from '../../../entities/episode/index.ts'
import { readNotes } from '../../../entities/note/index.ts'
import { EMPTY_STATE, type OpenState } from '../../../entities/open-state/index.ts'

/** One episode's sentences still to review, or `null` when it has none or cannot be read. */
function reviewEpisode(root: string, entry: EpisodeEntry, state: OpenState): ReviewEpisode | null {
  if (entry.notes.count === 0) return null
  const read = readNotes(root, entry.id, state)
  if (!read.ok) return null
  const segments = entry.segments.map((segment) => segment.id)
  const phrases = inPlayOrder(
    read.phrases.filter((phrase) => !phrase.done),
    segments,
  )
  if (phrases.length === 0) return null
  return { episode: entry.id, title: entry.title, kind: entry.kind, segments, phrases }
}

/** Everything to review, in library order. */
export function readReview(root: string, state: OpenState = EMPTY_STATE): ReviewPayload {
  const library = scanLibrary(root, state)
  if (!library.ok) return { ok: false, reason: library.reason, episodes: [], total: 0 }
  const episodes = [...library.episodes, ...library.files]
    .map((entry) => reviewEpisode(root, entry, state))
    .filter((entry): entry is ReviewEpisode => entry !== null)
  return {
    ok: true,
    reason: null,
    episodes,
    total: episodes.reduce((sum, entry) => sum + entry.phrases.length, 0),
  }
}
