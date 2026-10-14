/**
 * The transport row at the bottom of the stage.
 *
 * It sits under the sentence rather than in a bar of its own, because "play this
 * sentence again" and "which sentence" are one thought. Only the controls used every
 * minute stay on the row: sentence steps, play, speed, loop-this-sentence, the
 * Chinese display, and the 「字幕」 popover that picks the files. Everything that is a setup step rather than a gesture (the A and
 * B marks, how many times an A-B loop repeats, the lead-in) lives in the 「更多」 menu, because a
 * row of thirteen controls was the reason a first-time reader did not know which one
 * to press.
 *
 * The modes are chips, not form controls: a chip says its state by being outlined,
 * which a `<select>` cannot do.
 */
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { LEAD_IN_CHOICES, SPEED_PRESETS, useMediaPlayer } from '../../../features/media-player/index.ts'
import { SUBTITLE_ZH_MODES, type SubtitleZhMode } from '../../../entities/cue/index.ts'
import type { Picture } from '../../../features/settings/index.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import { isHandPicked } from '../../../features/subtitle-choice/index.ts'
import { Scrubber } from './Scrubber.tsx'
import { SubtitleMenu, type SubtitleControl } from './SubtitleMenu.tsx'
import {
  LoopIcon,
  MicIcon,
  MoreIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  StarIcon,
  VideoIcon,
} from '../../../shared/ui/icons.tsx'
import type { Translate } from '../../../context.ts'

/** Repeat counts offered while an A-B loop is on; `0` means until stopped. */
const REPEAT_CHOICES: readonly number[] = [0, 1, 2, 3, 5]

/** The keys the page listens for, with the dictionary key that says what each does. */
const SHORTCUTS: readonly (readonly [string, string])[] = [
  ['Space', 'keyPlay'],
  ['← →', 'keySentence'],
  ['↑ ↓  Enter', 'keyBrowse'],
  ['L', 'keyLoop'],
  ['S', 'keyKeep'],
  ['1  2  3', 'keyGrade'],
  ['N', 'keyColumn'],
  ['C', 'keyChinese'],
  ['R', 'keyReveal'],
  ['V', 'keyPicture'],
  ['[  ]', 'keySpeed'],
  ['A  B', 'keyMarks'],
  ['T', 'keyTiming'],
]

/** Labels for the four Chinese display modes, in the order they are offered. */
const ZH_MODE_KEYS: Readonly<Record<SubtitleZhMode, string>> = {
  always: 'zhAlways',
  dim: 'zhDim',
  'active-only': 'zhActiveOnly',
  hidden: 'zhHidden',
}

/** The dictionary key of each picture state's name. */
const PICTURE_KEYS: Readonly<Record<Picture, string>> = {
  shown: 'pictureShown',
  large: 'pictureLarge',
  hidden: 'pictureHidden',
}

/** What the picture button needs: the state it shows, and what pressing it does. */
export interface PictureControl {
  readonly mode: Picture
  readonly onCycle: () => void
}

export interface ControlBarProps {
  readonly t: Translate
  readonly zhMode: SubtitleZhMode
  readonly onZhMode: (mode: SubtitleZhMode) => void
  /** Whether the sentence playing now is already kept. */
  readonly kept: boolean
  /** Keeps or un-keeps the sentence playing now; the page decides what that touches. */
  readonly onToggleKeep: () => void
  /** Open the strip that moves the sentence's start and end. */
  readonly onRetime: () => void
  /** The picture button, present only when the segment has a video to show. */
  readonly picture?: PictureControl | null
  /** The 「字幕」 button, present while an episode is open. */
  readonly subtitles?: SubtitleControl | null
  readonly disabled?: boolean
}

/** What the page can ask of the bar from its own key handler. */
export interface ControlBarHandle {
  /**
   * Close the 「更多」 menu or the 「字幕」 popover if one is open, and put focus back on its button.
   *
   * @returns Whether a menu was closed, so the page knows the Escape was spent on it.
   */
  readonly closeMenu: () => boolean
}

/** The row under the sentence. */
export const ControlBar = forwardRef<ControlBarHandle, ControlBarProps>(function ControlBar(
  { t, zhMode, onZhMode, kept, onToggleKeep, onRetime, picture = null, subtitles = null, disabled = false },
  handle,
) {
  const isPlaying = useMediaPlayer((state) => state.isPlaying)
  const speedIndex = useMediaPlayer((state) => state.speedIndex)
  const loopMode = useMediaPlayer((state) => state.loopMode)
  const repeats = useMediaPlayer((state) => state.repeats)
  const pointA = useMediaPlayer((state) => state.pointA)
  const pointB = useMediaPlayer((state) => state.pointB)
  const shadow = useMediaPlayer((state) => state.pauseAfterSentence)
  const leadIn = useMediaPlayer((state) => state.leadIn)

  const [menu, setMenu] = useState(false)
  const holder = useRef<HTMLSpanElement>(null)
  const moreButton = useRef<HTMLButtonElement>(null)
  // The popover remembers which episode and segment it was opened for: another one is another
  // choice, so the popover closes by itself rather than edit the wrong one.
  const subsTarget = subtitles === null ? null : JSON.stringify([subtitles.episode, subtitles.segment])
  const [subsOpenFor, setSubsOpenFor] = useState<string | null>(null)
  const subsOpen = subsOpenFor !== null && subsOpenFor === subsTarget
  const setSubsOpen = (open: boolean): void => setSubsOpenFor(open ? subsTarget : null)
  const subsHolder = useRef<HTMLSpanElement>(null)
  const subsButton = useRef<HTMLButtonElement>(null)
  const store = useMediaPlayer.getState

  // Escape belongs to the menu first: the page asks here before it spends the key on
  // anything else, so one press closes one thing. Focus goes back to the button that
  // opened it, which is where a keyboard reader expects to be.
  const closeMenu = (): boolean => {
    if (subsOpen) {
      setSubsOpen(false)
      subsButton.current?.focus({ preventScroll: true })
      return true
    }
    if (!menu) return false
    setMenu(false)
    moreButton.current?.focus({ preventScroll: true })
    return true
  }
  useImperativeHandle(handle, () => ({ closeMenu }))

  // A menu that stays open after you click elsewhere is a menu you have to close twice.
  useEffect(() => {
    if (!menu) return
    const onDown = (event: MouseEvent): void => {
      if (holder.current !== null && !holder.current.contains(event.target as Node)) setMenu(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [menu])
  useEffect(() => {
    if (!subsOpen) return
    const onDown = (event: MouseEvent): void => {
      if (subsHolder.current !== null && !subsHolder.current.contains(event.target as Node)) setSubsOpenFor(null)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [subsOpen])

  const abOn = pointA !== null || pointB !== null

  return (
    <div className="dsh-lingualab-transport">
      <Scrubber t={t} disabled={disabled} />

      <div className="dsh-lingualab-transport-row">
        <div className="dsh-lingualab-transport-side">
          <button
            type="button"
            className="dsh-lingualab-bar-btn is-speed"
            onClick={() => store().nextSpeedWrapping()}
            disabled={disabled}
            title={t('speed')}
          >
            {SPEED_PRESETS[speedIndex] ?? 1}×
          </button>
          <button
            type="button"
            className={`dsh-lingualab-bar-btn${loopMode === 'sentence' ? ' is-on' : ''}`}
            onClick={() => (loopMode === 'sentence' ? store().setLoopMode('none') : store().loopSentence())}
            disabled={disabled}
            title={t('loopSentence')}
          >
            <LoopIcon /> {t('loopShort')}
          </button>
          <button
            type="button"
            className={`dsh-lingualab-bar-btn${shadow ? ' is-on' : ''}`}
            onClick={() => store().setPauseAfterSentence(!shadow)}
            disabled={disabled}
            title={t('shadowHint')}
            aria-pressed={shadow}
          >
            <MicIcon /> {t('shadowShort')}
          </button>
        </div>

        <div className="dsh-lingualab-transport-main">
          <button
            type="button"
            className="dsh-lingualab-round"
            onClick={() => store().stepCue(-1)}
            disabled={disabled}
            title={t('prevCue')}
          >
            <PrevIcon />
          </button>
          <button
            type="button"
            className="dsh-lingualab-play"
            onClick={() => store().toggle()}
            disabled={disabled}
            title={isPlaying ? t('pause') : t('play')}
          >
            {isPlaying ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
          </button>
          <button
            type="button"
            className="dsh-lingualab-round"
            onClick={() => store().stepCue(1)}
            disabled={disabled}
            title={t('nextCue')}
          >
            <NextIcon />
          </button>
        </div>

        <div className="dsh-lingualab-transport-side is-end">
          {picture === null ? null : (
            <button
              type="button"
              className="dsh-lingualab-bar-btn is-on"
              onClick={picture.onCycle}
              title={t('pictureHint')}
            >
              <VideoIcon size={14} off={picture.mode === 'hidden'} /> {t('pictureLabel', { state: t(PICTURE_KEYS[picture.mode]) })}
            </button>
          )}
          <button
            type="button"
            className="dsh-lingualab-bar-btn"
            onClick={() => onZhMode(nextZhMode(zhMode))}
            title={t('zhMode')}
          >
            {t(ZH_MODE_KEYS[zhMode])}
          </button>
          {subtitles === null ? null : (
            <span
              className="dsh-lingualab-menu-holder"
              ref={subsHolder}
              onKeyDown={(event: ReactKeyboardEvent<HTMLSpanElement>) => {
                if (event.key !== 'Escape' || !closeMenu()) return
                event.preventDefault()
                event.stopPropagation()
              }}
            >
              <button
                ref={subsButton}
                type="button"
                className={`dsh-lingualab-bar-btn${subsOpen || isHandPicked(subtitles.state?.choice) ? ' is-on' : ''}${(subtitles.state?.missing.length ?? 0) > 0 ? ' is-warn' : ''}`}
                onClick={() => {
                  setMenu(false)
                  setSubsOpen(!subsOpen)
                }}
                title={(subtitles.state?.missing.length ?? 0) > 0 ? t('subtitleMissing') : t('subtitleChooseHint')}
                aria-expanded={subsOpen}
                aria-haspopup="dialog"
              >
                {t('subtitleChoose')}
              </button>
              {subsOpen ? <SubtitleMenu t={t} control={subtitles} onClose={() => setSubsOpen(false)} /> : null}
            </span>
          )}

          <button
            type="button"
            className={`dsh-lingualab-bar-btn is-star${kept ? ' is-on' : ''}`}
            onClick={onToggleKeep}
            disabled={disabled}
            title={kept ? t('unkeepHint') : t('keepHint')}
            aria-pressed={kept}
          >
            <StarIcon filled={kept} /> {kept ? t('kept') : t('keep')}
          </button>

      <span
        className="dsh-lingualab-menu-holder"
        ref={holder}
        // The page's handler stops at a field (the repeat select is one), so Escape has to be
        // heard from inside the menu as well, and only once: it is stopped here.
        onKeyDown={(event: ReactKeyboardEvent<HTMLSpanElement>) => {
          if (event.key !== 'Escape' || !closeMenu()) return
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <button
          ref={moreButton}
          type="button"
          className={`dsh-lingualab-bar-btn${menu || abOn ? ' is-on' : ''}`}
          onClick={() => {
            setSubsOpen(false)
            setMenu(!menu)
          }}
          disabled={disabled}
          title={t('more')}
          aria-expanded={menu}
        >
          <MoreIcon />
        </button>
        {menu ? (
          <div className="dsh-lingualab-menu" role="menu">
            <div className="dsh-lingualab-menu-title">{t('loopAb')}</div>
            <div className="dsh-lingualab-actions">
              <button
                type="button"
                className={`dsh-lingualab-btn${pointA !== null ? ' is-on' : ''}`}
                onClick={() => (pointA === null ? store().setPoint('a') : store().clearAB())}
                title={pointA === null ? t('setA') : t('clearAb')}
              >
                {pointA === null ? t('setA') : `A ${formatClock(pointA)}`}
              </button>
              <button
                type="button"
                className={`dsh-lingualab-btn${pointB !== null ? ' is-on' : ''}`}
                onClick={() => store().setPoint('b')}
                disabled={pointA === null}
                title={t('setB')}
              >
                {pointB === null ? t('setB') : `B ${formatClock(pointB)}`}
              </button>
              {abOn ? (
                <button type="button" className="dsh-lingualab-btn" onClick={() => store().clearAB()}>
                  {t('clearAb')}
                </button>
              ) : null}
            </div>
            {loopMode === 'ab' ? (
              <label className="dsh-lingualab-menu-row">
                <span>{t('repeatTimes')}</span>
                <select
                  className="dsh-lingualab-bar-btn"
                  value={String(repeats)}
                  onChange={(event) => store().setRepeats(Number(event.target.value))}
                >
                  {REPEAT_CHOICES.map((count) => (
                    <option key={count} value={count}>
                      {count === 0 ? '∞' : `×${count}`}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="dsh-lingualab-menu-row" title={t('leadInHint')}>
              <span>{t('leadIn')}</span>
              <select
                className="dsh-lingualab-bar-btn"
                value={String(leadIn)}
                onChange={(event) => store().setLeadIn(Number(event.target.value))}
              >
                {LEAD_IN_CHOICES.map((seconds) => (
                  <option key={seconds} value={seconds}>
                    {seconds === 0 ? t('leadInOff') : `${String(seconds)} s`}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="dsh-lingualab-btn"
              onClick={() => {
                setMenu(false)
                onRetime()
              }}
            >
              {t('keyTiming')} <kbd>T</kbd>
            </button>
            <dl className="dsh-lingualab-menu-keys">
              {SHORTCUTS.map(([keys, label]) => (
                <div key={keys} style={{ display: 'contents' }}>
                  <dt>{keys}</dt>
                  <dd>{t(label)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </span>
        </div>
      </div>
    </div>
  )
})

/** The next Chinese mode in the cycle: the chip shows one name and means "the next one". */
export function nextZhMode(mode: SubtitleZhMode): SubtitleZhMode {
  const index = SUBTITLE_ZH_MODES.indexOf(mode)
  return SUBTITLE_ZH_MODES[(index + 1) % SUBTITLE_ZH_MODES.length] ?? 'dim'
}
