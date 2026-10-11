/** Public API of the timing editor: the strip under the stage, and the hook that drives it. */
export { TimingStrip, type TimingStripProps } from './ui/TimingStrip.tsx'
export {
  useTimingEditor,
  type SavedTiming,
  type TimingEditor,
  type TimingEditorOptions,
  type TimingSession,
} from './model/useTimingEditor.ts'
