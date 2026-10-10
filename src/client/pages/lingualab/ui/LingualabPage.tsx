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
import { DEFAULT_SUBTITLE_ZH_MODE, splitCue, type SubtitleZhMode } from '../../../entities/cue/index.ts'
import { useImport } from '../../../features/import-media/index.ts'
import { useLibraryConfig } from '../../../features/library-config/index.ts'
import { useLibrary } from '../../../features/library/index.ts'
import { useAudioBinding, useMediaPlayer } from '../../../features/media-player/index.ts'
import { addWordToNote, noteHasWord, useNotes } from '../../../features/notes/index.ts'
import {
  readAllProgress,
  readProgress,
  startProgressSync,
  writeProgress,
  type Progress,
} from '../../../features/resume/index.ts'
import { keptSentenceKey, sameKeptSentence } from '../../../shared/notes-format.ts'
import { STYLES } from '../../../shared/lib/styles.ts'
import { BackIcon, NoteIcon } from '../../../shared/ui/icons.tsx'
import { ControlBar, nextZhMode } from '../../../widgets/control-bar/index.ts'
import { EpisodePicker } from '../../../widgets/episode-picker/index.ts'
import { LibraryHome } from '../../../widgets/library-home/index.ts'
import { MediaFolderPanel } from '../../../widgets/media-folder/index.ts'
import { FinishCard, KeyHints, Stage } from '../../../widgets/practice-stage/index.ts'
import { NotesPanel } from '../../../widgets/notes-panel/index.ts'
import { StepTracker } from '../../../widgets/step-tracker/index.ts'
import { SubtitlePanel } from '../../../widgets/subtitle-panel/index.ts'
import type { PanelProps, Translate } from '../../../context.ts'

/** Which view the page shows. */
type View = 'home' | 'practice'

/** Which layer is over the page. Only one at a time; the steps popover is not a layer. */
type Layer = 'none' | 'browse' | 'notes' | 'folder'

export interface LingualabPageProps extends PanelProps {
  readonly t: Translate
}

/** How often the listening position is written down while an episode plays. */
const BOOKMARK_MS = 5000

/** How long a key cap stays lit after the page handles its key. */
const FLASH_MS = 260

/** Whether a keystroke belongs to a field the reader is typing in. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  // A checkbox or a button-like input takes no typing, and a tick that leaves focus on it
  // must not switch the page's keys (Escape included) off for the rest of the visit.
  if (target instanceof HTMLInputElement) return !['checkbox', 'radio', 'button', 'submit', 'range', 'file'].includes(target.type)
  return tag === 'select' || tag === 'textarea' || target.isContentEditable
}

/** The panel's centre-column page. */
export function LingualabPage({ back, t }: LingualabPageProps) {
  const library = useLibrary()
  const folder = useLibraryConfig()
  const notes = useNotes(library.episode?.id ?? null)
  // The episode folders the library lists, so a subtitle dropped on its own can join the
  // episode it names instead of being reported as having no audio.
  const folderNames = useMemo(() => (library.payload?.episodes ?? []).map((entry) => entry.id), [library.payload])
  const importer = useImport(library.reload, folderNames)
  const [view, setView] = useState<View>('home')
  const [zhMode, setZhMode] = useState<SubtitleZhMode>(DEFAULT_SUBTITLE_ZH_MODE)
  const [layer, setLayer] = useState<Layer>('none')
  const [stepsOpen, setStepsOpen] = useState(false)
  const [selection, setSelection] = useState<number | null>(null)
  const [focused, setFocused] = useState(false)
  const [follow, setFollow] = useState(true)
  const [flashed, setFlashed] = useState<string | null>(null)
  const [dismissedFinish, setDismissedFinish] = useState(0)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [progress, setProgress] = useState<Readonly<Record<string, Progress>>>(() => readAllProgress())
  const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null)

  const activeIndex = useMediaPlayer((state) => state.activeIndex)
  const shadow = useMediaPlayer((state) => state.pauseAfterSentence)
  const revealed = useMediaPlayer((state) => state.revealed)
  const finished = useMediaPlayer((state) => state.finished)
  const finishCount = useMediaPlayer((state) => state.finishCount)
  const cues = library.cues
  const audioRef = useAudioBinding(library.media?.audioUrl ?? null)

  // Feature-to-feature wiring is the page's job: the library feature may not reach into
  // the player, so loading a new cue list resets the player here.
  const reset = useMediaPlayer((state) => state.reset)
  useEffect(() => {
    reset(cues)
  }, [cues, reset])

  /**
   * Where to start the episode that was just opened, or `null` when it starts at the top.
   *
   * A ref, not state: it is a note to the effect below, set in an event handler and
   * consumed once, and nothing on screen depends on it.
   */
  const resumeAt = useRef<number | null>(null)

  // Apply the bookmark. This has to come after the reset effect above and after the audio
  // element knows its length: the reset zeroes the position, and a seek issued before the
  // new source has loaded is discarded by the audio binding on purpose, so that a request
  // from the previous episode cannot move the next one. Every open hands back a fresh media,
  // so opening an episode that is already loaded re-runs this too.
  const media = library.media
  const subtitled = media !== null && (media.subtitleEnUrl !== null || media.subtitleZhUrl !== null)
  const cuesReady = cues.length > 0 || (media !== null && !subtitled)
  useEffect(() => {
    const target = resumeAt.current
    const audio = audioRef.current
    if (target === null || audio === null || !cuesReady) return
    const apply = (): void => {
      if (resumeAt.current === null) return
      const at = resumeAt.current
      resumeAt.current = null
      // A bookmark past the end (the file was replaced by a shorter one) starts over.
      if (Number.isFinite(audio.duration) && at >= audio.duration - 1) return
      useMediaPlayer.getState().seek(at)
    }
    if (audio.readyState >= 1) {
      apply()
      return
    }
    audio.addEventListener('loadedmetadata', apply, { once: true })
    return () => audio.removeEventListener('loadedmetadata', apply)
  }, [audioRef, cues, cuesReady, media])

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
    // Not while a resume is still waiting to be applied: the player sits at the start
    // until it is, and writing that would overwrite the very bookmark it is about to use.
    if (resumeAt.current !== null) return
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

  // Share progress with the host for as long as the page is open: what another device left
  // arrives here, and the home picks it up the moment it does.
  useEffect(() => startProgressSync(() => setProgress(readAllProgress())), [])

  /** Go home: save the position first, then refresh what the home shows about it. */
  const goHome = useCallback(() => {
    bookmark()
    useMediaPlayer.getState().setPlaying(false)
    setProgress(readAllProgress())
    setLayer('none')
    setStepsOpen(false)
    setView('home')
  }, [bookmark])

  /**
   * Cue indexes whose sentence is kept, so the list can mark them.
   *
   * Decided by the same key the toggle uses (whole second plus text), not by asking
   * which cue is playing at a phrase's timestamp: `notes.md` stores whole seconds, and
   * the cue playing at `00:12` can be the one before the one that was kept.
   */
  const notedIndexes = useMemo(() => {
    const kept = new Set(notes.phrases.map((phrase) => keptSentenceKey(phrase)))
    const marked = new Set<number>()
    cues.forEach((cue, index) => {
      if (kept.has(keptSentenceKey({ at: cue.start, text: splitCue(cue).english }))) marked.add(index)
    })
    return marked
  }, [notes.phrases, cues])

  /**
   * Keep or un-keep one sentence; the same star on the row and on the transport.
   *
   * A sentence the reader has already worked on (a note, a tag, a tick) is not removed by
   * a star, because a star is a reflex and the work behind it is not. The drawer opens
   * on it instead, where removing it takes a confirmation.
   */
  const keep = useCallback(
    (index?: number): void => {
      const target = cues[index ?? activeIndex]
      if (target === undefined) return
      const { english, chinese } = splitCue(target)
      const outcome = notes.toggle({ at: target.start, text: english, zh: chinese, note: '', tags: [], done: false })
      if (outcome === 'protected') setLayer('notes')
    },
    [cues, activeIndex, notes],
  )

  /** Light the key cap for a key the page just handled. */
  const flash = useCallback((id: string): void => {
    setFlashed(id)
    if (flashTimer.current !== null) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlashed(null), FLASH_MS)
  }, [])

  useEffect(
    () => () => {
      if (flashTimer.current !== null) clearTimeout(flashTimer.current)
    },
    [],
  )

  /** The kept phrase for the sentence on stage, with its place in the stored list. */
  const stagePhrase = useMemo(() => {
    const cue = cues[activeIndex]
    if (cue === undefined) return null
    const key = { at: cue.start, text: splitCue(cue).english }
    const index = notes.phrases.findIndex((phrase) => sameKeptSentence(phrase, key))
    return index < 0 ? null : { index, phrase: notes.phrases[index] }
  }, [cues, activeIndex, notes.phrases])

  /** Put a clicked word into the note of the sentence on stage, keeping the sentence if it was not. */
  const addWord = useCallback(
    (word: string): void => {
      const cue = cues[activeIndex]
      if (cue === undefined) return
      const existing = stagePhrase?.phrase
      if (stagePhrase !== null && existing !== undefined) {
        notes.update(stagePhrase.index, { note: addWordToNote(existing.note, word) })
        return
      }
      const { english, chinese } = splitCue(cue)
      notes.add({ at: cue.start, text: english, zh: chinese, note: addWordToNote('', word), tags: [], done: false })
    },
    [cues, activeIndex, notes, stagePhrase],
  )

  /** The episodes that can be played, in library order; "next" is the one after the open one. */
  const playable = useMemo(
    () => [...(library.payload?.episodes ?? []), ...(library.payload?.files ?? [])].filter((entry) => entry.audio !== null),
    [library.payload],
  )
  const nextEpisode = useMemo(() => {
    const at = playable.findIndex((entry) => entry.id === library.episode?.id)
    return at >= 0 ? (playable[at + 1] ?? null) : null
  }, [playable, library.episode])

  /** Open an episode by id and move to the practice view when the host agrees. */
  const openEpisode = useCallback(
    (id: string): void => {
      void (async () => {
        if (!(await library.openEpisode(id))) return
        // Set before the view switches, so the effect that applies it sees it.
        resumeAt.current = readProgress(id)?.at ?? null
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

  // The end-of-episode card: shown once per time the audio ends, until it is answered.
  const finishOpen = view === 'practice' && finished && finishCount > dismissedFinish && cues.length > 0

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (isTypingTarget(event.target)) return
      // A chord belongs to the browser or the host: Ctrl+S is "save", Ctrl+C is "copy",
      // Ctrl+A is "select all". Reading them as the plain letters meant the reflex of
      // saving a page took the star off a sentence, with its note, and Ctrl+C stopped
      // copying. Shift stays allowed because `[` and `]` can need it on some layouts.
      if (event.ctrlKey || event.metaKey || event.altKey) return
      const store = useMediaPlayer.getState
      // Handled keys stop here. The conversation lives in the same document, and a
      // space bar that scrolls or submits behind the panel is a stolen keystroke.
      const handled = (): void => {
        event.preventDefault()
        event.stopPropagation()
      }
      // Escape closes a layer in either view; everything else is practice-only, since
      // the home has no transport for a shortcut to act on.
      if (event.key === 'Escape') {
        if (finishOpen) {
          handled()
          setDismissedFinish(finishCount)
        } else if (layer !== 'none') {
          handled()
          setLayer('none')
        } else if (view === 'practice') {
          handled()
          if (stepsOpen) setStepsOpen(false)
          else store().clearAB()
        }
        return
      }
      if (view !== 'practice') return
      // A layer owns the keyboard while it is open: its own fields and buttons are the
      // only things a keystroke should reach.
      if (layer !== 'none' && layer !== 'notes') return

      const current = selection ?? store().activeIndex
      switch (event.key) {
        case ' ':
          handled()
          flash('space')
          store().toggle()
          return
        case 'ArrowLeft':
          handled()
          flash('arrows')
          setSelection(null)
          store().stepCue(-1)
          return
        case 'ArrowRight':
          handled()
          flash('arrows')
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
          flash('l')
          if (store().loopMode === 'sentence') store().setLoopMode('none')
          else store().loopSentence(current)
          return
        case 's':
        case 'S':
        case 'n':
        case 'N':
          handled()
          flash('s')
          keep(selection ?? undefined)
          return
        case 'c':
        case 'C':
          handled()
          flash('c')
          setZhMode(nextZhMode(zhMode))
          return
        case 'r':
        case 'R':
          handled()
          flash('r')
          store().reveal(store().activeIndex)
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
    [cues, finishCount, finishOpen, flash, keep, layer, selection, stepsOpen, view, zhMode],
  )

  const hasAudio = library.media !== null
  // The selection is an index into the cue list, and the list changes under it when
  // the episode does; clamping here is cheaper than resetting it from an effect.
  const selectedIndex =
    selection === null ? activeIndex : Math.min(Math.max(0, selection), Math.max(0, cues.length - 1))
  const stageCue = cues[activeIndex]
  const stageLines = stageCue === undefined ? null : splitCue(stageCue)
  const keptNow =
    stageCue !== undefined && stageLines !== null && notes.has({ at: stageCue.start, text: stageLines.english })
  // Shadowing hides the English of the sentence being repeated until it has been heard.
  const masked = shadow && stageCue !== undefined && revealed !== activeIndex
  const practising = notes.phrases.filter((phrase) => !phrase.done).length
  const drawerOpen = layer === 'notes' || stepsOpen
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
      // The practice view and the top bars have no drop target of their own, and a file
      // let go there would otherwise be opened by the browser in place of the page. The
      // home's drop zone claims the event first; this catches everything else.
      onDragOver={(event) => {
        if (Array.from(event.dataTransfer.types).includes('Files')) event.preventDefault()
      }}
      onDrop={(event) => {
        if (Array.from(event.dataTransfer.types).includes('Files')) event.preventDefault()
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
            currentId={episodeId}
            current={episode}
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
            <div className="dsh-lingualab-top-heading">
              <span className="dsh-lingualab-top-title" title={episode?.title ?? ''}>
                {episode?.title ?? t('openEpisode')}
              </span>
              {cues.length > 0 && stageCue !== undefined ? (
                <span className="dsh-lingualab-top-sub">{t('cueOf', { n: activeIndex + 1, total: cues.length })}</span>
              ) : null}
            </div>
            <span className="dsh-lingualab-spacer" />
            <button
              type="button"
              className={`dsh-lingualab-chip${layer === 'notes' ? ' is-on' : ''}`}
              onClick={() => {
                setStepsOpen(false)
                setLayer(layer === 'notes' ? 'none' : 'notes')
              }}
            >
              <NoteIcon size={13} /> {t('notesChip')} {notes.phrases.length > 0 ? notes.phrases.length : ''}
            </button>
            {episode !== null ? (
              <StepTracker
                key={episode.id}
                t={t}
                episode={episode.id}
                open={stepsOpen}
                onToggle={() => {
                  setLayer('none')
                  setStepsOpen(!stepsOpen)
                }}
              />
            ) : null}
          </div>

          <div className="dsh-lingualab-body">
            <div className="dsh-lingualab-practice">
              <Stage
                t={t}
                cues={cues}
                activeIndex={activeIndex}
                zhMode={zhMode}
                masked={masked}
                onReveal={() => useMediaPlayer.getState().reveal(useMediaPlayer.getState().activeIndex)}
                onAddWord={addWord}
                hasWord={(word) => noteHasWord(stagePhrase?.phrase?.note ?? '', word)}
                loading={library.cuesLoading}
                hasAudio={hasAudio}
              />
              <div className="dsh-lingualab-deck">
                <ControlBar
                  t={t}
                  zhMode={zhMode}
                  onZhMode={setZhMode}
                  kept={keptNow}
                  onToggleKeep={() => keep()}
                  disabled={!hasAudio || cues.length === 0}
                />
                <KeyHints t={t} flash={flashed} active={focused} />
              </div>
              {library.error !== null && cues.length === 0 && hasAudio ? (
                <div className="dsh-lingualab-error" style={{ textAlign: 'center' }}>
                  {t('subtitleFailed')}{' '}
                  <button type="button" className="dsh-lingualab-btn" onClick={library.reload}>
                    {t('retry')}
                  </button>
                </div>
              ) : null}
              {finishOpen ? (
                <FinishCard
                  t={t}
                  title={episode?.title ?? ''}
                  sentences={cues.length}
                  kept={notes.phrases.length}
                  practising={practising}
                  nextTitle={nextEpisode?.title ?? null}
                  onAgain={() => {
                    setDismissedFinish(finishCount)
                    useMediaPlayer.getState().seek(0)
                    useMediaPlayer.getState().setPlaying(true)
                  }}
                  onNext={() => {
                    setDismissedFinish(finishCount)
                    if (nextEpisode !== null) openEpisode(nextEpisode.id)
                  }}
                  onHome={() => {
                    setDismissedFinish(finishCount)
                    goHome()
                  }}
                  onClose={() => setDismissedFinish(finishCount)}
                />
              ) : null}
            </div>

            <SubtitlePanel
              t={t}
              cues={cues}
              loading={library.cuesLoading}
              activeIndex={activeIndex}
              selectedIndex={selectedIndex}
              zhMode={zhMode}
              notedIndexes={notedIndexes}
              follow={follow}
              onFollow={setFollow}
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
          </div>

          {drawerOpen ? (
            <div
              className="dsh-lingualab-scrim"
              onClick={() => {
                setLayer('none')
                setStepsOpen(false)
              }}
            />
          ) : null}
          {layer === 'notes' ? <NotesPanel t={t} notes={notes} episodeTitle={episode?.title ?? ''} onClose={() => setLayer('none')} /> : null}
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
