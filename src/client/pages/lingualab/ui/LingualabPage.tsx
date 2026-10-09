/**
 * The page: a home to choose from, and a practice view to listen in.
 *
 * Two views, one rule for moving between them. The page opens on the **home**: what you
 * can practise, the episode to continue, and where to drop new files. Opening an episode
 * switches to the **practice** view, whose back button returns to the home rather than
 * leaving the panel, so "pick another episode" is one click and not a layer to open.
 *
 * The practice view keeps the shape the last redesign settled on: a top bar, a stage that
 * pins the sentence being worked on above the transport, the subtitle list as the only
 * scroller, and a short line of reminders. What changed is everything around it — the
 * episode picker became the home, keeping a sentence became a star on the transport, and
 * the notes layer became a drawer of what you kept.
 *
 * Keyboard handling lives here rather than on `window`. The earlier standalone app bound
 * its shortcuts globally and therefore owned the space bar, the arrow keys and the
 * bracket keys wherever it was open; inside a panel that shares a page with a
 * conversation, that is a hostile neighbour. The handler sits on the page container,
 * which is focusable, so the keys work while the panel has focus and stop at its edge.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react'
import {
  DEFAULT_SUBTITLE_ZH_MODE,
  findActiveCue,
  orderCueLines,
  type Cue,
  type SubtitleZhMode,
} from '../../../entities/cue/index.ts'
import { useImport } from '../../../features/import-media/index.ts'
import { useLibraryConfig } from '../../../features/library-config/index.ts'
import { useLibrary } from '../../../features/library/index.ts'
import { useAudioBinding, useMediaPlayer } from '../../../features/media-player/index.ts'
import { useNotes } from '../../../features/notes/index.ts'
import { readAllProgress, writeProgress, type Progress } from '../../../features/resume/index.ts'
import { STYLES } from '../../../shared/lib/styles.ts'
import { BackIcon, NoteIcon } from '../../../shared/ui/icons.tsx'
import { formatClock } from '../../../shared/lib/format.ts'
import { ControlBar, nextZhMode } from '../../../widgets/control-bar/index.ts'
import { EpisodePicker } from '../../../widgets/episode-picker/index.ts'
import { LibraryHome } from '../../../widgets/library-home/index.ts'
import { MediaFolderPanel } from '../../../widgets/media-folder/index.ts'
import { NotesPanel } from '../../../widgets/notes-panel/index.ts'
import { StepTracker } from '../../../widgets/step-tracker/index.ts'
import { SubtitlePanel } from '../../../widgets/subtitle-panel/index.ts'
import type { PanelProps, Translate } from '../../../context.ts'
import type { NotePhrase } from '../../../shared/protocol.ts'

/** Which view the page shows. */
type View = 'home' | 'practice'

/** Which layer is over the page. Only one at a time; the steps popover is not a layer. */
type Layer = 'none' | 'browse' | 'notes' | 'folder'

export interface LingualabPageProps extends PanelProps {
  readonly t: Translate
}

/** How often the listening position is written down while an episode plays. */
const BOOKMARK_MS = 5000

/** Whether a keystroke belongs to a field the reader is typing in. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  return tag === 'input' || tag === 'select' || tag === 'textarea' || target.isContentEditable
}

/** The English and Chinese halves of one cue, split the way the notes file wants them. */
function splitCue(cue: Cue): { english: string; chinese: string } {
  const lines = orderCueLines(cue.text)
  return {
    english: lines.find((line) => !line.secondary)?.text ?? cue.text,
    chinese: lines.find((line) => line.secondary)?.text ?? '',
  }
}

/** The panel's centre-column page. */
export function LingualabPage({ back, t }: LingualabPageProps) {
  const library = useLibrary()
  const folder = useLibraryConfig()
  const notes = useNotes(library.episode?.id ?? null)
  const importer = useImport(library.reload)
  const [view, setView] = useState<View>('home')
  const [zhMode, setZhMode] = useState<SubtitleZhMode>(DEFAULT_SUBTITLE_ZH_MODE)
  const [layer, setLayer] = useState<Layer>('none')
  const [stepsOpen, setStepsOpen] = useState(false)
  const [selection, setSelection] = useState<number | null>(null)
  const [focused, setFocused] = useState(false)
  const [progress, setProgress] = useState<Readonly<Record<string, Progress>>>(() => readAllProgress())
  const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null)

  const activeIndex = useMediaPlayer((state) => state.activeIndex)
  const cues = library.cues
  const audioRef = useAudioBinding(library.media?.audioUrl ?? null)

  // Feature-to-feature wiring is the page's job: the library feature may not reach into
  // the player, so loading a new cue list resets the player here.
  const reset = useMediaPlayer((state) => state.reset)
  useEffect(() => {
    reset(cues)
  }, [cues, reset])

  // Focus the page once so the shortcuts below are live without a click, and without
  // stealing the conversation's focus afterwards.
  useEffect(() => {
    if (library.loading) return
    containerRef.current?.focus({ preventScroll: true })
  }, [library.loading, view])

  const episode = library.episode
  const episodeId = episode?.id ?? null

  /**
   * Write the listening position down while an episode is on screen.
   *
   * On an interval and on the way out, not on every `timeupdate`: that event fires
   * several times a second, and a `localStorage` write per tick is wasted work for a
   * bookmark nobody reads until the next visit.
   */
  const bookmark = useCallback(() => {
    if (episodeId === null) return
    const state = useMediaPlayer.getState()
    writeProgress(episodeId, state.currentTime, state.duration)
  }, [episodeId])

  useEffect(() => {
    if (view !== 'practice') return
    const timer = setInterval(bookmark, BOOKMARK_MS)
    return () => {
      clearInterval(timer)
      bookmark()
    }
  }, [view, bookmark])

  /** Go home: save the position first, then refresh what the home shows about it. */
  const goHome = useCallback(() => {
    bookmark()
    useMediaPlayer.getState().setPlaying(false)
    setProgress(readAllProgress())
    setLayer('none')
    setStepsOpen(false)
    setView('home')
  }, [bookmark])

  /** The sentence a new note would carry: whatever is playing. */
  const quote: NotePhrase | null = useMemo(() => {
    const cue = cues[activeIndex]
    if (cue === undefined) return null
    const { english, chinese } = splitCue(cue)
    return { at: cue.start, text: english, zh: chinese, note: '', tags: [], done: false }
  }, [cues, activeIndex])

  /** Cue indexes that already carry a note, so the list can mark them. */
  const notedIndexes = useMemo(() => {
    const marked = new Set<number>()
    for (const phrase of notes.phrases) {
      const index = findActiveCue(cues, phrase.at)
      if (index >= 0) marked.add(index)
    }
    return marked
  }, [notes.phrases, cues])

  /** Keep or un-keep one sentence; the same star on the row and on the transport. */
  const keep = useCallback(
    (index?: number): void => {
      const target = cues[index ?? activeIndex]
      if (target === undefined) return
      const { english, chinese } = splitCue(target)
      notes.toggle({ at: target.start, text: english, zh: chinese, note: '', tags: [], done: false })
    },
    [cues, activeIndex, notes],
  )

  /** Open an episode by id and move to the practice view when the host agrees. */
  const openEpisode = useCallback(
    (id: string): void => {
      void (async () => {
        if (!(await library.openEpisode(id))) return
        setSelection(null)
        setLayer('none')
        setView('practice')
      })()
    },
    [library],
  )

  /**
   * Take dropped files into the library.
   *
   * Opening is left to the report's button: the reader dropped files to add them to a
   * library, which is not the same as asking to start listening to the first one.
   */
  const importFiles = useCallback(
    (files: readonly File[]): void => {
      void importer.start(files)
    },
    [importer],
  )

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (isTypingTarget(event.target)) return
      // The home has no transport, so no shortcut there would mean anything.
      if (view !== 'practice') return
      const store = useMediaPlayer.getState
      // Handled keys stop here. The conversation lives in the same document, and a
      // space bar that scrolls or submits behind the panel is a stolen keystroke.
      const handled = (): void => {
        event.preventDefault()
        event.stopPropagation()
      }
      if (event.key === 'Escape') {
        handled()
        if (layer !== 'none') setLayer('none')
        else if (stepsOpen) setStepsOpen(false)
        else store().clearAB()
        return
      }
      // A layer owns the keyboard while it is open: its own fields and buttons are the
      // only things a keystroke should reach.
      if (layer !== 'none' && layer !== 'notes') return

      const current = selection ?? store().activeIndex
      switch (event.key) {
        case ' ':
          handled()
          store().toggle()
          return
        case 'ArrowLeft':
          handled()
          setSelection(null)
          store().stepCue(-1)
          return
        case 'ArrowRight':
          handled()
          setSelection(null)
          store().stepCue(1)
          return
        case 'ArrowUp':
          handled()
          setSelection(Math.max(0, current - 1))
          return
        case 'ArrowDown':
          handled()
          setSelection(Math.min(Math.max(0, cues.length - 1), current + 1))
          return
        case 'Enter': {
          handled()
          const cue = cues[current]
          if (cue !== undefined) {
            setSelection(null)
            store().seek(cue.start)
            store().setPlaying(true)
          }
          return
        }
        case 'l':
        case 'L':
          handled()
          if (store().loopMode === 'sentence') store().setLoopMode('none')
          else store().loopSentence(current)
          return
        case 's':
        case 'S':
        case 'n':
        case 'N':
          handled()
          keep(selection ?? undefined)
          return
        case 'c':
        case 'C':
          handled()
          setZhMode(nextZhMode(zhMode))
          return
        case 'a':
        case 'A':
          handled()
          if (store().pointA === null) store().setPoint('a')
          else store().clearAB()
          return
        case 'b':
        case 'B':
          handled()
          store().setPoint('b')
          return
        case '[':
          handled()
          store().cycleSpeed(-1)
          return
        case ']':
          handled()
          store().cycleSpeed(1)
          return
        default:
      }
    },
    [cues, keep, layer, selection, stepsOpen, view, zhMode],
  )

  const hasAudio = library.media !== null
  // The selection is an index into the cue list, and the list changes under it when
  // the episode does; clamping here is cheaper than resetting it from an effect.
  const selectedIndex =
    selection === null ? activeIndex : Math.min(Math.max(0, selection), Math.max(0, cues.length - 1))
  const stageCue = cues[activeIndex]
  const stageLines = stageCue === undefined ? null : splitCue(stageCue)
  const keptNow = stageCue !== undefined && notes.has(stageCue.start)

  return (
    <div
      className="dsh-lingualab-page"
      ref={containerRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
      }}
      onMouseDown={(event) => {
        // Clicking the page's own chrome puts the keyboard back on the container; a
        // click into a field leaves the field alone.
        if (!isTypingTarget(event.target)) containerRef.current?.focus({ preventScroll: true })
      }}
    >
      <style>{STYLES}</style>
      <audio ref={audioRef} preload="metadata" style={{ display: 'none' }} />

      {view === 'home' ? (
        <>
          <div className="dsh-lingualab-top">
            {back !== undefined ? (
              <button type="button" className="dsh-lingualab-chip" onClick={back}>
                {t('back')}
              </button>
            ) : null}
            <span className="dsh-lingualab-top-title">{t('appTitle')}</span>
            <span className="dsh-lingualab-spacer" />
          </div>
          <LibraryHome
            t={t}
            library={library.payload}
            loading={library.loading}
            importer={importer}
            progress={progress}
            currentId={library.payload?.currentEpisode?.id ?? episodeId}
            opening={library.opening}
            openError={library.openError}
            onOpen={openEpisode}
            onFiles={importFiles}
            onBrowse={() => setLayer('browse')}
            onFolder={() => setLayer('folder')}
          />
        </>
      ) : (
        <>
          <div className="dsh-lingualab-top">
            <button type="button" className="dsh-lingualab-chip" onClick={goHome} title={t('backToList')}>
              <BackIcon size={14} /> {t('backToList')}
            </button>
            <span className="dsh-lingualab-top-title" title={episode?.title ?? ''}>
              {episode?.title ?? t('openEpisode')}
            </span>
            <span className="dsh-lingualab-spacer" />
            <button
              type="button"
              className={`dsh-lingualab-chip${layer === 'notes' ? ' is-on' : ''}`}
              onClick={() => setLayer(layer === 'notes' ? 'none' : 'notes')}
            >
              <NoteIcon size={13} /> {t('notesChip')} {notes.phrases.length > 0 ? notes.phrases.length : ''}
            </button>
            {episode !== null ? (
              <StepTracker
                key={episode.id}
                t={t}
                episode={episode.id}
                open={stepsOpen}
                onToggle={() => setStepsOpen(!stepsOpen)}
              />
            ) : null}
          </div>

          <div className="dsh-lingualab-stage">
            <div className="dsh-lingualab-stage-meta">
              <span>
                {stageCue === undefined
                  ? '--:--'
                  : `${formatClock(stageCue.start)} – ${formatClock(stageCue.end)}`}
              </span>
              {library.cuesLoading ? <span>{t('stageLoading')}…</span> : null}
            </div>
            <div className="dsh-lingualab-stage-en">{stageLines?.english ?? t('noSubtitles')}</div>
            {zhMode !== 'hidden' && stageLines !== null && stageLines.chinese.length > 0 ? (
              <div className="dsh-lingualab-stage-zh">{stageLines.chinese}</div>
            ) : null}
            <ControlBar
              t={t}
              zhMode={zhMode}
              onZhMode={setZhMode}
              kept={keptNow}
              onToggleKeep={() => keep()}
              disabled={!hasAudio || cues.length === 0}
            />
            {!hasAudio ? <div className="dsh-lingualab-warn">{t('noAudio')}</div> : null}
            {library.error !== null && cues.length === 0 && hasAudio ? (
              <div className="dsh-lingualab-error">
                {t('subtitleFailed')}{' '}
                <button type="button" className="dsh-lingualab-btn" onClick={library.reload}>
                  {t('retry')}
                </button>
              </div>
            ) : null}
          </div>

          <div className="dsh-lingualab-mid">
            <SubtitlePanel
              t={t}
              cues={cues}
              activeIndex={activeIndex}
              selectedIndex={selectedIndex}
              zhMode={zhMode}
              notedIndexes={notedIndexes}
              onSelect={setSelection}
              onPlay={(index) => {
                const cue = cues[index]
                if (cue === undefined) return
                setSelection(null)
                useMediaPlayer.getState().seek(cue.start)
                useMediaPlayer.getState().setPlaying(true)
              }}
              onKeep={(index) => keep(index)}
            />
            {layer === 'notes' ? <NotesPanel t={t} notes={notes} onClose={() => setLayer('none')} /> : null}
          </div>

          <div className="dsh-lingualab-foot">
            <span>{t('shortcutHint')}</span>
            <span className="dsh-lingualab-spacer" />
            {quote === null ? null : <span>{t('keepWith')}</span>}
            {!focused ? <span>{t('keysInactive')}</span> : null}
          </div>
        </>
      )}

      {layer === 'browse' ? (
        <EpisodePicker
          t={t}
          onClose={() => setLayer('none')}
          opening={library.opening}
          openError={library.openError}
          onOpenEpisode={(id) => openEpisode(id)}
          onOpenFile={(place, rel) => {
            void (async () => {
              if (!(await library.openFile(place, rel))) return
              setSelection(null)
              setLayer('none')
              setView('practice')
            })()
          }}
          onUseFolder={(place, rel) => {
            void (async () => {
              if (await folder.useAsLibrary(place, rel)) {
                library.reload()
                setLayer('none')
              }
            })()
          }}
          savingFolder={folder.saving}
        />
      ) : null}

      {layer === 'folder' ? (
        <MediaFolderPanel
          t={t}
          config={folder}
          onClose={() => setLayer('none')}
          onSaved={() => {
            library.reload()
            setLayer('none')
          }}
        />
      ) : null}
    </div>
  )
}
