/**
 * The speed picker's rules: three rows of chips above the speed button.
 *
 * Slow, then 1x alone, then fast. 1x is the speed a reader returns to most, so it gets a row of its own and the whole
 * width of the popover to hit. The slow and fast rows hold the presets on either side, so a jump across the range is
 * one press rather than a lap of the cycle.
 *
 * The speed button is at the left end of the row, so the picker grows to its right rather than to its left. It keeps
 * the menu's surface, shadow and place above the button, and is capped so it cannot leave the viewport.
 *
 * `STYLES` interpolates this after the responsive rules, before `SIDE_STYLES`, so it refines the menu's default right
 * edge. It lives apart only to keep `styles.ts` from growing.
 */
export const SPEED_STYLES = `
/* The picker opens from the left edge of the speed button. The base menu is 300px wide; the cap keeps it on screen. */
.dsh-lingualab-menu.is-speed{left:0;right:auto;max-width:calc(100vw - 32px)}
.dsh-lingualab-speed-row{display:grid;gap:4px}
.dsh-lingualab-speed-row.is-slow{grid-template-columns:repeat(5,minmax(0,1fr))}
/* 1x alone, across the row: the easiest chip to hit. */
.dsh-lingualab-speed-row.is-normal{grid-template-columns:1fr}
.dsh-lingualab-speed-row.is-fast{grid-template-columns:repeat(4,minmax(0,1fr))}
.dsh-lingualab-speed-chip{height:32px;padding:0 8px;border:0.5px solid transparent;border-radius:9px;background:none;
  color:var(--dsw-alias-label-secondary,#61666b);cursor:pointer;font:inherit;font-size:12px;white-space:nowrap;
  font-variant-numeric:tabular-nums;
  transition:background var(--ll-fade),color var(--ll-fade),border-color var(--ll-fade)}
.dsh-lingualab-speed-chip:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
/* The preset in force reads as the outlined chips of the row below. */
.dsh-lingualab-speed-chip.is-on{border-color:var(--dsw-alias-brand-primary,#0f1115);color:var(--dsw-alias-brand-primary,#0f1115);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 10%,transparent)}
.dsh-lingualab-speed-chip:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#0f1115);outline-offset:2px}
@media (hover:none) and (pointer:coarse){
  .dsh-lingualab-speed-chip{min-width:44px;min-height:44px}
}
`
