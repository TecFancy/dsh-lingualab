/**
 * The notice above the stage: which one shows, how long it stays, and what its button does.
 *
 * The notices raised by the page (the video is ready, the file could not play) and by the player (a microphone problem)
 * end differently: some go away on their own, the length warning stays until it is dismissed, and the blind-watch
 * notice carries an undo. Which one shows and what its button does is `notices.ts`'s; this hook holds what that needs
 * (the dismissed segments, the timers) and the blind watch's start and stop, which is the one place the page changes
 * the picture on the reader's behalf.
 */
import { useCallback, useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Translate } from '../../../context.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { useSettings } from '../../../features/settings/index.ts'
import { segmentKey, type LocalVideo } from '../../../features/video/index.ts'
import type { VideoNoticeData } from '../../../widgets/video-stage/index.ts'
import {
  chooseNotice,
  micNoticeOf,
  mismatchNoticeOf,
  mismatchOf,
  noticeActionOf,
  raisedNoticeOf,
} from './notices.ts'

/** How long the 「视频准备好了」 and 「盲看开始计时」 notices stay; the length warning stays until it is dismissed. */
const NOTICE_MS = 7000

/** What the notices read from the page. */
export interface VideoNoticesOptions {
  readonly t: Translate
  /** The notice the page raised, and how to raise or take back one. */
  readonly notice: VideoNoticeData | null
  readonly setNotice: Dispatch<SetStateAction<VideoNoticeData | null>>
  readonly episodeId: string | null
  readonly segmentId: string | null
  /** What plays is a picture, not the audio file alone: the length warning only applies then. */
  readonly sourcePicture: boolean
  /** The segment has a video that plays (or would, with the picture not hidden). */
  readonly videoPlays: boolean
  /** The reader's own file, which is held against the video first. */
  readonly local: Pick<LocalVideo, 'url' | 'mismatch'>
  /** How the served video's length differs from the audio's, when the host knows. */
  readonly servedMismatch: number | null | undefined
}

/** What the page shows and does about the notice. */
export interface VideoNotices {
  /** The notice to show, or `null`. */
  readonly shown: VideoNoticeData | null
  /** The notice's button was pressed. */
  readonly onAction: () => void
  /**
   * The blind-watch step's timer started or stopped (the step tracker says so; opening its drawer says nothing).
   *
   * Starting switches the picture to large, once, and shows the notice with 「撤销」; pausing or ticking the
   * step off puts the previous state back. Without a video that plays there is nothing to switch; a hidden
   * picture is switched like a shown one, and the video then takes over from the audio file at the same position.
   */
  readonly onBlindRunning: (running: boolean) => void
}

/** Choose the notice above the stage and look after it. */
export function useVideoNotices({
  t,
  notice,
  setNotice,
  episodeId,
  segmentId,
  sourcePicture,
  videoPlays,
  local,
  servedMismatch,
}: VideoNoticesOptions): VideoNotices {
  const pictureRestore = useSettings((state) => state.pictureRestore)
  const micNotice = useMediaPlayer((state) => state.micNotice)
  /** The segments whose length warning was dismissed, for this visit. */
  const [dismissedMismatch, setDismissedMismatch] = useState<ReadonlySet<string>>(() => new Set())

  // A notice that is not the length warning goes away on its own.
  useEffect(() => {
    if (notice === null) return
    const timer = setTimeout(() => setNotice(null), NOTICE_MS)
    return () => clearTimeout(timer)
  }, [notice, setNotice])
  // So does the one about the microphone, which the store keeps until it has been said.
  useEffect(() => {
    if (micNotice === null) return
    const timer = setTimeout(() => useMediaPlayer.getState().clearMicNotice(), NOTICE_MS)
    return () => clearTimeout(timer)
  }, [micNotice])

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
    [videoPlays, t, setNotice],
  )

  const mismatchKey = segmentKey(episodeId, segmentId)
  const mismatch = mismatchOf(sourcePicture, local.url, local.mismatch, servedMismatch)
  const chosen = chooseNotice(
    micNoticeOf(micNotice, t),
    raisedNoticeOf(notice, pictureRestore, local.url !== null),
    mismatchNoticeOf(mismatch, mismatchKey, dismissedMismatch, t),
  )

  const onAction = (): void => {
    if (chosen === null) return
    switch (noticeActionOf(chosen, mismatchKey)) {
      case 'clear-mic':
        useMediaPlayer.getState().clearMicNotice()
        return
      case 'restore-picture':
        useSettings.getState().setPicture(pictureRestore ?? 'shown')
        setNotice(null)
        return
      case 'dismiss-mismatch':
        if (mismatchKey !== null) setDismissedMismatch(new Set(dismissedMismatch).add(mismatchKey))
        return
      case 'clear':
        setNotice(null)
        return
    }
  }

  return { shown: chosen?.notice ?? null, onAction, onBlindRunning }
}
