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
    for (const name of asked) expect(['ll-practice', 'll-body']).toContain(name)
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

  it('steps a shown picture aside while the timing panel is open in a column under 1000px', () => {
    const tight = block('@container ll-practice (max-height:1000px)')
    expect(tight).toContain(':has(.dsh-lingualab-timing-wrap.is-open)')
    expect(tight).toContain('.dsh-lingualab-videostage.is-shown{display:none}')
    // A large picture is the whole stage: nothing here may hide it.
    expect(tight).not.toContain('is-large')
  })

  it('stacks the two edge cards and gives the picture and the cards the whole width in a narrow column', () => {
    expect(block('@container ll-practice (max-width:520px)')).toContain('.dsh-lingualab-timing-edges{grid-template-columns:1fr}')
    expect(block('@container ll-practice (max-width:600px)')).toContain('--ll-pic-w:100%')
  })

  it('gives a touch screen no key hints and 44px targets', () => {
    const touch = block('@media (hover:none) and (pointer:coarse)')
    for (const selector of ['.dsh-lingualab-page kbd', '.dsh-lingualab-keyhints', '.dsh-lingualab-timing-hints', '.dsh-lingualab-timing-keys']) {
      expect(touch).toContain(selector)
    }
    expect(touch).toContain('{display:none}')
    expect(touch).toContain('.dsh-lingualab-timing-step button{width:44px;height:44px}')
    expect(touch).toContain('.dsh-lingualab-timing-foot .dsh-lingualab-btn{height:44px}')
    // The pills on the picture keep their look; the hit area grows by an invisible margin.
    expect(touch).toContain('.dsh-lingualab-picture-local-btn::after')
  })
})
