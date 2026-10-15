import { describe, expect, it } from 'vitest'
import { loadSource, positionKnown, seekElement, type LoadedRef, type SourceElement } from './load-source.ts'

/** A media element that loads when told to: `load()` resets it, `metadata()` is the browser getting that far. */
class FakeElement implements SourceElement {
  src = ''
  currentTime = 0
  readyState = 0
  private listeners: (() => void)[] = []

  load(): void {
    this.readyState = 0
    this.currentTime = 0
  }

  removeAttribute(): void {
    this.src = ''
  }

  addEventListener(_type: 'loadedmetadata', listener: () => void): void {
    this.listeners.push(listener)
  }

  removeEventListener(_type: 'loadedmetadata', listener: () => void): void {
    this.listeners = this.listeners.filter((other) => other !== listener)
  }

  metadata(): void {
    this.readyState = 1
    const listeners = this.listeners
    this.listeners = []
    for (const listener of listeners) listener()
  }
}

/** The video at the start of sentence 9, ready. */
function playing(): { element: FakeElement; loaded: LoadedRef<FakeElement> } {
  const fixture = { element: new FakeElement(), loaded: { current: null } as LoadedRef<FakeElement> }
  loadSource(fixture.element, fixture.loaded, '/ep.smooth.mp4', 'S01E01')
  fixture.element.metadata()
  seekElement(fixture.element, fixture.loaded, 22.48)
  return fixture
}

describe('loadSource and seekElement', () => {
  it('keeps the position across a swap within the session', () => {
    const { element, loaded } = playing()
    loadSource(element, loaded, '/ep.mp3', 'S01E01')
    expect(element.currentTime).toBe(0)
    element.metadata()
    expect(element.currentTime).toBe(22.48)
  })

  it('lets a step made while the swapped source loads win over the kept position', () => {
    const { element, loaded } = playing()
    // The picture is shown again: the audio file gives way to the video, which has not loaded yet.
    loadSource(element, loaded, '/ep.mp3', 'S01E01')
    element.metadata()
    loadSource(element, loaded, '/ep.smooth.mp4', 'S01E01')
    // The headset's next: the store has moved to sentence 10.
    seekElement(element, loaded, 25.1)
    element.metadata()
    expect(element.currentTime).toBe(25.1)
  })

  it('carries a step through swaps that never got their metadata', () => {
    const { element, loaded } = playing()
    // V cycled quickly: two swaps before either loaded, a step between them, another after.
    loadSource(element, loaded, '/ep.mp3', 'S01E01')
    seekElement(element, loaded, 25.1)
    loadSource(element, loaded, '/ep.smooth.mp4', 'S01E01')
    expect(element.currentTime).toBe(0)
    element.metadata()
    expect(element.currentTime).toBe(25.1)
  })

  it('still starts the source of another episode from the top', () => {
    const { element, loaded } = playing()
    loadSource(element, loaded, '/next.mp3', 'S01E02')
    element.metadata()
    expect(element.currentTime).toBe(0)
    // A seek there goes straight to the element; nothing is waiting to take it.
    seekElement(element, loaded, 4)
    expect(element.currentTime).toBe(4)
  })

  it('drops the restore when the source changes again before it ran', () => {
    const { element, loaded } = playing()
    const cleanup = loadSource(element, loaded, '/ep.mp3', 'S01E01')
    cleanup?.()
    element.metadata()
    expect(element.currentTime).toBe(0)
  })
})

describe('positionKnown', () => {
  it('ignores the reset to 0 while a swap waits for its metadata', () => {
    const { element, loaded } = playing()
    expect(positionKnown(loaded)).toBe(true)
    loadSource(element, loaded, '/ep.mp3', 'S01E01')
    expect(positionKnown(loaded)).toBe(false)
    element.metadata()
    expect(positionKnown(loaded)).toBe(true)
  })

  it('reports the position of a new episode from its first event', () => {
    const { element, loaded } = playing()
    loadSource(element, loaded, '/next.mp3', 'S01E02')
    expect(positionKnown(loaded)).toBe(true)
  })
})
