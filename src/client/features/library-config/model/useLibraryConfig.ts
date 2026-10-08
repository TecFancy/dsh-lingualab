/**
 * The folder setting, as the page sees it.
 *
 * Two pieces of state matter and they are not the same: what the host says is in
 * effect, and what the reader has typed but not saved. Keeping the draft separate
 * means a failed save leaves the typed path on screen to be corrected instead of
 * snapping back to the old one.
 */
import { useCallback, useEffect, useState } from 'react'
import { fetchConfig, saveConfig } from '../../../shared/lib/api.ts'
import type { LibraryConfigPayload } from '../../../shared/protocol.ts'

export interface LibraryConfigState {
  readonly payload: LibraryConfigPayload | null
  readonly draft: string
  readonly saving: boolean
  readonly error: string | null
  readonly setDraft: (value: string) => void
  /** Save the draft (or one of the offered folders) and report whether it landed. */
  readonly save: (value?: string) => Promise<boolean>
}

/** Load the folder setting and let the reader change it. */
export function useLibraryConfig(): LibraryConfigState {
  const [payload, setPayload] = useState<LibraryConfigPayload | null>(null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const next = await fetchConfig()
      if (cancelled || next === null) return
      setPayload(next)
      setDraft(next.configured.length > 0 ? next.configured : next.root)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const save = useCallback(
    async (value?: string): Promise<boolean> => {
      const target = (value ?? draft).trim()
      setSaving(true)
      setError(null)
      const result = await saveConfig(target)
      setSaving(false)
      setPayload(result)
      setError(result.ok ? null : result.reason)
      if (result.ok) setDraft(target)
      return result.ok
    },
    [draft],
  )

  return { payload, draft, saving, error, setDraft, save }
}
