/**
 * dsh-lingualab — the left-rail row icon.
 *
 * Headphones over a tick: listening, on a clock. Drawn here rather than borrowed
 * because the rail hands `{ size, active }` to whichever component a registration
 * names, so a row's appearance is its plugin's business.
 */

/** Props the rail passes to a row icon. */
export interface IconProps {
  readonly size?: number
  readonly active?: boolean
}

export function LingualabIcon({ size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x={3} y={13.5} width={4} height={6.5} rx={2} />
      <rect x={17} y={13.5} width={4} height={6.5} rx={2} />
    </svg>
  )
}
