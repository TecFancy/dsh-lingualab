/**
 * Player state, and the rules that keep the scrubber honest.
 *
 * Two things here are worth reading before changing anything.
 *
 * **The seek gate.** When playback is moved programmatically, the browser keeps
 * emitting `timeupdate` for the position it had a moment ago. Written straight
 * through, that stale value puts the scrubber back where it was and the UI looks
 * broken for a third of a second. So a programmatic seek records its target, and
 * incoming positions are ignored until the reported time reaches that target —
 * or until the guard expires, so a seek that never lands cannot freeze the clock.
 *
 * **The loop decision.** Wrapping is delegated to {@link planLoop}, a pure
 * function with its own tests. This file owns the state it reads and the effects
 * it implies, nothing else.
 */
import { create } from 'zustand'
import { findActiveCue, type Cue } from '../../../entities/cue/index.ts'
import { planLoop, stepCueIndex, type LoopMode } from '../lib/loop.ts'

/** Ten steps, all of them pitch-preserving. Ported from the repealed repeater app. */
export const SPEED_PRESETS: readonly number[] = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.15, 1.25, 1.5, 2]

/** Where the default speed sits in {@link SPEED_PRESETS}. */
export const DEFAULT_SPEED_INDEX = 5

/** How long a programmatic seek may keep ignoring reported positions. */
const SEEK_GUARD_MS = 1200

/** How close a reported position must be to the seek target to count as arrived. */
const SEEK_TOLERANCE_SECONDS = 0.35

/** How many times a wrap repeats before the loop stops by itself. `0` is endless. */
const DEFAULT_REPEATS = 0

interface SeekGuard {
  readonly target: number
  readonly expiresAt: number
}

export interface MediaPlayerState {
  readonly cues: readonly Cue[]
  readonly activeIndex: number
  readonly isPlaying: boolean
  readonly currentTime: number
  readonly duration: number
  readonly speedIndex: number
  readonly loopMode: LoopMode
  readonly repeats: number
  readonly playsDone: number
  readonly pointA: number | null
  readonly pointB: number | null
  readonly seekRequest: number | null
  readonly seekToken: number
  readonly guard: SeekGuard | null

  reset: (cues: readonly Cue[]) => void
  setPlaying: (playing: boolean) => void
  toggle: () => void
  seek: (time: number) => void
  onTime: (time: number) => void
  setDuration: (duration: number) => void
  setSpeedIndex: (index: number) => void
  cycleSpeed: (delta: number) => void
  setLoopMode: (mode: LoopMode) => void
  loopSentence: (index?: number) => void
  setPoint: (which: 'a' | 'b') => void
  clearAB: () => void
  setRepeats: (repeats: number) => void
  stepCue: (delta: number) => void
}

/** Clamp a speed index into range. */
function clampSpeed(index: number): number {
  if (!Number.isFinite(index)) return DEFAULT_SPEED_INDEX
  return Math.min(SPEED_PRESETS.length - 1, Math.max(0, Math.trunc(index)))
}

export const useMediaPlayer = create<MediaPlayerState>((set, get) => ({
  cues: [],
  activeIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  speedIndex: DEFAULT_SPEED_INDEX,
  loopMode: 'none',
  repeats: DEFAULT_REPEATS,
  playsDone: 0,
  pointA: null,
  pointB: null,
  seekRequest: null,
  seekToken: 0,
  guard: null,

  reset: (cues) =>
    set((state) => ({
      cues,
      activeIndex: findActiveCue(cues, 0),
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      loopMode: 'none',
      playsDone: 0,
      pointA: null,
      pointB: null,
      seekRequest: null,
      seekToken: state.seekToken + 1,
      guard: null,
    })),

  setPlaying: (playing) => set({ isPlaying: playing }),

  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),

  seek: (time) =>
    set((state) => ({
      seekRequest: Math.max(0, time),
      seekToken: state.seekToken + 1,
      currentTime: Math.max(0, time),
      activeIndex: findActiveCue(state.cues, time),
      guard: { target: Math.max(0, time), expiresAt: Date.now() + SEEK_GUARD_MS },
    })),

  onTime: (time) => {
    const { guard, cues } = get()
    if (guard !== null) {
      if (Date.now() > guard.expiresAt) {
        set({ guard: null })
      } else if (Math.abs(time - guard.target) > SEEK_TOLERANCE_SECONDS) {
        // A position from before the seek: ignore it rather than snapping back.
        return
      } else {
        set({ guard: null })
      }
    }

    const state = get()
    const decision = planLoop({
      time,
      mode: state.loopMode,
      cueStart: state.cues[state.activeIndex]?.start ?? null,
      cueEnd: state.cues[state.activeIndex]?.end ?? null,
      pointA: state.pointA,
      pointB: state.pointB,
      repeats: state.repeats,
      playsDone: state.playsDone,
    })

    if (decision.stop) {
      set({ isPlaying: false, currentTime: time, playsDone: decision.playsDone })
      return
    }
    if (decision.seekTo !== null) {
      get().seek(decision.seekTo)
      set({ playsDone: decision.playsDone })
      return
    }
    set({ currentTime: time, activeIndex: findActiveCue(cues, time) })
  },

  setDuration: (duration) => set({ duration: Number.isFinite(duration) ? duration : 0 }),

  setSpeedIndex: (index) => set({ speedIndex: clampSpeed(index) }),

  cycleSpeed: (delta) => set((state) => ({ speedIndex: clampSpeed(state.speedIndex + delta) })),

  setLoopMode: (mode) => set({ loopMode: mode, playsDone: 0, isPlaying: mode === 'none' ? get().isPlaying : true }),

  loopSentence: (index) => {
    const state = get()
    const target = index ?? state.activeIndex
    const cue = state.cues[target]
    if (cue === undefined) return
    set({ activeIndex: target, loopMode: 'sentence', playsDone: 0 })
    state.seek(cue.start)
    set({ isPlaying: true })
  },

  setPoint: (which) => {
    const state = get()
    const time = state.currentTime
    if (which === 'a') {
      set({ pointA: time, loopMode: 'ab', playsDone: 0 })
      return
    }
    // A B point that is not after the A point would make an empty window, so the
    // pair is kept ordered instead of silently never looping.
    if (state.pointA !== null && time <= state.pointA) return
    set({ pointB: time, loopMode: 'ab', playsDone: 0 })
  },

  clearAB: () => set({ pointA: null, pointB: null, loopMode: 'none', playsDone: 0 }),

  setRepeats: (repeats) => set({ repeats: Math.max(0, Math.trunc(repeats)), playsDone: 0 }),

  stepCue: (delta) => {
    const state = get()
    const next = stepCueIndex(state.activeIndex, delta, state.cues.length)
    const cue = state.cues[next]
    if (cue === undefined) return
    set({ activeIndex: next, playsDone: 0 })
    state.seek(cue.start)
  },
}))

/** The speed currently in effect. */
export function currentSpeed(state: Pick<MediaPlayerState, 'speedIndex'>): number {
  return SPEED_PRESETS[state.speedIndex] ?? 1
}
