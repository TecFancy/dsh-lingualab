// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { THEMES, THEME_IDS, TOKEN_OF, paletteOf, resolveScheme, resolveThemeVars } from './themes.ts'

describe('resolveThemeVars', () => {
  it('sets nothing for the default theme following the host, in either mode', () => {
    expect(resolveThemeVars('dsh', 'auto', false)).toBeNull()
    expect(resolveThemeVars('dsh', 'auto', true)).toBeNull()
  })

  it('paints a pinned appearance even for the default theme', () => {
    const resolved = resolveThemeVars('dsh', 'dark', false)
    expect(resolved?.scheme).toBe('dark')
    expect(resolved?.vars['--dsw-alias-bg-base']).toBe('#151517')
  })

  it('follows the host when the appearance is auto', () => {
    expect(resolveThemeVars('ink', 'auto', false)?.scheme).toBe('light')
    expect(resolveThemeVars('ink', 'auto', true)?.scheme).toBe('dark')
    expect(resolveThemeVars('ink', 'auto', false)?.vars['--dsw-alias-brand-primary']).toBe('#3651c9')
    expect(resolveThemeVars('ink', 'auto', true)?.vars['--dsw-alias-brand-primary']).toBe('#8ea2ff')
  })

  it('ignores the host when the appearance is pinned', () => {
    expect(resolveThemeVars('pine', 'light', true)?.scheme).toBe('light')
    expect(resolveThemeVars('pine', 'dark', false)?.scheme).toBe('dark')
  })

  it('sets exactly the eleven host tokens, each to a non-empty colour', () => {
    for (const id of THEME_IDS) {
      for (const hostDark of [false, true]) {
        const resolved = resolveThemeVars(id, id === 'dsh' ? 'light' : 'auto', hostDark)
        expect(resolved).not.toBeNull()
        const names = Object.keys(resolved?.vars ?? {}).sort()
        expect(names).toEqual(Object.values(TOKEN_OF).sort())
        for (const value of Object.values(resolved?.vars ?? {})) expect(value.length).toBeGreaterThan(0)
      }
    }
  })

  it('keeps every token under the host namespace', () => {
    for (const token of Object.values(TOKEN_OF)) expect(token.startsWith('--dsw-alias-')).toBe(true)
  })
})

describe('resolveScheme', () => {
  it('lets a pin win over the host and auto follow it', () => {
    expect(resolveScheme('auto', true)).toBe('dark')
    expect(resolveScheme('auto', false)).toBe('light')
    expect(resolveScheme('light', true)).toBe('light')
    expect(resolveScheme('dark', false)).toBe('dark')
  })
})

describe('the palette table', () => {
  it('has one theme per id, in the order the drawer lists them', () => {
    expect(THEMES.map((theme) => theme.id)).toEqual([...THEME_IDS])
  })

  it('hands back the palette of the scheme asked for', () => {
    expect(paletteOf('paper', 'light').bg).toBe('#f6f1e7')
    expect(paletteOf('paper', 'dark').bg).toBe('#1a1714')
  })

  it('gives every palette a full set of colours', () => {
    for (const theme of THEMES) {
      for (const palette of [theme.light, theme.dark]) {
        expect(Object.keys(palette).sort()).toEqual(Object.keys(TOKEN_OF).sort())
      }
    }
  })
})
