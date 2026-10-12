/**
 * The video's place on the stage: the picture, or the card that says why there is none.
 *
 * One `<video>` element plays everything (see the media-player feature), and it lives here, inside the
 * practice view, so the page can put it where the picture goes. It is always rendered, because it is
 * also what plays an audio file; when there is no picture to show it is simply not displayed, and the
 * stage underneath looks as it always did.
 *
 * What the slot shows follows two things: the reader's choice of picture state and what the video is.
 *
 *   · **Playing a picture.** *Shown* puts it above the sentence at a modest size; *large* gives it the
 *     whole stage (the page hides the sentence then, for the blind-watch step), with a button and the
 *     `R` key to peek at the English of the current sentence as a caption that folds away when the next
 *     sentence starts; *hidden* shows only a small chip saying the sound still comes from the video.
 *   · **Not playing one.** A card in the same place says what is needed: prepare it, wait for it, install
 *     ffmpeg, or that only the sound can be had or that nothing can. The cards that only inform are shown in
 *     full the first time and then as a small label that opens them again; hiding the picture hides the
 *     cards too, leaving that label.
 *
 * The notice bar at the top of the practice view is also drawn here, since it speaks about the same things.
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { useMediaPlayer } from '../../../features/media-player/index.ts'
import type { Picture } from '../../../features/settings/index.ts'
import { isInformational, type CardKind } from '../../../features/video/index.ts'
import { returnFocusToPage } from '../../../shared/lib/focus.ts'
import { formatBytes, formatClock } from '../../../shared/lib/format.ts'
import { CheckIcon, TimerIcon, VideoIcon, WarnIcon } from '../../../shared/ui/icons.tsx'
import type { VideoStatusPayload } from '../../../shared/protocol.ts'
import type { Translate } from '../../../context.ts'
import { ratioOf, ratioValue } from '../lib/ratio.ts'

/** How long "copied" stays on the copy button. */
const COPIED_MS = 1400

/** Audio codecs a browser plays, so the card knows whether the sound or only the box is the trouble. */
const BROWSER_AUDIO = ['aac', 'opus', 'mp3']

export interface VideoStageProps {
  readonly t: Translate
  /** The `ref` of the one media element. */
  readonly mediaRef: (element: HTMLVideoElement | null) => void
  /** The reader's choice. */
  readonly picture: Picture
  /** The element is playing a source with a picture. */
  readonly playing: boolean
  readonly status: VideoStatusPayload | null
  /** The card the status needs, if any. */
  readonly card: CardKind | null
  /** For a card that only informs: whether it is open in full. */
  readonly cardOpen: boolean
  /** Whether the segment has an audio file of its own, which changes what the cards promise. */
  readonly hasAudioFile: boolean
  /** A start or a cancel is on its way to the host. */
  readonly busy: boolean
  /** Seconds a running job has left, when it can be guessed. */
  readonly eta: number | null
  /** The English of the sentence peeked at in the large state, or `null`. */
  readonly caption: string | null
  readonly onPeek: () => void
  readonly onPrepare: (mode: 'video' | 'sound') => void
  readonly onCancel: () => void
  readonly onCardShow: () => void
  readonly onCardHide: () => void
  /** Leave the hidden state, from the small label. */
  readonly onShowPicture: () => void
}

/** A codec name as it is written on a card: `hevc` becomes `HEVC`. */
function codecName(codec: string | null): string {
  return codec === null ? '?' : codec.toUpperCase()
}

/** The slot. */
export function VideoStage({
  t,
  mediaRef,
  picture,
  playing,
  status,
  card,
  cardOpen,
  hasAudioFile,
  busy,
  eta,
  caption,
  onPeek,
  onPrepare,
  onCancel,
  onCardShow,
  onCardHide,
  onShowPicture,
}: VideoStageProps) {
  const time = useMediaPlayer((state) => state.currentTime)

  // The picture's real shape, for the large state's frame. The element is the page's (it plays the audio
  // files too), so it is kept in state to have somewhere to listen: `loadedmetadata` comes with every new
  // source, and `resize` when the picture's size changes under the same one.
  const [element, setElement] = useState<HTMLVideoElement | null>(null)
  const [ratio, setRatio] = useState<number | null>(null)
  const attach = useCallback(
    (next: HTMLVideoElement | null) => {
      setElement(next)
      mediaRef(next)
    },
    [mediaRef],
  )
  useEffect(() => {
    if (element === null) return
    let live = true
    const read = (): void => {
      if (live) setRatio(ratioOf(element.videoWidth, element.videoHeight))
    }
    element.addEventListener('loadedmetadata', read)
    element.addEventListener('resize', read)
    // Metadata that came in before this effect ran is not announced again.
    if (element.readyState >= 1) queueMicrotask(read)
    return () => {
      live = false
      element.removeEventListener('loadedmetadata', read)
      element.removeEventListener('resize', read)
    }
  }, [element])

  // Large only means something while a picture plays; without one the card keeps the usual size.
  const mode = picture === 'hidden' ? 'hidden' : picture === 'large' && playing ? 'large' : 'shown'
  const showScreen = playing && mode !== 'hidden'
  const fullCard = card !== null && !playing && mode !== 'hidden' && (!isInformational(card) || cardOpen)
  const chip = playing && mode === 'hidden'
  // The label that opens the full card again (or the picture, from the hidden state).
  const label = card === null || playing || fullCard ? null : isInformational(card) ? 'unplayable' : 'prepare'
  const empty = !showScreen && !fullCard && !chip && label === null

  return (
    <div className={`dsh-lingualab-videostage is-${empty ? 'empty' : mode}`}>
      {chip ? (
        <div className="dsh-lingualab-videochip">
          <VideoIcon size={13} off />
          {t('pictureHiddenChip')}
          <kbd>V</kbd>
        </div>
      ) : null}
      {label !== null ? (
        <button
          type="button"
          className="dsh-lingualab-videochip is-button"
          onClick={() => {
            if (mode === 'hidden') onShowPicture()
            if (card !== null && isInformational(card)) onCardShow()
          }}
        >
          <VideoIcon size={13} off={label === 'unplayable'} />
          {label === 'unplayable' ? t('videoLabelUnplayable') : t('videoLabelPrepare')}
        </button>
      ) : null}

      <div
        className={`dsh-lingualab-picture${showScreen ? '' : ' is-off'}`}
        // Only the large frame follows the picture's shape; the other states keep 16:9.
        style={mode === 'large' ? ({ '--ll-video-ratio': ratioValue(ratio) } as CSSProperties) : undefined}
      >
        <video ref={attach} className="dsh-lingualab-video" playsInline preload="metadata" />
        {showScreen ? (
          <>
            {mode === 'shown' ? <span className="dsh-lingualab-picture-time">{formatClock(time)}</span> : null}
            {mode === 'large' ? <span className="dsh-lingualab-picture-badge">{t('pictureLargeBadge')}</span> : null}
            {mode === 'large' && caption !== null ? (
              <div className="dsh-lingualab-picture-caption">{caption}</div>
            ) : null}
            {mode === 'large' && caption === null ? (
              <button
                type="button"
                className="dsh-lingualab-picture-peek"
                onClick={(event) => {
                  // The button is replaced by the caption it asks for. Pressed by the keyboard it has the focus,
                  // and the document would get it: the page takes it first, so the keys go on working.
                  returnFocusToPage(event.currentTarget)
                  onPeek()
                }}
              >
                <kbd>R</kbd> {t('peekSentence')}
              </button>
            ) : null}
          </>
        ) : null}
      </div>

      {fullCard && card !== null && status !== null ? (
        <Card
          t={t}
          kind={card}
          status={status}
          hasAudioFile={hasAudioFile}
          busy={busy}
          eta={eta}
          onPrepare={onPrepare}
          onCancel={onCancel}
          onHide={onCardHide}
        />
      ) : null}
    </div>
  )
}

interface CardProps {
  readonly t: Translate
  readonly kind: CardKind
  readonly status: VideoStatusPayload
  readonly hasAudioFile: boolean
  readonly busy: boolean
  readonly eta: number | null
  readonly onPrepare: (mode: 'video' | 'sound') => void
  readonly onCancel: () => void
  readonly onHide: () => void
}

/** One card, drawn the size of the picture it stands in for. */
function Card({ t, kind, status, hasAudioFile, busy, eta, onPrepare, onCancel, onHide }: CardProps) {
  const file = [status.file, formatBytes(status.bytes)].filter((part) => part !== null && part.length > 0).join(' · ')
  // A refusal from the host (another job is running, say) is shown on the card it came back to.
  const refusal = !status.ok && status.reason !== null && kind !== 'failed' ? status.reason : null

  if (kind === 'preparing') {
    const progress = status.progress
    const fraction = progress === null ? 0 : progress.fraction
    return (
      <section className="dsh-lingualab-videocard" role="status" aria-live="polite">
        <div className="dsh-lingualab-videocard-title">{t('cardPreparingTitle')}</div>
        <div className="dsh-lingualab-videocard-sub">{t('cardPreparingSub')}</div>
        <div className="dsh-lingualab-bar is-thick" aria-hidden>
          <div className="dsh-lingualab-bar-fill" style={{ width: `${String(Math.round(fraction * 100))}%` }} />
        </div>
        <div className="dsh-lingualab-videocard-row">
          <span>
            {t('cardPreparingPercent', {
              percent: Math.round(fraction * 100),
              done: formatClock(progress?.seconds ?? 0),
              total: formatClock(progress?.total ?? 0),
            })}
          </span>
          {eta === null ? null : <span>{t('cardPreparingEta', { seconds: eta })}</span>}
        </div>
        <p className="dsh-lingualab-videocard-body">
          {hasAudioFile ? t('cardPreparingBody') : t('cardPreparingBodyNoAudio')}
        </p>
        <span className="dsh-lingualab-spacer" />
        <button type="button" className="dsh-lingualab-btn" onClick={onCancel} disabled={busy}>
          {t('cardCancel')}
        </button>
      </section>
    )
  }

  if (kind === 'no-ffmpeg') {
    return <NoFfmpegCard t={t} command={status.installCommand ?? ''} hasAudioFile={hasAudioFile} />
  }

  const soundOnlyLine = t('cardSoundCodec', { codec: codecName(status.videoCodec) })
  return (
    <section className="dsh-lingualab-videocard">
      <span className={`dsh-lingualab-videocard-icon${kind === 'prepare' ? '' : ' is-quiet'}`}>
        {kind === 'failed' ? <WarnIcon size={18} /> : <VideoIcon size={18} off={kind !== 'prepare'} />}
      </span>
      {kind === 'prepare' ? (
        <>
          <div className="dsh-lingualab-videocard-title">{t('cardPrepareTitle')}</div>
          <div className="dsh-lingualab-videocard-sub is-mono">{file}</div>
          <p className="dsh-lingualab-videocard-body">
            {status.audioCodec !== null && !BROWSER_AUDIO.includes(status.audioCodec)
              ? t('cardPrepareAudio', { codec: codecName(status.audioCodec) })
              : t('cardPrepareContainer')}{' '}
            {status.estimateBytes === null ? '' : t('cardPrepareSize', { size: formatBytes(status.estimateBytes) })}
          </p>
          {refusal === null ? null : <div className="dsh-lingualab-error">{refusal}</div>}
          <span className="dsh-lingualab-spacer" />
          <button type="button" className="dsh-lingualab-btn is-primary" onClick={() => onPrepare('video')} disabled={busy}>
            {t('cardPrepareAction')}
          </button>
          <div className="dsh-lingualab-videocard-note">
            {hasAudioFile ? t('cardPrepareNote') : t('cardPrepareNoteNoAudio')}
          </div>
        </>
      ) : null}
      {kind === 'sound-only' ? (
        <>
          <div className="dsh-lingualab-videocard-title">{t('cardSoundTitle')}</div>
          <div className="dsh-lingualab-videocard-sub is-mono">{soundOnlyLine}</div>
          <p className="dsh-lingualab-videocard-body">{t('cardSoundBody')}</p>
          <div className="dsh-lingualab-videocard-sub">{t('cardSoundNote')}</div>
          {refusal === null ? null : <div className="dsh-lingualab-error">{refusal}</div>}
          <span className="dsh-lingualab-spacer" />
          <div className="dsh-lingualab-actions">
            <button type="button" className="dsh-lingualab-btn is-primary" onClick={() => onPrepare('sound')} disabled={busy}>
              {t('cardSoundAction')}
            </button>
            <button type="button" className="dsh-lingualab-btn is-ghost" onClick={onHide}>
              {t('cardGotIt')}
            </button>
          </div>
        </>
      ) : null}
      {kind === 'sound-ready' ? (
        <>
          <div className="dsh-lingualab-videocard-title">{t('cardSoundTitle')}</div>
          <div className="dsh-lingualab-videocard-sub is-mono">{file}</div>
          <p className="dsh-lingualab-videocard-body">{t('cardSoundReadyBody')}</p>
          <span className="dsh-lingualab-spacer" />
          <button type="button" className="dsh-lingualab-btn" onClick={onHide}>
            {t('cardGotIt')}
          </button>
        </>
      ) : null}
      {kind === 'unplayable' ? (
        <>
          <div className="dsh-lingualab-videocard-title">{t('cardUnplayableTitle')}</div>
          <div className="dsh-lingualab-videocard-sub is-mono">{file}</div>
          <p className="dsh-lingualab-videocard-body">
            {status.videoCodec !== null && status.state === 'unplayable'
              ? t('cardUnplayableCodec', { codec: codecName(status.videoCodec) })
              : (status.reason ?? t('cardUnplayableBrowser'))}{' '}
            {hasAudioFile ? t('cardUnplayableAudio') : ''}
          </p>
          <span className="dsh-lingualab-spacer" />
          <button type="button" className="dsh-lingualab-btn" onClick={onHide}>
            {t('cardGotIt')}
          </button>
        </>
      ) : null}
      {kind === 'failed' ? (
        <>
          <div className="dsh-lingualab-videocard-title">{t('cardFailedTitle')}</div>
          <div className="dsh-lingualab-videocard-sub is-mono">{file}</div>
          <p className="dsh-lingualab-videocard-body is-mono">{status.reason ?? ''}</p>
          <span className="dsh-lingualab-spacer" />
          <button type="button" className="dsh-lingualab-btn is-primary" onClick={() => onPrepare('video')} disabled={busy}>
            {t('cardRetry')}
          </button>
        </>
      ) : null}
    </section>
  )
}

/** The card for a host with no ffmpeg: what to run, a button to copy it, and where the path can be set. */
function NoFfmpegCard({ t, command, hasAudioFile }: { readonly t: Translate; readonly command: string; readonly hasAudioFile: boolean }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
    },
    [],
  )
  const copy = (): void => {
    void navigator.clipboard.writeText(command).then(
      () => {
        setCopied(true)
        if (timer.current !== null) clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), COPIED_MS)
      },
      () => undefined,
    )
  }
  return (
    <section className="dsh-lingualab-videocard">
      <span className="dsh-lingualab-videocard-icon is-warn">
        <WarnIcon size={18} />
      </span>
      <div className="dsh-lingualab-videocard-title">{t('cardFfmpegTitle')}</div>
      <p className="dsh-lingualab-videocard-body">{t('cardFfmpegBody')}</p>
      <div className="dsh-lingualab-videocard-code">
        <code>{command}</code>
        <button type="button" className="dsh-lingualab-btn is-small" onClick={copy}>
          {copied ? <CheckIcon size={12} /> : null}
          {copied ? t('cardCopied') : t('cardCopy')}
        </button>
      </div>
      <div className="dsh-lingualab-videocard-sub">{t('cardFfmpegPath', { field: 'ffmpegPath' })}</div>
      <span className="dsh-lingualab-spacer" />
      {hasAudioFile ? <div className="dsh-lingualab-videocard-note">{t('cardFfmpegNote')}</div> : null}
    </section>
  )
}

/** What the notice bar says. */
export interface VideoNoticeData {
  readonly kind: 'ready' | 'mismatch' | 'blind'
  readonly text: string
  /** The action button (「知道了」, 「撤销」), if the notice has one. */
  readonly action: string | null
}

export interface VideoNoticeProps {
  readonly notice: VideoNoticeData
  readonly onAction: () => void
}

/** The bar at the top of the practice view: the video is ready, the lengths differ, the blind watch started. */
export function VideoNotice({ notice, onAction }: VideoNoticeProps) {
  return (
    <div className={`dsh-lingualab-notice is-${notice.kind}`} role="status">
      {notice.kind === 'ready' ? <CheckIcon size={16} /> : notice.kind === 'blind' ? <TimerIcon size={16} /> : <WarnIcon size={16} />}
      <span className="dsh-lingualab-notice-text">{notice.text}</span>
      {notice.action === null ? null : (
        <button type="button" className="dsh-lingualab-notice-action" onClick={onAction}>
          {notice.action}
        </button>
      )}
    </div>
  )
}
