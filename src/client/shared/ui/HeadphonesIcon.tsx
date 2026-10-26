/**
 * The plugin's own mark: headphones, for the row it contributes to the host's 「更多」 menu.
 *
 * In its own file only because `icons.tsx` is at its size limit; it uses the same `Svg`, so it lines up
 * with the rest. A menu row has room for an icon and a name and nothing else, so the mark has to read at
 * 16 units rather than be a picture.
 */
import { Svg, type IconProps } from './icons.tsx'

/** The headphone mark of LinguaLab. */
export function HeadphonesIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 9.5V8a5.5 5.5 0 0 1 11 0v1.5" />
      <rect x={1.5} y={9} width={3.5} height={4.5} rx={1.75} />
      <rect x={11} y={9} width={3.5} height={4.5} rx={1.75} />
    </Svg>
  )
}
