/**
 * Which notice the stage shows, and what its button does, apart from React.
 *
 * Four things can ask for the one slot above the stage: a microphone that could not be used, a message the page itself
 * raised (the video is ready, the reader's file could not play, the blind watch started), the length warning of a video
 * that is longer or shorter than the audio, and nothing. They have a fixed order and each has a condition under which it
 * is stale, which is the part that was easy to get wrong while it sat in the middle of the page; the hook in
 * `useVideoNotices.ts` holds the state and the timers, and these are the rules, as plain functions.
 */
import type { MicNotice } from '../../../features/media-player/index.ts'
import type { Picture } from '../../../features/settings/index.ts'
import type { Translate } from '../../../context.ts'
import type { VideoNoticeData } from '../../../widgets/video-stage/index.ts'

/** The dictionary key of what each microphone problem says. */
export const MIC_NOTICE_KEYS: Readonly<Record<MicNotice, string>> = {
  unsupported: 'micUnsupported',
  denied: 'micDenied',
  unavailable: 'micUnavailable',
  blocked: 'micBlocked',
}

/** Where the notice on show came from; its button depends on it. */
export type NoticeSource = 'mic' | 'raised' | 'mismatch'

/** What the stage shows, and where it came from. */
export interface ChosenNotice {
  readonly notice: VideoNoticeData
  readonly source: NoticeSource
}

/**
 * How far the video's length is from the audio's, in seconds (positive: longer), or `null` for no warning.
 *
 * Only while a picture plays. The reader's own file is held against the served video (or the audio file, when that was
 * never probed) first; one that matches it has the served video's own warning, if it has one.
 * @param localUrl - the reader's own file in use, or `null`.
 * @param localMismatch - how that file's length differs, when it does.
 * @param servedMismatch - how the served video's length differs, when it does.
 */
export function mismatchOf(
  sourcePicture: boolean,
  localUrl: string | null,
  localMismatch: number | null,
  servedMismatch: number | null | undefined,
): number | null {
  if (!sourcePicture) return null
  return (localUrl === null ? null : localMismatch) ?? servedMismatch ?? null
}

/** The length warning, unless it was dismissed for this segment (it stays until it is, and is not shown twice). */
export function mismatchNoticeOf(
  mismatch: number | null,
  key: string | null,
  dismissed: ReadonlySet<string>,
  t: Translate,
): VideoNoticeData | null {
  if (mismatch === null || key === null || dismissed.has(key)) return null
  return {
    kind: 'mismatch',
    text: t(mismatch > 0 ? 'noticeMismatch' : 'noticeMismatchShorter', { seconds: String(Math.abs(mismatch)) }),
    action: t('cardGotIt'),
  }
}

/**
 * A notice the page raised, unless it has gone stale.
 *
 * The blind-watch notice goes when the reader changes the picture by hand (`pictureRestore` is cleared then): there is
 * nothing left to undo. 「视频准备好了」 is about the served video, which does not play while the reader's own file does.
 */
export function raisedNoticeOf(
  notice: VideoNoticeData | null,
  pictureRestore: Picture | null,
  localPlays: boolean,
): VideoNoticeData | null {
  if (notice === null) return null
  if (notice.kind === 'blind' && pictureRestore === null) return null
  if (notice.kind === 'ready' && localPlays) return null
  return notice
}

/** What a microphone problem says, as a notice; `null` when there is none. */
export function micNoticeOf(micNotice: MicNotice | null, t: Translate): VideoNoticeData | null {
  return micNotice === null ? null : { kind: 'warn', text: t(MIC_NOTICE_KEYS[micNotice]), action: t('cardGotIt') }
}

/**
 * The notice to show, by priority: a microphone that could not be used, or a take the browser would not play, comes
 * first, because the reader has just acted on it; then what the page raised; then the length warning.
 */
export function chooseNotice(
  mic: VideoNoticeData | null,
  raised: VideoNoticeData | null,
  mismatch: VideoNoticeData | null,
): ChosenNotice | null {
  if (mic !== null) return { notice: mic, source: 'mic' }
  if (raised !== null) return { notice: raised, source: 'raised' }
  if (mismatch !== null) return { notice: mismatch, source: 'mismatch' }
  return null
}

/** What pressing the notice's button does. */
export type NoticeAction =
  /** Tell the store the microphone problem has been said. */
  | 'clear-mic'
  /** Put the picture back to what it was before the blind watch, and drop the notice. */
  | 'restore-picture'
  /** Dismiss the length warning for this segment. */
  | 'dismiss-mismatch'
  /** Drop the notice. */
  | 'clear'

/**
 * What the button of the notice on show does.
 * @param mismatchKey - the segment the length warning is about, `null` when there is no such segment.
 */
export function noticeActionOf(chosen: ChosenNotice, mismatchKey: string | null): NoticeAction {
  if (chosen.source === 'mic') return 'clear-mic'
  if (chosen.notice.kind === 'blind') return 'restore-picture'
  if (chosen.notice.kind === 'mismatch' && mismatchKey !== null) return 'dismiss-mismatch'
  return 'clear'
}
