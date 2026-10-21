/**
 * The right column's toggle: a window with its right-hand column, drawn in the stroke of the other icons.
 *
 * In its own file only because `icons.tsx` is at its size limit; it uses the same `Svg`, so it lines up with the rest.
 */
import { Svg, type IconProps } from './icons.tsx'

/** `open`: the column is shown, so its part of the window is shaded. */
export function SideColumnIcon({ open = false, ...props }: IconProps & { readonly open?: boolean }) {
  return (
    <Svg {...props}>
      <rect x={2} y={3} width={12} height={10} rx={2} />
      {open ? <path d="M10 3h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2Z" fill="currentColor" stroke="none" opacity={0.35} /> : null}
      <path d="M10 3v10" />
    </Svg>
  )
}
