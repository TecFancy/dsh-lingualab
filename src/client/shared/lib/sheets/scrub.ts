/**
 * The progress bar's rules: the track, the rail with its sentence ticks, the thumb, and the label above it (the hover
 * label and the fine-scrub label). `STYLES` interpolates this at the place these rules always had in the sheet, so the
 * cascade is unchanged; it lives apart only to keep `styles.ts` from growing.
 */
export const SCRUB_STYLES = `
/* The scrubber. The hit area is 22px tall and the rail 6px, so it is easy to land on. */
.dsh-lingualab-scrub{display:flex;align-items:center;gap:12px;width:100%}
.dsh-lingualab-scrub.is-disabled{opacity:0.5}
.dsh-lingualab-scrub-track{position:relative;flex:1;min-width:0;height:22px;cursor:pointer;touch-action:none;user-select:none}
.dsh-lingualab-scrub.is-disabled .dsh-lingualab-scrub-track{cursor:default}
.dsh-lingualab-scrub-rail{position:absolute;left:0;right:0;top:50%;height:6px;margin-top:-3px;border-radius:999px;
  overflow:hidden;background:var(--ll-track);transition:height var(--ll-fade),margin var(--ll-fade)}
.dsh-lingualab-scrub-track:hover .dsh-lingualab-scrub-rail{height:8px;margin-top:-4px}
.dsh-lingualab-scrub-ticks{position:absolute;inset:0;width:100%;height:100%}
.dsh-lingualab-scrub-ticks path{stroke:var(--dsw-alias-label-secondary,#61666b);stroke-width:1;opacity:0.35}
.dsh-lingualab-scrub-fill{position:absolute;top:0;bottom:0;left:0;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-scrub-ghost{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;
  background:var(--dsw-alias-label-primary,#0f1115);opacity:0.45}
.dsh-lingualab-scrub-knob{position:absolute;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#0f1115);transform:scale(.8);transition:transform var(--ll-fade);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 24%,transparent)}
.dsh-lingualab-scrub-track:hover .dsh-lingualab-scrub-knob,.dsh-lingualab-scrub.is-held .dsh-lingualab-scrub-knob{transform:scale(1.1)}
.dsh-lingualab-scrub-tip{position:absolute;bottom:calc(100% + 6px);z-index:8;display:flex;flex-direction:column;gap:2px;
  box-sizing:border-box;width:max-content;max-width:240px;transform:translateX(-50%);padding:6px 10px;border-radius:10px;font-size:12px;
  text-align:left;pointer-events:none;color:var(--dsw-alias-label-primary,inherit);
  background:var(--ll-surface);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));box-shadow:0 10px 28px rgba(0,0,0,0.25)}
.dsh-lingualab-scrub-tip b{font-variant-numeric:tabular-nums}
.dsh-lingualab-scrub-tip>span{color:var(--dsw-alias-label-secondary,#61666b);display:-webkit-box;-webkit-line-clamp:2;
  -webkit-box-orient:vertical;overflow:hidden}
/* While the thumb is held the label leads with the scrub speed, then the time and the sentence number. The inline
   left and max-width keep it inside the player card (placeLabel in widgets/control-bar/lib/fine-scrub.ts). */
.dsh-lingualab-scrub-tip-head{display:flex;align-items:center;gap:8px;white-space:nowrap;font-variant-numeric:tabular-nums}
.dsh-lingualab-scrub-tip-head i{font-style:normal;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-scrub-tip .dsh-lingualab-scrub-speed{display:inline-flex;align-items:center;height:18px;padding:0 7px;
  border-radius:999px;font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary,#61666b);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.12))}
.dsh-lingualab-scrub-tip .dsh-lingualab-scrub-speed.is-slow{color:var(--dsw-alias-brand-primary,#0f1115);
  border-color:var(--dsw-alias-brand-primary,#0f1115);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 8%,transparent)}
`
