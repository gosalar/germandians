# Grade check: follow-up fixes

Follow-up to `docs/plans/grade-check-selling.md`. You built that plan. A review found the issues below. Its rules (section 2) and environment traps (section 3) still apply. Read them again if you need to.

**Don't commit or push.** Your previous work stayed on `main` instead of a branch. Before you change anything, run `git switch -c grade-check-selling`. Staged and unstaged changes both carry over. Leave everything uncommitted.

---

## 1. Don't show band names to students

**Now:** the page shows "{band} band" next to the grade in two places:
- the desktop label ("Your German grade · Mid band", `src/pages/Check/index.tsx` around line 224)
- the phone grade bar (`mobileBandBadge`, around line 148)

A student with a weak grade sees a bold "Very low band" badge right above the pitch. That works against the honest, qualifying tone the low bands are meant to have. The band names are internal labels for measuring which bands send requests.

**Done when:**
- No band name appears anywhere a student can see it.
- The snapshot attached to the form request still starts with `Band: {band} ·`. The team relies on that.
- The German classification ("Gut (Good)" and so on) stays.

## 2. Keep the result in view on wide screens while students change their answers

**Now:**
- From 1100px the result column has `position: sticky`, but it's taller than the inputs column (1,349px against 773px at 1440×900; 1,485px against 879px at 1280×585). A sticky element taller than its grid row has no room to move, so it does nothing.
- With the Step 2 controls (backlogs, degree, APS) in view, the grade is off-screen at every wide size:
  - **1440×900:** the grade's top edge is at −163px.
  - **1280×585:** the grade and the headline are both off-screen (headline bottom at −135px).
- Those are the controls that change the pitch, so students change them without seeing the result react.

**Suggested approach** (improve it if you have a better one): you already built a compact grade bar for phones (`mobileScoreBar`). Use a compact summary (grade, German classification and the band headline) that stays visible on wide screens while the inputs column is on screen. Keep the full result column as it is. Don't make anything sticky that can grow taller than the viewport.

**Done when, measured in headless Playwright** (not the in-app pane, which may be hidden and break scrolling):
- At 1440×900, 1536×730, 1280×585 and 1920×953, with each Step 2 button group scrolled to the centre of the screen, the grade and the start of the band headline are fully visible.
- Phones and tablets keep today's behaviour: the grade sits right under the score fields, and both fit on the first screen at 412×891.
- The button, the "€0" callout and all three tier cards can still be scrolled fully into view at every size.
- No sideways scrolling at any size in the original plan's device sweep.

## 3. Announce less to screen readers

**Now:**
- The `aria-live` region (`liveSummary`) also contains the formula line and the long sentence about how universities round, so every keystroke announces all of it.
- The error message element is only added once there's an error. Some screen readers ignore live regions that appear together with their content, so the error may never be announced.

**Done when:**
- The live region holds only the grade, the German classification and the band headline. The formula and the rounding note can stay on screen, outside it.
- If item 2 adds a second copy of the grade (the compact summary), only one copy is announced; the other is hidden from screen readers.
- The error element is always in the page, empty when there's no error, so filling it in gets announced. Keep `aria-invalid` and `aria-describedby` on the invalid field; point `aria-describedby` at the error only while there is an error.

## 4. One copy fix

**Now:** the very-low band's bullet promises to check "open-admission public programmes **and accredited options**" (`src/pages/Check/data.ts`, `baseBulletBody` for `'Very low'`). "Accredited options" mostly means private colleges, which the low band warns against.

**Done when:** that bullet offers only the public route and the honest "we'll tell you plainly" promise. Don't change other copy.

---

## Verification and report

- `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:visual -- --workers=2` (37/37) and `npm run test:ux` all pass.
- **Extend the `/check` UX test:**
  - no visible text containing "band" (other than in the snapshot);
  - the snapshot still contains `Band: Mid ·` for the default inputs;
  - the error element exists before any error;
  - at 1440×900, the grade is visible while the backlogs buttons are centred on screen.
- **Report briefly:**
  - what changed, by item;
  - the measured grade and headline positions from item 2 at each wide size;
  - the test results;
  - anything you did differently, and why.
