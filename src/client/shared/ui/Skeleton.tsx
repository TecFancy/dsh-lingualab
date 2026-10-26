/**
 * Placeholders shown while the library or an episode's subtitles are on their way.
 *
 * They mirror the real layout (the home's bench, the episode grid, the big sentence), so
 * the page does not jump when the content arrives. The wrapper fades in after a short
 * delay (see `.dsh-lingualab-sk-wrap`): a load that finishes within that delay never
 * shows a placeholder at all, which beats a skeleton that flashes for one frame.
 */

/** One shimmering bar. */
function Bar({
  width,
  height,
  radius,
  className,
}: {
  readonly width: string
  readonly height: number
  readonly radius?: number
  readonly className?: string
}) {
  const classes = className === undefined ? 'dsh-lingualab-sk' : `dsh-lingualab-sk ${className}`
  return <span className={classes} style={{ width, height, borderRadius: radius ?? 8 }} />
}

/**
 * The home page while the library listing loads.
 *
 * The bench's shape: a framed block where the stage will be (the line above the title, the title, the
 * bar, the five steps and the button) and two washed blocks where the right column's cards go. The page
 * does not jump when the listing lands. The label is read out, not shown.
 */
export function HomeSkeleton({ label }: { readonly label: string }) {
  return (
    <div className="dsh-lingualab-sk-wrap dsh-lingualab-sk-home" role="status" aria-live="polite" aria-label={label}>
      <div className="dsh-lingualab-sk-home-stage">
        <Bar width="96px" height={12} radius={4} />
        <Bar width="220px" height={36} radius={6} />
        <Bar width="100%" height={6} radius={999} />
        <Bar width="100%" height={40} radius={6} />
        <Bar width="132px" height={44} radius={10} />
      </div>
      <div className="dsh-lingualab-sk-home-side" aria-hidden="true">
        <span />
        <span />
      </div>
    </div>
  )
}

/** The transcript column while an episode's subtitles load. */
export function ListSkeleton({ label }: { readonly label: string }) {
  const widths = ['88%', '64%', '92%', '48%', '80%', '70%']
  return (
    <div className="dsh-lingualab-sk-wrap dsh-lingualab-sk-list" role="status" aria-live="polite" aria-label={label}>
      {widths.map((width, index) => (
        <div className="dsh-lingualab-sk-item" key={index}>
          <Bar width="36px" height={11} />
          <Bar width={width} height={14} />
          <Bar width={`calc(${width} - 16%)`} height={11} />
        </div>
      ))}
    </div>
  )
}

/** The practice stage while an episode's subtitles load. */
export function StageSkeleton({ label }: { readonly label: string }) {
  return (
    <div className="dsh-lingualab-sk-wrap dsh-lingualab-sk-stage" role="status" aria-live="polite">
      <div className="dsh-lingualab-sk-lines">
        <Bar width="78%" height={34} />
        <Bar width="54%" height={34} />
        <Bar width="40%" height={16} />
      </div>
      <span className="dsh-lingualab-sk-label">
        <span className="dsh-lingualab-spinner" aria-hidden />
        {label}
      </span>
    </div>
  )
}
