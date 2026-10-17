# kyse — Nurture-style 3D pixel portfolio · Design

Date: 2026-10-16
Status: draft for approval

## Intent

A personal portfolio site for **kyse**, a software engineer with a creative streak. The audience is **friends**, not recruiters, so it should feel like a small, warm place to wander through rather than a résumé.

The vibe is Porter Robinson's **Nurture** era: warm, hopeful, sunlit, open skies and grass, pastel, sincere, a little handmade. Rendered as a **cozy pixelated 3D game** (a real 3D scene drawn at low resolution and upscaled with nearest-neighbour; think *A Short Hike*).

A working throwaway spike of the scene exists at `.superpowers/brainstorm/377-1792153859/content/pixel-3d-v2.html` (plain three.js 0.160). kyse reviewed it and approved the look. Treat it as the visual reference, not as code to keep.

## Goals

- Opening the site feels like the title screen of a cozy game.
- Friends can read kyse's **bio, education, experience and achievements** easily.
- Content is easy to update without touching 3D code.
- Deploys on Vercel.

## Non-goals (for v1)

- Competition certificates (planned later, not in v1).
- A separate "projects/code" section. Projects go inside experience/achievement entries.
- CMS, blog, contact forms, analytics.
- Hosting any audio files.

## Anti-goals (failure even if it "works")

- Feels corporate, slick or like a generic portfolio template.
- Smooth, high-res 3D that loses the pixel look.
- Hard to read: pixel style must not get in the way of legible text.
- Janky or unusable on a phone.
- Hosting copyrighted music.

## The experience

### 1. Title screen (scroll = 0)
- Camera looks **up at the sky**: gradient blue → pale cream at the horizon, a low-poly sun, blocky low-poly clouds drifting slowly.
- Overlay: **"hi, i'm kyse"** as a game title (Pixelify Sans, white with hard drop shadow), subtitle "i write software & make little things".
- Small HUD top-left: `♥♥♥ LV.22` (decorative).
- Blinking prompt bottom-centre: `▼ scroll to look down ▼`.
- Gentle idle camera sway.

### 2. Descent (scrolling)
- Scroll progress drives the camera smoothly (eased) from looking at the sky down to the field. Canvas is fixed; the page has a tall scroll spacer (spike used 400vh).
- Scene: low-poly flat-shaded rolling hills with varied green vertex colours, trees (icosahedron canopies; ~20% cherry-blossom pink), scattered pink/white/yellow flowers, fog towards the horizon.
- Title fades out early in the scroll.

### 3. The notebook (scroll = end)
- Camera settles above an **open notebook lying in the grass** (pink covers, cream pages, a few polaroids on the pages).
- A game-style menu appears with four sections: **bio · education · experience · organization · projects · achievement**. The selected item is marked with `▶`.

### 4. Opening a section *(builder's/Claude's call, agreed in principle)*
- Choosing a section moves the camera in closer to the notebook. The section's content appears **on the notebook page** in pixel fonts. The 3D scene stays visible; no modal window.
- Each section is a **simple list** of entries for v1.
- There must be a clear way back to the menu (click/tap the menu again or a `◀ back` item; Esc on desktop).
- *(Claude's call)* **Scrolling once at the notebook:**
  - With no section open, scrolling up reverses the descent and lifts the camera back toward the sky, as in the spike.
  - With a section open, page scroll is locked so the camera doesn't move. Long lists scroll **inside the notebook page area** (a scrollable region styled like the page, with a pixel scrollbar). Wheel and touch scrolling go to the list.
  - Closing the section unlocks page scroll.
  - No page-flipping in v1.
  - The no-WebGL fallback is a normal scrolling page, so none of this applies there.
- *(Claude's call)* The **polaroids are decorative** colour blocks or pixel art inside the 3D scene, not real photos. Supporting real photos is a later option.
- How the text is put "on the page" (HTML overlay positioned over the notebook vs. text rendered into the 3D scene) is the builder's call. Legibility and accessibility come first, so an HTML overlay is preferred.

### Music
- A small **pixel-art radio/cassette player** in a corner wraps an **official Spotify embed** of *Get Your Wish* (Porter Robinson, *Nurture*). The builder looks up the track's Spotify URL.
- It plays only on user interaction (browser autoplay rules). No audio is hosted on the site.
- Known and accepted: visitors not logged in to Spotify hear a ~30-second preview.
- *(Updated 2026-10-16, at kyse's request)* The site opens on a **▶ press start** gate. Pressing it opens the radio and uses Spotify's official iFrame API to call `play()` once the player is ready, so the song starts on that first click. The embed stays visible, and Spotify's own controls stay in charge after that. If the API script is blocked or times out (8s), the plain embed is used and the visitor presses Spotify's play button themselves.
- *(Claude's call)* The Spotify embed stays **visible**, never hidden or replaced by custom buttons. This keeps within Spotify's embed terms and avoids an extra script. Closed, the corner shows only a small pixel radio icon. Clicking it opens a small cream pixel-framed panel with the real compact Spotify embed inside, which starts playing from there. Clicking the radio again collapses the panel. Spotify's player keeps playing while collapsed if the iframe stays mounted, so keep it mounted once opened. On mobile the panel opens above the radio icon at full width minus the gutters.

## Visual system

- **Pixelation:** render at `viewport / PIXEL_SIZE` with `image-rendering: pixelated`. Default pixel size **5** on desktop, a bit smaller (e.g. 3–4) on mobile. Make it a single constant. No antialiasing.
- **Palette:** sky blues (`#3f8fd8` → `#8ccaf4` → `#cfeafc` → `#fff1d6`), grass greens (`#6fbf5e`, `#8fd17a`, `#a6de8f`), pink accent (`#e8828f`, `#ffb3c8`), cream paper (`#fbf7ee`), brown ink (`#5b4632`), deep blue text shadow (`#2f5b7d` / `#3d6f94`).
- **Fonts:** Pixelify Sans (titles, menu), VT323 (body/list text). Google Fonts via `next/font`.
- **UI chrome:** cream boxes, 3px brown borders, hard offset shadows.

## Content

- All text content lives in **one file**, `content.json` (or a typed `content.ts`; builder's call), with `bio` and lists for `education`, `experience` and `achievement`.
- Entry shape is up to the builder. Suggested minimum: title, organisation/place, date or date range, short description, optional link.
- Use **placeholder entries** until kyse supplies real content.
- Structure entries so a `certificate` field (image/link) can be added to achievements later without a redesign.

## Tech (decided by kyse)

- **Next.js** (App Router) + **TypeScript**, deployed on **Vercel**. This was kyse's explicit choice.
- **3D:** react-three-fiber (+ drei where helpful). This was Claude's call, because it follows from choosing Next.js. The scene is client-only (`"use client"` / dynamic import, no SSR for the canvas).

## Robustness *(Claude's calls)*

- **Mobile:** must work. Touch scroll drives the camera the same way. Lower pixel size and fewer trees/flowers for performance. Tap targets ≥ 44px.
- **No-WebGL / reduced capability fallback:** a flat pixel-art page (sky + grass background in CSS) with the same four lists, fully readable.
- **`prefers-reduced-motion`:** skip the camera descent animation (jump straight to the notebook) and stop the cloud drift and idle sway.
- **Readability:** list content is real HTML text that can be selected and read by screen readers.

## Left to the builder

- Project structure, component breakdown, state management.
- Exact camera path, easing, scroll length.
- Scene composition details (counts, placement, seeding so the layout is stable between visits).
- How the section text attaches visually to the notebook.
- The radio widget's exact art and placement.
- Testing approach.

## Open for later (not v1)

- Competition certificates.
- Real content from kyse.
- Custom domain.
