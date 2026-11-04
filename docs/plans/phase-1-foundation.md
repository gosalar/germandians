# Phase 1: Foundation for a multi-page site

Handoff plan for an agent with no prior context. Read it top to bottom before changing anything. It says what to do, where, how to verify it, and which traps to avoid. It contains no code on purpose: write the code yourself, following the conventions already in the repo.

---

## 1. Context you need first

**What this is.** Germandians is a consultancy run by six Indian students living in Germany who help other Indian students apply to German universities. This repo is their public website. Today it has two pages: a long landing page (`/`) and a privacy note (`/privacy`).

**Where the design comes from.** The landing page and privacy note were designed in Claude Design and rebuilt in React to match the design pixel for pixel. That match is the most important property of the site. An automated visual test suite enforces it (section 3).

**What comes after Phase 1** (out of scope here, but every decision should make it easier):
- a filterable list of German universities with one page per university
- guides and process pages (APS, IELTS, SOP, blocked account, visa, Anmeldung)
- free tools (first a GPA calculator converting Indian CGPA to the German grade)
- later, an AI assistant chatbot, which will need a server route

**What Phase 1 delivers.** The same site, looking identical, rebuilt on a foundation that can carry those pages. There are four workstreams, done in order:
1. **A: Rendering.** Move from a client-only SPA to React Router framework mode with build-time prerendering, so every page ships as real HTML (SEO, first paint).
2. **B: Design system.** Switch Mantine from "unstyled" to its styled components, driven by a brand theme built from the design tokens.
3. **C: Landing migration.** Move the landing page's shared pieces (buttons, inputs, FAQ) onto those themed components. Bespoke art pieces stay custom.
4. **D: Site shell.** Extract the header, footer and page-chrome state into shared, reusable pieces, with no visible change.

**Current stack** (see `package.json` for exact versions): React 19.3, Vite 8 (Rolldown), TypeScript 6, React Router 8.5 (data router via `createBrowserRouter`, not framework mode yet), Mantine 9.7 (core, hooks, form), SCSS modules, and the React Compiler through `@rolldown/plugin-babel` plus `reactCompilerPreset`. Visual tests use Playwright 1.64 with pixelmatch. Hosting is GitHub Pages via `.github/workflows/pages.yml`, served under the `/germandians/` subpath.

**Files to read before starting** (about 20 minutes):
- `README.md`: scripts, settings, structure, and a "Notes" section explaining non-obvious decisions.
- `src/utils/styles/_tokens.scss`: every colour, font and breakpoint from the design. This is the source for the Mantine theme.
- `src/utils/styles/global.scss`: the element defaults. They're wrapped in `:where()` on purpose (explained in section 4).
- `src/utils/styles/fonts.scss`: self-hosted fonts with deliberately limited weight ranges.
- `src/pages/Home/*/styles.module.scss`: the exact values you'll move into the theme in workstreams B and C.
- `tests/visual/compare.ts` and the two spec files: how the visual tests work.
- `.github/workflows/pages.yml`: CI and deployment.

**Reference material outside the repo** (on the owner's machine only, may not be available to you):
- `initial-implementation-plans/references/ChatAid-FE-Architecture.md` (gitignored): the owner's preferred house architecture from another product. Follow its conventions: feature folders under `pages/`, shared UI under `components/`, a Mantine theme in `themes/` with one folder per component override, SCSS modules, and pure helpers in `utils/`.
- `C:\Users\sampa\Documents\ChatAid\chat-aid-fe\src\themes\`: a working example of that Mantine theme pattern. It has two known problems you must not copy: it loads Mantine's CSS unlayered (which led to 384 `!important` rules), and its brand buttons are a wrapper component that sets styles through the DOM instead of theme variants.
- If you have the `vercel-react-best-practices` skill, follow it. Where it disagrees with the ChatAid reference, the skill wins (the owner's rule).

---

## 2. Rules that apply to every step

1. **The landing page and privacy note must stay pixel-identical to the design.** Run the visual tests after every meaningful change, not only at the end. A failing visual test means your change is wrong unless the owner explicitly asked for a visual change.
2. **Never edit `tests/visual/reference/`, and never raise `MAX_DIFF_PIXELS`** (64, in `tests/visual/compare.ts`) to make a test pass. The reference is the design. The tolerance covers only sub-pixel anti-aliasing.
3. **No `!important` in application styles.** Mantine's CSS goes into a cascade layer (workstream B) precisely so overrides never need it.
4. **No DOM style manipulation** (setting `element.style` from event handlers) for visual states. Use CSS: `:hover`, `:focus-visible`, and data attributes.
5. **Keep copy exactly as is.** Every word on both pages comes from the design. Don't fix, reword or "improve" any text.
6. **Keep the folder conventions** described in the README "Structure" section and the ChatAid reference. Don't introduce new styling systems (no Tailwind, no CSS-in-JS).
7. **TypeScript strict, ESLint clean.** `npm run typecheck` and `npm run lint` must pass at the end of every workstream.
8. **Git:**
   - Work on a branch (suggested: `phase-1-foundation`). Commit once per workstream with a plain descriptive message.
   - Commit messages and PR text must never mention Claude, AI or an agent, and must not include `Co-Authored-By` lines (the owner's standing rule).
   - Don't push or merge to `main` without the owner's go-ahead. Pushing to `main` deploys the live site.

---

## 3. Environment and tooling facts (these have bitten people before)

- **`NODE_ENV=localhost` is set globally on the owner's Windows machine.** Vite honours an existing `NODE_ENV`, which silently produced a React *development* build (727 KB JS instead of about 150 KB gzipped). `vite.config.ts` forces `production` for builds. Keep that guard working after the migration, and verify it (workstream A, step A15).
- **Shell:** Windows, with PowerShell and Git Bash available. Multi-line shell heredocs have been unreliable here; write files with your file-editing tools, not shell redirection.
- **Node:** v26 locally, Node 24 in CI. React Router 8's dev tooling needs Node 22.22 or newer. Both are fine.
- **Visual tests**, `npm run test:visual` (30 checks, about 1 minute) and `npm run test:visual:quick` (13 checks, about 30 seconds):
  - They serve the design prototype from `tests/visual/reference/` on port 5601, build the site in "visual" mode, serve it on port 5602, and compare screenshots in Chrome.
  - Locally they use the installed Google Chrome; CI uses Playwright's Chromium.
  - The prototype loads React, Babel and fonts from public CDNs, so the first run needs internet. After that they're cached in `.visual-cache/`.
  - The visual build ignores `config/.env*` (Vite `envDir` is turned off in `visual` mode) so it always has the design's default settings.
  - On failure, reference, app and diff PNGs are written to `test-results/visual/<test-name>/`. Look at the diff image before changing anything.
- **A quirk of the prototype, not the design:** Claude Design's preview wrapper is one viewport tall, so the prototype's sticky nav stops sticking after one screen. The site keeps it sticky, as the design's CSS intends. The interaction tests disable stickiness on both sides for element screenshots. Don't "fix" the site to match the prototype here.
- **Fonts are intentionally limited:** Hanken Grotesk is declared for weights 400–700 only, and Archivo for 400–900 at widths 62–125%. This reproduces what the design loaded from Google Fonts: text set at weight 800 in Hanken renders at 700, exactly as in the design. Don't replace `fonts.scss` with the fontsource packages' default CSS.

---

## 4. Before you start: establish the baseline

1. Run `npm ci`, then `npm run typecheck`, `npm run lint`, `npm run build` and `npm run test:visual`. Everything must pass (30 of 30 visual checks). If anything fails before you've changed code, stop and report it. Don't start the phase on a red baseline.
2. Record the baseline numbers for comparison later:
   - JS and CSS sizes printed by `npm run build`. Today the initial JS is about 150 KB gzipped, split into `react`, `router`, `mantine` and `index` chunks.
   - The visual suite's duration.
3. Understand why `global.scss` wraps element rules in `:where()`. In the design, those rules were page-level defaults that inline styles overrode. Zero specificity reproduces that: any component class wins over them. Workstream B adds a CSS layer for Mantine, which interacts with this (see B2).

---

## 5. Workstream A: React Router framework mode with prerendering

**Goal:** the same two pages, but `npm run build` emits real HTML files for `/` and `/privacy` containing the full page content. The client then hydrates them. There's no runtime server in Phase 1 (static hosting on GitHub Pages stays), but the setup must allow adding server routes later for the chatbot.

**Why framework mode rather than Next.js:** it keeps Vite, the router, Mantine and every component as they are. It's the smallest migration that gives static HTML now and server routes later.

### Steps

**A1. Install the framework tooling.** Add `@react-router/dev` as a dev dependency at exactly the same version as `react-router` (8.5.1 at the time of writing). Don't add `@react-router/node` or `@react-router/serve`: Phase 1 has no runtime server.

**A2. Create the React Router config** (`react-router.config.ts` at the repo root):
- `appDirectory`: `src`. This keeps the existing `src/` layout and the `@/` import alias.
- `ssr`: false.
- `prerender`: the paths `/` and `/privacy`.
- `basename`: read from one environment variable shared with Vite (see A9).
- `buildDirectory`: default `build`, except visual-test builds, which go to `.visual-build` (see A12). The React Router config can't see Vite's `--mode`, so drive this with an environment variable that the `build:visual` script sets.
- **Route discovery:** with `ssr: false` there's no server for the lazy manifest endpoint. After the first build, check in the browser's network panel that no `__manifest` requests are made on the static site. If they are, set route discovery mode to "initial".

**A3. Update `vite.config.ts`:**
- Replace the `@vitejs/plugin-react` plugin in the plugins list with React Router's Vite plugin (from `@react-router/dev/vite`). The React Router plugin brings its own Fast Refresh, so having both causes double refresh transforms.
- Keep the `@rolldown/plugin-babel` plugin with `reactCompilerPreset`. The preset helper is still imported from the `@vitejs/plugin-react` package, so keep that package installed as a dev dependency, but don't register its plugin. After building, confirm the compiler still runs: the client bundle should import React's compiler runtime (search the built JS for `compiler-runtime` or the memo-cache helper).
- Keep the `@` alias, the `envDir` logic and the `NODE_ENV` production guard unchanged.
- The vendor `codeSplitting` groups (react, router, mantine) were written for a single client build. Framework mode builds a client and a server/prerender environment. Move the groups so they apply only to the client environment, using Vite's per-environment build options. If they conflict with React Router's own route chunking, remove them and record the resulting chunk sizes in your report rather than fighting the framework.

**A4. Create the document shell** (`src/root.tsx`). It replaces both `index.html` and `src/main.tsx`:
- The `<html>` element has `lang="en"` plus Mantine's `mantineHtmlProps`. The head has the charset meta, the viewport meta (same values as today's `index.html`), React Router's `Meta` and `Links`, and Mantine's `ColorSchemeScript` set to light.
- The body wraps the outlet in `MantineProvider`, with the theme from `src/themes` and the colour scheme forced to light (as `main.tsx` does now), then renders React Router's `ScrollRestoration` and `Scripts`.
- Move every global CSS import from `src/main.tsx` into the root, **in the same order**: `fonts.scss`, the four Barlow Semi Condensed weight files, then `global.scss`. Workstream B adds Mantine's layered CSS before these.
- Export an `ErrorBoundary` that renders the existing `src/pages/ErrorPage` (it already uses `useRouteError`, which keeps working).
- Export a `HydrateFallback`. In this mode it's what non-prerendered URLs (the 404 path) show while the client boots. Keep it minimal: an empty page in the paper background colour.
- Keep `StrictMode` behaviour. Wrap the app in it as `main.tsx` does now, if the framework doesn't already.

**A5. Define the routes** (`src/routes.ts`) and thin route modules in a new `src/routes/` folder:
- Index route → `src/routes/home.tsx`
- `privacy` → `src/routes/privacy.tsx`
- catch-all `*` → `src/routes/not-found.tsx`

Each route module stays thin. Its default export renders the matching page component from `src/pages/`, and it exports `meta`:
- **Home:** title "Germandians | Student-led guidance for studying in Germany", plus the description from today's `index.html`, copied exactly.
- **Privacy:** title "Privacy note | Germandians".
- **Not found:** title "Page not found | Germandians", plus a robots `noindex` meta.

Then remove the React 19 `<title>` elements currently rendered inside `src/pages/Privacy/index.tsx` and `src/pages/ErrorPage/index.tsx`, so titles come only from `meta`. Pages own the UI; route modules own routing and SEO metadata. This split will matter when university pages get per-page metadata in Phase 2.

**A6. Delete what framework mode replaces:**
- `index.html`, `src/main.tsx`, `src/App.tsx`, `src/router.tsx`
- `src/components/RootLayout/` (its `ScrollRestoration` now lives in the root)
- the manual `lazy` import for the privacy route (framework mode splits route modules automatically)

Keep `ROUTES` and `SECTIONS` in `src/utils/constants.ts`; links keep using them.

**A7. Fix the two known hydration hazards.** Prerendering runs components at build time, where `window` doesn't exist and the date is the build date.
- **`src/pages/Home/Fees/Receipt.tsx`** reads the reduced-motion preference during render (lazy `useState` initial value). At build time this returns "not reduced", so a visitor with reduced motion gets a hydration mismatch on the `data-animate` attribute. Read the preference after mount instead: Mantine's `useReducedMotion` hook, or a subscription with a server value of "not reduced". Keep the behaviour: with reduced motion the receipt never animates and appears in its final state.
- **`src/pages/Home/Contact/ProfileReviewForm.tsx`** renders today's date (German format) inside the "EINGEGANGEN" stamp during every render. Prerendered HTML would carry the build date. Capture the date when a submission succeeds, keep it in state, and render that.

**A8. Hunt for other hazards.** Search `src/` for `window`, `document`, `navigator`, `matchMedia`, `localStorage`, `new Date` and `Math.random`. Any use outside an effect, event handler or browser-only callback must move into one. Today the others are already inside effects or handlers, but verify after your changes. Then load both pages in a browser with the console open, at 1440px and 390px wide, with and without reduced motion emulated. **There must be zero hydration warnings and zero console errors.**

**A9. Base path for GitHub Pages:**
- **Today:** CI builds with Vite's `--base "/<repo-name>/"` flag, and `src/router.tsx` passes Vite's base URL to the router as its basename.
- **In framework mode:** React Router's `basename` and Vite's `base` must agree. Introduce one environment variable (suggested name `SITE_BASE_PATH`, default `/`, must start and end with `/`). Read it in both `react-router.config.ts` and `vite.config.ts`. Remove the `basename` argument (now in the config) and drop the CLI `--base` flag from CI (A13).
- **Verify a subpath build locally:** build with the variable set to `/germandians/`, then serve the output so it's reachable under `/germandians/`. For example, copy the client build into a temporary `germandians` folder inside a scratch directory and serve that directory statically.
- **Check:** assets load, `/germandians/` and `/germandians/privacy` load directly, in-page anchors work, "Back to the site" and "Back to the form" on the privacy page work, and the footer "Privacy" link works.

**A10. npm scripts** (`package.json`):
- `dev` runs the React Router dev server.
- `build` runs React Router typegen, then the TypeScript build check, then the React Router build.
- `typecheck` runs typegen, then the TypeScript build check.
- `preview` serves the static client build output (`build/client`) with clean URLs, so `/privacy` resolves to `privacy/index.html`. Reuse the same `serve-handler` approach as `tests/visual/serve-reference.mjs`. Put the server script under a `scripts/` folder so it isn't test-only.
- `build:visual` builds in `visual` mode into `.visual-build` (A2, A12).

Keep the other scripts.

**A11. TypeScript, ESLint and ignores:**
- **TypeScript:** add React Router's generated types folder (`.react-router/types`) to `tsconfig.app.json`, the way React Router's framework docs describe (`rootDirs` plus include). Route modules should use the generated `Route` types for `meta` and component props.
- **ESLint:** in `eslint.config.js`, the `react-refresh/only-export-components` rule will flag route modules because they export `meta` and similar. Configure its allowed export names to cover React Router's route module exports: `meta`, `links`, `headers`, `loader`, `clientLoader`, `action`, `clientAction`, `ErrorBoundary`, `HydrateFallback`, `handle`, `shouldRevalidate`. Add `build`, `.react-router` and `.visual-build` to ESLint's global ignores.
- **`.gitignore`:** add `build/` and `.react-router/`.

**A12. Visual tests** (`playwright.config.ts`, `tests/visual/`):
- The app web server currently runs `vite preview` on `.visual-build`. Replace it with a static server over the visual build's client folder (`.visual-build/client`) on port 5602. It needs clean URLs, so `/privacy` serves `privacy/index.html`, and unknown paths fall back to React Router's SPA fallback HTML. Use the shared server script from A10.
- Test URLs stay `/` and `/privacy`. Don't change the specs, the tolerance or the reference.
- Run the full suite **three times in a row**. All three runs must be 30 of 30. Prerendered HTML can flash differently from client-rendered HTML, so any flakiness here is a real signal. Investigate it; don't retry it away.

**A13. CI and deployment** (`.github/workflows/pages.yml`):
- Build with the base-path variable from A9 instead of the CLI `--base` flag. Keep passing the `VITE_*` repository variables to the build step exactly as now.
- The deploy artifact path changes from `dist` to `build/client`.
- Remove the step that copies `index.html` into `privacy/index.html`. Prerendering now produces `privacy/index.html` itself.
- Keep producing a `404.html` for GitHub Pages, but copy it from React Router's SPA fallback file rather than from `index.html`. A copy of the home page as the 404 page would flash the landing page for unknown URLs before the router swaps in the not-found page. Find the fallback file's exact name in the build output.
- Keep the lint, Playwright install and visual test steps.

**A14. Check the prerendered output by hand:**
- `build/client/index.html` must contain the hero headline "Study in Germany with the people already there.", every section's text, the first FAQ answer (open by default), the meta description and the correct title.
- `build/client/privacy/index.html` must contain the privacy note text.
- With JavaScript disabled in the browser, both pages must be fully readable and visually laid out. Interactive parts will be inert, which is fine.

**A15. Check the production bundles:** after `npm run build` on the owner's machine (where `NODE_ENV=localhost`), the client JS must contain no React development builds. Look for `react-dom-client.development` or the string "development" in the React chunk; a production bundle has neither. Total initial JS should be close to the baseline from section 4 (within about 10 percent). Report the numbers.

### Done when
- typecheck, lint and build pass, and the visual suite passes 30 of 30 three runs in a row
- both pages are prerendered with full content, with zero hydration warnings or console errors
- the GitHub Pages subpath works locally
- the CI workflow is updated
- the production bundle check passes

**Commit:** "Prerender pages with React Router framework mode"

---

## 6. Workstream B: Styled Mantine with a brand theme

**Goal:** Mantine's styled components available across the site, themed from the design tokens, so future pages (tables, filters, calculators, chat UI) come out on-brand with little custom CSS. The landing page must not change.

**Why the current setup changes:** today Mantine is used "unstyled". Only its behaviour and accessibility are used, and every pixel comes from SCSS modules. That was right for one hand-designed page and is wrong for a growing product.

### Steps

**B1. Load Mantine's CSS inside a cascade layer:**
- Import only Mantine's *layered* stylesheets (the `.layer.css` files), never the unlayered ones. They put all of Mantine's rules in a layer named `mantine`. Every style the site writes is unlayered, so it beats Mantine's regardless of specificity. This is the fix for the `!important` problem in the ChatAid reference.
- Import per component, not the whole library: the full layered stylesheet is about 41 KB gzipped, while the needed subset is about 11 KB. Create one place that lists all Mantine style imports (suggested: `src/themes/mantine-styles.ts`, imported first in `src/root.tsx`). It holds Mantine's baseline, default CSS variables and global layered files, then one layered file per component in use.
- Add a comment telling future contributors to add a component's `.layer.css` there the first time they use that component. Start with the components workstreams B and C use: Button, UnstyledButton, Input (covers TextInput), Accordion, Checkbox, Badge, Table, Anchor, Text, Title.

**B2. Neutralise Mantine's baseline where it would change the landing page.** The layered baseline sets body margin, font family, font size, line height, background, colour and font smoothing. It also sets `font: inherit` on inputs, buttons, textareas and selects, plus `text-size-adjust` on small screens.
- The site's own `:where(body)` rule is unlayered, so it already wins for margin, background, colour, font family and smoothing.
- It does **not** set a line height, so Mantine's 1.55 would apply and shift almost every text block. Add an explicit `line-height: normal` to the body rule in `src/utils/styles/global.scss`.
- Leave the font size alone: Mantine's medium size equals the browser default of 16px.
- Then run the full visual suite **before touching any component**. It must be 30 of 30. If anything still moves, read the diff image, find which baseline rule caused it, and pin that property in `global.scss` the same way.

**B3. Build the theme** (`src/themes/`), following the ChatAid folder pattern:
- `src/themes/index.ts` exports the theme. `src/themes/colors.ts` holds the colour palettes. Each component override lives in `src/themes/<Component>/` with an index file plus a `styles.module.scss`, using the component's `extend` helper (default props, `classNames`, and CSS variable resolvers where needed).
- **Colours:** 10-shade palettes for navy, yellow, red, green and orange, built so each brand hex from `_tokens.scss` sits at a known shade. Navy and yellow already exist in `src/themes/index.ts`; keep their exact values.
  - Primary colour: navy, with the primary shade pointing at `#10182e`. Black is `#10182e`.
  - SCSS keeps using `_tokens.scss`. Add a comment in both files saying they must stay in sync.
- **Typography:** body font Hanken Grotesk and heading font Archivo, using the family names declared in `fonts.scss` ("Hanken Grotesk Variable", "Archivo Variable").
- **Radius scale** from the design's values: 4, 8, 12, 18 and 24 px for xs through xl. The default radius is 12 (the design's buttons).
- **Behaviour settings:**
  - Turn off Mantine's press-down "active" class: the design's buttons don't shift when pressed.
  - Respect reduced motion.
  - Use a pointer cursor on interactive controls.
  - Focus rings: keep them for accessibility, but make them on-brand. Use the 3px yellow ring the design uses on the month slider (`src/pages/Home/Journey/styles.module.scss`, the track's focus style).
- Remove the current "unstyled by default" settings for Accordion and TextInput **only when** workstream C restyles those components. Doing it earlier breaks the FAQ and the form.

**B4. Component overrides.** Derive every value from the existing SCSS; don't invent new ones. Mantine sets `data-variant`, `data-size`, `data-disabled` and similar attributes on its elements, so style variants with those attributes inside each theme SCSS module.

**Button** (`src/themes/Button/`): first neutralise Mantine defaults the design doesn't have. That means the fixed height (use minimum heights and padding instead), the disabled background change (the design only drops opacity to 0.4), the label line-height and overflow clipping, and the active transform (handled in B3). Then add these variants and sizes. Font weight is 700 unless noted.

| Variant | Look | Hover | Used by today (source of values) |
| --- | --- | --- | --- |
| yellow | yellow background, navy text, 2px inset navy ring | navy background, yellow text | hero primary CTA (`Hero/styles.module.scss` `.primaryCta`) |
| yellow on dark | yellow background, navy text, no ring | white background, navy text | Fees and SOP CTAs (`Fees`, `Sop` `.cta`) |
| navy | navy background, yellow text | yellow background, navy text | nav CTA, "Play all 7 months", form submit |
| navy step | navy background, yellow text, 2px navy border | background `#1c2643` | "Next month" |
| outline | white background, navy text, 2px navy border | background `#f1eee4` | "Previous month" |
| ring | transparent, navy text, 2px inset navy ring | background `#ebe6d8` | hero "DM us on Instagram" |
| menu | yellow background, navy text, 2px inset ring, full width | none | mobile menu CTA |

| Size | Values | Used by |
| --- | --- | --- |
| nav | 15px text, 11px by 18px padding, 10px radius | nav CTA |
| md | 16px text, 50px minimum height, 0 by 22px padding, 12px radius | Play button |
| lg | 17px text, 16px by 24px padding, 12px radius | hero, Fees and SOP CTAs |
| step | 17px text, 56px minimum height, 12px radius | Previous and Next month |
| submit | 18px text at weight 800 (renders as 700, see section 3), 56px minimum height, 0 by 26px padding, 8px radius | form submit |
| menu | 17px text, 54px minimum height, 12px radius | mobile menu CTA |

All colour transitions are 0.2s on background and colour, as in the SCSS. The "Sending…" state of the submit button (slate `#4a5372` background, white text) should use the Button's loading or disabled state with the same colours. Button-like links must render as links (`component` set to an anchor or React Router's `Link`), not buttons.

**Anchor** (`src/themes/Anchor/`): match the global link style in `global.scss` (navy text, yellow underline 2px thick and offset 3px, red on hover). Disable Mantine's own underline and colour logic where it conflicts.

**Input and TextInput** (`src/themes/Input/` plus `src/themes/TextInput/` or `InputWrapper`): the values from `src/pages/Home/Contact/styles.module.scss`.
- **Input:** 54px high, 1.5px navy border, 4px radius, white background, 0 by 14px padding, Barlow Semi Condensed 600 at 20px, navy text, no outline. On focus, a 3px yellow box-shadow ring. On error, a red (`#c4261b`) border.
- **Label:** flex row with a 10px gap, 17px, 700.
- **Error text:** 15px, red, 600, no margin.
- The numbered square in front of each label stays part of the label content passed in by the form, not the theme.

**Accordion** (`src/themes/Accordion/`): the FAQ look from `src/pages/Home/Faq/styles.module.scss`.
- 2px navy rules between items and at the bottom.
- The control has 20px vertical padding, 64px minimum height, text at clamp(18px, 1.6vw, 21px), 700, line-height 1.35, and a 16px gap.
- The chevron is the "+" icon: a 34px navy rounded square (8px radius) with a yellow "+" at 22px. Put it on the right and rotate it 45 degrees when the item is open, with a 0.25s transition.
- No panel animation (transition duration 0).
- Today the FAQ puts the "+" in Mantine's *icon* slot and hides the chevron, a workaround for unstyled mode. With the theme, use the real chevron slot positioned on the right, with a custom 45-degree rotation. That keeps the DOM order question-then-icon, which matches the design.

**Checkbox** (`src/themes/Checkbox/`): navy fill, 22px, small radius. Used by future pages only. The landing page's consent checkbox stays a native input (C3).

**Badge** (`src/themes/Badge/`): the hero intake-status badge from `src/pages/Home/Hero/styles.module.scss` (4px by 10px padding, 6px radius, 700, 15px, with an 8px dot). Colours come per status, as today.

**Table** (`src/themes/Table/`): the comparison table in `src/pages/Home/Mentors/styles.module.scss`.
- Rows have 1px `#d9d4c6` rules.
- Header cells use the sand `#efebe2` background with Barlow 700 at 18px.
- Cells have 18px by 22px padding.
- The outer border is a 1.5px navy inset ring with 18px radius.
- Body text is 17px with line-height 1.45.

This is for the Phase 2 university list. The landing page's table stays as it is.

**B5. Optional but recommended: a theme playground.**
- Add a development-only route (for example `/_theme`) that renders every themed component in every variant and size, with disabled, error and loading states.
- It must never be prerendered or reachable in production: register it only in development and leave it out of the `prerender` list.
- It makes reviewing the theme fast, and Phase 2 will need it.

### Done when
- Mantine CSS is loaded only through layered files listed in one place
- the theme and the overrides above exist
- `global.scss` pins the line height
- the visual suite is 30 of 30
- no `!important` anywhere in `src/` (search to confirm)

**Commit:** "Add Mantine brand theme with layered styles"

---

## 7. Workstream C: Move the landing page's shared pieces onto themed components

**Goal:** the landing page uses the same themed Button, TextInput and Accordion that future pages will use, so one theme change updates the whole site. It must still look identical.

### Steps

**C1. Add hover and state coverage to the visual tests first.**
- Today the interaction tests cover hover on the hero primary CTA and a nav link only.
- Before migrating, add scenarios to `tests/visual/interactions.spec.ts`:
  - hover on the nav CTA, the Fees CTA, the "Play all 7 months" button, "Next month", and the form submit button
  - the disabled "Previous month" at month 1
  - focus on a form input (shows the yellow ring)
  - the open and closed states of an FAQ item (already covered)
- Follow the existing scenario format, and mark one or two as `quick`.
- Run them against the **current** code. They must pass before you migrate anything. Then they guard the migration.
- For focus states, compare against the reference by focusing the same element in both. If the design shows the browser's default focus ring and the site shows the brand ring from B3, that's an intended difference. Leave focus out of the pixel comparison and note it in your report.

**C2. Migrate, one element type at a time,** running `npm run test:visual:quick` after each and the full suite at the end:
- **Buttons and button-like links:**
  - nav CTA and mobile menu CTA (`src/pages/Home/Navbar/`)
  - hero primary and secondary CTAs (`src/pages/Home/Hero/`)
  - Fees CTA and SOP CTA (`src/pages/Home/Fees/`, `src/pages/Home/Sop/`)
  - "Play all 7 months", "Previous month" and "Next month" (`src/pages/Home/Journey/MonthExplorer.tsx`). Keep the short and long label swap at 420px.
  - the form's submit and "Sending…" buttons (`src/pages/Home/Contact/ProfileReviewForm.tsx`)

  Delete the SCSS rules they no longer need. Rules that position a button within its section (like the 56px top margin on the SOP CTA, or "align-self: flex-start") stay in the section's SCSS module as a class on that instance.
- **Form fields:** the three TextInputs in `ProfileReviewForm.tsx` drop their per-instance class names and use the theme. Only the WhatsApp field keeps an instance class for its 0.04em letter-spacing.
- **FAQ:** `src/pages/Home/Faq/` uses the themed Accordion with the real chevron slot (B4). Remove the icon-slot workaround and its CSS.
- **Intake status badge** (only visible when the `VITE_INTAKE_STATUS` setting is configured): move it to the themed Badge if it matches exactly. The visual tests run with default settings, which hide the badge, so check it manually against the old rendering with the setting enabled.

**C3. Leave these custom on purpose.** They're unique to this page, and forcing them into Mantine would only add overrides:
- the giant condensed headlines
- the "€0 service fee" badge link
- the receipt printer
- the REJECTED/ADMITTED stamp cards
- the month track, its M1–M7 tick buttons and the phase legend
- the paint canvas and its "Wipe and repaint" text button
- the workload diagrams
- both comparison tables (they use `role="table"` on divs and have bespoke mobile card layouts)
- the contact channel cards
- the mobile action bar
- the consent checkbox (a native input; Mantine's checkbox can't match the browser's native rendering pixel for pixel)
- the "Send another" text button

**C4. Stop rule.** If an element can't match the design exactly through the theme, meaning it would need `!important`, DOM style manipulation or a one-off override that defeats the point of a shared variant, leave it custom. Write down which element and why in your report. Shipping a pixel-perfect custom element beats shipping a near-miss themed one.

### Done when
- the elements listed in C2 render through themed Mantine components
- obsolete SCSS is removed
- the extended visual suite passes (all original 30 checks plus the new ones) three runs in a row
- `src/themes/index.ts` no longer sets `unstyled` defaults

**Commit:** "Use themed Mantine components on the landing page"

---

## 8. Workstream D: Shared site shell, no visible change

**Goal:** the header, footer and page-chrome state become shared building blocks that Phase 2 pages can use. Today they live inside the home page. Nothing visible changes in Phase 1.

**Constraint:** the privacy page's design has its own simpler header (brand plus "Back to the site") and no footer. Don't force the landing header or footer onto it.

### Steps

**D1. Move the header and footer into shared components:**
- `src/pages/Home/Navbar/` moves to `src/components/SiteHeader/`.
- `src/pages/Home/Footer/` (including the flag band and the auto-fitting wordmark) moves to `src/components/SiteFooter/`.
- `src/pages/Home/MobileActionBar/` moves to `src/components/MobileActionBar/`.

Update imports. Styles move with them unchanged.

**D2. One navigation config:**
- The nav links (Journey, Universities, Why us, Contact) and the CTA target are currently a constant inside the Navbar. Move them to a single config (suggested: a `NAV_LINKS` entry in `src/utils/constants.ts`) used by both the desktop links and the mobile menu.
- Each link must work from any page:
  - on the home page, the links stay plain in-page anchors (`#journey`), so the browser's smooth scrolling still works
  - on any other page, they must go to the home page plus the anchor (`/#journey`) through the router, so the base path is respected
- `src/hooks/useSettleHashScroll.ts` already re-aligns to the anchor after fonts load. Make sure it still runs when arriving at home from another page.

**D3. Move page-chrome state up a level:**
- `src/contexts/PageChrome/` holds three things: whether the mobile menu is open, whether the hero CTAs are on screen, and whether the form is on screen. The header and the mobile action bar both use it. It's currently provided inside the home page.
- Add a pathless layout route in `src/routes.ts` that wraps the home route (and future "site" pages, but not the privacy page). Have it provide the context and render `SiteHeader`, the page outlet, `SiteFooter` and `MobileActionBar`.
- The home page component then renders only its sections.
- **Keep the hero/form visibility behaviour on pages without a hero or form:**
  - with no hero CTA observed, treat the hero as off screen
  - with no form observed, treat the form as off screen

  This way the mobile action bar shows on future pages once they exist. Write this rule as a comment where the defaults live.
- **Escape-key handling:** today, pressing Escape closes the mobile menu, through a window keydown listener in the provider. It must still work after the move.

**D4. Leave visible navigation changes to Phase 2.** Adding "Universities", "Guides" and "Tools" as top-level nav items changes the landing page's design, so it needs the owner's design decision and an updated visual reference. List this in your report as a Phase 2 dependency. Don't do it now.

### Done when
- the shell lives in `src/components/` and is driven by one nav config
- a layout route provides the page-chrome context
- the home page renders only its sections
- the visual suite passes three runs in a row
- links from the privacy page to home anchors still work under the `/germandians/` base path

**Commit:** "Extract the shared site shell"

---

## 9. Documentation (do this last)

Update `README.md`:
- **Stack line:** mention framework mode and prerendering.
- **Getting started:** the new script meanings, and that `build/client` is the static output (it replaces `dist/`).
- **GitHub Pages:** the base-path variable replaces the CLI flag; the 404 page comes from the SPA fallback.
- **Structure tree:** add `root.tsx`, `routes.ts`, `routes/`, the shared shell components and the theme folders.
- **Notes:** replace the "Mantine runs unstyled" note with how styling now works:
  - Mantine's layered CSS, listed in one file
  - the theme overrides in `src/themes/<Component>/`
  - unlayered site styles winning without `!important`
  - when to use a themed component versus a custom one (the C3 and C4 rules)
- **How to add a Mantine component:** add its layered CSS import to the one list, add a theme override folder if the defaults don't match the brand, and check it in the theme playground.

Delete statements that are no longer true, such as "Mantine runs unstyled" and the `dist/` mentions.

**Commit:** "Document the Phase 1 architecture"

---

## 10. Final definition of done

- [ ] `npm ci`, `npm run typecheck`, `npm run lint` and `npm run build` pass on a clean checkout.
- [ ] `npm run test:visual` passes three consecutive full runs, with the original 30 checks plus those added in C1.
- [ ] `build/client/index.html` and `build/client/privacy/index.html` contain the full page content, the correct titles and the home meta description.
- [ ] No hydration warnings or console errors on either page at 1440px and 390px, with and without reduced motion.
- [ ] No React development build in the client bundle on a machine with `NODE_ENV=localhost`. Initial JS is within about 10 percent of the baseline. CSS growth from Mantine is about 11 KB gzipped or less, unless you report why it's more.
- [ ] A build with the `/germandians/` base path works when served under that subpath: direct loads of both pages, assets, anchors, and links between the pages.
- [ ] `.github/workflows/pages.yml` deploys `build/client`, with the 404 page from the SPA fallback.
- [ ] No `!important` in `src/`. Mantine CSS is imported only as layered files from one list.
- [ ] The README is accurate.
- [ ] Four or five commits on a feature branch, nothing pushed to `main` without the owner's go-ahead, and no mention of AI in any commit message.

## 11. Out of scope for Phase 1

The university list and its data model, guides and MDX content, the GPA calculator, the chatbot, analytics, a CMS, new navigation items, any visual redesign, privacy-note content changes (its highlighted placeholders still need the owner's real details), and changes to the visual reference.

## 12. What to report back

- A summary per workstream: what changed, which files moved or were deleted, and anything you left custom under the C4 stop rule (with the reason).
- Before and after numbers: JS and CSS sizes, visual suite duration and pass record.
- Any decision you made that this plan didn't cover, and why.
- Phase 2 dependencies you found, at minimum the nav items decision from D4.
- Anything that surprised you or that the next agent should know.
