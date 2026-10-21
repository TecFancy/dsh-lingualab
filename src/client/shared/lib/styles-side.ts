/**
 * The stylesheet's last part: the right column collapsed, and the top bar on a narrow or touch screen.
 *
 * It is appended to `STYLES` (see `styles.ts`), after the responsive rules, so these refine what comes before at the same
 * specificity or more. It is a file of its own because `styles.ts` is at its size limit; the rules here are the page's
 * like any other, and `styles.test.ts` reads them through `STYLES`.
 */
export const SIDE_STYLES = `
/* ── the right column collapsed ───────────────────────────────────────────────────────────────────
   The column is not drawn (no rail), so the practice column has the whole row. The picture's share of the width was 64%
   above a 600px column, which would leave a wide column's extra width as empty margin either side of a picture that barely
   grows; collapsed, the picture takes its share of the whole width instead. Its other bounds are unchanged: 720px, 405px
   of stage, the height cap (42% of the column, 30% under 700px), and the page's measurement that steps it aside under 120px. */
.dsh-lingualab-body.is-side-collapsed .dsh-lingualab-videostage{--ll-pic-share:1}
.dsh-lingualab-body.is-side-collapsed .dsh-lingualab-picture,
.dsh-lingualab-body.is-side-collapsed .dsh-lingualab-videocard{--ll-pic-w:100%}

/* ── the top bar in a narrow row ──────────────────────────────────────────────────────────────────
   The top bar spans the panel, so its own width is the question (ll-top), not the window's. Its buttons take about 480px
   with their words (more with a segment list), so in a bar of 720px or less (a 696px content box; an iPad in portrait with
   the host's sidebar open gives 540px) the back chip and the kept chip drop their words and key cap and keep their icon
   (and the count), about 110px back for the title. Their names stay as aria-label and title. */
.dsh-lingualab-top{container:ll-top/inline-size}
/* Only the title gives way: a chip or a button that shrinks clips its word or its icon. */
.dsh-lingualab-top>.dsh-lingualab-chip,.dsh-lingualab-top>.dsh-lingualab-icon-btn,.dsh-lingualab-top>.dsh-lingualab-seg-holder{flex:none}
@container ll-top (max-width:696px){
  .dsh-lingualab-top .dsh-lingualab-chip-text,.dsh-lingualab-top .dsh-lingualab-chip kbd{display:none}
  .dsh-lingualab-top .dsh-lingualab-chip{padding:0 9px}
}

/* A touch screen: the top bar's chips (28px) and icon buttons (32px) keep their look and get a 44px hit area from an
   invisible margin, as the pills on the picture do. The margin is whatever brings each side to 44px and never less than
   nothing, so a chip wider than 44px is only taller, and the 8px gaps hold the 6px a 32px button needs either side. */
@media (hover:none) and (pointer:coarse){
  .dsh-lingualab-top .dsh-lingualab-chip,.dsh-lingualab-top .dsh-lingualab-icon-btn{position:relative}
  .dsh-lingualab-top .dsh-lingualab-chip::after,.dsh-lingualab-top .dsh-lingualab-icon-btn::after{content:'';position:absolute;
    inset:min(0px,calc((100% - 44px) / 2))}
}
`
