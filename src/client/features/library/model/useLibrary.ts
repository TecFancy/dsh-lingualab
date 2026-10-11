/**
 * Which episode is open, and its subtitles.
 *
 * Two things happen here and they are separate: the **library listing** (what the
 * picker offers) and the **open episode** (what the stage and the list show).
 * Opening goes through the host rather than through React state, because the host is
 * what remembers the choice and what knows where a file episode's bytes are.
 *
 * The cues are assembled here rather than in the page so the merge rule has one
 * home: an episode with one bilingual file parses it once, an episode with an
 * English and a Chinese track parses both and folds them together.
 *
 * The state keeps the episode id its cues belong to, and the returned list is empty
 * until they match. Without that, switching episodes would hand the player the
 * previous episode's cue list while the new subtitles were still in flight — and a
 * loop wrapping on a stale sentence is a wrong seek, not a cosmetic delay.
 *
 * An episode cut into segments plays one segment at a time, and a segment is an audio
 * file with its own subtitles. So "what is open" is an episode and a segment, the cues
 * belong to that pair, and switching segment parses again where opening the segment
 * that is already on screen parses nothing. Which segment to open is the caller's
 * decision (the page knows the reader's position); with none named the host opens the first.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchLibrary, openEpisodeById, openEpisodeFile } from '../../../shared/lib/api.ts'
import { mediaOf, mediaOfSegment } from '../../../shared/lib/media.ts'
import { fetchSubtitle, mergeBilingual, type Cue, type SubtitleTrack } from '../../../entities/cue/index.ts'
import type { EpisodeEntry, EpisodeMedia, EpisodeSegment, LibraryPayload } from '../../../shared/protocol.ts'
import { findSegment } from '../lib/segments.ts'
import { subtitleKey } from '../lib/subtitleKey.ts'

/** What the page needs to render, and the actions that change it. */
export interface LibraryState {
  readonly payload: LibraryPayload | null
  readonly loading: boolean
  readonly error: string | null
  /** The episode on screen, or `null` when nothing is open. */
  readonly episode: EpisodeEntry | null
  readonly media: EpisodeMedia | null
  /** The episode's segments in order; empty for an episode without any. */
  readonly segments: readonly EpisodeSegment[]
  /** The segment on screen, or `null` when the episode has none. */
  readonly segment: EpisodeSegment | null
  readonly cues: readonly Cue[]
  /**
   * The files the cues were read from, with the hash of the bytes. `chinese` is set only when the
   * Chinese came from a file of its own; a bilingual file is one `english` track.
   */
  readonly tracks: SubtitleTracks
  readonly cuesLoading: boolean
  /** True while the host is resolving a pick; the picker shows it as a wait. */
  readonly opening: boolean
  /** Why the last pick failed; the picker renders it instead of closing. */
  readonly openError: string | null
  /** Open an episode, and one of its segments when it has any; none named opens the first. */
  readonly openEpisode: (episodeId: string, segment?: string) => Promise<boolean>
  readonly openFile: (place: string, rel: string) => Promise<boolean>
  /** Re-read the library listing; used after the folder setting changes. */
  readonly reload: () => void
  /** Read the open episode's subtitles again, even though their names have not changed: after a timing edit. */
  readonly reloadCues: () => void
}

/** The subtitle files behind the cues on screen. */
export interface SubtitleTracks {
  readonly english: SubtitleTrack | null
  readonly chinese: SubtitleTrack | null
}

const NO_TRACKS: SubtitleTracks = { english: null, chinese: null }

/** Cues plus the episode and segment they were parsed from. */
interface LoadedCues {
  /** `cuesOwner` of what the cues were parsed from. */
  readonly owner: string | null
  readonly cues: readonly Cue[]
  readonly tracks: SubtitleTracks
}

const NOTHING_LOADED: LoadedCues = { owner: null, cues: [], tracks: NO_TRACKS }

/** What an episode without segments hands out for its segment list: one list, not a new one per render. */
const NO_SEGMENTS: readonly EpisodeSegment[] = []

/** Who a list of cues belongs to: the episode, and the segment when it has them. */
function cuesOwner(episode: EpisodeEntry, segment: EpisodeSegment | null): string {
  return JSON.stringify([episode.id, segment === null ? null : segment.id])
}

/** The media of what is open: the segment's files when there is a segment, the episode's otherwise. */
function mediaFor(episode: EpisodeEntry, segment: EpisodeSegment | null): EpisodeMedia | null {
  return segment === null ? mediaOf(episode) : mediaOfSegment(episode, segment)
}

/**
 * The list handed out while the episode's subtitles are still in flight.
 *
 * One module-level constant, not a fresh `[]`: the page resets the player in an
 * effect keyed on this array, and a new identity on every render is an infinite
 * render loop, not a cosmetic detail.
 */
const NO_CUES: readonly Cue[] = []

/**
 * The episode to open when the listing arrives.
 *
 * The reader's last choice wins, so a refresh lands where they left off. Otherwise
 * the scan's suggestion, and failing that the first folder and then the first loose
 * file — an empty library is the only case with nothing to open.
 */
function pickInitial(payload: LibraryPayload): EpisodeEntry | null {
  if (payload.currentEpisode !== null) return payload.currentEpisode
  const suggested = payload.episodes.find((entry) => entry.id === payload.current)
  return suggested ?? payload.episodes[0] ?? payload.files[0] ?? null
}

/** Load the library, then the open episode's subtitles. */
export function useLibrary(): LibraryState {
  const [payload, setPayload] = useState<LibraryPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [episode, setEpisode] = useState<EpisodeEntry | null>(null)
  const [media, setMedia] = useState<EpisodeMedia | null>(null)
  /** The segment the host opened, `null` for an episode without segments. */
  const [segmentId, setSegmentId] = useState<string | null>(null)
  const [opening, setOpening] = useState(false)
  const [openError, setOpenError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState<LoadedCues>(NOTHING_LOADED)
  const [cuesLoading, setCuesLoading] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)
  /** Bumped to read the same subtitle files again. */
  const [cuesToken, setCuesToken] = useState(0)
  const segments = episode?.segments ?? NO_SEGMENTS
  // An episode with segments always has one on screen: the one named, else the first.
  const segment = findSegment(segments, segmentId) ?? segments[0] ?? null
  const owner = episode === null ? null : cuesOwner(episode, segment)
  /** What the cues in `loaded` were parsed from, so opening the same episode again parses nothing. */
  const parsedKey = useRef<string | null>(null)
  /** The segment id as the reload below needs it: read inside a state updater, so not state itself. */
  const segmentRef = useRef<string | null>(null)
  useEffect(() => {
    segmentRef.current = segmentId
  }, [segmentId])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      const next = await fetchLibrary()
      if (cancelled) return
      setPayload(next)
      setError(next.ok ? null : next.reason)
      // A reload may point at a different folder, so the remembered episode is only
      // kept when the new listing still has it, and then as the listing now describes it:
      // files added since (a new scene, a translation) show up without opening it again.
      setEpisode((current) => {
        const listed =
          current === null ? null : ([...next.episodes, ...next.files].find((entry) => entry.id === current.id) ?? null)
        const chosen = listed ?? pickInitial(next)
        // The segment on screen stays when the new entry still has it; otherwise the first.
        const segments = chosen?.segments ?? NO_SEGMENTS
        const kept = listed === null ? null : findSegment(segments, segmentRef.current)
        const opened = kept ?? segments[0] ?? null
        setSegmentId(opened === null ? null : opened.id)
        setMedia(chosen === null ? null : mediaFor(chosen, opened))
        return chosen
      })
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [reloadToken])

  useEffect(() => {
    // Nothing to load without an episode or without subtitles. Both cases need no
    // state of their own: the derivation below answers an empty list for any episode
    // `loaded` does not name, so a stale list can never be handed out.
    if (episode === null || media === null) return
    const enUrl = media.subtitleEnUrl
    const zhUrl = media.subtitleZhUrl
    if (enUrl === null && zhUrl === null) return
    // The same subtitles again (the open episode opened a second time): keep the list that
    // is already handed out. A new array of equal sentences would reset the player, and a
    // position the reader resumed to would be put back on the first sentence.
    const key = subtitleKey(episode, media, segment)
    if (parsedKey.current === key) return
    // The files of a segment are its own; the entry's fields only mirror the first one.
    const track = segment ?? episode
    let cancelled = false
    void (async () => {
      setCuesLoading(true)
      try {
        const enName = track.subtitleEn ?? ''
        const zhName = track.subtitleZh ?? ''
        const english = enUrl === null ? null : await fetchSubtitle(enUrl, enName)
        const chinese = zhUrl === null || zhUrl === enUrl ? null : await fetchSubtitle(zhUrl, zhName)
        if (cancelled) return
        parsedKey.current = key
        setLoaded({
          owner,
          cues: mergeBilingual(english?.cues ?? [], chinese?.cues ?? []),
          tracks: {
            english: english === null ? null : { file: enName, hash: english.hash },
            chinese: chinese === null ? null : { file: zhName, hash: chinese.hash },
          },
        })
        setError(null)
      } catch (cause) {
        if (cancelled) return
        // `loaded` no longer holds what the key names, so the next open must parse again.
        parsedKey.current = null
        setLoaded({ owner, cues: [], tracks: NO_TRACKS })
        setError(String(cause))
      } finally {
        if (!cancelled) setCuesLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [episode, media, segment, owner, cuesToken])

  /** One place both picks end: the host answers with the entry and its URLs. */
  const applyOpen = useCallback((result: Awaited<ReturnType<typeof openEpisodeById>>): boolean => {
    if (!result.ok || result.episode === null) {
      setOpenError(result.reason ?? '打不开这一集')
      return false
    }
    setOpenError(null)
    setEpisode(result.episode)
    setSegmentId(result.segment)
    setMedia(result.media ?? mediaFor(result.episode, findSegment(result.episode.segments, result.segment)))
    return true
  }, [])

  const openEpisode = useCallback(
    async (episodeId: string, segment?: string): Promise<boolean> => {
      setOpening(true)
      const result = await openEpisodeById(episodeId, segment)
      setOpening(false)
      return applyOpen(result)
    },
    [applyOpen],
  )

  const openFile = useCallback(
    async (place: string, rel: string): Promise<boolean> => {
      setOpening(true)
      const result = await openEpisodeFile(place, rel)
      setOpening(false)
      return applyOpen(result)
    },
    [applyOpen],
  )

  const reload = useCallback(() => {
    // A reload asks for the files to be read again, even when their names have not changed.
    parsedKey.current = null
    setReloadToken((token) => token + 1)
  }, [])

  const reloadCues = useCallback(() => {
    parsedKey.current = null
    setCuesToken((token) => token + 1)
  }, [])

  // Only the cues that belong to the episode and segment on screen are ever handed out.
  const current = episode !== null && loaded.owner === owner
  const cues = current ? loaded.cues : NO_CUES
  const tracks = current ? loaded.tracks : NO_TRACKS

  return {
    payload,
    loading,
    error,
    episode,
    media,
    segments,
    segment,
    cues,
    tracks,
    cuesLoading,
    opening,
    openError,
    openEpisode,
    openFile,
    reload,
    reloadCues,
  }
}
