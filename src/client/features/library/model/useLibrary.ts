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
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchLibrary, openEpisodeById, openEpisodeFile } from '../../../shared/lib/api.ts'
import { mediaOf } from '../../../shared/lib/media.ts'
import { fetchCues, mergeBilingual, type Cue } from '../../../entities/cue/index.ts'
import type { EpisodeEntry, EpisodeMedia, LibraryPayload } from '../../../shared/protocol.ts'
import { subtitleKey } from '../lib/subtitleKey.ts'

/** What the page needs to render, and the actions that change it. */
export interface LibraryState {
  readonly payload: LibraryPayload | null
  readonly loading: boolean
  readonly error: string | null
  /** The episode on screen, or `null` when nothing is open. */
  readonly episode: EpisodeEntry | null
  readonly media: EpisodeMedia | null
  readonly cues: readonly Cue[]
  readonly cuesLoading: boolean
  /** True while the host is resolving a pick; the picker shows it as a wait. */
  readonly opening: boolean
  /** Why the last pick failed; the picker renders it instead of closing. */
  readonly openError: string | null
  readonly openEpisode: (episodeId: string) => Promise<boolean>
  readonly openFile: (place: string, rel: string) => Promise<boolean>
  /** Re-read the library listing; used after the folder setting changes. */
  readonly reload: () => void
}

/** Cues plus the episode they were parsed from. */
interface LoadedCues {
  readonly id: string | null
  readonly cues: readonly Cue[]
}

const NOTHING_LOADED: LoadedCues = { id: null, cues: [] }

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
  const [opening, setOpening] = useState(false)
  const [openError, setOpenError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState<LoadedCues>(NOTHING_LOADED)
  const [cuesLoading, setCuesLoading] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)
  /** What the cues in `loaded` were parsed from, so opening the same episode again parses nothing. */
  const parsedKey = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      const next = await fetchLibrary()
      if (cancelled) return
      setPayload(next)
      setError(next.ok ? null : next.reason)
      // A reload may point at a different folder, so the remembered episode is only
      // kept when the new listing still has it.
      setEpisode((current) => {
        const stillThere =
          current !== null && [...next.episodes, ...next.files].some((entry) => entry.id === current.id)
        const chosen = stillThere ? current : pickInitial(next)
        setMedia(chosen === null ? null : mediaOf(chosen))
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
    const key = subtitleKey(episode, media)
    if (parsedKey.current === key) return
    let cancelled = false
    void (async () => {
      setCuesLoading(true)
      try {
        const english = enUrl === null ? [] : await fetchCues(enUrl, episode.subtitleEn ?? '')
        const chinese =
          zhUrl === null || zhUrl === enUrl ? [] : await fetchCues(zhUrl, episode.subtitleZh ?? '')
        if (cancelled) return
        parsedKey.current = key
        setLoaded({ id: episode.id, cues: mergeBilingual(english, chinese) })
        setError(null)
      } catch (cause) {
        if (cancelled) return
        // `loaded` no longer holds what the key names, so the next open must parse again.
        parsedKey.current = null
        setLoaded({ id: episode.id, cues: [] })
        setError(String(cause))
      } finally {
        if (!cancelled) setCuesLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [episode, media])

  /** One place both picks end: the host answers with the entry and its URLs. */
  const applyOpen = useCallback((result: Awaited<ReturnType<typeof openEpisodeById>>): boolean => {
    if (!result.ok || result.episode === null) {
      setOpenError(result.reason ?? '打不开这一集')
      return false
    }
    setOpenError(null)
    setEpisode(result.episode)
    setMedia(result.media ?? mediaOf(result.episode))
    return true
  }, [])

  const openEpisode = useCallback(
    async (episodeId: string): Promise<boolean> => {
      setOpening(true)
      const result = await openEpisodeById(episodeId)
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

  // Only the cues that belong to the episode on screen are ever handed out.
  const cues = episode !== null && loaded.id === episode.id ? loaded.cues : NO_CUES

  return {
    payload,
    loading,
    error,
    episode,
    media,
    cues,
    cuesLoading,
    opening,
    openError,
    openEpisode,
    openFile,
    reload,
  }
}
