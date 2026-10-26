/**
 * The home's bench: the stage with its five steps, the right column's two cards, the library table and the foot.
 *
 * Appended to `STYLES` (see `styles.ts`) before the last part, and read by `styles.test.ts` through it like any other
 * rule. The welcome page, the drop veil, the import report and the version line stay in `styles.ts`, where they were.
 * Colours are the host's tokens only: the brand for what to do next, the success state for a step done, the wash for
 * a card that is not the stage.
 */
export const HOME_STYLES = `
/* ── home: the bench ──────────────────────────────────────────── */
.dsh-lingualab-home{container:ll-home/inline-size}
.dsh-lingualab-home-inner{display:flex;flex-direction:column;gap:40px;width:min(1120px,100%);margin:0 auto;
  padding:40px 24px 0;box-sizing:border-box}
.dsh-lingualab-home-inner > .dsh-lingualab-report,.dsh-lingualab-home-inner > .dsh-lingualab-error{margin:0}
.dsh-lingualab-home .dsh-lingualab-btn{height:40px;padding:0 16px;border-width:1px;border-radius:10px;
  box-sizing:border-box;border-color:var(--dsw-alias-border-l2,rgba(0,0,0,0.1));font-weight:500}
.dsh-lingualab-home .dsh-lingualab-btn.is-primary{height:44px;padding:0 20px;border-color:transparent;
  font-size:15px;font-weight:600;gap:10px}
.dsh-lingualab-home .dsh-lingualab-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#0f1115);
  outline-offset:2px}
.dsh-lingualab-home .dsh-lingualab-btn.is-text{border-color:transparent;padding:0 10px;
  color:var(--dsw-alias-label-secondary,#61666b)}
/* The small line above a block's heading, on the stage and on the review card. */
.dsh-lingualab-kicker{margin:0;font-size:13px;color:var(--dsw-alias-label-secondary,#61666b);
  font-variant-numeric:tabular-nums}
.dsh-lingualab-bench{display:flex;flex-wrap:wrap;gap:24px;align-items:stretch}
.dsh-lingualab-bench-side{flex:1 1 300px;min-width:0;display:flex;flex-direction:column;gap:24px}
/* With no stage the two cards lie side by side and take the row. */
.dsh-lingualab-bench.is-solo .dsh-lingualab-bench-side{flex-direction:row;flex-wrap:wrap}
.dsh-lingualab-bench.is-solo .dsh-lingualab-bench-side > *{flex:1 1 300px}

/* The stage: the one card with a frame, because it is the one thing to do. */
.dsh-lingualab-stage-card{flex:999 1 560px;min-width:0;box-sizing:border-box;display:flex;flex-direction:column;
  gap:28px;padding:32px;border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));border-radius:16px;
  background:var(--ll-surface);container:ll-stage/inline-size}
.dsh-lingualab-stage-head{display:flex;flex-wrap:wrap;align-items:flex-end;gap:16px 24px}
.dsh-lingualab-stage-id{flex:1 1 260px;min-width:0;display:flex;flex-direction:column;gap:8px}
.dsh-lingualab-stage-title{margin:0;font-size:40px;line-height:1.1;font-weight:700;letter-spacing:-.02em;
  word-break:break-word}
.dsh-lingualab-chips{display:flex;flex-wrap:wrap;gap:6px;margin:0;font-size:12px}
.dsh-lingualab-chips span{padding:2px 8px;border-radius:999px;background:var(--ll-hover);
  color:var(--dsw-alias-label-secondary,#61666b);font-variant-numeric:tabular-nums}
.dsh-lingualab-chips span.is-warn{color:var(--dsw-alias-state-warn-primary,#f59e0b);font-weight:500}
.dsh-lingualab-where{text-align:right}
.dsh-lingualab-where-num{font-size:32px;line-height:1;font-weight:600;letter-spacing:-.02em;
  font-variant-numeric:tabular-nums}
.dsh-lingualab-where-of{font-size:20px;font-weight:500;color:var(--ll-muted)}
.dsh-lingualab-where-num.is-word{font-size:15px;font-weight:500;letter-spacing:0;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-where-sub{margin-top:6px;font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);
  font-variant-numeric:tabular-nums;white-space:nowrap}
/* One bar per segment, a single bar for a whole file. Done is full; the current one fills as far as listening got;
   a current one of unknown length gets a ring, so it does not read as nothing heard. */
.dsh-lingualab-cells{display:flex;gap:4px}
.dsh-lingualab-seg{position:relative;flex:1;height:6px;border-radius:999px;background:var(--ll-track);overflow:hidden}
.dsh-lingualab-seg.is-done{background:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-seg i{position:absolute;left:0;top:0;bottom:0;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-seg.is-hollow{background:transparent;box-shadow:inset 0 0 0 1.5px var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-cells.is-row{gap:3px}
.dsh-lingualab-cells.is-row .dsh-lingualab-seg{height:4px}
.dsh-lingualab-cells.is-row .dsh-lingualab-seg.is-hollow{box-shadow:inset 0 0 0 1px var(--dsw-alias-brand-primary,#0f1115)}
/* The five steps: a bar, a name and one line each. Done is the success colour, the next step the brand. */
.dsh-lingualab-steps{display:flex;flex-direction:column;gap:12px}
.dsh-lingualab-steps-head{display:flex;align-items:baseline;gap:10px}
.dsh-lingualab-steps-head h2{margin:0;font-size:14px;font-weight:600}
.dsh-lingualab-steps-head span{font-size:12px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-steps-list{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:0;padding:0;
  list-style:none}
.dsh-lingualab-step{display:flex;flex-direction:column;gap:8px;min-width:0}
.dsh-lingualab-step-bar{position:relative;height:4px;border-radius:999px;background:var(--ll-track);overflow:hidden}
.dsh-lingualab-step-bar i{position:absolute;left:0;top:0;bottom:0;background:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-step.is-done .dsh-lingualab-step-bar{background:var(--dsw-alias-state-success-primary,#22c55e)}
.dsh-lingualab-step.is-now .dsh-lingualab-step-bar{
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 18%,transparent)}
.dsh-lingualab-step-name{font-size:13px;font-weight:500;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-step.is-done .dsh-lingualab-step-name{color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-step.is-now .dsh-lingualab-step-name{color:var(--dsw-alias-brand-primary,#0f1115);font-weight:600}
.dsh-lingualab-step-meta{font-size:12px;line-height:1.4;color:var(--dsw-alias-label-secondary,#61666b);
  font-variant-numeric:tabular-nums}
/* A narrow stage (a phone, or an iPad in portrait beside the host's sidebar) has no room for five columns: each step
   becomes a row, its bar a short stroke on the left, its line under its name. */
@container ll-stage (max-width:500px){
  .dsh-lingualab-steps-list{grid-template-columns:minmax(0,1fr);gap:10px}
  .dsh-lingualab-step{display:grid;grid-template-columns:28px minmax(0,1fr);align-items:center;gap:2px 12px}
  .dsh-lingualab-step-meta{grid-column:2}
  .dsh-lingualab-stage-title{font-size:32px}
  .dsh-lingualab-where{text-align:left}
}
.dsh-lingualab-stage-act{display:flex;flex-wrap:wrap;align-items:center;gap:12px 16px}
.dsh-lingualab-stage-hint{font-size:13px;color:var(--dsw-alias-label-secondary,#61666b);font-variant-numeric:tabular-nums}

/* The review card: a washed card, one number big, the sources as a short list. */
.dsh-lingualab-review-card{display:flex;flex-direction:column;gap:16px;padding:24px;border-radius:16px;
  background:var(--ll-wash)}
.dsh-lingualab-review-line{display:flex;align-items:baseline;gap:8px;font-size:14px}
.dsh-lingualab-review-num{font-size:40px;line-height:1;font-weight:700;font-variant-numeric:tabular-nums}
.dsh-lingualab-review-from{margin:0;font-size:13px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-review-list{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none;font-size:13px}
.dsh-lingualab-review-list li{display:flex;justify-content:space-between;gap:12px}
.dsh-lingualab-review-list li span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-review-list li span + span{flex:none;color:var(--dsw-alias-label-secondary,#61666b);
  font-variant-numeric:tabular-nums}
.dsh-lingualab-review-card .dsh-lingualab-btn{align-self:flex-start;background:var(--ll-surface)}
/* The add card: a dashed frame that turns the brand colour while a file is over the page. */
.dsh-lingualab-add-card{flex:1;display:flex;flex-direction:column;justify-content:center;gap:14px;padding:24px;
  border:1.5px dashed var(--dsw-alias-border-l2,rgba(0,0,0,0.1));border-radius:16px;
  transition:border-color var(--ll-fade),background var(--ll-fade)}
.dsh-lingualab-drop.is-over .dsh-lingualab-add-card{border-color:var(--dsw-alias-brand-primary,#0f1115);
  background:var(--ll-wash)}
.dsh-lingualab-add-head{display:flex;align-items:center;gap:10px}
.dsh-lingualab-add-mark{display:grid;place-items:center;width:32px;height:32px;border-radius:8px;
  background:var(--ll-hover);color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-add-title{font-size:14px;font-weight:600}
.dsh-lingualab-add-body{margin:0;font-size:13px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-add-release{display:none}
.dsh-lingualab-drop.is-over .dsh-lingualab-add-text{display:none}
.dsh-lingualab-drop.is-over .dsh-lingualab-add-release{display:inline;color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-add-act{display:flex;flex-wrap:wrap;gap:8px}
.dsh-lingualab-add-act .dsh-lingualab-btn{height:36px}

/* The library: a heading with its filter, then a table that scrolls sideways in its box on a narrow screen. */
.dsh-lingualab-library{display:flex;flex-direction:column;gap:12px}
.dsh-lingualab-library-head{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px}
.dsh-lingualab-library-head h2{margin:0;font-size:18px;font-weight:600}
.dsh-lingualab-library-head .dsh-lingualab-segmented{max-width:100%;overflow-x:auto}
.dsh-lingualab-library-head .dsh-lingualab-segmented button{flex:none;white-space:nowrap}
.dsh-lingualab-table-box{overflow-x:auto;border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));border-radius:12px}
.dsh-lingualab-table{min-width:720px}
.dsh-lingualab-table-head,.dsh-lingualab-table-row{display:grid;align-items:center;gap:16px;
  grid-template-columns:minmax(0,2.2fr) minmax(0,2fr) minmax(0,1.4fr) minmax(0,1fr) 24px}
.dsh-lingualab-table-head{padding:10px 20px;font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
.dsh-lingualab-table-row{width:100%;box-sizing:border-box;padding:14px 20px;border:0;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04));background:none;color:inherit;font:inherit;
  text-align:left;cursor:pointer;transition:background var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-table-row:last-child{border-bottom:0}
.dsh-lingualab-table-row:hover:not(:disabled){background:var(--ll-hover)}
.dsh-lingualab-table-row:disabled{opacity:.45;cursor:default}
.dsh-lingualab-table-row:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#0f1115);outline-offset:-2px}
.dsh-lingualab-table-empty{margin:0;padding:20px;font-size:13px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-cell-episode,.dsh-lingualab-cell-where{display:flex;flex-direction:column;gap:4px;min-width:0}
.dsh-lingualab-cell-where{gap:6px;font-size:13px;font-variant-numeric:tabular-nums}
.dsh-lingualab-row-title{font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-say{font-size:12px;line-height:1.45;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-say .is-warn{color:var(--dsw-alias-state-warn-primary,#f59e0b);font-style:normal;font-weight:500}
.dsh-lingualab-dots{display:flex;align-items:center;gap:4px;min-width:0}
.dsh-lingualab-dot-bar{flex:none;width:18px;height:6px;border-radius:999px;background:var(--ll-track)}
.dsh-lingualab-dot-bar.is-done{background:var(--dsw-alias-state-success-primary,#22c55e)}
.dsh-lingualab-dot-bar.is-now{background:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-dots-label{margin-left:6px;font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-cell-kept{font-size:13px;font-variant-numeric:tabular-nums}
.dsh-lingualab-cell-go{display:flex;color:var(--ll-muted)}

/* The foot: where the files live on the left, the build on the right, one line under a hairline. An empty library is
   the welcome card alone, so there the hairline is left out rather than drawn under nothing. */
.dsh-lingualab-pagefoot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 16px;
  padding:16px 0 28px;border-top:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
.dsh-lingualab-pagefoot.is-empty{padding-top:0;border-top:0}
.dsh-lingualab-folderline{display:flex;align-items:center;gap:6px;min-width:0;font-size:12px;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-folderline .dsh-lingualab-path{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-folderline svg{flex:none}

/* The home while the listing loads: the bench's shape, a big block and two small ones. */
.dsh-lingualab-sk-home{display:flex;flex-direction:row;flex-wrap:wrap;gap:24px}
.dsh-lingualab-sk-home-stage{flex:999 1 560px;display:flex;flex-direction:column;gap:20px;padding:32px;
  border:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04));border-radius:16px}
.dsh-lingualab-sk-home-side{flex:1 1 300px;display:flex;flex-direction:column;gap:24px}
.dsh-lingualab-sk-home-side > *{flex:1;min-height:140px;border-radius:16px;background:var(--ll-wash)}

/* A phone: the page's gutter and the stage's padding shrink so the content keeps its width. */
@container ll-home (max-width:560px){
  .dsh-lingualab-home-inner{padding:24px 16px 0;gap:28px}
  .dsh-lingualab-stage-card{padding:20px;gap:22px}
  .dsh-lingualab-review-card,.dsh-lingualab-add-card{padding:20px}
}

@media (hover:none) and (pointer:coarse){
  .dsh-lingualab-home .dsh-lingualab-btn,.dsh-lingualab-add-act .dsh-lingualab-btn{height:44px}
}
`
