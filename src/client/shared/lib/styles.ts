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
  /* Panels that float (drawers, cards, popovers). Not the host's bg-overlay: that token is
     its scrim colour, a mid gray in dark, and a panel painted with it reads as washed out. */
  --ll-surface:var(--dsw-alias-bg-layer-1,#1b1c1f);
  position:relative;display:flex;flex-direction:column;height:100%;min-height:0;overflow:hidden;
  background:var(--dsw-alias-bg-base,transparent);color:var(--dsw-alias-label-primary,inherit);
  font-size:14px;line-height:1.5;outline:none}
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
.dsh-lingualab-chip kbd{font:inherit;font-size:11px;opacity:.6}
.dsh-lingualab-chip:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-chip.is-on{border-color:var(--dsw-alias-brand-primary,#4d6bfe);color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-chip:disabled{opacity:0.45;cursor:default}
/* The segment button and its list: a popover under the top bar, a listbox the keyboard walks. */
.dsh-lingualab-seg-holder{position:relative;display:inline-flex}
.dsh-lingualab-chevron{display:inline-flex;transform:rotate(90deg);transition:transform .12s ease}
.dsh-lingualab-chevron.is-open{transform:rotate(-90deg)}
.dsh-lingualab-seglist{position:absolute;left:0;top:calc(100% + 6px);z-index:25;display:flex;flex-direction:column;gap:2px;
  box-sizing:border-box;width:min(320px,80vw);max-height:min(380px,60vh);overflow:auto;padding:6px;outline:none;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));border-radius:12px;
  background:var(--ll-surface);box-shadow:0 18px 48px rgba(0,0,0,0.3)}
.dsh-lingualab-seglist:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:1px}
.dsh-lingualab-segopt{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;cursor:pointer;
  font-size:13px;line-height:1.4}
.dsh-lingualab-segopt.is-active{background:var(--ll-hover)}
.dsh-lingualab-segopt.is-current{color:var(--dsw-alias-brand-primary,#4d6bfe);font-weight:600}
.dsh-lingualab-segopt-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-segopt-now{flex:none;font-size:11px;font-weight:500;opacity:.85}
.dsh-lingualab-segopt-done{flex:none;display:inline-flex;color:var(--dsw-alias-state-success-primary,#2f855a)}
/* A section heading inside the 「收藏」 column: the segment the cards under it are from. */
.dsh-lingualab-notes-group{flex:none;margin:6px 0 -4px;font-size:12px;font-weight:600;letter-spacing:.02em;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-notes-group:first-child{margin-top:0}
.dsh-lingualab-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;
  padding:0;border:0;border-radius:8px;background:none;color:var(--dsw-alias-label-secondary,#8a8f98);cursor:pointer}
.dsh-lingualab-icon-btn:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-icon-btn:disabled{opacity:0.4;cursor:default}
.dsh-lingualab-icon-btn.is-star.is-on{color:var(--dsw-alias-state-warn-primary,#b7791f)}

/* ── home ────────────────────────────────────────────────────── */
.dsh-lingualab-home{flex:1;min-height:0;display:flex;flex-direction:column}
.dsh-lingualab-drop{position:relative;flex:1;min-height:0;overflow:auto}
.dsh-lingualab-home-inner{display:flex;flex-direction:column;gap:22px;width:min(900px,100%);
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
  background:var(--ll-surface);font-size:16px}
.dsh-lingualab-drop-veil-card span{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98)}

.dsh-lingualab-resume{display:flex;flex-direction:column;gap:12px;padding:26px 28px;border-radius:20px;
  border:0.5px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 35%,transparent);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 9%,var(--dsw-alias-bg-base,transparent))}
.dsh-lingualab-resume-label{font-size:12px;color:var(--dsw-alias-brand-primary,#4d6bfe);font-weight:600;letter-spacing:.02em}
.dsh-lingualab-resume-title{margin:0;font-size:28px;line-height:1.25;font-weight:700;letter-spacing:-.01em;word-break:break-word}
.dsh-lingualab-resume-meta{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12.5px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-section{display:flex;flex-direction:column;gap:8px}
/* The home's weekly pass: how much is left to review across the library, and its button. */
.dsh-lingualab-reviewcard{display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:14px;
  background:var(--dsw-alias-bg-layer-1,transparent);border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25))}
.dsh-lingualab-reviewcard-icon{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;
  flex:none;border-radius:10px;color:var(--dsw-alias-state-warning-primary,#b7791f);
  background:color-mix(in srgb,var(--dsw-alias-state-warning-primary,#b7791f) 13%,transparent)}
.dsh-lingualab-reviewcard-text{display:flex;flex-direction:column;gap:2px;min-width:0}
.dsh-lingualab-reviewcard-text span{font-size:12.5px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-section-head{display:flex;align-items:center;gap:8px}
.dsh-lingualab-section-head h2{margin:0;font-size:14px;font-weight:600}
.dsh-lingualab-episodes{display:flex;flex-direction:column;gap:2px}
.dsh-lingualab-episodes.is-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.dsh-lingualab-episode-card{display:flex;flex-direction:column;align-items:stretch;gap:8px;padding:16px;border-radius:16px;
  text-align:left;color:inherit;font:inherit;cursor:pointer;background:var(--dsw-alias-bg-layer-1,transparent);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));
  transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease}
.dsh-lingualab-episode-card:hover:not(:disabled){transform:translateY(-2px);
  border-color:var(--dsw-alias-brand-primary,#4d6bfe);box-shadow:0 10px 26px rgba(0,0,0,0.14)}
.dsh-lingualab-episode-card:active:not(:disabled){transform:none}
.dsh-lingualab-episode-card:disabled{opacity:0.6;cursor:default}
.dsh-lingualab-episode-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.dsh-lingualab-episode-icon{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;
  border-radius:10px;color:var(--dsw-alias-brand-primary,#4d6bfe);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 12%,transparent)}
.dsh-lingualab-episode-title{font-size:16px;font-weight:600;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;
  -webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
.dsh-lingualab-dropstrip{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:14px;
  border:1.5px dashed var(--dsw-alias-border-l2,rgba(127,127,127,0.4));color:var(--dsw-alias-label-secondary,#8a8f98);
  transition:border-color .15s ease,background .15s ease}
.dsh-lingualab-drop.is-over .dsh-lingualab-dropstrip{border-color:var(--dsw-alias-brand-primary,#4d6bfe);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 8%,transparent)}
.dsh-lingualab-episode-row{display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;padding:10px 12px;
  border:0;border-radius:10px;background:none;color:inherit;font:inherit;cursor:pointer;text-align:left}
.dsh-lingualab-episode-row:hover{background:var(--ll-hover)}
.dsh-lingualab-episode-row:disabled{opacity:0.6;cursor:default}
.dsh-lingualab-resume .dsh-lingualab-bar{height:6px}
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

/* ── practice: a stage on the left, the transcript on the right ─ */
.dsh-lingualab-body{flex:1;min-height:0;display:flex}
.dsh-lingualab-practice{position:relative;flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;
  padding:0 24px 20px}
.dsh-lingualab-top-heading{display:flex;flex-direction:column;min-width:0;line-height:1.25;padding:0 4px}
.dsh-lingualab-top-heading .dsh-lingualab-top-title{padding:0}
.dsh-lingualab-top-sub{font-size:11.5px;color:var(--dsw-alias-label-secondary,#8a8f98);font-variant-numeric:tabular-nums}
.dsh-lingualab-pill{display:inline-flex;align-items:center;height:22px;padding:0 10px;border-radius:999px;font-size:12px;
  font-weight:600;color:var(--dsw-alias-brand-primary,#4d6bfe);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 12%,transparent)}

.dsh-lingualab-stage{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:14px;padding:20px 12px;text-align:center}
.dsh-lingualab-stage-meta{display:flex;align-items:center;gap:10px;font-size:12px;
  color:var(--dsw-alias-label-secondary,#8a8f98);font-variant-numeric:tabular-nums}
.dsh-lingualab-stage-side{width:100%;max-width:760px;min-height:1.5em;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap;font-size:15px;color:var(--ll-muted);opacity:.7;
  -webkit-mask-image:linear-gradient(to right,transparent,#000 12%,#000 88%,transparent);
  mask-image:linear-gradient(to right,transparent,#000 12%,#000 88%,transparent)}
.dsh-lingualab-stage-now{position:relative;width:100%;max-width:860px;display:flex;flex-direction:column;align-items:center;
  gap:12px;animation:ll-sentence-in .2s ease-out}
@keyframes ll-sentence-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.dsh-lingualab-stage-en{font-size:clamp(26px,3.1vw,44px);line-height:1.25;font-weight:700;letter-spacing:-.01em;
  word-break:break-word;transition:filter .2s ease}
.dsh-lingualab-stage-en.is-long{font-size:clamp(20px,2.2vw,30px);line-height:1.35}
.dsh-lingualab-stage-en.is-masked{filter:blur(12px);user-select:none;pointer-events:none}
.dsh-lingualab-stage-en .is-word{cursor:pointer;border-radius:8px;transition:background .12s ease,color .12s ease}
/* The gaps inside a picked phrase are tinted too, so the phrase reads as one piece. */
.dsh-lingualab-stage-en .is-between{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 14%,transparent)}
.dsh-lingualab-stage-en .is-word:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 14%,transparent)}
.dsh-lingualab-stage-en .is-word.is-pinned{color:var(--dsw-alias-brand-primary,#4d6bfe);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 14%,transparent)}
.dsh-lingualab-stage-zh{font-size:clamp(15px,1.5vw,20px);color:color-mix(in srgb,var(--dsw-alias-label-secondary,#8a8f98) 80%,transparent)}
.dsh-lingualab-stage-zh[data-zh="always"]{color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-stage-empty{display:flex;flex-direction:column;align-items:center;gap:6px;max-width:420px;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-stage-empty strong{font-size:16px;font-weight:600;color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-reveal{position:absolute;top:calc(50% - 18px);left:50%;transform:translateX(-50%);display:inline-flex;
  align-items:center;gap:8px;height:34px;padding:0 14px;border-radius:999px;cursor:pointer;font:inherit;font-size:13px;
  color:var(--dsw-alias-label-primary,inherit);background:var(--ll-surface);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));box-shadow:0 6px 20px rgba(0,0,0,0.18)}
.dsh-lingualab-reveal:hover{border-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-stage-now:has(.is-masked) .dsh-lingualab-stage-zh{opacity:0.5}

/* The word popover: small, over the word, and never in the way of the audio. */
.dsh-lingualab-word-pop{position:absolute;z-index:6;display:flex;align-items:center;gap:6px;padding:6px 8px;
  transform:translate(-50%,calc(-100% - 8px));white-space:nowrap;border-radius:12px;font-size:13px;
  background:var(--ll-surface);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));box-shadow:0 12px 32px rgba(0,0,0,0.28);
  animation:ll-pop-in .12s ease-out}
@keyframes ll-pop-in{from{opacity:0;transform:translate(-50%,calc(-100% - 2px))}
  to{opacity:1;transform:translate(-50%,calc(-100% - 8px))}}
.dsh-lingualab-word-pop b{padding:0 6px;font-weight:600}
.dsh-lingualab-pop-btn{display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 9px;border-radius:8px;cursor:pointer;
  font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);background:none;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3))}
.dsh-lingualab-pop-btn:hover:not(:disabled){background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-pop-btn:disabled{cursor:default;opacity:.45}
/* A word or phrase already in the note: the button says so, and takes it out on a click. */
.dsh-lingualab-pop-btn.is-on{color:var(--dsw-alias-state-success-primary,#2f855a)}

/* The stage's time range opens the timing strip, so it reads as a quiet button. */
.dsh-lingualab-stage-time{font:inherit;font-variant-numeric:tabular-nums;color:inherit;background:none;border:0;
  padding:2px 6px;border-radius:6px;cursor:pointer}
.dsh-lingualab-stage-time:hover,.dsh-lingualab-stage-time.is-on{background:var(--ll-hover);
  color:var(--dsw-alias-label-primary,inherit)}

/* The timing strip: two edge fields and the save, the width of the player card, right under the stage. */
.dsh-lingualab-timing{flex:none;display:flex;flex-direction:column;gap:6px;width:min(720px,100%);align-self:center;
  box-sizing:border-box;margin-bottom:10px;padding:10px 14px;border-radius:14px;
  border:1px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 45%,transparent);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 5%,var(--dsw-alias-bg-layer-1,transparent))}
.dsh-lingualab-timing-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px}
.dsh-lingualab-timing-title{font-size:13px;font-weight:600}
.dsh-lingualab-timing-edge{display:inline-flex;align-items:center;gap:4px;padding:3px;border-radius:10px;
  border:1px solid transparent}
.dsh-lingualab-timing-edge.is-focus{border-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-timing-label{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);padding:0 4px}
.dsh-lingualab-timing-value{font:inherit;font-size:14px;font-weight:600;font-variant-numeric:tabular-nums;
  min-width:84px;height:28px;border-radius:8px;cursor:pointer;color:var(--dsw-alias-label-primary,inherit);
  background:var(--ll-hover);border:0}
.dsh-lingualab-timing-value.is-moved{color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-timing-value:disabled{cursor:default;font-weight:400;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-timing-nudge{width:26px;height:26px;border-radius:8px;cursor:pointer;font:inherit;font-size:15px;
  color:var(--dsw-alias-label-secondary,#8a8f98);background:none;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3))}
.dsh-lingualab-timing-nudge:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-timing .dsh-lingualab-pop-btn kbd{font:inherit;font-size:11px;opacity:.7}
.dsh-lingualab-timing-hint{font-size:11.5px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-timing-hint.is-warn{color:var(--dsw-alias-state-warning-primary,#b7791f)}

/* The player card: scrubber on top, then the controls in three groups. */
.dsh-lingualab-deck{flex:none;display:flex;flex-direction:column;gap:12px;width:min(720px,100%);align-self:center;
  box-sizing:border-box;padding:16px 20px 14px;border-radius:20px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-transport{display:flex;flex-direction:column;gap:12px;width:100%}
.dsh-lingualab-transport-row{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px}
.dsh-lingualab-transport-side{display:flex;align-items:center;gap:4px;min-width:0;flex-wrap:wrap}
.dsh-lingualab-transport-side.is-end{justify-content:flex-end}
.dsh-lingualab-transport-main{display:flex;align-items:center;gap:14px}
.dsh-lingualab-play{display:inline-flex;align-items:center;justify-content:center;width:60px;height:60px;flex:none;
  border:0;border-radius:999px;background:var(--dsw-alias-brand-primary,#4d6bfe);color:var(--ll-on-brand);cursor:pointer;
  box-shadow:0 8px 22px color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 38%,transparent);
  transition:transform .12s ease,filter .12s ease}
.dsh-lingualab-play:hover:not(:disabled){filter:brightness(1.08)}
.dsh-lingualab-play:active:not(:disabled){transform:scale(.94)}
.dsh-lingualab-play:disabled{opacity:0.45;cursor:default;box-shadow:none}
.dsh-lingualab-round{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;padding:0;
  border-radius:999px;cursor:pointer;color:var(--dsw-alias-label-primary,inherit);background:none;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));transition:transform .12s ease,background .12s ease}
.dsh-lingualab-round:hover:not(:disabled){background:var(--ll-hover)}
.dsh-lingualab-round:active:not(:disabled){transform:scale(.92)}
.dsh-lingualab-round:disabled{opacity:0.4;cursor:default}
.dsh-lingualab-bar-btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;height:32px;min-width:32px;
  padding:0 10px;border:0.5px solid transparent;border-radius:9px;background:none;
  color:var(--dsw-alias-label-secondary,#8a8f98);cursor:pointer;font:inherit;font-size:12px;white-space:nowrap}
.dsh-lingualab-bar-btn:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-bar-btn.is-on{border-color:var(--dsw-alias-brand-primary,#4d6bfe);color:var(--dsw-alias-brand-primary,#4d6bfe);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 10%,transparent)}
.dsh-lingualab-bar-btn.is-star.is-on{border-color:var(--dsw-alias-state-warn-primary,#b7791f);
  color:var(--dsw-alias-state-warn-primary,#b7791f);
  background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#b7791f) 10%,transparent)}
.dsh-lingualab-bar-btn:disabled{opacity:0.4;cursor:default}
.dsh-lingualab-time{flex:none;min-width:40px;font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);
  font-variant-numeric:tabular-nums}
.dsh-lingualab-time:last-child{text-align:right}
.dsh-lingualab-menu-holder{position:relative;display:inline-flex}
.dsh-lingualab-menu{position:absolute;right:0;bottom:calc(100% + 6px);z-index:25;display:flex;flex-direction:column;gap:10px;
  width:300px;padding:12px;border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));border-radius:12px;
  background:var(--ll-surface);box-shadow:0 18px 48px rgba(0,0,0,0.3);
  text-align:left}
.dsh-lingualab-menu-title{font-size:12px;font-weight:600}
.dsh-lingualab-menu-keys{display:grid;grid-template-columns:auto 1fr;gap:3px 12px;margin:0;padding-top:8px;
  border-top:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22));font-size:12px;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-menu-keys dt{font-weight:600;color:var(--dsw-alias-label-primary,inherit);
  font-variant-numeric:tabular-nums}
.dsh-lingualab-menu-keys dd{margin:0}
.dsh-lingualab-menu-row{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px}

/* The scrubber. The hit area is 22px tall and the rail 6px, so it is easy to land on. */
.dsh-lingualab-scrub{display:flex;align-items:center;gap:12px;width:100%}
.dsh-lingualab-scrub.is-disabled{opacity:0.5}
.dsh-lingualab-scrub-track{position:relative;flex:1;min-width:0;height:22px;cursor:pointer;touch-action:none;user-select:none}
.dsh-lingualab-scrub.is-disabled .dsh-lingualab-scrub-track{cursor:default}
.dsh-lingualab-scrub-rail{position:absolute;left:0;right:0;top:50%;height:6px;margin-top:-3px;border-radius:999px;
  overflow:hidden;background:var(--ll-track);transition:height .12s ease,margin .12s ease}
.dsh-lingualab-scrub-track:hover .dsh-lingualab-scrub-rail{height:8px;margin-top:-4px}
.dsh-lingualab-scrub-ticks{position:absolute;inset:0;width:100%;height:100%}
.dsh-lingualab-scrub-ticks path{stroke:var(--dsw-alias-label-secondary,#8a8f98);stroke-width:1;opacity:0.35}
.dsh-lingualab-scrub-fill{position:absolute;top:0;bottom:0;left:0;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-scrub-ghost{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;
  background:var(--dsw-alias-label-primary,#888);opacity:0.45}
.dsh-lingualab-scrub-knob{position:absolute;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#4d6bfe);transform:scale(.8);transition:transform .12s ease;
  box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 24%,transparent)}
.dsh-lingualab-scrub-track:hover .dsh-lingualab-scrub-knob{transform:scale(1.1)}
.dsh-lingualab-scrub-tip{position:absolute;bottom:calc(100% + 6px);z-index:8;display:flex;flex-direction:column;gap:2px;
  width:max-content;max-width:220px;transform:translateX(-50%);padding:6px 10px;border-radius:10px;font-size:12px;
  text-align:left;pointer-events:none;color:var(--dsw-alias-label-primary,inherit);
  background:var(--ll-surface);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));box-shadow:0 10px 28px rgba(0,0,0,0.25)}
.dsh-lingualab-scrub-tip b{font-variant-numeric:tabular-nums}
.dsh-lingualab-scrub-tip span{color:var(--dsw-alias-label-secondary,#8a8f98);display:-webkit-box;-webkit-line-clamp:2;
  -webkit-box-orient:vertical;overflow:hidden}

/* Key caps: they light up when the page handles that key. */
.dsh-lingualab-keyhints{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px 16px;
  font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);transition:opacity .15s ease}
.dsh-lingualab-keyhints.is-idle{opacity:0.55}
.dsh-lingualab-keyhint{display:inline-flex;align-items:center;gap:4px}
.dsh-lingualab-page kbd{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;
  box-sizing:border-box;border-radius:6px;font:inherit;font-size:11px;font-weight:600;
  color:var(--dsw-alias-label-secondary,#8a8f98);background:var(--dsw-alias-bg-base,transparent);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));
  border-bottom-width:2px;transition:background .1s ease,color .1s ease,transform .1s ease}
.dsh-lingualab-keyhint.is-hit kbd{background:var(--dsw-alias-brand-primary,#4d6bfe);color:var(--ll-on-brand);
  border-color:var(--dsw-alias-brand-primary,#4d6bfe);transform:translateY(1px)}
.dsh-lingualab-keyhint.is-hit{color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-reveal kbd{margin-left:2px}

/* ── transcript: the only scroller ───────────────────────────── */
.dsh-lingualab-transcript{flex:none;width:clamp(300px,34%,440px);min-height:0;display:flex;flex-direction:column;
  border-left:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-transcript-head{flex:none;display:flex;align-items:center;gap:8px;height:48px;padding:0 16px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22))}
.dsh-lingualab-transcript-title{font-weight:600}
.dsh-lingualab-switch{display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-switch-track{position:relative;width:30px;height:18px;border-radius:999px;background:var(--ll-track);
  transition:background .15s ease}
.dsh-lingualab-switch-knob{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:999px;
  background:var(--dsw-alias-bg-base,#fff);box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:transform .15s ease}
.dsh-lingualab-switch input:checked + .dsh-lingualab-switch-track{background:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-switch input:checked + .dsh-lingualab-switch-track .dsh-lingualab-switch-knob{transform:translateX(12px)}
.dsh-lingualab-switch input:focus-visible + .dsh-lingualab-switch-track{
  outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:2px}
.dsh-lingualab-list{position:relative;flex:1;min-width:0;min-height:0;overflow:auto;padding:8px}
.dsh-lingualab-row{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:10px;align-items:start;
  padding:9px 10px;margin-bottom:2px;cursor:pointer;border-radius:10px;transition:background .12s ease}
.dsh-lingualab-row:hover,.dsh-lingualab-row.is-selected{background:var(--ll-hover)}
.dsh-lingualab-row.is-active{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 11%,transparent);
  box-shadow:inset 3px 0 0 var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-row-time{font-size:11.5px;color:var(--ll-muted);font-variant-numeric:tabular-nums;padding-top:3px}
.dsh-lingualab-row.is-active .dsh-lingualab-row-time{color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-row-en{min-width:0;word-break:break-word;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-row.is-active .dsh-lingualab-row-en{color:var(--dsw-alias-label-primary,inherit);font-weight:600}
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
.dsh-lingualab-row-actions{display:flex;align-items:center;gap:2px;opacity:0;visibility:hidden;transition:opacity .12s ease}
.dsh-lingualab-row:hover .dsh-lingualab-row-actions,.dsh-lingualab-row.is-active .dsh-lingualab-row-actions{
  opacity:1;visibility:visible}
/* A kept sentence shows its star at rest, so the list reads as a map of what you took. */
.dsh-lingualab-row-actions.is-kept{opacity:1;visibility:visible}
.dsh-lingualab-row-actions.is-kept .dsh-lingualab-icon-btn:not(.is-star){opacity:0;visibility:hidden}
.dsh-lingualab-row:hover .dsh-lingualab-row-actions.is-kept .dsh-lingualab-icon-btn,
.dsh-lingualab-row.is-active .dsh-lingualab-row-actions.is-kept .dsh-lingualab-icon-btn{opacity:1;visibility:visible}

/* ── finish card ─────────────────────────────────────────────── */
.dsh-lingualab-finish{position:absolute;inset:0;z-index:15;display:flex;align-items:center;justify-content:center;
  padding:16px;background:var(--ll-mask);backdrop-filter:blur(2px);animation:ll-fade-in .18s ease-out}
@keyframes ll-fade-in{from{opacity:0}to{opacity:1}}
.dsh-lingualab-finish-card{display:flex;flex-direction:column;align-items:center;gap:12px;width:min(460px,100%);
  box-sizing:border-box;padding:28px 28px 20px;text-align:center;border-radius:20px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.4));
  background:var(--ll-surface);box-shadow:0 24px 64px rgba(0,0,0,0.38);
  animation:ll-sentence-in .22s ease-out}
.dsh-lingualab-finish-card h2{margin:0;font-size:20px;font-weight:700}
.dsh-lingualab-finish-card p{margin:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-finish-badge{display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;
  border-radius:999px;color:var(--ll-on-brand);background:var(--dsw-alias-state-success-primary,#2f855a);
  animation:ll-badge-in .35s cubic-bezier(.2,1.4,.4,1)}
@keyframes ll-badge-in{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}
.dsh-lingualab-finish-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%;margin:4px 0 6px}
.dsh-lingualab-finish-stats div{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 6px;
  border-radius:12px;background:var(--dsw-alias-bg-layer-1,transparent);
  border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25))}
.dsh-lingualab-finish-stats dt{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}
.dsh-lingualab-finish-stats dd{margin:0;font-size:11.5px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-finish-stats.is-four{grid-template-columns:repeat(4,1fr)}

/* ── review: the strip above the stage ───────────────────────── */
.dsh-lingualab-review{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px;width:min(860px,100%);
  align-self:center;box-sizing:border-box;margin-top:14px;padding:8px 10px 8px 12px;border-radius:14px;
  background:var(--ll-surface);border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35))}
.dsh-lingualab-review-source{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-review .dsh-lingualab-pop-btn kbd{font:inherit;font-size:11px;opacity:.7}

/* ── segmented control: the right column's switch and the kept filter ── */
.dsh-lingualab-segmented{display:inline-flex;gap:2px;padding:2px;border-radius:9px;background:var(--ll-hover)}
.dsh-lingualab-segmented button{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;border:0;
  border-radius:7px;cursor:pointer;font:inherit;font-size:13px;font-weight:600;background:none;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-segmented button:hover{color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-segmented button.is-on{color:var(--dsw-alias-label-primary,inherit);background:var(--ll-surface);
  box-shadow:0 1px 3px rgba(0,0,0,0.14)}
.dsh-lingualab-segmented.is-small button{height:24px;padding:0 9px;font-size:12px;font-weight:500}
.dsh-lingualab-segmented-count{font-weight:400;font-variant-numeric:tabular-nums;opacity:.7}

/* ── loading: skeletons that mirror the real layout ──────────── */
/* The delay keeps a fast load from flashing a placeholder for a single frame. */
.dsh-lingualab-sk-wrap{display:flex;flex-direction:column;gap:22px;animation:ll-fade-in .28s ease-out .18s both}
.dsh-lingualab-sk{display:block;flex:none;max-width:100%;
  background:linear-gradient(90deg,var(--ll-track) 25%,color-mix(in srgb,var(--dsw-alias-label-primary,#888) 5%,transparent) 50%,var(--ll-track) 75%);
  background-size:300% 100%;animation:ll-shimmer 1.5s ease-in-out infinite}
@keyframes ll-shimmer{from{background-position:100% 0}to{background-position:0 0}}
.dsh-lingualab-sk-row{display:flex;align-items:center;gap:14px}
.dsh-lingualab-sk-row.is-between{justify-content:space-between}
.dsh-lingualab-sk-resume{display:flex;flex-direction:column;align-items:flex-start;gap:14px;padding:26px 28px;border-radius:20px;
  border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-sk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.dsh-lingualab-sk-card{display:flex;flex-direction:column;align-items:stretch;gap:10px;padding:16px;border-radius:16px;
  border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-sk-list{gap:6px;padding:10px 12px}
.dsh-lingualab-sk-item{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:10px 12px;border-radius:12px}
.dsh-lingualab-sk-stage{flex:1;align-items:center;justify-content:center;gap:28px;width:100%}
.dsh-lingualab-sk-lines{display:flex;flex-direction:column;align-items:center;gap:14px;width:min(640px,80%)}
.dsh-lingualab-sk-label{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-spinner{width:14px;height:14px;border-radius:999px;box-sizing:border-box;
  border:2px solid var(--ll-track);border-top-color:var(--dsw-alias-brand-primary,#4d6bfe);animation:ll-spin .8s linear infinite}
.dsh-lingualab-btn .dsh-lingualab-spinner{border-color:color-mix(in srgb,currentColor 30%,transparent);border-top-color:currentColor}
@keyframes ll-spin{to{transform:rotate(360deg)}}

@media (prefers-reduced-motion:reduce){
  .dsh-lingualab-sk{animation:none}
  .dsh-lingualab-spinner{animation-duration:2.4s}
  .dsh-lingualab-stage-now,.dsh-lingualab-word-pop,.dsh-lingualab-finish,.dsh-lingualab-finish-card,
  .dsh-lingualab-finish-badge,.dsh-lingualab-popover{animation:none}
  .dsh-lingualab-page *{transition-duration:0s !important}
}

/* ── drawer: the five steps slide in over a scrim ────────────── */
.dsh-lingualab-scrim{position:absolute;inset:0;z-index:21;background:var(--ll-mask);animation:ll-fade-in .18s ease-out}
.dsh-lingualab-popover{position:absolute;top:0;right:0;bottom:0;z-index:22;display:flex;
  flex-direction:column;width:min(420px,100%);min-height:0;box-sizing:border-box;
  border-left:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));
  background:var(--ll-surface);box-shadow:-18px 0 48px rgba(0,0,0,0.22);
  animation:ll-slide-in .2s ease-out}
@keyframes ll-slide-in{from{transform:translateX(28px);opacity:0}to{transform:none;opacity:1}}
.dsh-lingualab-drawer-titles{display:flex;flex-direction:column;min-width:0;gap:1px}
.dsh-lingualab-drawer-title{font-weight:600;font-size:16px;line-height:1.3}
.dsh-lingualab-drawer-sub{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
/* ── the 「收藏」 column: one card per kept sentence, the one on stage open ── */
.dsh-lingualab-transcript.is-kept{position:relative}
.dsh-lingualab-kept-filter{flex:none;padding:10px 12px 4px}
.dsh-lingualab-notes-body{position:relative;flex:1;min-height:0;overflow:auto;padding:8px 12px 16px;display:flex;
  flex-direction:column;gap:8px}
.dsh-lingualab-note{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border-radius:12px;flex:none;cursor:pointer;
  background:color-mix(in srgb,var(--dsw-alias-label-primary,#888) 3%,transparent);
  border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22));transition:border-color .12s ease,background .12s ease}
.dsh-lingualab-note:hover{border-color:var(--dsw-alias-border-l2,rgba(127,127,127,0.4))}
.dsh-lingualab-note.is-open{gap:8px;padding:12px 14px 14px;cursor:default;
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 7%,var(--ll-surface));
  border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 55%,transparent);
  box-shadow:inset 3px 0 0 var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-note.is-done .dsh-lingualab-note-text{color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-note-top{display:flex;align-items:center;gap:8px;min-height:26px}
.dsh-lingualab-note-check{display:inline-flex;cursor:pointer;position:relative}
.dsh-lingualab-box{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:6px;
  box-sizing:border-box;border:1.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.5));
  color:var(--ll-on-brand);transition:background .12s ease,border-color .12s ease}
.dsh-lingualab-note-check:hover .dsh-lingualab-box{border-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-note-check:focus-within .dsh-lingualab-box{outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:2px}
.dsh-lingualab-box.is-on{background:var(--dsw-alias-brand-primary,#4d6bfe);border-color:transparent}
.dsh-lingualab-note-at{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 9px;border-radius:999px;border:0;
  font-size:12px;font-weight:500;font-family:inherit;cursor:pointer;font-variant-numeric:tabular-nums;
  color:var(--dsw-alias-brand-primary,#4d6bfe);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 12%,transparent)}
.dsh-lingualab-note-at:hover{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 22%,transparent)}
.dsh-lingualab-note-at.is-playing,.dsh-lingualab-note-at.is-playing:hover{color:#fff;background:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-note .dsh-lingualab-icon-btn.is-small{color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-icon-btn.is-danger:hover{color:var(--dsw-alias-state-error-primary,#d92d20);
  background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#d92d20) 12%,transparent)}
.dsh-lingualab-note-text{display:block;word-break:break-word;font-weight:500;font-size:14px;line-height:1.4}
.dsh-lingualab-note.is-open .dsh-lingualab-note-text{font-weight:600;font-size:16px}
/* A sentence's one state, as a quiet chip on every card. */
.dsh-lingualab-grade{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:999px;font-size:11.5px;
  font-weight:600;color:var(--dsw-alias-label-secondary,#8a8f98);background:var(--ll-hover)}
.dsh-lingualab-grade.is-got{color:var(--dsw-alias-state-success-primary,#2f855a);
  background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2f855a) 13%,transparent)}
.dsh-lingualab-grade.is-fuzzy{color:var(--dsw-alias-state-warning-primary,#b7791f);
  background:color-mix(in srgb,var(--dsw-alias-state-warning-primary,#b7791f) 14%,transparent)}
.dsh-lingualab-grade.is-notyet{color:var(--dsw-alias-state-error-primary,#d92d20);
  background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#d92d20) 12%,transparent)}
/* The three grades as buttons, on the open card and on the review strip. */
.dsh-lingualab-grades{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px}
.dsh-lingualab-grade-btn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 11px;border-radius:8px;
  cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;color:var(--dsw-alias-label-primary,inherit);background:none;
  border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));transition:background .12s ease,border-color .12s ease}
.dsh-lingualab-grade-btn kbd{font:inherit;font-size:11px;opacity:.6}
.dsh-lingualab-grade-btn:disabled{opacity:.45;cursor:default}
.dsh-lingualab-grade-btn.is-got{--ll-grade:var(--dsw-alias-state-success-primary,#2f855a)}
.dsh-lingualab-grade-btn.is-fuzzy{--ll-grade:var(--dsw-alias-state-warning-primary,#b7791f)}
.dsh-lingualab-grade-btn.is-notyet{--ll-grade:var(--dsw-alias-state-error-primary,#d92d20)}
.dsh-lingualab-grade-btn:hover:not(:disabled){border-color:var(--ll-grade);background:color-mix(in srgb,var(--ll-grade) 10%,transparent)}
.dsh-lingualab-grade-btn.is-on{color:var(--ll-on-brand);background:var(--ll-grade);border-color:transparent}
.dsh-lingualab-grade-btn.is-on:hover{background:var(--ll-grade)}
.dsh-lingualab-note-zh{font-size:13px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-memo{display:flex;flex-direction:column;gap:6px;padding:8px 12px;border-radius:8px;margin-top:2px;
  background:var(--dsw-alias-bg-base,transparent);border:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25))}
.dsh-lingualab-memo-words{display:flex;align-items:center;flex-wrap:wrap;gap:6px;color:var(--ll-muted)}
.dsh-lingualab-word-chip{display:inline-flex;align-items:center;gap:2px;height:22px;padding:0 3px 0 8px;border-radius:6px;
  font-size:12px;font-weight:500;color:var(--dsw-alias-brand-primary,#4d6bfe);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 12%,transparent)}
.dsh-lingualab-word-chip-x{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;padding:0;
  border:0;border-radius:4px;cursor:pointer;color:inherit;background:none;opacity:.6}
.dsh-lingualab-word-chip-x:hover{opacity:1;background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 18%,transparent)}
.dsh-lingualab-memo-text{font-size:13px;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-step input[type=checkbox]{accent-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-drawer-foot{flex:none;padding:12px 24px;font-size:12px;line-height:1.5;
  color:var(--dsw-alias-label-secondary,#8a8f98);border-top:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.18))}
/* Undo toast: floats over the drawer's bottom, inverted so it reads as a message and not as content. */
.dsh-lingualab-toast{position:absolute;left:50%;bottom:64px;transform:translateX(-50%);z-index:3;display:flex;align-items:center;
  gap:12px;height:44px;padding:0 8px 0 16px;border-radius:12px;white-space:nowrap;font-size:13px;
  background:var(--dsw-alias-label-primary,#16181d);color:var(--dsw-alias-bg-base,#fff);
  box-shadow:0 8px 24px rgba(0,0,0,0.28);animation:ll-toast-in .18s ease-out}
.dsh-lingualab-toast-undo{display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 10px;border:0;border-radius:8px;
  background:none;cursor:pointer;font:inherit;font-weight:600;color:inherit;text-decoration:underline;text-underline-offset:3px}
.dsh-lingualab-toast-undo:hover{background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 16%,transparent)}
@keyframes ll-toast-in{from{transform:translate(-50%,8px);opacity:0}to{transform:translate(-50%,0);opacity:1}}
@media (max-width:860px){
  .dsh-lingualab-transcript{width:260px}
  .dsh-lingualab-transport-row{grid-template-columns:1fr;justify-items:center}
  .dsh-lingualab-transport-side.is-end{justify-content:center}
}
/* ── layers: browse, media folder, steps ─────────────────────── */
.dsh-lingualab-mask{position:absolute;inset:0;z-index:20;display:flex;align-items:flex-start;justify-content:center;
  padding:44px 24px;background:var(--ll-mask)}
.dsh-lingualab-modal{display:flex;flex-direction:column;width:min(620px,100%);max-height:100%;overflow:hidden;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.35));border-radius:14px;
  background:var(--ll-surface);box-shadow:0 18px 48px rgba(0,0,0,0.3)}
.dsh-lingualab-modal-head{display:flex;align-items:center;gap:8px;padding:12px 14px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22))}
.dsh-lingualab-modal-title{font-weight:600;font-size:14px}
.dsh-lingualab-tabs{display:flex;gap:8px;padding:14px 24px}
.dsh-lingualab-tab{border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));border-radius:999px;background:none;
  color:var(--dsw-alias-label-secondary,#8a8f98);cursor:pointer;font:inherit;font-size:12px;font-weight:500;height:28px;padding:0 12px}
.dsh-lingualab-tab:hover{background:var(--ll-hover)}
.dsh-lingualab-tab.is-on{background:var(--dsw-alias-brand-primary,#4d6bfe);border-color:transparent;color:var(--ll-on-brand)}
.dsh-lingualab-tab.is-on .dsh-lingualab-counter{color:inherit;opacity:.85}
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
.dsh-lingualab-group{margin:12px 6px 4px;font-size:11.5px;font-weight:600;letter-spacing:.03em;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-group:first-child{margin-top:4px}

/* The browse layer: a card that floats (stronger mask, a ring and a deeper shadow), a
   toolbar that stays put, a list that scrolls, and a footer that owns the one big action. */
.dsh-lingualab-mask:has(.is-browse){align-items:center;padding:24px;
  backdrop-filter:blur(3px)}
.dsh-lingualab-modal.is-browse{width:min(720px,100%);height:min(620px,100%);
  border-color:var(--dsw-alias-border-l2,rgba(127,127,127,0.4));
  box-shadow:0 0 0 1px var(--ll-hover),0 24px 64px rgba(0,0,0,0.38)}
.dsh-lingualab-browse-bar{flex:none;display:flex;flex-direction:column;gap:8px;padding:10px 14px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22));
  background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-pathrow{display:flex;align-items:center;gap:6px;min-width:0}
.dsh-lingualab-select{flex:none;max-width:180px;height:28px;padding:0 8px;border-radius:8px;cursor:pointer;
  background:var(--dsw-alias-bg-layer-2,transparent);color:inherit;font:inherit;font-size:12.5px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3))}
.dsh-lingualab-select:hover{border-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-icon-btn.is-small{width:28px;height:28px}
.dsh-lingualab-crumbs{flex:1;min-width:0;display:flex;align-items:center;flex-wrap:nowrap;overflow:hidden}
.dsh-lingualab-crumbs-root{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 7px;
  font-size:12px;color:var(--ll-muted);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.dsh-lingualab-crumb-item{display:inline-flex;align-items:center;flex:0 1 auto;min-width:0;color:var(--ll-muted)}
.dsh-lingualab-crumb{flex:none;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  height:26px;padding:0 7px;border:0;border-radius:6px;background:none;cursor:pointer;font:inherit;font-size:12.5px;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-crumb:hover:not(:disabled){background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-crumb.is-here,.dsh-lingualab-crumb:disabled{cursor:default;font-weight:600;
  color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-browse-bar .dsh-lingualab-input{height:34px;padding:0 11px;border-radius:9px;
  background:var(--dsw-alias-bg-base,transparent)}
.dsh-lingualab-browse-bar .dsh-lingualab-input:focus{outline:none;
  border-color:var(--dsw-alias-brand-primary,#4d6bfe);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 22%,transparent)}
.dsh-lingualab-modal.is-browse .dsh-lingualab-modal-body{padding:6px 10px 10px;transition:opacity .12s}
.dsh-lingualab-modal-body.is-loading{opacity:0.55}
.dsh-lingualab-pick{min-height:40px}
.dsh-lingualab-pick svg{flex:none;color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-pick.is-active{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 12%,transparent);
  box-shadow:inset 2px 0 0 var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-pick.is-active svg{color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-pick.is-episode{border:0.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.3));margin:4px 0 2px}
.dsh-lingualab-pick.is-inert{cursor:default;opacity:0.55;min-height:32px}
.dsh-lingualab-pick.is-inert:hover{background:none}
.dsh-lingualab-badge.is-ok{color:var(--dsw-alias-state-success-primary,#2f855a);
  border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2f855a) 45%,transparent);
  background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2f855a) 10%,transparent)}
.dsh-lingualab-badge.is-warn{color:var(--dsw-alias-state-warn-primary,#b7791f);
  border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#b7791f) 45%,transparent);
  background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#b7791f) 10%,transparent)}
.dsh-lingualab-empty.is-center{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;
  padding:56px 24px}
.dsh-lingualab-empty.is-center strong{font-weight:600;color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-error.is-pad,.dsh-lingualab-hint.is-pad{padding:8px 14px}
.dsh-lingualab-modal-foot{flex:none;display:flex;align-items:center;gap:10px;padding:9px 14px;
  border-top:1px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.22));
  background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-keys{font-size:11.5px;color:var(--ll-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  min-width:0}
.dsh-lingualab-foot-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#8a8f98);overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap;max-width:220px}
@media (max-width:640px){.dsh-lingualab-keys,.dsh-lingualab-foot-hint{display:none}}
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
.dsh-lingualab-btn.is-small{height:26px;padding:0 10px;font-size:12px;gap:5px}
.dsh-lingualab-btn:disabled{opacity:.45;cursor:default}
.dsh-lingualab-btn:disabled{opacity:0.45;cursor:default}


/* ── five steps ──────────────────────────────────────────────── */
.dsh-lingualab-steps-body{flex:1;min-height:0;overflow:auto;padding:14px 24px 20px;display:flex;flex-direction:column;gap:14px}
.dsh-lingualab-steps-total{display:flex;flex-direction:column;gap:8px;font-size:12.5px;
  color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-steps{display:flex;flex-direction:column;gap:8px}
.dsh-lingualab-step{display:flex;align-items:center;gap:12px;padding:12px;border-radius:14px;
  background:var(--dsw-alias-bg-base,transparent);border:0.5px solid var(--dsw-alias-border-l1,rgba(127,127,127,0.25));
  transition:background .15s ease,border-color .15s ease}
.dsh-lingualab-step.is-current{border-color:var(--dsw-alias-brand-primary,#4d6bfe);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4d6bfe) 9%,transparent)}
.dsh-lingualab-step.is-done .dsh-lingualab-step-label{color:var(--dsw-alias-label-secondary,#8a8f98)}
.dsh-lingualab-step-check{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;
  width:28px;height:28px;border-radius:999px;cursor:pointer;font-size:12px;font-weight:600;
  color:var(--dsw-alias-label-secondary,#8a8f98);border:1.5px solid var(--dsw-alias-border-l2,rgba(127,127,127,0.4));
  transition:background .15s ease,border-color .15s ease,color .15s ease}
.dsh-lingualab-step-check:hover{border-color:var(--dsw-alias-brand-primary,#4d6bfe)}
.dsh-lingualab-step-check:focus-within{outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:2px}
.dsh-lingualab-step-check.is-on{color:var(--ll-on-brand);background:var(--dsw-alias-state-success-primary,#2f855a);
  border-color:transparent;animation:ll-badge-in .3s cubic-bezier(.2,1.4,.4,1)}
.dsh-lingualab-step-main{flex:1;min-width:0;display:flex;flex-direction:column}
.dsh-lingualab-step-label{font-weight:600}
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
