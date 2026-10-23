/**
 * An arrow pointing down, the mirror of `UpIcon`.
 *
 * In its own file only because `icons.tsx` is at its size limit; it uses the same `Svg`, so it lines up with the rest.
 */
import { Svg, type IconProps } from './icons.tsx'

export function DownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 3v9.5M4 9l4 3.5L12 9" />
    </Svg>
  )
}
