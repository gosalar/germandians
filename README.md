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

`dist/` is a static site. Any static host works (Vercel, Netlify, Cloudflare Pages, GitHub Pages) as long as unknown paths fall back to `index.html`, so `/privacy` loads.

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
