/**
 * What there is to review across the library, read while the home is on screen.
 *
 * Read again each time the home comes back, because grading in an episode changes it; never
 * read while practising, where the open episode's own notes are the list that matters.
 */
import { useCallback, useEffect, useState } from 'react'
import { fetchReview } from '../../../shared/lib/api.ts'
import type { ReviewPayload } from '../../../shared/protocol.ts'

export interface ReviewList {
  /** The last answer, or `null` before the first one. */
  readonly payload: ReviewPayload | null
  /** Read it again now. */
  readonly reload: () => void
}

/** Read the list whenever `active` turns true. */
export function useReviewList(active: boolean): ReviewList {
  const [payload, setPayload] = useState<ReviewPayload | null>(null)

  const load = useCallback((): (() => void) => {
    let cancelled = false
    void (async () => {
      const answer = await fetchReview()
      if (!cancelled) setPayload(answer)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => (active ? load() : undefined), [active, load])

  const reload = useCallback((): void => {
    load()
  }, [load])

  return { payload, reload }
}
