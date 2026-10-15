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
 * what you kept became the right column's other view, 「收藏」, next to the subtitles.
 *
 * A review is a mode of this page rather than a page of its own: it puts each kept sentence on
 * the stage in turn, hidden until revealed and looping, and the grade the reader gives is written
 * to the episode's notes like any other edit. A review over the whole library opens each
 * sentence's episode (and segment) through the same path the home uses, so the page is where the
 * queue, the player, the open episode and its notes meet.
 *
 * A segment with a video plays it in the one media element, so its sound is the video's: the picture sits on
 * the stage in three states the reader cycles with `V` (shown, large, hidden), the five steps switch it to
 * large for the blind watch and put it back, and the video is prepared on the host the first time it is asked for.
 *
 * An episode cut into segments (one scene per audio file) plays one segment at a time. The
 * page is where the pieces meet: it knows the reader's positions (so it decides which segment
 * 「继续」 opens), the library feature opens a segment, the notes feature keeps the sentences,
 * and the segment list is one more layer for the Escape key to close.
 *
 * Keyboard handling lives here rather than on `window`. The earlier standalone app bound
 * its shortcuts globally and therefore owned the space bar, the arrow keys and the
 * bracket keys wherever it was open; inside a panel that shares a page with a
 * conversation, that is a hostile neighbour. The handler sits on the page container,
 * which is focusable, so the keys work while the panel has focus and stop at its edge.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react'
import { splitCue, type Cue } from '../../../entities/cue/index.ts'
import { useImport } from '../../../features/import-media/index.ts'
import { useLibraryConfig } from '../../../features/library-config/index.ts'
import { findSegment, hasMedia, nextSegment, segmentLabel, useLibrary } from '../../../features/library/index.ts'
import {
  primeTakeAudio,
  sessionMetadata,
  togglePlayback,
  useMediaBinding,
  useMediaPlayer,
  useMediaSession,
  type MicNotice,
} from '../../../features/media-player/index.ts'
import { addWordToNote, noteHasWord, removeWordFromNote, useNotes } from '../../../features/notes/index.ts'
import {
  continueSegment,
  finishedSegments,
  progressKeyOf,
  readAllProgress,
  readProgress,
  startProgressSync,
  writeProgress,
  type Progress,
} from '../../../features/resume/index.ts'
import {
  currentItem,
  episodeQueue,
  isFinished,
  libraryQueue,
  recordOutcome,
  retryNotYet,
  startReview,
  stepBack,
  tallyReview,
  useReviewList,
  type ReviewItem,
  type ReviewOutcome,
  type ReviewSession,
} from '../../../features/review/index.ts'
import { resolveThemeVars, useHostDark, useSettings } from '../../../features/settings/index.ts'
import {
  cardOf,
  isInformational,
  playSource,
  segmentKey,
  useFirstTimeCard,
  useLocalVideo,
  useVideo,
} from '../../../features/video/index.ts'
import { holdsMouseFocus, keepsKeyForTarget } from '../../../shared/lib/focus.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import { keptSentenceKey, sameKeptSentence, withGrade, type GivenGrade } from '../../../shared/notes-format.ts'
import { segmentProgress } from '../../../shared/progress.ts'
import type { EpisodeEntry, NotePhrase, VideoStatusPayload } from '../../../shared/protocol.ts'
import { STYLES } from '../../../shared/lib/styles.ts'
import { usePresence } from '../../../shared/lib/usePresence.ts'
import { BackIcon, NoteIcon, SettingsIcon } from '../../../shared/ui/icons.tsx'
import { Segmented } from '../../../shared/ui/Segmented.tsx'
import {
  ControlBar,
  nextZhMode,
  type ControlBarHandle,
  type PictureControl,
  type SubtitleControl,
} from '../../../widgets/control-bar/index.ts'
import { EpisodePicker } from '../../../widgets/episode-picker/index.ts'
import { LibraryHome } from '../../../widgets/library-home/index.ts'
import { MediaFolderPanel } from '../../../widgets/media-folder/index.ts'
import { FinishCard, KeyHints, Stage } from '../../../widgets/practice-stage/index.ts'
import { NotesPanel } from '../../../widgets/notes-panel/index.ts'
import { ReviewFinish, ReviewStrip } from '../../../widgets/review-strip/index.ts'
import { SegmentPicker } from '../../../widgets/segment-picker/index.ts'
import { SETTINGS_EXIT_MS, SettingsPanel } from '../../../widgets/settings-panel/index.ts'
import { STEPS_EXIT_MS, StepTracker } from '../../../widgets/step-tracker/index.ts'
import { SubtitlePanel } from '../../../widgets/subtitle-panel/index.ts'
import { TIMING_EXIT_MS, TimingStrip, useTimingEditor, type SavedTiming } from '../../../widgets/timing-editor/index.ts'
import { VideoNotice, VideoStage, type VideoNoticeData } from '../../../widgets/video-stage/index.ts'
import type { PanelProps, Translate } from '../../../context.ts'
import { useCardFit } from '../lib/useCardFit.ts'
import { flashOf, headsetAction, keyAction, type KeyAction, type KeyPress } from '../lib/keymap.ts'
import { usePictureRoom } from '../lib/usePictureRoom.ts'

/** Which view the page shows. */
type View = 'home' | 'practice'

/** Which layer is over the page. Only one at a time; the steps popover is not a layer. */
type Layer = 'none' | 'browse' | 'folder' | 'segments'

/** What the right column shows: the subtitles, or the sentences kept from them. */
type Column = 'transcript' | 'kept'

/** The set of finished segments of an episode that has none. One value, so the memo below stays stable. */
const NO_FINISHED: ReadonlySet<string> = new Set()

export interface LingualabPageProps extends PanelProps {
  readonly t: Translate
}

/** How often the listening position is written down while an episode plays. */
const BOOKMARK_MS = 5000

/** How long a key cap stays lit after the page handles its key. */
const FLASH_MS = 260

/** How long the 「视频准备好了」 and 「盲看开始计时」 notices stay; the length warning stays until it is dismissed. */
const NOTICE_MS = 7000

/** The dictionary key of what each microphone problem says. */
const MIC_NOTICE_KEYS: Readonly<Record<MicNotice, string>> = {
  unsupported: 'micUnsupported',
  denied: 'micDenied',
  unavailable: 'micUnavailable',
  blocked: 'micBlocked',
}

/**
 * Where a kept sentence starts in the cue list on screen.
 *
 * `notes.md` holds whole seconds, so a sentence that starts at 135.08 s reads back as 135,
 * which can sit in the gap before it: seeking there made the previous sentence the active
 * one, and that was the sentence the replay looped. The cue with the same second and the
 * same English is the one that was kept, by the rule the star already uses.
 */
function keptCueStart(cues: readonly Cue[], at: number, text: string): number {
  const key = keptSentenceKey({ at, text })
  return cues.find((cue) => keptSentenceKey({ at: cue.start, text: splitCue(cue).english }) === key)?.start ?? at
}

/** Whether a keystroke belongs to a field the reader is typing in. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  // A checkbox or a button-like input takes no typing, and a tick that leaves focus on it
  // must not switch the page's keys (Escape included) off for the rest of the visit.
  if (target instanceof HTMLInputElement) return !['checkbox', 'radio', 'button', 'submit', 'range', 'file'].includes(target.type)
  return tag === 'select' || tag === 'textarea' || target.isContentEditable
}

/** A keystroke as the keymap reads it: the key and modifiers, and the two questions only the DOM can answer. */
function pressOf(event: ReactKeyboardEvent<HTMLDivElement>): KeyPress {
  return {
    key: event.key,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    altKey: event.altKey,
    typing: isTypingTarget(event.target),
    ownsKey: keepsKeyForTarget(event.target, event.key),
  }
}

/** Stop a handled key here: the conversation lives in the same document, and its default would act behind the panel. */
function stopKey(event: ReactKeyboardEvent<HTMLDivElement>): void {
  event.preventDefault()
  event.stopPropagation()
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
  // 「中文显示」 is a setting: it is remembered in this browser with the theme and the stage size.
  const zhMode = useSettings((state) => state.zhMode)
  const setZhMode = useSettings((state) => state.setZhMode)
  const [layer, setLayer] = useState<Layer>('none')
  const [column, setColumn] = useState<Column>('transcript')
  const [review, setReview] = useState<ReviewSession | null>(null)
  /**
   * Whether a review is running, for the bookmark: a review jumps between kept sentences, and
   * writing those places down would move 「继续」 to wherever the review last was. A ref, set in the
   * handlers that start and end a review, because the bookmark's own cleanup runs after them.
   */
  const reviewing = useRef(false)
  const reviewList = useReviewList(view === 'home')
  const [stepsOpen, setStepsOpen] = useState(false)
  // The scrim behind the steps drawer fades out as the drawer slides out, so it outlives `stepsOpen` briefly.
  const scrim = usePresence(stepsOpen, STEPS_EXIT_MS)
  // The settings drawer is the steps drawer's sibling: only one of the two is open at a time, and it
  // is open in either view, so its scrim lives outside the practice branch.
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsScrim = usePresence(settingsOpen, SETTINGS_EXIT_MS)
  const theme = useSettings((state) => state.theme)
  const appearance = useSettings((state) => state.appearance)
  const stageSize = useSettings((state) => state.stageSize)
  const hostDark = useHostDark()
  /**
   * The reader's theme as inline custom properties on the root, or `undefined` when it is the
   * default following the host (nothing is set, and the page is exactly as the host styles it).
   */
  const themeStyle = useMemo((): CSSProperties | undefined => {
    const resolved = resolveThemeVars(theme, appearance, hostDark)
    return resolved === null ? undefined : ({ ...resolved.vars, colorScheme: resolved.scheme } as CSSProperties)
  }, [theme, appearance, hostDark])
  const [selection, setSelection] = useState<number | null>(null)
  const [focused, setFocused] = useState(false)
  const [follow, setFollow] = useState(true)
  const [flashed, setFlashed] = useState<string | null>(null)
  const [dismissedFinish, setDismissedFinish] = useState(0)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [progress, setProgress] = useState<Readonly<Record<string, Progress>>>(() => readAllProgress())
  const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null)
  const controlBar = useRef<ControlBarHandle>(null)

  const activeIndex = useMediaPlayer((state) => state.activeIndex)
  const shadow = useMediaPlayer((state) => state.pauseAfterSentence)
  const revealed = useMediaPlayer((state) => state.revealed)
  const finished = useMediaPlayer((state) => state.finished)
  const finishCount = useMediaPlayer((state) => state.finishCount)
  /** Whether the sentence on stage has a take of the reader's own, which the 「对比」 key plays. */
  const hasTake = useMediaPlayer((state) => state.takes[state.activeIndex] !== undefined)
  const micNotice = useMediaPlayer((state) => state.micNotice)
  const cues = library.cues

  const episode = library.episode
  const episodeId = episode?.id ?? null
  const segments = library.segments
  const segment = library.segment
  const segmentId = segment?.id ?? null
  /** The video the scan found for what is open: the segment's, or the folder's when it has no segments. */
  const scannedVideo = segment === null ? (episode?.video ?? null) : segment.video
  const hasVideoFile = scannedVideo !== null
  /** The audio file of what is open, null for a video-only segment. */
  const audioFile = segment === null ? (episode?.audio ?? null) : segment.audio
  const picture = useSettings((state) => state.picture)
  const pictureRestore = useSettings((state) => state.pictureRestore)
  const [notice, setNotice] = useState<VideoNoticeData | null>(null)
  /** The segments whose length warning was dismissed, for this visit. */
  const [dismissedMismatch, setDismissedMismatch] = useState<ReadonlySet<string>>(() => new Set())
  const refreshListing = library.refreshListing
  /** A preparing job just finished: say so, and let the listing's marks catch up. */
  const onVideoReady = useCallback(
    (ready: VideoStatusPayload): void => {
      const at = useMediaPlayer.getState().currentTime
      const text = t(ready.via === 'smooth' ? 'noticeReadySmooth' : 'noticeReady', { time: formatClock(at) })
      setNotice({ kind: 'ready', text, action: null })
      refreshListing()
    },
    [t, refreshListing],
  )
  const video = useVideo(episodeId, segmentId, hasVideoFile, onVideoReady)
  /** A remembered local file could not be opened: not allowed, or gone. */
  const onLocalUnreadable = useCallback((): void => {
    setNotice({ kind: 'warn', text: t('noticeLocalUnreadable'), action: t('cardGotIt') })
  }, [t])
  /** A video file the reader picked from their own disk, to play in place of the served one. */
  const local = useLocalVideo({
    key: hasVideoFile ? segmentKey(episodeId, segmentId) : null,
    status: video.status,
    audioUrl: library.media?.audioUrl ?? null,
    onUnreadable: onLocalUnreadable,
  })
  const markUndecodable = video.markUndecodable
  const rejectLocal = local.reject
  /** The browser cannot decode what the element was given: the reader's file is dropped, anything else is given up on. */
  const onUndecodable = useCallback(
    (failed: string): void => {
      const name = rejectLocal(failed)
      if (name === null) markUndecodable(failed)
      else setNotice({ kind: 'warn', text: t('noticeLocalFailed', { name }), action: t('cardGotIt') })
    },
    [rejectLocal, markUndecodable, t],
  )
  /**
   * What plays: the reader's own file when they chose one, else the video once it plays, else the audio file (or
   * nothing, for a video that is not prepared). With the picture hidden the audio file plays even when a video
   * could, so the video is not downloaded; the reader showing the picture again swaps it back under the same
   * session, keeping the position.
   */
  const source = playSource(library.media?.audioUrl ?? null, video.status, video.failedUrl, picture === 'hidden', local.url)
  /** Whether the segment has a video that plays, whichever of the two is the source right now. */
  const videoPlays =
    picture === 'hidden'
      ? playSource(library.media?.audioUrl ?? null, video.status, video.failedUrl, false, local.url).picture
      : source.picture
  // The one media element. A new source for the same segment (the audio, then the video that was just
  // prepared, or the file the reader chose) keeps the position; the `session` is what says it is the same segment.
  const binding = useMediaBinding(source.url, segmentKey(episodeId, segmentId), onUndecodable)

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
  /** Whether to loop the sentence at `resumeAt` once it has been seeked to: a replayed note, not a resume. */
  const resumeLoop = useRef(false)
  /** The English of the replayed note, so the seek lands on its cue rather than on its whole second. */
  const resumeText = useRef<string | null>(null)

  // Apply the bookmark. This has to come after the reset effect above and after the audio
  // element knows its length: the reset zeroes the position, and a seek issued before the
  // new source has loaded is discarded by the audio binding on purpose, so that a request
  // from the previous episode cannot move the next one. Every open hands back a fresh media,
  // so opening an episode that is already loaded re-runs this too. In that case the library
  // keeps the cue list it has (it does not parse the same subtitles again), so the reset
  // above does not fire afterwards and zero the position this seek has just set.
  const media = library.media
  const subtitled = media !== null && (media.subtitleEnUrl !== null || media.subtitleZhUrl !== null)
  const cuesReady = cues.length > 0 || (media !== null && !subtitled)
  useEffect(() => {
    const target = resumeAt.current
    const audio = binding.element
    if (target === null || audio === null || !cuesReady) return
    const apply = (): void => {
      if (resumeAt.current === null) return
      const text = resumeText.current
      const at = text === null ? resumeAt.current : keptCueStart(cues, resumeAt.current, text)
      const loop = resumeLoop.current
      resumeAt.current = null
      resumeLoop.current = false
      resumeText.current = null
      // A bookmark past the end (the file was replaced by a shorter one, or the segment was
      // listened to the end) starts over.
      if (Number.isFinite(audio.duration) && at >= audio.duration - 1) return
      useMediaPlayer.getState().seek(at)
      // A loop is only asked for by replaying a kept sentence, which plays it, as in the same segment.
      if (loop) {
        useMediaPlayer.getState().setLoopMode('sentence')
        useMediaPlayer.getState().setPlaying(true)
      }
    }
    if (audio.readyState >= 1) {
      apply()
      return
    }
    audio.addEventListener('loadedmetadata', apply, { once: true })
    return () => audio.removeEventListener('loadedmetadata', apply)
  }, [binding.element, cues, cuesReady, media, source.url])

  // The segment list takes the keyboard when it opens. When it closes the focused list is gone, and
  // focus that falls to the document would switch the page's shortcuts off, so it comes back here.
  const previousLayer = useRef<Layer>('none')
  useEffect(() => {
    if (previousLayer.current === 'segments' && layer !== 'segments') containerRef.current?.focus({ preventScroll: true })
    previousLayer.current = layer
  }, [layer])

  // Focus the page once so the shortcuts below are live without a click, and without
  // stealing the conversation's focus afterwards.
  useEffect(() => {
    if (library.loading) return
    containerRef.current?.focus({ preventScroll: true })
  }, [library.loading, view])

  // The reader's take plays on one shared audio element, and iOS only lets it play without a gesture if it was
  // played inside one earlier. A reader whose recording was already on from last time may start with a gesture that
  // is none of the buttons that unlock it, so any press or key on the panel does, until it is done. On the panel
  // container in the capture phase, never on `window` or `document`: the host's keys are not ours.
  useEffect(() => {
    const panel = containerRef.current
    if (panel === null) return
    const unlock = (): void => {
      if (useMediaPlayer.getState().shadow.record) primeTakeAudio()
    }
    const events = ['pointerup', 'click', 'keydown'] as const
    for (const name of events) panel.addEventListener(name, unlock, true)
    return () => {
      for (const name of events) panel.removeEventListener(name, unlock, true)
    }
  }, [library.loading, view])

  /** What the position is stored under: the episode's id, or its segment's key. */
  const positionKey = episodeId === null ? null : progressKeyOf(episodeId, segmentId)

  /**
   * Write the listening position down while an episode is on screen.
   *
   * On an interval and on the way out, not on every `timeupdate`: that event fires
   * several times a second, and a `localStorage` write per tick is wasted work for a
   * bookmark nobody reads until the next visit.
   */
  const bookmark = useCallback(() => {
    if (positionKey === null) return
    // Not while a resume is still waiting to be applied: the player sits at the start
    // until it is, and writing that would overwrite the very bookmark it is about to use.
    if (resumeAt.current !== null || reviewing.current) return
    const state = useMediaPlayer.getState()
    writeProgress(positionKey, state.currentTime, state.duration)
  }, [positionKey])

  useEffect(() => {
    if (view !== 'practice') return
    const timer = setInterval(bookmark, BOOKMARK_MS)
    return () => {
      clearInterval(timer)
      bookmark()
    }
  }, [view, bookmark])

  // Audio that plays to its end is finished, and "finished" is read off the stored position
  // being within a second of the length. The five-second interval would usually get there, but
  // not always, so the end of the audio writes it down itself. The count is the store's, which
  // outlives this page, so only a change after mounting counts. The segment list and the home
  // read the table fresh when they open.
  const seenFinishCount = useRef(finishCount)
  useEffect(() => {
    if (finishCount === seenFinishCount.current) return
    seenFinishCount.current = finishCount
    const state = useMediaPlayer.getState()
    if (positionKey !== null && view === 'practice' && state.duration > 0 && !reviewing.current) {
      writeProgress(positionKey, state.duration, state.duration)
    }
  }, [finishCount, positionKey, view])

  // Share progress with the host for as long as the page is open: what another device left
  // arrives here, and the home picks it up the moment it does.
  useEffect(() => startProgressSync(() => setProgress(readAllProgress())), [])

  /** Go home: save the position first, then refresh what the home shows about it. */
  const goHome = useCallback(() => {
    bookmark()
    reviewing.current = false
    setReview(null)
    // A grade given a moment ago may still be waiting for its write; the home's review count is
    // read again once it has landed, so it does not show the sentence just graded.
    void notes.flush().then(reviewList.reload)
    useMediaPlayer.getState().setPlaying(false)
    // The takes belong to the episode that was open: going home closes it.
    useMediaPlayer.getState().dropTakes()
    setProgress(readAllProgress())
    setLayer('none')
    setStepsOpen(false)
    setView('home')
  }, [bookmark, notes, reviewList.reload])

  /** The segments of this episode that are finished, which the segment list marks. */
  const finishedIds = useMemo(
    () => (episode === null || segments.length === 0 ? NO_FINISHED : finishedSegments(progress, episode)),
    [progress, episode, segments],
  )

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
      if (kept.has(keptSentenceKey({ at: cue.start, text: splitCue(cue).english, segment: segmentId ?? undefined }))) {
        marked.add(index)
      }
    })
    return marked
  }, [notes.phrases, cues, segmentId])

  /**
   * Keep or un-keep one sentence; the same star on the row and on the transport.
   *
   * A sentence the reader has already worked on (a note, a grade) is not removed by a star,
   * because a star is a reflex and the work behind it is not. The 「收藏」 column shows it
   * instead, where removing it is a button with an undo.
   */
  const keep = useCallback(
    (index?: number): void => {
      const target = cues[index ?? activeIndex]
      if (target === undefined) return
      const { english, chinese } = splitCue(target)
      // The segment is recorded with the sentence: seconds only mean something inside one.
      const outcome = notes.toggle({
        at: target.start,
        text: english,
        zh: chinese,
        note: '',
        tags: [],
        done: false,
        segment: segmentId ?? undefined,
      })
      if (outcome === 'protected') setColumn('kept')
    },
    [cues, activeIndex, notes, segmentId],
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
    const key = { at: cue.start, text: splitCue(cue).english, segment: segmentId ?? undefined }
    const index = notes.phrases.findIndex((phrase) => sameKeptSentence(phrase, key))
    return index < 0 ? null : { index, phrase: notes.phrases[index] }
  }, [cues, activeIndex, notes.phrases, segmentId])

  /**
   * Put a picked word or phrase into the note of the sentence on stage, keeping the sentence if it
   * was not; take it out again when the note already holds it.
   */
  const toggleWord = useCallback(
    (word: string): void => {
      const cue = cues[activeIndex]
      if (cue === undefined) return
      const existing = stagePhrase?.phrase
      if (stagePhrase !== null && existing !== undefined) {
        const note = noteHasWord(existing.note, word) ? removeWordFromNote(existing.note, word) : addWordToNote(existing.note, word)
        notes.update(stagePhrase.index, { note })
        return
      }
      const { english, chinese } = splitCue(cue)
      notes.add({
        at: cue.start,
        text: english,
        zh: chinese,
        note: addWordToNote('', word),
        tags: [],
        done: false,
        segment: segmentId ?? undefined,
      })
    },
    [cues, activeIndex, notes, stagePhrase, segmentId],
  )

  /** Grade the kept sentence on stage; a sentence that is not kept has no grade to give. */
  const gradeStage = useCallback(
    (grade: GivenGrade): void => {
      const phrase = stagePhrase?.phrase
      if (stagePhrase === null || phrase === undefined) return
      notes.update(stagePhrase.index, withGrade(phrase, grade))
    },
    [notes, stagePhrase],
  )

  /** The episodes that can be played, in library order; "next" is the one after the open one. */
  const playable = useMemo(
    () => [...(library.payload?.episodes ?? []), ...(library.payload?.files ?? [])].filter(hasMedia),
    [library.payload],
  )
  const nextEpisode = useMemo(() => {
    const at = playable.findIndex((entry) => entry.id === library.episode?.id)
    return at >= 0 ? (playable[at + 1] ?? null) : null
  }, [playable, library.episode])

  /** The entry for an episode id: from the listing, or the open one when it lives outside it. */
  const entryFor = useCallback(
    (id: string): EpisodeEntry | null =>
      [...(library.payload?.episodes ?? []), ...(library.payload?.files ?? [])].find((entry) => entry.id === id) ??
      (library.episode?.id === id ? library.episode : null),
    [library.payload, library.episode],
  )

  /**
   * Open an episode by id and move to the practice view when the host agrees.
   *
   * For an episode cut into segments this is where 「继续」 is decided, in one place: the segment
   * listened to most recently, or the first when none has been. The host opens whichever it is
   * told, because the host knows no more than the progress file and the page has the reader's
   * positions to hand.
   */
  const openEpisode = useCallback(
    (id: string): void => {
      void (async () => {
        const entry = entryFor(id)
        const positions = readAllProgress()
        const chosen = entry === null || entry.segments.length === 0 ? null : continueSegment(positions, entry)
        if (!(await library.openEpisode(id, chosen ?? undefined))) return
        // Set before the view switches, so the effect that applies it sees it.
        resumeAt.current =
          chosen === null
            ? (readProgress(id)?.at ?? null)
            : (segmentProgress(positions, id, chosen, entry?.segments.map((item) => item.id) ?? [])?.at ?? null)
        resumeLoop.current = false
        setSelection(null)
        setLayer('none')
        setView('practice')
      })()
    },
    [library, entryFor],
  )

  /**
   * Move to another segment of the open episode.
   *
   * The outgoing segment's position is saved first. The incoming one resumes where it was left
   * unless `to` says where to go, which is what replaying a kept sentence does: it names the
   * second to seek to and asks for the sentence to be looped, and the drawer it came from stays open.
   */
  const openSegment = useCallback(
    (id: string, to?: { readonly at: number; readonly loop: boolean; readonly text?: string }): void => {
      if (episode === null || id === segmentId) return
      void (async () => {
        bookmark()
        if (!(await library.openEpisode(episode.id, id))) return
        const ids = episode.segments.map((item) => item.id)
        const positions = readAllProgress()
        resumeAt.current = to?.at ?? segmentProgress(positions, episode.id, id, ids)?.at ?? null
        resumeLoop.current = to?.loop === true
        resumeText.current = to?.text ?? null
        setSelection(null)
        if (to === undefined) setLayer('none')
        setProgress(positions)
      })()
    },
    [episode, segmentId, bookmark, library],
  )

  /**
   * Replay a kept sentence: seek to it and loop it, opening its segment first when it is in another.
   *
   * A segment the episode no longer has (the file was renamed) cannot be opened, so the
   * sentence is replayed at its second in the one on screen rather than doing nothing.
   */
  const replayPhrase = useCallback(
    (phrase: NotePhrase): void => {
      if (phrase.segment !== undefined && phrase.segment !== segmentId && findSegment(segments, phrase.segment) !== null) {
        openSegment(phrase.segment, { at: phrase.at, loop: true, text: phrase.text })
        return
      }
      useMediaPlayer.getState().seekCueAt(keptCueStart(cues, phrase.at, phrase.text))
      useMediaPlayer.getState().setLoopMode('sentence')
      // A seek alone leaves paused audio paused, and the card's play icon then did nothing.
      useMediaPlayer.getState().setPlaying(true)
    },
    [cues, segmentId, segments, openSegment],
  )

  /**
   * Why this episode's subtitles cannot be saved from the timing strip, or `null`.
   *
   * The page only writes files inside the library: a folder episode always is, a file episode only
   * when it is a loose file at the library root. The host checks the same thing again.
   */
  const timingBlocked = useMemo((): string | null => {
    if (episode === null || episode.kind === 'folder') return null
    return (library.payload?.files ?? []).some((entry) => entry.id === episode.id) ? null : t('timingOutside')
  }, [episode, library.payload, t])

  /**
   * After a timing save: keep the star on the sentence, read the file again, and stay on the sentence.
   *
   * A kept sentence is matched by its whole second, so a start that crossed a second would leave
   * the star behind; the phrase's `at` moves with it, and the same for a next sentence whose start
   * the end pushed. Reading the file again gives the cues their
   * new edges and the hash the next save needs; the position is put back on the sentence the way a
   * replayed note is, looping it when it was playing.
   */
  const onTimingSaved = useCallback(
    (saved: SavedTiming): void => {
      for (const moved of [saved, ...saved.pushed]) {
        const before = moved.before.start / 1000
        const after = moved.after.start / 1000
        if (Math.floor(before) === Math.floor(after)) continue
        const key = { at: before, text: splitCue(moved.cue).english, segment: segmentId ?? undefined }
        const index = notes.phrases.findIndex((phrase) => sameKeptSentence(phrase, key))
        if (index >= 0) notes.update(index, { at: after })
      }
      const after = saved.after.start / 1000
      resumeAt.current = after
      resumeLoop.current = useMediaPlayer.getState().isPlaying
      resumeText.current = null
      library.reloadCues()
    },
    [notes, segmentId, library],
  )

  /** The file changed under the page: read it again and stay where the playhead is. */
  const onTimingStale = useCallback((): void => {
    resumeAt.current = useMediaPlayer.getState().currentTime
    resumeLoop.current = false
    resumeText.current = null
    library.reloadCues()
  }, [library])

  /**
   * After the 「字幕」 popover saved a choice: open the same episode and segment again, so the host
   * hands out the files the choice resolves to, and stay where the playhead is, as after a timing save.
   * The listing is read again too, so the home's marks say what will play.
   */
  const onSubtitlesSaved = useCallback((): void => {
    if (episodeId === null) return
    resumeAt.current = useMediaPlayer.getState().currentTime
    resumeLoop.current = false
    resumeText.current = null
    void library.openEpisode(episodeId, segmentId ?? undefined).then((opened) => {
      if (!opened) resumeAt.current = null
      library.refreshListing()
    })
  }, [episodeId, segmentId, library])

  const timing = useTimingEditor({
    cues,
    tracks: library.tracks,
    episodeId,
    blocked: timingBlocked,
    onSaved: onTimingSaved,
    onStale: onTimingStale,
  })
  // The layout is in timing mode for as long as the panel is on the page, which outlasts the session by its way out: the
  // card fades while everything around it stays put, and the column leaves timing mode in the commit that unmounts the
  // panel. Behaviour (the keys, the stage's button) follows the session. One presence serves both the column and the
  // panel, so they cannot part by a frame.
  const timingPresence = usePresence(timing.session !== null, TIMING_EXIT_MS)
  // Whether the picture that plays above the sentence has the room it needs, with the timing panel open or not. The
  // scroller is in state, not a ref, so the measuring starts when the practice view puts it on the page.
  const [practiceMain, setPracticeMain] = useState<HTMLDivElement | null>(null)
  const pictureFits = usePictureRoom(practiceMain, videoPlays && picture === 'shown')

  /** Open the strip for the sentence on stage; layers close, because the strip takes the keyboard. */
  const openTiming = useCallback((): void => {
    if (cues[activeIndex] === undefined) return
    setLayer('none')
    setStepsOpen(false)
    setSelection(null)
    timing.open(activeIndex)
  }, [cues, activeIndex, timing])

  /**
   * Put one review item on stage: replay it in the open episode, or open its episode (at its
   * segment) first and replay it there, the way a kept sentence from another segment is replayed.
   * @returns false when its episode could not be opened, which the review counts as gone.
   */
  const goToItem = useCallback(
    async (item: ReviewItem): Promise<boolean> => {
      if (item.episode === episodeId) {
        // A review started from the home can begin in the episode that is already loaded.
        setSelection(null)
        setView('practice')
        replayPhrase(item.phrase)
        return true
      }
      const entry = entryFor(item.episode)
      const wanted = item.phrase.segment
      const segmentOf = wanted !== undefined && entry !== null && findSegment(entry.segments, wanted) !== null ? wanted : undefined
      if (!(await library.openEpisode(item.episode, segmentOf))) return false
      resumeAt.current = item.phrase.at
      resumeLoop.current = true
      resumeText.current = item.phrase.text
      setSelection(null)
      setView('practice')
      return true
    },
    [episodeId, replayPhrase, entryFor, library],
  )

  /**
   * Move a review to the session given, and put its current item on stage.
   *
   * An item whose episode cannot be opened is recorded as gone and the next one is tried, so a
   * renamed folder costs a line in the summary rather than a stuck review.
   */
  const runReview = useCallback(
    (session: ReviewSession): void => {
      void (async () => {
        let next = session
        for (;;) {
          setReview(next)
          const item = currentItem(next)
          if (item === null) {
            useMediaPlayer.getState().setPlaying(false)
            return
          }
          if (await goToItem(item)) return
          next = recordOutcome(next, 'gone')
        }
      })()
    },
    [goToItem],
  )

  /** Start a review over these items; nothing happens for an empty queue. */
  const beginReview = useCallback(
    (items: readonly ReviewItem[], scope: ReviewSession['scope']): void => {
      const session = startReview(items, scope)
      if (session === null) return
      // The place the reader was listening is written down before the review starts moving it.
      bookmark()
      reviewing.current = true
      setLayer('none')
      setStepsOpen(false)
      timing.close()
      runReview(session)
    },
    [bookmark, runReview, timing],
  )

  /** Review this episode's sentences still being practised. */
  const reviewEpisode = useCallback((): void => {
    if (episode === null) return
    beginReview(
      episodeQueue(
        episode.id,
        episode.title,
        notes.phrases,
        segments.map((item) => item.id),
      ),
      'episode',
    )
  }, [episode, notes.phrases, segments, beginReview])

  /** Review every episode's, from the home. */
  const reviewLibrary = useCallback((): void => {
    if (reviewList.payload === null) return
    beginReview(libraryQueue(reviewList.payload), 'library')
  }, [reviewList.payload, beginReview])

  /** End the review where it is: the sentence on stage stays there. */
  const endReview = useCallback((): void => {
    reviewing.current = false
    setReview(null)
  }, [])

  const reviewItem = review === null ? null : currentItem(review)
  /** The stored index of the review item in the open episode's notes, once they are read; -1 before. */
  const reviewIndex =
    reviewItem === null || notes.episode !== reviewItem.episode
      ? -1
      : notes.phrases.findIndex((phrase) => sameKeptSentence(phrase, reviewItem.phrase))

  /** Record what happened to the item on stage and go on to the next one. */
  const answerReview = useCallback(
    (outcome: ReviewOutcome): void => {
      if (review === null || isFinished(review)) return
      if (outcome !== 'skipped' && outcome !== 'gone') {
        const phrase = notes.phrases[reviewIndex]
        // A grade needs somewhere to go: the item's episode open and its notes read.
        if (phrase === undefined) return
        notes.update(reviewIndex, withGrade(phrase, outcome))
      }
      runReview(recordOutcome(review, outcome))
    },
    [review, notes, reviewIndex, runReview],
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

  // A notice that is not the length warning goes away on its own.
  useEffect(() => {
    if (notice === null) return
    const timer = setTimeout(() => setNotice(null), NOTICE_MS)
    return () => clearTimeout(timer)
  }, [notice])
  // So does the one about the microphone, which the store keeps until it has been said.
  useEffect(() => {
    if (micNotice === null) return
    const timer = setTimeout(() => useMediaPlayer.getState().clearMicNotice(), NOTICE_MS)
    return () => clearTimeout(timer)
  }, [micNotice])

  /**
   * The blind-watch step's timer started or stopped (the step tracker says so; opening its drawer says nothing).
   *
   * Starting switches the picture to large, once, and shows the notice with 「撤销」; pausing or ticking the
   * step off puts the previous state back. Without a video that plays there is nothing to switch; a hidden
   * picture is switched like a shown one, and the video then takes over from the audio file at the same position.
   */
  const onBlindRunning = useCallback(
    (running: boolean): void => {
      const settings = useSettings.getState()
      if (!running) {
        settings.blindEnded()
        setNotice((current) => (current?.kind === 'blind' ? null : current))
        return
      }
      if (!videoPlays) return
      if (settings.blindStarted()) setNotice({ kind: 'blind', text: t('noticeBlind'), action: t('noticeUndo') })
    },
    [videoPlays, t],
  )

  // What the card in the video's place needs, and the memory of whether it was shown in full already.
  const card = cardOf(video.status, video.failedUrl)
  const firstTimeCard = useFirstTimeCard(card !== null && isInformational(card) ? JSON.stringify([segmentKey(episodeId, segmentId), card]) : null)
  // A card steps down (compact, lean, one line, gone) until the column has nothing to scroll, as the picture gives way by flex.
  useCardFit(practiceMain, card !== null && !videoPlays)

  // The length warning: a video that is longer or shorter than the audio the subtitles were timed against. The reader's
  // own file is held against the served video (or the audio file, when that was never probed) first; one that matches
  // it has the served video's own warning, if it has one.
  const mismatchKey = segmentKey(episodeId, segmentId)
  const mismatch = source.picture ? (local.url === null ? null : local.mismatch) ?? video.status?.mismatch ?? null : null
  const mismatchNotice: VideoNoticeData | null =
    mismatch === null || mismatchKey === null || dismissedMismatch.has(mismatchKey)
      ? null
      : {
          kind: 'mismatch',
          text: t(mismatch > 0 ? 'noticeMismatch' : 'noticeMismatchShorter', { seconds: String(Math.abs(mismatch)) }),
          action: t('cardGotIt'),
        }
  // The blind-watch notice goes when the reader changes the picture by hand: there is nothing left to undo.
  // 「视频准备好了」 is about the served video, which does not play while the reader's own file does.
  const liveNotice =
    notice === null ||
    (notice.kind === 'blind' && pictureRestore === null) ||
    (notice.kind === 'ready' && local.url !== null)
      ? null
      : notice
  // A microphone that could not be used, or a take the browser would not play, comes before the rest: the reader has just acted on it.
  const micData: VideoNoticeData | null =
    micNotice === null ? null : { kind: 'warn', text: t(MIC_NOTICE_KEYS[micNotice]), action: t('cardGotIt') }
  const shownNotice = micData ?? liveNotice ?? mismatchNotice
  const onNoticeAction = (): void => {
    if (shownNotice === null) return
    if (shownNotice === micData) {
      useMediaPlayer.getState().clearMicNotice()
    } else if (shownNotice.kind === 'blind') {
      useSettings.getState().setPicture(pictureRestore ?? 'shown')
      setNotice(null)
    } else if (shownNotice.kind === 'mismatch' && mismatchKey !== null) {
      setDismissedMismatch(new Set(dismissedMismatch).add(mismatchKey))
    } else {
      setNotice(null)
    }
  }

  // The end of a segment that is not the last offers the next segment; only the last segment (or
  // an episode without segments) says the episode is done, and offers the next episode.
  const followingSegment = nextSegment(segments, segmentId)
  // The card's counts are the segment's own: it is the unit that was just listened to.
  const segmentPhrases = useMemo(
    () =>
      segmentId === null
        ? notes.phrases
        : notes.phrases.filter((phrase) => (phrase.segment ?? segments[0]?.id) === segmentId),
    [notes.phrases, segmentId, segments],
  )

  // The end-of-episode card: shown once per time the audio ends, until it is answered.
  const finishOpen = view === 'practice' && finished && finishCount > dismissedFinish && cues.length > 0 && review === null

  /**
   * Do what a key (or a headset button) decided; which key decides what is `lib/keymap.ts`. The two actions that
   * need the key event itself, the strip's own keys and the menu's Escape, are answered by the key handler.
   */
  const perform = useCallback(
    (action: KeyAction): void => {
      const store = useMediaPlayer.getState
      switch (action.type) {
        case 'close-settings':
          setSettingsOpen(false)
          return
        case 'close-timing':
          timing.close()
          return
        case 'end-review':
          endReview()
          return
        case 'dismiss-finish':
          setDismissedFinish(finishCount)
          return
        case 'close-layer':
          setLayer('none')
          return
        case 'close-steps':
          setStepsOpen(false)
          return
        case 'clear-ab':
          store().clearAB()
          return
        case 'review-grade':
          answerReview(action.grade)
          return
        case 'stage-grade':
          gradeStage(action.grade)
          return
        case 'review-skip':
          answerReview('skipped')
          return
        case 'review-back':
          if (review !== null) runReview(stepBack(review))
          return
        case 'toggle-play':
          togglePlayback()
          return
        case 'step':
          setSelection(null)
          store().stepCue(action.delta)
          return
        case 'select':
          setSelection(action.index)
          return
        case 'play-index':
          if (cues[action.index] !== undefined) {
            setSelection(null)
            store().seekCue(action.index)
            store().setPlaying(true)
          }
          return
        case 'toggle-loop':
          if (store().loopMode === 'sentence') store().setLoopMode('none')
          else store().loopSentence(action.index)
          return
        case 'keep':
          keep(action.index ?? undefined)
          return
        case 'toggle-column':
          setColumn(column === 'kept' ? 'transcript' : 'kept')
          return
        case 'cycle-zh':
          setZhMode(nextZhMode(zhMode))
          return
        case 'reveal':
          store().reveal(store().activeIndex)
          return
        case 'compare-take':
          // Plays the sentence and then the reader's take of it; a sentence with no take has nothing to play, and the key is spent on it anyway.
          primeTakeAudio()
          store().compareTake()
          return
        case 'cycle-picture':
          useSettings.getState().cyclePicture()
          return
        case 'mark-a':
          if (store().pointA === null) store().setPoint('a')
          else store().clearAB()
          return
        case 'mark-b':
          store().setPoint('b')
          return
        case 'retime':
          openTiming()
          return
        case 'speed':
          store().cycleSpeed(action.delta)
          return
        case 'close-menu':
        case 'timing-key':
          return
      }
    },
    [answerReview, column, cues, endReview, finishCount, gradeStage, keep, openTiming, review, runReview, setZhMode, timing, zhMode],
  )

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      let action = keyAction(pressOf(event), {
        view,
        settingsOpen,
        timingOpen: timing.session !== null,
        reviewing: review !== null,
        reviewFinished: review !== null && isFinished(review),
        finishOpen,
        layerOpen: layer !== 'none',
        stepsOpen,
        hasVideo: hasVideoFile,
        selection,
        activeIndex: useMediaPlayer.getState().activeIndex,
        cueCount: cues.length,
      })
      // The 「更多」 menu is the topmost thing there is, and one press closes one thing: it must not also clear the
      // A-B marks its own buttons set.
      if (action?.type === 'close-menu') {
        if (controlBar.current?.closeMenu() === true) {
          stopKey(event)
          return
        }
        action = action.otherwise
      }
      if (action === null) return
      if (action.type === 'timing-key') {
        if (timing.handleKey(event)) stopKey(event)
        return
      }
      // Handled keys stop here. The conversation lives in the same document, and a space bar that scrolls or submits
      // behind the panel is a stolen keystroke.
      stopKey(event)
      const lit = flashOf(action)
      if (lit !== null) flash(lit)
      perform(action)
    },
    [cues.length, finishOpen, flash, hasVideoFile, layer, perform, review, selection, settingsOpen, stepsOpen, timing, view],
  )

  // A headset's previous and next buttons, and the lock screen's, do what the arrow keys do: the sentence before or after,
  // or, while a review runs, the queue (`←` goes back, `→` skips). A finished review is a dialog the keys leave alone, and
  // so does the headset. Anything else a key does (a layer open, the settings drawer) is about focus, which a headset has
  // none of, so those do not apply: the mapping is the keymap's, asked with those flags off.
  const stepFromHeadset = useCallback(
    (delta: number): void => {
      const action = headsetAction(delta, { reviewing: review !== null, reviewFinished: review !== null && isFinished(review) })
      if (action !== null) perform(action)
    },
    [review, perform],
  )
  const headsetSteps = useMemo(
    () => ({ onPrevious: () => stepFromHeadset(-1), onNext: () => stepFromHeadset(1) }),
    [stepFromHeadset],
  )
  const albumName = t('appTitle')
  const episodeName = episode?.title ?? ''
  const segmentName = segment === null ? null : segmentLabel(segment)
  const lockScreen = useMemo(
    () =>
      sessionMetadata({
        index: activeIndex,
        total: cues.length,
        episode: episodeName,
        segment: segmentName,
        album: albumName,
        sentence: (n, total) => t('cueOf', { n, total }),
      }),
    [activeIndex, cues.length, episodeName, segmentName, albumName, t],
  )
  useMediaSession(view === 'practice', headsetSteps, lockScreen)

  // Something to play or to read: a video-only segment that is not prepared has its subtitles and no sound yet.
  const hasAudio = library.media !== null
  const canPlay = source.url !== null
  /** Large hides the sentence, because the picture is what is being watched; it only applies while a picture plays. */
  const stageHidden = picture === 'large' && source.picture
  const pictureControl: PictureControl | null = hasVideoFile
    ? { mode: picture, onCycle: () => useSettings.getState().cyclePicture() }
    : null
  const subtitleControl: SubtitleControl | null =
    episode === null
      ? null
      : { episode: episode.id, segment: segmentId, state: (segment ?? episode).subtitleChoice, onSaved: onSubtitlesSaved }
  // The selection is an index into the cue list, and the list changes under it when
  // the episode does; clamping here is cheaper than resetting it from an effect.
  const selectedIndex =
    selection === null ? activeIndex : Math.min(Math.max(0, selection), Math.max(0, cues.length - 1))
  const stageCue = cues[activeIndex]
  const stageLines = stageCue === undefined ? null : splitCue(stageCue)
  const keptNow =
    stageCue !== undefined &&
    stageLines !== null &&
    notes.has({ at: stageCue.start, text: stageLines.english, segment: segmentId ?? undefined })
  // Shadowing hides the English of the sentence being repeated until it has been heard, and a
  // review hides it until the reader asks for it: saying it from what was heard comes first.
  const reviewOn = review !== null && !isFinished(review)
  const masked = (shadow || reviewOn) && stageCue !== undefined && revealed !== activeIndex
  const practising = segmentPhrases.filter((phrase) => !phrase.done).length
  const reviewSegment = reviewItem?.phrase.segment === undefined ? null : findSegment(segments, reviewItem.phrase.segment)
  const switcher = (
    <Segmented
      label={t('columnLabel')}
      value={column}
      onChange={setColumn}
      options={[
        { id: 'transcript', label: t('transcript'), count: cues.length },
        { id: 'kept', label: t('columnKept'), count: notes.phrases.length },
      ]}
    />
  )
  /** The icon at the right end of both top bars; it opens the settings and closes the five steps. */
  const settingsButton = (
    <button
      type="button"
      className={`dsh-lingualab-icon-btn${settingsOpen ? ' is-on' : ''}`}
      onClick={() => {
        setStepsOpen(false)
        setLayer('none')
        setSettingsOpen(!settingsOpen)
      }}
      title={t('settingsOpen')}
      aria-label={t('settingsOpen')}
      aria-expanded={settingsOpen}
    >
      <SettingsIcon size={16} />
    </button>
  )
  return (
    <div
      className="dsh-lingualab-page"
      style={themeStyle}
      data-ll-stage-size={stageSize}
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
        if (isTypingTarget(event.target)) return
        containerRef.current?.focus({ preventScroll: true })
        // A press on a button would then move the focus onto the button, after this handler: the browser does
        // it as the default of the mouse-down. From there a button that goes away when it is pressed (the peek
        // and reveal buttons) drops the focus to the document, outside this container, and the space bar is
        // dead until the next click; one that stays would have the page and the button fight over the space
        // bar. Cancelling the default keeps the focus here; the click itself still happens.
        if (holdsMouseFocus(event.target)) event.preventDefault()
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
            {settingsButton}
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
            review={reviewList.payload}
            onReview={reviewLibrary}
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
              {segment !== null || (cues.length > 0 && stageCue !== undefined) ? (
                <span className="dsh-lingualab-top-sub">
                  {[
                    segment === null ? null : segmentLabel(segment),
                    cues.length > 0 && stageCue !== undefined ? t('cueOf', { n: activeIndex + 1, total: cues.length }) : null,
                  ]
                    .filter((part) => part !== null)
                    .join(' · ')}
                </span>
              ) : null}
            </div>
            {segments.length > 0 ? (
              <SegmentPicker
                t={t}
                segments={segments}
                currentId={segmentId}
                finished={finishedIds}
                open={layer === 'segments'}
                onToggle={() => {
                  setStepsOpen(false)
                  setSettingsOpen(false)
                  if (layer !== 'segments') setProgress(readAllProgress())
                  setLayer(layer === 'segments' ? 'none' : 'segments')
                }}
                onClose={() => setLayer('none')}
                onSelect={(id) => {
                  if (id === segmentId) setLayer('none')
                  else openSegment(id)
                }}
              />
            ) : null}
            <span className="dsh-lingualab-spacer" />
            <button
              type="button"
              className={`dsh-lingualab-chip${column === 'kept' ? ' is-on' : ''}`}
              onClick={() => setColumn(column === 'kept' ? 'transcript' : 'kept')}
              title={t('keyColumn')}
              aria-pressed={column === 'kept'}
            >
              <NoteIcon size={13} /> {t('notesChip')} {notes.phrases.length > 0 ? notes.phrases.length : ''}{' '}
              <kbd>N</kbd>
            </button>
            {episode !== null ? (
              <StepTracker
                key={episode.id}
                t={t}
                episode={episode.id}
                open={stepsOpen}
                onToggle={() => {
                  setLayer('none')
                  setSettingsOpen(false)
                  setStepsOpen(!stepsOpen)
                }}
                onBlindRunning={onBlindRunning}
              />
            ) : null}
            {settingsButton}
          </div>

          <div className="dsh-lingualab-body">
            <div
              className={`dsh-lingualab-practice${timingPresence.mounted ? ' is-timing' : ''}${pictureFits ? '' : ' is-picture-squeezed'}`}
            >
              {shownNotice === null ? null : <VideoNotice notice={shownNotice} onAction={onNoticeAction} />}
              {review !== null && reviewOn && reviewItem !== null ? (
                <ReviewStrip
                  t={t}
                  position={review.at + 1}
                  total={review.items.length}
                  source={reviewSegment === null ? reviewItem.title : `${reviewItem.title} · ${segmentLabel(reviewSegment)}`}
                  ready={reviewIndex >= 0}
                  onGrade={answerReview}
                  onSkip={() => answerReview('skipped')}
                  onBack={() => runReview(stepBack(review))}
                  onExit={endReview}
                />
              ) : null}
              <div className="dsh-lingualab-practice-main" ref={setPracticeMain}>
                <VideoStage
                  t={t}
                  mediaRef={binding.attach}
                  picture={picture}
                  playing={videoPlays}
                  status={video.status}
                  card={card}
                  cardOpen={firstTimeCard.open}
                  hasAudioFile={audioFile !== null}
                  busy={video.busy}
                  eta={video.eta}
                  caption={picture === 'large' && source.picture && revealed === activeIndex && stageLines !== null ? stageLines.english : null}
                  onPeek={() => useMediaPlayer.getState().reveal(useMediaPlayer.getState().activeIndex)}
                  onPrepare={video.prepare}
                  onCancel={video.cancel}
                  onCardShow={firstTimeCard.show}
                  onCardHide={firstTimeCard.hide}
                  onShowPicture={() => useSettings.getState().setPicture('shown')}
                  local={
                    hasVideoFile
                      ? {
                          name: local.name,
                          remembered: local.remembered,
                          canPick: local.canRemember,
                          onPick: local.pick,
                          onFile: local.use,
                          onResume: local.resume,
                          onForget: local.forget,
                          onStop: local.stop,
                        }
                      : null
                  }
                />
                {stageHidden ? null : (
                  <Stage
                    t={t}
                    cues={cues}
                    activeIndex={activeIndex}
                    zhMode={zhMode}
                    masked={masked}
                    onReveal={() => useMediaPlayer.getState().reveal(useMediaPlayer.getState().activeIndex)}
                    onToggleWord={toggleWord}
                    hasWord={(word) => noteHasWord(stagePhrase?.phrase?.note ?? '', word)}
                    loading={library.cuesLoading}
                    hasAudio={hasAudio}
                    onRetime={() => (timing.session === null ? openTiming() : timing.close())}
                    retiming={timing.session !== null}
                  />
                )}
                <TimingStrip
                  t={t}
                  editor={timing}
                  mounted={timingPresence.mounted}
                  shown={timingPresence.shown}
                  blocked={
                    timingBlocked ??
                    (timing.session !== null && (timing.session.cue.origin === undefined || library.tracks.english === null)
                      ? t('timingNoSource')
                      : null)
                  }
                />
              </div>
              <div className="dsh-lingualab-deck">
                <ControlBar
                  ref={controlBar}
                  t={t}
                  zhMode={zhMode}
                  onZhMode={setZhMode}
                  kept={keptNow}
                  onToggleKeep={() => keep()}
                  onRetime={openTiming}
                  picture={pictureControl}
                  subtitles={subtitleControl}
                  disabled={!canPlay || cues.length === 0}
                />
                <KeyHints t={t} flash={flashed} active={focused} video={hasVideoFile} compare={hasTake} />
              </div>
              {library.error !== null && cues.length === 0 && hasAudio ? (
                <div className="dsh-lingualab-error" style={{ textAlign: 'center' }}>
                  {t('subtitleFailed')}{' '}
                  <button type="button" className="dsh-lingualab-btn" onClick={library.reload}>
                    {t('retry')}
                  </button>
                </div>
              ) : null}
              {review !== null && !reviewOn ? (
                <ReviewFinish
                  t={t}
                  tally={tallyReview(review)}
                  onAgain={() => {
                    const again = retryNotYet(review)
                    if (again === null) endReview()
                    else runReview(again)
                  }}
                  onExit={endReview}
                />
              ) : null}
              {finishOpen ? (
                <FinishCard
                  t={t}
                  title={followingSegment !== null && segment !== null ? segmentLabel(segment) : (episode?.title ?? '')}
                  scope={followingSegment === null ? 'episode' : 'segment'}
                  sentences={cues.length}
                  kept={segmentPhrases.length}
                  practising={practising}
                  nextTitle={followingSegment === null ? (nextEpisode?.title ?? null) : followingSegment.title}
                  onAgain={() => {
                    setDismissedFinish(finishCount)
                    useMediaPlayer.getState().seek(0)
                    useMediaPlayer.getState().setPlaying(true)
                  }}
                  onNext={() => {
                    setDismissedFinish(finishCount)
                    if (followingSegment !== null) openSegment(followingSegment.id)
                    else if (nextEpisode !== null) openEpisode(nextEpisode.id)
                  }}
                  onHome={() => {
                    setDismissedFinish(finishCount)
                    goHome()
                  }}
                  onClose={() => setDismissedFinish(finishCount)}
                />
              ) : null}
            </div>

            {column === 'kept' ? (
              <NotesPanel
                t={t}
                notes={notes}
                segments={segments}
                switcher={switcher}
                currentIndex={stagePhrase?.index ?? null}
                onReplay={(phrase) => {
                  // Another sentence ends the edit, as a click on a subtitle line does.
                  timing.close()
                  replayPhrase(phrase)
                }}
                onReview={reviewEpisode}
                reviewing={review !== null}
              />
            ) : (
            <SubtitlePanel
              t={t}
              switcher={switcher}
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
                // Another sentence ends the edit: the strip belongs to the one it was opened on.
                timing.close()
                useMediaPlayer.getState().seekCue(index)
                useMediaPlayer.getState().setPlaying(true)
              }}
              onKeep={(index) => keep(index)}
            />
            )}
          </div>

          {scrim.mounted ? (
            <div
              className={`dsh-lingualab-scrim${stepsOpen ? '' : ' is-leaving'}`}
              onClick={() => setStepsOpen(false)}
            />
          ) : null}
        </>
      )}
      {settingsScrim.mounted ? (
        <div
          className={`dsh-lingualab-scrim${settingsOpen ? '' : ' is-leaving'}`}
          onClick={() => setSettingsOpen(false)}
        />
      ) : null}
      <SettingsPanel t={t} open={settingsOpen} onClose={() => setSettingsOpen(false)} />
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
