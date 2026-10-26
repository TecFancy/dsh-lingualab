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
 * Keyboard handling is on the page container rather than on `window`. The earlier standalone app bound
 * its shortcuts globally and therefore owned the space bar, the arrow keys and the
 * bracket keys wherever it was open; inside a panel that shares a page with a
 * conversation, that is a hostile neighbour. The handler sits on the page container,
 * which is focusable, so the keys work while the panel has focus and stop at its edge.
 *
 * What this file is: the page's state, the wiring between features that may not import each other, and the composition
 * of the two views. The work is in the hooks and views beside it, one per concern, each with its tests where there is
 * logic: `lib/keymap.ts` and `useKeyboard.ts` (the keys), `useResume.ts`, `useOpening.ts` and `useReplay.ts` (where listening
 * resumes, and everything that opens or replays something), `useReviewRun.ts` (a review), `useStageNotes.ts` (keeping and grading the
 * sentence on stage), `useRetime.ts` (the timing strip), `useVideoSource.ts` and `useVideoNotices.ts` (what plays and
 * what is said about it), and `HomeView.tsx` and `PracticeView.tsx` (what is drawn). New logic goes there, not here.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import { useImport } from '../../../features/import-media/index.ts'
import { useLibraryConfig } from '../../../features/library-config/index.ts'
import { useUpdate, versionLabel } from '../../../features/update/index.ts'
import { hasMedia, segmentLabel, useLibrary } from '../../../features/library/index.ts'
import {
  primeTakeAudio,
  sessionMetadata,
  useMediaPlayer,
  useMediaSession,
} from '../../../features/media-player/index.ts'
import { useNotes } from '../../../features/notes/index.ts'
import { finishedSegments } from '../../../features/resume/index.ts'
import { useReviewList } from '../../../features/review/index.ts'
import { resolveThemeVars, useHostDark, useSettings } from '../../../features/settings/index.ts'
import { cardOf, isInformational, segmentKey, useFirstTimeCard } from '../../../features/video/index.ts'
import { holdsMouseFocus } from '../../../shared/lib/focus.ts'
import { STYLES } from '../../../shared/lib/styles.ts'
import { usePresence } from '../../../shared/lib/usePresence.ts'
import type { ControlBarHandle, PictureControl, SubtitleControl } from '../../../widgets/control-bar/index.ts'
import { EpisodePicker } from '../../../widgets/episode-picker/index.ts'
import { MediaFolderPanel } from '../../../widgets/media-folder/index.ts'
import { SETTINGS_EXIT_MS, SettingsPanel } from '../../../widgets/settings-panel/index.ts'
import { STEPS_EXIT_MS } from '../../../widgets/step-tracker/index.ts'
import type { VideoNoticeData } from '../../../widgets/video-stage/index.ts'
import type { PanelProps, Translate } from '../../../context.ts'
import { useCardFit } from '../lib/useCardFit.ts'
import type { Layer, View } from '../lib/panel.ts'
import { usePictureRoom } from '../lib/usePictureRoom.ts'
import { useOpening } from '../lib/useOpening.ts'
import { useResume } from '../lib/useResume.ts'
import { isTypingTarget, useKeyboard } from '../lib/useKeyboard.ts'
import { useRetime } from '../lib/useRetime.ts'
import { useReplay } from '../lib/useReplay.ts'
import { useReviewRun } from '../lib/useReviewRun.ts'
import { useSideColumn } from '../lib/useSideColumn.ts'
import { useStageNotes } from '../lib/useStageNotes.ts'
import { useVideoNotices } from '../lib/useVideoNotices.ts'
import { useVideoSource } from '../lib/useVideoSource.ts'
import { HomeView } from './HomeView.tsx'
import { PracticeView } from './PracticeView.tsx'
import { SettingsButton } from './SettingsButton.tsx'

/** The set of finished segments of an episode that has none. One value, so the memo below stays stable. */
const NO_FINISHED: ReadonlySet<string> = new Set()

export interface LinguaLabPageProps extends PanelProps {
  readonly t: Translate
}

/** The panel's centre-column page. */
export function LinguaLabPage({ back, t }: LinguaLabPageProps) {
  const library = useLibrary()
  const folder = useLibraryConfig()
  const update = useUpdate()
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
  // The right column: which view, and whether it is collapsed (the stored choice, or the row's width until one is).
  const side = useSideColumn()
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
  const [dismissedFinish, setDismissedFinish] = useState(0)
  const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null)
  const controlBar = useRef<ControlBarHandle>(null)

  const activeIndex = useMediaPlayer((state) => state.activeIndex)
  const finished = useMediaPlayer((state) => state.finished)
  const finishCount = useMediaPlayer((state) => state.finishCount)
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
  const [notice, setNotice] = useState<VideoNoticeData | null>(null)
  const { video, local, source, videoPlays, binding } = useVideoSource({ t, library, hasVideoFile, picture, setNotice })

  // Feature-to-feature wiring is the page's job: the library feature may not reach into
  // the player, so loading a new cue list resets the player here.
  const reset = useMediaPlayer((state) => state.reset)
  useEffect(() => {
    reset(cues)
  }, [cues, reset])

  // Where the listening is: a resume armed by whatever opens something, applied once the player can take the seek, and
  // the position written down as it plays. After the reset effect above, which zeroes the position it then restores.
  const resume = useResume({
    view,
    episodeId,
    segmentId,
    element: binding.element,
    cues,
    media: library.media,
    sourceUrl: source.url,
    finishCount,
    reviewing,
  })
  const { progress, bookmark, refreshProgress } = resume

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

  /** The segments of this episode that are finished, which the segment list marks. */
  const finishedIds = useMemo(
    () => (episode === null || segments.length === 0 ? NO_FINISHED : finishedSegments(progress, episode)),
    [progress, episode, segments],
  )

  const { stagePhrase, notedIndexes, keep, toggleWord, gradeStage } = useStageNotes({
    notes,
    cues,
    activeIndex,
    segmentId,
    onProtected: side.showKept,
  })

  /** The episodes that can be played, in library order; "next" is the one after the open one. */
  const playable = useMemo(
    () => [...(library.payload?.episodes ?? []), ...(library.payload?.files ?? [])].filter(hasMedia),
    [library.payload],
  )
  const nextEpisode = useMemo(() => {
    const at = playable.findIndex((entry) => entry.id === library.episode?.id)
    return at >= 0 ? (playable[at + 1] ?? null) : null
  }, [playable, library.episode])

  const clearOverlays = useCallback((): void => {
    setLayer('none')
    setStepsOpen(false)
    setSelection(null)
  }, [])
  const {
    timing,
    presence: timingPresence,
    blocked: timingBlocked,
    open: openTiming,
    onSubtitlesSaved,
  } = useRetime({ t, library, notes, cues, activeIndex, resume, clearOverlays })
  // Whether the picture that plays above the sentence has the room it needs, with the timing panel open or not. The
  // scroller is in state, not a ref, so the measuring starts when the practice view puts it on the page.
  const [practiceMain, setPracticeMain] = useState<HTMLDivElement | null>(null)
  const pictureFits = usePictureRoom(practiceMain, videoPlays && picture === 'shown')

  const opening = useOpening({ library, resume, setView, setLayer, setSelection })
  const { openEpisode, openFile, openSegment } = opening
  const { replayPhrase, goToItem } = useReplay({ library, cues, resume, opening, setView, setSelection })

  /** Close what is over the practice view, because a review takes it over. */
  const closeReviewLayers = useCallback((): void => {
    setLayer('none')
    setStepsOpen(false)
    timing.close()
  }, [timing])
  const reviewRun = useReviewRun({
    episode,
    segments,
    notes,
    libraryReview: reviewList.payload,
    goToItem,
    reviewing,
    bookmark,
    closeLayers: closeReviewLayers,
  })
  const { review, reviewEpisode, reviewLibrary, endReview } = reviewRun

  /** Go home: save the position first, then refresh what the home shows about it. */
  const goHome = useCallback(() => {
    bookmark()
    endReview()
    // A grade given a moment ago may still be waiting for its write; the home's review count is
    // read again once it has landed, so it does not show the sentence just graded.
    void notes.flush().then(reviewList.reload)
    useMediaPlayer.getState().setPlaying(false)
    // The takes belong to the episode that was open: going home closes it.
    useMediaPlayer.getState().dropTakes()
    refreshProgress()
    setLayer('none')
    setStepsOpen(false)
    setView('home')
  }, [bookmark, endReview, notes, reviewList.reload, refreshProgress])

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

  const notices = useVideoNotices({
    t,
    notice,
    setNotice,
    episodeId,
    segmentId,
    sourcePicture: source.picture,
    videoPlays,
    local,
    servedMismatch: video.status?.mismatch,
  })

  // What the card in the video's place needs, and the memory of whether it was shown in full already.
  const card = cardOf(video.status, video.failedUrl)
  const firstTimeCard = useFirstTimeCard(card !== null && isInformational(card) ? JSON.stringify([segmentKey(episodeId, segmentId), card]) : null)
  // A card steps down (compact, lean, one line, gone) until the column has nothing to scroll, as the picture gives way by flex.
  useCardFit(practiceMain, card !== null && !videoPlays)

  // The end-of-episode card: shown once per time the audio ends, until it is answered.
  const finishOpen = view === 'practice' && finished && finishCount > dismissedFinish && cues.length > 0 && review === null

  const dismissFinish = useCallback((): void => setDismissedFinish(finishCount), [finishCount])
  const { onKeyDown, headsetSteps, flashed } = useKeyboard({
    view,
    layer,
    setLayer,
    settingsOpen,
    setSettingsOpen,
    stepsOpen,
    setStepsOpen,
    side,
    zhMode,
    setZhMode,
    selection,
    setSelection,
    cues,
    hasVideoFile,
    finishOpen,
    dismissFinish,
    review: reviewRun,
    timing,
    openTiming,
    keep,
    gradeStage,
    controlBar,
  })
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

  const canPlay = source.url !== null
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
  /** The icon at the right end of both top bars; it opens the settings and closes the five steps. */
  const settings = (
    <SettingsButton
      t={t}
      open={settingsOpen}
      onToggle={() => {
        setStepsOpen(false)
        setLayer('none')
        setSettingsOpen(!settingsOpen)
      }}
    />
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
        <HomeView
          t={t}
          back={back}
          library={library}
          importer={importer}
          progress={progress}
          steps={resume.steps}
          review={reviewList.payload}
          settings={settings}
          onOpen={openEpisode}
          onFiles={importFiles}
          onBrowse={() => setLayer('browse')}
          onFolder={() => setLayer('folder')}
          onReview={reviewLibrary}
          version={versionLabel(folder.payload?.plugin ?? null)}
          update={update.status}
          onUpdateRetry={update.refresh}
        />
      ) : (
        <PracticeView
          topBar={{
            t,
            episode,
            segment,
            segments,
            finishedIds,
            segmentsOpen: layer === 'segments',
            sentence: cues[activeIndex] === undefined ? null : { index: activeIndex, total: cues.length },
            side,
            keptCount: notes.phrases.length,
            stepsOpen,
            settings,
            onHome: goHome,
            onToggleSegments: () => {
              setStepsOpen(false)
              setSettingsOpen(false)
              if (layer !== 'segments') refreshProgress()
              setLayer(layer === 'segments' ? 'none' : 'segments')
            },
            onCloseSegments: () => setLayer('none'),
            onSelectSegment: (id) => {
              if (id === segmentId) setLayer('none')
              else openSegment(id)
            },
            onToggleSteps: () => {
              setLayer('none')
              setSettingsOpen(false)
              setStepsOpen(!stepsOpen)
            },
            onBlindRunning: notices.onBlindRunning,
          }}
          stage={{
            t,
            library,
            notes,
            review: reviewRun,
            activeIndex,
            zhMode,
            onZhMode: setZhMode,
            stagePhrase,
            onToggleWord: toggleWord,
            picture: {
              picture,
              mediaRef: binding.attach,
              videoPlays,
              sourcePicture: source.picture,
              video,
              local,
              card,
              firstTimeCard,
              hasVideoFile,
              audioFile,
            },
            pictureFits,
            timing: { editor: timing, blocked: timingBlocked, presence: timingPresence, onRetime: openTiming },
            deck: {
              canPlay,
              pictureControl,
              subtitleControl,
              onToggleKeep: () => keep(),
              flashed,
              focused,
            },
            controlBar,
            finish: {
              open: finishOpen,
              nextEpisode,
              onDismiss: dismissFinish,
              onOpenSegment: openSegment,
              onOpenEpisode: openEpisode,
              onHome: goHome,
            },
            notice: notices.shown,
            onNoticeAction: notices.onAction,
            onMain: setPracticeMain,
          }}
          side={{
            t,
            library,
            notes,
            column: side.column,
            onColumn: side.setColumn,
            activeIndex,
            selectedIndex,
            zhMode,
            notedIndexes,
            follow,
            onFollow: setFollow,
            stagePhrase,
            reviewing: review !== null,
            onSelect: setSelection,
            onPlay: (index) => {
              if (cues[index] === undefined) return
              setSelection(null)
              // Another sentence ends the edit: the strip belongs to the one it was opened on.
              timing.close()
              useMediaPlayer.getState().seekCue(index)
              useMediaPlayer.getState().setPlaying(true)
            },
            onKeep: (index) => keep(index),
            onReplay: (phrase) => {
              // Another sentence ends the edit, as a click on a subtitle line does.
              timing.close()
              replayPhrase(phrase)
            },
            onReview: reviewEpisode,
          }}
          row={side.row}
          scrim={{ mounted: scrim.mounted, open: stepsOpen, onClose: () => setStepsOpen(false) }}
        />
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
          onOpenFile={openFile}
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
