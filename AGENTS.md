# Germandians development

Public site for Germandians, a student-led consultancy that helps Indian students apply to German universities: a landing page (`/`), a grade check (`/check`), a privacy note (`/privacy`) and a 404 page. Read `README.md` first for scripts, settings and structure. This file holds the rules and conventions that aren't obvious from the code.

## Hard rules

1. **Work on a task branch.** Create it with `git switch -c <name>`.
2. **Don't commit, push, merge or open a PR unless the user asks.** A push to `main` deploys the live site.
3. **Never push `main` wholesale.** Local `main` can hold commits that must stay local. When asked to push, push only the commit the user names (`git push origin <sha>:main`) and say what was left behind.
4. **Other people and agents work in this folder.** Run `git status` before you start. Changes you didn't make aren't yours: don't revert, reformat, stage or commit them, and don't switch branches over them without asking.
5. **Never run commands that discard work:** `git clean`, `git stash -u`, `git reset --hard`, `git checkout -- .`, force-push. Untracked files here can be someone's only copy.
6. **Never send a real enquiry.** Tests intercept every form request. A delivery test against a real endpoint or inbox is the owner's step.
7. **Never invent facts** about the business or about German admissions: no prices, counts, names, cases, quotes, success rates, deadlines, guarantees or partnerships. Details about real people (names, photos, their stories) come only from the owner. Ask, or leave the claim out.
8. **No tracking and no third-party runtime requests:** no analytics, provider scripts, remote fonts or profiling CAPTCHAs. The privacy note promises this.
9. **Commit and PR text is plain and written as the owner would write it.** One imperative sentence as the subject, like the existing history ("Lead the nav with Grade check and link it from the fees section"). Never mention AI tools or assistants, and never add `Co-Authored-By` or "generated with" lines.
10. **If your environment can't write inside `.git`,** say so and carry on with the file changes. Don't work around it; the user creates the branch or commit.
11. **Stay in scope.** Fix what you were asked to fix. Report other problems you notice; don't change them.

## Commands

```bash
npm ci
npm run dev                  # http://localhost:5173
npm run lint
npm run typecheck            # route types, then TypeScript
npm run build                # typecheck, production build, prerender into build/client/
npm run preview              # serves build/client at http://localhost:4173
npm run test:ux              # behaviour, layout, form and typography checks
```

## Stack and structure

React 19, React Router 8 in framework mode with build-time prerendering, Vite 8, strict TypeScript, Mantine 9 with a brand theme, SCSS modules, React Compiler.

- **Pages** live in `src/pages/`. Each home section is a folder under `src/pages/Home/` with `index.tsx`, `styles.module.scss`, and `data.ts` when it has copy or data.
- **Routes** in `src/routes/` are thin: metadata plus a re-export of the page. A public page is one entry in the page registry (`src/utils/pageRegistry.ts`), with its title, description and preview-image labels in `src/utils/publicPages.ts`. Routes, `ROUTES`, prerendering and the sitemap derive from the registry entry; metadata and social images read both. Both files must load in plain Node.
- **Copy and rules live in data, not in components.** `src/pages/Check/data.ts` holds the options and every line of result copy. The checker's calculations sit in their own logic module, apart from the copy. `index.tsx` makes no copy decisions. Follow that split.
- **Cross-page constants** (nav links, contact details, shared wording such as `FEE_PROMISE`) are in `src/utils/constants.ts`. Section ids live in `src/utils/sections.ts` and are re-exported from `constants.ts`. Routes are derived from the page registry, not typed in `constants.ts`.
- **One source per fact.** Anything stated in more than one place reads from one constant or setting, the way every intake mention reads `siteConfig.intake`. Team size, students per mentor and intake places are defined in `src/utils/constants.ts`. Publishing a fact in a section is a separate choice from holding it: team size is held for the capacity calculation, and the owners have chosen not to publish it. Never retype a shared fact.
- **Settings** are `VITE_*` variables read and validated once in `src/utils/siteConfig.ts`. A new setting is documented in four places: `config/.env.example`, the README "Settings" table, `src/vite-env.d.ts` and the `env:` block of `.github/workflows/pages.yml`. Empty or invalid values fall back to a safe default. Validators that the build script also needs live in `src/utils/contactSettings.ts`. `scripts/build.mjs` warns about settings that should be filled in before launch.
- **Option lists are `as const` arrays with types derived from them.** An invalid value should be a type error.
- **The contact section is shared** by `/` and `/check` (`src/components/Contact/`). Pages import its public entry only. `/check` passes it a summary of what the visitor entered; it must never contain example or default values.
- Shared components, services and fact modules never import from a page folder.
- **Section links** that can appear on another page go through `HomeSectionLink`. Navigation destinations are defined once for the nav, the phone menu and the footer. A section link scrolls locally when the page's registry entry lists that section, and routes to Home otherwise. Grouped menus are built when a feature first needs one.
- **The site shell** (`src/routes/site-layout.tsx`) wraps `/` and `/check` with the header, footer, phone action bar and `PageChromeProvider`. `/privacy` and the 404 page use the shared minimal navigation, and utility pages use the shared page header and container. The error page's pieces must render without providers.
- **Shared controls come from Mantine** with a brand theme in `src/themes/`. See "Mantine" below.

## Mantine

Mantine 9 is used with its own styles: not in unstyled mode, and not through a CSS-in-JS library.

- **Styles load per component, inside a cascade layer.** `src/themes/mantine-styles.ts` imports each component's `.layer.css`. The site's SCSS is unlayered, so it always wins without `!important`. Never import `@mantine/core/styles.css` or any unlayered Mantine stylesheet.
- **The brand look lives in the theme.** `src/themes/index.ts` builds it with `createTheme`. Each overridden component has a folder `src/themes/<Component>/` holding `index.ts` (`Component.extend` with `defaultProps` and `classNames`) and `styles.module.scss`. Variants and sizes are styled through data attributes (`&[data-variant='navy']`, `&[data-size='lg']`), not through wrapper components.
- **Use the themed controls for shared UI:** buttons, text fields, accordions and status badges. `Button` takes `variant` (`navy`, `navy-step`, `yellow`, `yellow-dark`, `ring`, `ring-dark`, `outline`, `menu`) and `size` (`nav`, `md`, `lg`, `step`, `submit`, `menu`). A link that looks like a button is a `Button` with `component="a"`, `component={Link}` or `component={HomeSectionLink}`.
- **A new look is a new variant in the theme,** not a one-off override in a page's stylesheet.
- **Adding a component:** add its `.layer.css`, and those of any component it depends on, to `mantine-styles.ts`. If it needs brand styling, add its override folder and register it in `src/themes/index.ts`. Add it to the dev-only preview at `/_theme` (`src/routes/theme.tsx`), then review it in the browser and check its affected uses as described below.
- **Per-instance styling** uses `className` or `classNames` with SCSS module classes. Use inline `style` only for values that come from data, as the intake badge's colours do.
- **Forms use `@mantine/form`** (`useForm` with a `validate` map, as in `ProfileReviewForm`). Reach for `@mantine/hooks` (`useIntersection`, `useReducedMotion`, `useWindowEvent`) before writing your own hook.
- **The theme sets the cross-cutting behaviour:** light scheme only, the focus ring (`focusClassName`), `respectReducedMotion`, and font families through CSS variables. Don't override those per component.
- **Bespoke pieces stay custom:** the receipt, the stamp cards, the comparison tables, the month explorer and the native consent checkbox. Keep a control custom when a themed one can't reproduce the design.

## Code conventions

- **Prerendering must stay clean.** Pages are rendered to HTML at build time and hydrated in the browser. Anything that reads `window`, `document`, `matchMedia`, storage or the clock runs after mount. Zero hydration warnings and zero console errors.
- **React Compiler is on.** Don't add `useMemo`, `useCallback` or `memo` by hand.
- **No new runtime dependencies** unless the task is impossible without one. Say why if you add one. Don't add a test framework; extend `tests/ux/`.
- **External links** open in a new tab with `rel="noopener"`.
- **Facts from outside organisations** (APS, dMAT, uni-assist, visas, tuition) come from the official source, are re-read when you change them, and are shown with a source link and a "last reviewed" date kept in data.
- **Keep the README true.** Update the pages list, the Settings table, the Structure tree, the test counts and the Notes when your change affects them.
- **Logic and state:** keep substantial pure logic, interaction state and network calls apart where it helps; keep shared context narrow.
- **Documentation upkeep:** a change that alters one of these conventions updates `AGENTS.md` in the same change; a one-off exception is recorded with its scope.

## Styling

- SCSS modules plus the Mantine theme. No other styling system.
- Colours, fonts and breakpoints come from `src/utils/styles/_tokens.scss`; shared patterns from `_mixins.scss` (`from`, `below`, `section-padding`, `container`, `touch-area`, the typography mixins). Don't hard-code a value a token covers. Keep brand colours in step with `src/themes/colors.ts`.
- Breakpoints are CSS media queries through `from($bp-…)` and `below($bp-…)`, never JavaScript resize state.
- No `!important`. No setting `element.style` from event handlers; use CSS states and data attributes.
- Touch targets are at least 44px on touch screens (`touch-area`).
- The visual identity stays: the receipt, the stamp cards, the form styled as a German form, the palette. Change them only when the task says so.

## Typography

Three self-hosted brand fonts, used by role:

| Role | Font | Shared definition |
| --- | --- | --- |
| Page and section headings, display numbers | Archivo Variable | `$font-display`, `display-heading`, `sub-heading` |
| Prose, form questions, page introductions, navigation and action buttons | Hanken Grotesk Variable | `$font-body`, `body-copy`, `page-lead`, `navigation-font` |
| Metadata labels, compact choices and data-entry values | Barlow Semi Condensed | `$font-label`, `label-font` |

- `_tokens.scss` owns the family stacks; `global.scss` exposes them as CSS variables for the Mantine theme. Don't write literal family stacks in components, and don't change family at a breakpoint.
- Use `display-heading($size)` for page titles and `page-lead($size)` for their introductions. Utility pages may use smaller sizes than the home hero; family, weight and heading width stay the same for the same role.
- Content shown twice, in compact and full layouts, uses the same role. Both grade classifications use `label-font(700, 16px)`; every checker answer and preset button uses `label-font(700, 15px)`.
- Inline navigation and phone menu links share `navigation-font` (Hanken 600). Journey phase labels and the phone phase choices share Barlow 700. Larger touch layouts may grow the size, not change family or weight.
- Declared faces match the weights in use: Hanken and Archivo 400–900; Barlow 400, 500, 600, 700 and 800. Don't bring back the old Hanken 700 cap. Archivo needs the `wdth` files, which carry both the weight and width axes.
- Fonts load locally from Fontsource. Keep the Archivo and Hanken Latin preloads in `src/root.tsx` in step with `fonts.scss`, and let Vite generate their URLs so the base path is respected.
- Keep `text-size-adjust: 100%` and its WebKit prefix so phones don't inflate text. Browser and accessibility zoom must keep working.
- Headings, body copy and metadata are meant to differ. Consistency means one definition per role, not one font or size everywhere.

## Copy

- Plain and direct, short sentences, British spelling ("programme", "organisations", "personalised"). No hype words, no exclamation marks, no "guaranteed".
- Never predict admission or suggest suitability from a grade. Universities decide; requirements are programme-specific.
- Describe a service as help or guidance through the concrete things the team does, not "we handle everything". Wherever the offer is described, state its availability limit beside it; a one-line summary that only names the help can leave the limit to the section it points to. The service's scope comes from the owners: an official source supports a rule, never the claim that Germandians offers something.
- No claims about other consultancies or schools without a source.
- Don't decide legal questions (which privacy law, tax or disclosure applies). Build the place for the answer and flag what's missing.
- Describe what is on the page. Don't tell visitors what was left out or why (that a detail was withheld, that someone asked not to be named, that something needed permission).
- List every copy change in your report as before → after.

## Accessibility and layout

- Keyboard access, visible focus, labels, ARIA and reduced-motion behaviour must keep working wherever you touch them. Errors are announced and understandable without colour.
- Sticky elements (the nav, sticky section intros, the phone action bar) must never cover the focused element.
- For UI changes, review affected pages or components in a real browser at phone, tablet and desktop widths: 320, 390, 768, 1024 and 1440, plus the in-between widths around any breakpoint you touched. Check wrapping, spacing, clipping, sideways scrolling and sticky overlap, and exercise affected controls by keyboard and pointer. Review shared layout or theme changes on their affected page types; unrelated pages do not need a fresh sweep for every edit.
- Visual quality is assessed in the rendered UI; tests do not replace that review.

## Tests

| Suite | Covers | Notes |
| --- | --- | --- |
| `npm run lint`, `npm run typecheck` | ESLint, route types, TypeScript | |
| `npm run build` | Production build and prerender | Reads `config/.env.local` if present |
| `npm run test:ux` | Grade check, form states and delivery, contact labels, journey playback, typography roles, console and hydration errors | Builds two pinned variants into `test-results/ux-builds/`: `endpoint` (number and form endpoint set, port 5603) and `email` (both empty, port 5604). Local settings never affect it |

CI runs lint, the build and the UX suite on every pull request and push to `main`. A failure blocks deployment.

- **Keep automated tests proportional to the risk.** Add or update a focused Playwright test when a change affects an important user flow or prevents a meaningful regression: navigation, enquiry validation/submission, calculations, mock-test completion and timing when implemented, or keyboard access. Reuse existing coverage; do not add tests simply because a file changed.
- **Routine edits should stay lightweight.** Copy, spacing, colour and static-content edits do not automatically need new tests. Use browser review for their visual impact. Add an automated check only when there is a specific behaviour or defect worth protecting.
- **Assert outcomes, not incidental implementation.** Prefer roles, labels and accessible names for interaction targets; use stable IDs where appropriate. Keep exact text assertions when the wording itself matters, such as consent or fee terms, rather than duplicating whole marketing paragraphs in behaviour tests. Do not remove useful accessible-name checks merely to avoid a text match.
- **Run the checks affected by the change.** Use focused existing specs for local work; run the full UX suite for changes spanning shared behaviour or when narrower coverage cannot address the risk. Broaden or repeat checks when new edits, failures or unresolved concerns justify it.
- **Settings need configured and fallback coverage when their behaviour changes.** Use the pinned UX variants: `endpoint` for the configured state and `email` for the defaults. Tests must continue to intercept every enquiry request.
- A unit-test runner and Storybook are deferred until a feature needs them.

### Visual review and the retired reference approach

The reference HTML was an independent target for porting the original design into production React. That porting role is finished. The production React components are now the implementation to maintain.

- Do not mirror intentional React changes into a second HTML implementation or introduce mandatory screenshot baselines. Review the rendered changes at the representative widths above, including neighbouring content that could be affected.

## Environment

- **Builds force production mode** (`vite.config.ts`, `scripts/build.mjs`) because a machine-wide `NODE_ENV` would otherwise ship React's development build. Don't remove the guards; use `npm run build`.
- **Windows with PowerShell and Git Bash.** Write files with editing tools, not shell heredocs. In Git Bash, set `MSYS_NO_PATHCONV=1` when passing a path that starts with `/`, such as `SITE_BASE_PATH=/germandians/`.
- **Ports in use by tooling:** 5173 dev, 4173 preview, 5603 and 5604 UX suite. Don't start your own server on one a suite is about to use. Node runs through shims here, so freeing a port means ending both the parent and child process.
- **Node 24 in CI, newer locally.** `scripts/build.mjs` imports a `.ts` file directly, so it needs a Node version that runs TypeScript natively.
- **Git-ignored output:** `build/`, `test-results/`, `playwright-report/`. Save measurements and other scratch output under `test-results/`.
- **Sass prints `map-get` deprecation warnings** from `fonts.scss` during builds. Known noise.
- **Measure scroll positions in headless Playwright,** not in a browser pane that may be hidden: the site uses smooth scrolling, which stalls in background tabs.
- **Pages deployment** builds with `SITE_BASE_PATH` set to the repository path. Asset and link URLs must respect the base path; the README explains how to preview the subpath locally.

## Plans

Larger pieces of work arrive as a plan: a Markdown file the owner points you to. Plans are not kept in the repository; finished ones are archived locally in the git-ignored `ImplementedFeatures/` folder, so never stage or commit them. Read the whole plan, and any shared brief it points to, before changing anything. Plans say what to change, what done looks like and which rules apply; working out how is your job. Where a plan and this file disagree, follow the plan and say so.

## Before you report

1. For code or configuration changes affecting the application, run `npm run lint`, `npm run typecheck` and `npm run build`. Documentation-only changes need a diff/consistency check, not an application build or browser run.
2. Run the relevant behaviour checks as described above and report their results. New tests are justified by risk, not required for every edit.
3. For UI changes, review the rendered result at the representative widths above and exercise affected interactions, with zero console or hydration errors.

Then report: what changed and where, every copy change as before → after, new or changed settings, test results with counts, and plainly what you could not verify. Chrome device emulation is not a test on a physical phone or in Safari; name the engines and viewports you actually used.
