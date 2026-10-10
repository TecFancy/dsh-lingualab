/**
 * The stage: the sentence you are working on, large, with its neighbours around it.
 *
 * Four small behaviours live here, and each one answers a specific annoyance.
 *
 *   · **The sentence changes with a motion, not a jump.** The block is keyed by the cue,
 *     so React remounts it and a CSS animation fades and lifts the new line in. A 30 ms
 *     swap read as the text flickering; 180 ms reads as the sentence having moved on.
 *     The animation is off under `prefers-reduced-motion`.
 *   · **Words can be pointed at.** A click on an English word opens a small popover to
 *     copy it or add it to the sentence's note, and playback carries on: stopping the
 *     audio to look at a word would cost the next sentence.
 *   · **Shadowing hides the English.** While the pause-after-sentence mode is on, the
 *     line is blurred until the sentence has ended (or you press R), so the first thing
 *     you do is say it from what you heard, and the text is the answer key.
 *   · **Nothing is a blank.** No subtitles, no audio and "finished" each get a message
 *     that says what to do next, because an empty stage looks like a crash.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { splitCue, tokenizeEnglish, type Cue, type SubtitleZhMode } from '../../../entities/cue/index.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import { CheckIcon, CopyIcon, EyeIcon, NoteIcon } from '../../../shared/ui/icons.tsx'
import { StageSkeleton } from '../../../shared/ui/Skeleton.tsx'
import type { Translate } from '../../../context.ts'

/** Past this many characters the sentence is set a size smaller so it still fits. */
const LONG_LINE = 90

/** How long a confirmation ("copied") stays on the popover. */
const CONFIRM_MS = 1400

export interface StageProps {
  readonly t: Translate
  readonly cues: readonly Cue[]
  readonly activeIndex: number
  readonly zhMode: SubtitleZhMode
  /** Hide the English until the reader asks for it (shadowing, before the reveal). */
  readonly masked: boolean
  /** Uncover the English now. */
  readonly onReveal: () => void
  /** Add a word to the note of the sentence on stage; resolves once it is stored. */
  readonly onAddWord: (word: string) => void
  /** Whether the sentence's note already holds the word, so the popover can say so. */
  readonly hasWord: (word: string) => boolean
  readonly loading: boolean
  readonly hasAudio: boolean
}

/** Where the popover sits, relative to the English block. */
interface Pinned {
  readonly word: string
  readonly left: number
  readonly top: number
}

/** The centre of the practice view. */
export function Stage({ t, cues, activeIndex, zhMode, masked, onReveal, onAddWord, hasWord, loading, hasAudio }: StageProps) {
  const cue = cues[activeIndex]
  const previous = cues[activeIndex - 1]
  const next = cues[activeIndex + 1]
  const lines = cue === undefined ? null : splitCue(cue)

  const block = useRef<HTMLDivElement>(null)
  const [pinned, setPinned] = useState<Pinned | null>(null)
  const [done, setDone] = useState<'copied' | 'added' | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const close = useCallback(() => {
    setPinned(null)
    setDone(null)
  }, [])

  // A word belongs to the sentence it was clicked in. The popover is dropped during
  // render, when the sentence changes, rather than from an effect that would paint one
  // frame of it over the wrong line first.
  const [owner, setOwner] = useState(activeIndex)
  if (owner !== activeIndex) {
    setOwner(activeIndex)
    if (pinned !== null) close()
  }

  useEffect(() => {
    if (pinned === null) return
    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      // First in line: the page's own Escape would otherwise close a layer or clear the
      // loop in the same keystroke that was meant for the popover.
      event.stopPropagation()
      event.preventDefault()
      close()
    }
    const onDown = (event: MouseEvent): void => {
      if (!(event.target instanceof Element) || event.target.closest('.dsh-lingualab-word-pop, .is-word') === null) close()
    }
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('mousedown', onDown)
    }
  }, [pinned, close])

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
    },
    [],
  )

  const confirm = (kind: 'copied' | 'added'): void => {
    setDone(kind)
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = setTimeout(() => setDone(null), CONFIRM_MS)
  }

  const pick = (event: ReactMouseEvent<HTMLElement>, word: string): void => {
    const host = block.current
    if (host === null) return
    const box = host.getBoundingClientRect()
    const rect = event.currentTarget.getBoundingClientRect()
    setDone(null)
    setPinned({ word, left: rect.left - box.left + rect.width / 2, top: rect.top - box.top })
  }

  const copy = (word: string): void => {
    void navigator.clipboard.writeText(word).then(
      () => confirm('copied'),
      () => undefined,
    )
  }

  if (!hasAudio) {
    return (
      <div className="dsh-lingualab-stage">
        <div className="dsh-lingualab-stage-empty">
          <strong>{t('noAudio')}</strong>
          <span>{t('noAudioHint')}</span>
        </div>
      </div>
    )
  }

  if ((cue === undefined || lines === null) && loading) {
    return (
      <div className="dsh-lingualab-stage">
        <StageSkeleton label={`${t('stageLoading')}…`} />
      </div>
    )
  }

  if (cue === undefined || lines === null) {
    return (
      <div className="dsh-lingualab-stage">
        <div className="dsh-lingualab-stage-empty">
          <strong>{loading ? `${t('stageLoading')}…` : t('noSubtitles')}</strong>
          {loading ? null : <span>{t('noSubtitlesHint')}</span>}
        </div>
      </div>
    )
  }

  const showChinese = zhMode !== 'hidden' && lines.chinese.length > 0
  const tokens = tokenizeEnglish(lines.english)
  const long = lines.english.length > LONG_LINE

  return (
    <div className="dsh-lingualab-stage">
      <div className="dsh-lingualab-stage-meta">
        <span className="dsh-lingualab-pill">
          {t('cueOf', { n: activeIndex + 1, total: cues.length })}
        </span>
        <span>
          {formatClock(cue.start)} – {formatClock(cue.end)}
        </span>
      </div>

      <div className="dsh-lingualab-stage-side is-prev" aria-hidden>
        {previous === undefined ? ' ' : splitCue(previous).english}
      </div>

      <div className="dsh-lingualab-stage-now" ref={block} key={`${String(cue.start)}-${String(activeIndex)}`}>
        <div className={`dsh-lingualab-stage-en${long ? ' is-long' : ''}${masked ? ' is-masked' : ''}`}>
          {masked
            ? lines.english
            : tokens.map((token, index) =>
                token.word ? (
                  <span
                    key={index}
                    className={`is-word${pinned?.word === token.text ? ' is-pinned' : ''}`}
                    onClick={(event) => pick(event, token.text)}
                  >
                    {token.text}
                  </span>
                ) : (
                  <span key={index}>{token.text}</span>
                ),
              )}
        </div>
        {masked ? (
          <button type="button" className="dsh-lingualab-reveal" onClick={onReveal}>
            <EyeIcon size={14} /> {t('reveal')} <kbd>R</kbd>
          </button>
        ) : null}
        {showChinese ? (
          <div className="dsh-lingualab-stage-zh" data-zh={zhMode}>
            {lines.chinese}
          </div>
        ) : null}

        {pinned !== null ? (
          <div className="dsh-lingualab-word-pop" role="dialog" style={{ left: pinned.left, top: pinned.top }}>
            <b>{pinned.word}</b>
            <button type="button" className="dsh-lingualab-pop-btn" onClick={() => copy(pinned.word)}>
              {done === 'copied' ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
              {done === 'copied' ? t('copied') : t('copy')}
            </button>
            <button
              type="button"
              className="dsh-lingualab-pop-btn"
              disabled={hasWord(pinned.word)}
              onClick={() => {
                onAddWord(pinned.word)
                confirm('added')
              }}
            >
              {done === 'added' || hasWord(pinned.word) ? <CheckIcon size={13} /> : <NoteIcon size={13} />}
              {done === 'added' || hasWord(pinned.word) ? t('wordAdded') : t('wordAdd')}
            </button>
          </div>
        ) : null}
      </div>

      <div className="dsh-lingualab-stage-side is-next" aria-hidden>
        {next === undefined || masked ? ' ' : splitCue(next).english}
      </div>
    </div>
  )
}
