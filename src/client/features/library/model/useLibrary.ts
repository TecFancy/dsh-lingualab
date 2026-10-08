/**
 * Loading one episode: the library listing, its subtitles, and the store reset
 * that has to happen between episodes.
 *
 * The cues are assembled here rather than in the page so the merge rule has one
 * home: an episode with one bilingual file parses it once, an episode with an
 * English and a Chinese track parses both and folds them together.
 */
import { useCallback, useEffect, useState } from 'react'
import { fetchLibrary } from '../../../shared/lib/api.ts'
import { fetchCues, mergeBilingual, type Cue } from '../../../entities/cue/index.ts'
import type { EpisodeEntry, LibraryPayload } from '../../../shared/protocol.ts'

/** What the page needs to render, and the two actions that change it. */
export interface LibraryState {
  readonly payload: LibraryPayload | null
  readonly loading: boolean
  readonly error: string | null
  readonly episode: EpisodeEntry | null
  readonly cues: readonly Cue[]
  readonly selectEpisode: (id: string) => void
}

/** Load the library, then the selected episode's subtitles. */
export function useLibrary(): LibraryState {
  const [payload, setPayload] = useState<LibraryPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [episodeId, setEpisodeId] = useState<string | null>(null)
  const [cues, setCues] = useState<readonly Cue[]>([])

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
    // A null episode renders the empty state, so there is nothing to clear: the
    // store's stale cues are not reachable while no episode is selected.
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
        setCues(mergeBilingual(english, chinese))
        setError(null)
      } catch (cause) {
        if (cancelled) return
        setCues([])
        setError(String(cause))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [episode])

  const selectEpisode = useCallback((id: string) => setEpisodeId(id), [])

  return { payload, loading, error, episode, cues, selectEpisode }
}
