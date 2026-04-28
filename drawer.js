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
    '  padding: 8px 24px 24px;',
    '  overflow-y: auto;',
    '  flex: 1;',
    '  opacity: 1;',
    '  transition: opacity ' + FADE_MS + 'ms ease-out;',
    '}',
    '.mpt-drawer-body.is-fading { opacity: 0; }',

    /* doors */
    '.mpt-doors { display: flex; flex-direction: column; gap: 16px; }',
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
    '  padding: 40px 0;',
    '  text-align: center;',
    '  color: rgba(26,26,26,0.6);',
    '  font-size: 14px;',
    '}',
    '.mpt-placeholder b { color: #1A1A1A; font-weight: 500; }',

    '@media (prefers-reduced-motion: reduce) {',
    '  .mpt-drawer, .mpt-drawer-backdrop, .mpt-drawer-body { transition: none !important; }',
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
      return { title: 'Write a letter', sub: null };
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
      + '    <h3 class="mpt-door-title">Write a letter</h3>'
      + '    <p class="mpt-door-copy">' + letterCopy + '</p>'
      + '    <button type="button" class="mpt-door-btn coral" data-mpt-door="letter">Write a letter</button>'
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
    if (mode === 'letter') return renderPlaceholder('letter', 'Phase 3');
    if (mode === 'booking') return renderPlaceholder('booking', 'Phase 4');
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
  }

  // ---------- mode switching ----------

  function setMode(mode, options) {
    options = options || {};
    if (options.from === 'doors') {
      state.fromMode = 'doors';
    } else if (options.from === null) {
      state.fromMode = null;
    }

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
      setMode(mode, { from: null });
      return;
    }
    state.lastFocus = document.activeElement;
    state.context = ctxOverride !== undefined ? ctxOverride : readContextFromPage();
    state.fromMode = null;

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
