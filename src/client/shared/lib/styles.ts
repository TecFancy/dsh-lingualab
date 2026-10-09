/**
 * The page stylesheet, rendered as an element by the page.
 *
 * Same rule as the other panels in this workspace: read the host's
 * `--dsw-alias-*` theme tokens and keep a fallback for each, so the page follows
 * the active theme without importing a single Harness Client package. Class names
 * carry the plugin prefix because a stylesheet rendered into the host document is
 * not scoped by anything.
 *
 * The shape is four horizontal bands rather than cards: a fixed top bar, a stage
 * that holds the sentence being worked on, the subtitle list as the only scroller,
 * and a one-line keyboard reminder. Cards were what made the previous version read
 * as a settings page — every block weighed the same, so nothing led.
 */
export const STYLES = `
.dsh-lingualab-page{position:relative;display:flex;flex-direction:column;height:100%;min-height:0;overflow:hidden;
  background:var(--dsw-alias-bg-base,transparent);color:var(--dsw-alias-label-primary,inherit);
  font-size:14px;line-height:1.5;outline:none}
.dsh-lingualab-page:focus-visible{box-shadow:inset 0 0 0 2px var(--dsw-alias-brand-primary,#4d6bfe)}

/* ── top bar ─────────────────────────────────────────────────── */
.dsh-lingualab-top{flex:none;display:flex;align-items:center;gap:8px;height:48px;padding:0 12px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22))}
.dsh-lingualab-episode{display:flex;align-items:baseline;gap:8px;min-width:0;max-width:380px;padding:5px 10px;
  border:0;border-radius:8px;background:none;color:inherit;font:inherit;font-weight:600;cursor:pointer;text-align:left}
.dsh-lingualab-episode:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,0.1))}
.dsh-lingualab-episode-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-episode-caret{color:var(--dsw-alias-label-tertiary,#8a8f98);font-size:11px}
.dsh-lingualab-spacer{flex:1;min-width:8px}
.dsh-lingualab-chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:999px;
  border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.3));background:none;cursor:pointer;
  color:var(--dsw-alias-label-secondary,#8a8f98);font:inherit;font-size:12px;white-space:nowrap}
.dsh-lingualab-chip:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,0.12));
  color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-chip.is-on{border-color:var(--dsw-alias-brand-primary,#4d6bfe);
  color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-chip:disabled{opacity:0.45;cursor:default}
.dsh-lingualab-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;
  padding:0;border:0;border-radius:8px;background:none;color:var(--dsw-alias-label-secondary,#8a8f98);cursor:pointer}
.dsh-lingualab-icon-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,0.12));
  color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-icon-btn:disabled{opacity:0.4;cursor:default}

/* ── stage: the sentence being worked on ─────────────────────── */
.dsh-lingualab-stage{flex:none;display:flex;flex-direction:column;gap:10px;padding:14px 20px 12px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22))}
.dsh-lingualab-stage-meta{display:flex;align-items:center;gap:10px;font-size:12px;
  color:var(--dsw-alias-label-tertiary,#8a8f98);font-variant-numeric:tabular-nums}
.dsh-lingualab-stage-en{font-size:20px;line-height:1.35;font-weight:600;max-height:5.4em;overflow:auto;
  word-break:break-word}
.dsh-lingualab-stage-zh{margin-top:4px;font-size:14px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-stage-zh.is-hidden{display:none}
.dsh-lingualab-transport{display:flex;align-items:center;gap:8px;overflow:hidden}
.dsh-lingualab-play{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;flex:none;
  border:0;border-radius:999px;background:var(--dsw-alias-brand-primary,#4d6bfe);color:#fff;cursor:pointer}
.dsh-lingualab-play:disabled{opacity:0.45;cursor:default}
.dsh-lingualab-bar-btn{display:inline-flex;align-items:center;justify-content:center;height:36px;min-width:36px;
  padding:0 8px;border:0.5px solid transparent;border-radius:9px;background:none;color:var(--dsw-alias-label-secondary,#8a8f98);
  cursor:pointer;font:inherit;font-size:12px;white-space:nowrap}
.dsh-lingualab-bar-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,0.12));
  color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-bar-btn.is-on{border-color:var(--dsw-alias-brand-primary,#4d6bfe);
  color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-bar-btn:disabled{opacity:0.4;cursor:default}
/* The sentence's own progress. It takes a fixed slice rather than all the slack: a
   flexible bar would push the modes to the far edge of a wide page, away from the
   sentence they act on. */
.dsh-lingualab-progress{position:relative;flex:0 1 140px;min-width:48px;height:3px;border-radius:999px;
  background:var(--dsw-alias-bg-layer-3,rgba(127,127,127,0.18))}
.dsh-lingualab-progress-fill{position:absolute;top:0;bottom:0;left:0;border-radius:999px;
  background:var(--dsw-alias-label-tertiary,#8a8f98)}
.dsh-lingualab-time{font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98);font-variant-numeric:tabular-nums}

/* ── subtitle list: the only scroller ────────────────────────── */
.dsh-lingualab-mid{position:relative;display:flex;flex:1;min-height:0}
.dsh-lingualab-list{flex:1;min-width:0;min-height:0;overflow:auto;padding:4px 0}
.dsh-lingualab-row{display:grid;grid-template-columns:76px minmax(0,1fr) auto;gap:12px;align-items:start;
  padding:8px 16px;cursor:pointer;border-left:2px solid transparent}
.dsh-lingualab-row:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,0.09))}
.dsh-lingualab-row.is-active{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.12));
  border-left-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-row-time{font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98);
  font-variant-numeric:tabular-nums;padding-top:2px}
.dsh-lingualab-row-en{min-width:0;word-break:break-word;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-row.is-active .dsh-lingualab-row-en{color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-row-zh{margin-top:2px;font-size:12.5px;color:var(--dsw-alias-label-tertiary,#8a8f98)}
.dsh-lingualab-row.is-active .dsh-lingualab-row-zh{color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-row-actions{display:flex;align-items:center;gap:4px;opacity:0;visibility:hidden;
  transition:opacity .12s ease}
.dsh-lingualab-row:hover .dsh-lingualab-row-actions,.dsh-lingualab-row.is-active .dsh-lingualab-row-actions{
  opacity:1;visibility:visible}
.dsh-lingualab-row-flag{font-size:11px;color:var(--dsw-alias-state-warn-primary,#b7791f)}

/* ── bottom bar ──────────────────────────────────────────────── */
.dsh-lingualab-foot{flex:none;display:flex;align-items:center;gap:12px;height:32px;padding:0 16px;
  border-top:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22));
  font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98)}

/* ── notes layer (a side panel; an overlay on a narrow page) ─── */
.dsh-lingualab-notes{display:flex;flex-direction:column;width:300px;flex:none;min-height:0;
  border-left:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22));
  background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,0.04))}
.dsh-lingualab-notes-head{display:flex;align-items:center;gap:8px;padding:10px 12px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.18));font-weight:600;font-size:13px}
.dsh-lingualab-notes-body{flex:1;min-height:0;overflow:auto;padding:8px 12px}
.dsh-lingualab-note{display:flex;gap:8px;padding:8px 0;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.16))}
.dsh-lingualab-note:last-of-type{border-bottom:0}
.dsh-lingualab-note-main{flex:1;min-width:0}
.dsh-lingualab-note-at{font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98);cursor:pointer;
  font-variant-numeric:tabular-nums;background:none;border:0;padding:0;font-family:inherit}
.dsh-lingualab-note-at:hover{color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-note-text{display:block;word-break:break-word}
.dsh-lingualab-note-zh{font-size:12.5px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-note-note{font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98);font-style:italic}
.dsh-lingualab-note-actions{display:flex;align-items:center;gap:4px}
.dsh-lingualab-note .dsh-lingualab-row-actions{opacity:1;visibility:visible}
.dsh-lingualab-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.dsh-lingualab-tag{border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.3));background:none;color:inherit;
  cursor:pointer;font:inherit;font-size:11px;padding:0 7px;border-radius:999px}
.dsh-lingualab-tag.is-on{background:var(--dsw-alias-brand-primary,#4d6bfe);border-color:transparent;color:#fff}
.dsh-lingualab-composer{display:flex;flex-direction:column;gap:8px;padding:10px 12px;
  border-top:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22))}
.dsh-lingualab-composer-quote{font-size:13px;color:var(--dsw-alias-label-primary,inherit);max-height:3.6em;overflow:auto}
.dsh-lingualab-composer-actions{display:flex;align-items:center;gap:8px}
@media (max-width:1100px){
  .dsh-lingualab-notes{position:absolute;top:0;right:0;bottom:0;z-index:12;
    background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1,#1b1c1f))}
}

/* ── layers: picker, media folder, steps ─────────────────────── */
.dsh-lingualab-mask{position:absolute;inset:0;z-index:20;display:flex;align-items:flex-start;justify-content:center;
  padding:44px 24px;background:var(--dsw-alias-bg-mask-1,rgba(0,0,0,0.35))}
.dsh-lingualab-modal{display:flex;flex-direction:column;width:min(620px,100%);max-height:100%;overflow:hidden;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));border-radius:14px;
  background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1,#1b1c1f));
  box-shadow:0 18px 48px rgba(0,0,0,0.35)}
.dsh-lingualab-modal-head{display:flex;align-items:center;gap:8px;padding:12px 14px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22))}
.dsh-lingualab-modal-title{font-weight:600;font-size:14px}
.dsh-lingualab-tabs{display:flex;gap:4px;padding:8px 14px 0}
.dsh-lingualab-tab{border:0;border-bottom:2px solid transparent;background:none;color:var(--dsw-alias-label-secondary,#8a8f98);
  cursor:pointer;font:inherit;font-size:13px;padding:6px 8px}
.dsh-lingualab-tab.is-on{border-bottom-color:var(--dsw-alias-brand-primary,#4d6bfe);
  color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-modal-body{flex:1;min-height:0;overflow:auto;padding:8px 10px 12px}
.dsh-lingualab-input{width:100%;box-sizing:border-box;background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.1));
  border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.3));border-radius:8px;color:inherit;
  font:inherit;font-size:13px;padding:6px 9px}
.dsh-lingualab-pick{display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;padding:7px 9px;
  border:0;border-radius:8px;background:none;color:inherit;font:inherit;cursor:pointer;text-align:left}
.dsh-lingualab-pick:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,0.12))}
.dsh-lingualab-pick.is-current{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.12))}
.dsh-lingualab-pick-main{flex:1;min-width:0}
.dsh-lingualab-pick-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-pick-sub{display:block;font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-badge{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary,#8a8f98);
  border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.3));border-radius:999px;padding:1px 7px}
.dsh-lingualab-group{margin:10px 4px 4px;font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98)}
.dsh-lingualab-empty{color:var(--dsw-alias-label-tertiary,#8a8f98);padding:14px 12px;font-size:13px}
.dsh-lingualab-warn{color:var(--dsw-alias-state-warn-primary,#b7791f);font-size:12.5px;padding:6px 12px}
.dsh-lingualab-error{color:var(--dsw-alias-state-error-primary,#c53030);font-size:12.5px;padding:6px 12px}
.dsh-lingualab-btn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:8px;
  border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.3));background:none;color:inherit;
  font:inherit;font-size:13px;cursor:pointer;white-space:nowrap}
.dsh-lingualab-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,0.12))}
.dsh-lingualab-btn.is-primary{background:var(--dsw-alias-brand-primary,#4d6bfe);border-color:transparent;color:#fff}
.dsh-lingualab-btn:disabled{opacity:0.45;cursor:default}
.dsh-lingualab-popover{position:absolute;top:44px;right:12px;z-index:25;width:300px;padding:8px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));border-radius:12px;
  background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1,#1b1c1f));
  box-shadow:0 18px 48px rgba(0,0,0,0.35)}

/* ── five steps ──────────────────────────────────────────────── */
.dsh-lingualab-steps{display:flex;flex-direction:column;gap:2px}
.dsh-lingualab-step{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;cursor:pointer;
  border:0;background:none;color:inherit;font:inherit;text-align:left;width:100%}
.dsh-lingualab-step:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,0.12))}
.dsh-lingualab-step.is-current{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.12))}
.dsh-lingualab-step.is-done .dsh-lingualab-step-label{text-decoration:line-through;
  color:var(--dsw-alias-label-tertiary,#8a8f98)}
.dsh-lingualab-step-label{flex:1;min-width:0}
.dsh-lingualab-step-mins{font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98);
  font-variant-numeric:tabular-nums}

/* ── whole-page states: empty library, settings ──────────────── */
.dsh-lingualab-blank{display:flex;flex:1;min-height:0;flex-direction:column;align-items:center;
  justify-content:center;gap:12px;padding:24px}
.dsh-lingualab-blank-card{width:min(520px,100%);display:flex;flex-direction:column;gap:10px}
.dsh-lingualab-blank h1{margin:0;font-size:20px;font-weight:600}
.dsh-lingualab-hint{font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98)}
.dsh-lingualab-path{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;
  word-break:break-all}
.dsh-lingualab-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}

.dsh-lingualab-cards{display:flex;flex-direction:column;gap:10px}
.dsh-lingualab-card{border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25));border-radius:12px;
  background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,0.04));padding:12px 14px}
.dsh-lingualab-card h2{margin:0 0 8px;font-size:14px;font-weight:600}
.dsh-lingualab-counter{font-size:12px;color:var(--dsw-alias-label-tertiary,#8a8f98);font-variant-numeric:tabular-nums}
`
