/**
 * The page stylesheet, rendered as an element by the page.
 *
 * Same rule as the other panels in this workspace: read the host's `--dsw-alias-*`
 * theme tokens and keep a fallback for each, so the page follows the active theme
 * without importing a single Harness Client package. Class names carry the plugin
 * prefix because a stylesheet rendered into the host document is not scoped by anything.
 *
 * **Only tokens the host declares.** The theme lists a fixed set (`bg-base`,
 * `bg-layer-1/2`, `bg-overlay`, `border-l1/l2`, `brand-primary`, `label-primary/
 * secondary`, and the four states). An earlier version also read `label-tertiary`,
 * `bg-layer-3`, `bg-mask-1` and `interactive-bg-hover`, none of which exist, and got
 * by on their fallbacks, which are tuned for one theme. The four derived values below
 * are the replacements, built from declared tokens with `color-mix`, so light and dark
 * both follow the theme instead of the fallback.
 */
export const STYLES = `
.dsh-lingualab-page{
  --ll-muted:color-mix(in srgb,var(--dsw-alias-label-secondary,#8a8f98) 80%,transparent);
  --ll-hover:color-mix(in srgb,var(--dsw-alias-label-primary,#888) 8%,transparent);
  --ll-track:color-mix(in srgb,var(--dsw-alias-label-primary,#888) 14%,transparent);
  --ll-mask:color-mix(in srgb,var(--dsw-alias-bg-base,#000) 55%,rgba(0,0,0,0.35));
  --ll-on-brand:var(--dsw-alias-bg-base,#fff);
  position:relative;display:flex;flex-direction:column;height:100%;min-height:0;overflow:hidden;
  background:var(--dsw-alias-bg-base,transparent);color:var(--dsw-alias-label-primary,inherit);
  font-size:14px;line-height:1.5;outline:none}
.dsh-lingualab-page:focus-visible{box-shadow:inset 0 0 0 2px var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-page button{font-family:inherit}
.dsh-lingualab-page button:focus-visible,.dsh-lingualab-page select:focus-visible,
.dsh-lingualab-page input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:1px}

/* ── top bar ─────────────────────────────────────────────────── */
.dsh-lingualab-top{flex:none;display:flex;align-items:center;gap:8px;height:48px;padding:0 12px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22))}
.dsh-lingualab-top-title{min-width:0;max-width:420px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font-weight:600;padding:0 4px}
.dsh-lingualab-spacer{flex:1;min-width:8px}
.dsh-lingualab-chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:999px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));background:none;cursor:pointer;
  color:var(--dsw-alias-label-secondary,#8a8f98);font:inherit;font-size:12px;white-space:nowrap}
.dsh-lingualab-chip:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-chip.is-on{border-color:var(--dsw-alias-brand-primary,#4d6bfe);color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-chip:disabled{opacity:0.45;cursor:default}
.dsh-lingualab-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;
  padding:0;border:0;border-radius:8px;background:none;color:var(--dsw-alias-label-secondary,#8a8f98);cursor:pointer}
.dsh-lingualab-icon-btn:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-icon-btn:disabled{opacity:0.4;cursor:default}
.dsh-lingualab-icon-btn.is-star.is-on{color:var(--dsw-alias-state-warn-primary,#b7791f)}

/* ── home ────────────────────────────────────────────────────── */
.dsh-lingualab-home{flex:1;min-height:0;display:flex;flex-direction:column}
.dsh-lingualab-drop{position:relative;flex:1;min-height:0;overflow:auto}
.dsh-lingualab-home-inner{display:flex;flex-direction:column;gap:20px;width:min(760px,100%);
  margin:0 auto;padding:28px 24px 32px;box-sizing:border-box}
.dsh-lingualab-welcome{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;
  padding:40px 24px;border:1.5px dashed var(--dsw-alias-border-l2,rgba(127,127,127,0.4));border-radius:16px;
  background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-welcome h1{margin:0;font-size:20px;font-weight:600}
.dsh-lingualab-welcome p{margin:0;max-width:460px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-welcome-icon{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;
  border-radius:999px;background:var(--ll-hover);color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-drop.is-over .dsh-lingualab-welcome{border-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-drop-veil{position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;
  background:var(--ll-mask);pointer-events:none}
.dsh-lingualab-drop-veil-card{display:flex;flex-direction:column;align-items:center;gap:6px;padding:28px 40px;
  border:2px dashed var(--dsw-alias-brand-primary,#4d6bfe);border-radius:16px;
  background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1,#1b1c1f));font-size:16px}
.dsh-lingualab-drop-veil-card span{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98)}

.dsh-lingualab-resume{display:flex;flex-direction:column;gap:10px;padding:22px 24px;border-radius:16px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-resume-label{font-size:12px;color:var(--dsw-alias-brand-primary,#4d6bfe);font-weight:600;letter-spacing:.02em}
.dsh-lingualab-resume-title{margin:0;font-size:22px;line-height:1.3;font-weight:600;word-break:break-word}
.dsh-lingualab-resume-meta{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12.5px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-section{display:flex;flex-direction:column;gap:8px}
.dsh-lingualab-section-head{display:flex;align-items:center;gap:8px}
.dsh-lingualab-section-head h2{margin:0;font-size:14px;font-weight:600}
.dsh-lingualab-episodes{display:flex;flex-direction:column;gap:2px}
.dsh-lingualab-episode-row{display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;padding:10px 12px;
  border:0;border-radius:10px;background:none;color:inherit;font:inherit;cursor:pointer;text-align:left}
.dsh-lingualab-episode-row:hover{background:var(--ll-hover)}
.dsh-lingualab-episode-row:disabled{opacity:0.6;cursor:default}
.dsh-lingualab-bar{position:relative;height:4px;border-radius:999px;background:var(--ll-track);overflow:hidden}
.dsh-lingualab-bar.is-small{flex:none;width:64px;height:3px}
.dsh-lingualab-bar-fill{position:absolute;top:0;bottom:0;left:0;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-report{display:flex;flex-direction:column;gap:6px;padding:12px 14px;border-radius:12px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-folderline{display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:12px;
  color:var(--dsw-alias-label-secondary,#8a8f98);padding-top:4px}
.dsh-lingualab-link{border:0;background:none;padding:0;cursor:pointer;font:inherit;font-size:12px;
  color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-link:hover{text-decoration:underline}

/* ── stage: the sentence being worked on ─────────────────────── */
.dsh-lingualab-stage{flex:none;display:flex;flex-direction:column;gap:10px;padding:14px 20px 12px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22))}
.dsh-lingualab-stage-meta{display:flex;align-items:center;gap:10px;font-size:12px;
  color:var(--dsw-alias-label-secondary,#8a8f98);font-variant-numeric:tabular-nums}
.dsh-lingualab-stage-en{font-size:20px;line-height:1.35;font-weight:600;max-height:5.4em;overflow:auto;
  word-break:break-word}
.dsh-lingualab-stage-zh{margin-top:4px;font-size:14px;
  color:color-mix(in srgb,var(--dsw-alias-label-secondary,#8a8f98) 65%,transparent)}
.dsh-lingualab-stage-zh[data-zh="always"]{font-size:16px;color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-transport{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.dsh-lingualab-play{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;flex:none;
  border:0;border-radius:999px;background:var(--dsw-alias-brand-primary,#4d6bfe);color:var(--ll-on-brand);cursor:pointer}
.dsh-lingualab-play:disabled{opacity:0.45;cursor:default}
.dsh-lingualab-bar-btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;height:36px;min-width:36px;
  padding:0 10px;border:0.5px solid transparent;border-radius:9px;background:none;
  color:var(--dsw-alias-label-secondary,#8a8f98);cursor:pointer;font:inherit;font-size:12px;white-space:nowrap}
.dsh-lingualab-bar-btn:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-bar-btn.is-on{border-color:var(--dsw-alias-brand-primary,#4d6bfe);color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-bar-btn.is-star.is-on{border-color:var(--dsw-alias-state-warn-primary,#b7791f);
  color:var(--dsw-alias-state-warn-primary,#b7791f)}
.dsh-lingualab-bar-btn:disabled{opacity:0.4;cursor:default}
/* The sentence's own progress takes a fixed slice rather than all the slack: a flexible
   bar would push the modes to the far edge of a wide page, away from the sentence. */
.dsh-lingualab-progress{position:relative;flex:0 1 140px;min-width:48px;height:3px;border-radius:999px;
  background:var(--ll-track)}
.dsh-lingualab-progress-fill{position:absolute;top:0;bottom:0;left:0;border-radius:999px;
  background:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-time{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);font-variant-numeric:tabular-nums}
.dsh-lingualab-menu-holder{position:relative;display:inline-flex}
.dsh-lingualab-menu{position:absolute;right:0;top:calc(100% + 6px);z-index:25;display:flex;flex-direction:column;gap:10px;
  width:300px;padding:12px;border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));border-radius:12px;
  background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1,#1b1c1f));box-shadow:0 18px 48px rgba(0,0,0,0.3)}
.dsh-lingualab-menu-title{font-size:12px;font-weight:600}
.dsh-lingualab-menu-keys{display:grid;grid-template-columns:auto 1fr;gap:3px 12px;margin:0;padding-top:8px;
  border-top:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22));font-size:12px;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-menu-keys dt{font-weight:600;color:var(--dsw-alias-label-primary,inherit);
  font-variant-numeric:tabular-nums}
.dsh-lingualab-menu-keys dd{margin:0}
.dsh-lingualab-menu-row{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px}

/* ── subtitle list: the only scroller ────────────────────────── */
.dsh-lingualab-mid{position:relative;display:flex;flex:1;min-height:0}
.dsh-lingualab-list{flex:1;min-width:0;min-height:0;overflow:auto;padding:4px 0}
.dsh-lingualab-row{display:grid;grid-template-columns:76px minmax(0,1fr) auto;gap:12px;align-items:start;
  padding:8px 16px;cursor:pointer;border-left:2px solid transparent}
.dsh-lingualab-row:hover{background:var(--ll-hover)}
.dsh-lingualab-row.is-active{background:var(--dsw-alias-bg-layer-2,var(--ll-hover));
  border-left-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-row-time{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);
  font-variant-numeric:tabular-nums;padding-top:2px}
.dsh-lingualab-row-en{min-width:0;word-break:break-word;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-row.is-active .dsh-lingualab-row-en{color:var(--dsw-alias-label-primary,inherit)}
/* Dimmed is small and faint, so the English leads; always is the same size and weight of
   colour as the English, so both languages read as one block. */
.dsh-lingualab-row-zh{margin-top:2px;font-size:12px;
  color:color-mix(in srgb,var(--dsw-alias-label-secondary,#8a8f98) 55%,transparent)}
.dsh-lingualab-row.is-active .dsh-lingualab-row-zh{
  color:color-mix(in srgb,var(--dsw-alias-label-secondary,#8a8f98) 80%,transparent)}
.dsh-lingualab-list[data-zh="always"] .dsh-lingualab-row-zh{font-size:inherit;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-list[data-zh="always"] .dsh-lingualab-row.is-active .dsh-lingualab-row-zh{
  color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-row-actions{display:flex;align-items:center;gap:4px;opacity:0;visibility:hidden;transition:opacity .12s ease}
.dsh-lingualab-row:hover .dsh-lingualab-row-actions,.dsh-lingualab-row.is-active .dsh-lingualab-row-actions{
  opacity:1;visibility:visible}
/* A kept sentence shows its star at rest, so the list reads as a map of what you took. */
.dsh-lingualab-row-actions.is-kept{opacity:1;visibility:visible}
.dsh-lingualab-row-actions.is-kept .dsh-lingualab-icon-btn:not(.is-star){opacity:0;visibility:hidden}
.dsh-lingualab-row:hover .dsh-lingualab-row-actions.is-kept .dsh-lingualab-icon-btn,
.dsh-lingualab-row.is-active .dsh-lingualab-row-actions.is-kept .dsh-lingualab-icon-btn{opacity:1;visibility:visible}

/* ── bottom bar ──────────────────────────────────────────────── */
.dsh-lingualab-foot{flex:none;display:flex;align-items:center;gap:12px;min-height:32px;padding:4px 16px;
  border-top:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22));
  font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98)}

/* ── notes drawer (a side panel; an overlay on a narrow page) ── */
.dsh-lingualab-notes{display:flex;flex-direction:column;width:320px;flex:none;min-height:0;
  border-left:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22));
  background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-notes-head{display:flex;align-items:center;gap:8px;padding:10px 12px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.18));font-weight:600;font-size:13px}
.dsh-lingualab-notes-body{flex:1;min-height:0;overflow:auto;padding:4px 12px}
.dsh-lingualab-note{display:flex;gap:8px;padding:10px 0;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.16))}
.dsh-lingualab-note:last-of-type{border-bottom:0}
.dsh-lingualab-note.is-done .dsh-lingualab-note-text{color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-note-main{flex:1;min-width:0}
.dsh-lingualab-note-at{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);cursor:pointer;
  font-variant-numeric:tabular-nums;background:none;border:0;padding:0;font-family:inherit}
.dsh-lingualab-note-at:hover{color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-note-text{display:block;word-break:break-word}
.dsh-lingualab-note-zh{font-size:12.5px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-note-note{font-size:12px;color:var(--ll-muted);font-style:italic}
.dsh-lingualab-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.dsh-lingualab-tag{border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));background:none;color:inherit;
  cursor:pointer;font:inherit;font-size:11px;padding:0 7px;border-radius:999px}
.dsh-lingualab-tag.is-on{background:var(--dsw-alias-brand-primary,#4d6bfe);border-color:transparent;color:var(--ll-on-brand)}
@media (max-width:1100px){
  .dsh-lingualab-notes{position:absolute;top:0;right:0;bottom:0;z-index:12;
    background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1,#1b1c1f))}
}

/* ── layers: browse, media folder, steps ─────────────────────── */
.dsh-lingualab-mask{position:absolute;inset:0;z-index:20;display:flex;align-items:flex-start;justify-content:center;
  padding:44px 24px;background:var(--ll-mask)}
.dsh-lingualab-modal{display:flex;flex-direction:column;width:min(620px,100%);max-height:100%;overflow:hidden;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));border-radius:14px;
  background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1,#1b1c1f));box-shadow:0 18px 48px rgba(0,0,0,0.3)}
.dsh-lingualab-modal-head{display:flex;align-items:center;gap:8px;padding:12px 14px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22))}
.dsh-lingualab-modal-title{font-weight:600;font-size:14px}
.dsh-lingualab-tabs{display:flex;gap:4px;padding:8px 12px 0}
.dsh-lingualab-tab{border:0;border-bottom:2px solid transparent;background:none;color:var(--dsw-alias-label-secondary,#8a8f98);
  cursor:pointer;font:inherit;font-size:13px;padding:6px 8px}
.dsh-lingualab-tab.is-on{border-bottom-color:var(--dsw-alias-brand-primary,#4d6bfe);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-modal-body{flex:1;min-height:0;overflow:auto;padding:8px 10px 12px}
.dsh-lingualab-input{width:100%;box-sizing:border-box;background:var(--dsw-alias-bg-layer-2,transparent);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));border-radius:8px;color:inherit;
  font:inherit;font-size:13px;padding:6px 9px}
.dsh-lingualab-pick{display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;padding:7px 9px;
  border:0;border-radius:8px;background:none;color:inherit;font:inherit;cursor:pointer;text-align:left}
.dsh-lingualab-pick:hover{background:var(--ll-hover)}
.dsh-lingualab-pick.is-current{background:var(--dsw-alias-bg-layer-2,var(--ll-hover))}
.dsh-lingualab-pick-main{flex:1;min-width:0}
.dsh-lingualab-pick-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-pick-sub{display:block;font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-badge{flex:none;font-size:11px;color:var(--dsw-alias-label-secondary,#8a8f98);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));border-radius:999px;padding:1px 7px}
.dsh-lingualab-group{margin:10px 4px 4px;font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-empty{color:var(--dsw-alias-label-secondary,#8a8f98);padding:14px 12px;font-size:13px}
.dsh-lingualab-warn{color:var(--dsw-alias-state-warn-primary,#b7791f);font-size:12.5px;padding:6px 0}
.dsh-lingualab-error{color:var(--dsw-alias-state-error-primary,#c53030);font-size:12.5px;padding:6px 0}
.dsh-lingualab-btn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:8px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));background:none;color:inherit;
  font:inherit;font-size:13px;cursor:pointer;white-space:nowrap}
.dsh-lingualab-btn:hover{background:var(--ll-hover)}
.dsh-lingualab-btn.is-on{border-color:var(--dsw-alias-brand-primary,#4d6bfe);color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-btn.is-primary{background:var(--dsw-alias-brand-primary,#4d6bfe);border-color:transparent;color:var(--ll-on-brand)}
.dsh-lingualab-btn.is-primary:hover{background:var(--dsw-alias-brand-primary,#4d6bfe);filter:brightness(1.08)}
.dsh-lingualab-btn.is-large{height:38px;padding:0 18px;font-size:14px;border-radius:10px}
.dsh-lingualab-btn:disabled{opacity:0.45;cursor:default}
.dsh-lingualab-popover{position:absolute;top:44px;right:12px;z-index:25;width:300px;padding:8px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));border-radius:12px;
  background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1,#1b1c1f));box-shadow:0 18px 48px rgba(0,0,0,0.3)}

/* ── five steps ──────────────────────────────────────────────── */
.dsh-lingualab-steps{display:flex;flex-direction:column;gap:2px}
.dsh-lingualab-step{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;cursor:pointer;
  border:0;background:none;color:inherit;font:inherit;text-align:left;width:100%}
.dsh-lingualab-step:hover{background:var(--ll-hover)}
.dsh-lingualab-step.is-current{background:var(--dsw-alias-bg-layer-2,var(--ll-hover))}
.dsh-lingualab-step.is-done .dsh-lingualab-step-label{text-decoration:line-through;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-step-label{flex:1;min-width:0}
.dsh-lingualab-step-mins{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);font-variant-numeric:tabular-nums}

/* A real input that cannot be seen: it stays focusable, so the label around it works from
   the keyboard, which \`display:none\` would break. */
.dsh-lingualab-visually-hidden{position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;
  overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
label.dsh-lingualab-btn{position:relative}
label.dsh-lingualab-btn:focus-within{outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:1px}
label.dsh-lingualab-btn.is-disabled{opacity:0.45;cursor:default;pointer-events:none}

/* ── shared bits ─────────────────────────────────────────────── */
.dsh-lingualab-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-path{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;word-break:break-all}
.dsh-lingualab-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dsh-lingualab-card{border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25));border-radius:12px;
  background:var(--dsw-alias-bg-layer-1,transparent);padding:12px 14px}
.dsh-lingualab-counter{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);font-variant-numeric:tabular-nums}
`
