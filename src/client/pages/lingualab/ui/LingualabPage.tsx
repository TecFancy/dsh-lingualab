/**
 * The page body: one episode, one audio element, and the three cards around it.
 *
 * Keyboard handling lives here rather than on `window`. The earlier standalone app
 * bound its shortcuts globally and therefore owned the space bar, the arrow keys
 * and the bracket keys wherever it was open — inside a panel that shares a page
 * with a conversation, that is a hostile neighbour. The handler sits on the page
 * container, which is focusable, so the keys work while the panel has focus and
 * stop at its edge.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react'
import { DEFAULT_SUBTITLE_ZH_MODE, orderCueLines, type SubtitleZhMode } from '../../../entities/cue/index.ts'
import { useLibrary } from '../../../features/library/index.ts'
import { useNotes } from '../../../features/notes/index.ts'
import { useAudioBinding, useMediaPlayer } from '../../../features/media-player/index.ts'
import { mediaUrl } from '../../../shared/lib/api.ts'
import { formatBytes } from '../../../shared/lib/format.ts'
import { STYLES } from '../../../shared/lib/styles.ts'
import { ControlBar } from '../../../widgets/control-bar/index.ts'
import { NotesPanel } from '../../../widgets/notes-panel/index.ts'
import { StepTracker } from '../../../widgets/step-tracker/index.ts'
import { SubtitlePanel } from '../../../widgets/subtitle-panel/index.ts'
import type { PanelProps, Translate } from '../../../context.ts'
import type { NotePhrase } from '../../../shared/protocol.ts'

/** How far the arrow keys move the position. */
const NUDGE_SECONDS = 3

export interface LingualabPageProps extends PanelProps {
  readonly t: Translate
}

/** Whether a keystroke belongs to a field the reader is typing in. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  return tag === 'input' || tag === 'select' || tag === 'textarea' || target.isContentEditable
}

/** The panel's centre-column page. */
export function LingualabPage({ back, t }: LingualabPageProps) {
  const { payload, loading, error, episode, cues, selectEpisode } = useLibrary()
  const notes = useNotes(episode?.id ?? null)
  const [zhMode, setZhMode] = useState<SubtitleZhMode>(DEFAULT_SUBTITLE_ZH_MODE)
  const activeIndex = useMediaPlayer((state) => state.activeIndex)
  const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null)

  const audioSrc =
    episode !== null && episode.audio !== null ? mediaUrl(episode.id, episode.audio) : null
  const audioRef = useAudioBinding(audioSrc)

  // Feature-to-feature wiring is the page's job: the library feature may not
  // reach into the player, so loading a new cue list resets the player here.
  const reset = useMediaPlayer((state) => state.reset)
  useEffect(() => {
    reset(cues)
  }, [cues, reset])

  // Focus the page once so the shortcuts below are live without a click, and
  // without stealing the conversation's focus afterwards.
  useEffect(() => {
    if (loading) return
    containerRef.current?.focus()
  }, [loading])

  const phraseFromCurrentCue = useCallback((): NotePhrase | null => {
    const state = useMediaPlayer.getState()
    const cue = state.cues[state.activeIndex]
    if (cue === undefined) return null
    const lines = orderCueLines(cue.text)
    const english = lines.find((line) => !line.secondary)?.text ?? cue.text
    const chinese = lines.find((line) => line.secondary)?.text ?? ''
    return { at: cue.start, text: english, zh: chinese, note: '', tags: [], done: false }
  }, [])

  const onKeyDown = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (isTypingTarget(event.target)) return
    const store = useMediaPlayer.getState()
    switch (event.key) {
      case ' ':
        event.preventDefault()
        store.toggle()
        return
      case 'ArrowLeft':
        event.preventDefault()
        store.seek(Math.max(0, store.currentTime - NUDGE_SECONDS))
        return
      case 'ArrowRight':
        event.preventDefault()
        store.seek(store.currentTime + NUDGE_SECONDS)
        return
      case 'ArrowUp':
        event.preventDefault()
        store.stepCue(-1)
        return
      case 'ArrowDown':
        event.preventDefault()
        store.stepCue(1)
        return
      case 'l':
      case 'L':
        store.loopSentence()
        return
      case '[':
        store.setPoint('a')
        return
      case ']':
        store.setPoint('b')
        return
      case 'r':
      case 'R':
        store.clearAB()
        return
      case 's':
      case 'S':
        store.cycleSpeed(1)
        return
      default:
    }
  }, [])

  const episodeList = payload?.episodes ?? []
  const hasAudio = episode?.audio != null

  return (
    <div className="dsh-lingualab-page" ref={containerRef} tabIndex={-1} onKeyDown={onKeyDown}>
      <style>{STYLES}</style>

      <div className="dsh-lingualab-head">
        <h1>{t('title')}</h1>
        <span className="dsh-lingualab-sub">{t('subtitle')}</span>
        {back !== undefined ? (
          <button type="button" className="dsh-lingualab-back" onClick={back}>
            {t('back')}
          </button>
        ) : null}
      </div>

      {episodeList.length > 0 ? (
        <div className="dsh-lingualab-head">
          <span className="dsh-lingualab-sub">{t('episode')}</span>
          <select
            className="dsh-lingualab-select"
            value={episode?.id ?? ''}
            onChange={(event) => selectEpisode(event.target.value)}
          >
            {episodeList.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.title}
                {entry.audioBytes === null ? '' : ` · ${formatBytes(entry.audioBytes)}`}
              </option>
            ))}
          </select>
          {episode !== null && episode.audio !== null ? (
            <span className="dsh-lingualab-sub">
              {episode.audio}
              {episode.subtitleEn === null ? '' : ` · ${episode.subtitleEn}`}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* The element itself is invisible: the control bar drives it from the store. */}
      <audio ref={audioRef} preload="metadata" style={{ display: 'none' }} />

      {loading ? <div className="dsh-lingualab-empty">…</div> : null}

      {!loading && payload !== null && !payload.ok && episodeList.length === 0 ? (
        <div className="dsh-lingualab-card">
          <h2>{t('noLibrary')}</h2>
          <div className="dsh-lingualab-hint">{t('noLibraryHint')}</div>
          <div className="dsh-lingualab-hint">{payload.root}</div>
        </div>
      ) : null}

      {!loading && payload?.ok === true && episodeList.length === 0 ? (
        <div className="dsh-lingualab-empty">{t('noEpisodes')}</div>
      ) : null}

      {!loading && error !== null && episodeList.length > 0 ? (
        <div className="dsh-lingualab-warn">
          {t('loadFailed')}: {error}
        </div>
      ) : null}

      {episode !== null ? (
        <div className="dsh-lingualab-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
            <ControlBar t={t} zhMode={zhMode} onZhMode={setZhMode} disabled={!hasAudio} />
            {!hasAudio ? <div className="dsh-lingualab-warn">{t('noAudio')}</div> : null}
            <div className="dsh-lingualab-card">
              <h2>{t('subtitles')}</h2>
              <SubtitlePanel t={t} cues={cues} activeIndex={activeIndex} zhMode={zhMode} />
              <div className="dsh-lingualab-hint" style={{ marginTop: 8 }}>
                {t('shortcutHint')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
            <NotesPanel t={t} notes={notes} phraseFromCurrentCue={phraseFromCurrentCue} />
            <StepTracker key={episode.id} t={t} episode={episode.id} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
