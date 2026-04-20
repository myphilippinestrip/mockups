# My Philippines Trip — Project Context

*Last updated: 20 April 2026*
*This document is a handoff brief for Claude Code. Read it fully before making changes.*

---

## What this repo is

This is the `mockups` repo for **My Philippines Trip** (MPT). It holds throwaway static HTML prototypes used to iterate on design and copy before moving to the real production build (Astro + Sanity CMS) in a separate `website` repo later.

**Live preview:** https://mockups-topaz-seven.vercel.app
**Auto-deploy:** every commit to `main` triggers a Vercel deploy (free Hobby tier, because repo is public)
**Visibility:** public (private org repos require Vercel Pro; keeping this free)

---

## The brand in one paragraph

My Philippines Trip designs second, third, and fourth trips for travellers who already love the Philippines — specifically, the ~20k European warm leads who visited Palawan (El Nido/Coron) in 2023–24. The positioning is "Beyond the postcard." The job is *not* to introduce people to the Philippines; it is to introduce them to the Philippines they haven't seen yet. Editorial voice, not brochure voice. British English throughout. Fulfilled on the ground by Strikers Travel Corp.

---

## The 8 destinations (locked, April 2026)

In spine order, with the mood descriptor used as the overline:

1. **Iloilo** — Heritage — 3D2N
2. **Bohol** — Wonder — 3D2N
3. **Bacolod** — Exuberance — 3D2N
4. **Dumaguete & Siquijor** — Gentleness — 4D3N (the only 4-day bundle)
5. **Siargao** — Ease — 3D2N
6. **Coron** — Vertical — 3D2N
7. **Cebu** — Origin — 3D2N (Oslob explicitly OFF the itinerary on ethical grounds)
8. **Boracay** — Restoration — 3D2N

Prices displayed USD, settled PHP via Maya. No optionals at checkout — one trip, one price.

---

## Brand tokens (v3.0, the canonical guidelines PDF is in the project files)

### Colours
- Coral Red `#D9443C` — primary, headlines, CTAs (v3.0: 15% of canvas)
- Ocean Blue `#2E74B0` — supporting accent, links (10%)
- Palm Green `#2E8B4F` — accent (part of 5%)
- Sunset Orange `#E8883A` — accent (part of 5%)
- White `#FFFFFF` — dominant (70%)
- Ink `#1A1A1A` / `#1A1614` — body copy (never pure black)
- Cream `#FAF7F2` — secondary surface

### Typography
- **Fraunces** (display/headlines) — weights 300, 400, 500, 600
  - 300 italic in coral = brand signature, used for ledes, pull-quotes, overlays
  - 400-500 for h1/h2 and section titles
- **DM Sans** (body/UI) — weights 400, 500, 700
  - 500 uppercase with +0.14-0.22em tracking for labels/eyebrows/kickers

### Voice rules
- British English (colour, travellers, centre, favourite, realise)
- Editorial, considered, specific, honest — not breezy, not in a rush
- **Banned words:** paradise, breathtaking, hidden gem, stunning, must-see, bucket list, off the beaten path, tropical heaven, pristine, unspoilt, idyllic, picturesque, dreamy, magical, world-class, Instagrammable, wanderlust, jet-setter, once-in-a-lifetime, unforgettable, amazing, awesome, epic, dive into, immerse yourself, embark on, discover (as verb for the reader)
- **Assume the reader has been to the Philippines** — do NOT introduce the country; widen it
- Oxford comma: yes
- Em-dashes: sparingly (2 per 1000 words is a lot)

### Rules locked April 2026 (v3.0 updates)
- **No "Since [year]"** in footer — stripped
- **No "welcome back"** language
- **Testimonials** only from Strikers-fulfilled trips post-reactivation (historical Tao-era testimonials off-limits)
- **Strikers visibility** limited to footer + terms + enquire confirmation only, NOT hero/About/campaigns
- **Marinel Javier** named as fulfilment sign-off

---

## Current state of the prototype

### Files in this repo
- `index.html` — homepage prototype (the horizontal scroll gallery version is the latest)
- `logo-white.png` — reversed-white logo for dark/image overlays (hero, etc.)
- `logo-colour.png` — full-colour logo for light backgrounds (scrolled nav, footer)
- `PROJECT_CONTEXT.md` — this file
- `README.md` — GitHub default

### Homepage structure (current)
1. **Top nav** — transparent on hero, white+blur on scroll (`.scrolled` class via JS)
2. **Hero** — full-bleed image, dark gradient overlay, bottom-aligned content: overline + italic headline + lede
3. **Editorial opener** — section label + Fraunces prose with coral italic emphasis + signature
4. **Destinations** — horizontal scroll gallery on mobile (82vw cards, snap-scrolling, peek on right), 4-col grid on desktop. Progress indicator (8 dots + "01 / 08" counter) visible on mobile only
5. **Interstitial pull quote** — ink background with subtle coral/ocean radial gradients
6. **Journal** — 3 preview cards with images (Places/People/Practical pillars)
7. **Newsletter signup** — cream background, "The Saturday Dispatch"
8. **Footer** — 4 columns, logo, Strikers fulfilment line
9. **Bottom sticky mobile nav** — 4 items with SVG icons

### What's approved vs. what isn't
- ✅ Overall editorial magazine aesthetic (image-heavy hero, transparent-to-opaque nav)
- ✅ Logo placement (small, alongside wordmark)
- ✅ Horizontal scroll gallery for destinations on mobile
- ✅ The 8 destinations with Heritage/Wonder/Exuberance/Gentleness/Ease/Vertical/Origin/Restoration overlines
- ✅ Voice and copy tone in destination blurbs
- ⏳ Images are Unsplash placeholders — some still feel generic tropical rather than specifically Filipino. Must replace with proper Adobe Stock (per v3.0 visual direction — "no photographs that could be taken in Thailand, Indonesia, or Mexico")
- ⏳ Hero image is placeholder — needs a proper ground-level, specifically-Filipino replacement
- ⏳ Enquire flow ("Start a letter" drawer) not yet built — currently just a link with `#enquire` anchor

---

## What's next (the build order)

### Pages remaining in the MVP
Priority order:

1. **Destination index page** — the 8 destinations as magazine chapters, each clickable to its detail page
2. **Single destination page** — template used for all 8. Iloilo is the first to build (Heritage is the most editorially rich spine descriptor)
3. **Start a letter flow** — drawer pattern: "Start a conversation" (GHL Conversational AI) + "Write a letter" (4-step form). Feeds GHL pipeline.
4. **Checkout / booking confirmation** — Maya handoff, "one trip, one price" moment
5. Journal index + single journal post (template)
6. About
7. Legal pages (terms, privacy, cancellation)

### After MVP mockups are approved
Move from this throwaway `mockups` repo to a real **`website` repo** (private, needs Vercel Pro when we reach this stage) running:
- Astro + Sanity CMS
- Beehiiv for Saturday Dispatch (moved off GHL Mailgun)
- Cloudflare DNS
- Plausible or Fathom analytics (NOT GA4)
- Pagefind for on-site search
- GoHighLevel kept only for CRM + Conversational AI enquire widget

---

## Tech stack reference (for the real site, not this prototype)

Already in place or planned:
- **GoHighLevel** — CRM, Conversational AI enquire widget, Google Workspace (info@myphilippinestrip.com)
- **Smartlead.ai Pro** — cold reactivation of the ~23k warm list, partner outreach
- **Beehiiv** — Saturday Dispatch (replacing GHL Mailgun for deliverability)
- **Pabbly** — cross-tool sync
- **OpenClaw Mac Mini M2** — IG/FB browser via real sessions, Gateway + WhatsApp
- **OpenClaw AWS Lightsail 64GB** — GHL API/MCP sub-agents, Discord control
- **Maya** — payment gateway, USD display / PHP settle
- **LinqBlue** — iMessage, 50/day cap
- **MyCRMSIM** — WhatsApp

---

## Working notes for Claude Code

### How to edit this repo
Standard git flow:
```
git status
git add .
git commit -m "descriptive message"
git push origin main
```

Vercel will auto-deploy on push. Check the live site at https://mockups-topaz-seven.vercel.app to verify changes rendered correctly.

### Style conventions in this HTML
- Inline `<style>` block in `<head>` — NOT external CSS files (keeps prototype single-file-portable)
- CSS variables at `:root` for all brand tokens
- British English in all copy and metadata (including alt text)
- No framework dependencies — pure HTML/CSS/JS
- JavaScript at end of body, no external dependencies
- Images: prefer proper `alt=""` (empty) for decorative, descriptive for content images

### Things NOT to change without asking
- The 8 destinations or their mood overlines (locked April 2026)
- Brand colour hex values (v3.0 canonical)
- Removal of "Since 2023" / "Welcome back" language
- "Start a letter" (not "Enquire")
- Strikers Travel Corp visibility rules (footer only)

### Things safe to iterate on
- Layout, typography sizing, spacing
- Placeholder image URLs (all still Unsplash, flagged for Adobe Stock replacement)
- Copy tweaks (within voice rules above)
- Animation, hover states, interaction details
- Mobile/desktop responsive breakpoints

---

## Open questions / decisions pending

1. Hero image — needs a specifically-Filipino ground-level replacement (currently a placeholder that leans generic-tropical)
2. Real Adobe Stock sourcing workflow — not yet triggered; still on placeholders
3. "Start a letter" drawer interaction — whether to build it in the prototype or wait until the Astro build
4. Whether to set up a second `preview` or `prototype` Vercel subdomain for approvals, separate from the `mockups-topaz-seven` URL

---

*End of project context.*
