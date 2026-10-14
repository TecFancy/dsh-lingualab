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
 *     audio to look at a word would cost the next sentence. Dragging across words (with a
 *     mouse, a pen or a finger), or `Shift`-clicking a second one, picks the phrase between
 *     them, because a collocation is often the thing worth keeping; it is kept as one
 *     `[her skirt]`. Once kept, the popover's 「已记下」 takes it out again. The drag runs on
 *     pointer events, since a finger on iOS sends no mouse events while it moves (see
 *     `../lib/word-drag.ts`).
 *   · **Shadowing hides the English.** While shadowing is on, the line is blurred until
 *     the program uncovers it (at the stop, or after the first speaking pause when one is
 *     set) or you press R, so the first thing you do is say it from what you heard, and the
 *     text is the answer key.
 *   · **Nothing is a blank.** No subtitles, no audio, the opening before the first sentence
 *     and "finished" each get a message that says what to do next, because an empty stage
 *     looks like a crash.
 *
 * The sentence's time range is also a button: it opens the strip that moves the sentence's
 * start and end, because the range is where a reader looks when a loop clips a word.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { splitCue, tokenizeEnglish, type Cue, type SubtitleZhMode } from '../../../entities/cue/index.ts'
import { returnFocusToPage } from '../../../shared/lib/focus.ts'
import { formatClock } from '../../../shared/lib/format.ts'
import { CheckIcon, CopyIcon, EyeIcon, NoteIcon } from '../../../shared/ui/icons.tsx'
import { StageSkeleton } from '../../../shared/ui/Skeleton.tsx'
import type { Translate } from '../../../context.ts'
import { isOutsidePress, pressAction, startWordDrag, type PointerEventType, type PointerSource } from '../lib/word-drag.ts'

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

/** Pointer events as the page's document sees them: a captured touch pointer still bubbles up to it. */
const documentPointers: PointerSource = {
  listen(type: PointerEventType, handler: (event: PointerEvent) => void) {
    document.addEventListener(type, handler)
    return () => document.removeEventListener(type, handler)
  },
}

/** A span from two token indexes in either order. */
function spanOf(one: number, two: number): Span {
  return { from: Math.min(one, two), to: Math.max(one, two) }
}

/**
 * The classes that tint a word inside the picked span. Only the span's two ends are rounded, so
 * the words and the gaps between them read as one band rather than a row of separate pills.
 */
function wordMark(span: Span | null, index: number): string {
  if (span === null || index < span.from || index > span.to) return ''
  return ` is-pinned${index === span.from ? ' is-from' : ''}${index === span.to ? ' is-to' : ''}`
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
  /** The drag that has not been let go yet: how to end it, and the sentence it began in. */
  const drag = useRef<{ stop: () => void; sentence: number } | null>(null)
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
    // A pointer press, not a mouse press: a finger sends no mouse event until it lifts, and then only for a tap.
    const onDown = (event: PointerEvent): void => {
      if (isOutsidePress(event.target)) close()
    }
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [pinned, close])

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
      // A drag that outlives the stage would go on listening to the document and settle into nothing.
      drag.current?.stop()
      drag.current = null
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

  /** The token under a point of the screen, if it is a word of the sentence on stage. */
  const tokenAt = (x: number, y: number): number | null => {
    const host = block.current
    if (host === null) return null
    const word = document.elementFromPoint(x, y)?.closest('[data-token]')
    if (word === null || word === undefined || !host.contains(word)) return null
    const index = Number(word.getAttribute('data-token'))
    return Number.isInteger(index) ? index : null
  }

  /**
   * A press on a word: `Shift` extends the picked span to it, anything else starts a drag that
   * picks the word itself when the pointer comes up where it went down.
   *
   * The drag follows the pointer by its coordinates, because a finger is captured by the word it
   * went down on and enters no other. A mouse press is also the browser's default, a text
   * selection, which would paint over the span and copy the wrong thing; `mousedown` is cancelled
   * where the word is drawn, and a finger has its selection and callout turned off in the style.
   */
  const press = (event: ReactPointerEvent<HTMLElement>, index: number): void => {
    const action = pressAction({
      button: event.button,
      isPrimary: event.isPrimary,
      shiftKey: event.shiftKey,
      pinned: pinned !== null,
    })
    if (action === 'ignore') return
    if (action === 'extend' && pinned !== null) {
      settle(pinned.from, index)
      return
    }
    drag.current?.stop()
    const sentence = activeIndex
    setDragging(spanOf(index, index))
    const stop = startWordDrag({
      source: documentPointers,
      pointerId: event.pointerId,
      anchor: index,
      tokenAt,
      onSweep: (over) => {
        // The sentence moved on under the drag: what it was picking is not on stage any more.
        if (sentence !== shown.current) {
          stop()
          drag.current = null
          return
        }
        setDragging(spanOf(index, over))
      },
      onRelease: (anchor, over) => {
        drag.current = null
        if (sentence === shown.current) settle(anchor, over)
      },
      onCancel: () => {
        drag.current = null
        setDragging(null)
      },
    })
    drag.current = { stop, sentence }
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

  // Subtitles that start after an opening with no dialogue leave the stage without a sentence
  // until the first one, which is not the same as having no subtitles at all.
  const first = cues[0]
  if ((cue === undefined || lines === null) && first !== undefined && activeIndex < 0) {
    return (
      <div className="dsh-lingualab-stage">
        <div className="dsh-lingualab-stage-empty">
          <strong>{t('beforeFirstCue', { time: formatClock(first.start) })}</strong>
          <span>{t('beforeFirstCueHint')}</span>
        </div>
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
                    className={`is-word${wordMark(marked, index)}`}
                    onPointerDown={(event) => press(event, index)}
                    onMouseDown={(event) => event.preventDefault()}
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
          <button
            type="button"
            className="dsh-lingualab-reveal"
            onClick={(event) => {
              // The button goes away with the blur it lifts; pressed by the keyboard it has the focus, which
              // would fall to the document and take the page's shortcuts with it.
              returnFocusToPage(event.currentTarget)
              onReveal()
            }}
          >
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
