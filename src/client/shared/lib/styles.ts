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
 * secondary`, and the four states, the warning one spelled `state-warn-primary`). An
 * earlier version also read `label-tertiary`, `bg-layer-3`, `bg-mask-1` and
 * `interactive-bg-hover`, none of which exist, and got by on their fallbacks, which are
 * tuned for one theme. The five derived values below are the replacements, built from
 * declared tokens with `color-mix`, so light and dark both follow the theme instead of
 * the fallback.
 *
 * **The fallbacks are dsh's light theme** (a near-black brand, `#61666b` for the secondary
 * label, hairline black borders, `#22c55e` / `#f59e0b` / `#ec1313` for the states), so a page
 * rendered without the host still looks like dsh. The look is monochrome: the brand is near
 * black in the light theme and near white in the dark one, and the state colours appear only
 * as small dots (a grade) or on a danger hover.
 */
export const STYLES = `
.dsh-lingualab-page{
  --ll-muted:color-mix(in srgb,var(--dsw-alias-label-secondary,#61666b) 80%,transparent);
  --ll-hover:color-mix(in srgb,var(--dsw-alias-label-primary,#0f1115) 8%,transparent);
  --ll-track:color-mix(in srgb,var(--dsw-alias-label-primary,#0f1115) 14%,transparent);
  --ll-wash:color-mix(in srgb,var(--dsw-alias-label-primary,#0f1115) 4%,transparent);
  --ll-mask:color-mix(in srgb,var(--dsw-alias-bg-base,#000) 55%,rgba(0,0,0,0.35));
  --ll-on-brand:var(--dsw-alias-bg-base,#fff);
  /* One timing for every hover, press, focus and on/off fade, so the page feels like a single
     surface: quick enough to never lag a click, slow enough to read as a fade and not a flicker.
     Change it here, not in a rule. Slower things (the masked sentence's blur, the entrance
     keyframes) keep their own timings on purpose. */
  --ll-fast:.12s;
  --ll-ease:ease;
  --ll-fade:var(--ll-fast) var(--ll-ease);
  /* Panels that float (drawers, cards, popovers). Not the host's bg-overlay: that token is
     its scrim colour, a mid gray in dark, and a panel painted with it reads as washed out. */
  --ll-surface:var(--dsw-alias-bg-layer-1,#ffffff);
  /* How much the sentence on stage is scaled by: the settings drawer's stage size (see below). */
  --ll-stage-scale:1;
  position:relative;display:flex;flex-direction:column;height:100%;min-height:0;overflow:hidden;
  background:var(--dsw-alias-bg-base,transparent);color:var(--dsw-alias-label-primary,inherit);
  font-size:14px;line-height:1.5;outline:none;
  /* A theme switch fades instead of flashing; the reduced-motion rule below zeroes it with the rest. */
  transition:background-color .2s ease,color .2s ease}
/* The stage size from the settings drawer. Only the two stage lines scale, so the rest of the page
   keeps the size the host's type scale gives it. */
.dsh-lingualab-page[data-ll-stage-size="s"]{--ll-stage-scale:.85}
.dsh-lingualab-page[data-ll-stage-size="l"]{--ll-stage-scale:1.2}
.dsh-lingualab-page button{font-family:inherit}
.dsh-lingualab-page button:focus-visible,.dsh-lingualab-page select:focus-visible,
.dsh-lingualab-page input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#0f1115);outline-offset:1px}

/* ── top bar ─────────────────────────────────────────────────── */
.dsh-lingualab-top{flex:none;display:flex;align-items:center;gap:8px;height:48px;padding:0 12px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
.dsh-lingualab-top-title{min-width:0;max-width:420px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font-weight:600;padding:0 4px}
.dsh-lingualab-spacer{flex:1;min-width:8px}
.dsh-lingualab-chip{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:999px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));background:none;cursor:pointer;
  color:var(--dsw-alias-label-secondary,#61666b);font:inherit;font-size:12px;white-space:nowrap;
  transition:background var(--ll-fade),color var(--ll-fade),border-color var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-chip kbd{font:inherit;font-size:11px;opacity:.6}
.dsh-lingualab-chip:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-chip.is-on{border-color:var(--dsw-alias-brand-primary,#0f1115);color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-chip:disabled{opacity:0.45;cursor:default}
/* The segment button and its list: a popover under the top bar, a listbox the keyboard walks. */
.dsh-lingualab-seg-holder{position:relative;display:inline-flex}
.dsh-lingualab-chevron{display:inline-flex;transform:rotate(90deg);transition:transform var(--ll-fade)}
.dsh-lingualab-chevron.is-open{transform:rotate(-90deg)}
.dsh-lingualab-seglist{position:absolute;left:0;top:calc(100% + 6px);z-index:25;display:flex;flex-direction:column;gap:2px;
  box-sizing:border-box;width:min(320px,80vw);max-height:min(380px,60vh);overflow:auto;padding:6px;outline:none;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));border-radius:12px;
  background:var(--ll-surface);box-shadow:0 18px 48px rgba(0,0,0,0.3)}
.dsh-lingualab-seglist:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#0f1115);outline-offset:1px}
.dsh-lingualab-segopt{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;cursor:pointer;
  font-size:13px;line-height:1.4;transition:background var(--ll-fade),color var(--ll-fade)}
.dsh-lingualab-segopt.is-active{background:var(--ll-hover)}
.dsh-lingualab-segopt.is-current{color:var(--dsw-alias-brand-primary,#0f1115);font-weight:600}
.dsh-lingualab-segopt-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-segopt-now{flex:none;font-size:11px;font-weight:500;opacity:.85}
.dsh-lingualab-segopt-done{flex:none;display:inline-flex;color:var(--dsw-alias-state-success-primary,#22c55e)}
/* A section heading inside the 「收藏」 column: the segment the cards under it are from. */
.dsh-lingualab-notes-group{flex:none;margin:6px 0 -4px;font-size:12px;font-weight:600;letter-spacing:.02em;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-notes-group:first-child{margin-top:0}
.dsh-lingualab-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;
  padding:0;border:0;border-radius:8px;background:none;color:var(--dsw-alias-label-secondary,#61666b);cursor:pointer;
  transition:background var(--ll-fade),color var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-icon-btn:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-icon-btn:disabled{opacity:0.4;cursor:default}
.dsh-lingualab-icon-btn.is-star.is-on{color:var(--dsw-alias-state-warn-primary,#f59e0b)}
.dsh-lingualab-icon-btn.is-on{color:var(--dsw-alias-brand-primary,#0f1115)}

/* ── home ────────────────────────────────────────────────────── */
.dsh-lingualab-home{flex:1;min-height:0;display:flex;flex-direction:column}
.dsh-lingualab-drop{position:relative;flex:1;min-height:0;overflow:auto}
.dsh-lingualab-home-inner{display:flex;flex-direction:column;gap:22px;width:min(900px,100%);
  margin:0 auto;padding:28px 24px 32px;box-sizing:border-box}
.dsh-lingualab-welcome{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;
  padding:40px 24px;border:1.5px dashed var(--dsw-alias-border-l2,rgba(0,0,0,0.1));border-radius:16px;
  background:var(--dsw-alias-bg-layer-1,transparent);transition:border-color var(--ll-fade)}
.dsh-lingualab-welcome h1{margin:0;font-size:20px;font-weight:600}
.dsh-lingualab-welcome p{margin:0;max-width:460px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-welcome-icon{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;
  border-radius:999px;background:var(--ll-hover);color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-drop.is-over .dsh-lingualab-welcome{border-color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-drop-veil{position:absolute;inset:0;z-index:30;display:flex;align-items:center;justify-content:center;
  background:var(--ll-mask);pointer-events:none}
.dsh-lingualab-drop-veil-card{display:flex;flex-direction:column;align-items:center;gap:6px;padding:28px 40px;
  border:2px dashed var(--dsw-alias-brand-primary,#0f1115);border-radius:16px;
  background:var(--ll-surface);font-size:16px}
.dsh-lingualab-drop-veil-card span{font-size:12px;color:var(--dsw-alias-label-secondary,#61666b)}

.dsh-lingualab-resume{display:flex;flex-direction:column;gap:12px;padding:26px 28px;border-radius:20px;
  border:0.5px solid color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 35%,transparent);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 9%,var(--dsw-alias-bg-base,transparent))}
.dsh-lingualab-resume-label{font-size:12px;color:var(--dsw-alias-brand-primary,#0f1115);font-weight:600;letter-spacing:.02em}
.dsh-lingualab-resume-title{margin:0;font-size:28px;line-height:1.25;font-weight:700;letter-spacing:-.01em;word-break:break-word}
.dsh-lingualab-resume-meta{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:12.5px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-section{display:flex;flex-direction:column;gap:8px}
/* The home's weekly pass: how much is left to review across the library, and its button. */
.dsh-lingualab-reviewcard{display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:14px;
  background:var(--dsw-alias-bg-layer-1,transparent);border:0.5px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
.dsh-lingualab-reviewcard-icon{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;
  flex:none;border-radius:10px;color:var(--dsw-alias-state-warn-primary,#f59e0b);
  background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#f59e0b) 13%,transparent)}
.dsh-lingualab-reviewcard-text{display:flex;flex-direction:column;gap:2px;min-width:0}
.dsh-lingualab-reviewcard-text span{font-size:12.5px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-section-head{display:flex;align-items:center;gap:8px}
.dsh-lingualab-section-head h2{margin:0;font-size:14px;font-weight:600}
.dsh-lingualab-episodes{display:flex;flex-direction:column;gap:2px}
.dsh-lingualab-episodes.is-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.dsh-lingualab-episode-card{display:flex;flex-direction:column;align-items:stretch;gap:8px;padding:16px;border-radius:16px;
  text-align:left;color:inherit;font:inherit;cursor:pointer;background:var(--dsw-alias-bg-layer-1,transparent);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  transition:transform var(--ll-fade),border-color var(--ll-fade),box-shadow var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-episode-card:hover:not(:disabled){transform:translateY(-2px);
  border-color:var(--dsw-alias-brand-primary,#0f1115);box-shadow:0 10px 26px rgba(0,0,0,0.14)}
.dsh-lingualab-episode-card:active:not(:disabled){transform:none}
.dsh-lingualab-episode-card:disabled{opacity:0.6;cursor:default}
.dsh-lingualab-episode-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.dsh-lingualab-episode-icon{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;
  border-radius:10px;color:var(--dsw-alias-brand-primary,#0f1115);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 12%,transparent)}
.dsh-lingualab-episode-title{font-size:16px;font-weight:600;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;
  -webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
.dsh-lingualab-dropstrip{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:14px;
  border:1.5px dashed var(--dsw-alias-border-l2,rgba(0,0,0,0.1));color:var(--dsw-alias-label-secondary,#61666b);
  transition:border-color var(--ll-fade),background var(--ll-fade)}
.dsh-lingualab-drop.is-over .dsh-lingualab-dropstrip{border-color:var(--dsw-alias-brand-primary,#0f1115);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 8%,transparent)}
.dsh-lingualab-episode-row{display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;padding:10px 12px;
  border:0;border-radius:10px;background:none;color:inherit;font:inherit;cursor:pointer;text-align:left;
  transition:background var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-episode-row:hover{background:var(--ll-hover)}
.dsh-lingualab-episode-row:disabled{opacity:0.6;cursor:default}
.dsh-lingualab-resume .dsh-lingualab-bar{height:6px}
.dsh-lingualab-bar{position:relative;height:4px;border-radius:999px;background:var(--ll-track);overflow:hidden}
.dsh-lingualab-bar.is-small{flex:none;width:64px;height:3px}
.dsh-lingualab-bar-fill{position:absolute;top:0;bottom:0;left:0;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-report{display:flex;flex-direction:column;gap:6px;padding:12px 14px;border-radius:12px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-folderline{display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:12px;
  color:var(--dsw-alias-label-secondary,#61666b);padding-top:4px}
.dsh-lingualab-link{border:0;background:none;padding:0;cursor:pointer;font:inherit;font-size:12px;
  color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-link:hover{text-decoration:underline}

/* ── practice: a stage on the left, the transcript on the right ─ */
.dsh-lingualab-body{flex:1;min-height:0;display:flex;container:ll-body/inline-size}
.dsh-lingualab-practice{position:relative;flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;
  padding:0 24px 20px;container:ll-practice/size}
/* Everything above the player card. It is the part that scrolls when the column is too short for the picture, the
   sentence and the timing panel at once, so the card with the play button never leaves the screen. The side margins give
   the panel's shadow room inside the scroller. */
.dsh-lingualab-practice-main{flex:1;min-height:0;display:flex;flex-direction:column;margin:0 -24px;padding:0 24px;
  overflow-x:hidden;overflow-y:auto}
.dsh-lingualab-top-heading{display:flex;flex-direction:column;min-width:0;line-height:1.25;padding:0 4px}
.dsh-lingualab-top-heading .dsh-lingualab-top-title{padding:0}
.dsh-lingualab-top-sub{font-size:11.5px;color:var(--dsw-alias-label-secondary,#61666b);font-variant-numeric:tabular-nums}
.dsh-lingualab-pill{display:inline-flex;align-items:center;height:22px;padding:0 10px;border-radius:999px;font-size:12px;
  font-weight:600;color:var(--dsw-alias-brand-primary,#0f1115);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 12%,transparent)}

.dsh-lingualab-stage{flex:1 0 auto;min-height:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:14px;padding:20px 12px;text-align:center}
.dsh-lingualab-stage-meta{display:flex;align-items:center;gap:10px;font-size:12px;
  color:var(--dsw-alias-label-secondary,#61666b);font-variant-numeric:tabular-nums}
.dsh-lingualab-stage-side{width:100%;max-width:760px;min-height:1.5em;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap;font-size:15px;color:var(--ll-muted);opacity:.7;
  -webkit-mask-image:linear-gradient(to right,transparent,#000 12%,#000 88%,transparent);
  mask-image:linear-gradient(to right,transparent,#000 12%,#000 88%,transparent)}
.dsh-lingualab-stage-now{position:relative;width:100%;max-width:860px;display:flex;flex-direction:column;align-items:center;
  gap:12px;animation:ll-sentence-in .2s ease-out}
@keyframes ll-sentence-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.dsh-lingualab-stage-en{font-size:calc(clamp(26px,3.1vw,44px) * var(--ll-stage-scale));line-height:1.25;font-weight:700;letter-spacing:-.01em;
  word-break:break-word;transition:filter .2s ease}
.dsh-lingualab-stage-en.is-long{font-size:calc(clamp(20px,2.2vw,30px) * var(--ll-stage-scale));line-height:1.35}
.dsh-lingualab-stage-en.is-masked{filter:blur(12px);user-select:none;pointer-events:none}
/* A tinted word reaches a little past its letters on both sides, through a box shadow (drawn only
   outside the box, so the tint never doubles) rather than padding, which would shift the line. */
.dsh-lingualab-stage-en{--ll-word-tint:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 14%,transparent)}
.dsh-lingualab-stage-en .is-word{cursor:pointer;border-radius:.18em;
  transition:background var(--ll-fade),color var(--ll-fade),box-shadow var(--ll-fade),border-radius var(--ll-fade)}
/* A finger drags across the words to pick a phrase, so the block must not scroll or select under it. touch-action does not apply to the non-replaced inline words, so it is set on this block. */
.dsh-lingualab-stage-en:not(.is-masked){touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
/* The gaps of a picked phrase carry no class until the phrase is picked, so the fade is set on
   every plain span of the sentence: the band fades out with its words instead of snapping off. */
.dsh-lingualab-stage-en>span{transition:background var(--ll-fade)}
.dsh-lingualab-stage-en .is-word:hover{background:var(--ll-word-tint);
  box-shadow:-.12em 0 0 var(--ll-word-tint),.12em 0 0 var(--ll-word-tint)}
/* A picked phrase is one band: the gaps are tinted too, and only its two ends are rounded. */
.dsh-lingualab-stage-en .is-between{background:var(--ll-word-tint)}
.dsh-lingualab-stage-en .is-word.is-pinned{color:var(--dsw-alias-brand-primary,#0f1115);background:var(--ll-word-tint);
  border-radius:0;box-shadow:none}
.dsh-lingualab-stage-en .is-word.is-pinned.is-from{border-top-left-radius:.18em;border-bottom-left-radius:.18em;
  box-shadow:-.12em 0 0 var(--ll-word-tint)}
.dsh-lingualab-stage-en .is-word.is-pinned.is-to{border-top-right-radius:.18em;border-bottom-right-radius:.18em;
  box-shadow:.12em 0 0 var(--ll-word-tint)}
.dsh-lingualab-stage-en .is-word.is-pinned.is-from.is-to{box-shadow:-.12em 0 0 var(--ll-word-tint),.12em 0 0 var(--ll-word-tint)}
.dsh-lingualab-stage-zh{font-size:calc(clamp(15px,1.5vw,20px) * var(--ll-stage-scale));color:color-mix(in srgb,var(--dsw-alias-label-secondary,#61666b) 80%,transparent);
  transition:color var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-stage-zh[data-zh="always"]{color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-stage-empty{display:flex;flex-direction:column;align-items:center;gap:6px;max-width:420px;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-stage-empty strong{font-size:16px;font-weight:600;color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-reveal{position:absolute;top:calc(50% - 18px);left:50%;transform:translateX(-50%);display:inline-flex;
  align-items:center;gap:8px;height:34px;padding:0 14px;border-radius:999px;cursor:pointer;font:inherit;font-size:13px;
  color:var(--dsw-alias-label-primary,inherit);background:var(--ll-surface);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));box-shadow:0 6px 20px rgba(0,0,0,0.18);
  transition:border-color var(--ll-fade)}
.dsh-lingualab-reveal:hover{border-color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-stage-now:has(.is-masked) .dsh-lingualab-stage-zh{opacity:0.5}

/* The word popover: small, over the word, and never in the way of the audio. */
.dsh-lingualab-word-pop{position:absolute;z-index:6;display:flex;align-items:center;gap:6px;padding:6px 8px;
  transform:translate(-50%,calc(-100% - 8px));white-space:nowrap;border-radius:12px;font-size:13px;
  background:var(--ll-surface);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));box-shadow:0 12px 32px rgba(0,0,0,0.28);
  animation:ll-pop-in .12s ease-out}
@keyframes ll-pop-in{from{opacity:0;transform:translate(-50%,calc(-100% - 2px))}
  to{opacity:1;transform:translate(-50%,calc(-100% - 8px))}}
.dsh-lingualab-word-pop b{padding:0 6px;font-weight:600}
.dsh-lingualab-pop-btn{display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 9px;border-radius:8px;cursor:pointer;
  font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);background:none;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  transition:background var(--ll-fade),color var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-pop-btn:hover:not(:disabled){background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-pop-btn:disabled{cursor:default;opacity:.45}
/* A word or phrase already in the note: the button says so, and takes it out on a click. */
.dsh-lingualab-pop-btn.is-on{color:var(--dsw-alias-state-success-primary,#22c55e)}

/* The stage time range opens the timing panel, so it reads as a quiet button, and a ringed one while open. */
.dsh-lingualab-stage-time{font:inherit;font-variant-numeric:tabular-nums;color:inherit;background:none;
  border:1px solid transparent;padding:1px 7px;border-radius:6px;cursor:pointer;
  transition:background var(--ll-fade),color var(--ll-fade),border-color var(--ll-fade)}
.dsh-lingualab-stage-time:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-stage-time.is-on{border-color:var(--dsw-alias-brand-primary,#0f1115);color:var(--dsw-alias-label-primary,inherit);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 8%,transparent)}

/* The timing panel, between the stage and the player card. It only exists while the column is in timing mode, and takes its
   full height from the first frame to the last: the layout around it (the picture above all) steps once each way, and only
   the card inside fades and lifts, so nothing is ever drawn at a size it does not keep. It stays mounted for as long as the
   way out takes, and the page keeps the column in timing mode for as long; see usePresence. */
.dsh-lingualab-timing-wrap{flex:none;width:min(720px,100%);align-self:center}
.dsh-lingualab-timing-wrap:not(.is-open){pointer-events:none}
.dsh-lingualab-timing-clip{overflow:hidden}
.dsh-lingualab-timing{display:flex;flex-direction:column;gap:12px;box-sizing:border-box;margin-bottom:10px;
  padding:14px 16px 12px;border-radius:14px;background:var(--ll-surface);
  border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));box-shadow:0 8px 24px rgba(0,0,0,0.08);
  opacity:0;transform:translateY(12px) scale(.98);
  transition:opacity .18s ease,transform .24s cubic-bezier(.2,.8,.2,1)}
.dsh-lingualab-timing-wrap.is-open .dsh-lingualab-timing{opacity:1;transform:none}
.dsh-lingualab-timing-row{display:flex;align-items:center;gap:10px}
.dsh-lingualab-timing-title{font-size:14px;font-weight:600}
.dsh-lingualab-timing-status{display:inline-flex;align-items:center;gap:6px;font-size:12px;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-timing-status::before{content:'';width:6px;height:6px;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#0f1115);animation:ll-pulse 1.6s ease-in-out infinite}
.dsh-lingualab-timing-status.is-paused::before{display:none}
@keyframes ll-pulse{0%,100%{opacity:1}50%{opacity:.35}}

/* The mini timeline: the sentence before, the range being edited, the sentence after, and the playhead. */
.dsh-lingualab-timing-line{position:relative;padding-bottom:16px}
.dsh-lingualab-timing-track{position:relative;height:34px;border-radius:8px;background:var(--ll-wash)}
.dsh-lingualab-timing-block{position:absolute;top:9px;height:16px;border-radius:4px;box-sizing:border-box;
  background:var(--ll-track);transition:left var(--ll-fade),width var(--ll-fade)}
.dsh-lingualab-timing-block.is-current{top:5px;height:24px;border-radius:5px;
  border:1.5px solid var(--dsw-alias-brand-primary,#0f1115);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 14%,transparent)}
.dsh-lingualab-timing-head{position:absolute;top:2px;bottom:2px;width:2px;margin-left:-1px;border-radius:1px;
  background:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-timing-end{position:absolute;bottom:0;font-size:11px;color:var(--ll-muted);font-variant-numeric:tabular-nums}
.dsh-lingualab-timing-end.is-from{left:8px}
.dsh-lingualab-timing-end.is-to{right:8px}

/* The two edge cards: the focused one is the one the arrow keys move. */
.dsh-lingualab-timing-edges{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.dsh-lingualab-timing-edge{display:flex;flex-direction:column;gap:8px;padding:10px 12px;border-radius:12px;cursor:pointer;
  background:var(--ll-surface);border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  transition:border-color var(--ll-fade),background var(--ll-fade),box-shadow var(--ll-fade)}
.dsh-lingualab-timing-edge.is-readonly{cursor:default}
.dsh-lingualab-timing-edge.is-focus{border-color:var(--dsw-alias-brand-primary,#0f1115);background:var(--ll-wash);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 12%,transparent)}
.dsh-lingualab-timing-edge-head{display:flex;align-items:center;gap:8px;min-height:18px}
.dsh-lingualab-timing-label{font-size:12px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-timing-delta{font-size:11px;font-weight:600;font-variant-numeric:tabular-nums}
.dsh-lingualab-timing-keys{font-size:11px;color:var(--ll-muted);opacity:0;transition:opacity var(--ll-fade)}
.dsh-lingualab-timing-edge.is-focus .dsh-lingualab-timing-keys{opacity:1}
.dsh-lingualab-timing-edge-body{display:flex;align-items:center;gap:8px}
.dsh-lingualab-timing-value{padding:0;border:0;background:none;cursor:pointer;font:inherit;font-size:22px;font-weight:600;
  letter-spacing:-.01em;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-timing-value:disabled{cursor:default;font-weight:500;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-timing-step{display:inline-flex;overflow:hidden;border-radius:8px;
  border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1))}
.dsh-lingualab-timing-step button{width:36px;height:30px;padding:0;border:0;background:none;cursor:pointer;font:inherit;
  font-size:12px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-primary,inherit);
  transition:background var(--ll-fade)}
.dsh-lingualab-timing-step button:hover{background:var(--ll-hover)}
.dsh-lingualab-timing-step button+button{border-left:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1))}
.dsh-lingualab-timing-ghost{--ll-ghost-pad:8px;align-self:flex-start;display:inline-flex;align-items:center;gap:6px;height:26px;
  padding:0 var(--ll-ghost-pad);margin-left:calc(var(--ll-ghost-pad) * -1);border:0;border-radius:6px;background:none;cursor:pointer;font:inherit;font-size:12px;
  color:var(--dsw-alias-label-secondary,#61666b);transition:background var(--ll-fade),color var(--ll-fade)}
.dsh-lingualab-timing-ghost:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-page .dsh-lingualab-timing-ghost kbd{height:16px;min-width:16px;padding:0 4px;font-size:11px;font-weight:500;
  border-bottom-width:0.5px}

/* A neutral bar for what the strip wants to say: a neighbour that moves along, a save that cannot happen. */
.dsh-lingualab-timing-note{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;font-size:12px;
  background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-timing-note svg{flex:none}
.dsh-lingualab-timing-note.is-warn::before{content:'';flex:none;width:6px;height:6px;border-radius:999px;
  background:var(--dsw-alias-state-warn-primary,#f59e0b)}
.dsh-lingualab-timing .dsh-lingualab-error{padding:0}

/* Footer: the keys on the left, then undo, cancel and save. */
.dsh-lingualab-timing-foot{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding-top:10px;
  border-top:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
.dsh-lingualab-timing-hints{display:inline-flex;flex-wrap:wrap;align-items:center;gap:4px 10px;font-size:11.5px;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-page .dsh-lingualab-timing-hints kbd{height:18px;min-width:18px;padding:0 4px;font-size:11px;
  font-weight:500;border-bottom-width:0.5px}
.dsh-lingualab-timing-foot .dsh-lingualab-btn{height:32px;padding:0 12px;font-size:13px}
.dsh-lingualab-timing-foot .dsh-lingualab-btn.is-primary{padding:0 14px;font-weight:600}
.dsh-lingualab-page .dsh-lingualab-timing-foot .dsh-lingualab-btn.is-primary kbd{height:auto;min-width:0;padding:0;border:0;background:none;
  color:inherit;font-size:11px;font-weight:500;opacity:.75}

/* The player card: scrubber on top, then the controls in three groups. */
.dsh-lingualab-deck{flex:none;display:flex;flex-direction:column;gap:12px;width:min(720px,100%);align-self:center;
  box-sizing:border-box;padding:16px 20px 14px;border-radius:20px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-transport{display:flex;flex-direction:column;gap:12px;width:100%}
.dsh-lingualab-transport-row{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px}
.dsh-lingualab-transport-side{display:flex;align-items:center;gap:4px;min-width:0;flex-wrap:wrap}
.dsh-lingualab-transport-side.is-end{justify-content:flex-end}
.dsh-lingualab-transport-main{display:flex;align-items:center;gap:14px}
.dsh-lingualab-play{display:inline-flex;align-items:center;justify-content:center;width:60px;height:60px;flex:none;
  border:0;border-radius:999px;background:var(--dsw-alias-brand-primary,#0f1115);color:var(--ll-on-brand);cursor:pointer;
  box-shadow:0 8px 22px color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 38%,transparent);
  transition:transform var(--ll-fade),filter var(--ll-fade),opacity var(--ll-fade),box-shadow var(--ll-fade)}
.dsh-lingualab-play:hover:not(:disabled){filter:brightness(1.08)}
.dsh-lingualab-play:active:not(:disabled){transform:scale(.94)}
.dsh-lingualab-play:disabled{opacity:0.45;cursor:default;box-shadow:none}
.dsh-lingualab-round{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;padding:0;
  border-radius:999px;cursor:pointer;color:var(--dsw-alias-label-primary,inherit);background:none;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  transition:transform var(--ll-fade),background var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-round:hover:not(:disabled){background:var(--ll-hover)}
.dsh-lingualab-round:active:not(:disabled){transform:scale(.92)}
.dsh-lingualab-round:disabled{opacity:0.4;cursor:default}
.dsh-lingualab-bar-btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;height:32px;min-width:32px;
  padding:0 10px;border:0.5px solid transparent;border-radius:9px;background:none;
  color:var(--dsw-alias-label-secondary,#61666b);cursor:pointer;font:inherit;font-size:12px;white-space:nowrap;
  transition:background var(--ll-fade),color var(--ll-fade),border-color var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-bar-btn:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-bar-btn.is-on{border-color:var(--dsw-alias-brand-primary,#0f1115);color:var(--dsw-alias-brand-primary,#0f1115);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 10%,transparent)}
.dsh-lingualab-bar-btn.is-star.is-on{border-color:var(--dsw-alias-state-warn-primary,#f59e0b);
  color:var(--dsw-alias-state-warn-primary,#f59e0b);
  background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#f59e0b) 10%,transparent)}
.dsh-lingualab-bar-btn:disabled{opacity:0.4;cursor:default}
.dsh-lingualab-time{flex:none;min-width:40px;font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);
  font-variant-numeric:tabular-nums}
.dsh-lingualab-time:last-child{text-align:right}
.dsh-lingualab-menu-holder{position:relative;display:inline-flex}
.dsh-lingualab-menu{position:absolute;right:0;bottom:calc(100% + 6px);z-index:25;display:flex;flex-direction:column;gap:10px;
  width:300px;padding:12px;border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));border-radius:12px;
  background:var(--ll-surface);box-shadow:0 18px 48px rgba(0,0,0,0.3);
  text-align:left}
.dsh-lingualab-menu-title{font-size:12px;font-weight:600}
.dsh-lingualab-menu-keys{display:grid;grid-template-columns:auto 1fr;gap:3px 12px;margin:0;padding-top:8px;
  border-top:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04));font-size:12px;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-menu-keys dt{font-weight:600;color:var(--dsw-alias-label-primary,inherit);
  font-variant-numeric:tabular-nums}
.dsh-lingualab-menu-keys dd{margin:0}
.dsh-lingualab-menu-row{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:13px}
/* The 「字幕」 popover: a slot per row, the file lists as wide as the popover lets them be. */
.dsh-lingualab-menu.is-subs{width:340px;max-width:calc(100vw - 32px)}
.dsh-lingualab-subs-select{flex:1;min-width:0;max-width:240px;justify-content:flex-start;text-overflow:ellipsis}
.dsh-lingualab-subs-note{font-size:12px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-actions.is-end{justify-content:flex-end}
.dsh-lingualab-bar-btn.is-warn{border-color:var(--dsw-alias-state-warn-primary,#f59e0b);color:var(--dsw-alias-state-warn-primary,#f59e0b)}

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
.dsh-lingualab-scrub-track:hover .dsh-lingualab-scrub-knob{transform:scale(1.1)}
.dsh-lingualab-scrub-tip{position:absolute;bottom:calc(100% + 6px);z-index:8;display:flex;flex-direction:column;gap:2px;
  width:max-content;max-width:220px;transform:translateX(-50%);padding:6px 10px;border-radius:10px;font-size:12px;
  text-align:left;pointer-events:none;color:var(--dsw-alias-label-primary,inherit);
  background:var(--ll-surface);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));box-shadow:0 10px 28px rgba(0,0,0,0.25)}
.dsh-lingualab-scrub-tip b{font-variant-numeric:tabular-nums}
.dsh-lingualab-scrub-tip span{color:var(--dsw-alias-label-secondary,#61666b);display:-webkit-box;-webkit-line-clamp:2;
  -webkit-box-orient:vertical;overflow:hidden}

/* Key caps: they light up when the page handles that key. */
.dsh-lingualab-keyhints{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px 16px;
  font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);transition:opacity var(--ll-fade)}
.dsh-lingualab-keyhints.is-idle{opacity:0.55}
.dsh-lingualab-keyhint{display:inline-flex;align-items:center;gap:4px}
.dsh-lingualab-page kbd{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;
  box-sizing:border-box;border-radius:6px;font:inherit;font-size:11px;font-weight:600;
  color:var(--dsw-alias-label-secondary,#61666b);background:var(--dsw-alias-bg-base,transparent);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  border-bottom-width:2px;
  transition:background var(--ll-fade),color var(--ll-fade),border-color var(--ll-fade),transform var(--ll-fade)}
.dsh-lingualab-keyhint.is-hit kbd{background:var(--dsw-alias-brand-primary,#0f1115);color:var(--ll-on-brand);
  border-color:var(--dsw-alias-brand-primary,#0f1115);transform:translateY(1px)}
.dsh-lingualab-keyhint{transition:color var(--ll-fade)}
.dsh-lingualab-keyhint.is-hit{color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-reveal kbd{margin-left:2px}

/* ── transcript: the only scroller ───────────────────────────── */
.dsh-lingualab-transcript{flex:none;width:clamp(300px,34%,440px);min-height:0;display:flex;flex-direction:column;
  border-left:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-transcript-head{flex:none;display:flex;align-items:center;gap:8px;height:48px;padding:0 16px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
.dsh-lingualab-transcript-title{font-weight:600}
.dsh-lingualab-switch{display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-switch-track{position:relative;width:30px;height:18px;border-radius:999px;background:var(--ll-track);
  transition:background var(--ll-fade)}
.dsh-lingualab-switch-knob{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:999px;
  background:var(--dsw-alias-bg-base,#fff);box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:transform var(--ll-fade)}
.dsh-lingualab-switch input:checked + .dsh-lingualab-switch-track{background:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-switch input:checked + .dsh-lingualab-switch-track .dsh-lingualab-switch-knob{transform:translateX(12px)}
.dsh-lingualab-switch input:focus-visible + .dsh-lingualab-switch-track{
  outline:2px solid var(--dsw-alias-brand-primary,#0f1115);outline-offset:2px}
.dsh-lingualab-list{position:relative;flex:1;min-width:0;min-height:0;overflow:auto;padding:8px}
.dsh-lingualab-row{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:10px;align-items:start;
  padding:9px 10px;margin-bottom:2px;cursor:pointer;border-radius:10px;transition:background var(--ll-fade),box-shadow var(--ll-fade)}
.dsh-lingualab-row:hover,.dsh-lingualab-row.is-selected{background:var(--ll-hover)}
.dsh-lingualab-row.is-active{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 11%,transparent);
  box-shadow:inset 3px 0 0 var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-row-time{font-size:11.5px;color:var(--ll-muted);font-variant-numeric:tabular-nums;padding-top:3px;
  transition:color var(--ll-fade)}
.dsh-lingualab-row.is-active .dsh-lingualab-row-time{color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-row-en{min-width:0;word-break:break-word;color:var(--dsw-alias-label-secondary,#61666b);
  transition:color var(--ll-fade)}
.dsh-lingualab-row.is-active .dsh-lingualab-row-en{color:var(--dsw-alias-label-primary,inherit);font-weight:600}
/* Dimmed is small and faint, so the English leads; always is the same size and weight of
   colour as the English, so both languages read as one block. */
.dsh-lingualab-row-zh{margin-top:2px;font-size:12px;
  color:color-mix(in srgb,var(--dsw-alias-label-secondary,#61666b) 55%,transparent);transition:color var(--ll-fade)}
.dsh-lingualab-row.is-active .dsh-lingualab-row-zh{
  color:color-mix(in srgb,var(--dsw-alias-label-secondary,#61666b) 80%,transparent)}
.dsh-lingualab-list[data-zh="always"] .dsh-lingualab-row-zh{font-size:inherit;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-list[data-zh="always"] .dsh-lingualab-row.is-active .dsh-lingualab-row-zh{
  color:var(--dsw-alias-label-primary,inherit)}
/* Hidden actions drop out of the tab order and hit testing, but only once the fade has finished:
   the visibility change waits one beat when hiding and happens at once when showing. */
.dsh-lingualab-row-actions{display:flex;align-items:center;gap:2px;opacity:0;visibility:hidden;
  transition:opacity var(--ll-fade),visibility 0s linear var(--ll-fast)}
.dsh-lingualab-row:hover .dsh-lingualab-row-actions,.dsh-lingualab-row.is-active .dsh-lingualab-row-actions{
  opacity:1;visibility:visible;transition:opacity var(--ll-fade),visibility 0s}
/* A kept sentence shows its star at rest, so the list reads as a map of what you took. */
.dsh-lingualab-row-actions.is-kept{opacity:1;visibility:visible}
.dsh-lingualab-row-actions.is-kept .dsh-lingualab-icon-btn:not(.is-star){opacity:0;visibility:hidden;
  transition:background var(--ll-fade),color var(--ll-fade),opacity var(--ll-fade),visibility 0s linear var(--ll-fast)}
.dsh-lingualab-row:hover .dsh-lingualab-row-actions.is-kept .dsh-lingualab-icon-btn,
.dsh-lingualab-row.is-active .dsh-lingualab-row-actions.is-kept .dsh-lingualab-icon-btn{opacity:1;visibility:visible;
  transition:background var(--ll-fade),color var(--ll-fade),opacity var(--ll-fade),visibility 0s}

/* ── finish card ─────────────────────────────────────────────── */
.dsh-lingualab-finish{position:absolute;inset:0;z-index:15;display:flex;align-items:center;justify-content:center;
  padding:16px;background:var(--ll-mask);backdrop-filter:blur(2px);animation:ll-fade-in .18s ease-out}
@keyframes ll-fade-in{from{opacity:0}to{opacity:1}}
.dsh-lingualab-finish-card{display:flex;flex-direction:column;align-items:center;gap:12px;width:min(460px,100%);
  box-sizing:border-box;padding:28px 28px 20px;text-align:center;border-radius:20px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  background:var(--ll-surface);box-shadow:0 24px 64px rgba(0,0,0,0.38);
  animation:ll-sentence-in .22s ease-out}
.dsh-lingualab-finish-card h2{margin:0;font-size:20px;font-weight:700}
.dsh-lingualab-finish-card p{margin:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-finish-badge{display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;
  border-radius:999px;color:var(--ll-on-brand);background:var(--dsw-alias-state-success-primary,#22c55e);
  animation:ll-badge-in .35s cubic-bezier(.2,1.4,.4,1)}
@keyframes ll-badge-in{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}
.dsh-lingualab-finish-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%;margin:4px 0 6px}
.dsh-lingualab-finish-stats div{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 6px;
  border-radius:12px;background:var(--dsw-alias-bg-layer-1,transparent);
  border:0.5px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
.dsh-lingualab-finish-stats dt{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}
.dsh-lingualab-finish-stats dd{margin:0;font-size:11.5px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-finish-stats.is-four{grid-template-columns:repeat(4,1fr)}

/* ── review: the strip above the stage ───────────────────────── */
.dsh-lingualab-review{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px;width:min(860px,100%);
  align-self:center;box-sizing:border-box;margin-top:14px;padding:8px 10px 8px 12px;border-radius:14px;
  background:var(--ll-surface);border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1))}
.dsh-lingualab-review-source{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-review .dsh-lingualab-pop-btn kbd{font:inherit;font-size:11px;opacity:.7}

/* ── segmented control: the right column's switch and the kept filter ── */
.dsh-lingualab-segmented{display:inline-flex;gap:2px;padding:2px;border-radius:9px;background:var(--ll-hover)}
.dsh-lingualab-segmented button{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 11px;border:0;
  border-radius:7px;cursor:pointer;font:inherit;font-size:13px;font-weight:600;background:none;
  color:var(--dsw-alias-label-secondary,#61666b);
  transition:background var(--ll-fade),color var(--ll-fade),box-shadow var(--ll-fade)}
.dsh-lingualab-segmented button:hover{color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-segmented button.is-on{color:var(--dsw-alias-label-primary,inherit);background:var(--ll-surface);
  box-shadow:0 1px 3px rgba(0,0,0,0.14)}
.dsh-lingualab-segmented.is-small button{height:24px;padding:0 9px;font-size:12px;font-weight:500}
.dsh-lingualab-segmented-count{font-weight:400;font-variant-numeric:tabular-nums;opacity:.7}

/* ── loading: skeletons that mirror the real layout ──────────── */
/* The delay keeps a fast load from flashing a placeholder for a single frame. */
.dsh-lingualab-sk-wrap{display:flex;flex-direction:column;gap:22px;animation:ll-fade-in .28s ease-out .18s both}
.dsh-lingualab-sk{display:block;flex:none;max-width:100%;
  background:linear-gradient(90deg,var(--ll-track) 25%,color-mix(in srgb,var(--dsw-alias-label-primary,#0f1115) 5%,transparent) 50%,var(--ll-track) 75%);
  background-size:300% 100%;animation:ll-shimmer 1.5s ease-in-out infinite}
@keyframes ll-shimmer{from{background-position:100% 0}to{background-position:0 0}}
.dsh-lingualab-sk-row{display:flex;align-items:center;gap:14px}
.dsh-lingualab-sk-row.is-between{justify-content:space-between}
.dsh-lingualab-sk-resume{display:flex;flex-direction:column;align-items:flex-start;gap:14px;padding:26px 28px;border-radius:20px;
  border:0.5px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-sk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.dsh-lingualab-sk-card{display:flex;flex-direction:column;align-items:stretch;gap:10px;padding:16px;border-radius:16px;
  border:0.5px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04));background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-sk-list{gap:6px;padding:10px 12px}
.dsh-lingualab-sk-item{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:10px 12px;border-radius:12px}
.dsh-lingualab-sk-stage{flex:1;align-items:center;justify-content:center;gap:28px;width:100%}
.dsh-lingualab-sk-lines{display:flex;flex-direction:column;align-items:center;gap:14px;width:min(640px,80%)}
.dsh-lingualab-sk-label{display:inline-flex;align-items:center;gap:8px;font-size:13px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-spinner{width:14px;height:14px;border-radius:999px;box-sizing:border-box;
  border:2px solid var(--ll-track);border-top-color:var(--dsw-alias-brand-primary,#0f1115);animation:ll-spin .8s linear infinite}
.dsh-lingualab-btn .dsh-lingualab-spinner{border-color:color-mix(in srgb,currentColor 30%,transparent);border-top-color:currentColor}
@keyframes ll-spin{to{transform:rotate(360deg)}}

@media (prefers-reduced-motion:reduce){
  .dsh-lingualab-sk{animation:none}
  .dsh-lingualab-spinner{animation-duration:2.4s}
  .dsh-lingualab-stage-now,.dsh-lingualab-word-pop,.dsh-lingualab-finish,.dsh-lingualab-finish-card,
  .dsh-lingualab-finish-badge,.dsh-lingualab-popover,.dsh-lingualab-scrim,.dsh-lingualab-step-panel,
  .dsh-lingualab-editor,.dsh-lingualab-timing-status::before,.dsh-lingualab-notice{animation:none}
  .dsh-lingualab-page,.dsh-lingualab-page *{transition-duration:0s !important;transition-delay:0s !important}
}

/* ── drawer: the five steps slide in over a scrim, and slide out again ──────────── */
.dsh-lingualab-scrim{position:absolute;inset:0;z-index:21;background:var(--ll-mask);animation:ll-fade-in .18s ease-out}
.dsh-lingualab-scrim.is-leaving{animation:ll-fade-out .2s ease forwards;pointer-events:none}
@keyframes ll-fade-out{from{opacity:1}to{opacity:0}}
.dsh-lingualab-popover{position:absolute;top:0;right:0;bottom:0;z-index:22;display:flex;
  flex-direction:column;width:min(440px,100%);min-height:0;box-sizing:border-box;
  border-left:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  background:var(--ll-surface);box-shadow:-18px 0 48px rgba(0,0,0,0.22);
  animation:ll-slide-in .2s ease-out}
.dsh-lingualab-popover.is-leaving{animation:ll-slide-out .2s ease-in forwards;pointer-events:none}
@keyframes ll-slide-in{from{transform:translateX(28px);opacity:0}to{transform:none;opacity:1}}
@keyframes ll-slide-out{from{transform:none;opacity:1}to{transform:translateX(28px);opacity:0}}
.dsh-lingualab-drawer-head{flex:none;display:flex;align-items:flex-start;gap:12px;padding:20px 20px 16px}
.dsh-lingualab-drawer-head .dsh-lingualab-icon-btn{margin:-4px -6px 0 0}
.dsh-lingualab-drawer-titles{flex:1;display:flex;flex-direction:column;min-width:0;gap:2px}
.dsh-lingualab-drawer-title{font-weight:700;font-size:18px;line-height:1.3}
.dsh-lingualab-drawer-sub{font-size:12.5px;color:var(--dsw-alias-label-secondary,#61666b);overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
/* ── the 「收藏」 column: one card per kept sentence, the one on stage open ── */
.dsh-lingualab-transcript.is-kept{position:relative}
.dsh-lingualab-kept-filter{flex:none;padding:10px 12px 4px}
.dsh-lingualab-notes-body{position:relative;flex:1;min-height:0;overflow:auto;padding:8px 12px 16px;display:flex;
  flex-direction:column;gap:8px}
.dsh-lingualab-note{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border-radius:12px;flex:none;cursor:pointer;
  background:var(--ll-wash);border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  transition:border-color var(--ll-fade),background var(--ll-fade),box-shadow var(--ll-fade)}
.dsh-lingualab-note:hover{border-color:color-mix(in srgb,var(--dsw-alias-label-primary,#0f1115) 22%,transparent)}
/* The open card is the sentence on stage: a surface with a stronger edge and a soft lift, no tint. */
.dsh-lingualab-note.is-open{gap:10px;padding:14px;cursor:default;background:var(--ll-surface);
  border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 50%,transparent);
  box-shadow:0 6px 20px rgba(0,0,0,0.07)}
.dsh-lingualab-note-text{transition:color var(--ll-fade)}
.dsh-lingualab-note.is-done .dsh-lingualab-note-text{color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-note-top{display:flex;align-items:center;gap:8px;min-height:26px}
.dsh-lingualab-note-check{display:inline-flex;cursor:pointer;position:relative}
.dsh-lingualab-box{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:6px;
  box-sizing:border-box;border:1.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  color:var(--ll-on-brand);transition:background var(--ll-fade),border-color var(--ll-fade)}
.dsh-lingualab-note-check:hover .dsh-lingualab-box{border-color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-note-check:focus-within .dsh-lingualab-box{outline:2px solid var(--dsw-alias-brand-primary,#0f1115);outline-offset:2px}
.dsh-lingualab-box.is-on{background:var(--dsw-alias-brand-primary,#0f1115);border-color:transparent}
/* The time chip: gray at rest, and on the open card it is the play button, filled while it plays. */
.dsh-lingualab-note-at{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 9px;border-radius:999px;border:0;
  font-size:12px;font-weight:500;font-family:inherit;cursor:pointer;font-variant-numeric:tabular-nums;
  color:var(--dsw-alias-label-secondary,#61666b);background:var(--ll-hover);
  transition:background var(--ll-fade),color var(--ll-fade)}
.dsh-lingualab-note-at:hover{background:var(--ll-track);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-note.is-open .dsh-lingualab-note-at:not(.is-playing){color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-note-at.is-playing,.dsh-lingualab-note-at.is-playing:hover{color:var(--ll-on-brand);
  background:var(--dsw-alias-brand-primary,#0f1115)}
/* A collapsed card that carries a note says so, quietly, at the end of its top row. */
.dsh-lingualab-note-has{display:inline-flex;flex:none;color:var(--ll-muted)}
.dsh-lingualab-note .dsh-lingualab-icon-btn.is-small{color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-icon-btn.is-danger:hover{color:var(--dsw-alias-state-error-primary,#ec1313);
  background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#ec1313) 12%,transparent)}
.dsh-lingualab-note-text{display:block;word-break:break-word;font-weight:500;font-size:14px;line-height:1.4}
.dsh-lingualab-note.is-open .dsh-lingualab-note-text{font-weight:600;font-size:17px;line-height:1.35}
/* A sentence's one state, as a quiet gray pill on every card. The state is a 6px dot before the
   text, the only colour on it: 「新收藏」 has no state yet, so it has no dot. */
.dsh-lingualab-grade{--ll-grade:var(--dsw-alias-label-secondary,#61666b);display:inline-flex;align-items:center;gap:6px;
  flex:none;height:20px;padding:0 8px;border-radius:999px;font-size:11.5px;font-weight:600;
  color:var(--dsw-alias-label-secondary,#61666b);background:var(--ll-hover);
  transition:background var(--ll-fade),color var(--ll-fade)}
.dsh-lingualab-grade::before,.dsh-lingualab-grade-btn::before{content:'';flex:none;width:6px;height:6px;border-radius:999px;
  background:var(--ll-grade)}
.dsh-lingualab-grade.is-new{color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-grade.is-new::before{display:none}
.dsh-lingualab-grade.is-got,.dsh-lingualab-grade-btn.is-got{--ll-grade:var(--dsw-alias-state-success-primary,#22c55e)}
.dsh-lingualab-grade.is-fuzzy,.dsh-lingualab-grade-btn.is-fuzzy{--ll-grade:var(--dsw-alias-state-warn-primary,#f59e0b)}
.dsh-lingualab-grade.is-notyet,.dsh-lingualab-grade-btn.is-notyet{--ll-grade:var(--dsw-alias-state-error-primary,#ec1313)}
/* The three grades as buttons, on the open card and on the review strip: neutral outlined, the dot
   says which grade it is, and the one that is on fills with the brand. */
.dsh-lingualab-grades{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding-top:4px}
.dsh-lingualab-grade-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:30px;padding:0 11px;
  border-radius:8px;cursor:pointer;font:inherit;font-size:12.5px;font-weight:600;white-space:nowrap;
  color:var(--dsw-alias-label-primary,inherit);background:none;
  border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  transition:background var(--ll-fade),border-color var(--ll-fade),color var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-grades .dsh-lingualab-grade-btn{height:34px;padding:0 6px;gap:5px;border-radius:9px;font-size:13px}
.dsh-lingualab-grade-btn kbd{font:inherit;font-size:11px;opacity:.6}
.dsh-lingualab-grade-btn:disabled{opacity:.45;cursor:default}
.dsh-lingualab-grade-btn:hover:not(:disabled){background:var(--ll-hover)}
.dsh-lingualab-grade-btn.is-on{color:var(--ll-on-brand);background:var(--dsw-alias-brand-primary,#0f1115);border-color:transparent}
.dsh-lingualab-grade-btn.is-on:hover:not(:disabled){background:var(--dsw-alias-brand-primary,#0f1115);filter:brightness(1.08)}
.dsh-lingualab-grade-btn.is-on kbd{opacity:.75}
.dsh-lingualab-note-zh{font-size:13px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-memo-words{display:flex;align-items:center;flex-wrap:wrap;gap:6px}
.dsh-lingualab-word-chip{display:inline-flex;align-items:center;gap:2px;height:24px;padding:0 3px 0 9px;border-radius:6px;
  font-size:12.5px;font-weight:500;color:var(--dsw-alias-label-primary,inherit);background:var(--ll-hover)}
.dsh-lingualab-word-chip-x{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;padding:0;
  border:0;border-radius:4px;cursor:pointer;color:inherit;background:none;opacity:.6;
  transition:background var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-word-chip-x:hover{opacity:1;background:var(--ll-track)}
/* The note, as text you click to edit: it keeps the line breaks it was written with. */
.dsh-lingualab-memo-text{display:block;width:100%;box-sizing:border-box;padding:9px 12px;border:0;border-radius:10px;
  background:var(--ll-wash);color:var(--dsw-alias-label-primary,inherit);font:inherit;font-size:13.5px;line-height:1.6;
  text-align:left;white-space:pre-wrap;word-break:break-word;cursor:text;transition:background var(--ll-fade)}
.dsh-lingualab-memo-text:hover{background:var(--ll-hover)}
.dsh-lingualab-memo-add{display:flex;align-items:center;gap:6px;height:36px;padding:0 12px;border-radius:10px;cursor:text;
  font:inherit;font-size:13px;color:var(--dsw-alias-label-secondary,#61666b);background:none;
  border:1px dashed var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  transition:border-color var(--ll-fade),color var(--ll-fade),background var(--ll-fade)}
.dsh-lingualab-memo-add:hover{border-color:var(--dsw-alias-brand-primary,#0f1115);color:var(--dsw-alias-label-primary,inherit);
  background:var(--ll-wash)}
/* The note editor: a box with its own label and footer, lit as a whole while the field has focus. */
.dsh-lingualab-editor{display:flex;flex-direction:column;border-radius:10px;background:var(--ll-surface);
  border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));animation:ll-step-in .16s ease-out;
  transition:border-color var(--ll-fade),box-shadow var(--ll-fade)}
.dsh-lingualab-editor:focus-within{border-color:var(--dsw-alias-brand-primary,#0f1115);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 14%,transparent)}
.dsh-lingualab-editor-label{padding:8px 12px 0;font-size:11.5px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-editor textarea{display:block;width:100%;box-sizing:border-box;margin:0;padding:4px 12px 8px;border:0;outline:none;
  resize:none;overflow-y:auto;background:transparent;color:var(--dsw-alias-label-primary,inherit);
  font:inherit;font-size:13.5px;line-height:1.6;min-height:calc(3 * 1.6em + 12px);max-height:calc(8 * 1.6em + 12px)}
.dsh-lingualab-editor textarea::placeholder{color:var(--ll-muted)}
.dsh-lingualab-editor-foot{display:flex;align-items:center;gap:8px;padding:6px 8px 6px 12px;
  border-top:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
.dsh-lingualab-editor-hint{min-width:0;font-size:11.5px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-btn.is-ghost{border-color:transparent;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-btn.is-ghost:hover{color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-drawer-foot{flex:none;padding:12px 20px 16px;font-size:12px;line-height:1.5;
  color:var(--dsw-alias-label-secondary,#61666b);border-top:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
/* Undo toast: floats over the drawer's bottom, inverted so it reads as a message and not as content. */
.dsh-lingualab-toast{position:absolute;left:50%;bottom:64px;transform:translateX(-50%);z-index:3;display:flex;align-items:center;
  gap:12px;height:44px;padding:0 8px 0 16px;border-radius:12px;white-space:nowrap;font-size:13px;
  background:var(--dsw-alias-label-primary,#0f1115);color:var(--dsw-alias-bg-base,#fff);
  box-shadow:0 8px 24px rgba(0,0,0,0.28);animation:ll-toast-in .18s ease-out}
.dsh-lingualab-toast-undo{display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 10px;border:0;border-radius:8px;
  background:none;cursor:pointer;font:inherit;font-weight:600;color:inherit;text-decoration:underline;text-underline-offset:3px;
  transition:background var(--ll-fade)}
.dsh-lingualab-toast-undo:hover{background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 16%,transparent)}
@keyframes ll-toast-in{from{transform:translate(-50%,8px);opacity:0}to{transform:translate(-50%,0);opacity:1}}
/* ── layers: browse, media folder, steps ─────────────────────── */
.dsh-lingualab-mask{position:absolute;inset:0;z-index:20;display:flex;align-items:flex-start;justify-content:center;
  padding:44px 24px;background:var(--ll-mask)}
.dsh-lingualab-modal{display:flex;flex-direction:column;width:min(620px,100%);max-height:100%;overflow:hidden;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));border-radius:14px;
  background:var(--ll-surface);box-shadow:0 18px 48px rgba(0,0,0,0.3)}
.dsh-lingualab-modal-head{display:flex;align-items:center;gap:8px;padding:12px 14px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
.dsh-lingualab-modal-title{font-weight:600;font-size:14px}
.dsh-lingualab-tabs{display:flex;gap:8px;padding:14px 24px}
.dsh-lingualab-tab{border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));border-radius:999px;background:none;
  color:var(--dsw-alias-label-secondary,#61666b);cursor:pointer;font:inherit;font-size:12px;font-weight:500;height:28px;padding:0 12px;
  transition:background var(--ll-fade),color var(--ll-fade),border-color var(--ll-fade)}
.dsh-lingualab-tab:hover{background:var(--ll-hover)}
.dsh-lingualab-tab.is-on{background:var(--dsw-alias-brand-primary,#0f1115);border-color:transparent;color:var(--ll-on-brand)}
.dsh-lingualab-tab.is-on .dsh-lingualab-counter{color:inherit;opacity:.85}
.dsh-lingualab-modal-body{flex:1;min-height:0;overflow:auto;padding:8px 10px 12px}
.dsh-lingualab-input{width:100%;box-sizing:border-box;background:var(--dsw-alias-bg-layer-2,transparent);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));border-radius:8px;color:inherit;
  font:inherit;font-size:13px;padding:6px 9px;
  transition:border-color var(--ll-fade),box-shadow var(--ll-fade),background var(--ll-fade)}
.dsh-lingualab-pick{display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;padding:7px 9px;
  border:0;border-radius:8px;background:none;color:inherit;font:inherit;cursor:pointer;text-align:left;
  transition:background var(--ll-fade),box-shadow var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-pick:hover{background:var(--ll-hover)}
.dsh-lingualab-pick.is-current{background:var(--dsw-alias-bg-layer-2,var(--ll-hover))}
.dsh-lingualab-pick-main{flex:1;min-width:0}
.dsh-lingualab-pick-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-pick-sub{display:block;font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-lingualab-badge{flex:none;font-size:11px;color:var(--dsw-alias-label-secondary,#61666b);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));border-radius:999px;padding:1px 7px}
.dsh-lingualab-group{margin:12px 6px 4px;font-size:11.5px;font-weight:600;letter-spacing:.03em;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-group:first-child{margin-top:4px}

/* The browse layer: a card that floats (stronger mask, a ring and a deeper shadow), a
   toolbar that stays put, a list that scrolls, and a footer that owns the one big action. */
.dsh-lingualab-mask:has(.is-browse){align-items:center;padding:24px;
  backdrop-filter:blur(3px)}
.dsh-lingualab-modal.is-browse{width:min(720px,100%);height:min(620px,100%);
  border-color:var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  box-shadow:0 0 0 1px var(--ll-hover),0 24px 64px rgba(0,0,0,0.38)}
.dsh-lingualab-browse-bar{flex:none;display:flex;flex-direction:column;gap:8px;padding:10px 14px;
  border-bottom:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04));
  background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-pathrow{display:flex;align-items:center;gap:6px;min-width:0}
.dsh-lingualab-select{flex:none;max-width:180px;height:28px;padding:0 8px;border-radius:8px;cursor:pointer;
  background:var(--dsw-alias-bg-layer-2,transparent);color:inherit;font:inherit;font-size:12.5px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));transition:border-color var(--ll-fade)}
.dsh-lingualab-select:hover{border-color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-icon-btn.is-small{width:28px;height:28px}
.dsh-lingualab-crumbs{flex:1;min-width:0;display:flex;align-items:center;flex-wrap:nowrap;overflow:hidden}
.dsh-lingualab-crumbs-root{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 7px;
  font-size:12px;color:var(--ll-muted);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.dsh-lingualab-crumb-item{display:inline-flex;align-items:center;flex:0 1 auto;min-width:0;color:var(--ll-muted)}
.dsh-lingualab-crumb{flex:none;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  height:26px;padding:0 7px;border:0;border-radius:6px;background:none;cursor:pointer;font:inherit;font-size:12.5px;
  color:var(--dsw-alias-label-secondary,#61666b);transition:background var(--ll-fade),color var(--ll-fade)}
.dsh-lingualab-crumb:hover:not(:disabled){background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-crumb.is-here,.dsh-lingualab-crumb:disabled{cursor:default;font-weight:600;
  color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-browse-bar .dsh-lingualab-input{height:34px;padding:0 11px;border-radius:9px;
  background:var(--dsw-alias-bg-base,transparent)}
.dsh-lingualab-browse-bar .dsh-lingualab-input:focus{outline:none;
  border-color:var(--dsw-alias-brand-primary,#0f1115);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 22%,transparent)}
.dsh-lingualab-modal.is-browse .dsh-lingualab-modal-body{padding:6px 10px 10px;transition:opacity var(--ll-fade)}
.dsh-lingualab-modal-body.is-loading{opacity:0.55}
.dsh-lingualab-pick{min-height:40px}
.dsh-lingualab-pick svg{flex:none;color:var(--dsw-alias-label-secondary,#61666b);transition:color var(--ll-fade)}
.dsh-lingualab-pick.is-active{background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 12%,transparent);
  box-shadow:inset 2px 0 0 var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-pick.is-active svg{color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-pick.is-episode{border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));margin:4px 0 2px}
.dsh-lingualab-pick.is-inert{cursor:default;opacity:0.55;min-height:32px}
.dsh-lingualab-pick.is-inert:hover{background:none}
.dsh-lingualab-badge.is-ok{color:var(--dsw-alias-state-success-primary,#22c55e);
  border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary,#22c55e) 45%,transparent);
  background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#22c55e) 10%,transparent)}
.dsh-lingualab-badge.is-warn{color:var(--dsw-alias-state-warn-primary,#f59e0b);
  border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#f59e0b) 45%,transparent);
  background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#f59e0b) 10%,transparent)}
.dsh-lingualab-empty.is-center{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;
  padding:56px 24px}
.dsh-lingualab-empty.is-center strong{font-weight:600;color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-error.is-pad,.dsh-lingualab-hint.is-pad{padding:8px 14px}
.dsh-lingualab-modal-foot{flex:none;display:flex;align-items:center;gap:10px;padding:9px 14px;
  border-top:1px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04));
  background:var(--dsw-alias-bg-layer-1,transparent)}
.dsh-lingualab-keys{font-size:11.5px;color:var(--ll-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  min-width:0}
.dsh-lingualab-foot-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap;max-width:220px}
@media (max-width:640px){.dsh-lingualab-keys,.dsh-lingualab-foot-hint{display:none}}
.dsh-lingualab-empty{color:var(--dsw-alias-label-secondary,#61666b);padding:14px 12px;font-size:13px}
.dsh-lingualab-warn{color:var(--dsw-alias-state-warn-primary,#f59e0b);font-size:12.5px;padding:6px 0}
.dsh-lingualab-error{color:var(--dsw-alias-state-error-primary,#ec1313);font-size:12.5px;padding:6px 0}
.dsh-lingualab-btn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:8px;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));background:none;color:inherit;
  font:inherit;font-size:13px;cursor:pointer;white-space:nowrap;
  transition:background var(--ll-fade),color var(--ll-fade),border-color var(--ll-fade),filter var(--ll-fade),opacity var(--ll-fade)}
.dsh-lingualab-btn:hover{background:var(--ll-hover)}
.dsh-lingualab-btn.is-on{border-color:var(--dsw-alias-brand-primary,#0f1115);color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-btn.is-primary{background:var(--dsw-alias-brand-primary,#0f1115);border-color:transparent;color:var(--ll-on-brand)}
.dsh-lingualab-btn.is-primary:hover{background:var(--dsw-alias-brand-primary,#0f1115);filter:brightness(1.08)}
.dsh-lingualab-btn.is-large{height:38px;padding:0 18px;font-size:14px;border-radius:10px}
.dsh-lingualab-btn.is-small{height:26px;padding:0 10px;font-size:12px;gap:5px}
.dsh-lingualab-btn:disabled{opacity:.45;cursor:default}
.dsh-lingualab-btn:disabled{opacity:0.45;cursor:default}


/* ── five steps: a header, one bar of five segments, then a vertical stepper ── */
.dsh-lingualab-steps-bar{flex:none;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;padding:0 20px 18px}
.dsh-lingualab-steps-seg{height:4px;border-radius:999px;background:var(--ll-hover);overflow:hidden}
.dsh-lingualab-steps-seg span,.dsh-lingualab-step-progress span{display:block;height:100%;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#0f1115);transition:width .3s ease}
.dsh-lingualab-steps-body{flex:1;min-height:0;overflow:auto;padding:0 12px 16px}
.dsh-lingualab-steps{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.dsh-lingualab-step{position:relative;display:flex;gap:12px;padding:0 8px}
.dsh-lingualab-step-rail{position:relative;flex:none;width:28px;display:flex;flex-direction:column;align-items:center}
/* The round check is the done toggle: a number, or a tick once the step is done. */
.dsh-lingualab-step-check{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;
  width:28px;height:28px;margin-top:12px;padding:0;border-radius:999px;cursor:pointer;font:inherit;font-size:12px;
  font-weight:700;color:var(--dsw-alias-label-secondary,#61666b);background:var(--ll-surface);
  border:1.5px solid color-mix(in srgb,var(--dsw-alias-label-primary,#0f1115) 22%,transparent);
  transition:background var(--ll-fade),border-color var(--ll-fade),color var(--ll-fade)}
.dsh-lingualab-step-check:hover{border-color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-step.is-open .dsh-lingualab-step-check{border-color:var(--dsw-alias-brand-primary,#0f1115);
  color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-step-check.is-on{color:var(--ll-on-brand);background:var(--dsw-alias-brand-primary,#0f1115);
  border-color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-step-line{flex:1;width:2px;margin-top:4px;border-radius:1px;background:var(--ll-hover);
  transition:background var(--ll-fade)}
.dsh-lingualab-step.is-done .dsh-lingualab-step-line{
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 35%,transparent)}
.dsh-lingualab-step-body{flex:1;min-width:0;display:flex;flex-direction:column;padding:8px 0 10px}
.dsh-lingualab-step-row{display:flex;align-items:center;gap:10px;margin:0 -10px;padding:6px 10px;border:0;border-radius:10px;
  background:none;color:inherit;font:inherit;text-align:left;cursor:pointer;transition:background var(--ll-fade)}
.dsh-lingualab-step-row:hover:not(:disabled){background:var(--ll-wash)}
.dsh-lingualab-step-row:disabled{cursor:default}
.dsh-lingualab-step-main{flex:1;min-width:0;display:flex;flex-direction:column}
.dsh-lingualab-step-label{font-size:14.5px;font-weight:600;transition:color var(--ll-fade)}
.dsh-lingualab-step.is-done .dsh-lingualab-step-label{color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-step-meta{font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);font-variant-numeric:tabular-nums}
.dsh-lingualab-step-pill{display:inline-flex;align-items:center;gap:6px;flex:none;height:22px;padding:0 8px;
  border-radius:999px;background:var(--ll-track);font-size:12px;font-weight:600;font-variant-numeric:tabular-nums}
.dsh-lingualab-step-pill::before{content:'';width:6px;height:6px;border-radius:999px;
  background:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-step-tag{display:inline-flex;align-items:center;flex:none;height:22px;padding:0 8px;border-radius:999px;
  font-size:11.5px;color:var(--dsw-alias-label-secondary,#61666b);
  border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1))}
/* The one step that is open: its clock against the suggested time, a tip, and the two buttons. */
.dsh-lingualab-step-panel{display:flex;flex-direction:column;gap:12px;margin-top:8px;padding:14px;border-radius:12px;
  background:var(--ll-wash);animation:ll-step-in .18s ease-out}
@keyframes ll-step-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
.dsh-lingualab-step-clock{display:flex;align-items:baseline;gap:6px;font-variant-numeric:tabular-nums}
.dsh-lingualab-step-clock b{font-size:30px;font-weight:700;letter-spacing:-.02em;line-height:1}
.dsh-lingualab-step-clock span{font-size:13px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-step-clock .dsh-lingualab-step-tip{margin-left:auto;font-size:12px}
.dsh-lingualab-step-progress{height:4px;border-radius:999px;background:var(--ll-hover);overflow:hidden}
.dsh-lingualab-step-actions{display:flex;gap:8px}
.dsh-lingualab-step-actions .dsh-lingualab-btn{justify-content:center;height:36px;padding:0 14px;border-radius:9px;font-size:13.5px}
.dsh-lingualab-step-actions .dsh-lingualab-btn.is-primary{flex:1;font-weight:600}
.dsh-lingualab-step-actions .dsh-lingualab-btn.is-primary.is-running{
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 82%,var(--ll-surface))}
/* ── settings drawer: the five-steps drawer's frame, a little narrower, with radio groups inside ── */
.dsh-lingualab-popover.is-settings{width:min(420px,100%);outline:none}
/* The drawer is painted with the surface colour, so a chosen segment painted with it too would read as sunk
   in dark; layer 2 lifts it (and is the same white in light). */
.dsh-lingualab-popover.is-settings .dsh-lingualab-segmented button.is-on{background:var(--dsw-alias-bg-layer-2,#ffffff)}
.dsh-lingualab-settings-body{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:6px;
  padding:0 20px 20px}
.dsh-lingualab-settings-label{margin:18px 0 2px;font-size:12px;font-weight:600;letter-spacing:.02em;
  color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-settings-label:first-child{margin-top:4px}
.dsh-lingualab-setting-row{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:40px}
.dsh-lingualab-setting-block{display:flex;flex-direction:column;gap:10px;padding-top:6px}
.dsh-lingualab-setting-text{display:flex;flex-direction:column;gap:2px;min-width:0}
.dsh-lingualab-setting-name{font-size:13px;font-weight:500}
.dsh-lingualab-setting-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-theme-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.dsh-lingualab-theme{display:flex;flex-direction:column;align-items:stretch;gap:3px;box-sizing:border-box;padding:8px 8px 10px;
  border-radius:12px;text-align:left;cursor:pointer;font:inherit;color:inherit;background:none;
  border:1.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));
  transition:border-color var(--ll-fade),background var(--ll-fade)}
.dsh-lingualab-theme:hover{background:var(--ll-wash)}
.dsh-lingualab-theme.is-on{border-color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-theme-preview{display:flex;flex-direction:column;justify-content:center;gap:7px;box-sizing:border-box;
  height:64px;margin-bottom:5px;padding:0 12px;border-radius:8px;border:1px solid transparent;
  transition:background-color var(--ll-fade),border-color var(--ll-fade)}
.dsh-lingualab-theme-line{display:flex;align-items:center;gap:6px}
.dsh-lingualab-theme-dot{flex:none;width:8px;height:8px;border-radius:999px}
.dsh-lingualab-theme-bar{display:block;height:6px;border-radius:3px}
.dsh-lingualab-theme-bar.is-long{width:72%}
.dsh-lingualab-theme-bar.is-short{width:46%;height:5px}
.dsh-lingualab-theme-track{display:block;height:4px;border-radius:2px;overflow:hidden}
.dsh-lingualab-theme-track span{display:block;width:58%;height:100%;border-radius:2px}
.dsh-lingualab-theme-name{display:flex;align-items:center;gap:5px;font-size:13px;font-weight:600;
  color:var(--dsw-alias-label-primary,inherit)}
.dsh-lingualab-theme-name svg{flex:none;color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-theme-desc{font-size:11.5px;line-height:1.4;color:var(--dsw-alias-label-secondary,#61666b)}

/* A real input that cannot be seen: it stays focusable, so the label around it works from
   the keyboard, which \`display:none\` would break. */
.dsh-lingualab-visually-hidden{position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;
  overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
label.dsh-lingualab-btn{position:relative}
label.dsh-lingualab-btn:focus-within{outline:2px solid var(--dsw-alias-brand-primary,#0f1115);outline-offset:1px}
label.dsh-lingualab-btn.is-disabled{opacity:0.45;cursor:default;pointer-events:none}

/* ── video: the picture on the stage, the cards that stand in for it, the notices ──────────── */
/* One media element plays everything and lives in the picture box; with no picture the box is not displayed
   and the audio plays on. The stage keeps the shapes it had: shown puts the picture above the sentence,
   large gives it the whole stage (the sentence is hidden then), hidden leaves a chip. The screen colour is the
   picture's own black, not a theme colour: a video has no theme. */
.dsh-lingualab-videostage{--ll-pic-share:.64;--ll-pic-h:42cqh;flex:none;display:flex;flex-direction:column;align-items:center;gap:10px;min-width:0}
.dsh-lingualab-videostage.is-empty{display:none}
.dsh-lingualab-videostage.is-shown{padding:20px 12px 0}
.dsh-lingualab-videostage.is-hidden{padding:14px 12px 0}
.dsh-lingualab-videostage.is-large{flex:1;min-height:160px;padding:16px 0 8px;justify-content:center;container:ll-video/size}
/* The picture's width is the smallest of its share of the column, 720px and what its height cap allows at 16:9, so a cap
   makes it smaller and keeps its shape. The cap and the share are variables for the responsive rules at the end. */
.dsh-lingualab-picture{--ll-pic-w:64%;--ll-pic-h:42vh;position:relative;flex:none;box-sizing:border-box;
  width:min(var(--ll-pic-w),720px,calc(var(--ll-pic-h) * 16 / 9));min-width:min(100%,300px);
  aspect-ratio:16/9;max-height:var(--ll-pic-h);border-radius:12px;overflow:hidden;background:#0e100f}
@supports (height:1cqh){.dsh-lingualab-picture{--ll-pic-h:42cqh}}
.dsh-lingualab-picture.is-off{display:none}
/* Large: the frame hugs the picture. The stage is a size container, so the frame can be the biggest box of the video's own
   shape that fits in it (at most 1100px wide, centred): the width is the smallest of the stage's width, 1100px and its
   height times the ratio, and aspect-ratio makes the height follow. The ratio is the real videoWidth/videoHeight, set by
   the component once the metadata is in (16/9 until then). The badge, the peek button and the caption sit on the frame,
   so they sit on the picture. Without container queries the frame is as wide as the stage allows, which is the old look. */
.dsh-lingualab-videostage.is-large .dsh-lingualab-picture{flex:none;min-width:0;min-height:0;max-height:none;width:min(100%,1100px);
  aspect-ratio:var(--ll-video-ratio,1.7778)}
@supports (container-type:size){.dsh-lingualab-videostage.is-large .dsh-lingualab-picture{
  width:min(100cqw,1100px,calc(100cqh * var(--ll-video-ratio,1.7778)))}}
.dsh-lingualab-video{display:block;width:100%;height:100%;object-fit:contain;background:#0e100f}
.dsh-lingualab-picture-time{position:absolute;left:12px;bottom:10px;font-size:11px;color:rgba(255,255,255,0.55);
  font-variant-numeric:tabular-nums;pointer-events:none}
.dsh-lingualab-picture-badge{position:absolute;left:14px;top:12px;display:inline-flex;align-items:center;height:24px;
  padding:0 10px;border-radius:999px;font-size:11.5px;color:rgba(255,255,255,0.86);background:rgba(0,0,0,0.5);pointer-events:none}
.dsh-lingualab-picture-peek{position:absolute;right:14px;bottom:12px;display:inline-flex;align-items:center;gap:6px;height:28px;
  padding:0 10px;border:0;border-radius:999px;cursor:pointer;font:inherit;font-size:12px;color:rgba(255,255,255,0.86);
  background:rgba(0,0,0,0.5);transition:background var(--ll-fade)}
.dsh-lingualab-picture-peek:hover{background:rgba(0,0,0,0.7)}
.dsh-lingualab-page .dsh-lingualab-picture-peek kbd{height:18px;min-width:18px;padding:0 5px;font-size:11px;font-weight:500;
  color:inherit;background:none;border:0.5px solid rgba(255,255,255,0.4);border-bottom-width:0.5px}
.dsh-lingualab-picture-caption{position:absolute;left:50%;bottom:28px;transform:translateX(-50%);box-sizing:border-box;
  max-width:min(760px,90%);padding:8px 16px;border-radius:8px;font-size:calc(22px * var(--ll-stage-scale));font-weight:600;
  line-height:1.35;text-align:center;color:#fff;background:rgba(0,0,0,0.62);pointer-events:none}
.dsh-lingualab-videochip{display:inline-flex;align-items:center;gap:8px;height:28px;padding:0 12px;border-radius:999px;
  font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);background:none;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1))}
.dsh-lingualab-videochip.is-button{cursor:pointer;transition:background var(--ll-fade),color var(--ll-fade)}
.dsh-lingualab-videochip.is-button:hover{background:var(--ll-hover);color:var(--dsw-alias-label-primary,inherit)}
/* A local file in place of the served video. On the picture the controls are quiet pills in the top right corner (the large
   state's badge is top left); on a card they are the last row; while one plays the label says so. */
.dsh-lingualab-picture-local{position:absolute;right:14px;top:12px;display:flex;justify-content:flex-end;max-width:calc(100% - 28px)}
.dsh-lingualab-localactions{display:flex;flex-direction:column;gap:6px;min-width:0;max-width:100%}
.dsh-lingualab-localactions.is-picture{align-items:flex-end}
.dsh-lingualab-localactions.is-card{align-items:center;margin-top:2px}
.dsh-lingualab-localactions-row{display:flex;flex-wrap:wrap;gap:6px;min-width:0;max-width:100%}
.dsh-lingualab-localactions.is-picture .dsh-lingualab-localactions-row{justify-content:flex-end}
.dsh-lingualab-localactions.is-card .dsh-lingualab-localactions-row{justify-content:center}
.dsh-lingualab-picture-local-btn{position:relative;display:inline-flex;align-items:center;box-sizing:border-box;height:26px;padding:0 10px;
  border:0;border-radius:999px;cursor:pointer;font:inherit;font-size:12px;color:rgba(255,255,255,0.86);background:rgba(0,0,0,0.5);
  transition:background var(--ll-fade)}
.dsh-lingualab-picture-local-btn:hover{background:rgba(0,0,0,0.7)}
.dsh-lingualab-picture-local-btn:focus-within{outline:2px solid rgba(255,255,255,0.7);outline-offset:1px}
.dsh-lingualab-localactions .is-name{display:block;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:26px}
.dsh-lingualab-localbadge{display:inline-flex;align-items:center;gap:6px;min-width:0;max-width:100%}
.dsh-lingualab-localbadge-label{display:inline-flex;align-items:center;height:26px;padding:0 10px;border-radius:999px;font-size:11.5px;
  white-space:nowrap;color:var(--dsw-alias-label-secondary,#61666b);border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1))}
.dsh-lingualab-localbadge.is-picture .dsh-lingualab-localbadge-label{border:0;color:rgba(255,255,255,0.86);background:rgba(0,0,0,0.5)}
/* The smooth version on a playing picture: bottom left, after the clock (the large state has no clock, and keeps clear of the
   peek button on the right). A card carries it as one more small action at its foot. */
.dsh-lingualab-picture-smooth{position:absolute;left:64px;bottom:8px;display:flex;flex-direction:column;align-items:flex-start;gap:4px;
  min-width:0;max-width:calc(100% - 78px)}
.dsh-lingualab-videostage.is-large .dsh-lingualab-picture-smooth{left:14px;bottom:12px;max-width:calc(100% - 190px)}
.dsh-lingualab-smooth-pill{display:inline-flex;align-items:center;gap:8px;box-sizing:border-box;min-width:0;max-width:100%;height:26px;
  padding:0 0 0 2px;border-radius:999px;font-size:11.5px;color:rgba(255,255,255,0.86);background:rgba(0,0,0,0.5)}
.dsh-lingualab-smooth-text{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 10px 0 4px;font-variant-numeric:tabular-nums}
.dsh-lingualab-smooth-pill .dsh-lingualab-picture-local-btn{flex:none;background:rgba(255,255,255,0.14)}
.dsh-lingualab-smooth-pill .dsh-lingualab-picture-local-btn:hover{background:rgba(255,255,255,0.24)}
.dsh-lingualab-smooth-pill .dsh-lingualab-picture-local-btn:disabled{cursor:default;opacity:0.6}
.dsh-lingualab-smooth-pill .dsh-lingualab-smooth-text:first-child{padding-left:10px}
.dsh-lingualab-smooth-problem{max-width:100%;padding:2px 8px;border-radius:6px;font-size:11.5px;color:#fff;background:rgba(160,20,20,0.72)}
.dsh-lingualab-smoothoffer{display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:2px}
.dsh-lingualab-videocard{--ll-pic-w:64%;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;width:min(var(--ll-pic-w),720px);
  min-width:min(100%,300px);min-height:min(342px,42vh);padding:18px;border-radius:12px;text-align:left;
  background:var(--dsw-alias-bg-layer-1,transparent);border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1))}
@supports (height:1cqh){.dsh-lingualab-videocard{min-height:min(342px,42cqh)}}
.dsh-lingualab-videocard-icon{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;flex:none;
  border-radius:10px;color:var(--dsw-alias-brand-primary,#0f1115);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 12%,transparent)}
.dsh-lingualab-videocard-icon.is-quiet{color:var(--dsw-alias-label-secondary,#61666b);
  background:color-mix(in srgb,var(--dsw-alias-label-primary,#0f1115) 7%,transparent)}
.dsh-lingualab-videocard-icon.is-warn{color:var(--dsw-alias-state-warn-primary,#f59e0b);
  background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#f59e0b) 14%,transparent)}
.dsh-lingualab-videocard-title{font-size:15px;font-weight:700}
.dsh-lingualab-videocard-sub{font-size:12px;line-height:1.6;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-videocard-sub.is-mono,.dsh-lingualab-videocard-body.is-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  word-break:break-all}
.dsh-lingualab-videocard-body{margin:0;font-size:12.5px;line-height:1.6;
  color:color-mix(in srgb,var(--dsw-alias-label-primary,#0f1115) 82%,transparent)}
.dsh-lingualab-videocard-note{font-size:11.5px;text-align:center;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-videocard-row{display:flex;justify-content:space-between;gap:8px;font-size:12px;
  color:var(--dsw-alias-label-secondary,#61666b);font-variant-numeric:tabular-nums}
.dsh-lingualab-videocard-code{display:flex;align-items:center;gap:8px;padding:8px 8px 8px 12px;border-radius:8px;
  background:var(--ll-wash);border:0.5px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04))}
.dsh-lingualab-videocard-code code{flex:1;min-width:0;font-size:12px;word-break:break-all;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.dsh-lingualab-videocard>.dsh-lingualab-btn:not(.is-small){height:36px;justify-content:center;border-radius:10px;font-size:13.5px}
.dsh-lingualab-videocard>.dsh-lingualab-btn.is-primary{font-weight:600}
.dsh-lingualab-bar.is-thick{height:6px;margin-top:6px}
.dsh-lingualab-bar.is-thick .dsh-lingualab-bar-fill{transition:width .4s ease}
.dsh-lingualab-notice{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:6;display:flex;align-items:center;
  gap:10px;box-sizing:border-box;min-height:44px;max-width:min(560px,calc(100% - 32px));padding:6px 8px 6px 14px;
  border-radius:12px;font-size:13px;background:var(--ll-surface);animation:ll-notice-in .16s ease-out;
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1));box-shadow:0 6px 20px rgba(0,0,0,0.12)}
@keyframes ll-notice-in{from{opacity:0;transform:translate(-50%,-6px)}to{opacity:1;transform:translate(-50%,0)}}
.dsh-lingualab-notice>svg{flex:none;color:var(--dsw-alias-brand-primary,#0f1115)}
.dsh-lingualab-notice.is-mismatch,.dsh-lingualab-notice.is-warn{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#f59e0b) 12%,var(--ll-surface));
  border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#f59e0b) 35%,transparent)}
.dsh-lingualab-notice.is-mismatch>svg,.dsh-lingualab-notice.is-warn>svg{color:var(--dsw-alias-state-warn-primary,#f59e0b)}
.dsh-lingualab-notice-text{flex:1;min-width:0}
.dsh-lingualab-notice-action{flex:none;height:28px;padding:0 10px;border:0;border-radius:8px;cursor:pointer;font:inherit;
  font-size:12.5px;font-weight:600;color:var(--dsw-alias-brand-primary,#0f1115);background:none;
  transition:background var(--ll-fade)}
.dsh-lingualab-notice-action:hover{background:var(--ll-hover)}
.dsh-lingualab-notice.is-mismatch .dsh-lingualab-notice-action,.dsh-lingualab-notice.is-warn .dsh-lingualab-notice-action{color:inherit}
.dsh-lingualab-episode-badges{display:inline-flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:6px;min-width:0}
.dsh-lingualab-videomark{display:inline-flex;align-items:center;gap:4px;flex:none;height:20px;padding:0 7px;border-radius:999px;
  font-size:11px;white-space:nowrap;color:var(--dsw-alias-label-secondary,#61666b);
  border:0.5px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1))}
.dsh-lingualab-videomark.is-ready{border-color:transparent;color:var(--dsw-alias-brand-primary,#0f1115);
  background:color-mix(in srgb,var(--dsw-alias-brand-primary,#0f1115) 10%,transparent)}
.dsh-lingualab-segopt-sub{display:block;font-size:11px;font-weight:400;color:var(--dsw-alias-label-secondary,#61666b)}
.dsh-lingualab-segopt-video{flex:none;display:inline-flex;color:var(--dsw-alias-brand-primary,#0f1115)}

/* ── shared bits ─────────────────────────────────────────────── */
.dsh-lingualab-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#61666b)}
/* A label with a short twin: the long one by default, and a narrow room (see the responsive rules) swaps them. */
.dsh-lingualab-label-short{display:none}
.dsh-lingualab-path{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;word-break:break-all}
.dsh-lingualab-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.dsh-lingualab-card{border:0.5px solid var(--dsw-alias-border-l1,rgba(0,0,0,0.04));border-radius:12px;
  background:var(--dsw-alias-bg-layer-1,transparent);padding:12px 14px}
.dsh-lingualab-counter{font-size:12px;color:var(--dsw-alias-label-secondary,#61666b);font-variant-numeric:tabular-nums}

/* ── responsive: the size of the room, not of the window ─────────────────────────────────────────
   The host's sidebar takes 56px or 280px, and the transcript takes a third of what is left, so the window's width says
   little about the room the practice column has (an iPad in landscape with the sidebar open gives it 440 to 630px, and a
   desktop window at 1440 gives it about 765). The column is a size container (ll-practice, and ll-body for the row the
   transcript shares with it), and every rule about what is in it asks the column. A size query measures the content box,
   which is the column less its 24px side padding and 20px bottom padding, and the thresholds below are in those terms.
   They come from measuring the column at iPad sizes (379 to 582 wide, 631 to 1111 tall) and a desktop (717 by 831);
   none of them applies at the desktop size while the timing panel is closed. These rules override the ones above at the
   same specificity, so they stay last. */

/* A narrow row: the transcript gives back some width, the grade buttons drop their key caps, and the follow switch says
   "Follow" (the long word does not fit the 260px head beside the segmented control). */
@container ll-body (max-width:820px){
  .dsh-lingualab-transcript{width:260px}
  .dsh-lingualab-transcript-head{gap:6px;padding:0 12px}
  .dsh-lingualab-transcript-head .dsh-lingualab-spacer{min-width:0}
  .dsh-lingualab-transcript-head .dsh-lingualab-segmented button{gap:4px;padding:0 8px;font-size:12.5px}
  .dsh-lingualab-switch{gap:6px}
  .dsh-lingualab-grades .dsh-lingualab-grade-btn kbd{display:none}
  .dsh-lingualab-switch .dsh-lingualab-label-long{display:none}
  .dsh-lingualab-switch .dsh-lingualab-label-short{display:inline}
}

/* Narrow column (600px and less): the picture and the cards use the whole column, and the pills on the picture may wrap,
   because a tooltip does not exist on a touch screen and a cut-off word cannot be read. */
@container ll-practice (max-width:600px){
  .dsh-lingualab-picture,.dsh-lingualab-videocard{--ll-pic-w:100%}
  .dsh-lingualab-videostage{--ll-pic-share:1}
  .dsh-lingualab-smooth-pill{height:auto;min-height:26px;flex-wrap:wrap;border-radius:13px}
  .dsh-lingualab-smooth-text{white-space:normal;overflow:visible;padding:3px 10px 3px 4px}
  /* The player card's row: the sentence buttons first, then every other button in one centred, wrapping flow, instead of
     three columns of 160px that wrap into four lines each. */
  .dsh-lingualab-transport-row{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 6px}
  .dsh-lingualab-transport-side{display:contents}
  .dsh-lingualab-transport-main{order:-1;flex:0 0 100%;justify-content:center}
}

/* The timing panel in a small room: a column of 600px or less (648 or less wide) or of 760px or less (780 or less tall, an
   iPad in landscape). One layout for every small room: each edge is one row (the label with how far it moved under it, the
   value, the two step buttons, the playhead button), the foot is one row (Reset, Cancel, and Save taking what is left), and
   the mini timeline and the lines of keys go. Wide and tall rooms keep the two cards with the mini timeline. */
@container ll-practice (max-width:600px) or (max-height:760px){
  .dsh-lingualab-timing{gap:10px;margin-bottom:6px;padding:10px 12px 8px}
  .dsh-lingualab-timing-line,.dsh-lingualab-timing-hints,.dsh-lingualab-timing-keys,
  .dsh-lingualab-timing-edge .dsh-lingualab-spacer,.dsh-lingualab-timing-foot .dsh-lingualab-spacer{display:none}
  .dsh-lingualab-timing-edges{grid-template-columns:1fr;gap:8px}
  .dsh-lingualab-timing-edge{display:grid;grid-template-columns:minmax(56px,max-content) minmax(0,1fr) auto auto;align-items:center;
    gap:0 8px;box-sizing:border-box;min-height:44px;padding:2px 8px}
  .dsh-lingualab-timing-edge-head{flex-direction:column;align-items:flex-start;gap:0;min-height:0;line-height:1.25}
  .dsh-lingualab-timing-edge-body{display:contents}
  .dsh-lingualab-timing-value{justify-self:start;font-size:18px}
  .dsh-lingualab-timing-ghost{margin-left:0;align-self:center;height:30px;padding:0 8px;border-radius:8px;
    border:1px solid var(--dsw-alias-border-l2,rgba(0,0,0,0.1))}
  .dsh-lingualab-timing-ghost kbd{display:none}
  .dsh-lingualab-timing .dsh-lingualab-label-long{display:none}
  .dsh-lingualab-timing .dsh-lingualab-label-short{display:inline}
  .dsh-lingualab-timing-foot{flex-wrap:nowrap;gap:8px;padding-top:8px}
  .dsh-lingualab-timing-foot .dsh-lingualab-btn{flex:none}
  .dsh-lingualab-timing-foot .dsh-lingualab-btn.is-primary{flex:1;min-width:0;justify-content:center}
}
/* Where the row cannot hold all four parts (the playhead button needs about 100px more than the value and the step buttons
   leave), the playhead button takes a second line of its own row. */
@container ll-practice (max-width:372px){
  .dsh-lingualab-timing-edge{grid-template-columns:minmax(56px,max-content) minmax(0,1fr) auto}
  .dsh-lingualab-timing-ghost{grid-column:1/-1;justify-self:start;margin-top:4px}
}

/* Short column (700px and less, the iPad in landscape): the lines either side of the sentence go first, then the
   picture's height cap drops from 42% of the column to 30%, and the stage gives up some padding. */
@container ll-practice (max-height:700px){
  .dsh-lingualab-stage-side{display:none}
  .dsh-lingualab-videostage,.dsh-lingualab-picture{--ll-pic-h:30cqh}
  .dsh-lingualab-videocard{min-height:0}
  .dsh-lingualab-stage{padding-block:12px}
}

/* A picture that plays gives way to the sentence and the player card when the column is short (the sentence is text and the card
   is the way to play, so the picture is the part that can). Its stage is sized as the picture would be, from the column: the
   smallest of its share of the width, 720px and the height cap, each in the stage's own terms (the stage's padding is 12px a side
   and 20px on top, outside the box it is sized by). It may shrink below that, by flex, when the room is less; it is a size
   container for that, so the picture is the biggest 16:9 box that fits what the stage gets, and with its own room that box is the
   one the picture always had. Under the 120px that the page measures (usePictureRoom, which puts is-picture-squeezed on the
   column; 128px brings it back) the stage is not there at all. */
.dsh-lingualab-practice:not(.is-timing) .dsh-lingualab-videostage.is-shown.has-screen{box-sizing:content-box;
  flex:0 1 min(calc(var(--ll-pic-share) * (100cqw - 24px) * 9 / 16),405px,var(--ll-pic-h));min-height:0;container:ll-video/size}
.dsh-lingualab-practice:not(.is-timing) .dsh-lingualab-videostage.is-shown .dsh-lingualab-picture{min-width:0;max-height:none;
  width:min(var(--ll-pic-w),720px,calc(100cqh * 16 / 9))}
/* The corner pills (a local file, the smooth version) need about 160px of picture to stay clear of each other, as in timing mode,
   where they are not drawn at all; a picture that has given way to under that has none. This asks the stage about the picture's
   size, which is fine for what is drawn on the picture; only whether the picture itself is drawn is the page's measurement. */
@container ll-video (max-height:159px){
  .dsh-lingualab-videostage.is-shown .dsh-lingualab-picture-local,
  .dsh-lingualab-videostage.is-shown .dsh-lingualab-picture-smooth{display:none}
}

/* Adjusting timing is a mode (the page sets is-timing on the column while the panel has a sentence). Everything that is not
   the sentence, the panel and the way to play it steps back, so they fit a column that is only 631px tall:
   - the player card is one row, the scrubber and "speed | previous, play, next" (about 124px instead of 264); every other
     button, the key hints and any open menu are hidden, and all of it is back when the panel closes;
   - the lines either side of the sentence go and the sentence is not stretched, so it is as tall as its text;
   - a picture that plays takes whatever is left, as the biggest box of the video's shape that fits (the largest box 720px
     wide). A card or a chip standing in for a picture is not drawn at all; the corner pills of a picture (a local file, the
     smooth version) are not either.
   - when what is left is under 120px (the page measures it, see usePictureRoom, and puts is-picture-squeezed on the column;
     128px brings the picture back), the picture's stage is not there at all and the sentence stage takes the room instead,
     with its text centred in it, so the space around the sentence is breathing room and not an empty box above it. The video
     keeps playing, as for an audio file. A size container cannot shrink itself when its child is not drawn, which is why this
     is decided by a measurement and not by a container query on the picture.
   The large picture is already the part that takes what is left (it is the stage), so it keeps its place and its 160px floor
   instead of vanishing: the reader asked for it, and the sentence is not on the stage to take its room. */
.dsh-lingualab-practice.is-timing .dsh-lingualab-stage-side{display:none}
.dsh-lingualab-practice.is-timing .dsh-lingualab-stage{flex:0 0 auto;padding-block:12px}
.dsh-lingualab-practice.is-timing .dsh-lingualab-keyhints,
.dsh-lingualab-practice.is-timing .dsh-lingualab-deck .dsh-lingualab-menu,
.dsh-lingualab-practice.is-timing .dsh-lingualab-deck .dsh-lingualab-bar-btn:not(.is-speed),
.dsh-lingualab-practice.is-timing .dsh-lingualab-transport-side.is-end{display:none}
.dsh-lingualab-practice.is-timing .dsh-lingualab-transport-row{display:grid;grid-template-columns:1fr auto 1fr}
.dsh-lingualab-practice.is-timing .dsh-lingualab-transport-side{display:flex}
.dsh-lingualab-practice.is-timing .dsh-lingualab-transport-main{order:0}
.dsh-lingualab-practice.is-timing .dsh-lingualab-videostage.is-shown:not(.has-screen){display:none}
.dsh-lingualab-practice.is-timing .dsh-lingualab-videostage.is-shown.has-screen{flex:1 1 0;min-height:0;padding-top:8px;
  justify-content:center;container:ll-video/size}
.dsh-lingualab-practice.is-timing .dsh-lingualab-videostage.is-shown .dsh-lingualab-picture{flex:none;min-width:0;min-height:0;
  max-height:none;width:min(100cqw,720px,calc(100cqh * var(--ll-video-ratio,1.7778)));aspect-ratio:var(--ll-video-ratio,1.7778)}
.dsh-lingualab-practice.is-timing .dsh-lingualab-picture-local,
.dsh-lingualab-practice.is-timing .dsh-lingualab-picture-smooth{display:none}
/* No fallback container query on the picture's own height under 120px (there was one, at 119px): the page measures before
   the first paint, and a second rule with its own idea of the edge (a rounded pixel apart) would leave the empty box behind
   exactly where the two disagree. */
.dsh-lingualab-practice.is-picture-squeezed .dsh-lingualab-videostage.is-shown.has-screen{display:none}
.dsh-lingualab-practice.is-timing.is-picture-squeezed .dsh-lingualab-stage{flex:1 1 auto}

/* A touch screen: no keyboard to describe, and fingers need 44px. The small pills on the picture keep their look and get a
   hit area of 44px by an invisible margin around them. The player card's buttons are 44px for real, and the card grows by
   a row of 12px for each row of buttons it wraps into. */
@media (hover:none) and (pointer:coarse){
  .dsh-lingualab-page kbd,.dsh-lingualab-keyhints,.dsh-lingualab-timing-hints,.dsh-lingualab-timing-keys,
  .dsh-lingualab-menu-keys,.dsh-lingualab-editor-hint,.dsh-lingualab-keys{display:none}
  .dsh-lingualab-deck .dsh-lingualab-bar-btn{min-width:44px;min-height:44px}
  .dsh-lingualab-round{width:44px;height:44px}
  .dsh-lingualab-timing-step button{width:44px;height:44px}
  .dsh-lingualab-timing-ghost{--ll-ghost-pad:12px;height:44px}
  .dsh-lingualab-timing-foot .dsh-lingualab-btn{height:44px}
  .dsh-lingualab-videocard .dsh-lingualab-btn{min-height:44px}
  @container ll-practice (max-width:392px){
    .dsh-lingualab-timing-edge{grid-template-columns:minmax(56px,max-content) minmax(0,1fr) auto}
    .dsh-lingualab-timing-ghost{grid-column:1/-1;justify-self:start;margin-top:4px}
  }
  .dsh-lingualab-videochip.is-button,.dsh-lingualab-stage-time,.dsh-lingualab-timing-row .dsh-lingualab-icon-btn{position:relative}
  .dsh-lingualab-picture-local-btn::after,.dsh-lingualab-picture-peek::after,.dsh-lingualab-videochip.is-button::after,
  .dsh-lingualab-stage-time::after,.dsh-lingualab-timing-row .dsh-lingualab-icon-btn::after{content:'';position:absolute;
    inset:-9px -4px}
}
`
