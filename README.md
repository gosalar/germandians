# Germandians website

Landing page, German grade conversion and programme requirements check, and privacy note for Germandians. The checker starts empty and does not predict admission or recommend universities. The visual reference for the landing page and privacy note lives in `tests/visual/reference/`.

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
npm run test:ux              # 123 checker, contact, submission, process, trust, typography, metadata and accessibility checks
npm run test:recheck         # responsive sweep of an already-served build (see below)
```

- The full suite compares home at 10 widths, privacy at 5, and 22 interaction states including keyboard, hover, disabled and input-focus states.
- **Quick subset:** one desktop, one tablet and one phone layout, plus the key interactions. Good for checking a change while you work; the full suite is the gate before merging.
- **Requirements:**
  - Locally, the tests use your installed Chrome. CI uses Playwright's Chromium.
  - The prototype loads React and Babel from a public CDN, so the first run needs internet. Later runs serve them from `.visual-cache/`; delete that folder to refresh it. Reference fonts use the installed Fontsource binaries, with independent font-face declarations.
- **Settings:** the test build ignores `config/.env*`, so it always uses the design's default settings.
- **Failures:** the reference, app and diff images are saved under `test-results/visual/<test>/`.
- **Changing the design:** if a test fails because the design itself changed, update `tests/visual/reference/` (a new export, or a hand edit that mirrors the change) instead of loosening the test.

The UX suite builds two isolated production variants under `test-results/ux-builds/`: `endpoint` pins a fictitious WhatsApp number, a fictitious public origin and an intercepted HTTPS receiver; `email` leaves them empty or invalid. It checks both pages at phone and desktop widths, checker layouts, optional-field validation, success, body-level errors, network failure, timeout, retry and the email draft. It also runs an axe accessibility scan (development dependency `@axe-core/playwright`), keyboard focus against the sticky elements, the skip link, sharing metadata, the sitemap, and a sweep of every page at 19 viewport sizes for sideways overflow, console errors and the main controls. No test sends a real enquiry.

`npm run test:recheck` runs the same viewport sweep against a build you serve yourself, by default at `http://localhost:5611/germandians` (set `RECHECK_BASE_URL` for another address). Use it for the Pages subpath: build with `SITE_BASE_PATH=/germandians/`, copy `build/client/` into a `germandians` folder, copy its `404.html` into the parent as well (GitHub Pages answers a project site's missing paths with that site's `404.html`), and serve the parent with `node scripts/serve.mjs <parent> 5611`. Screenshots go to `test-results/recheck/screenshots/` (set `RECHECK_SCREENSHOTS` for another folder); the same sweep inside the UX suite keeps none.

## GitHub Pages

In the repository's **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source. To override the public site settings listed below, add repository variables under **Settings → Secrets and variables → Actions → Variables** before building.

Pull requests targeting `main` run lint, TypeScript checks, a production build and Playwright tests. A successful push to `main` publishes `build/client/` at [gosalar.github.io/germandians](https://gosalar.github.io/germandians/). The workflow builds with `SITE_BASE_PATH` (default `/germandians/`) for both Vite assets and router links. The build places the prerendered pages at their artifact-relative paths, writes the SPA fallback as `404.html`, and writes `sitemap.xml` and `robots.txt`. To redeploy after changing a variable, run **Site CI and Pages deployment** manually on `main` from the Actions tab.

**Moving to a custom domain.** After the domain is bought and its DNS points at GitHub Pages (see GitHub's custom-domain documentation), set the domain under **Settings → Pages → Custom domain** and turn on **Enforce HTTPS**. Then set two repository variables: `SITE_BASE_PATH` to `/` and `VITE_SITE_ORIGIN` to the domain's HTTPS origin, for example `https://example.com`. A workflow deployment needs no `CNAME` file. Canonical URLs, sharing tags, the sitemap and `robots.txt` follow these two settings. A new business mailbox replaces `CONTACT.email` in `src/utils/constants.ts`; update the privacy note's description of the email provider at the same time.

## Settings

The design's editable "props" are environment variables. Copy `config/.env.example` to `config/.env.local` and fill in what you need:

| Variable | Allowed value and default behaviour |
| --- | --- |
| `VITE_SITE_ORIGIN` | Public HTTPS origin without a path, used for canonical, sharing and sitemap URLs; combined with `SITE_BASE_PATH`. Missing: `https://gosalar.github.io`; invalid: the same, with a build warning |
| `VITE_FORM_ENDPOINT` | Absolute HTTPS URL without credentials, implementing the receipt contract below. Missing or invalid: explained email draft handoff |
| `VITE_WHATSAPP_NUMBER` | International number, 10–15 digits after stripping punctuation, first digit nonzero. Missing or invalid: “Open review form” / “Profile review” links go to the form, with a production warning |
| `VITE_FEE_AFTER_ADMISSION` | Advertised service fee; empty shows "Written quote". Timing and any exception are agreed in the written quote. Values longer than 16 characters appear in full in the fee explanation, with "See quote" on the receipt |
| `VITE_INTAKE_STATUS` | `Not confirmed` shows no badge; `Enquiries open`, `Waitlist only`, `Enquiries closed` show one |
| `VITE_INTAKE_SEASON` | `Summer`; accepts `Winter` or `Summer`. Winter uses academic-year notation |
| `VITE_INTAKE_YEAR` | `2027`; accepts a four-digit starting year from `1000` to `9999`. Winter + 2027 displays `Winter 2027/28`; summer displays `Summer 2027` |
| `VITE_PRIVACY_NAMES` | Registered business name / responsible entity, plain text. Shown in the privacy note and in the footer as "Operated by …"; omitted from both in production if empty, with a build warning |
| `VITE_PRIVACY_ADDRESS` | Business postal address, plain text. Shown with the name in both places; omitted in production if empty |
| `VITE_PRIVACY_FORM_SERVICE` | Form provider; used only with a form endpoint; omitted in production if empty |
| `VITE_PRIVACY_HOSTING_PROVIDER` | Hosting provider; omitted in production if empty |
| `VITE_PRIVACY_RETENTION` | Confirmed retention period as plain text; omitted in production if empty |
| `VITE_PRIVACY_AUTHORITY` | Relevant data protection authority; example clause omitted in production if empty |
| `VITE_SHOW_SEAT_COUNT` / `VITE_SEATS_LEFT` | Seat count hidden |

With a valid endpoint set, the form POSTs JSON: `{ name, email?, whatsapp, snapshot?, consent: true, consentAt, source: "germandians-website" }`. Name and WhatsApp are required; email is omitted when blank. `consentAt` is an ISO timestamp. `snapshot` contains only entered checker values and answered questions, with the conversion when valid; no example profile or grade band is submitted.

The receiver must allow cross-origin JSON requests from the deployed site and acknowledge durable receipt with a 2xx JSON response `{ "received": true }`, with no `error` or `errors` property. HTTP errors, empty or malformed responses, redirects, and body-level failures do not count as received. The request and response body share a 15-second timeout; a failed request preserves the details for retry and shows the email alternative. A lost acknowledgement can still mean the receiver accepted the request, so retry messages explain this ambiguity.

No provider has been selected or verified. This is the project's explicit receiver contract, not an assumption that every form provider supports it. Before setting `VITE_FORM_ENDPOINT`, confirm the chosen provider's documented success/error contract and adapt `src/services/profileReview.ts` if necessary. Use its hidden-field spam trap if offered; do not add provider scripts or tracking CAPTCHA. The owner must authorise a real delivery test and confirm arrival before item 8 can be closed. Automated tests intercept every endpoint request.

With no valid endpoint, the button says “Open email draft” and explains the handoff before submission. Opening a draft does not show a receipt. The draft includes the optional checker summary, and the address and copyable details remain available if no email app opens.

CI runs both the visual and UX suites. Their builds use `.visual-build/` and `test-results/ux-builds/`, preserving the Pages build in `build/client/` and its configured base path for artifact upload.

## Structure

```txt
public/                             # favicon and social preview images (copied as-is into the build)
scripts/generate-social.mjs         # regenerates public/social/*.png from PUBLIC_PAGES with local fonts
src/
├── root.tsx, routes.ts             # document, Mantine provider, skip link, route configuration
├── routes/                         # metadata, shared site layout, dev-only theme preview
├── pages/
│   ├── Home/                       # one folder per section: index.tsx + styles.module.scss (+ data.ts, hooks)
│   ├── Check/                      # German grade conversion and programme requirements check
│   ├── Privacy/                    # standalone privacy note
│   └── ErrorPage/                  # 404 and route errors
├── components/                     # SiteHeader, SiteFooter, MobileActionBar, SkipLink, Brand, HomeSectionLink, SourceNote, DmatNote
├── contexts/PageChrome/            # menu state + hero/form visibility for the mobile action bar
├── hooks/                          # useReplayOnFirstView, useSettleHashScroll
├── services/profileReview.ts       # form submission
├── themes/                         # palettes, layered styles, component overrides
└── utils/                          # constants, siteConfig (env), applicationFacts (dated sources and costs),
                                    # publicPages (page list, titles, descriptions), metadata, publicSite, styles
```

## Notes

- **Process and costs.** Shared fee wording lives in `constants.ts`; intake labels and readiness in `siteConfig.ts`; dMAT, housing, tuition and external costs with dated official sources in `applicationFacts.ts`. Re-read the official page before changing a figure there, and update its review date. The seven-month journey is an overlapping example, not a duration promise. The fee promise is the standard arrangement; the written quote defines exceptions and payment terms.
- **Pinned test settings.** The UX endpoint variant uses Winter 2027/28, the fictitious fee label "Test quote" and a fictitious business name and address; the email variant uses Summer 2027, an empty fee and no business identity. Both pin intake status and seat settings. The visual suite uses default Summer 2027 settings and pins the copyright year to 2026, the year its reference shows.
- **Claims about the team.** The community figure, the unpaid guidance before the paid service, and the statement of what the applicant checks, approves and controls each have one constant in `constants.ts`; every mention reads it. The home page gives each a single job: the community section tells the origin and the audience, the hero states the unpaid guidance and the intake readiness once, and the mentor section covers delivery, capacity and commitments. The audience figure is never used as a count of students guided. Don't add a statement about other consultancies, a mentor's details or a student's case without a source from the owner.
- **Business identity and copyright year.** The footer names the operating business from the privacy settings and shows nothing when they are empty. The year is fixed at build time (`BUILD_YEAR` in `scripts/build.mjs`, passed through `vite.config.ts`), so the prerendered page and the browser always agree.

- **Adding a Mantine component.** Add its `.layer.css` and any dependent component styles to `src/themes/mantine-styles.ts`. The unlayered site SCSS takes precedence over Mantine's layer. For brand-specific defaults or variants, add an override and SCSS module under `src/themes/<Component>/` and register it in `src/themes/index.ts`. Check it at `/_theme` during development and run the visual suite.
- **Shared controls and custom artwork.** Use themed controls for buttons, fields, accordions and status badges. Keep the receipt, stamp cards, responsive comparison tables and other bespoke visuals in their feature folders. The consent checkbox uses browser-native rendering. Keep a control custom if a shared variant cannot reproduce the reference.
- **Adding pages.** Put the UI in `src/pages/` and a thin `src/routes/` module whose `meta` calls `pageMetadata`. Register pages that use the shared header and footer inside the site layout in `src/routes.ts`. Add each public page to `PUBLIC_PAGES` in `src/utils/publicPages.ts`, with its title, description and preview-image labels; that list drives prerendering and the sitemap. Then run `node scripts/generate-social.mjs` to draw its preview image. Keep preview images free of anything that can change (fees, intake, numbers). Each page's `main` element has `id="main-content"` and `tabIndex={-1}` so the skip link can reach it.
- **Sharing metadata.** Canonical, Open Graph and Twitter tags are absolute URLs built from `VITE_SITE_ORIGIN` and the base path. The 404 page and `/_theme` are `noindex` and are left out of the sitemap. Crawlers read `robots.txt` only at the root of a host, so it takes effect once the site is served from a custom domain; until then the sitemap can be submitted to search engines directly. Real link previews in WhatsApp and Instagram can only be checked once the site is public.
- **Fonts are self-hosted** (no Google Fonts requests; the privacy note says there's no third-party tracking). Archivo is used for headings, Hanken Grotesk for prose and action buttons, and Barlow Semi Condensed for labels and compact form controls. Hanken and Archivo expose weights 400–900; Barlow loads 400–800 so the requested extra-bold weights render correctly. The shared rules and validation workflow are in `AGENTS.md`.
- **Breakpoints are CSS media queries** (760, 1024, 1100, 600, 640, 420 px), not JS resize state. Navigation switches to the menu below 1100px.
- **Sticky nav.** The nav stays sticky down the whole page, as the design's CSS specifies. In the Claude Design preview it stops sticking after the first screen because of the preview wrapper, not the design.
- **Builds are always production builds**, even when a machine has `NODE_ENV` set to something else (see `vite.config.ts`).
- Privacy settings accept plain text without brackets. Missing details remain highlighted in development and visual builds. Production omits missing clauses and prints a warning for each missing setting; the team must still confirm these details before launch. With no form endpoint, production explains that the visitor sends the form through their email app.
