# Germandians website

Landing page and privacy note for Germandians, built from the Claude Design handoff in `claude-design-handoff/` (v4).

## Stack

React 19 · Vite 8 · TypeScript · Mantine 9 · React Router 8 · SCSS modules · React Compiler

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/
npm run lint
```

`dist/` is a static site. On other static hosts, configure a fallback to `index.html` for client-side routes.

## Visual tests

The site has to match the Claude Design prototype pixel for pixel. The visual tests render the prototype (`tests/visual/reference/`) and a fresh production build side by side in Chrome, and fail if any screenshot differs by more than 64 pixels.

```bash
npm run test:visual          # full suite: 30 checks, about 1 minute
npm run test:visual:quick    # 13 checks, about 30 seconds
npm run test:visual:report   # open the last report (reference, app and diff images for failures)
```

- **Full suite:** home page at 10 widths, privacy page at 5, and 15 interactive states (menu, month explorer, FAQ, form errors, hovers, mobile action bar, receipt and stamp animations).
- **Quick subset:** one desktop, one tablet and one phone layout, plus the key interactions. Good for checking a change while you work; the full suite is the gate before merging.
- **Requirements:**
  - Locally, the tests use your installed Chrome. CI uses Playwright's Chromium.
  - The prototype loads React, Babel and fonts from public CDNs, so the first run needs internet. Later runs serve them from `.visual-cache/`; delete that folder to refresh it.
- **Settings:** the test build ignores `config/.env*`, so it always uses the design's default settings.
- **Failures:** the reference, app and diff images are saved under `test-results/visual/<test>/`.
- **Changing the design:** if a test fails because the design itself changed, replace the files in `tests/visual/reference/` with the new export instead of loosening the test.

## GitHub Pages

In the repository's **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source. To override the public site settings listed below, add repository variables under **Settings → Secrets and variables → Actions → Variables** before building.

Pull requests targeting `main` run lint, TypeScript checks, a production build and Playwright tests. A successful push to `main` publishes the checked build at [gosalar.github.io/germandians](https://gosalar.github.io/germandians/). To redeploy after changing a variable, run **Site CI and Pages deployment** manually on `main` from the Actions tab. The workflow provides a static entry point for direct visits to `/germandians/privacy/`.

## Settings

The design's editable "props" are environment variables. Copy `config/.env.example` to `config/.env.local` and fill in what you need:

| Variable | Effect when empty |
| --- | --- |
| `VITE_FORM_ENDPOINT` | The form opens the visitor's email app with their details filled in |
| `VITE_WHATSAPP_NUMBER` | WhatsApp buttons scroll to the form |
| `VITE_FEE_AFTER_ADMISSION` | Receipt shows "Written quote" |
| `VITE_INTAKE_STATUS` | `Not confirmed` shows no badge; `Enquiries open`, `Waitlist only`, `Enquiries closed` show one |
| `VITE_SHOW_SEAT_COUNT` / `VITE_SEATS_LEFT` | Seat count hidden |
| `VITE_ALLOW_REPAINT` | `true`: visitors can wipe and repaint the hero painting |

With an endpoint set, the form POSTs JSON: `{ name, email, whatsapp, consent, consentAt, source }`.

## Structure

```txt
src/
├── main.tsx, App.tsx, router.tsx   # bootstrap, MantineProvider, routes
├── pages/
│   ├── Home/                       # one folder per section: index.tsx + styles.module.scss (+ data.ts, hooks)
│   ├── Privacy/                    # lazy-loaded route
│   └── ErrorPage/                  # 404 and route errors
├── components/                     # shared across pages (RootLayout, Brand)
├── contexts/PageChrome/            # menu state + hero/form visibility for the mobile action bar
├── hooks/                          # useReplayOnFirstView, useSettleHashScroll
├── services/profileReview.ts       # form submission
├── themes/                         # Mantine theme
└── utils/                          # constants, siteConfig (env), styles (tokens, mixins, fonts, global)
```

## Notes

- **Mantine runs unstyled.** Accordion (FAQ) and TextInput (form) come from Mantine for keyboard handling and ARIA wiring, `@mantine/form` handles validation, and `@mantine/hooks` covers the observers. Every visual comes from the SCSS modules so the page matches the design exactly. Mantine's global stylesheet isn't imported because its baseline (for example `body { line-height: 1.55 }`) would shift the layout.
- **Fonts are self-hosted** (no Google Fonts requests; the privacy note says there's no third-party tracking). Hanken Grotesk is declared for weights 400–700 only, matching what the design loaded from Google, so text set at weight 800 renders at 700 just as it did in the design.
- **Breakpoints are CSS media queries** at the design's widths (760, 940, 1100, 600, 640, 420 px), not JS resize state.
- **Sticky nav.** The nav stays sticky down the whole page, as the design's CSS specifies. In the Claude Design preview it stops sticking after the first screen because of the preview wrapper, not the design.
- **Builds are always production builds**, even when a machine has `NODE_ENV` set to something else (see `vite.config.ts`).
- The privacy note still contains the design's highlighted placeholders (names, address, form service, hosting provider, retention period, authority). Fill them in before launch.
