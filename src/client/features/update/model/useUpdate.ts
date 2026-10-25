/**
 * The release check, as the page sees it.
 *
 * One check when the page mounts, another only when the reader asks. `checking` is derived from which
 * attempt has answered rather than stored and flipped inside the effect, so the effect only talks to
 * the host and never sets state in its own body.
 *
 * A run that lands after unmounting is dropped: a slow remote must not write into a page that no
 * longer shows it.
 */
import { useCallback, useEffect, useState } from 'react'
import { fetchUpdate } from '../../../shared/lib/api.ts'
import type { UpdatePayload } from '../../../shared/protocol.ts'
import { updateStatus, type UpdateStatus } from '../lib/update-state.ts'

export interface UpdateState {
  readonly payload: UpdatePayload | null
  readonly checking: boolean
  readonly status: UpdateStatus
  readonly refresh: () => void
}

/** No attempt has answered yet. */
const NOTHING_ANSWERED = -1

export function useUpdate(): UpdateState {
  const [payload, setPayload] = useState<UpdatePayload | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [answered, setAnswered] = useState(NOTHING_ANSWERED)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const next = await fetchUpdate(attempt > 0)
      if (cancelled) return
      setPayload(next)
      setAnswered(attempt)
    })()
    return () => {
      cancelled = true
    }
  }, [attempt])

  const checking = answered !== attempt
  const refresh = useCallback(() => setAttempt((value) => value + 1), [])
  return { payload, checking, status: updateStatus(payload, checking), refresh }
}
