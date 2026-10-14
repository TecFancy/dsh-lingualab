// @vitest-environment node
/**
 * What the stylesheet promises about how the page responds to the room it has. There is no layout engine in these
 * tests, so they pin the declarations the layout depends on: the two containers, the queries that name them, and the
 * rules a touch screen gets. The numbers were measured in a browser at iPad and desktop sizes (see the note on the
 * practice column).
 */
import { describe, expect, it } from 'vitest'
import { STYLES } from './styles.ts'

/** The block of a rule: from its selector to its closing brace. */
const rule = (selector: string): string => {
  const start = STYLES.indexOf(`${selector}{`)
  expect(start).toBeGreaterThanOrEqual(0)
  return STYLES.slice(start, STYLES.indexOf('}', start))
}

/** The text of the at-rule that starts at `head`, braces matched. */
const block = (head: string): string => {
  const start = STYLES.indexOf(head)
  expect(start).toBeGreaterThanOrEqual(0)
  let depth = 0
  for (let at = STYLES.indexOf('{', start); at < STYLES.length; at += 1) {
    if (STYLES[at] === '{') depth += 1
    if (STYLES[at] === '}') depth -= 1
    if (depth === 0) return STYLES.slice(start, at + 1)
  }
  throw new Error(`unbalanced braces after ${head}`)
}

describe('the stylesheet', () => {
  it('has balanced braces', () => {
    expect(STYLES.split('{').length).toBe(STYLES.split('}').length)
  })

  it('makes the practice column a named size container and the row it shares a named width container', () => {
    expect(rule('.dsh-lingualab-practice')).toContain('container:ll-practice/size')
    expect(rule('.dsh-lingualab-body')).toContain('container:ll-body/inline-size')
  })

  it('asks only containers that exist', () => {
    const asked = [...STYLES.matchAll(/@container\s+([\w-]+)\s*\(/g)].map((match) => match[1])
    expect(asked.length).toBeGreaterThan(0)
    for (const name of asked) expect(['ll-practice', 'll-body', 'll-video']).toContain(name)
  })

  it('keeps only the browse layer on a viewport width', () => {
    const widths = [...STYLES.matchAll(/@media\s*\(max-width:(\d+)px\)/g)].map((match) => match[1])
    expect(widths).toEqual(['640'])
  })

  it('lets the part above the player card scroll, and the sentence keep its own height', () => {
    expect(rule('.dsh-lingualab-practice-main')).toContain('overflow-y:auto')
    expect(rule('.dsh-lingualab-practice-main')).toContain('min-height:0')
    expect(rule('.dsh-lingualab-stage')).toContain('flex:1 0 auto')
    expect(rule('.dsh-lingualab-deck')).toContain('flex:none')
  })

  it('keeps the responsive rules last, so they override the rules they refine', () => {
    const responsive = STYLES.indexOf('/* ── responsive:')
    expect(responsive).toBeGreaterThan(STYLES.indexOf('.dsh-lingualab-videocard{'))
    expect(STYLES.indexOf('@container', 0)).toBeGreaterThan(responsive)
  })

  it('tightens a short column in steps: the lines either side of the sentence, then the picture cap', () => {
    const short = block('@container ll-practice (max-height:700px)')
    expect(short).toContain('.dsh-lingualab-stage-side{display:none}')
    expect(short).toContain('--ll-pic-h:30cqh')
  })

  it('treats adjusting timing as a mode the page sets on the column, not as a :has() of the panel', () => {
    expect(STYLES).not.toContain(':has(.dsh-lingualab-timing-wrap')
    expect(STYLES).toContain('.dsh-lingualab-practice.is-timing')
    // The rules the mode replaced: a shown picture hidden under 1000px, the strip of 100cqh less 880px, the 440px hide.
    expect(STYLES).not.toContain('max-height:1000px')
    expect(STYLES).not.toContain('880px')
    expect(STYLES).not.toContain('max-width:440px')
    expect(STYLES).not.toContain('max-width:520px')
  })

  it('gives the timing panel its full height from the first frame to the last, and moves only the card', () => {
    // The layout steps once each way: no row that grows from nothing, so nothing above it is drawn at a size it does not keep.
    const wrap = rule('.dsh-lingualab-timing-wrap')
    expect(wrap).not.toContain('grid')
    expect(wrap).not.toContain('transition')
    expect(STYLES).not.toContain('grid-template-rows:0fr')
    expect(STYLES).not.toContain('.dsh-lingualab-timing-wrap.is-open{')
    expect(rule('.dsh-lingualab-timing-clip')).toContain('overflow:hidden')
    // The card is what fades and lifts, from is-open, and the panel is out of the hit test until it is open.
    expect(rule('.dsh-lingualab-timing')).toContain('opacity:0')
    expect(rule('.dsh-lingualab-timing')).toContain('transition:opacity')
    expect(rule('.dsh-lingualab-timing-wrap.is-open .dsh-lingualab-timing')).toContain('opacity:1')
    expect(rule('.dsh-lingualab-timing-wrap:not(.is-open)')).toContain('pointer-events:none')
  })

  it('folds the player card to the scrubber and one row, speed then previous, play and next, while timing', () => {
    const hidden = block('.dsh-lingualab-practice.is-timing .dsh-lingualab-keyhints')
    expect(hidden).toContain('.dsh-lingualab-practice.is-timing .dsh-lingualab-deck .dsh-lingualab-bar-btn:not(.is-speed)')
    expect(hidden).toContain('.dsh-lingualab-practice.is-timing .dsh-lingualab-deck .dsh-lingualab-menu')
    expect(hidden).toContain('.dsh-lingualab-practice.is-timing .dsh-lingualab-transport-side.is-end')
    expect(hidden).toContain('{display:none}')
    // The narrow rule that dissolves the sides into one wrapping flow must not decide the row while timing.
    const row = rule('.dsh-lingualab-practice.is-timing .dsh-lingualab-transport-row')
    expect(row).toContain('display:grid')
    expect(row).toContain('grid-template-columns:1fr auto 1fr')
    expect(rule('.dsh-lingualab-practice.is-timing .dsh-lingualab-transport-side')).toContain('display:flex')
    expect(rule('.dsh-lingualab-practice.is-timing .dsh-lingualab-transport-main')).toContain('order:0')
    expect(STYLES.indexOf('.dsh-lingualab-practice.is-timing .dsh-lingualab-transport-row{')).toBeGreaterThan(
      STYLES.indexOf('@container ll-practice (max-width:600px){'),
    )
  })

  it('gives a playing picture what is left while timing, as the biggest box of its shape', () => {
    const stage = rule('.dsh-lingualab-practice.is-timing .dsh-lingualab-videostage.is-shown.has-screen')
    expect(stage).toContain('flex:1 1 0')
    expect(stage).toContain('min-height:0')
    expect(stage).toContain('container:ll-video/size')
    const frame = rule('.dsh-lingualab-practice.is-timing .dsh-lingualab-videostage.is-shown .dsh-lingualab-picture')
    expect(frame).toContain('width:min(100cqw,720px,calc(100cqh * var(--ll-video-ratio,1.7778)))')
    expect(frame).toContain('aspect-ratio:var(--ll-video-ratio,1.7778)')
    expect(frame).toContain('max-height:none')
    expect(frame).toContain('min-width:0')
    // The sentence is not stretched to take the room, and the lines either side of it are not there.
    expect(rule('.dsh-lingualab-practice.is-timing .dsh-lingualab-stage')).toContain('flex:0 0 auto')
    expect(rule('.dsh-lingualab-practice.is-timing .dsh-lingualab-stage-side')).toContain('display:none')
    // A card or a chip standing in for a picture, and the pills on the picture, are not drawn while timing.
    expect(STYLES).toContain('.dsh-lingualab-practice.is-timing .dsh-lingualab-videostage.is-shown:not(.has-screen){display:none}')
    expect(block('.dsh-lingualab-practice.is-timing .dsh-lingualab-picture-local')).toContain('.dsh-lingualab-picture-smooth{display:none}')
  })

  it('collapses the picture stage and lets the sentence stage take and centre the room when the page says it is squeezed', () => {
    const squeezed = '.dsh-lingualab-practice.is-timing.is-picture-squeezed'
    // The picture's stage takes no space at all, not a box with nothing drawn in it, with the timing panel open or not.
    expect(rule('.dsh-lingualab-practice.is-picture-squeezed .dsh-lingualab-videostage.is-shown.has-screen')).toContain('display:none')
    // The sentence stage grows into the room, and its text stays centred in it (the base rule centres it). It only
    // learns to shrink while timing, where the panel is the other part; closed it keeps its own height (flex:1 0 auto).
    expect(rule(`${squeezed} .dsh-lingualab-stage`)).toContain('flex:1 1 auto')
    expect(STYLES).not.toContain('.dsh-lingualab-practice.is-picture-squeezed .dsh-lingualab-stage{')
    expect(rule('.dsh-lingualab-stage')).toContain('justify-content:center')
    // It comes after the rules it overrides, at the same specificity or more.
    expect(STYLES.indexOf(`${squeezed} .dsh-lingualab-stage{`)).toBeGreaterThan(
      STYLES.indexOf('.dsh-lingualab-practice.is-timing .dsh-lingualab-stage{'),
    )
    const closed = '.dsh-lingualab-practice:not(.is-timing) .dsh-lingualab-videostage.is-shown.has-screen{'
    const hide = '.dsh-lingualab-practice.is-picture-squeezed .dsh-lingualab-videostage.is-shown.has-screen{'
    expect(STYLES.indexOf(hide)).toBeGreaterThan(STYLES.indexOf('.dsh-lingualab-practice.is-timing .dsh-lingualab-videostage.is-shown.has-screen{'))
    expect(STYLES.indexOf(hide)).toBeGreaterThan(STYLES.indexOf(closed))
  })

  it('lets a playing picture give way when the column is short, outside timing too, from the size it always had', () => {
    // The stage is sized as the picture would be (its share of the width, 720px at 16:9, the height cap), and may shrink by flex.
    const stage = rule('.dsh-lingualab-practice:not(.is-timing) .dsh-lingualab-videostage.is-shown.has-screen')
    expect(stage).toContain('flex:0 1 min(calc(var(--ll-pic-share) * (100cqw - 24px) * 9 / 16),405px,var(--ll-pic-h))')
    expect(stage).toContain('min-height:0')
    expect(stage).toContain('container:ll-video/size')
    // The padding is outside the box the basis names, whatever the host does to box-sizing.
    expect(stage).toContain('box-sizing:content-box')
    // The picture is the biggest 16:9 box the stage gives it, no wider than its share; it has no 300px floor and no height cap of its own.
    const frame = rule('.dsh-lingualab-practice:not(.is-timing) .dsh-lingualab-videostage.is-shown .dsh-lingualab-picture')
    expect(frame).toContain('width:min(var(--ll-pic-w),720px,calc(100cqh * 16 / 9))')
    expect(frame).toContain('min-width:0')
    expect(frame).toContain('max-height:none')
    // The share and the cap are the picture's own, said once more for the stage, and the narrow and short rules change both.
    expect(rule('.dsh-lingualab-videostage')).toContain('--ll-pic-share:.64')
    expect(rule('.dsh-lingualab-videostage')).toContain('--ll-pic-h:42cqh')
    expect(block('@container ll-practice (max-width:600px)')).toContain('.dsh-lingualab-videostage{--ll-pic-share:1}')
    expect(block('@container ll-practice (max-height:700px)')).toContain('.dsh-lingualab-videostage,.dsh-lingualab-picture{--ll-pic-h:30cqh}')
    // Timing keeps its own sizing: all that is left, not the size it always had.
    expect(rule('.dsh-lingualab-practice.is-timing .dsh-lingualab-videostage.is-shown.has-screen')).toContain('flex:1 1 0')
  })

  it('leaves the corner pills off a picture that has given way to under 160px', () => {
    const small = block('@container ll-video (max-height:159px)')
    expect(small).toContain('.dsh-lingualab-videostage.is-shown .dsh-lingualab-picture-local')
    expect(small).toContain('.dsh-lingualab-videostage.is-shown .dsh-lingualab-picture-smooth')
    expect(small).toContain('{display:none}')
  })

  it('leaves the decision to draw no picture to the page, not to a container query on the picture', () => {
    // The one query on the picture stage's height is about the pills drawn on the picture, and never hides the picture.
    expect([...STYLES.matchAll(/@container ll-video \(max-height:(\d+)px\)/g)].map((match) => match[1])).toEqual(['159'])
    expect(block('@container ll-video (max-height:159px)')).not.toContain('.dsh-lingualab-picture{')
    expect(block('@container ll-video (max-height:159px)')).not.toContain('videostage.is-shown{')
    // The large picture still has its own container, and is not touched by the squeezed rules.
    expect(STYLES).not.toContain('.is-picture-squeezed .dsh-lingualab-videostage.is-large')
  })

  it('keeps the large picture as the part that takes what is left, with its floor, and does not hide it', () => {
    expect(STYLES).not.toContain('.is-timing .dsh-lingualab-videostage.is-large')
    expect(rule('.dsh-lingualab-videostage.is-large')).toContain('min-height:160px')
    expect(rule('.dsh-lingualab-videostage.is-large')).toContain('container:ll-video/size')
  })

  it('lays the timing panel out in one compact layout for a small room, and keeps two cards for a big one', () => {
    const compact = block('@container ll-practice (max-width:600px) or (max-height:760px)')
    // One row per edge: the label with the delta under it, the value, the step buttons, the playhead button.
    expect(compact).toContain('.dsh-lingualab-timing-edge{display:grid;grid-template-columns:minmax(56px,max-content) minmax(0,1fr) auto auto')
    expect(compact).toContain('.dsh-lingualab-timing-edge-head{flex-direction:column')
    expect(compact).toContain('.dsh-lingualab-timing-edge-body{display:contents}')
    expect(compact).toContain('min-height:44px')
    expect(compact).toContain('.dsh-lingualab-timing-value{justify-self:start;font-size:18px}')
    // The mini timeline and the lines of keys are not there.
    for (const selector of ['.dsh-lingualab-timing-line', '.dsh-lingualab-timing-hints', '.dsh-lingualab-timing-keys']) {
      expect(compact).toContain(selector)
    }
    // The short labels replace the long ones.
    expect(compact).toContain('.dsh-lingualab-timing .dsh-lingualab-label-long{display:none}')
    expect(compact).toContain('.dsh-lingualab-timing .dsh-lingualab-label-short{display:inline}')
    // The foot is one row: Reset, Cancel, and Save taking what is left.
    expect(compact).toContain('.dsh-lingualab-timing-foot{flex-wrap:nowrap')
    expect(compact).toContain('.dsh-lingualab-timing-foot .dsh-lingualab-btn.is-primary{flex:1')
    // The wide layout is the base rules: two cards in two columns, with the mini timeline.
    expect(rule('.dsh-lingualab-timing-edges')).toContain('grid-template-columns:repeat(2,minmax(0,1fr))')
    expect(rule('.dsh-lingualab-label-short')).toContain('display:none')
  })

  it('wraps the playhead button onto a second line of its row where the row is too narrow, and later on a touch screen', () => {
    const wrap = [...STYLES.matchAll(/@container ll-practice \(max-width:(\d+)px\)\{\s*\.dsh-lingualab-timing-edge\{grid-template-columns/g)].map(
      (match) => Number(match[1]),
    )
    expect(wrap).toHaveLength(2)
    // The touch one is the wider: its step buttons and its playhead button are 44px tall and wider.
    expect(wrap[1]).toBeGreaterThan(wrap[0] ?? 0)
    expect(STYLES).toContain('.dsh-lingualab-timing-ghost{grid-column:1/-1;justify-self:start')
  })

  it('turns the follow switch into its short word where the transcript is 260px wide', () => {
    const narrow = block('@container ll-body (max-width:820px)')
    expect(narrow).toContain('.dsh-lingualab-transcript{width:260px}')
    expect(narrow).toContain('.dsh-lingualab-switch .dsh-lingualab-label-long{display:none}')
    expect(narrow).toContain('.dsh-lingualab-switch .dsh-lingualab-label-short{display:inline}')
  })

  it('gives a touch screen no key hints and 44px targets', () => {
    const touch = block('@media (hover:none) and (pointer:coarse)')
    for (const selector of ['.dsh-lingualab-page kbd', '.dsh-lingualab-keyhints', '.dsh-lingualab-timing-hints', '.dsh-lingualab-timing-keys']) {
      expect(touch).toContain(selector)
    }
    expect(touch).toContain('{display:none}')
    expect(touch).toContain('.dsh-lingualab-timing-step button{width:44px;height:44px}')
    // The player card's buttons are 44px for real, not by a margin around a smaller button.
    expect(touch).toContain('.dsh-lingualab-deck .dsh-lingualab-bar-btn{min-width:44px;min-height:44px}')
    expect(touch).toContain('.dsh-lingualab-round{width:44px;height:44px}')
    expect(touch).not.toContain('.dsh-lingualab-deck .dsh-lingualab-bar-btn::after')
    expect(touch).toContain('.dsh-lingualab-timing-foot .dsh-lingualab-btn{height:44px}')
    // The pills on the picture keep their look; the hit area grows by an invisible margin.
    expect(touch).toContain('.dsh-lingualab-picture-local-btn::after')
  })
})
