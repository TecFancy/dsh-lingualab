/**
 * The picture's slot above the sentence: the video when one plays, the card that says why it does not, and the
 * small controls for the reader's own file.
 *
 * `VideoStage` draws all of it; this hands it what the page's video hooks know, and answers its three presses that
 * reach into the stores (the peek in the large state, the chip that brings a hidden picture back).
 */
import type { Translate } from '../../../context.ts'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import { useSettings } from '../../../features/settings/index.ts'
import { VideoStage } from '../../../widgets/video-stage/index.ts'
import type { PictureSlot } from './practice-props.ts'

export interface PracticePictureProps {
  readonly t: Translate
  readonly slot: PictureSlot
  /** The English of the sentence peeked at in the large state, or `null`. */
  readonly caption: string | null
}

export function PracticePicture({ t, slot, caption }: PracticePictureProps) {
  const { picture, mediaRef, videoPlays, video, local, card, firstTimeCard, hasVideoFile, audioFile } = slot
  return (
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
      caption={caption}
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
  )
}
