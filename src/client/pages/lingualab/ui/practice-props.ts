/**
 * What the parts of the practice view's left pane are handed, grouped by the part that uses them.
 *
 * The pane draws the objects the page's hooks return, plus a few values the page works out; these are the groups, so
 * that a part takes one prop for what is its own and the pane forwards it as it is.
 */
import type { Picture } from '../../../features/settings/index.ts'
import type { CardKind, FirstTimeCard, LocalVideo, VideoState } from '../../../features/video/index.ts'
import type { Presence } from '../../../shared/lib/usePresence.ts'
import type { EpisodeEntry } from '../../../shared/protocol.ts'
import type { PictureControl, SubtitleControl } from '../../../widgets/control-bar/index.ts'
import type { TimingEditor } from '../../../widgets/timing-editor/index.ts'

/** The picture's slot above the sentence. */
export interface PictureSlot {
  /** The reader's choice of how the picture is shown. */
  readonly picture: Picture
  /** The `ref` of the one media element. */
  readonly mediaRef: (element: HTMLVideoElement | null) => void
  /** The segment has a video that plays (or would, with the picture not hidden). */
  readonly videoPlays: boolean
  /** What plays now is a picture, not the audio file alone. */
  readonly sourcePicture: boolean
  /** What the host says about the video and the jobs preparing it. */
  readonly video: VideoState
  /** The reader's own file, played in place of the served one. */
  readonly local: LocalVideo
  /** The card the status needs, if any, and the memory of whether it was shown in full. */
  readonly card: CardKind | null
  readonly firstTimeCard: FirstTimeCard
  /** What is open has a video file. */
  readonly hasVideoFile: boolean
  /** The audio file of what is open, `null` for a video-only segment. */
  readonly audioFile: string | null
}

/** The timing strip under the sentence. */
export interface TimingSlot {
  readonly editor: TimingEditor
  /** Why a save is not possible here, already translated, or `null`. */
  readonly blocked: string | null
  /** How long the panel stays on the page (see `useRetime`). */
  readonly presence: Presence
  /** Open the strip for the sentence on stage. */
  readonly onRetime: () => void
}

/** The transport and the key caps under the stage. */
export interface DeckSlot {
  readonly canPlay: boolean
  readonly pictureControl: PictureControl | null
  readonly subtitleControl: SubtitleControl | null
  /** The star: keep or un-keep the sentence on stage. */
  readonly onToggleKeep: () => void
  /** The key cap to light, and whether the page has the keyboard. */
  readonly flashed: string | null
  readonly focused: boolean
}

/** The end-of-episode card. */
export interface FinishSlot {
  readonly open: boolean
  /** The episode that follows the open one, which the card offers at the end of the last segment. */
  readonly nextEpisode: EpisodeEntry | null
  readonly onDismiss: () => void
  readonly onOpenSegment: (id: string) => void
  readonly onOpenEpisode: (id: string) => void
  readonly onHome: () => void
}
