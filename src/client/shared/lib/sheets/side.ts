/**
 * The stylesheet's last part: how the top bar groups its right side, how it narrows or handles touch, and the right
 * column expanding, collapsing or floating over a narrow row.
 *
 * It is appended to `STYLES` (see `styles.ts`), after the responsive rules, so these refine what comes before at the same
 * specificity or more. It is a file of its own because `styles.ts` is at its size limit; the rules here are the page's
 * like any other, and `styles.test.ts` reads them through `STYLES`.
 */
export const SIDE_STYLES = `
/* ── the right column, collapsing in the row ─────────────────────────────────────────────────────
   The column's box in the row is a slot of its own, because two things have to move at different widths. The slot's
   width and opacity run together over .2s (the same number as SIDE_MS in PracticeSideSlot.tsx, so change both), which
   lets the stage beside it take the width back in the same transition. The transcript inside keeps its full width the
   whole way and is clipped by the slot instead, so its lines never rewrap on the frames of the way out. The slot gives
   up the hit test at once, and is hidden for the keyboard after the fade, so a leaving list cannot be pressed. */
@property --ll-pic-share{syntax:'<number>';inherits:true;initial-value:.64}
@property --ll-pic-w{syntax:'<length-percentage>';inherits:true;initial-value:64%}
.dsh-lingualab-side-slot{--ll-side-w:clamp(300px,34cqw,440px);flex:none;display:flex;overflow:hidden;
  width:0;opacity:0;visibility:hidden;pointer-events:none;
  transition:width .2s ease,opacity .2s ease,visibility 0s linear .2s}
.dsh-lingualab-side-slot.is-open{width:var(--ll-side-w);opacity:1;visibility:visible;pointer-events:auto;
  transition:width .2s ease,opacity .2s ease,visibility 0s}
/* The picture follows the column in the same .2s: its share of the width (the stage's flex basis) and its own width
   are registered above, so a change of either is a transition and not a jump. Under reduced motion the page's rule
   zeroes every transition, so both are set at once. */
.dsh-lingualab-videostage{transition:--ll-pic-share .2s ease}
.dsh-lingualab-picture,.dsh-lingualab-videocard{transition:--ll-pic-w .2s ease}

/* ── the right column collapsed ───────────────────────────────────────────────────────────────────
   The column is not drawn (no rail), so the practice column has the whole row. The picture's share of the width was 64%
   above a 600px column, which would leave a wide column's extra width as empty margin either side of a picture that barely
   grows; collapsed, the picture takes its share of the whole width instead. Its other bounds are unchanged: 720px, 405px
   of stage, the height cap (42% of the column, 30% under 700px), and the page's measurement that steps it aside under 120px. */
.dsh-lingualab-body.is-side-collapsed .dsh-lingualab-videostage{--ll-pic-share:1}
.dsh-lingualab-body.is-side-collapsed .dsh-lingualab-picture,
.dsh-lingualab-body.is-side-collapsed .dsh-lingualab-videocard{--ll-pic-w:100%}

/* ── the top bar grouped by what each control acts on ───────────────────────────────────────────
   The two buttons that act on the right column (the kept sentences, and collapsing it) form one group; the five steps
   and the settings form another, because they are this episode's progress and the page's global settings rather than
   the column's. A group keeps the bar's 8px gap between its own buttons, and the bar's gap puts 8px on either side of
   the 1px line that separates the groups, so neither group needs margin of its own. The line uses the chips' border
   token: the bar's own bottom border is too faint to read on an 18px line. Neither group is positioned and neither clips, so the five steps' drawer inside one of them still
   places itself against the page rather than against the bar. */
.dsh-lingualab-top-group{flex:none;display:flex;align-items:center;gap:8px}
.dsh-lingualab-top-group>.dsh-lingualab-chip,.dsh-lingualab-top-group>.dsh-lingualab-icon-btn{flex:none}
.dsh-lingualab-top-divider{flex:none;width:1px;height:18px;
  background:var(--dsw-alias-border-l2,rgba(0,0,0,0.1))}

/* ── the top bar in a narrow row ──────────────────────────────────────────────────────────────────
   The top bar spans the panel, so its own width is the question (ll-top), not the window's. Its buttons take about 480px
   with their words (more with a segment list), so in a bar of 720px or less (a 696px content box; an iPad in portrait with
   the host's sidebar open gives 540px) the back chip and the kept chip drop their words and key cap and keep their icon
   (and the count), about 110px back for the title. Their names stay as aria-label and title. */
.dsh-lingualab-top{container:ll-top/inline-size}
/* Only the title gives way: a group, a chip or a button that shrinks clips its word or its icon. */
.dsh-lingualab-top>.dsh-lingualab-chip,.dsh-lingualab-top>.dsh-lingualab-icon-btn,.dsh-lingualab-top>.dsh-lingualab-seg-holder,.dsh-lingualab-top>.dsh-lingualab-top-group{flex:none}
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

/* ── the right column over a narrow stage ────────────────────────────────────────────────────────
   Under 982px the row cannot keep an expanded column beside the stage without the stage dropping to its narrow layout
   (see "sideFloats"), so the column becomes a drawer over it. The body is the drawer's containing block for as long as
   the row is narrow, which includes the way out: the row's width does not change when the drawer starts to leave, so the
   drawer must not fall back into the flow on that frame. The slot itself gives no width in this mode (the drawer is
   absolute), and reads "is-floating" from the row's width rather than from the open state, so the leaving drawer keeps
   its place and its transform. The drawer keeps the transcript's own scroll, and its width leaves 48px of the stage
   showing at any row width. The scrim sits over the stage and under the drawer, both over the finish card (z-index 15)
   and under the five-steps drawer (21 and 22). The way in and the way out are the same transition, from the slot's
   is-open, so the drawer slides and fades both ways instead of appearing in one frame. */
.dsh-lingualab-body.is-side-narrow{position:relative}
.dsh-lingualab-side-slot.is-floating{display:contents}
.dsh-lingualab-side-slot.is-floating .dsh-lingualab-transcript{position:absolute;top:0;right:0;bottom:0;z-index:17;
  width:min(360px,calc(100% - 48px));background:var(--ll-surface);box-shadow:-18px 0 48px rgba(0,0,0,0.28);
  transform:translateX(100%);opacity:0;pointer-events:none;
  transition:transform .2s ease,opacity .2s ease}
.dsh-lingualab-side-slot.is-floating.is-open .dsh-lingualab-transcript{transform:none;opacity:1;pointer-events:auto}
.dsh-lingualab-side-scrim{position:absolute;inset:0;z-index:16;border:0;padding:0;cursor:pointer;
  background:var(--ll-mask);opacity:0;pointer-events:none;transition:opacity .2s ease}
.dsh-lingualab-side-scrim.is-open{opacity:1;pointer-events:auto}
/* The drawer takes no width from the stage: the picture gets the whole row, as it does collapsed. Its other bounds
   (720px, 405px of stage, the height cap, "is-picture-squeezed") are untouched. */
.dsh-lingualab-body.is-side-narrow .dsh-lingualab-videostage{--ll-pic-share:1}
.dsh-lingualab-body.is-side-narrow .dsh-lingualab-picture,
.dsh-lingualab-body.is-side-narrow .dsh-lingualab-videocard{--ll-pic-w:100%}
`
