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
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react'
import { DEFAULT_SUBTITLE_ZH_MODE, splitCue, type Cue, type SubtitleZhMode } from '../../../entities/cue/index.ts'
import { useImport } from '../../../features/import-media/index.ts'
import { useLibraryConfig } from '../../../features/library-config/index.ts'
import { findSegment, nextSegment, segmentLabel, useLibrary } from '../../../features/library/index.ts'
import { useAudioBinding, useMediaPlayer } from '../../../features/media-player/index.ts'
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
import { gradeForKey } from '../../../shared/lib/grades.ts'
import { keptSentenceKey, sameKeptSentence, withGrade, type GivenGrade } from '../../../shared/notes-format.ts'
import { segmentProgress } from '../../../shared/progress.ts'
import type { EpisodeEntry, NotePhrase } from '../../../shared/protocol.ts'
import { STYLES } from '../../../shared/lib/styles.ts'
import { BackIcon, NoteIcon } from '../../../shared/ui/icons.tsx'
import { Segmented } from '../../../shared/ui/Segmented.tsx'
import { ControlBar, nextZhMode, type ControlBarHandle } from '../../../widgets/control-bar/index.ts'
import { EpisodePicker } from '../../../widgets/episode-picker/index.ts'
import { LibraryHome } from '../../../widgets/library-home/index.ts'
import { MediaFolderPanel } from '../../../widgets/media-folder/index.ts'
import { FinishCard, KeyHints, Stage } from '../../../widgets/practice-stage/index.ts'
import { NotesPanel } from '../../../widgets/notes-panel/index.ts'
import { ReviewFinish, ReviewStrip } from '../../../widgets/review-strip/index.ts'
import { SegmentPicker } from '../../../widgets/segment-picker/index.ts'
import { StepTracker } from '../../../widgets/step-tracker/index.ts'
import { SubtitlePanel } from '../../../widgets/subtitle-panel/index.ts'
import { TimingStrip, useTimingEditor, type SavedTiming } from '../../../widgets/timing-editor/index.ts'
import type { PanelProps, Translate } from '../../../context.ts'

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
    const audio = audioRef.current
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
  }, [audioRef, cues, cuesReady, media])

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

  const episode = library.episode
  const episodeId = episode?.id ?? null
  const segments = library.segments
  const segment = library.segment
  const segmentId = segment?.id ?? null
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
    () => [...(library.payload?.episodes ?? []), ...(library.payload?.files ?? [])].filter((entry) => entry.audio !== null),
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

  const timing = useTimingEditor({
    cues,
    tracks: library.tracks,
    episodeId,
    blocked: timingBlocked,
    onSaved: onTimingSaved,
    onStale: onTimingStale,
  })

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
        // The 「更多」 menu is the topmost thing there is, and one press closes one thing: it
        // must not also clear the A-B marks its own buttons set.
        if (controlBar.current?.closeMenu() === true) {
          handled()
        } else if (timing.session !== null) {
          handled()
          timing.close()
        } else if (review !== null) {
          handled()
          endReview()
        } else if (finishOpen) {
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
      // The timing strip owns the keyboard while it is open: the arrows move an edge, not the sentence.
      if (timing.session !== null) {
        if (timing.handleKey(event)) handled()
        return
      }
      // A layer owns the keyboard while it is open: its own fields and buttons are the
      // only things a keystroke should reach.
      if (layer !== 'none') return
      // So does the finish card: it is a dialog over the stage with its next action focused,
      // and Enter there means that button, not "play the selected sentence" behind it. The card
      // at the end of a review is the same kind of dialog.
      if (finishOpen || (review !== null && isFinished(review))) return

      // A grade goes to the review item while a review runs, and to the kept sentence on stage
      // otherwise. The arrows move through the queue instead of through the sentences.
      const grade = gradeForKey(event.key)
      if (grade !== null) {
        handled()
        if (review !== null) answerReview(grade)
        else gradeStage(grade)
        return
      }
      if (review !== null && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
        handled()
        flash('arrows')
        if (event.key === 'ArrowRight') answerReview('skipped')
        else runReview(stepBack(review))
        return
      }

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
            store().seekCue(current)
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
          handled()
          flash('s')
          keep(selection ?? undefined)
          return
        case 'n':
        case 'N':
          handled()
          setColumn(column === 'kept' ? 'transcript' : 'kept')
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
        case 't':
        case 'T':
          handled()
          openTiming()
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
    [
      answerReview,
      column,
      cues,
      endReview,
      finishCount,
      finishOpen,
      flash,
      gradeStage,
      keep,
      layer,
      openTiming,
      review,
      runReview,
      selection,
      stepsOpen,
      timing,
      view,
      zhMode,
    ],
  )

  const hasAudio = library.media !== null
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
                  setStepsOpen(!stepsOpen)
                }}
              />
            ) : null}
          </div>

          <div className="dsh-lingualab-body">
            <div className="dsh-lingualab-practice">
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
              <TimingStrip
                t={t}
                editor={timing}
                blocked={
                  timingBlocked ??
                  (timing.session !== null && (timing.session.cue.origin === undefined || library.tracks.english === null)
                    ? t('timingNoSource')
                    : null)
                }
              />
              <div className="dsh-lingualab-deck">
                <ControlBar
                  ref={controlBar}
                  t={t}
                  zhMode={zhMode}
                  onZhMode={setZhMode}
                  kept={keptNow}
                  onToggleKeep={() => keep()}
                  onRetime={openTiming}
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

          {stepsOpen ? <div className="dsh-lingualab-scrim" onClick={() => setStepsOpen(false)} /> : null}
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
