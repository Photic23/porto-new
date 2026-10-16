# kyse Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build kyse's Nurture-style pixelated 3D portfolio. The visitor scrolls from a sky "title screen" down to a notebook in the grass that holds bio, education, experience and competition lists.

**Architecture:** A Next.js App Router single page. One client-only react-three-fiber `<Canvas>` is fixed full-screen and rendered at `1/PIXEL_SIZE` resolution with nearest-neighbour upscaling. Page scroll maps to a 0–1 progress value, and pure functions turn that into the camera pose. HTML overlays handle all text (title, menu, section lists, radio) so it stays legible and accessible. Content lives in one typed `content.ts`. If the device has no WebGL, the page renders a flat CSS fallback with the same lists.

**Tech Stack:** Next.js 15 (App Router) + React 19 + TypeScript, three, @react-three/fiber v9, @react-three/drei, Vitest + @testing-library/react + jsdom, `next/font/google` (Pixelify Sans, VT323). Deployed on Vercel.

**Spec:** `docs/superpowers/specs/2026-10-16-kyse-portfolio-design.md`. The spike `.superpowers/brainstorm/377-1792153859/content/pixel-3d-v2.html` is the visual reference for scene composition, colours and camera path. Port its numbers rather than reinventing them.

## Global Constraints

- Name/copy: title `hi, i'm kyse`; subtitle `i write software & make little things`; HUD `♥♥♥ LV.22`; prompt `▼ scroll to look down ▼`.
- Sections, in this order, with these labels: `bio`, `education`, `experience`, `competition`. Selected item is prefixed with `▶`.
- Pixel size: `5` on desktop, `3` on mobile (viewport width < 768px). Antialiasing off. Canvas CSS `image-rendering: pixelated`.
- Palette tokens (CSS vars in `globals.css`): sky `#3f8fd8 #8ccaf4 #cfeafc #fff1d6`; grass `#6fbf5e #8fd17a #a6de8f`; pink `#e8828f #ffb3c8`; paper `#fbf7ee`; ink `#5b4632`; shadow `#2f5b7d #3d6f94`.
- Fonts: Pixelify Sans for titles and menu, VT323 for body and lists.
- UI chrome: cream boxes, 3px `#5b4632` borders, hard offset shadow `4px 4px 0 rgba(0,0,0,.25)`.
- No audio files in the repo. Music only through the visible official Spotify embed of *Get Your Wish* (Porter Robinson).
- All section text is real DOM text. Never render it into the canvas.
- Tap targets ≥ 44px. Works at 360px width with a 16px side gutter and no horizontal scroll.
- `prefers-reduced-motion: reduce`: no descent animation (show the notebook state directly), no cloud drift, no idle sway.
- `.superpowers/` in `.gitignore`.

## Review Focus

- **Window resize / phone rotation mid-scroll.** The canvas buffer and camera aspect update, the pixel size re-evaluates across the 768px boundary, and nothing stretches. → test in Task 4.
- **Long section (e.g. 20 experience entries, or an entry with a 500-char description) on a 360px phone.** The list scrolls inside the notebook page, page scroll stays locked, and nothing overflows the viewport. → test in Task 5.
- **Empty section (`education: []`).** Shows `nothing here yet ✿` instead of a blank page or a crash. → test in Task 5.
- **Reload partway down the page** (browser restores `scrollY`). The camera starts at the matching progress, not at the sky. → test in Task 2 (progress from initial scroll) and wiring in Task 8.
- **Spotify iframe blocked** (ad-blocker or offline). The radio panel still opens and shows a plain `listen on spotify ↗` link. → test in Task 6.

---

### Task 1: Scaffold project and typed content

**Files:**
- Create: Next.js app at repo root (`package.json`, `next.config.ts`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`), `vitest.config.ts`, `vitest.setup.ts`, `.gitignore`
- Create: `src/content/types.ts`, `src/content/content.ts`, `src/content/sections.ts`
- Test: `src/content/content.test.ts`

**Interfaces:**
- Produces:
  ```ts
  type SectionId = 'bio' | 'education' | 'experience' | 'competition'
  interface Entry { title: string; org?: string; date?: string; description?: string; link?: string; certificate?: string }
  interface Content { name: string; tagline: string; bio: string; education: Entry[]; experience: Entry[]; competition: Entry[]; spotifyTrackUrl: string }
  const content: Content                       // src/content/content.ts
  const SECTIONS: readonly SectionId[]         // ['bio','education','experience','competition']
  function sectionEntries(c: Content, id: SectionId): Entry[]  // bio → [] (bio renders c.bio as text)
  ```

- [ ] **Step 1:** In `D:\porto02`, run `git init` and `npx create-next-app@latest . --ts --app --src-dir --eslint --no-tailwind --import-alias "@/*"` (if it refuses a non-empty dir, scaffold into a temp dir and move the files in). Add `.superpowers/` to `.gitignore`. Install `three @react-three/fiber @react-three/drei` and dev deps `vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @types/three`. Add the script `"test": "vitest run"`. Configure Vitest with the jsdom environment, the `@` alias and a setup file that imports jest-dom.
- [ ] **Step 2: Write the failing test** `src/content/content.test.ts`:
  - `SECTIONS` equals `['bio','education','experience','competition']`.
  - `content.name === 'kyse'` and `content.tagline === "i write software & make little things"`.
  - Every entry in education/experience/competition has a non-empty `title`.
  - `sectionEntries(content, 'experience')` returns `content.experience`, and `sectionEntries(content, 'bio')` returns `[]`.
  - `content.spotifyTrackUrl` matches `/^https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]+/`.
- [ ] **Step 3:** Run `npm test`. Expected: FAIL (modules missing).
- [ ] **Step 4:** Implement the types, `SECTIONS`, `sectionEntries`, and `content` with 2–3 clearly fake placeholder entries per list (e.g. `"placeholder job"`). Look up the real Spotify track URL for Porter Robinson's "Get Your Wish" and put it in `spotifyTrackUrl`.
- [ ] **Step 5:** Run `npm test` and `npm run build`. Expected: both pass.
- [ ] **Step 6: Commit** `feat: scaffold next app and typed content`.

### Task 2: Scroll progress and camera path (pure)

**Files:**
- Create: `src/scene/cameraPath.ts`
- Test: `src/scene/cameraPath.test.ts`

**Interfaces:**
- Produces:
  ```ts
  type Vec3 = [number, number, number]
  function scrollProgress(scrollY: number, maxScroll: number): number   // clamp 0..1; maxScroll<=0 → 1
  function easeInOutQuad(t: number): number
  function cameraPose(p: number, focus?: number): { position: Vec3; lookAt: Vec3 }
  const CAM = { start: {position:[0,6,14], lookAt:[0,30,-40]}, end: {position:[0,7.5,1.5], lookAt:[0,0,-6]}, focus: {position:[0,4.2,-3.2], lookAt:[0,0,-6]} }
  ```
  `focus` (0..1) blends from the `end` pose toward `CAM.focus`. It's used when a section is open.

- [ ] **Step 1: Write failing tests:**
  - `scrollProgress(0,1000)===0`, `scrollProgress(500,1000)===0.5`, `scrollProgress(2000,1000)===1`, `scrollProgress(-50,1000)===0`, `scrollProgress(0,0)===1`.
  - `easeInOutQuad(0)===0`, `easeInOutQuad(1)===1`, `easeInOutQuad(0.5)===0.5`.
  - `cameraPose(0)` deep-equals `CAM.start`, `cameraPose(1)` deep-equals `CAM.end`, and `cameraPose(1, 1)` deep-equals `CAM.focus`.
  - The y of `cameraPose(0.25).lookAt` lies strictly between the start and end lookAt y.
  - Restored scroll: `cameraPose(easeInOutQuad(scrollProgress(750,1000)))` is not equal to `CAM.start`.
- [ ] **Step 2:** Run `npx vitest run src/scene/cameraPath.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement with linear interpolation of the vectors. `cameraPose` expects already-eased `p`.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5: Commit** `feat: scroll progress and camera path`.

### Task 3: UI state (section open/close, scroll lock)

**Files:**
- Create: `src/state/uiState.ts`
- Test: `src/state/uiState.test.ts`

**Interfaces:**
- Consumes: `SectionId`, `SECTIONS` (Task 1).
- Produces:
  ```ts
  interface UIState { selected: SectionId; open: SectionId | null }
  type UIAction = { type: 'select'; id: SectionId } | { type: 'move'; dir: 1 | -1 } | { type: 'open'; id?: SectionId } | { type: 'close' }
  const initialUI: UIState                       // { selected: 'bio', open: null }
  function uiReducer(s: UIState, a: UIAction): UIState
  function useScrollLock(locked: boolean): void  // sets document.documentElement.style.overflow = 'hidden' while locked; restores on unlock/unmount
  ```

- [ ] **Step 1: Write failing tests:**
  - `move` +1 from `bio` → `education`. `move` −1 from `bio` wraps to `competition`.
  - `open` without an id opens `selected`. `open` with `{id:'competition'}` sets both `open` and `selected` to `competition`.
  - `close` sets `open` to null and leaves `selected` alone.
  - `move` while open changes nothing.
  - `useScrollLock` (via `renderHook`): `true` makes `documentElement.style.overflow === 'hidden'`. Rerendering with `false` restores the previous value. Unmounting restores it too.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5: Commit** `feat: ui state reducer and scroll lock`.

### Task 4: Pixelated 3D scene

**Files:**
- Create: `src/scene/rng.ts`, `src/scene/sceneConfig.ts`, `src/scene/terrain.ts`, `src/scene/World.tsx` (sky, sun, ground, trees, flowers, clouds, notebook as small components in one file or a `parts/` folder, builder's choice), `src/scene/SceneCanvas.tsx`
- Test: `src/scene/scene.test.ts`

**Interfaces:**
- Consumes: `cameraPose`, `easeInOutQuad` (Task 2).
- Produces:
  ```ts
  function mulberry32(seed: number): () => number               // deterministic 0..1
  type Tier = 'desktop' | 'mobile'
  function tierFor(width: number): Tier                          // < 768 → 'mobile'
  function pixelSizeFor(tier: Tier): number                      // desktop 5, mobile 3
  function sceneConfig(tier: Tier): { trees: number; flowers: number; clouds: number; groundSegments: number }
                                                                 // desktop {70,500,22,70}; mobile {30,180,12,40}
  function groundHeight(x: number, z: number): number            // spike's hAt, flattened ×0.15 within radius 10 of (0,-6)
  const NOTEBOOK_POS: [number, number, number]                   // [0, groundHeight(0,-6)+0.05, -6]
  <SceneCanvas progress: number; focus: number; reducedMotion: boolean; onContextLost: () => void />
  ```

- [ ] **Step 1: Write failing tests:**
  - `mulberry32(1)` yields the same first 5 values on two separate calls, and every value is in [0,1).
  - `tierFor(767)==='mobile'`, `tierFor(768)==='desktop'`. `pixelSizeFor` returns 5 and 3.
  - `sceneConfig('mobile').trees < sceneConfig('desktop').trees`, and the same for flowers.
  - `Math.abs(groundHeight(0,-6)) < 1` (flattened clearing) and `groundHeight(0,-6)` equals `NOTEBOOK_POS[1]-0.05`.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement the pure modules. Then `World.tsx`: port the spike's scene (sky gradient CanvasTexture background, fog `#dff0fb` 40–130, hemisphere + warm directional light, flat-shaded vertex-coloured ground, trees with ~20% `#ffb3c8` canopies kept out of radius 16 of the notebook, flowers, emissive-tinted clouds, sun, open pink notebook with three decorative polaroids). Place everything with `mulberry32(seed)` so the layout is the same on every visit. Clouds drift and the camera sways only when `!reducedMotion`.
- [ ] **Step 4:** `SceneCanvas.tsx` (`'use client'`):
  - `<Canvas dpr={1 / pixelSize} gl={{ antialias: false }} flat>` with style `image-rendering: pixelated`, fixed and full-screen.
  - The tier is recomputed on window resize so `dpr` changes across 768px.
  - A camera rig in `useFrame` applies `cameraPose(progress, focus)`, damping `focus` toward its target.
  - `webglcontextlost` on the canvas calls `onContextLost`.
- [ ] **Step 5:** Run the tests. Expected: PASS. Then run `npm run dev`, mount `SceneCanvas` temporarily in `page.tsx` with `progress` set to 0 and then 1, and use the `run` skill to screenshot both. Expected: sky with clouds at 0, the notebook in the grass at 1, both clearly pixelated. Resize the browser across 768px and confirm the pixel size changes with no stretching.
- [ ] **Step 6: Commit** `feat: pixelated 3d world`.

### Task 5: Overlay UI (title, HUD, menu, section page)

**Files:**
- Create: `src/ui/TitleOverlay.tsx`, `src/ui/Menu.tsx`, `src/ui/SectionPage.tsx`, `src/ui/ui.module.css`
- Modify: `src/app/layout.tsx` (fonts via `next/font/google`, exposed as CSS vars `--font-title` and `--font-body`), `src/app/globals.css` (palette vars)
- Test: `src/ui/ui.test.tsx`

**Interfaces:**
- Consumes: `content`, `SECTIONS`, `sectionEntries`, `Entry` (Task 1); `UIState`, `UIAction` (Task 3).
- Produces:
  ```ts
  <TitleOverlay progress: number />        // title+subtitle opacity = 1 - min(1, progress*3); HUD always; prompt hidden when progress > 0.1
  <Menu state: UIState; dispatch: (a: UIAction) => void; visible: boolean />   // visible when progress > 0.85
  <SectionPage id: SectionId; onClose: () => void />
  ```
  Menu keyboard behaviour (only when visible and nothing is open): ←/→ and ↑/↓ dispatch `move`, Enter dispatches `open`. Esc anywhere calls close. Menu items are `<button>`s ≥ 44px tall.

- [ ] **Step 1: Write failing tests:**
  - TitleOverlay at progress 0 shows `hi, i'm kyse`, the subtitle, `♥♥♥ LV.22` and `▼ scroll to look down ▼`. At progress 0.5 the title wrapper has opacity `0` and the HUD is still present.
  - Menu renders four buttons in the order bio, education, experience, competition. The selected one's text starts with `▶`. Clicking `competition` dispatches `{type:'open', id:'competition'}`. ArrowRight dispatches `{type:'move',dir:1}`.
  - SectionPage `experience` lists every placeholder experience title. SectionPage `bio` shows `content.bio`. A `◀ back` button and the Esc key both call `onClose`.
  - SectionPage with `education: []` (mock the content module) shows `nothing here yet ✿`.
  - SectionPage with 20 entries: the list container has the class whose CSS sets `overflow-y: auto` and a `max-height` in `vh`. Assert the class name, since jsdom has no layout.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement using the Global Constraints styling. SectionPage is an HTML panel styled as notebook paper (cream, ruled lines, ink text), centred over the lower half of the viewport where the notebook sits at full focus. Entry titles use `--font-title`, details use `--font-body`, and links open in a new tab. Max width is `min(640px, 100vw - 32px)`. On phones it uses nearly the full width.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5: Commit** `feat: title, menu and section overlays`.

### Task 6: Radio + Spotify embed

**Files:**
- Create: `src/ui/Radio.tsx`, `src/ui/radio.module.css`, `src/content/spotify.ts`
- Test: `src/ui/radio.test.tsx`

**Interfaces:**
- Consumes: `content.spotifyTrackUrl` (Task 1).
- Produces:
  ```ts
  function spotifyEmbedUrl(trackUrl: string): string   // https://open.spotify.com/track/ID?... → https://open.spotify.com/embed/track/ID?utm_source=generator
  <Radio />   // fixed bottom-right (desktop), bottom-right with panel full-width minus 16px gutters (mobile)
  ```

- [ ] **Step 1: Write failing tests:**
  - `spotifyEmbedUrl('https://open.spotify.com/track/abc123?si=x')` returns `'https://open.spotify.com/embed/track/abc123?utm_source=generator'`.
  - Initially there is a button labelled `open radio` and no iframe in the document.
  - After one click: an iframe with that `src`, `height="80"`, `allow` containing `autoplay; encrypted-media`, and a link `listen on spotify ↗` pointing to the track URL.
  - After a second click: the iframe is still in the document but its panel has `hidden`/`aria-hidden="true"`, and the button label is `open radio` again.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement. The radio icon is a small pixel-art radio drawn in CSS or an inline SVG with `shape-rendering="crispEdges"`. The panel is a cream box with a brown border holding the iframe plus the fallback link underneath. The iframe stays mounted after the first open so playback continues when the panel collapses.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5: Commit** `feat: pixel radio with spotify embed`.

### Task 7: Capability detection, reduced motion, fallback page

**Files:**
- Create: `src/capability/detect.ts`, `src/capability/usePrefersReducedMotion.ts`, `src/ui/FallbackPage.tsx`
- Test: `src/capability/capability.test.tsx`

**Interfaces:**
- Consumes: `content`, `SECTIONS` (Task 1); `SectionPage` (Task 5).
- Produces:
  ```ts
  function hasWebGL(doc?: Document): boolean       // tries canvas.getContext('webgl2') || 'webgl'; false on throw/null
  function usePrefersReducedMotion(): boolean     // matchMedia('(prefers-reduced-motion: reduce)'), live-updating
  <FallbackPage />   // CSS sky→grass background, title/tagline, all four sections rendered in order using SectionPage's list markup, normal page scroll, includes <Radio/>
  ```

- [ ] **Step 1: Write failing tests:**
  - `hasWebGL` returns false when `getContext` returns null, and false when it throws. It returns true when it returns an object.
  - `usePrefersReducedMotion` follows a mocked `matchMedia` and updates when its change listener fires.
  - FallbackPage shows `hi, i'm kyse` and a heading for each of the four sections, in order.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement. Reuse SectionPage's list rendering by extracting an `EntryList` component from Task 5's file if needed. Don't duplicate it.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5: Commit** `feat: webgl detection, reduced motion and fallback page`.

### Task 8: Page composition, wiring, deploy readiness

**Files:**
- Create: `src/app/Experience.tsx` (`'use client'`, composes everything)
- Modify: `src/app/page.tsx` (renders `Experience`, with `SceneCanvas` loaded via `next/dynamic` and `ssr: false`), `src/app/layout.tsx` (metadata: title `kyse`, description)
- Test: `src/app/experience.test.tsx`

**Interfaces:**
- Consumes: everything above.
- Behaviour:
  - Before mounting, check `hasWebGL()`. If it's false, or after `onContextLost`, render `<FallbackPage/>`.
  - The page has a `400vh` spacer. `progress = reducedMotion ? 1 : easeInOutQuad(scrollProgress(scrollY, scrollHeight - innerHeight))`. Compute it on mount (this covers restored scroll) and on `scroll`/`resize`, throttled to rAF.
  - `focus` target = `state.open ? 1 : 0`. `useScrollLock(state.open !== null)`.
  - Render order: SceneCanvas, TitleOverlay, Menu (visible when `progress > 0.85`), SectionPage when open, Radio.

- [ ] **Step 1: Write failing tests** (mock `SceneCanvas` as a stub that records props, and mock `hasWebGL`):
  - With `hasWebGL → false`, the fallback renders and the stub doesn't.
  - With `hasWebGL → true` and `window.scrollY` set to max before render, the stub receives `progress === 1` on first effect.
  - With reduced motion mocked true, the stub receives `progress === 1` and `reducedMotion === true` at `scrollY = 0`.
  - Clicking `experience` in the menu shows its SectionPage and sets `documentElement.style.overflow` to `hidden`. Esc removes the page and restores overflow.
  - Calling the stub's recorded `onContextLost` switches to the fallback.
- [ ] **Step 2:** Run the tests. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `npm test`, `npm run lint` and `npm run build`. Expected: all pass.
- [ ] **Step 5:** Run `npm run dev`. Use the `run` skill to check desktop (1440×900) and phone (390×844, touch):
  - Title screen at the top.
  - Scroll down reaches the notebook with the menu.
  - Open experience: the camera moves in and the list scrolls inside the page while the page stays still.
  - Esc or back closes it.
  - Scrolling up returns to the sky.
  - The radio opens the Spotify panel.
  - With reduced motion emulated, you land on the notebook.
  - With WebGL disabled, you see the fallback.
  - At 360px there's no horizontal scroll.
- [ ] **Step 6: Commit** `feat: compose portfolio experience`. Deploying to Vercel is kyse's step: push to GitHub and import the repo in Vercel. Confirm with kyse before creating any remote or pushing.
