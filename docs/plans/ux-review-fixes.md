# UX review fixes

Handoff plan for an agent with no prior context. Read it all before you change anything.

This plan says **what** is wrong, **what done looks like** and **which constraints apply**. It doesn't say how to write the code. Work that out from the repo, follow its conventions, and verify your own work. Where the plan suggests an approach, treat it as a starting point you may improve on. If you do, explain why in your report.

**Don't commit.** The owner wants the result reviewed before anything is committed. Work on a new branch, leave every change uncommitted, and finish with the report described in section 6.

---

## 1. Context

**What the site is.** Germandians is a consultancy run by six Indian students living in Germany. They help other Indian students apply to German universities. This repo is their public site: a long landing page (`/`), a privacy note (`/privacy`) and a 404 page. Live at https://gosalar.github.io/germandians/ (deployed from `main`).

**Where this plan comes from.** A strict, user's-eye review of the live site at desktop, tablet and phone widths. The owner went through every finding and decided which to fix. Section 4 lists only the fixes they accepted. Section 5 lists what they explicitly ruled out. Don't touch those.

**Stack.** React 19, React Router 8 in framework mode with build-time prerendering, Vite 8, TypeScript (strict), Mantine 9 with a brand theme in `src/themes/`, SCSS modules, React Compiler. The README covers scripts, settings and structure. Read it first.

**Read before starting** (about 20 minutes):
- `README.md`: scripts, the "Settings" table (env-driven site settings), visual tests, structure.
- `docs/plans/phase-1-foundation.md`: the previous handoff. Its sections 2 and 3 (rules and environment traps) still apply, except where section 2 below relaxes them.
- `src/utils/constants.ts` and `src/utils/siteConfig.ts`: section ids, nav links, contact details, and how env settings are read and validated. Two of the fixes extend this.
- `src/utils/styles/_tokens.scss` and `_mixins.scss`: colours, fonts and the named breakpoints (`$bp-mobile` 760px, `$bp-nav` 940px and others). Use these; don't hard-code new magic numbers when a token fits.
- `src/pages/Home/index.tsx`: section order. Each section is a folder under `src/pages/Home/` with `index.tsx`, `styles.module.scss` and sometimes `data.ts` and hooks.
- `tests/visual/`: how the visual suite works (section 3 explains why it matters here).

---

## 2. Rules

1. **These are deliberate visual changes.** The phase-1 rule "the site must stay pixel-identical to the design" is suspended **only** for the elements each item in section 4 touches. Everything else must still render exactly as before.
2. **Copy.** Change text only where an item requires it. Removing or merging text is fine. When you need new text, keep it short and plain, in the site's voice (British spelling: "organisations", "personalised"; no marketing superlatives). Never invent facts about the business: prices, numbers, names, guarantees, partnerships. List every copy change in your report.
3. **Styling conventions stay.** SCSS modules plus the Mantine theme. No `!important`. No setting `element.style` from event handlers for visual states; use CSS and data attributes. Reuse tokens and mixins. No new styling systems.
4. **No new runtime dependencies** unless a fix is impossible without one. If you add one, justify it in the report.
5. **Accessibility doesn't regress.** Keep keyboard access, focus styles, ARIA roles and reduced-motion behaviour working wherever you touch them.
6. **Prerendering stays clean.** Anything you add that reads `window`, `document`, `matchMedia` or the current date must run after mount. Zero hydration warnings in the console.
7. **Git.** Create branch `fix/ux-review` from `main`. Don't commit, push or open a PR. Never mention AI, Claude or agents in any file, and no `Co-Authored-By` lines anywhere (the owner's standing rule).

---

## 3. Environment and the visual test suite

**Machine traps** (from phase 1, still true):
- `NODE_ENV=localhost` is set globally. `vite.config.ts` forces production for builds; don't break that guard.
- Windows, with PowerShell and Git Bash. Write files with file-editing tools, not shell heredocs. In Git Bash, set `MSYS_NO_PATHCONV=1` when passing paths that start with `/`.

**The visual suite will fail, and that's expected.** `npm run test:visual` compares the built site with the original design prototype in `tests/visual/reference/`. Because this plan changes the design on purpose, some checks will fail.
- **Don't** edit `tests/visual/reference/`, raise `MAX_DIFF_PIXELS`, or skip or delete tests.
- **Do** run the full suite before you start (baseline: everything should pass; if it doesn't, stop and report). Run it again at the end. For every failing check, open the diff image in `test-results/visual/<test>/` and confirm the diff is confined to an element section 4 asked you to change. Any diff outside those elements is a regression you must fix.
- How to re-baseline the suite afterwards is the owner's decision, not yours. Your report must include the failing-check table described in section 6 so they can make it.

**Default settings must still reproduce the design wherever no fix applies.** The visual build ignores `config/.env*`, so it always runs with default settings. New settings you add (4.1, 4.2) need defaults that reproduce today's design. That way the visual suite only flags real changes.

---

## 4. The fixes

Each item has: what's wrong, where to look, what done looks like, and the constraints. Do them in any order; the order below is a suggestion that groups related files.

### 4.1 Intake season and year as a setting

**Problem.** "Winter 2026" is hard-coded in several places. The site is live in November 2026 and still sells the Winter 2026 intake, which has already started.

**Where.** Search `src/` for "Winter 2026". At the time of writing it appears in the hero intake line, the receipt subtitle, two of the mentor stats, the ratio note under the workload diagram, and the footer seat-count line. Leave "Winter 2025 cycle" in the SOP section alone; that's a past, real case.

**Done when:**
- The intake is configured with two settings that follow the existing `VITE_*` pattern: a season that's an enum (`Winter` or `Summer`) and a year (a four-digit number). Invalid or empty values fall back to the defaults (Winter, 2026), the same way `toIntakeStatus` falls back today.
- Every place that shows the current intake reads it from one source (a single derived value or helper in `siteConfig`). No component hard-codes a season or a year.
- The new variables are documented in `config/.env.example`, the README "Settings" table, `src/vite-env.d.ts`, and passed through in `.github/workflows/pages.yml` the way the other `VITE_*` repository variables are.
- With the variables set to, for example, `Summer` and `2027`, every intake mention on the page says "Summer 2027". With them unset, the page is identical to today.

### 4.2 Privacy note details as settings

**Problem.** The live privacy page shows template placeholders in highlighted boxes: "[full names of the people responsible]", "[postal address in Germany]", "[form service]", "[hosting provider]", "[6 months]", "[the authority for the German state where you live]".

**Where.** `src/pages/Privacy/index.tsx` (the `Placeholder` component and its uses).

**Done when:**
- Each placeholder is driven by a setting, using the same env pattern and documentation spots as 4.1. Pick clear names (for example a `VITE_PRIVACY_` prefix). The retention period may have a sensible default; ask in your report if you're unsure.
- **A production build never shows a bracketed placeholder.** When a value is missing in production, the sentence still reads correctly without it (omit the clause or the list item rather than show a gap). The build output also prints a clear warning naming each missing privacy setting, so whoever deploys notices.
- In dev and in the visual-test build, missing values still render as the highlighted placeholders, as they do today. That keeps the privacy visual checks green and shows the team what's left to fill in.
- **The "form service" bullet reflects reality.** With no form endpoint configured, the form goes through the visitor's email app (see `src/services/profileReview.ts`), so a third-party form service bullet would be false. Decide how that bullet behaves in each case and explain it in the report.
- Don't change the legal wording beyond what the placeholders require. If something else in the note looks legally wrong to you, flag it in the report; don't rewrite it.

### 4.3 Fee receipt at tablet widths

**Problem.** Between roughly 760px and 1100px, the receipt in the Fees section sits in a narrow grid column (about 265px wide at 768px). "0,00 €" breaks so "€" lands on its own line, and "Due now", "Due after admission" and "Triggered by" all wrap.

**Where.** `src/pages/Home/Fees/` (`styles.module.scss` grid areas and the receipt styles, `Receipt.tsx`).

**Done when:** at every width from 320px to 1440px, the total stays on one line, label and value pairs don't wrap awkwardly, and the receipt still reads as a till receipt. Check the in-between widths, not just the named breakpoints: drag through them or step every 20–40px. The print animation and its reduced-motion behaviour still work.

### 4.4 "Play all 7 months"

**Problem.** In Journey → "Month by month", pressing "Play all 7 months" plays from the currently selected month, not from month 1. Selecting M5 and then pressing it plays only months 6 and 7. Playback also keeps running when the section is scrolled off screen.

**Where.** `src/pages/Home/Journey/useMonthPlayer.ts` and `MonthExplorer.tsx`.

**Done when:**
- "Play all 7 months" always starts at month 1.
- Pausing and then resuming continues from where it paused, and the button label makes that difference clear (for example "Resume" after a pause).
- Playback pauses when the explorer leaves the viewport. Whether it resumes on return is your call; say which in the report.
- Manual selection, dragging the track, keyboard control of the slider, and the "Replay" state at month 7 all behave as before.

### 4.5 The hero "Wipe and repaint" painting

**Problem.** The hero painting can be wiped with a button, then painted back with the pointer. Today:
- painting only reacts to hover movement, and the cursor stays the default arrow, so nothing tells you what to do
- after a wipe, the hero's main image sits half-erased until someone slowly paints it back (an automatic sweep repaints only part of it)
- on touch screens, the gesture that paints is also the gesture that scrolls the page

**Where.** `src/pages/Home/Hero/index.tsx`, `usePaintCanvas.ts`, `paint.ts`, `styles.module.scss`. The feature is behind `VITE_ALLOW_REPAINT`; keep that setting working.

**Done when:**
- While wiped, it's obvious the canvas is paintable: a cursor that signals painting on fine pointers, plus clear guidance text.
- The painting never stays broken. After a reasonable idle period, or once most of it is painted back, it finishes restoring itself smoothly. With reduced motion, it restores without animation.
- On touch devices you can either paint with a finger without the page scrolling under it, but only while wiped (scrolling over the image must work normally otherwise), or the feature degrades sensibly for touch. Pick one, implement it fully, and explain the choice. Test with touch emulation, not just a mouse.
- Before anyone presses "Wipe", the hero looks exactly as it does today.

### 4.6 Focus after a failed form submit

**Problem.** Submitting the profile-review form with invalid fields shows the errors but leaves focus on the submit button. The first invalid field (often Name) can be off screen, especially on a phone.

**Where.** `src/pages/Home/Contact/ProfileReviewForm.tsx`. Note the consent checkbox is a native input, not a Mantine one, so treat it as a field too.

**Done when:** after a failed submit, focus moves to the first invalid field in visual order, and that field is scrolled into view below the sticky header, not hidden under it. This works at desktop and phone widths, and keyboard and screen-reader users get the error. Error messages and their "clear as you edit" behaviour are unchanged.

### 4.7 Navigation labels and coverage

**Problem.**
- The nav item "Universities" goes to a section titled "Public vs. private, without the sales pitch". The label doesn't tell you that.
- Neither the desktop nav nor the phone menu links to the Fees section, the site's main selling point ("€0 until you're admitted"), or to the FAQ.
- ("Why us" → "Why we are different" is correct. Leave it.)

**Where.** `NAV_LINKS` in `src/utils/constants.ts`, `src/components/SiteHeader/`. Section ids are in `SECTIONS`.

**Done when:**
- Every nav label matches what you land on.
- Fees and FAQ are reachable from both the desktop nav and the phone menu.
- Links are in page order.
- The desktop nav doesn't wrap, overflow or crowd the CTA at any width from `$bp-nav` up; check 940, 1024 and 1100px in particular. If it can't fit, you may move `$bp-nav` up, or shorten labels.
- Each anchor lands with its heading visible below the sticky header.
- The phone menu still fits on a 320×568 screen without needing to scroll, or scrolls cleanly if it can't.

### 4.8 Shorten the "How our mentors work" section

**Problem.** The section with `id="why"` (`src/pages/Home/Mentors/`) is about 4,400px tall at 390px wide (more than five phone screens) and about 2,700px on desktop. Four blocks in a row make the same "small groups vs. big agencies" point:
1. intro, method bullets and photo
2. the three-number stats row
3. the "One mentor, up to five students" ratio heading, workload diagram and note
4. the comparison table (cards on phones) and its footnote

**Done when:**
- At 390px the section is at most about half its current height. On desktop it's noticeably shorter too. Report before and after heights at 390, 768 and 1440px.
- Nothing unique is lost. The owner considers repetition of key facts across the page intentional, so this is about the section's **layout and duplication within itself**, not about removing the facts. Ways to get there: fold the stats into the ratio block; give the workload diagram a compact phone form (the 100-circle grid shrinks to specks on phones anyway); make the comparison denser on phones.
- The Reichstag photo stays (owner's decision). You may change how it's placed or cropped on phones.
- The comparison's honest footnote ("figures reflect what students in our community commonly report…") stays attached to the comparison.

### 4.9 Remove the two FAQ answers that repeat earlier sections

**Problem.** "What do I owe if I don't get an offer?" repeats the Fees section, and "Who writes and reviews my SOP?" repeats the SOP section.

**Where.** `QUESTIONS` in `src/pages/Home/Faq/index.tsx`.

**Done when:**
- Those two entries are gone.
- Any fact they held that appears nowhere else is kept, moved to the section it belongs to. In particular: third-party fees (university, uni-assist, APS, IELTS) are paid to those organisations directly and can't be refunded by Germandians. Also: nothing is submitted until the student approves the final SOP. Check whether each is already stated elsewhere before adding it anywhere.
- The first FAQ item still starts open.

### 4.10 Footer

**Problem.** The footer repeats the header brand as a giant full-width "Germandians" wordmark (`FitWordmark`). The painted flag band above the footer crops the Ashoka chakra in half at most widths.

**Where.** `src/components/SiteFooter/` (it's shared by home and privacy).

**Done when:**
- The giant wordmark is gone, and the footer still looks finished and balanced (it shouldn't look like a block was deleted).
- If `FitWordmark` has no other users, delete it.
- The flag band shows either the whole chakra or none of it at every width from 320px to 1440px. Check several widths; the crop shifts as the band's aspect ratio changes.
- Footer links meet a 44px minimum tap height on touch (see 4.13).

### 4.11 Tone down the decorative German

**Problem.** German is used as decoration in many places. That's charming once, but where German replaces information, readers who don't speak German yet lose that information.

**Where.** At the time of writing:
- the receipt: "inkl." on every line, "DANKE", "Studienberatung"
- the Universities cards: "Öffentlich" and "Privat" labels
- the form: "Antrag auf Erstberatung", "Formular GD-26 / Seite 1 von 1", "Hinweis:", and the "EINGEGANGEN" stamp
- the Journey stage tags: "APS", "Bewerbung", "Visum", "Anmeldung"

Search for others.

**Done when** you've applied this rule and listed each string with the decision you made:
- German that is the **only** label for information becomes English. "inkl." is the main case.
- Purely ornamental German that adds visual noise is removed. The "Formular GD-26 / Seite 1 von 1" box is the clearest case.
- Real German terms students will need to know (APS, Anmeldung, uni-assist) stay.
- A small amount of flavour may stay where an English equivalent sits right beside it (the form title has an English subtitle, for example). Aim for the brand flavour to survive in two or three places, not ten.

### 4.12 Stranded elements and dead space (desktop and tablet)

**Problem:**
- **SOP section ("Two applicants, one university"):** the "Get my profile reviewed" button sits alone at the bottom left, below a large empty area, detached from the copy it belongs to.
- **FAQ and Contact sections:** on desktop, the left column (heading and short intro) ends early and leaves a tall empty area beside the long right column.
- **Workload diagram (Mentors):** the dark "Germandians" card is shorter in content than the "Many agencies" card, leaving a blank strip at its bottom.

**Done when** each case reads as intentionally laid out at 1024px and 1440px, and nothing regresses at tablet and phone widths. Suggested approaches (yours to judge): place the SOP button with the comparison copy; make the FAQ and Contact intros stick within their sections while the right column scrolls (respecting the sticky header's height); align the diagram cards' content instead of stretching an empty card. The workload diagram may be reshaped anyway by 4.8. Solve both together.

### 4.13 Phone-specific fixes

Check each at 320, 360, 390 and 480px:
- **Hero:** the headline nearly touches the sticky header. Give it breathing room consistent with other sections' top spacing.
- **Hero buttons:** "Get my profile reviewed" and "DM us on Instagram" stack with different widths. Make them a consistent full-width stack, or an otherwise deliberate arrangement.
- **€0 badge:** on phones it's a large dashed box, mostly empty to the right of "€0". Make it compact: amount and text side by side, or the box shrink-wrapped to its content.
- **Month by month on phones:** the phase track shows unlabeled colour blocks, plus a 2×2 legend where "Pre-departure" wraps and makes its chip taller than the others. Make the legend chips even, and make it clear which colour is which phase.
- **Workload diagram:** the 100-circle grid becomes specks. This is covered by 4.8; just make sure it's resolved.
- **Footer links:** currently 26px tall. Bring tap targets to at least 44px tall without making the footer look bloated.
- **Space under the footer:** an 84px dark spacer (`MobileActionBar` `.spacer`) sits below the footer so the fixed action bar never covers content. The bar is hidden at the bottom of the page, so the spacer reads as dead space there. Make sure the bar never covers content, without leaving an empty band when the bar isn't showing. The privacy page uses the footer too; check it.

---

## 5. Out of scope: the owner ruled these out

Don't change these, even if you think they should be changed:
- **WhatsApp wiring:** "WhatsApp us" and the "WhatsApp / Use the form" contact row, and the form's email fallback when no endpoint is set. Leave them for now.
- **Facts repeated across the page** (22,000 members, SOP written by hand, six mentors, 30 seats). This is intentional.
- **The Journey stage cards followed by "Month by month".** This is intentional.
- **No named or pictured mentors, and the Reichstag photo.** This is intentional.
- **"Two applicants, one university".** It's a real case. Don't relabel it.
- **No price range or "Written quote".** This is intentional.

---

## 6. Verification and the report

**Verify before reporting:**
1. Run `npm run typecheck`, `npm run lint` and `npm run build`. All must pass. Report the build's JS and CSS sizes next to the baseline you recorded before starting.
2. Look at the site in a real browser (`npm run dev` or `npm run preview`, Chrome) at 1440, 1024, 768, 600, 390 and 320px, plus whatever in-between widths each item calls for. Use touch emulation for 4.5 and the phone items, and test reduced motion for 4.4, 4.5 and the receipt.
3. Zero console errors and zero hydration warnings on `/`, `/privacy` and an unknown path.
4. Run production builds twice: once with no `config/.env*` values, and once with the intake set to a non-default value (for example Summer 2027) and every privacy value filled in. Confirm the intake text everywhere, the privacy page in both cases (no brackets in production), and the missing-settings warning when values are absent.
5. Run the full visual suite (`npm run test:visual`) and triage every failure as described in section 3.
6. Save before and after screenshots for each item to `test-results/ux-review/` (git-ignored). Name them after the item number and width, for example `4.3-768-after.png`. Take the "before" shots on a clean `main` build before you start changing things.

**Report** (in your final message, not a file):
- for each item 4.1–4.13: what you changed, the files touched, your decisions where the plan left you a choice, and anything you couldn't fully resolve
- every copy change, as before → after
- the new settings, with names, allowed values and defaults
- the "How our mentors work" section heights before and after (4.8)
- a visual-suite table with one row per failing check: check name, which section 4 item explains the diff, and a confirmation that nothing outside that item changed
- open questions for the owner

Then stop. Leave everything uncommitted on `fix/ux-review` for review.
