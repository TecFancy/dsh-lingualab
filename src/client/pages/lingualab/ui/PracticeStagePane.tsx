/**
 * The practice view's left pane: the picture, the sentence on stage, the transport, and what sits over them (the
 * length warning, the review's strip and summary, the end-of-episode card).
 *
 * It is the part of the page that draws, with nothing of its own to remember: the page owns the player, the notes, the
 * timing session and the review, and hands them in as the objects their hooks return, so a press here calls what the
 * page already had. What it works out for itself is only what the pane alone shows: which words are masked, the
 * caption of a peek, whether the sentence is kept, and what the finish card counts.
 */
import { useMemo } from 'react'
import type { Ref } from 'react'
import { splitCue, type SubtitleZhMode } from '../../../entities/cue/index.ts'
import type { Translate } from '../../../context.ts'
import { findSegment, nextSegment, segmentLabel, type LibraryState } from '../../../features/library/index.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { noteHasWord, type NotesState } from '../../../features/notes/index.ts'
import { retryNotYet, stepBack, tallyReview } from '../../../features/review/index.ts'
import { useSettings, type Picture } from '../../../features/settings/index.ts'
import type { CardKind, FirstTimeCard, LocalVideo, VideoState } from '../../../features/video/index.ts'
import type { Presence } from '../../../shared/lib/usePresence.ts'
import type { EpisodeEntry } from '../../../shared/protocol.ts'
import {
  ControlBar,
  type ControlBarHandle,
  type PictureControl,
  type SubtitleControl,
} from '../../../widgets/control-bar/index.ts'
import { FinishCard, KeyHints, Stage } from '../../../widgets/practice-stage/index.ts'
import { ReviewFinish, ReviewStrip } from '../../../widgets/review-strip/index.ts'
import { TimingStrip, type TimingEditor } from '../../../widgets/timing-editor/index.ts'
import { VideoNotice, VideoStage, type VideoNoticeData } from '../../../widgets/video-stage/index.ts'
import type { StagePhrase } from '../lib/panel.ts'
import type { ReviewRun } from '../lib/useReviewRun.ts'

export interface PracticeStagePaneProps {
  readonly t: Translate
  readonly library: LibraryState
  readonly notes: NotesState
  readonly review: ReviewRun
  /** The sentence on stage. */
  readonly activeIndex: number
  readonly zhMode: SubtitleZhMode
  readonly onZhMode: (mode: SubtitleZhMode) => void
  /** The kept phrase of the sentence on stage, when it is kept. */
  readonly stagePhrase: StagePhrase | null
  readonly onToggleWord: (word: string) => void
  /** The star: keep or un-keep the sentence on stage. */
  readonly onToggleKeep: () => void

  // The picture.
  /** The reader's choice of how the picture is shown. */
  readonly picture: Picture
  /** The `ref` of the one media element. */
  readonly mediaRef: (element: HTMLVideoElement | null) => void
  /** The segment has a video that plays (or would, with the picture not hidden). */
  readonly videoPlays: boolean
  /** What plays now is a picture, not the audio file alone. */
  readonly sourcePicture: boolean
  readonly video: VideoState
  readonly local: LocalVideo
  readonly card: CardKind | null
  readonly firstTimeCard: FirstTimeCard
  /** What is open has a video file. */
  readonly hasVideoFile: boolean
  /** The audio file of what is open, `null` for a video-only segment. */
  readonly audioFile: string | null
  /** The picture has the room it needs above the sentence. */
  readonly pictureFits: boolean
  /** The notice over the stage, or `null`. */
  readonly notice: VideoNoticeData | null
  readonly onNoticeAction: () => void
  /** The scroller's ref callback, which the page measures the picture's room against. */
  readonly onMain: (element: HTMLDivElement | null) => void

  // The timing strip.
  readonly timing: TimingEditor
  /** Why a save is not possible here, already translated, or `null`. */
  readonly timingBlocked: string | null
  readonly timingPresence: Presence
  /** Open the strip for the sentence on stage. */
  readonly onRetime: () => void

  // The transport and the key caps.
  readonly controlBar: Ref<ControlBarHandle>
  readonly canPlay: boolean
  readonly pictureControl: PictureControl | null
  readonly subtitleControl: SubtitleControl | null
  /** The key cap to light, and whether the page has the keyboard. */
  readonly flashed: string | null
  readonly focused: boolean

  // The end of the audio.
  /** The end-of-episode card is up. */
  readonly finishOpen: boolean
  /** The episode that follows the open one, which the card offers at the end of the last segment. */
  readonly nextEpisode: EpisodeEntry | null
  readonly onDismissFinish: () => void
  readonly onOpenSegment: (id: string) => void
  readonly onOpenEpisode: (id: string) => void
  readonly onHome: () => void
}

export function PracticeStagePane({
  t,
  library,
  notes,
  review,
  activeIndex,
  zhMode,
  onZhMode,
  stagePhrase,
  onToggleWord,
  onToggleKeep,
  picture,
  mediaRef,
  videoPlays,
  sourcePicture,
  video,
  local,
  card,
  firstTimeCard,
  hasVideoFile,
  audioFile,
  pictureFits,
  notice,
  onNoticeAction,
  onMain,
  timing,
  timingBlocked,
  timingPresence,
  onRetime,
  controlBar,
  canPlay,
  pictureControl,
  subtitleControl,
  flashed,
  focused,
  finishOpen,
  nextEpisode,
  onDismissFinish,
  onOpenSegment,
  onOpenEpisode,
  onHome,
}: PracticeStagePaneProps) {
  const cues = library.cues
  const segments = library.segments
  const segment = library.segment
  const segmentId = segment?.id ?? null
  const episode = library.episode
  const { review: session, reviewItem, reviewIndex, reviewOn, answerReview, runReview, endReview } = review

  const revealed = useMediaPlayer((state) => state.revealed)
  /** Shadowing hides the English of the sentence being repeated until it has been heard. */
  const shadow = useMediaPlayer((state) => state.pauseAfterSentence)
  /** Whether the sentence on stage has a take of the reader's own, which the 「对比」 key plays. */
  const hasTake = useMediaPlayer((state) => state.takes[state.activeIndex] !== undefined)

  // Something to play or to read: a video-only segment that is not prepared has its subtitles and no sound yet.
  const hasAudio = library.media !== null
  const stageCue = cues[activeIndex]
  const stageLines = stageCue === undefined ? null : splitCue(stageCue)
  /** Large hides the sentence, because the picture is what is being watched; it only applies while a picture plays. */
  const stageHidden = picture === 'large' && sourcePicture
  // A review hides the English until the reader asks for it: saying it from what was heard comes first.
  const masked = (shadow || reviewOn) && stageCue !== undefined && revealed !== activeIndex
  const keptNow =
    stageCue !== undefined &&
    stageLines !== null &&
    notes.has({ at: stageCue.start, text: stageLines.english, segment: segmentId ?? undefined })
  const reviewSegment =
    reviewItem?.phrase.segment === undefined ? null : findSegment(segments, reviewItem.phrase.segment)

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
  const practising = segmentPhrases.filter((phrase) => !phrase.done).length

  return (
    <div
      className={`dsh-lingualab-practice${timingPresence.mounted ? ' is-timing' : ''}${pictureFits ? '' : ' is-picture-squeezed'}`}
    >
      {notice === null ? null : <VideoNotice notice={notice} onAction={onNoticeAction} />}
      {session !== null && reviewOn && reviewItem !== null ? (
        <ReviewStrip
          t={t}
          position={session.at + 1}
          total={session.items.length}
          source={reviewSegment === null ? reviewItem.title : `${reviewItem.title} · ${segmentLabel(reviewSegment)}`}
          ready={reviewIndex >= 0}
          onGrade={answerReview}
          onSkip={() => answerReview('skipped')}
          onBack={() => runReview(stepBack(session))}
          onExit={endReview}
        />
      ) : null}
      <div className="dsh-lingualab-practice-main" ref={onMain}>
        <VideoStage
          t={t}
          mediaRef={mediaRef}
          picture={picture}
          playing={videoPlays}
          status={video.status}
          card={card}
          cardOpen={firstTimeCard.open}
          hasAudioFile={audioFile !== null}
          busy={video.busy}
          eta={video.eta}
          caption={picture === 'large' && sourcePicture && revealed === activeIndex && stageLines !== null ? stageLines.english : null}
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
            onToggleWord={onToggleWord}
            hasWord={(word) => noteHasWord(stagePhrase?.phrase?.note ?? '', word)}
            loading={library.cuesLoading}
            hasAudio={hasAudio}
            onRetime={() => (timing.session === null ? onRetime() : timing.close())}
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
          onZhMode={onZhMode}
          kept={keptNow}
          onToggleKeep={onToggleKeep}
          onRetime={onRetime}
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
      {session !== null && !reviewOn ? (
        <ReviewFinish
          t={t}
          tally={tallyReview(session)}
          onAgain={() => {
            const again = retryNotYet(session)
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
            onDismissFinish()
            useMediaPlayer.getState().seek(0)
            useMediaPlayer.getState().setPlaying(true)
          }}
          onNext={() => {
            onDismissFinish()
            if (followingSegment !== null) onOpenSegment(followingSegment.id)
            else if (nextEpisode !== null) onOpenEpisode(nextEpisode.id)
          }}
          onHome={() => {
            onDismissFinish()
            onHome()
          }}
          onClose={onDismissFinish}
        />
      ) : null}
    </div>
  )
}
