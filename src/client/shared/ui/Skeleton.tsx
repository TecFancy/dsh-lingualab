/**
 * Placeholders shown while the library or an episode's subtitles are on their way.
 *
 * They mirror the real layout (the resume card, the episode grid, the big sentence), so
 * the page does not jump when the content arrives. The wrapper fades in after a short
 * delay (see `.dsh-lingualab-sk-wrap`): a load that finishes within that delay never
 * shows a placeholder at all, which beats a skeleton that flashes for one frame.
 */

/** One shimmering bar. */
function Bar({ width, height, radius }: { readonly width: string; readonly height: number; readonly radius?: number }) {
  return <span className="dsh-lingualab-sk" style={{ width, height, borderRadius: radius ?? 8 }} />
}

/** The home page while the library listing loads. */
export function HomeSkeleton({ label }: { readonly label: string }) {
  return (
    <div className="dsh-lingualab-sk-wrap" role="status" aria-live="polite" aria-label={label}>
      <div className="dsh-lingualab-sk-resume">
        <Bar width="84px" height={12} />
        <Bar width="62%" height={30} />
        <div className="dsh-lingualab-sk-row">
          <Bar width="72px" height={12} />
          <Bar width="56px" height={12} />
          <Bar width="96px" height={12} />
        </div>
        <Bar width="100%" height={6} radius={999} />
        <Bar width="148px" height={40} radius={999} />
      </div>
      <div className="dsh-lingualab-sk-row">
        <Bar width="96px" height={16} />
      </div>
      <div className="dsh-lingualab-sk-grid">
        {[0, 1, 2].map((index) => (
          <div className="dsh-lingualab-sk-card" key={index}>
            <div className="dsh-lingualab-sk-row is-between">
              <Bar width="32px" height={32} radius={10} />
              <Bar width="56px" height={20} radius={999} />
            </div>
            <Bar width="86%" height={16} />
            <Bar width="52%" height={12} />
            <Bar width="100%" height={4} radius={999} />
          </div>
        ))}
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
