/**
 * The page stylesheet, rendered as an element by the page.
 *
 * Same rule as the other panels in this workspace: read the host's
 * `--dsw-alias-*` theme tokens and keep a fallback for each, so the page follows
 * the active theme without importing a single Harness Client package. Class names
 * carry the plugin prefix because a stylesheet rendered into the host document is
 * not scoped by anything.
 */
export const STYLES = `
.dsh-lingualab-page{display:flex;flex-direction:column;gap:14px;padding:20px 24px 40px;height:100%;overflow:auto;
  color:var(--dsw-alias-label-primary,inherit);font-size:14px;line-height:1.55}
.dsh-lingualab-head{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
.dsh-lingualab-head h1{margin:0;font-size:20px;font-weight:600;letter-spacing:-0.01em}
.dsh-lingualab-sub{color:var(--dsw-alias-label-secondary,#8a8f98);font-size:13px}
.dsh-lingualab-back{margin-left:auto;border:0;background:none;color:var(--dsw-alias-label-secondary,#8a8f98);
  cursor:pointer;font-size:13px;padding:4px 6px;border-radius:6px}
.dsh-lingualab-back:hover{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.1));
  color:var(--dsw-alias-label-primary,inherit)}

.dsh-lingualab-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;
  border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25));border-radius:12px;padding:8px 10px;
  background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,0.04))}
.dsh-lingualab-btn{border:0.5px solid transparent;background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.1));
  color:inherit;cursor:pointer;font-size:13px;padding:4px 9px;border-radius:8px;white-space:nowrap}
.dsh-lingualab-btn:hover{border-color:var(--dsw-alias-border-l2,rgba(127,127,127,0.45))}
.dsh-lingualab-btn.is-on{background:var(--dsw-alias-brand-primary,#4d6bfe);color:#fff}
.dsh-lingualab-btn:disabled{opacity:0.45;cursor:default}
.dsh-lingualab-spacer{flex:1}
.dsh-lingualab-time{font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary,#8a8f98);font-size:13px}
.dsh-lingualab-select{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.1));color:inherit;border:0;
  border-radius:8px;padding:4px 6px;font-size:13px;max-width:220px}

.dsh-lingualab-grid{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:16px;align-items:start}
@media (max-width:900px){.dsh-lingualab-grid{grid-template-columns:minmax(0,1fr)}}
.dsh-lingualab-card{border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25));border-radius:12px;
  background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,0.04));padding:12px 14px}
.dsh-lingualab-card h2{margin:0 0 8px;font-size:14px;font-weight:600}
.dsh-lingualab-hint{color:var(--dsw-alias-label-secondary,#8a8f98);font-size:12px}
.dsh-lingualab-empty{color:var(--dsw-alias-label-secondary,#8a8f98);padding:18px 4px;font-size:13px}

.dsh-lingualab-cues{max-height:52vh;overflow:auto;display:flex;flex-direction:column;gap:2px}
.dsh-lingualab-cue{display:grid;grid-template-columns:52px minmax(0,1fr) 26px;gap:8px;align-items:start;
  padding:6px 8px;border-radius:8px;cursor:pointer;border:0.5px solid transparent}
.dsh-lingualab-cue:hover{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.09))}
.dsh-lingualab-cue.is-active{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.12));
  border-color:var(--dsw-alias-border-l2,rgba(127,127,127,0.4))}
.dsh-lingualab-cue-time{color:var(--dsw-alias-label-secondary,#8a8f98);font-size:12px;font-variant-numeric:tabular-nums;
  padding-top:2px}
.dsh-lingualab-cue-en{min-width:0;word-break:break-word}
.dsh-lingualab-cue-zh{color:var(--dsw-alias-label-secondary,#8a8f98);font-size:12.5px;margin-top:2px}
.dsh-lingualab-cue-zh.is-hidden{display:none}
.dsh-lingualab-cue-loop{border:0;background:none;color:var(--dsw-alias-label-secondary,#8a8f98);cursor:pointer;
  font-size:14px;padding:0;border-radius:6px;opacity:0}
.dsh-lingualab-cue:hover .dsh-lingualab-cue-loop,.dsh-lingualab-cue.is-active .dsh-lingualab-cue-loop{opacity:1}
.dsh-lingualab-cue-loop:hover{color:var(--dsw-alias-brand-primary,#4d6bfe)}

.dsh-lingualab-note{display:flex;gap:8px;padding:7px 0;border-bottom:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.18))}
.dsh-lingualab-note:last-of-type{border-bottom:0}
.dsh-lingualab-note-main{min-width:0;flex:1}
.dsh-lingualab-note-at{color:var(--dsw-alias-label-secondary,#8a8f98);font-size:12px;cursor:pointer;
  font-variant-numeric:tabular-nums}
.dsh-lingualab-note-text{word-break:break-word}
.dsh-lingualab-note-zh{color:var(--dsw-alias-label-secondary,#8a8f98);font-size:12.5px}
.dsh-lingualab-note-note{color:var(--dsw-alias-label-secondary,#8a8f98);font-size:12px;font-style:italic}
.dsh-lingualab-note-actions{display:flex;gap:4px;align-items:flex-start}
.dsh-lingualab-icon-btn{border:0;background:none;color:var(--dsw-alias-label-secondary,#8a8f98);cursor:pointer;
  font-size:13px;padding:1px 4px;border-radius:6px}
.dsh-lingualab-icon-btn:hover{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.12));color:inherit}
.dsh-lingualab-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.dsh-lingualab-chip{border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.3));background:none;color:inherit;
  cursor:pointer;font-size:12px;padding:1px 7px;border-radius:999px}
.dsh-lingualab-chip.is-on{background:var(--dsw-alias-brand-primary,#4d6bfe);border-color:transparent;color:#fff}
.dsh-lingualab-counter{color:var(--dsw-alias-label-secondary,#8a8f98);font-variant-numeric:tabular-nums;font-size:12px}
.dsh-lingualab-actions{display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap}
.dsh-lingualab-warn{color:var(--dsw-alias-state-warn-primary,#b7791f);font-size:12.5px}

.dsh-lingualab-steps{display:flex;flex-direction:column;gap:6px}
.dsh-lingualab-step{display:flex;align-items:center;gap:8px;cursor:pointer;padding:4px 6px;border-radius:8px}
.dsh-lingualab-step:hover{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.09))}
.dsh-lingualab-step.is-current{background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.12))}
.dsh-lingualab-step.is-done .dsh-lingualab-step-label{text-decoration:line-through;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-step-label{flex:1;min-width:0}
.dsh-lingualab-step-mins{color:var(--dsw-alias-label-secondary,#8a8f98);font-size:12px}

.dsh-lingualab-folder-row{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;margin:6px 0}
.dsh-lingualab-path{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;
  word-break:break-all;color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-input{flex:1;min-width:0;background:var(--dsw-alias-bg-layer-2,rgba(127,127,127,0.1));
  border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25));border-radius:8px;color:inherit;
  font-size:12.5px;padding:4px 8px}
.dsh-lingualab-candidates{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.dsh-lingualab-candidate{display:flex;gap:8px;align-items:center;justify-content:space-between;
  padding:6px 8px;border-radius:8px;background:var(--dsw-alias-bg-layer-1,rgba(127,127,127,0.04))}
.dsh-lingualab-candidate-main{min-width:0}
`
