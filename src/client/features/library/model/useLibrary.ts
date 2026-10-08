/**
 * Loading one episode: the library listing, its subtitles, and nothing else.
 *
 * The cues are assembled here rather than in the page so the merge rule has one
 * home: an episode with one bilingual file parses it once, an episode with an
 * English and a Chinese track parses both and folds them together.
 *
 * The state keeps the episode id its cues belong to, and the returned list is
 * empty until they match. Without that, switching episodes would hand the player
 * the previous episode's cue list while the new subtitles were still in flight —
 * and a loop wrapping on a stale sentence is a wrong seek, not a cosmetic delay.
 */
import { useCallback, useEffect, useState } from 'react'
import { fetchLibrary } from '../../../shared/lib/api.ts'
import { fetchCues, mergeBilingual, type Cue } from '../../../entities/cue/index.ts'
import type { EpisodeEntry, LibraryPayload } from '../../../shared/protocol.ts'

/** What the page needs to render, and the one action that changes it. */
export interface LibraryState {
  readonly payload: LibraryPayload | null
  readonly loading: boolean
  readonly error: string | null
  readonly episode: EpisodeEntry | null
  readonly cues: readonly Cue[]
  readonly selectEpisode: (id: string) => void
}

/** Cues plus the episode they were parsed from. */
interface LoadedCues {
  readonly id: string | null
  readonly cues: readonly Cue[]
}

const NOTHING_LOADED: LoadedCues = { id: null, cues: [] }

/** Load the library, then the selected episode's subtitles. */
export function useLibrary(): LibraryState {
  const [payload, setPayload] = useState<LibraryPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [episodeId, setEpisodeId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState<LoadedCues>(NOTHING_LOADED)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      const next = await fetchLibrary()
      if (cancelled) return
      setPayload(next)
      setError(next.ok ? null : next.reason)
      setEpisodeId((current) => current ?? next.current)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const episode = payload?.episodes.find((entry) => entry.id === episodeId) ?? null

  useEffect(() => {
    // Without an episode there is nothing to load; the page renders its empty
    // state and resets the player on the episode change.
    if (episode === null) return
    let cancelled = false
    void (async () => {
      try {
        const english = episode.subtitleEn === null ? [] : await fetchCues(episode.id, episode.subtitleEn)
        const chinese =
          episode.subtitleZh === null || episode.subtitleZh === episode.subtitleEn
            ? []
            : await fetchCues(episode.id, episode.subtitleZh)
        if (cancelled) return
        setLoaded({ id: episode.id, cues: mergeBilingual(english, chinese) })
        setError(null)
      } catch (cause) {
        if (cancelled) return
        setLoaded({ id: episode.id, cues: [] })
        setError(String(cause))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [episode])

  const selectEpisode = useCallback((id: string) => setEpisodeId(id), [])

  // Only the cues that belong to the episode on screen are ever handed out.
  const cues = episode !== null && loaded.id === episode.id ? loaded.cues : []

  return { payload, loading, error, episode, cues, selectEpisode }
}
