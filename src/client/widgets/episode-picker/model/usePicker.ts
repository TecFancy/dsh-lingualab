/**
 * The picker's data: which places exist, and what is inside the one being browsed.
 *
 * Kept apart from the picker's markup because these are two different questions with
 * two different failure modes. Places come once per open and rarely change; a directory
 * listing changes under you (the reader is copying files in by hand) and is the one that
 * can be slow, so it is fetched per directory with a small debounce on the filter.
 *
 * The chosen place and relative path are the picker's own memory: closing and reopening
 * the layer returns to the directory you were in, not to the root. That memory is
 * deliberately not persisted — it is where you were looking, not what you opened.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchBrowse, fetchPlaces } from '../../../shared/lib/api.ts'
import type { BrowseEntry, PlaceEntry } from '../../../shared/protocol.ts'

/** How long the filter box waits before it asks the host again. */
const FILTER_DEBOUNCE_MS = 250

export interface PickerState {
  readonly places: readonly PlaceEntry[]
  readonly place: PlaceEntry | null
  readonly rel: string
  readonly entries: readonly BrowseEntry[]
  readonly summary: { dirs: number; audio: number; subtitles: number; other: number }
  readonly truncated: boolean
  readonly folderEpisode: { id: string; title: string } | null
  readonly loading: boolean
  readonly error: string | null
  readonly query: string
  readonly setQuery: (value: string) => void
  /** Open a place, or a directory inside the one already open. */
  readonly enter: (placeId: string, rel: string) => void
  /** One level up; a no-op at a place root. */
  readonly up: () => void
}

/** Places plus the listing of the directory currently being browsed. */
export function usePicker(open: boolean): PickerState {
  const [places, setPlaces] = useState<readonly PlaceEntry[]>([])
  const [placeId, setPlaceId] = useState<string | null>(null)
  const [rel, setRel] = useState('')
  const [query, setQuery] = useState('')
  const [entries, setEntries] = useState<readonly BrowseEntry[]>([])
  const [summary, setSummary] = useState({ dirs: 0, audio: 0, subtitles: 0, other: 0 })
  const [truncated, setTruncated] = useState(false)
  const [folderEpisode, setFolderEpisode] = useState<{ id: string; title: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadedPlaces = useRef(false)

  // Places: once per page, not once per open. A workspace list does not change while
  // somebody is picking an episode.
  useEffect(() => {
    if (!open || loadedPlaces.current) return
    loadedPlaces.current = true
    void (async () => {
      const payload = await fetchPlaces()
      setPlaces(payload.places)
      const first = payload.places.find((entry) => entry.readable) ?? payload.places[0] ?? null
      setPlaceId((current) => current ?? first?.id ?? null)
      setRel((current) => (current === '' && first?.suggested === true ? first.conventionRel ?? '' : current))
    })()
  }, [open])

  // The listing: per directory, debounced only while a filter is being typed.
  useEffect(() => {
    if (!open || placeId === null) return
    let cancelled = false
    const timer = setTimeout(
      () => {
        void (async () => {
          setLoading(true)
          const payload = await fetchBrowse(placeId, rel, query)
          if (cancelled) return
          setLoading(false)
          setError(payload.ok ? null : payload.reason)
          setEntries(payload.entries)
          setSummary(payload.summary)
          setTruncated(payload.page.truncated)
          setFolderEpisode(payload.folderEpisode)
        })()
      },
      query.trim().length > 0 ? FILTER_DEBOUNCE_MS : 0,
    )
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [open, placeId, rel, query])

  const enter = useCallback((nextPlaceId: string, nextRel: string) => {
    setPlaceId(nextPlaceId)
    setRel(nextRel)
    setQuery('')
  }, [])

  const up = useCallback(() => {
    setRel((current) => {
      const parts = current.split('/').filter((part) => part.length > 0)
      parts.pop()
      return parts.join('/')
    })
  }, [])

  const place = places.find((entry) => entry.id === placeId) ?? null

  return {
    places,
    place,
    rel,
    entries,
    summary,
    truncated,
    folderEpisode,
    loading,
    error,
    query,
    setQuery,
    enter,
    up,
  }
}
