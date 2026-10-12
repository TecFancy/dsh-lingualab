/**
 * The 「字幕」 popover: which subtitle file each slot plays, for the episode or segment on screen.
 *
 * Two slots, English and Chinese, each a `<select>` of 「按文件名」 (what the name rule picks, with the
 * file it picks named), 「不用」, and every subtitle file in the folder with what its first bytes say
 * (with or without Chinese). Picking the same bilingual file for both is the bilingual case. Nothing
 * is saved until 「保存」; the page then reads the subtitles again.
 */
import { useState } from 'react'
import { pickOf, pickValue, sameChoice, useSubtitleChoice } from '../../../features/subtitle-choice/index.ts'
import type { SubtitleChoice, SubtitleChoicePayload, SubtitleChoiceState, SubtitleSlot } from '../../../shared/protocol.ts'
import type { Translate } from '../../../context.ts'

/** What the 「字幕」 button needs from the page. */
export interface SubtitleControl {
  readonly episode: string
  /** The segment on screen, `null` for an episode without segments. */
  readonly segment: string | null
  /** The choice in force as the scan reports it; absent while both slots are automatic. */
  readonly state: SubtitleChoiceState | undefined
  /** A choice was saved: the page reads the subtitles again. */
  readonly onSaved: () => void
}

const SLOTS: readonly SubtitleSlot[] = ['en', 'zh']

const SLOT_KEYS: Readonly<Record<SubtitleSlot, string>> = { en: 'subtitleSlotEn', zh: 'subtitleSlotZh' }

const AUTOMATIC: SubtitleChoice = { en: { kind: 'auto' }, zh: { kind: 'auto' } }

export interface SubtitleMenuProps {
  readonly t: Translate
  readonly control: SubtitleControl
  /** Close the popover, after a save or when the reader cancels. */
  readonly onClose: () => void
}

/** The popover's body; mounted only while it is open, so the files are read when it opens. */
export function SubtitleMenu({ t, control, onClose }: SubtitleMenuProps) {
  const model = useSubtitleChoice(control.episode, control.segment, true)
  const payload = model.payload
  // An edit is made against one answer: a new answer (the first one, or the one a save brings back)
  // starts the draft again from the stored choice.
  const [edit, setEdit] = useState<{ readonly from: SubtitleChoicePayload; readonly choice: SubtitleChoice } | null>(null)
  const draft = payload?.ok === true ? (edit !== null && edit.from === payload ? edit.choice : payload.choice) : null
  const setDraft = (choice: SubtitleChoice): void => {
    if (payload !== null) setEdit({ from: payload, choice })
  }

  const missing = payload?.ok === true ? payload.missing : (control.state?.missing ?? [])
  const offered = payload?.candidates ?? []
  const dirty = draft !== null && payload !== null && !sameChoice(draft, payload.choice)

  const save = async (): Promise<void> => {
    if (draft === null) return
    if (await model.save(draft)) {
      control.onSaved()
      onClose()
    }
  }

  return (
    <div className="dsh-lingualab-menu is-subs" role="dialog" aria-label={t('subtitleChoose')}>
      <div className="dsh-lingualab-menu-title">{t('subtitleChoose')}</div>
      {missing.length > 0 ? <div className="dsh-lingualab-timing-note is-warn">{t('subtitleMissing')}</div> : null}
      {model.loading ? (
        <div className="dsh-lingualab-subs-note">{t('subtitleLoading')}</div>
      ) : null}
      {payload?.ok === true && draft !== null ? (
        <>
          {SLOTS.map((slot) => {
            const pick = draft[slot]
            const gone = pick.kind === 'file' && !offered.some((candidate) => candidate.file === pick.file)
            const auto = payload.auto[slot]
            return (
              <label className="dsh-lingualab-menu-row" key={slot}>
                <span>{t(SLOT_KEYS[slot])}</span>
                <select
                  className="dsh-lingualab-bar-btn dsh-lingualab-subs-select"
                  value={pickValue(pick)}
                  onChange={(event) => setDraft({ ...draft, [slot]: pickOf(event.target.value) })}
                  disabled={model.saving}
                >
                  <option value="auto">{auto === null ? t('subtitleAutoNone') : t('subtitleAuto', { file: auto })}</option>
                  <option value="none">{t('subtitleNone')}</option>
                  {offered.map((candidate) => (
                    <option key={candidate.file} value={pickValue({ kind: 'file', file: candidate.file })}>
                      {candidate.file} · {candidate.cjk ? t('subtitleHasCjk') : t('subtitleNoCjk')}
                    </option>
                  ))}
                  {gone && pick.kind === 'file' ? <option value={pickValue(pick)}>{t('subtitleGone', { file: pick.file })}</option> : null}
                </select>
              </label>
            )
          })}
          {offered.length === 0 ? <div className="dsh-lingualab-subs-note">{t('subtitleNoCandidates')}</div> : null}
          {control.segment === null ? null : <div className="dsh-lingualab-subs-note">{t('subtitleScopeSegment')}</div>}
          <div className="dsh-lingualab-actions is-end">
            {sameChoice(draft, AUTOMATIC) ? null : (
              <button type="button" className="dsh-lingualab-btn is-ghost is-small" onClick={() => setDraft(AUTOMATIC)} disabled={model.saving}>
                {t('subtitleReset')}
              </button>
            )}
            <button type="button" className="dsh-lingualab-btn is-primary is-small" onClick={() => void save()} disabled={!dirty || model.saving}>
              {model.saving ? t('subtitleSaving') : t('subtitleSave')}
            </button>
          </div>
        </>
      ) : null}
      {model.error === null ? null : <div className="dsh-lingualab-error">{model.error}</div>}
    </div>
  )
}
