/**
 * The subtitle choice of the episode (or segment) on screen, while the popover that edits it is open.
 *
 * Read when the popover opens rather than with the episode: the answer reads the first bytes of every
 * subtitle file in the folder for its "has Chinese" mark, which is work nobody needs until they ask.
 * Saving answers with the choice now in force; what the page does next (open the episode again so the
 * new files are read) is the page's business, so the hook only reports that the save went through.
 *
 * The answer is kept together with the episode and segment it is for, and handed out only while they
 * are still the ones asked about, so switching segment never shows the previous segment's choice.
 */
import { useCallback, useEffect, useState } from 'react'
import { fetchSubtitleChoice, saveSubtitleChoice } from '../../../shared/lib/api.ts'
import type { SubtitleChoice, SubtitleChoicePayload } from '../../../shared/protocol.ts'

export interface SubtitleChoiceModel {
  /** The answer for the episode and segment asked about, or `null` while it is on its way. */
  readonly payload: SubtitleChoicePayload | null
  readonly loading: boolean
  readonly saving: boolean
  /** Why the last read or save failed. */
  readonly error: string | null
  /** Save a choice; true when the host took it. */
  readonly save: (choice: SubtitleChoice) => Promise<boolean>
}

/** One answer, and what it answers for. */
interface Loaded {
  readonly key: string
  readonly payload: SubtitleChoicePayload
}

/**
 * @param episode - the open episode's id, `null` when nothing is open.
 * @param segment - the open segment's id, `null` for an episode without segments.
 * @param active - whether the popover is open; nothing is read while it is not.
 */
export function useSubtitleChoice(episode: string | null, segment: string | null, active: boolean): SubtitleChoiceModel {
  const key = episode === null ? null : JSON.stringify([episode, segment])
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<{ readonly key: string; readonly reason: string | null } | null>(null)

  useEffect(() => {
    if (!active || episode === null || key === null) return
    let cancelled = false
    void fetchSubtitleChoice(episode, segment).then((next) => {
      if (!cancelled) setLoaded({ key, payload: next })
    })
    return () => {
      cancelled = true
    }
  }, [active, episode, segment, key])

  const save = useCallback(
    async (choice: SubtitleChoice): Promise<boolean> => {
      if (episode === null || key === null) return false
      setSaving(true)
      const next = await saveSubtitleChoice(episode, segment, choice)
      setSaving(false)
      if (!next.ok) {
        setSaveError({ key, reason: next.reason })
        return false
      }
      setSaveError(null)
      setLoaded({ key, payload: next })
      return true
    },
    [episode, segment, key],
  )

  const payload = loaded !== null && loaded.key === key ? loaded.payload : null
  const failed = saveError !== null && saveError.key === key ? saveError.reason : null
  return {
    payload,
    loading: active && key !== null && payload === null,
    saving,
    error: failed ?? (payload !== null && !payload.ok ? payload.reason : null),
    save,
  }
}
