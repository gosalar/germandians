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
npm run test:visual          # pixel comparison with the design reference
npm run test:visual:quick    # the fast subset, for use while working
```

## Stack and structure

React 19, React Router 8 in framework mode with build-time prerendering, Vite 8, strict TypeScript, Mantine 9 with a brand theme, SCSS modules, React Compiler.

- **Pages** live in `src/pages/`. Each home section is a folder under `src/pages/Home/` with `index.tsx`, `styles.module.scss`, and `data.ts` when it has copy or data.
- **Routes** in `src/routes/` are thin: metadata plus a re-export of the page. Register them in `src/routes.ts` and add public pages to the prerender list in `react-router.config.ts`.
- **Copy and rules live in data, not in components.** `src/pages/Check/data.ts` holds the formula, the options and every line of result copy; `index.tsx` makes no copy decisions. Follow that split.
- **Cross-page constants** (routes, section ids, nav links, contact details, shared wording such as `FEE_PROMISE`) are in `src/utils/constants.ts`.
- **One source per fact.** Anything stated in more than one place reads from one constant or setting, the way every intake mention reads `siteConfig.intake`. Never retype a shared fact.
- **Settings** are `VITE_*` variables read and validated once in `src/utils/siteConfig.ts`. A new setting is documented in four places: `config/.env.example`, the README "Settings" table, `src/vite-env.d.ts` and the `env:` block of `.github/workflows/pages.yml`. Empty or invalid values fall back to a safe default. Validators that the build script also needs live in `src/utils/contactSettings.ts`. `scripts/build.mjs` warns about settings that should be filled in before launch.
- **Option lists are `as const` arrays with types derived from them.** An invalid value should be a type error.
- **The contact section is shared** by `/` and `/check` (`src/pages/Home/Contact/`). `/check` passes it a summary of what the visitor entered; it must never contain example or default values.
- **Section links** that can appear on another page go through `HomeSectionLink`, which decides between in-page scrolling and routing home.
- **The site shell** (`src/routes/site-layout.tsx`) wraps `/` and `/check` with the header, footer, phone action bar and `PageChromeProvider`. `/privacy` and the 404 page have their own minimal nav.
- **Shared controls come from Mantine** with a brand theme in `src/themes/`. See "Mantine" below.

## Mantine

Mantine 9 is used with its own styles: not in unstyled mode, and not through a CSS-in-JS library.

- **Styles load per component, inside a cascade layer.** `src/themes/mantine-styles.ts` imports each component's `.layer.css`. The site's SCSS is unlayered, so it always wins without `!important`. Never import `@mantine/core/styles.css` or any unlayered Mantine stylesheet.
- **The brand look lives in the theme.** `src/themes/index.ts` builds it with `createTheme`. Each overridden component has a folder `src/themes/<Component>/` holding `index.ts` (`Component.extend` with `defaultProps` and `classNames`) and `styles.module.scss`. Variants and sizes are styled through data attributes (`&[data-variant='navy']`, `&[data-size='lg']`), not through wrapper components.
- **Use the themed controls for shared UI:** buttons, text fields, accordions and status badges. `Button` takes `variant` (`navy`, `navy-step`, `yellow`, `yellow-dark`, `ring`, `ring-dark`, `outline`, `menu`) and `size` (`nav`, `md`, `lg`, `step`, `submit`, `menu`). A link that looks like a button is a `Button` with `component="a"`, `component={Link}` or `component={HomeSectionLink}`.
- **A new look is a new variant in the theme,** not a one-off override in a page's stylesheet.
- **Adding a component:** add its `.layer.css`, and those of any component it depends on, to `mantine-styles.ts`. If it needs brand styling, add its override folder and register it in `src/themes/index.ts`. Add it to the dev-only preview at `/_theme` (`src/routes/theme.tsx`), then run the visual suite.
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
- No claims about other consultancies or schools without a source.
- Don't decide legal questions (which privacy law, tax or disclosure applies). Build the place for the answer and flag what's missing.
- Describe what is on the page. Don't tell visitors what was left out or why (that a detail was withheld, that someone asked not to be named, that something needed permission).
- List every copy change in your report as before → after.

## Accessibility and layout

- Keyboard access, visible focus, labels, ARIA and reduced-motion behaviour must keep working wherever you touch them. Errors are announced and understandable without colour.
- Sticky elements (the nav, sticky section intros, the phone action bar) must never cover the focused element.
- Check changes at phone, tablet and desktop widths: at least 320, 390, 768, 1024 and 1440, plus the in-between widths around the breakpoint you touched. No sideways scrolling at any width.

## Tests

| Suite | Covers | Notes |
| --- | --- | --- |
| `npm run lint`, `npm run typecheck` | ESLint, route types, TypeScript | |
| `npm run build` | Production build and prerender | Reads `config/.env.local` if present |
| `npm run test:ux` | Grade check, form states and delivery, contact labels, journey playback, typography roles, console and hydration errors | Builds two pinned variants into `test-results/ux-builds/`: `endpoint` (number and form endpoint set, port 5603) and `email` (both empty, port 5604). Local settings never affect it |
| `npm run test:visual` | `/` and `/privacy` compared pixel for pixel with the design reference, plus interaction states | Builds with default settings only, into `.visual-build/` (ports 5601 and 5602) |

CI runs lint, build, the visual suite and the UX suite on every pull request and push to `main`. A failure blocks deployment.

- **Add or update a test in `tests/ux/` for every behaviour you change.** There is no unit-test runner; pure logic is tested through the page.
- **A setting has two states to cover.** The visual suite always sees defaults; pin the configured state in the UX suite's `endpoint` variant.
- **`/check` has no design reference.** Only the UX suite and your own browser checks cover it.

### Deliberate design changes

`tests/visual/reference/` is a hand-maintained copy of the design. When you change how `/` or `/privacy` looks or behaves on purpose:

1. Run the full visual suite before you start; it must pass.
2. Make the change, then triage every failing check from the diff images in `test-results/visual/<test>/`. A difference outside the element you meant to change is a regression.
3. Mirror the change in the reference and note it in `tests/visual/reference/README.md`.
4. Run the full suite again. It must pass with the tolerance untouched.

The home reference is a template: inline-styled markup with `{{ }}` bindings and `sc-if` / `sc-for` blocks, classes in the `<style>` block for anything needing breakpoints, and a `Component` class at the bottom that holds its data and behaviour (months, FAQ toggles, form validation and submit, contact labels). Behaviour changes are mirrored in that class, not only in markup. Its fonts come from `fonts.css`, served from the installed font packages.

Never raise `MAX_DIFF_PIXELS`, skip or delete a check, or edit the reference to hide a regression. If a scenario names text you changed, update the scenario in the same change.

## Environment

- **Builds force production mode** (`vite.config.ts`, `scripts/build.mjs`) because a machine-wide `NODE_ENV` would otherwise ship React's development build. Don't remove the guards; use `npm run build`.
- **Windows with PowerShell and Git Bash.** Write files with editing tools, not shell heredocs. In Git Bash, set `MSYS_NO_PATHCONV=1` when passing a path that starts with `/`, such as `SITE_BASE_PATH=/germandians/`.
- **Ports in use by tooling:** 5173 dev, 4173 preview, 5601 and 5602 visual suite, 5603 and 5604 UX suite. Don't start your own server on one a suite is about to use. Node runs through shims here, so freeing a port means ending both the parent and child process.
- **Node 24 in CI, newer locally.** `scripts/build.mjs` imports a `.ts` file directly, so it needs a Node version that runs TypeScript natively.
- **Git-ignored output:** `build/`, `.visual-build/`, `.visual-cache/`, `test-results/`, `playwright-report/`. Save screenshots and measurements under `test-results/`.
- **Sass prints `map-get` deprecation warnings** from `fonts.scss` during builds. Known noise.
- **Measure scroll positions in headless Playwright,** not in a browser pane that may be hidden: the site uses smooth scrolling, which stalls in background tabs.
- **Pages deployment** builds with `SITE_BASE_PATH` set to the repository path. Asset and link URLs must respect the base path; the README explains how to preview the subpath locally.

## Plans

Larger pieces of work arrive as a plan: a Markdown file the owner points you to. Plans are not kept in the repository; finished ones are archived locally in the git-ignored `ImplementedFeatures/` folder, so never stage or commit them. Read the whole plan, and any shared brief it points to, before changing anything. Plans say what to change, what done looks like and which rules apply; working out how is your job. Where a plan and this file disagree, follow the plan and say so.

## Before you report

1. `npm run lint`, `npm run typecheck` and `npm run build` pass.
2. `npm run test:ux` passes, including the tests you added.
3. `npm run test:visual` passes, with the reference mirrored if the design changed on purpose.
4. You looked at the change in a real browser at phone, tablet and desktop widths, by keyboard as well as pointer, with zero console errors.

Then report: what changed and where, every copy change as before → after, new or changed settings, test results with counts, and plainly what you could not verify. Chrome device emulation is not a test on a physical phone or in Safari; name the engines and viewports you actually used.
