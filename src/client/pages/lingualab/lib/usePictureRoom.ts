/**
 * Whether the playing picture has room while the timing panel is open, measured.
 *
 * In timing mode the picture takes whatever the scroller has left (`flex:1 1 0` in a size container) and is not drawn
 * under 120px. A size container cannot change its own size when its child is not drawn, so a picture that stepped aside
 * used to leave its box behind as an empty gap above the sentence. This hook is what lets the page collapse the box
 * instead: it says whether the picture would have the room, and the page puts `is-picture-squeezed` on the column
 * when it would not.
 *
 * The answer must not come from the picture's own box, or it would chase itself (collapse, room appears, show, room
 * goes, ...). It is computed from what stays when the picture is not drawn: the scroller's height, the sentence stage's
 * natural height and the timing strip (see `picture-room.ts` for the sum and the hysteresis band). The stage is measured
 * from its children and its padding, not from its own box, because the squeezed layout stretches that box to take the
 * leftover and the leftover must not count as the stage's height.
 *
 * What is watched is the scroller, each part inside it (the stage's lines wrap and change height with the sentence, the
 * strip's height follows its opening animation) and the scroller's own childList: the stage's lines are keyed by the
 * sentence and replaced on every cue, so the watched set is rebuilt on each change, not fixed once. The picture stage's
 * class is watched too, because that is how it learns that a picture now plays. The parts are found by class inside the
 * column the page hands over, not through a widget, so the widgets stay unaware of each other.
 */
import { useLayoutEffect, useState } from 'react'
import { pictureFits, pictureRoom, stackHeight } from './picture-room.ts'

/** The stage that holds the picture, in any state; the one that plays has `has-screen` as well. */
const PICTURE_STAGE = '.dsh-lingualab-videostage'
const PICTURE_PLAYS = '.dsh-lingualab-videostage.is-shown.has-screen'
/** The sentence stage. */
const SENTENCE_STAGE = '.dsh-lingualab-stage'

/** A computed length as a number; `normal` and other words count as 0. */
function px(value: string): number {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function drawn(element: Element): boolean {
  return getComputedStyle(element).display !== 'none'
}

/** A box's height with its vertical margins, as the next box sees it. */
function outer(element: Element, height: number): number {
  const style = getComputedStyle(element)
  return height + px(style.marginTop) + px(style.marginBottom)
}

/** The sentence stage as tall as its content makes it, whatever the room has stretched its box to. */
function stageHeight(stage: Element): number {
  const style = getComputedStyle(stage)
  const lines = Array.from(stage.children).filter(drawn)
  return stackHeight(
    lines.map((line) => outer(line, line.getBoundingClientRect().height)),
    px(style.rowGap),
    px(style.paddingTop) + px(style.paddingBottom),
  )
}

/** The room the picture of `picture` would get inside `main`, from what does not move when it is not drawn. */
function roomFor(main: HTMLElement, picture: Element): number {
  const style = getComputedStyle(main)
  const others = Array.from(main.children)
    .filter((child) => child !== picture && drawn(child))
    .map((child) => outer(child, child.matches(SENTENCE_STAGE) ? stageHeight(child) : child.getBoundingClientRect().height))
  const padding = getComputedStyle(picture)
  return pictureRoom({
    viewport: main.clientHeight - px(style.paddingTop) - px(style.paddingBottom),
    others,
    padding: px(padding.paddingTop) + px(padding.paddingBottom),
  })
}

/**
 * Whether the picture fits.
 *
 * @param main The column's scroller (`.dsh-lingualab-practice-main`), or `null` while it is not on the page.
 * @param active Whether the timing panel is open. Off, nothing is watched and the answer is that it fits.
 * @returns `false` only while the picture plays, the panel is open and the room is short of what the picture needs;
 *   always `true` without `ResizeObserver` (the first render, a test, a render to a string).
 */
export function usePictureRoom(main: HTMLElement | null, active: boolean): boolean {
  const [squeezed, setSqueezed] = useState(false)

  useLayoutEffect(() => {
    if (!active || main === null || typeof ResizeObserver === 'undefined') return
    const column: HTMLElement = main
    // Judged from this side of the band: a picture is taken to be drawn until the room says otherwise.
    let shown = true
    const watched = new Set<Element>()
    const resize = new ResizeObserver(() => sync())
    const mutation = new MutationObserver(() => sync())

    function sync(): void {
      const picture = column.querySelector(PICTURE_PLAYS)
      shown = picture === null ? true : pictureFits(roomFor(column, picture), shown)
      setSqueezed(!shown)

      const targets = new Set<Element>([column])
      for (const child of column.children) {
        if (child.matches(PICTURE_STAGE)) continue
        if (child.matches(SENTENCE_STAGE)) for (const line of child.children) targets.add(line)
        else targets.add(child)
      }
      for (const target of watched) {
        if (targets.has(target)) continue
        resize.unobserve(target)
        watched.delete(target)
      }
      for (const target of targets) {
        if (watched.has(target)) continue
        resize.observe(target)
        watched.add(target)
      }
      const stage = column.querySelector(PICTURE_STAGE)
      if (stage !== null) mutation.observe(stage, { attributes: true, attributeFilter: ['class'] })
    }

    mutation.observe(column, { childList: true, subtree: true })
    sync()
    return () => {
      resize.disconnect()
      mutation.disconnect()
    }
  }, [main, active])

  return !(active && squeezed)
}
