/*
  drawer.js. Shared drawer component for My Philippines Trip mockups.

  Modes: doors, aichat, letter, booking.

  Triggers: any element with [data-mpt-drawer="<mode>"]. On click, opens the
  drawer in that mode. If window.MPT_DESTINATION is set on the page, it is
  passed in as destination context.

  Public API on window.MPTDrawer:
    open(mode, context?)            open the drawer in a given mode
    close()                         close it
    setMode(mode, options?)         change the mode while open (crossfades body)
                                    options.from = 'doors' marks the entry as
                                    via-doors, which shows the back link.

  Phase 1: full chrome + doors body. aichat / letter / booking show placeholder
  bodies that later phases will replace.
*/

(function () {
  'use strict';

  // ---------- constants ----------

  var SLIDE_MS = 250;
  var FADE_MS = 150;
  var DESKTOP_BP = 768;
  var DOT = '·';

  // ---------- style ----------

  var STYLE = [
    '.mpt-drawer-backdrop {',
    '  position: fixed; inset: 0; z-index: 95;',
    '  background: rgba(26,26,26,0.5);',
    '  opacity: 0; pointer-events: none;',
    '  transition: opacity ' + SLIDE_MS + 'ms ease-out;',
    '}',
    '.mpt-drawer-backdrop.is-open { opacity: 1; pointer-events: auto; }',

    '.mpt-drawer {',
    '  position: fixed; left: 0; right: 0; bottom: 0;',
    '  z-index: 100;',
    '  max-height: 90vh;',
    '  background: #FFFFFF;',
    '  border-radius: 20px 20px 0 0;',
    '  box-shadow: 0 -8px 32px rgba(0,0,0,0.18);',
    '  transform: translateY(100%);',
    '  transition: transform ' + SLIDE_MS + 'ms ease-out;',
    '  display: flex; flex-direction: column;',
    '  font-family: "DM Sans", -apple-system, sans-serif;',
    '  color: #1A1A1A;',
    '}',
    '.mpt-drawer.is-open { transform: translateY(0); }',

    '@media (min-width: ' + DESKTOP_BP + 'px) {',
    '  .mpt-drawer {',
    '    top: 0; bottom: 0; left: auto; right: 0;',
    '    width: 480px; max-height: none;',
    '    border-radius: 0;',
    '    transform: translateX(100%);',
    '  }',
    '  .mpt-drawer.is-open { transform: translateX(0); }',
    '}',

    '.mpt-drawer-close {',
    '  position: absolute; top: 8px; right: 8px;',
    '  width: 44px; height: 44px;',
    '  display: inline-flex; align-items: center; justify-content: center;',
    '  background: none; border: 0; cursor: pointer; color: #1A1A1A;',
    '  z-index: 3;',
    '}',
    '.mpt-drawer-close svg { width: 20px; height: 20px; stroke: currentColor; stroke-width: 1.5; fill: none; }',
    '.mpt-drawer-close:focus-visible { outline: 2px solid #D9443C; outline-offset: 2px; border-radius: 4px; }',

    '.mpt-drawer-back {',
    '  position: absolute; top: 12px; left: 16px;',
    '  display: none;',
    '  align-items: center; gap: 6px;',
    '  background: none; border: 0; cursor: pointer;',
    '  font: inherit; color: rgba(26,26,26,0.6);',
    '  font-size: 13px; font-weight: 500;',
    '  letter-spacing: 0.04em;',
    '  padding: 8px 4px; min-height: 36px;',
    '  z-index: 3;',
    '}',
    '.mpt-drawer-back.is-visible { display: inline-flex; }',
    '.mpt-drawer-back:hover { color: #1A1A1A; }',
    '.mpt-drawer-back svg { width: 14px; height: 14px; stroke: currentColor; stroke-width: 1.5; fill: none; }',

    '.mpt-drawer-head {',
    '  padding: 56px 24px 16px;',
    '  text-align: center;',
    '  flex-shrink: 0;',
    '}',
    '.mpt-drawer-eyebrow {',
    '  display: none;',
    '  font-size: 12px; font-weight: 500;',
    '  letter-spacing: 0.16em; text-transform: uppercase;',
    '  color: #2E74B0;',
    '  margin-bottom: 8px;',
    '}',
    '.mpt-drawer-eyebrow.is-visible { display: block; }',
    '.mpt-drawer-title {',
    '  font-family: "Fraunces", Georgia, serif;',
    '  font-style: italic; font-weight: 300;',
    '  font-size: 24px; line-height: 1.2;',
    '  letter-spacing: -0.01em;',
    '  color: #D9443C;',
    '}',
    '.mpt-drawer-sub {',
    '  display: none;',
    '  font-size: 14px; line-height: 1.4;',
    '  color: #1A1A1A; margin-top: 6px;',
    '}',
    '.mpt-drawer-sub.is-visible { display: block; }',

    '.mpt-drawer-body {',
    '  padding: 8px 24px 0;',
    '  overflow-y: auto;',
    '  flex: 1;',
    '  opacity: 1;',
    '  transition: opacity ' + FADE_MS + 'ms ease-out;',
    '}',
    '.mpt-drawer-body.is-fading { opacity: 0; }',

    /* doors */
    '.mpt-doors { display: flex; flex-direction: column; gap: 16px; padding-bottom: 24px; }',
    '@media (min-width: ' + DESKTOP_BP + 'px) {',
    '  .mpt-doors { flex-direction: column; }',
    '}',
    '.mpt-door {',
    '  border: 1px solid rgba(26,26,26,0.08);',
    '  border-radius: 12px;',
    '  padding: 20px;',
    '  background: #FFFFFF;',
    '}',
    '.mpt-door-eyebrow {',
    '  font-size: 12px; font-weight: 500;',
    '  letter-spacing: 0.16em; text-transform: uppercase;',
    '}',
    '.mpt-door-eyebrow.ocean { color: #2E74B0; }',
    '.mpt-door-eyebrow.coral { color: #D9443C; }',
    '.mpt-door-title {',
    '  font-family: "Fraunces", Georgia, serif;',
    '  font-style: italic; font-weight: 400;',
    '  font-size: 22px; line-height: 1.2;',
    '  color: #1A1A1A; margin-top: 8px;',
    '}',
    '.mpt-door-copy {',
    '  font-size: 15px; line-height: 1.5;',
    '  color: #1A1A1A; margin-top: 12px;',
    '}',
    '.mpt-door-btn {',
    '  display: inline-flex; align-items: center; justify-content: center;',
    '  width: 100%; min-height: 44px; margin-top: 16px;',
    '  border: 0; border-radius: 999px; cursor: pointer;',
    '  font: inherit; font-weight: 500; font-size: 15px; color: #FFFFFF;',
    '  transition: background 200ms ease;',
    '}',
    '.mpt-door-btn.ocean { background: #2E74B0; }',
    '.mpt-door-btn.ocean:hover { background: #265F92; }',
    '.mpt-door-btn.coral { background: #D9443C; }',
    '.mpt-door-btn.coral:hover { background: #B8352E; }',

    /* placeholder bodies for stubs */
    '.mpt-placeholder {',
    '  padding: 40px 0 24px;',
    '  text-align: center;',
    '  color: rgba(26,26,26,0.6);',
    '  font-size: 14px;',
    '}',
    '.mpt-placeholder b { color: #1A1A1A; font-weight: 500; }',

    /* booking flow */
    '.mpt-booking {',
    '  display: flex; flex-direction: column;',
    '  gap: 18px;',
    '  min-height: 100%;',
    '}',

    /* progress strip */
    '.mpt-progress {',
    '  display: flex; align-items: center; justify-content: center;',
    '  padding: 0 8px; gap: 0;',
    '}',
    '.mpt-progress-step {',
    '  flex: 0 0 auto; width: 8px; height: 8px; border-radius: 50%;',
    '  border: 1px solid rgba(26,26,26,0.2); background: transparent;',
    '  transition: background 200ms ease, border-color 200ms ease;',
    '}',
    '.mpt-progress-step.is-upcoming { width: 6px; height: 6px; }',
    '.mpt-progress-step.is-completed { background: #2E74B0; border-color: #2E74B0; }',
    '.mpt-progress-step.is-active { background: #D9443C; border-color: #D9443C; }',
    '.mpt-progress-line {',
    '  flex: 1 1 auto; height: 1px; max-width: 36px; min-width: 12px;',
    '  background: rgba(26,26,26,0.2);',
    '  margin: 0 4px;',
    '}',
    '.mpt-progress-line.is-completed { background: #2E74B0; }',

    '.mpt-step-label {',
    '  text-align: center;',
    '  font-size: 12px; font-weight: 500;',
    '  letter-spacing: 0.16em; text-transform: uppercase;',
    '  color: rgba(26,26,26,0.6);',
    '  margin-top: 4px;',
    '}',

    '.mpt-step-heading {',
    '  font-family: "Fraunces", Georgia, serif;',
    '  font-weight: 400;',
    '  font-size: 22px; line-height: 1.25;',
    '  color: #1A1A1A;',
    '  letter-spacing: -0.01em;',
    '  margin-top: 4px;',
    '}',
    '.mpt-step-sub {',
    '  font-size: 14px; line-height: 1.5;',
    '  color: rgba(26,26,26,0.6);',
    '  margin-top: 6px;',
    '}',

    /* calendar */
    '.mpt-cal {',
    '  border: 1px solid rgba(26,26,26,0.08);',
    '  border-radius: 12px;',
    '  padding: 10px;',
    '}',
    '.mpt-cal-head {',
    '  display: flex; align-items: center; justify-content: space-between;',
    '  margin-bottom: 10px;',
    '}',
    '.mpt-cal-month {',
    '  font-family: "Fraunces", Georgia, serif;',
    '  font-weight: 400;',
    '  font-size: 17px;',
    '  color: #1A1A1A;',
    '}',
    '.mpt-cal-nav {',
    '  width: 36px; height: 36px;',
    '  display: inline-flex; align-items: center; justify-content: center;',
    '  background: none; border: 0; cursor: pointer; color: #1A1A1A;',
    '  border-radius: 6px;',
    '  transition: background 150ms ease;',
    '}',
    '.mpt-cal-nav:hover { background: rgba(46,116,176,0.08); }',
    '.mpt-cal-nav:disabled { opacity: 0.3; cursor: default; }',
    '.mpt-cal-nav:disabled:hover { background: none; }',
    '.mpt-cal-nav svg { width: 16px; height: 16px; stroke: currentColor; stroke-width: 1.5; fill: none; }',

    '.mpt-cal-grid {',
    '  display: grid;',
    '  grid-template-columns: repeat(7, 1fr);',
    '  row-gap: 2px;',
    '  column-gap: 0;',
    '}',
    '.mpt-cal-dow {',
    '  font-size: 11px; font-weight: 500;',
    '  letter-spacing: 0.10em; text-transform: uppercase;',
    '  color: rgba(26,26,26,0.5);',
    '  text-align: center;',
    '  padding: 6px 0 8px;',
    '}',

    /* day cell: positioning container only. Two layers inside:
       - mpt-cal-day-fill: absolute, behind, holds the range pill bg
       - mpt-cal-day-num: relative, on top, holds the day number,
         the hover wash, and the today inset border */
    '.mpt-cal-day {',
    '  position: relative;',
    '  height: 36px;',
    '  padding: 0;',
    '  display: flex; align-items: center; justify-content: center;',
    '  font-size: 15px; color: #1A1A1A;',
    '  background: none; border: 0; cursor: pointer; font: inherit;',
    '}',
    '.mpt-cal-day.is-disabled { cursor: default; }',
    '.mpt-cal-day.is-disabled .mpt-cal-day-num { opacity: 0.3; }',
    /* spillover: previous-month tail and next-month lead. Decorative only,
       not interactive. Range styling overrides the muted colour when a
       spillover sits inside a selected range. */
    '.mpt-cal-day.is-spillover { cursor: default; }',
    '.mpt-cal-day.is-spillover .mpt-cal-day-num { color: rgba(26,26,26,0.3); }',

    '.mpt-cal-day-fill {',
    '  position: absolute;',
    '  top: 0; bottom: 0; left: 0; right: 0;',
    '  pointer-events: none;',
    '  z-index: 0;',
    '  background: transparent;',
    '  border-radius: 0;',
    '}',

    '.mpt-cal-day-num {',
    '  position: relative;',
    '  z-index: 1;',
    '  display: inline-flex; align-items: center; justify-content: center;',
    '  width: 32px; height: 32px;',
    '  border-radius: 4px;',
    '  transition: background 150ms ease, color 150ms ease;',
    '}',

    /* hover (non-range, non-disabled) sits on the day number, not the cell */
    '.mpt-cal-day:not(.is-disabled):not(.is-start):not(.is-night):not(.is-end):hover .mpt-cal-day-num {',
    '  background: rgba(46,116,176,0.1);',
    '}',

    '.mpt-cal-day.is-today .mpt-cal-day-num { box-shadow: inset 0 0 0 1px #2E74B0; }',

    /* range fills: continuous pill, edge-to-edge across adjacent cells */
    '.mpt-cal-day.is-start .mpt-cal-day-fill,',
    '.mpt-cal-day.is-end .mpt-cal-day-fill { background: #D9443C; }',
    '.mpt-cal-day.is-night .mpt-cal-day-fill { background: rgba(217,68,60,0.12); }',
    '.mpt-cal-day.range-left .mpt-cal-day-fill {',
    '  border-top-left-radius: 6px;',
    '  border-bottom-left-radius: 6px;',
    '}',
    '.mpt-cal-day.range-right .mpt-cal-day-fill {',
    '  border-top-right-radius: 6px;',
    '  border-bottom-right-radius: 6px;',
    '}',

    /* day-number colour in range: white on the solid coral cells, ink on the night fill */
    '.mpt-cal-day.is-start .mpt-cal-day-num,',
    '.mpt-cal-day.is-end .mpt-cal-day-num { color: #FFFFFF; box-shadow: none; background: transparent; }',
    '.mpt-cal-day.is-night .mpt-cal-day-num { color: #1A1A1A; box-shadow: none; background: transparent; }',

    '.mpt-cal-info { margin-top: 4px; }',
    '.mpt-cal-info-start { font-size: 16px; color: #1A1A1A; line-height: 1.4; }',
    '.mpt-cal-info-end { font-size: 14px; color: rgba(26,26,26,0.6); line-height: 1.4; margin-top: 2px; }',

    /* step 2 wrapper: opt out of the booking flex gap so internal spacings
       can be set per the design (64px / 32px / 24px) without doing
       arithmetic against the parent gap value */
    '.mpt-step-2 { display: flex; flex-direction: column; padding-bottom: 6px; }',
    '.mpt-step-2 > .mpt-step-sub { margin-top: 6px; }',
    '.mpt-step-2 > .mpt-counter { margin-top: 64px; }',
    '.mpt-step-2 > .mpt-totals { margin-top: 32px; }',
    '.mpt-step-2 > .mpt-step-bottom-note { margin-top: 24px; }',

    /* counter widget */
    '.mpt-counter {',
    '  display: flex; align-items: center; justify-content: center;',
    '  gap: 16px;',
    '}',
    '.mpt-counter-btn {',
    '  width: 48px; height: 48px;',
    '  background: #FFFFFF;',
    '  border: 1.5px solid rgba(26,26,26,0.2);',
    '  border-radius: 8px;',
    '  cursor: pointer;',
    '  font-family: inherit; font-weight: 500; font-size: 24px;',
    '  color: #1A1A1A;',
    '  display: inline-flex; align-items: center; justify-content: center;',
    '  line-height: 1;',
    '  transition: border-color 200ms ease;',
    '}',
    '.mpt-counter-btn:hover:not(:disabled) { border-color: rgba(26,26,26,0.4); }',
    '.mpt-counter-btn:disabled { opacity: 0.4; cursor: default; }',
    '.mpt-counter-num {',
    '  font-family: "Fraunces", Georgia, serif;',
    '  font-weight: 400; font-size: 56px;',
    '  color: #1A1A1A;',
    '  width: 96px;',
    '  text-align: center;',
    '  line-height: 1;',
    '}',

    /* totals + bottom note */
    '.mpt-totals { text-align: center; display: flex; flex-direction: column; gap: 8px; }',
    '.mpt-totals-per { font-size: 14px; color: rgba(26,26,26,0.6); }',
    '.mpt-totals-total { font-size: 24px; font-weight: 500; color: #D9443C; }',
    '.mpt-step-bottom-note {',
    '  text-align: center;',
    '  font-size: 13px; line-height: 1.5;',
    '  color: rgba(26,26,26,0.6);',
    '}',

    /* step 3: review */
    '.mpt-step-3 { display: flex; flex-direction: column; padding-bottom: 6px; }',
    '.mpt-step-3 > .mpt-summary { margin-top: 24px; }',
    '.mpt-step-3 > .mpt-summary + .mpt-field { margin-top: 28px; }',
    '.mpt-step-3 > .mpt-field + .mpt-field { margin-top: 14px; }',
    '.mpt-step-3 > .mpt-step-body-line { margin-top: 24px; }',
    '.mpt-step-3 > .mpt-step-microtext { margin-top: 14px; }',

    /* summary card */
    '.mpt-summary {',
    '  background: rgba(46,116,176,0.06);',
    '  padding: 14px;',
    '  border-radius: 8px;',
    '  display: flex; flex-direction: column;',
    '  gap: 6px;',
    '}',
    '.mpt-summary-row {',
    '  display: flex; align-items: center; justify-content: space-between;',
    '  gap: 12px;',
    '}',
    '.mpt-summary-label { font-size: 13px; font-weight: 400; color: rgba(26,26,26,0.6); }',
    '.mpt-summary-value { font-size: 14px; font-weight: 500; color: #1A1A1A; text-align: right; }',
    '.mpt-summary-divider {',
    '  height: 1px;',
    '  background: rgba(26,26,26,0.2);',
    '  margin: 2px 0;',
    '}',
    '.mpt-summary-total {',
    '  display: flex; align-items: center; justify-content: space-between;',
    '  gap: 12px;',
    '}',
    '.mpt-summary-total-label { font-size: 16px; font-weight: 500; color: #1A1A1A; }',
    '.mpt-summary-total-value {',
    '  font-family: "Fraunces", Georgia, serif;',
    '  font-weight: 400; font-size: 22px;',
    '  color: #D9443C;',
    '}',

    /* form fields */
    '.mpt-field { display: flex; flex-direction: column; }',
    '.mpt-field-label {',
    '  font-size: 13px; font-weight: 500;',
    '  letter-spacing: 0.04em;',
    '  color: #1A1A1A;',
    '  margin-bottom: 6px;',
    '}',
    '.mpt-field-input {',
    '  width: 100%;',
    '  padding: 12px;',
    '  border: 1px solid rgba(26,26,26,0.2);',
    '  border-radius: 6px;',
    '  font-family: inherit;',
    '  font-size: 16px; font-weight: 400;',
    '  color: #1A1A1A; background: #FFFFFF;',
    '  -webkit-appearance: none;',
    '  appearance: none;',
    '  transition: border-color 200ms ease;',
    '  box-sizing: border-box;',
    '}',
    '.mpt-field-input:focus {',
    '  outline: none;',
    '  border-color: #2E74B0;',
    '  box-shadow: none;',
    '}',
    '.mpt-field-helper {',
    '  font-size: 13px;',
    '  color: rgba(26,26,26,0.6);',
    '  margin-top: 6px;',
    '}',

    /* body line + microtext */
    '.mpt-step-body-line { font-size: 14px; line-height: 1.5; color: #1A1A1A; }',
    '.mpt-step-microtext { font-size: 12px; line-height: 1.4; color: rgba(26,26,26,0.6); }',
    '.mpt-step-microtext a { color: #2E74B0; text-decoration: underline; }',

    /* letter mode: single-screen form + confirmation */
    '.mpt-letter {',
    '  display: flex; flex-direction: column;',
    '  padding-bottom: 24px;',
    '}',
    '.mpt-letter-intro {',
    '  margin-top: 4px;',
    '  font-size: 15px; line-height: 1.6;',
    '  color: #1A1A1A;',
    '}',
    '.mpt-letter > .mpt-letter-body-wrap { margin-top: 22px; }',
    '.mpt-letter > .mpt-field { margin-top: 16px; }',
    '.mpt-letter > .mpt-letter-send { margin-top: 22px; }',
    '.mpt-letter > .mpt-letter-footer-note { margin-top: 12px; }',

    /* the textarea (no visible label; placeholder is the cue) */
    '.mpt-letter-textarea {',
    '  width: 100%;',
    '  min-height: 200px;',
    '  resize: vertical;',
    '  font-family: inherit;',
    '  font-size: 16px; font-weight: 400;',
    '  line-height: 1.6;',
    '  color: #1A1A1A; background: #FFFFFF;',
    '  border: 1px solid rgba(26,26,26,0.2);',
    '  border-radius: 6px;',
    '  padding: 14px;',
    '  -webkit-appearance: none;',
    '  appearance: none;',
    '  transition: border-color 200ms ease;',
    '  box-sizing: border-box;',
    '  display: block;',
    '}',
    '.mpt-letter-textarea:focus {',
    '  outline: none;',
    '  border-color: #2E74B0;',
    '  box-shadow: none;',
    '}',
    '.mpt-letter-textarea::placeholder { color: rgba(26,26,26,0.4); font-style: italic; }',
    '@media (max-width: 767px) { .mpt-letter-textarea { resize: none; } }',

    /* inline field error: kept quiet, sits under the input */
    '.mpt-field-error {',
    '  font-size: 13px; line-height: 1.4;',
    '  color: #D9443C;',
    '  margin-top: 6px;',
    '}',
    '.mpt-field-error:empty { display: none; }',

    /* send button: Coral pill, full width on mobile, comfortable on desktop */
    '.mpt-letter-send {',
    '  display: inline-flex; align-items: center; justify-content: center;',
    '  width: 100%;',
    '  min-height: 44px;',
    '  padding: 14px 28px;',
    '  border: 0; border-radius: 999px;',
    '  background: #D9443C; color: #FFFFFF;',
    '  font-family: inherit; font-weight: 500; font-size: 14px;',
    '  cursor: pointer;',
    '  transition: background 200ms ease, opacity 200ms ease;',
    '}',
    '.mpt-letter-send:hover:not(:disabled) { background: #B8352E; }',
    '.mpt-letter-send:disabled { opacity: 0.4; cursor: default; }',
    '@media (min-width: ' + DESKTOP_BP + 'px) {',
    '  .mpt-letter-send { width: auto; min-width: 220px; align-self: flex-end; }',
    '}',

    '.mpt-letter-footer-note {',
    '  font-size: 12px; line-height: 1.4;',
    '  color: rgba(26,26,26,0.6);',
    '}',

    /* confirmation state */
    '.mpt-letter-confirm {',
    '  display: flex; flex-direction: column;',
    '  padding-top: 16px;',
    '  padding-bottom: 24px;',
    '}',
    '.mpt-letter-confirm-body {',
    '  font-size: 16px; line-height: 1.65;',
    '  color: #1A1A1A;',
    '}',
    '.mpt-letter-confirm-signature {',
    '  font-family: "Fraunces", Georgia, serif;',
    '  font-style: italic; font-weight: 300;',
    '  font-size: 18px; line-height: 1.4;',
    '  color: #D9443C;',
    '  margin-top: 18px;',
    '}',
    '.mpt-letter-confirm-close {',
    '  align-self: flex-start;',
    '  margin-top: 28px;',
    '  background: none; border: 0; padding: 4px 0;',
    '  cursor: pointer;',
    '  font-family: inherit; font-weight: 500; font-size: 14px;',
    '  color: #2E74B0;',
    '  text-decoration: underline;',
    '}',
    '.mpt-letter-confirm-close:hover { color: #1F5A8B; }',

    /* step 4: redirect mock (matches the Maya hosted-checkout flow at launch) */
    '.mpt-step-4 {',
    '  display: flex; flex-direction: column; align-items: center;',
    '  text-align: center;',
    '  padding-bottom: 6px;',
    '}',
    '.mpt-step-4 .mpt-step-sub { font-size: 13px; margin-top: 6px; }',
    '.mpt-step-4 .mpt-spinner { margin-top: 60px; margin-bottom: 60px; }',
    '.mpt-spinner {',
    '  width: 40px; height: 40px;',
    '  border: 3px solid rgba(217,68,60,0.2);',
    '  border-top-color: #D9443C;',
    '  border-radius: 50%;',
    '  animation: mpt-spin 800ms linear infinite;',
    '}',
    '@keyframes mpt-spin { to { transform: rotate(360deg); } }',
    '@media (prefers-reduced-motion: reduce) { .mpt-spinner { animation: none; } }',

    /* step actions: sticky footer pattern, applies to every booking step */
    '.mpt-step-actions {',
    '  position: sticky;',
    '  bottom: 0;',
    '  margin-top: auto;',
    '  margin-left: -24px;',
    '  margin-right: -24px;',
    '  padding: 16px 20px;',
    '  min-height: 76px;',
    '  box-sizing: border-box;',
    '  background: #FFFFFF;',
    '  border-top: 1px solid rgba(26,26,26,0.2);',
    '  display: flex; align-items: center; justify-content: space-between;',
    '  gap: 12px;',
    '  z-index: 1;',
    '}',
    /* step 1: only a primary, full row */
    '.mpt-step-actions--solo { justify-content: flex-end; }',
    '.mpt-btn {',
    '  display: inline-flex; align-items: center; justify-content: center;',
    '  border: 0; cursor: pointer; font: inherit;',
    '  padding: 14px 28px; min-height: 44px;',
    '  border-radius: 999px;',
    '  font-weight: 500; font-size: 14px;',
    '  transition: background 200ms ease, opacity 200ms ease;',
    '}',
    '.mpt-btn--ocean { background: #2E74B0; color: #FFFFFF; }',
    '.mpt-btn--ocean:hover:not(:disabled) { background: #265F92; }',
    '.mpt-btn--coral { background: #D9443C; color: #FFFFFF; }',
    '.mpt-btn--coral:hover:not(:disabled) { background: #B8352E; }',
    '.mpt-btn:disabled { opacity: 0.4; cursor: default; }',
    '.mpt-btn--text {',
    '  background: none; padding: 8px 4px; min-height: 36px; min-width: 0;',
    '  color: rgba(26,26,26,0.6);',
    '  font-weight: 500; font-size: 14px;',
    '  border-radius: 4px;',
    '}',
    '.mpt-btn--text:hover:not(:disabled) { color: #1A1A1A; text-decoration: underline; }',
    '.mpt-step-actions--solo .mpt-btn--ocean,',
    '.mpt-step-actions--solo .mpt-btn--coral { flex: 1 1 auto; }',
    '@media (min-width: ' + DESKTOP_BP + 'px) {',
    '  .mpt-step-actions--solo .mpt-btn--ocean,',
    '  .mpt-step-actions--solo .mpt-btn--coral { flex: 0 0 auto; min-width: 220px; }',
    '}',

    '@media (prefers-reduced-motion: reduce) {',
    '  .mpt-drawer, .mpt-drawer-backdrop, .mpt-drawer-body { transition: none !important; }',
    '  .mpt-progress-step, .mpt-progress-line, .mpt-cal-day, .mpt-cal-nav, .mpt-btn { transition: none !important; }',
    '}'
  ].join('\n');

  // ---------- state ----------

  var els = null;       // DOM references after mount
  var state = {
    open: false,
    mode: null,
    context: null,
    fromMode: null,
    lastFocus: null
  };

  // ---------- helpers ----------

  function readContextFromPage() {
    return (typeof window.MPT_DESTINATION === 'object' && window.MPT_DESTINATION) || null;
  }

  function focusables() {
    return Array.prototype.slice.call(
      els.drawer.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (el) {
      return el.offsetParent !== null;
    });
  }

  function lockScroll() {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }
  function unlockScroll() {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  // ---------- header ----------

  function headerFor(mode, ctx) {
    var hasCtx = !!ctx;
    if (mode === 'doors') {
      return {
        title: hasCtx ? (ctx.title + ' ' + DOT + ' ' + ctx.duration) : 'Start a letter',
        sub: null
      };
    }
    if (mode === 'aichat') {
      return {
        title: hasCtx ? (ctx.title + ' ' + DOT + ' ' + ctx.duration) : 'Start a conversation',
        sub: null
      };
    }
    if (mode === 'letter') {
      if (hasCtx) {
        return {
          title: ctx.title + ' ' + DOT + ' ' + ctx.duration,
          sub: 'Write us a letter'
        };
      }
      return { title: 'Write us a letter', sub: null };
    }
    if (mode === 'booking') {
      if (!hasCtx) return { title: 'Book this trip', sub: null };
      return {
        title: ctx.title + ' ' + DOT + ' ' + ctx.duration,
        sub: 'From USD ' + ctx.pricePerPerson + ' per person ' + DOT + ' minimum ' + ctx.minPax + ' pax'
      };
    }
    return { title: '', sub: null };
  }

  function renderHeader(mode, ctx) {
    var h = headerFor(mode, ctx);
    els.title.textContent = h.title;
    if (h.sub) {
      els.sub.textContent = h.sub;
      els.sub.classList.add('is-visible');
    } else {
      els.sub.textContent = '';
      els.sub.classList.remove('is-visible');
    }
    var showBack = (mode === 'aichat' || mode === 'letter') && state.fromMode === 'doors';
    els.back.classList.toggle('is-visible', showBack);
  }

  // ---------- booking ----------

  var DOW_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  var MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  var STEP_LABELS = ['WHEN', 'HOW MANY', 'REVIEW', 'PAYMENT', 'CONFIRMED'];
  var BOOKING_LEAD_DAYS = 11;

  var booking = {
    step: 1,
    startDate: null,
    endDate: null,
    travellers: 2,
    leadName: '',
    leadEmail: '',
    leadPhone: '',
    total: 0,
    reference: null,
    completedAt: null,
    viewYear: null,
    viewMonth: null
  };

  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  function dateKey(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function dateFromKey(k) {
    var p = k.split('-');
    return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  }

  function startOfDay(d) {
    var c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c;
  }

  function addDays(d, n) {
    var c = new Date(d);
    c.setDate(c.getDate() + n);
    return c;
  }

  function formatDateLong(d) {
    return DOW_SHORT[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function parseNights(duration) {
    if (!duration) return 0;
    var m = /(\d+)N/i.exec(duration);
    return m ? parseInt(m[1], 10) : 0;
  }

  function formatPrice(n) {
    // thousands separator: 458 -> "458", 2748 -> "2,748"
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function formatStartShort(d) {
    // "Sat, 9 May" — no year, used for the start half of a same-context range
    return DOW_SHORT[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
  }

  function formatDatesRange(startKey, endKey) {
    if (!startKey || !endKey) return '';
    return formatStartShort(dateFromKey(startKey)) + ' to ' + formatDateLong(dateFromKey(endKey));
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function isValidLeadName(s) {
    return typeof s === 'string' && s.trim().length >= 1;
  }

  function isValidLeadEmail(s) {
    // brief: basic check, no regex strictness. Just @ and . present.
    return typeof s === 'string' && s.indexOf('@') !== -1 && s.indexOf('.') !== -1;
  }

  function debounce(fn, wait) {
    var t = null;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  function generateBookingReference(ctx) {
    // Prefer an explicit refPrefix on the destination ("ILO", "BOH", ...).
    // Fall back to the first 3 letters of the slug for any destination that
    // doesn't set one ("iloilo" -> "ILO", "bohol" -> "BOH"). "XXX" guards
    // the case where ctx is missing entirely.
    var prefix;
    if (ctx && ctx.refPrefix) prefix = ctx.refPrefix;
    else if (ctx && ctx.slug) prefix = ctx.slug.slice(0, 3);
    else prefix = 'XXX';
    return 'MPT-' + prefix.toUpperCase() + '-' + Math.floor(100000 + Math.random() * 900000);
  }

  // ---------- redirect timer (step 4) ----------

  // Holds the setTimeout that drives the 800ms drawer-to-confirmation hop.
  // Cleared by close() so X mid-flight aborts the navigation per the brief.
  var redirectTimer = null;

  function clearRedirectTimer() {
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      redirectTimer = null;
    }
  }

  // ---------- booking persistence ----------

  var BOOKING_STORAGE_KEY = 'mpt_booking_draft';

  function loadBookingDraft() {
    try {
      var raw = window.sessionStorage && sessionStorage.getItem(BOOKING_STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      return (data && typeof data === 'object') ? data : null;
    } catch (e) {
      return null;
    }
  }

  function saveBookingDraft() {
    try {
      if (!window.sessionStorage) return;
      sessionStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify({
        destination: state.context ? {
          slug: state.context.slug,
          title: state.context.title,
          duration: state.context.duration,
          pricePerPerson: state.context.pricePerPerson,
          minPax: state.context.minPax
        } : null,
        step: booking.step,
        startDate: booking.startDate,
        endDate: booking.endDate,
        travellers: booking.travellers,
        leadName: booking.leadName,
        leadEmail: booking.leadEmail,
        leadPhone: booking.leadPhone,
        total: booking.total,
        reference: booking.reference,
        completedAt: booking.completedAt
      }));
    } catch (e) { /* sessionStorage may be disabled or full; silently ignore */ }
  }

  function clearBookingDraft() {
    try { window.sessionStorage && sessionStorage.removeItem(BOOKING_STORAGE_KEY); } catch (e) {}
  }

  function resetBooking(ctx) {
    var earliest = startOfDay(addDays(new Date(), BOOKING_LEAD_DAYS));
    var per = (ctx && ctx.pricePerPerson) || 0;
    var minPax = (ctx && ctx.minPax) || 2;
    var saved = loadBookingDraft();
    var sameDestination = saved && saved.destination && ctx && saved.destination.slug === ctx.slug;
    var canRestore = saved && sameDestination && !saved.completedAt;

    if (canRestore) {
      var savedStep = (typeof saved.step === 'number' && saved.step >= 1 && saved.step <= 4) ? saved.step : 1;
      var savedT = (typeof saved.travellers === 'number') ? saved.travellers : minPax;
      // brief: if a previously saved value is below 2 or above 12 (shouldn't
      // happen, but guard), reset to 2
      if (savedT < 2 || savedT > 12) savedT = 2;

      booking.step = savedStep;
      booking.startDate = saved.startDate || null;
      booking.endDate = saved.endDate || null;
      booking.travellers = savedT;
      booking.leadName = saved.leadName || '';
      booking.leadEmail = saved.leadEmail || '';
      booking.leadPhone = saved.leadPhone || '';
      booking.total = (typeof saved.total === 'number') ? saved.total : (savedT * per);
      booking.reference = saved.reference || null;
      booking.completedAt = null;

      // calendar view: jump to the saved selection's month if one exists,
      // otherwise the first bookable month
      if (booking.startDate) {
        var sd = dateFromKey(booking.startDate);
        booking.viewYear = sd.getFullYear();
        booking.viewMonth = sd.getMonth();
      } else {
        booking.viewYear = earliest.getFullYear();
        booking.viewMonth = earliest.getMonth();
      }
    } else {
      booking.step = 1;
      booking.startDate = null;
      booking.endDate = null;
      booking.travellers = minPax;
      booking.leadName = '';
      booking.leadEmail = '';
      booking.leadPhone = '';
      booking.total = minPax * per;
      booking.reference = null;
      booking.completedAt = null;
      booking.viewYear = earliest.getFullYear();
      booking.viewMonth = earliest.getMonth();
      // a saved draft from a different destination, or a completed one, is
      // stale: drop it so we don't keep restoring it
      if (saved) clearBookingDraft();
    }
  }

  function renderProgress(currentStep) {
    var parts = [];
    for (var i = 1; i <= 5; i++) {
      var stepClass = 'mpt-progress-step';
      if (i < currentStep) stepClass += ' is-completed';
      else if (i === currentStep) stepClass += ' is-active';
      else stepClass += ' is-upcoming';
      parts.push('<span class="' + stepClass + '" aria-hidden="true"></span>');
      if (i < 5) {
        var lineClass = 'mpt-progress-line' + (i < currentStep ? ' is-completed' : '');
        parts.push('<span class="' + lineClass + '" aria-hidden="true"></span>');
      }
    }
    return ''
      + '<div class="mpt-progress" role="progressbar" aria-valuemin="1" aria-valuemax="5" aria-valuenow="' + currentStep + '">'
      + parts.join('')
      + '</div>'
      + '<p class="mpt-step-label">' + STEP_LABELS[currentStep - 1] + '</p>';
  }

  function renderDayCell(date, displayDay, col, isSpillover, startKey, endKey, minDate, todayKey) {
    var key = dateKey(date);
    // lead-time disabled state only applies to in-month cells; spillover is
    // already non-interactive via its own class (no click handler, no hover)
    var disabled = !isSpillover && date < minDate;
    var isStart = (key === startKey);
    var isEnd = (key === endKey);
    var isNight = (startKey && endKey && !isStart && !isEnd && key > startKey && key < endKey);
    var inRange = isStart || isEnd || isNight;

    var classes = ['mpt-cal-day'];
    if (isSpillover) classes.push('is-spillover');
    if (disabled) classes.push('is-disabled');
    if (!isSpillover && key === todayKey) classes.push('is-today');
    if (isStart) classes.push('is-start');
    if (isEnd) classes.push('is-end');
    if (isNight) classes.push('is-night');
    if (inRange) {
      // pill caps: actual start/end close the pill; row-edges (col 0 / col 6)
      // close it on wrap. Month edges no longer need a special rule because
      // spillover always fills the grid, so the pill continues across.
      if (isStart || col === 0) classes.push('range-left');
      if (isEnd || col === 6) classes.push('range-right');
    }

    var inner = ''
      + '<span class="mpt-cal-day-fill"></span>'
      + '<span class="mpt-cal-day-num">' + displayDay + '</span>';

    if (isSpillover) {
      return '<span class="' + classes.join(' ') + '" aria-hidden="true">' + inner + '</span>';
    }

    var label = formatDateLong(date);
    var attrs = disabled
      ? 'disabled aria-disabled="true" aria-label="' + label + ', not selectable"'
      : 'data-cal-day="' + key + '" aria-label="' + label + '"';
    return '<button type="button" class="' + classes.join(' ') + '" ' + attrs + '>' + inner + '</button>';
  }

  function renderCalendar(year, month, startKey, endKey, minDate, todayKey) {
    var monthLabel = MONTHS[month] + ' ' + year;
    var firstDay = new Date(year, month, 1);
    var lastDay = new Date(year, month + 1, 0);
    var firstCol = (firstDay.getDay() + 6) % 7; // Monday-first
    var totalDays = lastDay.getDate();

    // disable prev nav at the earliest-bookable month: nothing useful before it
    var viewIsEarliestMonth = (year === minDate.getFullYear() && month === minDate.getMonth());

    // previous-month tail (leading spillover)
    var prevMonth = month - 1;
    var prevYear = year;
    if (prevMonth < 0) { prevMonth = 11; prevYear -= 1; }
    var prevLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();

    // next-month lead (trailing spillover)
    var nextMonth = month + 1;
    var nextYear = year;
    if (nextMonth > 11) { nextMonth = 0; nextYear += 1; }

    var cells = [];

    for (var i = 0; i < firstCol; i++) {
      var leadDay = prevLastDay - firstCol + 1 + i;
      cells.push(renderDayCell(new Date(prevYear, prevMonth, leadDay), leadDay, i, true, startKey, endKey, minDate, todayKey));
    }

    for (var d = 1; d <= totalDays; d++) {
      var col = (firstCol + (d - 1)) % 7; // 0 = Mon, 6 = Sun
      cells.push(renderDayCell(new Date(year, month, d), d, col, false, startKey, endKey, minDate, todayKey));
    }

    var trailStartCol = (firstCol + totalDays) % 7;
    if (trailStartCol !== 0) {
      var trailCount = 7 - trailStartCol;
      for (var t = 1; t <= trailCount; t++) {
        var trailCol = (trailStartCol + (t - 1)) % 7;
        cells.push(renderDayCell(new Date(nextYear, nextMonth, t), t, trailCol, true, startKey, endKey, minDate, todayKey));
      }
    }

    var dowRow = DOW_LABELS.map(function (l) {
      return '<span class="mpt-cal-dow" aria-hidden="true">' + l + '</span>';
    }).join('');

    return ''
      + '<div class="mpt-cal">'
      + '  <div class="mpt-cal-head">'
      + '    <button type="button" class="mpt-cal-nav" data-cal-nav="-1" aria-label="Previous month"' + (viewIsEarliestMonth ? ' disabled' : '') + '>'
      + '      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + '    </button>'
      + '    <span class="mpt-cal-month">' + monthLabel + '</span>'
      + '    <button type="button" class="mpt-cal-nav" data-cal-nav="1" aria-label="Next month">'
      + '      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + '    </button>'
      + '  </div>'
      + '  <div class="mpt-cal-grid">' + dowRow + cells.join('') + '</div>'
      + '</div>';
  }

  function renderBookingStep1(ctx) {
    var minDate = startOfDay(addDays(new Date(), BOOKING_LEAD_DAYS));
    var todayKey = dateKey(startOfDay(new Date()));
    var subDest = ctx && ctx.title ? ctx.title : 'your destination';

    var info = '';
    if (booking.startDate) {
      var sd = dateFromKey(booking.startDate);
      var ed = booking.endDate ? dateFromKey(booking.endDate) : null;
      info = ''
        + '<div class="mpt-cal-info">'
        + '  <p class="mpt-cal-info-start">Start: ' + formatDateLong(sd) + '</p>'
        + (ed ? '  <p class="mpt-cal-info-end">End: ' + formatDateLong(ed) + '</p>' : '')
        + '</div>';
    }

    var nextDisabled = !booking.startDate;

    return ''
      + '<h3 class="mpt-step-heading">Choose your start date.</h3>'
      + '<p class="mpt-step-sub">Earliest start is ' + formatDateLong(minDate) + '. Trips begin on the day you arrive in ' + subDest + '.</p>'
      + renderCalendar(booking.viewYear, booking.viewMonth, booking.startDate, booking.endDate, minDate, todayKey)
      + info
      + '<div class="mpt-step-actions mpt-step-actions--solo">'
      + '  <button type="button" class="mpt-btn mpt-btn--ocean" data-booking-next="2"' + (nextDisabled ? ' disabled' : '') + '>Next</button>'
      + '</div>';
  }

  function renderBookingStep4(ctx) {
    // Brief Phase A: replaces the old in-drawer "processing" animation with a
    // brief redirect mock. The 800ms timer fires in wireBookingStep4 and
    // navigates to /booking/confirmation.html. This is production-shaped: at
    // launch, this is where the page actually leaves to Maya's hosted checkout.
    return ''
      + '<div class="mpt-step-4">'
      + '  <h3 class="mpt-step-heading">Redirecting to Maya.</h3>'
      + '  <p class="mpt-step-sub">You will be taken to a secure payment page.</p>'
      + '  <div class="mpt-spinner" aria-hidden="true"></div>'
      + '</div>'
      + '<div class="mpt-step-actions"></div>';
  }

  function renderBooking(ctx) {
    var stepBody;
    switch (booking.step) {
      case 1: stepBody = renderBookingStep1(ctx); break;
      case 2: stepBody = renderBookingStep2(ctx); break;
      case 3: stepBody = renderBookingStep3(ctx); break;
      case 4: stepBody = renderBookingStep4(ctx); break;
      default: stepBody = '';
    }
    return ''
      + '<div class="mpt-booking">'
      + renderProgress(booking.step)
      + stepBody
      + '</div>';
  }

  function rerenderBooking(ctx) {
    els.body.innerHTML = renderBooking(ctx);
    wireBooking(ctx);
  }

  function wireBookingStep1(ctx) {
    var navBtns = els.body.querySelectorAll('[data-cal-nav]');
    Array.prototype.forEach.call(navBtns, function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        var dir = parseInt(btn.getAttribute('data-cal-nav'), 10);
        booking.viewMonth += dir;
        while (booking.viewMonth < 0) { booking.viewMonth += 12; booking.viewYear -= 1; }
        while (booking.viewMonth > 11) { booking.viewMonth -= 12; booking.viewYear += 1; }
        rerenderBooking(ctx);
      });
    });

    var dayBtns = els.body.querySelectorAll('[data-cal-day]');
    Array.prototype.forEach.call(dayBtns, function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-cal-day');
        booking.startDate = key;
        var nights = parseNights(ctx && ctx.duration);
        var sd = dateFromKey(key);
        booking.endDate = nights > 0 ? dateKey(addDays(sd, nights)) : null;
        saveBookingDraft();
        rerenderBooking(ctx);
      });
    });

    var nextBtn = els.body.querySelector('[data-booking-next="2"]');
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (!booking.startDate) return;
        booking.step = 2;
        saveBookingDraft();
        rerenderBooking(ctx);
      });
    }
  }

  function renderBookingStep2(ctx) {
    var per = (ctx && ctx.pricePerPerson) || 0;
    var minTravellers = 2; // brief: floor is hard 2 regardless of ctx
    var maxTravellers = 12;
    var n = booking.travellers;
    if (n < minTravellers) n = minTravellers;
    if (n > maxTravellers) n = maxTravellers;
    var total = n * per;

    var minusDisabled = (n <= minTravellers) ? ' disabled aria-disabled="true"' : '';
    var plusDisabled = (n >= maxTravellers) ? ' disabled aria-disabled="true"' : '';

    return ''
      + '<div class="mpt-step-2">'
      + '  <h3 class="mpt-step-heading">How many travellers?</h3>'
      + '  <p class="mpt-step-sub">Including yourself. The trip is private throughout.</p>'
      + '  <div class="mpt-counter">'
      + '    <button type="button" class="mpt-counter-btn" data-counter-step="-1" aria-label="Decrease travellers"' + minusDisabled + '>−</button>'
      + '    <span class="mpt-counter-num" aria-live="polite" aria-atomic="true">' + n + '</span>'
      + '    <button type="button" class="mpt-counter-btn" data-counter-step="1" aria-label="Increase travellers"' + plusDisabled + '>+</button>'
      + '  </div>'
      + '  <div class="mpt-totals">'
      + '    <p class="mpt-totals-per">USD ' + per + ' per person</p>'
      + '    <p class="mpt-totals-total">Total: USD ' + formatPrice(total) + '</p>'
      + '  </div>'
      + '  <p class="mpt-step-bottom-note">Minimum 2 travellers. The trip remains private regardless of group size.</p>'
      + '</div>'
      + '<div class="mpt-step-actions">'
      + '  <button type="button" class="mpt-btn mpt-btn--text" data-booking-back>Back</button>'
      + '  <button type="button" class="mpt-btn mpt-btn--ocean" data-booking-next="3">Next</button>'
      + '</div>';
  }

  function wireBookingStep2(ctx) {
    var per = (ctx && ctx.pricePerPerson) || 0;
    var minTravellers = 2;
    var maxTravellers = 12;

    var counterBtns = els.body.querySelectorAll('[data-counter-step]');
    Array.prototype.forEach.call(counterBtns, function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        var delta = parseInt(btn.getAttribute('data-counter-step'), 10);
        var next = booking.travellers + delta;
        if (next < minTravellers) next = minTravellers;
        if (next > maxTravellers) next = maxTravellers;
        booking.travellers = next;
        booking.total = next * per;
        saveBookingDraft();
        rerenderBooking(ctx);
      });
    });

    var backBtn = els.body.querySelector('[data-booking-back]');
    if (backBtn) {
      backBtn.addEventListener('click', function () {
        booking.step = 1;
        saveBookingDraft();
        rerenderBooking(ctx);
      });
    }

    var nextBtn = els.body.querySelector('[data-booking-next="3"]');
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        booking.step = 3;
        saveBookingDraft();
        rerenderBooking(ctx);
      });
    }
  }

  function renderBookingStep3(ctx) {
    var per = (ctx && ctx.pricePerPerson) || 0;
    var dest = (ctx && ctx.title) || 'Your destination';
    var nights = parseNights(ctx && ctx.duration);
    var days = nights + 1;
    var n = booking.travellers;
    var total = n * per;
    var datesStr = (booking.startDate && booking.endDate) ? formatDatesRange(booking.startDate, booking.endDate) : '—';
    var name = booking.leadName || '';
    var email = booking.leadEmail || '';
    var phone = booking.leadPhone || '';
    var canPay = isValidLeadName(name) && isValidLeadEmail(email);

    return ''
      + '<div class="mpt-step-3">'
      + '  <h3 class="mpt-step-heading">Your trip.</h3>'
      + '  <div class="mpt-summary">'
      + '    <div class="mpt-summary-row"><span class="mpt-summary-label">Destination</span><span class="mpt-summary-value">' + escapeHtml(dest) + '</span></div>'
      + '    <div class="mpt-summary-row"><span class="mpt-summary-label">Length</span><span class="mpt-summary-value">' + days + ' days, ' + nights + ' nights</span></div>'
      + '    <div class="mpt-summary-row"><span class="mpt-summary-label">Dates</span><span class="mpt-summary-value">' + datesStr + '</span></div>'
      + '    <div class="mpt-summary-row"><span class="mpt-summary-label">Travellers</span><span class="mpt-summary-value">' + n + '</span></div>'
      + '    <div class="mpt-summary-row"><span class="mpt-summary-label">Price per person</span><span class="mpt-summary-value">USD ' + per + '</span></div>'
      + '    <div class="mpt-summary-divider" aria-hidden="true"></div>'
      + '    <div class="mpt-summary-total"><span class="mpt-summary-total-label">Total</span><span class="mpt-summary-total-value">USD ' + formatPrice(total) + '</span></div>'
      + '  </div>'
      + '  <div class="mpt-field">'
      + '    <label class="mpt-field-label" for="mpt-lead-name">Full name</label>'
      + '    <input class="mpt-field-input" type="text" id="mpt-lead-name" name="leadName" autocomplete="name" value="' + escapeHtml(name) + '">'
      + '  </div>'
      + '  <div class="mpt-field">'
      + '    <label class="mpt-field-label" for="mpt-lead-email">Email</label>'
      + '    <input class="mpt-field-input" type="email" id="mpt-lead-email" name="leadEmail" autocomplete="email" inputmode="email" value="' + escapeHtml(email) + '">'
      + '    <p class="mpt-field-helper">We&rsquo;ll send your booking confirmation here.</p>'
      + '  </div>'
      + '  <div class="mpt-field">'
      + '    <label class="mpt-field-label" for="mpt-lead-phone">Phone or WhatsApp</label>'
      + '    <input class="mpt-field-input" type="tel" id="mpt-lead-phone" name="leadPhone" autocomplete="tel" inputmode="tel" value="' + escapeHtml(phone) + '">'
      + '    <p class="mpt-field-helper">Optional, but useful if our operator needs to reach you urgently.</p>'
      + '  </div>'
      + '  <p class="mpt-step-body-line">Payment is taken in full upfront. Our operator confirms with you within 24 hours.</p>'
      + '  <p class="mpt-step-microtext">By paying you agree to our <a href="#" data-mpt-legal="terms">terms</a> and <a href="#" data-mpt-legal="cancellation">cancellation policy</a>.</p>'
      + '</div>'
      + '<div class="mpt-step-actions">'
      + '  <button type="button" class="mpt-btn mpt-btn--text" data-booking-back>Back</button>'
      + '  <button type="button" class="mpt-btn mpt-btn--coral" data-booking-pay' + (canPay ? '' : ' disabled aria-disabled="true"') + '>Pay USD ' + formatPrice(total) + '</button>'
      + '</div>';
  }

  function wireBookingStep3(ctx) {
    var nameInput = els.body.querySelector('#mpt-lead-name');
    var emailInput = els.body.querySelector('#mpt-lead-email');
    var phoneInput = els.body.querySelector('#mpt-lead-phone');
    var payBtn = els.body.querySelector('[data-booking-pay]');
    var backBtn = els.body.querySelector('[data-booking-back]');
    var legalLinks = els.body.querySelectorAll('[data-mpt-legal]');

    // Inputs update state + Pay button directly: a full rerender on every
    // keystroke would steal focus from the field and dismiss the keyboard
    // on mobile. Save is debounced to keep sessionStorage I/O off the
    // hot path while typing.
    var debouncedSave = debounce(saveBookingDraft, 300);

    function refreshPayState() {
      var canPay = isValidLeadName(booking.leadName) && isValidLeadEmail(booking.leadEmail);
      if (canPay) {
        payBtn.removeAttribute('disabled');
        payBtn.removeAttribute('aria-disabled');
      } else {
        payBtn.setAttribute('disabled', 'disabled');
        payBtn.setAttribute('aria-disabled', 'true');
      }
    }

    if (nameInput) {
      nameInput.addEventListener('input', function () {
        booking.leadName = nameInput.value;
        refreshPayState();
        debouncedSave();
      });
    }
    if (emailInput) {
      emailInput.addEventListener('input', function () {
        booking.leadEmail = emailInput.value;
        refreshPayState();
        debouncedSave();
      });
    }
    // Phone is optional and not in the Pay validation gate; just persist.
    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        booking.leadPhone = phoneInput.value;
        debouncedSave();
      });
    }

    // Placeholder legal anchors: prevent the # jump from messing with the
    // drawer / scroll. Real pages wire up later.
    Array.prototype.forEach.call(legalLinks, function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); });
    });

    if (payBtn) {
      payBtn.addEventListener('click', function () {
        if (payBtn.disabled) return;
        // Brief: generate the booking reference at click time, mark the draft
        // as completed, then transition to the redirecting state. The real
        // Maya flow will set completedAt on webhook confirmation, not at click,
        // but for the mockup these stand in for "submitted to payment".
        booking.reference = generateBookingReference(ctx);
        booking.completedAt = new Date().toISOString();
        booking.step = 4;
        saveBookingDraft(); // flush latest input + ref + completedAt + step in one write
        rerenderBooking(ctx);
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', function () {
        booking.step = 2;
        saveBookingDraft();
        rerenderBooking(ctx);
      });
    }
  }

  function wireBookingStep4(ctx) {
    // Cancel any prior timer (defensive: rerender within step 4 shouldn't
    // happen, but be safe).
    clearRedirectTimer();

    // MOCKUP: this navigates directly to the confirmation page.
    // AT LAUNCH: replace with a fetch to /api/maya/create-checkout,
    // then window.location = response.redirectUrl (Maya hosted page).
    // The user will return to /booking/confirmation via Maya's redirect.
    redirectTimer = setTimeout(function () {
      redirectTimer = null;
      var ref = booking.reference;
      if (!ref) return; // defensive: nothing to navigate to
      window.location.assign('/booking/confirmation.html?ref=' + encodeURIComponent(ref));
    }, 800);
  }

  function wireBooking(ctx) {
    if (booking.step === 1) wireBookingStep1(ctx);
    else if (booking.step === 2) wireBookingStep2(ctx);
    else if (booking.step === 3) wireBookingStep3(ctx);
    else if (booking.step === 4) wireBookingStep4(ctx);
  }

  // ---------- letter ----------

  // Bootstrap the mpt.event namespace if nothing else has set it up. Console
  // shim only; real analytics implementation swaps this at launch.
  if (typeof window.mpt !== 'object' || window.mpt === null) window.mpt = {};
  if (typeof window.mpt.event !== 'function') {
    window.mpt.event = function (name, data) {
      console.log('[MPT event]', name, data || {});
    };
  }

  var letter = {
    sent: false,
    submitting: false,
    name: '',
    email: '',
    body: ''
  };

  function resetLetter() {
    letter.sent = false;
    letter.submitting = false;
    letter.name = '';
    letter.email = '';
    letter.body = '';
  }

  function isValidLetterEmail(s) {
    // Brief: basic check, not aggressive. @ and . both present.
    if (typeof s !== 'string') return false;
    var t = s.trim();
    return t.indexOf('@') !== -1 && t.indexOf('.') !== -1;
  }

  function renderLetterForm(ctx) {
    var hasCtx = !!ctx;
    var bodyPlaceholder = hasCtx
      ? 'I’ve been thinking about ' + ctx.title + '…'
      : 'Write to us…';
    return ''
      + '<div class="mpt-letter">'
      + '  <p class="mpt-letter-intro">Tell us what you’re thinking about. There’s no form to fill in. Just write. We read every letter ourselves and write back within a working day, usually less.</p>'
      + '  <div class="mpt-letter-body-wrap">'
      + '    <textarea class="mpt-letter-textarea" id="mpt-letter-body" name="letter" aria-label="Your letter" placeholder="' + escapeHtml(bodyPlaceholder) + '">' + escapeHtml(letter.body) + '</textarea>'
      + '    <p class="mpt-field-error" id="mpt-letter-body-error" role="alert"></p>'
      + '  </div>'
      + '  <div class="mpt-field">'
      + '    <label class="mpt-field-label" for="mpt-letter-name">Your name</label>'
      + '    <input class="mpt-field-input" type="text" id="mpt-letter-name" name="name" autocomplete="name" value="' + escapeHtml(letter.name) + '">'
      + '    <p class="mpt-field-error" id="mpt-letter-name-error" role="alert"></p>'
      + '  </div>'
      + '  <div class="mpt-field">'
      + '    <label class="mpt-field-label" for="mpt-letter-email">Email</label>'
      + '    <input class="mpt-field-input" type="email" id="mpt-letter-email" name="email" autocomplete="email" inputmode="email" value="' + escapeHtml(letter.email) + '">'
      + '    <p class="mpt-field-error" id="mpt-letter-email-error" role="alert"></p>'
      + '  </div>'
      + '  <button type="button" class="mpt-letter-send" id="mpt-letter-send">Send your letter</button>'
      + '  <p class="mpt-letter-footer-note">We don’t share your details with anyone. We just want to write back.</p>'
      + '</div>';
  }

  function renderLetterConfirmation(/* ctx */) {
    return ''
      + '<div class="mpt-letter-confirm">'
      + '  <p class="mpt-letter-confirm-body">Thank you for writing. Your letter is with us. We’ll write back within a working day, usually less.</p>'
      + '  <p class="mpt-letter-confirm-signature">— The writer</p>'
      + '  <button type="button" class="mpt-letter-confirm-close" id="mpt-letter-close">Close this letter</button>'
      + '</div>';
  }

  function renderLetter(ctx) {
    return letter.sent ? renderLetterConfirmation(ctx) : renderLetterForm(ctx);
  }

  function rerenderLetter(ctx) {
    els.body.innerHTML = renderLetter(ctx);
    wireLetter(ctx);
  }

  function wireLetterForm(ctx) {
    var nameInput = els.body.querySelector('#mpt-letter-name');
    var emailInput = els.body.querySelector('#mpt-letter-email');
    var bodyInput = els.body.querySelector('#mpt-letter-body');
    var sendBtn = els.body.querySelector('#mpt-letter-send');
    var nameErr = els.body.querySelector('#mpt-letter-name-error');
    var emailErr = els.body.querySelector('#mpt-letter-email-error');
    var bodyErr = els.body.querySelector('#mpt-letter-body-error');

    function clearError(el) { if (el) el.textContent = ''; }

    if (nameInput) {
      nameInput.addEventListener('input', function () {
        letter.name = nameInput.value;
        clearError(nameErr);
      });
    }
    if (emailInput) {
      emailInput.addEventListener('input', function () {
        letter.email = emailInput.value;
        clearError(emailErr);
      });
    }
    if (bodyInput) {
      bodyInput.addEventListener('input', function () {
        letter.body = bodyInput.value;
        clearError(bodyErr);
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', function () {
        if (sendBtn.disabled) return;

        // Validate. Inline errors via direct DOM updates so focus on the
        // current field is preserved (no full re-render at this stage).
        clearError(nameErr); clearError(emailErr); clearError(bodyErr);
        var firstInvalid = null;
        if (!letter.body || !letter.body.trim()) {
          bodyErr.textContent = 'Please write something before sending';
          firstInvalid = firstInvalid || bodyInput;
        }
        if (!letter.name || !letter.name.trim()) {
          nameErr.textContent = 'Please add your name';
          firstInvalid = firstInvalid || nameInput;
        }
        if (!isValidLetterEmail(letter.email)) {
          emailErr.textContent = 'Please add a valid email';
          firstInvalid = firstInvalid || emailInput;
        }
        if (firstInvalid) {
          firstInvalid.focus();
          return;
        }

        // Disable form fields during submit so user can't change anything mid-flight
        letter.submitting = true;
        nameInput.disabled = true;
        emailInput.disabled = true;
        bodyInput.disabled = true;
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending…';

        var payload = {
          name: letter.name.trim(),
          email: letter.email.trim(),
          letter: letter.body.trim(),
          destination: (ctx && ctx.slug) || null,
          destination_title: (ctx && ctx.title) || null,
          destination_duration: (ctx && ctx.duration) || null,
          source_page: window.location.pathname,
          submitted_at: new Date().toISOString()
        };

        // MOCKUP: this fires a fetch to /api/letter so the POST is visible
        // in the network tab. There's no static endpoint at that path, so
        // the request will 404. AT LAUNCH: this becomes a POST to the GHL
        // contacts endpoint with the tags ('enquiry-letter' always, plus
        // 'destination:<slug>' if present) and the letter body in the
        // contact's notes field.
        try {
          fetch('/api/letter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(function () { /* ignore — no backend in mockup */ });
        } catch (e) { /* ignore */ }

        console.log('[MPT] Letter submitted:', JSON.stringify(payload, null, 2));
        window.mpt.event('letter_submitted', {
          destination: payload.destination,
          has_destination_context: !!ctx
        });

        // Brief sending feel, then transition to confirmation inside the
        // same drawer. No page navigation.
        setTimeout(function () {
          letter.sent = true;
          letter.submitting = false;
          rerenderLetter(ctx);
        }, 600);
      });
    }
  }

  function wireLetterConfirmation(/* ctx */) {
    var closeBtn = els.body.querySelector('#mpt-letter-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () { close(); });
    }
  }

  function wireLetter(ctx) {
    if (letter.sent) wireLetterConfirmation(ctx);
    else wireLetterForm(ctx);
  }

  // ---------- bodies ----------

  function renderDoors(ctx) {
    var hasCtx = !!ctx;
    var convoCopy = hasCtx
      ? 'Ask anything about your ' + ctx.title + ' trip. We’ll get back to you quickly.'
      : 'Ask anything about a trip. We’ll get back to you quickly.';
    var letterCopy = 'Tell us the shape of your trip and we’ll write back within a day.';
    return ''
      + '<div class="mpt-doors">'
      + '  <article class="mpt-door">'
      + '    <span class="mpt-door-eyebrow ocean">Answer now</span>'
      + '    <h3 class="mpt-door-title">Start a conversation</h3>'
      + '    <p class="mpt-door-copy">' + convoCopy + '</p>'
      + '    <button type="button" class="mpt-door-btn ocean" data-mpt-door="aichat">Start a conversation</button>'
      + '  </article>'
      + '  <article class="mpt-door">'
      + '    <span class="mpt-door-eyebrow coral">Not ready yet</span>'
      + '    <h3 class="mpt-door-title">Write us a letter</h3>'
      + '    <p class="mpt-door-copy">' + letterCopy + '</p>'
      + '    <button type="button" class="mpt-door-btn coral" data-mpt-door="letter">Write us a letter</button>'
      + '  </article>'
      + '</div>';
  }

  function renderPlaceholder(label, phaseLabel) {
    return ''
      + '<div class="mpt-placeholder">'
      + '  <p><b>' + label + '</b> body</p>'
      + '  <p>Built in ' + phaseLabel + '.</p>'
      + '</div>';
  }

  function renderBody(mode, ctx) {
    if (mode === 'doors') return renderDoors(ctx);
    if (mode === 'aichat') return renderPlaceholder('aichat', 'Phase 3');
    if (mode === 'letter') return renderLetter(ctx);
    if (mode === 'booking') return renderBooking(ctx);
    return '';
  }

  function wireBody() {
    var doorBtns = els.body.querySelectorAll('[data-mpt-door]');
    Array.prototype.forEach.call(doorBtns, function (btn) {
      btn.addEventListener('click', function () {
        var nextMode = btn.getAttribute('data-mpt-door');
        setMode(nextMode, { from: 'doors' });
      });
    });
    if (state.mode === 'booking') wireBooking(state.context);
    else if (state.mode === 'letter') wireLetter(state.context);
  }

  // ---------- mode switching ----------

  function setMode(mode, options) {
    options = options || {};
    if (options.from === 'doors') {
      state.fromMode = 'doors';
    } else if (options.from === null) {
      state.fromMode = null;
    }

    // Always reset the letter form when entering letter mode (direct open
    // from a trigger, doors -> letter, or any future entry path). The brief
    // explicitly accepts losing in-progress text for v1.
    if (mode === 'letter') resetLetter();

    if (state.mode && state.open) {
      // crossfade
      els.body.classList.add('is-fading');
      setTimeout(function () {
        state.mode = mode;
        renderHeader(mode, state.context);
        els.body.innerHTML = renderBody(mode, state.context);
        wireBody();
        els.body.classList.remove('is-fading');
      }, FADE_MS);
    } else {
      state.mode = mode;
      renderHeader(mode, state.context);
      els.body.innerHTML = renderBody(mode, state.context);
      wireBody();
    }
  }

  // ---------- open / close ----------

  function open(mode, ctxOverride) {
    if (state.open) {
      // already open — just switch modes (treated as direct entry)
      state.context = ctxOverride !== undefined ? ctxOverride : readContextFromPage();
      state.fromMode = null;
      if (mode === 'booking') resetBooking(state.context);
      setMode(mode, { from: null });
      return;
    }
    state.lastFocus = document.activeElement;
    state.context = ctxOverride !== undefined ? ctxOverride : readContextFromPage();
    state.fromMode = null;
    if (mode === 'booking') resetBooking(state.context);

    state.mode = null; // force non-crossfade first render
    setMode(mode);

    els.drawer.classList.add('is-open');
    els.backdrop.classList.add('is-open');
    els.drawer.setAttribute('aria-hidden', 'false');
    els.backdrop.setAttribute('aria-hidden', 'false');
    state.open = true;
    lockScroll();

    // focus the close button so screen readers announce the dialog
    setTimeout(function () { els.close.focus(); }, SLIDE_MS);
  }

  function close() {
    if (!state.open) return;
    // If the user closes during the step 4 redirect mock (within the 800ms
    // window), abort the navigation. Their state remains in sessionStorage.
    clearRedirectTimer();
    els.drawer.classList.remove('is-open');
    els.backdrop.classList.remove('is-open');
    els.drawer.setAttribute('aria-hidden', 'true');
    els.backdrop.setAttribute('aria-hidden', 'true');
    state.open = false;
    state.fromMode = null;
    unlockScroll();
    if (state.lastFocus && typeof state.lastFocus.focus === 'function') {
      state.lastFocus.focus();
    }
  }

  // ---------- mount ----------

  function mount() {
    if (els) return;

    var styleTag = document.createElement('style');
    styleTag.setAttribute('data-mpt-drawer', '');
    styleTag.textContent = STYLE;
    document.head.appendChild(styleTag);

    var backdrop = document.createElement('div');
    backdrop.className = 'mpt-drawer-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');

    var drawer = document.createElement('aside');
    drawer.className = 'mpt-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-labelledby', 'mpt-drawer-title');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = ''
      + '<button type="button" class="mpt-drawer-back" aria-label="Back to options">'
      + '  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + '  <span>Back to options</span>'
      + '</button>'
      + '<button type="button" class="mpt-drawer-close" aria-label="Close">'
      + '  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6l-12 12" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      + '</button>'
      + '<header class="mpt-drawer-head">'
      + '  <span class="mpt-drawer-eyebrow"></span>'
      + '  <h2 class="mpt-drawer-title" id="mpt-drawer-title"></h2>'
      + '  <p class="mpt-drawer-sub"></p>'
      + '</header>'
      + '<div class="mpt-drawer-body"></div>';

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    els = {
      backdrop: backdrop,
      drawer: drawer,
      back: drawer.querySelector('.mpt-drawer-back'),
      close: drawer.querySelector('.mpt-drawer-close'),
      eyebrow: drawer.querySelector('.mpt-drawer-eyebrow'),
      title: drawer.querySelector('.mpt-drawer-title'),
      sub: drawer.querySelector('.mpt-drawer-sub'),
      body: drawer.querySelector('.mpt-drawer-body')
    };

    // events
    backdrop.addEventListener('click', close);
    els.close.addEventListener('click', close);
    els.back.addEventListener('click', function () {
      setMode('doors', { from: null });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.open) close();
    });

    // focus trap
    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });

    // auto-wire triggers
    var triggers = document.querySelectorAll('[data-mpt-drawer]');
    Array.prototype.forEach.call(triggers, function (t) {
      t.addEventListener('click', function (e) {
        e.preventDefault();
        var mode = t.getAttribute('data-mpt-drawer');
        open(mode);
      });
    });
  }

  // ---------- public API ----------

  window.MPTDrawer = {
    open: function (mode, ctx) {
      if (!els) mount();
      open(mode, ctx);
    },
    close: close,
    setMode: function (mode, options) {
      if (!state.open) return;
      setMode(mode, options || {});
    }
  };

  // ---------- boot ----------

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
