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
 *     audio to look at a word would cost the next sentence. Dragging across words, or
 *     `Shift`-clicking a second one, picks the phrase between them, because a collocation
 *     is often the thing worth keeping; it is kept as one `[her skirt]`. Once kept, the
 *     popover's 「已记下」 takes it out again.
 *   · **Shadowing hides the English.** While the pause-after-sentence mode is on, the
 *     line is blurred until the sentence has ended (or you press R), so the first thing
 *     you do is say it from what you heard, and the text is the answer key.
 *   · **Nothing is a blank.** No subtitles, no audio and "finished" each get a message
 *     that says what to do next, because an empty stage looks like a crash.
 *
 * The sentence's time range is also a button: it opens the strip that moves the sentence's
 * start and end, because the range is where a reader looks when a loop clips a word.
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
  /** Keep a word or phrase in the note of the sentence on stage, or take it out when it is there. */
  readonly onToggleWord: (word: string) => void
  /** Whether the sentence's note already holds the word or phrase, so the popover can say so. */
  readonly hasWord: (word: string) => boolean
  readonly loading: boolean
  readonly hasAudio: boolean
  /** Open the timing strip for the sentence on stage; the time range is its button. */
  readonly onRetime: () => void
  /** Whether the strip is open, so the range reads as pressed. */
  readonly retiming: boolean
}

/** The words picked, as token indexes, first to last. */
interface Span {
  readonly from: number
  readonly to: number
}

/** The picked words and where the popover sits, relative to the English block. */
interface Pinned extends Span {
  readonly word: string
  readonly left: number
  readonly top: number
}

/** A span from two token indexes in either order. */
function spanOf(one: number, two: number): Span {
  return { from: Math.min(one, two), to: Math.max(one, two) }
}

/** The centre of the practice view. */
export function Stage({
  t,
  cues,
  activeIndex,
  zhMode,
  masked,
  onReveal,
  onToggleWord,
  hasWord,
  loading,
  hasAudio,
  onRetime,
  retiming,
}: StageProps) {
  const cue = cues[activeIndex]
  const previous = cues[activeIndex - 1]
  const next = cues[activeIndex + 1]
  const lines = cue === undefined ? null : splitCue(cue)

  const block = useRef<HTMLDivElement>(null)
  const [pinned, setPinned] = useState<Pinned | null>(null)
  /** The words under a drag that has not been let go yet. */
  const [dragging, setDragging] = useState<Span | null>(null)
  /**
   * Where the drag started, the word it is over now and the sentence it is in; read when the
   * button comes up, and dropped then when the sentence has moved on under it.
   */
  const drag = useRef<{ anchor: number; over: number; sentence: number } | null>(null)
  const [done, setDone] = useState<'copied' | 'added' | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** The sentence on stage, for a handler that outlives the render it was made in. */
  const shown = useRef(activeIndex)

  const close = useCallback(() => {
    setPinned(null)
    setDragging(null)
    setDone(null)
  }, [])

  // A word belongs to the sentence it was clicked in. The popover is dropped during
  // render, when the sentence changes, rather than from an effect that would paint one
  // frame of it over the wrong line first.
  const [owner, setOwner] = useState(activeIndex)
  if (owner !== activeIndex) {
    setOwner(activeIndex)
    if (pinned !== null || dragging !== null) close()
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

  useEffect(() => {
    shown.current = activeIndex
  }, [activeIndex])

  const confirm = (kind: 'copied' | 'added'): void => {
    setDone(kind)
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = setTimeout(() => setDone(null), CONFIRM_MS)
  }

  /** Pin the popover over the words from one token to another, in either order. */
  const settle = (one: number, two: number): void => {
    const host = block.current
    if (host === null || cue === undefined) return
    const span = spanOf(one, two)
    const first = host.querySelector(`[data-token="${String(span.from)}"]`)
    const last = host.querySelector(`[data-token="${String(span.to)}"]`)
    if (first === null || last === null) return
    const box = host.getBoundingClientRect()
    const start = first.getBoundingClientRect()
    const end = last.getBoundingClientRect()
    const word = tokenizeEnglish(splitCue(cue).english)
      .slice(span.from, span.to + 1)
      .map((token) => token.text)
      .join('')
      .trim()
    setDone(null)
    setDragging(null)
    // Over the middle of the span when it sits on one line, over its first word when it wraps.
    const oneLine = Math.abs(start.top - end.top) < 2
    setPinned({
      ...span,
      word,
      left: (oneLine ? (start.left + end.right) / 2 : start.left + start.width / 2) - box.left,
      top: Math.min(start.top, end.top) - box.top,
    })
  }

  /**
   * A press on a word: `Shift` extends the picked span to it, anything else starts a drag that
   * picks the word itself when the button comes up where it went down.
   *
   * The press is the browser's default too, a text selection, which would paint over the span and
   * copy the wrong thing, so it is cancelled.
   */
  const press = (event: ReactMouseEvent<HTMLElement>, index: number): void => {
    if (event.button !== 0) return
    event.preventDefault()
    if (event.shiftKey && pinned !== null) {
      settle(pinned.from, index)
      return
    }
    drag.current = { anchor: index, over: index, sentence: activeIndex }
    setDragging(spanOf(index, index))
    const release = (): void => {
      document.removeEventListener('mouseup', release)
      const held = drag.current
      drag.current = null
      if (held !== null && held.sentence === shown.current) settle(held.anchor, held.over)
    }
    document.addEventListener('mouseup', release)
  }

  /** The pointer moved onto another word while the button is down. */
  const sweep = (index: number): void => {
    const held = drag.current
    if (held === null) return
    drag.current = { ...held, over: index }
    setDragging(spanOf(held.anchor, index))
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
  const marked = dragging ?? pinned
  const kept = pinned !== null && hasWord(pinned.word)

  return (
    <div className="dsh-lingualab-stage">
      <div className="dsh-lingualab-stage-meta">
        <span className="dsh-lingualab-pill">
          {t('cueOf', { n: activeIndex + 1, total: cues.length })}
        </span>
        <button
          type="button"
          className={`dsh-lingualab-stage-time${retiming ? ' is-on' : ''}`}
          onClick={onRetime}
          title={t('timingOpen')}
          aria-pressed={retiming}
        >
          {formatClock(cue.start)} – {formatClock(cue.end)}
        </button>
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
                    data-token={index}
                    className={`is-word${marked !== null && index >= marked.from && index <= marked.to ? ' is-pinned' : ''}`}
                    onMouseDown={(event) => press(event, index)}
                    onMouseEnter={() => sweep(index)}
                  >
                    {token.text}
                  </span>
                ) : (
                  <span
                    key={index}
                    className={marked !== null && index > marked.from && index < marked.to ? 'is-between' : undefined}
                  >
                    {token.text}
                  </span>
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
              className={`dsh-lingualab-pop-btn${kept ? ' is-on' : ''}`}
              aria-pressed={kept}
              title={kept ? t('wordRemoveHint') : undefined}
              onClick={() => {
                onToggleWord(pinned.word)
                if (kept) close()
                else confirm('added')
              }}
            >
              {kept ? <CheckIcon size={13} /> : <NoteIcon size={13} />}
              {kept ? t('wordAdded') : t('wordAdd')}
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
