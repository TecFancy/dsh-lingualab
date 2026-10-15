/**
 * What plays, and in which element: the served video, the reader's own file, or the audio file, under one media element.
 *
 * Three features meet here and may not reach into each other: the video feature knows what the host prepared, the
 * local-file hook knows what the reader chose from their own disk, and the media binding drives the one element. The
 * page decides which of them is the source, and tells the reader (through a notice) when something it did not ask for
 * happened: the video is ready, the file could not be opened, the browser could not play it.
 */
import { useCallback } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { Translate } from '../../../context.ts'
import type { LibraryState } from '../../../features/library/index.ts'
import { useMediaBinding, useMediaPlayer, type MediaBinding } from '../../../features/media-player/index.ts'
import type { Picture } from '../../../features/settings/index.ts'
import {
  playSource,
  segmentKey,
  useLocalVideo,
  useVideo,
  type LocalVideo,
  type PlaySource,
  type VideoState,
} from '../../../features/video/index.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import type { VideoStatusPayload } from '../../../shared/protocol.ts'
import type { VideoNoticeData } from '../../../widgets/video-stage/index.ts'

/** What the source reads from the page. */
export interface VideoSourceOptions {
  readonly t: Translate
  readonly library: LibraryState
  /** What is open has a video file. */
  readonly hasVideoFile: boolean
  /** The reader's choice of how the picture is shown; hidden plays the audio file even when a video could. */
  readonly picture: Picture
  /** Raise a notice (or take it back, with an updater). */
  readonly setNotice: Dispatch<SetStateAction<VideoNoticeData | null>>
}

/** What plays and how. */
export interface VideoSource {
  /** What the host says about the video and the jobs preparing it. */
  readonly video: VideoState
  /** A video file the reader picked from their own disk, to play in place of the served one. */
  readonly local: LocalVideo
  /**
   * What plays: the reader's own file when they chose one, else the video once it plays, else the audio file (or
   * nothing, for a video that is not prepared). With the picture hidden the audio file plays even when a video could,
   * so the video is not downloaded; the reader showing the picture again swaps it back under the same session,
   * keeping the position.
   */
  readonly source: PlaySource
  /** Whether the segment has a video that plays, whichever of the two is the source right now. */
  readonly videoPlays: boolean
  /** The binding of the one media element. */
  readonly binding: MediaBinding
}

/** Choose what plays and bind it to the element. */
export function useVideoSource({ t, library, hasVideoFile, picture, setNotice }: VideoSourceOptions): VideoSource {
  const episodeId = library.episode?.id ?? null
  const segmentId = library.segment?.id ?? null
  const audioUrl = library.media?.audioUrl ?? null
  const refreshListing = library.refreshListing

  /** A preparing job just finished: say so, and let the listing's marks catch up. */
  const onVideoReady = useCallback(
    (ready: VideoStatusPayload): void => {
      const at = useMediaPlayer.getState().currentTime
      const text = t(ready.via === 'smooth' ? 'noticeReadySmooth' : 'noticeReady', { time: formatClock(at) })
      setNotice({ kind: 'ready', text, action: null })
      refreshListing()
    },
    [t, refreshListing, setNotice],
  )
  const video = useVideo(episodeId, segmentId, hasVideoFile, onVideoReady)

  /** A remembered local file could not be opened: not allowed, or gone. */
  const onLocalUnreadable = useCallback((): void => {
    setNotice({ kind: 'warn', text: t('noticeLocalUnreadable'), action: t('cardGotIt') })
  }, [t, setNotice])
  const local = useLocalVideo({
    key: hasVideoFile ? segmentKey(episodeId, segmentId) : null,
    status: video.status,
    audioUrl,
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
    [rejectLocal, markUndecodable, t, setNotice],
  )

  const source = playSource(audioUrl, video.status, video.failedUrl, picture === 'hidden', local.url)
  const videoPlays =
    picture === 'hidden' ? playSource(audioUrl, video.status, video.failedUrl, false, local.url).picture : source.picture
  // The one media element. A new source for the same segment (the audio, then the video that was just
  // prepared, or the file the reader chose) keeps the position; the `session` is what says it is the same segment.
  const binding = useMediaBinding(source.url, segmentKey(episodeId, segmentId), onUndecodable)

  return { video, local, source, videoPlays, binding }
}
