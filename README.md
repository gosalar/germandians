# Germandians website

Landing page, grade check and privacy note for Germandians. The visual reference for the landing page and privacy note lives in `tests/visual/reference/`.

## Stack

React 19 · React Router 8 framework mode with build-time prerendering · Vite 8 · TypeScript · Mantine 9 · SCSS modules · React Compiler

## Getting started

```bash
npm ci
npm run dev        # http://localhost:5173
npm run typecheck  # generate route types and check TypeScript
npm run build      # type-check, build, and prerender into build/client/
npm run preview    # serve the default build at http://localhost:4173
npm run lint
```

`build/client/` contains ready-to-serve HTML for home, the grade check and privacy. Configure your static host to serve directory indexes and to answer missing pages with `404.html` (a copy of the SPA fallback that the build writes). GitHub Pages and the preview server do both.

To preview the Pages subpath locally, build with `SITE_BASE_PATH=/germandians/`, copy `build/client/` to a folder named `germandians` inside a temporary directory, and serve that parent directory. Open `/germandians/` and `/germandians/privacy/`. For ordinary local preview, leave `SITE_BASE_PATH` unset. In Git Bash on Windows, also set `MSYS_NO_PATHCONV=1`, otherwise Git Bash rewrites `/germandians/` into a Windows path and the build rejects it.

## Visual tests

The site has to match the Claude Design prototype pixel for pixel. The visual tests render the prototype (`tests/visual/reference/`) and a fresh production build side by side in Chrome, and fail if any screenshot differs by more than 64 pixels.

```bash
npm run test:visual          # full suite: 37 checks
npm run test:visual:quick    # 15 checks
npm run test:visual:report   # open the last report (reference, app and diff images for failures)
npm run test:ux              # playback and form focus regression checks
```

- The full suite compares home at 10 widths, privacy at 5, and 22 interaction states including keyboard, hover, disabled and input-focus states.
- **Quick subset:** one desktop, one tablet and one phone layout, plus the key interactions. Good for checking a change while you work; the full suite is the gate before merging.
- **Requirements:**
  - Locally, the tests use your installed Chrome. CI uses Playwright's Chromium.
  - The prototype loads React, Babel and fonts from public CDNs, so the first run needs internet. Later runs serve them from `.visual-cache/`; delete that folder to refresh it.
- **Settings:** the test build ignores `config/.env*`, so it always uses the design's default settings.
- **Failures:** the reference, app and diff images are saved under `test-results/visual/<test>/`.
- **Changing the design:** if a test fails because the design itself changed, update `tests/visual/reference/` (a new export, or a hand edit that mirrors the change) instead of loosening the test.

## GitHub Pages

In the repository's **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source. To override the public site settings listed below, add repository variables under **Settings → Secrets and variables → Actions → Variables** before building.

Pull requests targeting `main` run lint, TypeScript checks, a production build and Playwright tests. A successful push to `main` publishes `build/client/` at [gosalar.github.io/germandians](https://gosalar.github.io/germandians/). The workflow sets `SITE_BASE_PATH` to the repository path for both Vite assets and router links. The build places both prerendered pages at their artifact-relative paths and writes the SPA fallback as `404.html`. To redeploy after changing a variable, run **Site CI and Pages deployment** manually on `main` from the Actions tab.

## Settings

The design's editable "props" are environment variables. Copy `config/.env.example` to `config/.env.local` and fill in what you need:

| Variable | Effect when empty |
| --- | --- |
| `VITE_FORM_ENDPOINT` | The form opens the visitor's email app with their details filled in |
| `VITE_WHATSAPP_NUMBER` | WhatsApp buttons scroll to the form |
| `VITE_FEE_AFTER_ADMISSION` | Receipt shows "Written quote" |
| `VITE_INTAKE_STATUS` | `Not confirmed` shows no badge; `Enquiries open`, `Waitlist only`, `Enquiries closed` show one |
| `VITE_INTAKE_SEASON` | `Summer`; accepts `Winter` or `Summer` |
| `VITE_INTAKE_YEAR` | `2027`; accepts a four-digit year from `1000` to `9999` |
| `VITE_PRIVACY_NAMES` | Responsible people's full names; omitted in production if empty |
| `VITE_PRIVACY_ADDRESS` | Postal address; omitted in production if empty |
| `VITE_PRIVACY_FORM_SERVICE` | Form provider; used only with a form endpoint; omitted in production if empty |
| `VITE_PRIVACY_HOSTING_PROVIDER` | Hosting provider; omitted in production if empty |
| `VITE_PRIVACY_RETENTION` | Confirmed retention period as plain text; omitted in production if empty |
| `VITE_PRIVACY_AUTHORITY` | Relevant data protection authority; example clause omitted in production if empty |
| `VITE_SHOW_SEAT_COUNT` / `VITE_SEATS_LEFT` | Seat count hidden |

With an endpoint set, the form POSTs JSON: `{ name, email, whatsapp, snapshot?, consent, consentAt, source }`.

## Structure

```txt
src/
├── root.tsx, routes.ts             # document, Mantine provider, route configuration
├── routes/                         # metadata, shared site layout, dev-only theme preview
├── pages/
│   ├── Home/                       # one folder per section: index.tsx + styles.module.scss (+ data.ts, hooks)
│   ├── Check/                      # German grade calculator and public university fit check
│   ├── Privacy/                    # standalone privacy note
│   └── ErrorPage/                  # 404 and route errors
├── components/                     # SiteHeader, SiteFooter, MobileActionBar, Brand, HomeSectionLink
├── contexts/PageChrome/            # menu state + hero/form visibility for the mobile action bar
├── hooks/                          # useReplayOnFirstView, useSettleHashScroll
├── services/profileReview.ts       # form submission
├── themes/                         # palettes, layered styles, component overrides
└── utils/                          # constants, siteConfig (env), styles (tokens, mixins, fonts, global)
```

## Notes

- **Adding a Mantine component.** Add its `.layer.css` and any dependent component styles to `src/themes/mantine-styles.ts`. The unlayered site SCSS takes precedence over Mantine's layer. For brand-specific defaults or variants, add an override and SCSS module under `src/themes/<Component>/` and register it in `src/themes/index.ts`. Check it at `/_theme` during development and run the visual suite.
- **Shared controls and custom artwork.** Use themed controls for buttons, fields, accordions and status badges. Keep the receipt, stamp cards, responsive comparison tables and other bespoke visuals in their feature folders. The consent checkbox uses browser-native rendering. Keep a control custom if a shared variant cannot reproduce the reference.
- **Adding pages.** Put the UI in `src/pages/` and metadata in a thin `src/routes/` module. Register pages that use the shared header and footer inside the site layout in `src/routes.ts`. Include public static pages in the prerender list in `react-router.config.ts`.
- **Fonts are self-hosted** (no Google Fonts requests; the privacy note says there's no third-party tracking). Hanken Grotesk is declared for weights 400–700 only, matching what the design loaded from Google, so text set at weight 800 renders at 700 just as it did in the design.
- **Breakpoints are CSS media queries** (760, 1024, 1100, 600, 640, 420 px), not JS resize state. Navigation switches to the menu below 1100px.
- **Sticky nav.** The nav stays sticky down the whole page, as the design's CSS specifies. In the Claude Design preview it stops sticking after the first screen because of the preview wrapper, not the design.
- **Builds are always production builds**, even when a machine has `NODE_ENV` set to something else (see `vite.config.ts`).
- Privacy settings accept plain text without brackets. Missing details remain highlighted in development and visual builds. Production omits missing clauses and prints a warning for each missing setting; the team must still confirm these details before launch. With no form endpoint, production explains that the visitor sends the form through their email app.
