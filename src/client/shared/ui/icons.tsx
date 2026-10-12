/**
 * The page's icons, drawn here rather than borrowed.
 *
 * Emoji were the previous version's icons and they are the reason the transport row
 * never sat straight: ⏮ ▶ ⏭ 🔂 come from different fonts on different systems, so
 * their optical sizes and baselines disagree. These are 16-unit strokes sharing one
 * weight, so a row of them lines up, and they inherit `currentColor` from whatever
 * chip or button holds them.
 */
import type { SVGProps } from 'react'

/** Every icon takes a size, and nothing else. */
export interface IconProps {
  readonly size?: number
}

/** Shared geometry: one viewBox, one stroke weight, one set of caps. */
function Svg({ size = 16, children, ...rest }: IconProps & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  )
}

export function PlayIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 3.4 12.5 8 5 12.6Z" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function PauseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x={4.5} y={3.5} width={2.6} height={9} rx={0.8} fill="currentColor" stroke="none" />
      <rect x={8.9} y={3.5} width={2.6} height={9} rx={0.8} fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function PrevIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.6 5.5 8 12 12.4Z" fill="currentColor" stroke="none" />
      <path d="M4 4v8" />
    </Svg>
  )
}

export function NextIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 3.6 10.5 8 4 12.4Z" fill="currentColor" stroke="none" />
      <path d="M12 4v8" />
    </Svg>
  )
}

export function LoopIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 8a5 5 0 0 1 8.6-3.4M13 8a5 5 0 0 1-8.6 3.4" />
      <path d="M11.4 2.6v2.4H9M4.6 13.4V11H7" />
    </Svg>
  )
}

export function NoteIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 2.8h8v10.4L8 10.6l-4 2.6Z" />
    </Svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </Svg>
  )
}

export function ChevronIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 4l4 4-4 4" />
    </Svg>
  )
}

export function FolderIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 4.2h4l1.2 1.6h5.8v6.4a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1Z" />
    </Svg>
  )
}

export function AudioIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6.5 11.5V4.2l5-1v7.3" />
      <circle cx={5} cy={12} r={1.6} />
      <circle cx={10} cy={11} r={1.6} />
    </Svg>
  )
}

export function SubtitleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x={2.2} y={4} width={11.6} height={8} rx={1.4} />
      <path d="M4.8 9.4h2.2M9 9.4h2.2" />
    </Svg>
  )
}

export function UploadIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 10.5V3M5 5.6 8 2.8l3 2.8" />
      <path d="M3 10.5v1.8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1.8" />
    </Svg>
  )
}

export function StarIcon({ filled = false, ...props }: IconProps & { readonly filled?: boolean }) {
  return (
    <Svg {...props}>
      <path
        d="M8 2.2l1.7 3.6 3.9.5-2.9 2.7.8 3.9L8 10.9l-3.5 2 .8-3.9L2.4 6.3l3.9-.5Z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </Svg>
  )
}

export function MoreIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx={3.6} cy={8} r={1.1} fill="currentColor" stroke="none" />
      <circle cx={8} cy={8} r={1.1} fill="currentColor" stroke="none" />
      <circle cx={12.4} cy={8} r={1.1} fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function EditIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 13v-2.4L10.6 3a1.1 1.1 0 0 1 1.5 0l.9.9a1.1 1.1 0 0 1 0 1.5L5.4 13Z" />
      <path d="M9.4 4.2l2.4 2.4" />
    </Svg>
  )
}

export function MicIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x={6} y={2.2} width={4} height={7} rx={2} />
      <path d="M3.8 7.8a4.2 4.2 0 0 0 8.4 0M8 12v2" />
    </Svg>
  )
}

export function CopyIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x={5.2} y={5.2} width={7.6} height={7.6} rx={1.4} />
      <path d="M10.8 5.2V4a1.2 1.2 0 0 0-1.2-1.2H4A1.2 1.2 0 0 0 2.8 4v5.6A1.2 1.2 0 0 0 4 10.8h1.2" />
    </Svg>
  )
}

export function EyeIcon({ off = false, ...props }: IconProps & { readonly off?: boolean }) {
  return (
    <Svg {...props}>
      <path d="M1.8 8S4 3.8 8 3.8 14.2 8 14.2 8 12 12.2 8 12.2 1.8 8 1.8 8Z" />
      <circle cx={8} cy={8} r={1.8} />
      {off ? <path d="M3 13 13 3" /> : null}
    </Svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.4 8.4 6.6 11.4 12.6 4.8" />
    </Svg>
  )
}

export function UpIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 13V3.5M4 7l4-3.5L12 7" />
    </Svg>
  )
}

export function BackIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 3.5 5.5 8 10 12.5" />
    </Svg>
  )
}

export function TrashIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.8 4.4h10.4M6.2 4.4V3a1 1 0 0 1 1-1h1.6a1 1 0 0 1 1 1v1.4M4 4.4l.6 8a1.2 1.2 0 0 0 1.2 1.1h4.4a1.2 1.2 0 0 0 1.2-1.1l.6-8M6.8 7v4M9.2 7v4" />
    </Svg>
  )
}

export function UndoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.8 5v3.4h3.4M2.8 8.4A5.2 5.2 0 1 0 4.6 4.5L2.8 6" />
    </Svg>
  )
}

export function BookIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 12.6A1.6 1.6 0 0 1 4.6 11H13V2.6H4.6A1.6 1.6 0 0 0 3 4.2ZM3 12.6v.8h10" />
    </Svg>
  )
}
export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 3.2v9.6M3.2 8h9.6" />
    </Svg>
  )
}

/** Three lines of text, the second one longer than the third: a note. */
export function LinesIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.2 4.4h9.6M3.2 8h9.6M3.2 11.6h6" />
    </Svg>
  )
}

/** Two horizontal sliders, each with a knob: the settings. */
export function SettingsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 5h6.4M12.1 5h1.4M2.5 11h1.4M7.1 11h6.4" />
      <circle cx={10.5} cy={5} r={1.6} />
      <circle cx={5.5} cy={11} r={1.6} />
    </Svg>
  )
}

/** A camera: the mark for a video; `off` draws it struck through, for a picture that is hidden or cannot play. */
export function VideoIcon({ off = false, ...props }: IconProps & { readonly off?: boolean }) {
  return (
    <Svg {...props}>
      <rect x={1.5} y={3.5} width={9} height={9} rx={1.5} />
      <path d="m10.5 7 4-2.5v7l-4-2.5z" />
      {off ? <path d="M2 2l12 12" /> : null}
    </Svg>
  )
}

/** A warning triangle, for the card that says something is missing. */
export function WarnIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 2.5 14 13H2z" />
      <path d="M8 6.5v3M8 11.5v.01" />
    </Svg>
  )
}

/** A stopwatch, for the notice that the blind watch has started. */
export function TimerIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx={8} cy={8.5} r={5.5} />
      <path d="M8 5.5v3l2 1.5M6.5 1.5h3" />
    </Svg>
  )
}
