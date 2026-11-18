# Germandians website

Landing page, German grade conversion, a beginner's guide to master's requirements, a dMAT guide and practice tests, About us, Community and Learn German pages, and privacy note for Germandians. The grade check and the requirements questions start empty and do not predict admission or recommend universities.

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
npm run check:bank # validate the dMAT question bank
```

`build/client/` contains ready-to-serve HTML for every page in the page registry, including `/dmat/` and `/dmat/practice/`. Configure your static host to serve directory indexes and to answer missing pages with `404.html` (a copy of the SPA fallback that the build writes). GitHub Pages and the preview server do both.

To preview the Pages subpath locally, build with `SITE_BASE_PATH=/germandians/`, copy `build/client/` to a folder named `germandians` inside a temporary directory, and serve that parent directory. Open `/germandians/`, `/germandians/about/` and `/germandians/privacy/`. For ordinary local preview, leave `SITE_BASE_PATH` unset. In Git Bash on Windows, also set `MSYS_NO_PATHCONV=1`, otherwise Git Bash rewrites `/germandians/` into a Windows path and the build rejects it.

## Tests

```bash
npm run test:ux       # includes the dMAT guide, practice flows, clock and browser storage
npm run test:recheck  # viewport sweep of a build you are already serving
```

The UX suite builds two isolated production variants under `test-results/ux-builds/`: `endpoint` pins a fictitious WhatsApp number, a fictitious public origin and two intercepted, fictitious Apps Script web apps, one per form; `email` leaves them empty or invalid. It checks the three pages that carry the profile-review form at phone and desktop widths, checker layouts, optional-field validation, success, the plain-text request Apps Script needs (and, with a stand-in fetch, that its redirect is followed), body-level errors, network failure, timeout, retry and the email draft. It follows the home links to the about, community and German pages, the About group in the header and the phone menu, direct loads of each page with and without a trailing slash, the German lessons form (validation order, its payload to its own sheet and its email draft) and its terms, and the "Teach me German" tick box on the profile-review form. On the requirements page it checks that the guide is in the page HTML without any answers, that every topic shows an official source with its review date, the dMAT detail, the costs and the common questions, how answers drive the next steps and the stamps, that a follow-up loses its answer when it is hidden, that an answers summary goes with a request only when the visitor ticks it, that answers and a valid grade survive client-side navigation and clear on reload, and the phone question flow by keyboard. It also runs an axe accessibility scan (development dependency `@axe-core/playwright`), keyboard focus against the sticky elements, the skip link, sharing metadata, the sitemap, and a sweep of every page at 22 viewport sizes for sideways overflow, console errors and the main controls, including the header row at 1219, 1220 and 1221px. Locally the tests use your installed Chrome. CI uses Playwright's Chromium. No test sends a real enquiry.

To run one spec against those freshly built variants, build them and pass the spec to Playwright:

```bash
node tests/ux/build.mjs && npx playwright test --config playwright.ux.config.ts tests/ux/enquiry.spec.ts
```

A focused spec is enough while a change stays inside one flow. Run the full `npm run test:ux` when a change spans shared behaviour, or when one spec cannot cover the risk. Playwright serves the two variants on ports 5603 and 5604 by default, or on `UX_PORT_BASE` and `UX_PORT_BASE + 1` when `UX_PORT_BASE` is set.

The suite has 241 cases across its two variants. The dMAT specs cover guide navigation, all three practice modes, keyboard answers, the clock, local storage, the practice record and a test screen that fails to load.

`npm run test:recheck` runs the same viewport sweep against a build you serve yourself, by default at `http://localhost:5611/germandians` (set `RECHECK_BASE_URL` for another address). Use it for the Pages subpath: build with `SITE_BASE_PATH=/germandians/`, copy `build/client/` into a `germandians` folder, copy its `404.html` into the parent as well (GitHub Pages answers a project site's missing paths with that site's `404.html`), and serve the parent with `node scripts/serve.mjs <parent> 5611`.

## GitHub Pages

In the repository's **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source. To override the public site settings listed below, add repository variables under **Settings → Secrets and variables → Actions → Variables** before building.

Pull requests targeting `main` run lint, the dMAT bank check, TypeScript checks, a production build and Playwright tests. A successful push to `main` publishes `build/client/` at [gosalar.github.io/germandians](https://gosalar.github.io/germandians/). The workflow builds with `SITE_BASE_PATH` (default `/germandians/`) for both Vite assets and router links. The build places the prerendered pages at their artifact-relative paths, writes the SPA fallback as `404.html`, and writes `sitemap.xml` and `robots.txt`. To redeploy after changing a variable, run **Site CI and Pages deployment** manually on `main` from the Actions tab.

**Moving to a custom domain.** After the domain is bought and its DNS points at GitHub Pages (see GitHub's custom-domain documentation), set the domain under **Settings → Pages → Custom domain** and turn on **Enforce HTTPS**. Then set two repository variables: `SITE_BASE_PATH` to `/` and `VITE_SITE_ORIGIN` to the domain's HTTPS origin, for example `https://example.com`. A workflow deployment needs no `CNAME` file. Canonical URLs, sharing tags, the sitemap and `robots.txt` follow these two settings. A new business mailbox replaces `CONTACT.email` in `src/utils/constants.ts`; update the privacy note's description of the email provider at the same time.

## Settings

The design's editable "props" are environment variables. Copy `config/.env.example` to `config/.env.local` and fill in what you need:

| Variable | Allowed value and default behaviour |
| --- | --- |
| `VITE_SITE_ORIGIN` | Public HTTPS origin without a path, used for canonical, sharing and sitemap URLs; combined with `SITE_BASE_PATH`. Missing: `https://gosalar.github.io`; invalid: the same, with a build warning |
| `VITE_WHATSAPP_NUMBER` | International number, 10–15 digits after stripping punctuation, first digit nonzero. Missing or invalid: “Open review form” / “Profile review” links go to the form, with a production warning |
| `VITE_WHATSAPP_COMMUNITY_URL` | Invitation to the WhatsApp community that may be published: an HTTPS `chat.whatsapp.com/…` or `whatsapp.com/channel/…` link. Set: the community page shows “Join the WhatsApp community”. Missing or invalid: no join link; the WhatsApp row offers “Ask about the WhatsApp community on Instagram” instead (invalid values warn at build time) |
| `VITE_FEE_AFTER_ADMISSION` | Advertised service fee; empty shows "Written quote". Timing and any exception are agreed in the written quote. Values longer than 16 characters appear in full in the fee explanation, with "See quote" on the receipt |
| `VITE_INTAKE_STATUS` | `Not confirmed` shows no badge; `Enquiries open`, `Waitlist only`, `Enquiries closed` show one |
| `VITE_INTAKE_SEASON` | `Summer`; accepts `Winter` or `Summer`. Winter uses academic-year notation |
| `VITE_INTAKE_YEAR` | `2027`; accepts a four-digit starting year from `1000` to `9999`. Winter + 2027 displays `Winter 2027/28`; summer displays `Summer 2027` |
| `VITE_PRIVACY_NAMES` | Registered business name / responsible entity, plain text. Shown in the privacy note and in the footer as "Operated by …"; omitted from both in production if empty, with a build warning |
| `VITE_PRIVACY_ADDRESS` | Business postal address, plain text. Shown with the name in both places; omitted in production if empty |
| `VITE_PRIVACY_HOSTING_PROVIDER` | Hosting provider; omitted in production if empty |
| `VITE_PRIVACY_RETENTION` | Confirmed retention period as plain text; omitted in production if empty |
| `VITE_PRIVACY_AUTHORITY` | Relevant data protection authority; example clause omitted in production if empty |
| `VITE_SHOW_SEAT_COUNT` / `VITE_SEATS_LEFT` | Seat count hidden |

CI runs the UX suite. Its builds use `test-results/ux-builds/`, preserving the Pages build in `build/client/` and its configured base path for artifact upload.

## Google Sheets

Each enquiry form sends to its own Google Sheet. Profile reviews (from Home, `/check`, `/requirements`, `/dmat` and `/dmat/practice`) go to the admissions sheet, and the Learn German form goes to the German lessons sheet. A small Apps Script inside each sheet receives the form, adds one row and answers. The two web app URLs are not settings: they are `ENQUIRY_ENDPOINTS` in `src/utils/constants.ts`, because the visitor's browser posts to them and they are public anyway. Until a URL is filled in, that form opens an email draft instead, and the build warns.

**Linking a sheet.** Do this once for each sheet, signed in to the Google account that should own the enquiries:

1. Create the spreadsheet in Google Sheets.
2. Open **Extensions → Apps Script**, replace the code in the editor with `scripts/google-sheets/admissions-sheet.gs` (or `german-lessons-sheet.gs` for the lessons sheet) and save.
3. Choose `setUp` in the function list beside **Run**, press **Run** and allow access. Google may warn that it hasn't verified the app; it is your own script, so choose **Advanced** and continue. A "Profile reviews" (or "German lessons") tab with its headings appears.
4. Choose **Deploy → New deployment**, select the type **Web app**, set **Execute as: Me** and **Who has access: Anyone**, and deploy. If **Anyone** isn't offered, the account is a Google Workspace account whose admin restricts web apps; use another account or ask the admin.
5. Copy the **Web app URL**, which looks like `https://script.google.com/macros/s/…/exec`. Paste it into `ENQUIRY_ENDPOINTS.profileReview` (or `ENQUIRY_ENDPOINTS.germanLessons`) in `src/utils/constants.ts`, then commit and push to `main` to deploy the site.
6. Open the URL in a private window. It shows `{"ready":true,…}`; a Google sign-in page means access isn't set to **Anyone**. Then send one enquiry from the live form and check that its row arrives. That delivery test is the owners' step; the automated tests never reach a real sheet.

After changing a script, publish it under the same URL: **Deploy → Manage deployments**, edit the deployment, choose **Version: New version** and deploy. A new deployment gets a new URL, which would have to be pasted again. Columns can be moved, and your own columns (a status, for example) added: the script fills its columns by heading, and adds back any of its headings that has gone missing. Rows stay in the sheet until someone deletes them, so delete them in line with the retention period the privacy note states.

**What each sheet receives.** A profile review is `{ name, email?, whatsapp, snapshot?, germanLessons?, consent: true, consentAt, source: "germandians-website" }`. Name and WhatsApp are required; email is omitted when blank. `consentAt` is an ISO timestamp. `snapshot` is present only when the visitor ticks the box that attaches the summary shown above the form. It holds that page's lines joined with ` · `: the German grade with the marks it came from when the conversion is valid (the grade check), or the answered requirements questions followed by that grade line when the conversion is valid (the requirements page). No example profile or grade band is submitted. `germanLessons: true` is present only when the visitor ticks “Teach me German”, and the admissions sheet shows it as “Interested”. A German lessons enquiry is `{ enquiry: "german-lessons", name, email?, whatsapp, language, purpose?, experience?, consent: true, consentAt, source }`; blank optional answers are omitted. A profile review never carries `enquiry`.

| Sheet | Tab | Columns |
| --- | --- | --- |
| Admissions | Profile reviews | Received, Name, WhatsApp, Email, Summary, German lessons, Consent given |
| German lessons | German lessons | Received, Name, WhatsApp, Email, Language for explanations, What they need German for, German they already have, Consent given |

**Acknowledgement.** The script answers `{ "received": true }` only after it has written the row. It answers `{ "received": false, "error": … }` when it turns a request away: one not from the website, without consent, with a missing or overlong field, or meant for the other sheet (which happens if the two URLs are swapped). Apps Script answers no CORS preflight, so the site sends the JSON as `text/plain`, which keeps it a simple cross-origin request, and follows the redirect through which Apps Script answers (`script.googleusercontent.com`). HTTP errors, empty or malformed responses and body-level failures do not count as received. The request and response share a 15-second timeout; a failed request keeps the details for retry and shows the email alternative. A lost acknowledgement can still mean the row was written, so retry messages explain this ambiguity.

**Limits.** The web app URL is public, so anyone who finds it can post to it. The script accepts only requests shaped like the website's forms, with consent, but it cannot tell a visitor from someone imitating the form; delete junk rows if any appear. Text is stored exactly as typed, never as a formula, number or date. The site loads no provider script and no tracking CAPTCHA.

With no web app URL for a form, its button says “Open email draft” and explains the handoff before submission. Opening a draft does not show a receipt. The draft includes the page's summary only when the visitor has ticked it, and the address and copyable details remain available if no email app opens. The privacy note follows the links: a form with a sheet is described as received by Google and kept in Google Sheets, and a form without one keeps the email-draft sentence.

The UX suite never uses the URLs in `constants.ts`. Its `endpoint` build sends to two fictitious web apps (`tests/ux/endpoints.ts`), which every spec that sends a form intercepts, and its `email` build has none. `vite.config.ts` swaps them in only for those builds (`UX_BUILD`).

## Structure

```txt
public/                             # favicon and social preview images (copied as-is into the build)
scripts/generate-social.mjs         # regenerates public/social/*.png from PUBLIC_PAGES with local fonts
scripts/check-sources.mjs           # compares live official pages in SOURCES against scripts/sources-snapshot.json
scripts/dmat/                       # Core generator, academic passages and bank checks
scripts/google-sheets/              # Apps Scripts to paste into the admissions and German lessons sheets
src/
├── root.tsx, routes.ts             # document, Mantine provider, skip link, route configuration
├── routes/                         # metadata, shared site layout, dev-only previews at /_theme and /_dmat
├── pages/
│   ├── Home/                       # one folder per section: index.tsx + styles.module.scss (+ data.ts, hooks);
│   │                               # Story, DmatIntro, CommunityIntro and LearnGermanIntro lead to the pages below
│   ├── Check/                      # grade check only; data.ts holds its copy, logic.ts builds the result from the conversion
│   ├── Requirements/               # beginner's guide to master's admission; copy in each folder's data.ts:
│   │                               # Opening, Questions (the Fragebogen), NextSteps (the Laufzettel), Guide, CommonQuestions, OtherApplicants;
│   │                               # Guide holds TopicCard, CostsTable, Stamp and one file per topic in topics/
│   ├── Dmat/                       # official format, registration and test-day guide
│   ├── DmatPractice/               # start and breaks; the runner, record and question files load on demand (screens.ts, bank/)
│   ├── About/                      # data.ts holds the copy and TEAM; TeamGallery (portraits and profile dialog), Portraits (stand-in animals), ExperienceRecord
│   ├── Community/                  # community page; channels and copy in data.ts
│   ├── LearnGerman/                # German lessons page; GermanLessonsForm is its enquiry form, WordDeck the flip cards
│   ├── Privacy/                    # standalone privacy note
│   └── ErrorPage/                  # 404 and route errors; copy in data.ts
├── components/
│   ├── Contact/                    # shared enquiry form for /, /check, /requirements, /dmat and /dmat/practice
│   ├── CommunityBand/, MentoringOffer/  # reusable community and service sections
│   ├── ContentContainer/, MinimalNav/, PageHeader/  # shared layout pieces
│   └── SiteHeader (with NavGroup), SiteFooter, MobileActionBar, SkipLink, Brand, HomeSectionLink, SourceNote, DmatNote
├── contexts/PageChrome/            # menu state, hero/form visibility and immersive practice screens
├── contexts/VisitAnswers/          # marks typed on /check and answers given on /requirements, kept in memory for the visit
├── hooks/                          # useReplayOnFirstView, useSettleHashScroll
├── services/                      # enquiry.ts sends to a Google Sheet or opens an email draft; profileReview.ts, germanLessons.ts
├── assets/images/                  # site images; team/ holds owner-approved team photos and the stand-in silhouette
├── themes/                         # palettes, layered styles, component overrides
└── utils/                          # constants (nav, contact, shared wording); sections.ts (section ids,
                                    # re-exported from constants.ts); pageRegistry (one entry per public page);
                                    # publicPages (titles and descriptions); siteConfig (env); applicationFacts
                                    # (dated sources and costs); gradeConversion (marks to German grade, shared by
                                    # /check and /requirements); requirements/ (topics, questions, logic);
                                    # dmat/ (session timing, marking and storage); metadata, publicSite, contactSettings, styles
```

## Notes

- **dMAT question bank.** The Core questions are generated with seeded runs and the academic passages are maintained in `scripts/dmat/`. Both follow the task formats published by g.a.s.t. Regenerate the bank with `node scripts/dmat/build-bank.ts`, then run `npm run check:bank`. Change the generators or passages when updating the content. The practice route loads each section when it is needed, and the homepage never fetches the bank.

- **Process and costs.** Shared fee wording lives in `constants.ts`; intake labels and readiness in `siteConfig.ts`; dMAT, housing, tuition and external costs with dated official sources in `applicationFacts.ts`. Re-read the official page before changing a figure there, and update its review date. The seven-month journey is an overlapping example, not a duration promise. The fee promise is the standard arrangement; the written quote defines exceptions and payment terms.
- **Official source checks.** `.github/workflows/sources.yml` runs `node scripts/check-sources.mjs` each week and on manual dispatch against `scripts/sources-snapshot.json`, writing changed or unreachable `SOURCES` URLs to the workflow summary without running on pushes or pull requests. Run `node scripts/check-sources.mjs --update` after re-reading a changed official page and updating its review date in `applicationFacts.ts`.
- **Requirements page.** The ten guide topics are data: one file each in `src/pages/Requirements/Guide/topics/`, in the shape of `Guide/types.ts`, shown by `TopicCard`. Topic ids, titles (`REQUIREMENT_TOPIC_TITLES`) and anchors are in `src/utils/requirements/topics.ts`, and links from other pages use its `requirementsHref`. The six questions, the next-steps logic and the summary lines are in `src/utils/requirements/`; the step wording is `STEP_COPY` in `NextSteps/data.ts`. The guide is in the prerendered HTML and reads without JavaScript; only the questions and the slip need it. Answers are held in `contexts/VisitAnswers/`, mounted by the site shell, so they survive moving between pages and clear on reload. Nothing is stored. The costs topic and the dMAT detail read `applicationFacts.ts`, and every official page the guide links is one `SOURCES` entry there, with its review date.
- **Housing and settling in.** The home section of that name lists the help in full, with the availability limit inside the housing card. The sentences the journey, the commitments table and the FAQ share (the availability limit, the after-arrival summary, which help is complimentary and the quote sentence) are `ARRIVAL_SUPPORT` in `constants.ts`. Complimentary help is outside the standard service, so the receipt doesn't list it. The scope of the help comes from the owners; official housing facts and their sources stay in `applicationFacts.ts`.
- **Pinned test settings.** The UX endpoint variant uses Winter 2027/28, the fictitious fee label "Test quote", a fictitious business name and address and a fictitious WhatsApp community invitation; the email variant uses Summer 2027, an empty fee, no business identity and no invitation. Both pin intake status and seat settings.
- **Claims about the team.** The community figure, the unpaid guidance before the paid service, and the statement of what the applicant checks, approves and controls each have one constant in `constants.ts`; every mention reads it. The origin story is `ORIGIN_STORY`. The home page gives each a single job: the story section tells the origin and links to About, the community intro carries the audience figure and links to the community page, the hero states the unpaid guidance and the intake readiness once, and the mentor section covers delivery, capacity and commitments. The About page tells the origin in full; the community page links there rather than retelling it. The audience figure is never used as a count of students guided. The team's size is held only to work out students per mentor; the owners have chosen to publish the cap per mentor and the intake places, not the number of mentors. The one exception is the About page's six stand-in team cards, which the owners chose to show until the real profiles arrive. Don't add a statement about other consultancies, a mentor's details or a student's case without a source from the owner.
- **Business identity and copyright year.** The footer names the operating business from the privacy settings and shows nothing when they are empty. The year is fixed at build time (`BUILD_YEAR` in `scripts/build.mjs`, passed through `vite.config.ts`), so the prerendered page and the browser always agree.

- **Adding a Mantine component.** Add its `.layer.css` and any dependent component styles to `src/themes/mantine-styles.ts`. The unlayered site SCSS takes precedence over Mantine's layer. For brand-specific defaults or variants, add an override and SCSS module under `src/themes/<Component>/` and register it in `src/themes/index.ts`. Check it at `/_theme` during development and review it in the browser.
- **Shared controls and custom artwork.** Use themed controls for buttons, fields, accordions and status badges. Keep the receipt, stamp cards, responsive comparison tables and other bespoke visuals in their feature folders. The consent checkbox uses browser-native rendering. Keep a control custom if a shared variant cannot reproduce the design.
- **Adding pages.** Put the UI in `src/pages/` and a thin module in `src/routes/` whose `meta` calls `pageMetadata`. Add one entry to `PAGE_REGISTRY` in `src/utils/pageRegistry.ts` (path, route file, shell, prerender, sitemap and the sections that page renders) and its title, description and preview-image labels in `src/utils/publicPages.ts`. Routes, prerendering and the sitemap follow that entry. A page in the `site` shell gets the header, footer and phone action bar, and lists only the section ids it renders (at least `top`, which the footer's "Back to top" needs); shared contact links then route to the form on Home. If the page should be linked, add a destination and a `PAGE_LINKS` entry in `src/utils/constants.ts`, then place it in `NAV_ENTRIES` there (the header and the phone menu) and in `FOOTER_LINKS` in `src/components/SiteFooter/data.ts`. The UX suite reads the registry, so a new page joins the metadata, sitemap, accessibility, skip-link, console and viewport checks without editing them. Then run `node scripts/generate-social.mjs` to draw its preview image. Keep preview images free of anything that can change (fees, intake, numbers). Each page's `main` element has `id="main-content"` and `tabIndex={-1}` so the skip link can reach it.
- **Sharing metadata.** Canonical, Open Graph and Twitter tags are absolute URLs built from `VITE_SITE_ORIGIN` and the base path. The 404 page and `/_theme` are `noindex` and are left out of the sitemap. Crawlers read `robots.txt` only at the root of a host, so it takes effect once the site is served from a custom domain; until then the sitemap can be submitted to search engines directly. Real link previews in WhatsApp and Instagram can only be checked once the site is public.
- **Fonts are self-hosted** (no Google Fonts requests; the privacy note says there's no third-party tracking). Archivo is used for headings, Hanken Grotesk for prose and action buttons, and Barlow Semi Condensed for labels and compact form controls. Hanken and Archivo expose weights 400–900; Barlow loads 400–800 so the requested extra-bold weights render correctly. The shared rules and validation workflow are in `AGENTS.md`.
- **Breakpoints are CSS media queries** (760, 1024, 1100, 1220, 600, 640, 420 px), not JS resize state. Navigation switches to the menu below 1220px.
- **Navigation.** The header reads `NAV_MENU` (`NAV_ENTRIES` in `constants.ts`): Grade check, Admissions (a group holding the requirements guide, the dMAT guide and dMAT practice), About (a group holding About us and Community), Learn German, Fees, Journey, FAQ and Contact, then the profile-review button. At 1220px, where the inline row starts, it has no room for another top-level link, which is why related pages share a group. Each group is a disclosure button (`NavGroup` in `SiteHeader`): click, Enter or Space opens it; Escape, an outside click, focus leaving it, choosing a link or a page change closes it. In the phone menu the same group is a labelled list. The footer reuses the same `PAGE_LINKS`.
- **Team profiles.** `TEAM` in `src/pages/About/data.ts` holds the approved profiles; while it is empty the About page shows no team section. Until the owners send the profiles, it holds six stand-ins (`standIn(1, 'peacock')` to `standIn(6, 'owl')`: "Team member n" with a drawn animal from `Portraits.tsx`), and `npm run build` warns that they are still there. Replace each stand-in line with a full profile whose `portrait` is `{ kind: 'photo', … }`. Each portrait opens the person's profile sheet in a dialog. Add a person only with the name, role, short biography and photo the owners approve, and optional details only when supplied. Keep each photo's original where the owner provided it and add an optimised JPEG (about 800px on the long edge) as `src/assets/images/team/<id>.jpg`, imported in `data.ts` with its width, height, alt text naming the person and an optional focal point. `data.ts` imports images, so the registry and metadata modules never import it.
- **German lessons.** The charge, certificate and language sentences, the email subject and the “Teach me German” wording are `GERMAN_LESSONS` in `constants.ts`; the home intro, the page, its form and the tick box read them and show the charge and certificate terms beside each action. Lessons are separate from the admissions service and its fee promise. The enquiry has its own form on the page (`src/pages/LearnGerman/GermanLessonsForm.tsx`, service `src/services/germanLessons.ts`) and its own Google Sheet; the profile-review form only notes an interest, which goes to the admissions sheet, and links to it. Neither goes through WhatsApp. No teaching languages, levels, formats, schedules or prices are published until the owners confirm them.
- **Community.** The community page shows the audience figure with its shared label, the channels, how the community shaped the consultancy and how it differs from the paid mentoring. The WhatsApp row offers a join link only when `VITE_WHATSAPP_COMMUNITY_URL` is set.
- **Sticky nav.** The nav stays sticky down the whole page, as the design's CSS specifies. In the Claude Design preview it stops sticking after the first screen because of the preview wrapper, not the design.
- **Builds are always production builds**, even when a machine has `NODE_ENV` set to something else (see `vite.config.ts`).
- Privacy settings accept plain text without brackets. Missing details remain highlighted in development builds. Production omits missing clauses and prints a warning for each missing setting; the team must still confirm these details before launch. For a form with no Google Sheet linked, production explains that the visitor sends the form through their email app.
