# Grade check: fixes and selling by grade band

Hand-off for an agent with no prior context. Read all of it before you change anything.

This says **what** to change, **what done looks like** and **which rules apply**. It doesn't dictate the code. Work that out from the repo, follow its conventions and verify your own work. Where it suggests an approach or copy, treat that as a starting point you may improve. If you do, say why in your report.

**Don't commit or push.** Pushing to `main` deploys the live site. Start a branch named `grade-check-selling` from the current working tree (`git switch -c grade-check-selling`; the staged changes come with you). Leave everything uncommitted and finish with the report in section 7.

---

## 1. Context

**The site.** Germandians is a consultancy run by six Indian students who live in Germany. They help Indian students apply to German universities. The repo is their public site: a long landing page (`/`), a privacy note (`/privacy`), a 404 page and, new and still uncommitted, a grade calculator (`/check`).

**The business model, which shapes the selling.** The service fee is €0 until the student is admitted. Each intake takes at most 30 students (six mentors, five students each). So the team only earns on students who get in, and every place is scarce. The page must:
- sell hard to students who are likely to be admitted (top, strong and mid grades);
- be honest and specific with students whose odds are low, and qualify them rather than push them. A low scorer who signs up and isn't admitted takes a place and earns nothing. Overpromising also hurts the team's reputation in a student community that talks.

**The `/check` page.** Another agent built it from `docs/plans/grade-and-profile-check.md` (the spec; read it). Its work is staged and not committed:
- `src/pages/Check/`: `index.tsx` (layout and state), `data.ts` (the formula, presets, tier rules and all copy), `styles.module.scss`
- "Grade check" link in the nav and footer
- the profile review form shown under the calculator, with a "snapshot" of the student's answers attached to the request

That work was reviewed. Section 4 lists the fixes the owner accepted. Section 5 is the new selling work. Section 6 lists what not to touch.

**Stack.** React 19, React Router 8 in framework mode with build-time prerendering, Vite 8, TypeScript (strict), Mantine 9 with a brand theme, SCSS modules, React Compiler. Read `README.md` first.

**Read before starting:**
- `README.md`: scripts, settings, visual tests, structure.
- `docs/plans/grade-and-profile-check.md`: the original spec for `/check`.
- `src/pages/Check/data.ts` and `index.tsx`: almost all your changes land here.
- `src/utils/styles/_tokens.scss` and `_mixins.scss`: colours, fonts, breakpoints and the `touch-area` mixin.
- `src/pages/Home/Sop/StampedCards.tsx`: the two applicant cases the site already shows (7.8 CGPA, 0 backlogs, rejected; 7.1 CGPA, 16 backlogs, admitted).
- `tests/ux/interactions.spec.ts`: the existing `/check` test you'll extend.

---

## 2. Rules

- **Commit text:** no `Co-Authored-By` lines, no "Generated with" lines, no mention of Claude or AI. This doesn't matter much here since you don't commit, but don't write any.
- **Proof stays real and anonymous.**
  - The owner confirms the 7.1 CGPA, 16-backlog admission is a real case. The student wants to stay anonymous. Never add a name, initials, a photo, a university name, a city or anything else that could identify them.
  - Don't invent cases, numbers, quotes or success rates for any grade band. Where a band has no real proof, use none and say what we do instead.
  - You may keep the existing claims on `/check` about the two home page cases as they're worded now, but don't add details to them.
- **No new claims about named universities.** Don't add universities to the tier cards or promise admission anywhere. You may fix the two accuracy issues in section 4.
- **Keep the voice.** The site's copy is plain and direct, with no hype words, no exclamation marks and no "guaranteed". UK spelling ("programme"). Short sentences. Read the home page copy and match it.
- **Use tokens.** No new hard-coded colours or magic numbers where a token or mixin fits.
- **The home page doesn't change.** The visual suite compares `/` and `/privacy` pixel for pixel with the design reference and must stay at 37/37. Don't edit `tests/visual/reference/`. `/check` has no reference, so the suite doesn't cover it.
- **No tracking.** The privacy note promises no third-party tracking. To measure the bands, use the snapshot (section 5.5), not analytics.

---

## 3. Environment traps

- `NODE_ENV=localhost` is set globally on this machine. The build scripts already force production, so use `npm run build`; don't bypass it.
- Node runs through Volta shims, so every server is a parent and a child process. To free a port, end both. `Get-CimInstance Win32_Process` shows which is which.
- `npm run test:ux` starts its own server on port 4173. Don't run a preview server on 4173 at the same time; use another port (`node scripts/serve.mjs build/client 4180`).
- **The built-in browser pane may be hidden.** A hidden pane runs the page as a background tab, where smooth scrolling stalls, and the site uses `scroll-behavior: smooth`. Navigation and scroll positions then look broken when they aren't. Check scroll behaviour in headless Playwright, not in a hidden pane.
- `gh` isn't installed.

---

## 4. Accepted fixes from the review

### 4.1 Make the rounding agree with the copy (bug)

**Now:**
- `calculateGermanGrade` rounds to one decimal.
- The pass-mark note says 7.4 CGPA converts to 2.5 at a pass mark of 5.0, but the calculator shows 2.6 (the raw value is 2.56).
- The mid-band copy says "7.1 CGPA (2.4 German grade)", but the calculator gives 2.5 for 7.1 out of 10 at a pass mark of 4 (raw 2.45).

**Decision: truncate to one decimal**, which is what the copy already assumes. Universities differ: some truncate, some round, some round in the student's favour.

Floating point will bite. For example, 7.4 out of 10 at pass 4 computes as 2.2999… and would truncate to 2.2. Make the truncation float-safe, with a small epsilon or by working in integers.

**Done when:**
- These inputs give these grades:

  | Score | Max | Pass mark | Grade |
  |---|---|---|---|
  | 7.4 | 10 | 4 | 2.3 |
  | 7.4 | 10 | 5 | 2.5 |
  | 7.1 | 10 | 4 | 2.4 |
  | 8.0 | 10 | 5 | 2.2 |
  | 72 | 100 | 40 | 2.4 |
  | 10 | 10 | 4 | 1.0 |
  | 4 | 10 | 4 | 4.0 |

- One short line near the result says universities may convert slightly differently, and the review checks against each university's own rule.
- The existing UX test assertions still pass.

### 4.2 Put the result next to the inputs

**Now:**
- At 1440×900 the first input starts below the first screen (y ≈ 933) and the grade sits at y ≈ 1233.
- At every size the result sits below both input panels, so the student has to scroll after each change to see what it did.
- The pitch (section 5) sits below the result, so most visitors never see it.

**Done when:**
- **Wide screens (from about 1100px):** inputs and result sit side by side, and the grade and band headline stay in view while the student scrolls through the inputs. A sticky result column is one option.
- **Phones and narrow tablets:** the grade and its German label appear right after the score fields, within one screen of the score input. The tier cards and the pitch can follow Step 2.
- **1440×900:** the score input and the grade both show without scrolling. You may tighten the header (badges, title size, lede) to get there.
- **1280×585 (a laptop at 150% scaling):** once the student scrolls to the inputs, the grade stays visible.

### 4.3 Accessibility of the live result

**Now:**
- `aria-live="polite"` wraps the whole result (grade, three tier cards, headline and three bullets), so every keystroke queues a long announcement.
- The error uses `role="alert"`, which fires while the student is still typing (for example, after clearing a field to retype it).
- The inputs aren't marked invalid or linked to the error.

**Done when:**
- Only the grade, its German label and the band headline are announced.
- An invalid field has `aria-invalid` and `aria-describedby` pointing to the error.
- The error is announced politely, not as an alert on every keystroke.

### 4.4 Two accuracy fixes in the tier cards

- **Passau isn't a TU.** Tier 2 is titled "Aptitude & SOP-Scored Public TUs" and lists Passau. Rename the tier so the label fits every example (for example, "Aptitude & SOP-scored public universities").
- **"Official KMK Bavarian Formula" overstates it.** The KMK recommends the formula, and universities apply it with their own rules. Reword both the badge and the copy (for example, "KMK-recommended Bavarian formula").

### 4.5 Small clean-ups

- Move the six hard-coded status colours in `src/pages/Check/styles.module.scss` into `_tokens.scss` as named tokens.
- In `README.md`, add `snapshot` to the list of fields the form POSTs, and mention `/check` wherever the README lists the pages.

---

## 5. Selling: five grade bands, each with its own message

### 5.1 Problems today

| Who | What they see now | Problem |
|---|---|---|
| Top scorers (grade ≤ 1.5, about 9.0+ CGPA) | The same message as a 1.9: "don't lose it to an ECTS mismatch" | No ambition pitch |
| Strong grade **with any backlogs** | The mid-grade branch: "realistic for Tier 2 and Tier 3" | Tells a 1.6 to aim lower while the Tier 1 badge says "Competitive" |
| Mid (2.1–2.5) | The best copy, with the 16-backlogs proof | Works. Keep its substance |
| Low (2.6–3.0) | "Blind applications… will fail" | Opens with fear. The real route is buried |
| Very low (3.1–4.0) | The same copy as 2.6–3.0 | No route offered, so it reads as a dead end |

On top of that:
- 1–5 and 6+ backlogs read the same.
- Degree length and APS status change one bullet each and never the headline.
- "€0 until admitted" shows only in a small label above the headline.
- The button text is the same for everyone.

### 5.2 The bands

Define the bands by German grade, so they work for every scale (CGPA or percentage). The CGPA figures assume a pass mark of 4 and are only a guide.

| Band | German grade | About (CGPA, pass 4) | Goal |
|---|---|---|---|
| Top | 1.0–1.5 | 9.0+ | Sell ambition: competitive programmes are realistic, and the SOP and ECTS match decide them |
| Strong | 1.6–2.0 | 8.0–8.9 | Sell confidence: Tier 1 still realistic, Tier 2 the safe core |
| Mid | 2.1–2.5 | 7.0–7.9 | Sell the method, with the 16-backlogs proof |
| Low | 2.6–3.0 | 6.0–6.9 | Honest route: public programmes without strict cut-offs; we say in the review whether it's realistic |
| Very low | 3.1–4.0 | below 6.0 | Honest and qualifying: a narrow but real route, checked against the transcript; we say plainly if this intake isn't realistic and what to fix first |

**Tier badges follow the bands**, so the badges and the headline never contradict each other. A suggested mapping (adjust it if you have a reason):

| Band | Tier 1 | Tier 2 | Tier 3 |
|---|---|---|---|
| Top | Competitive | Strong fit | Strong fit |
| Strong | Realistic reach | Strong fit | Strong fit |
| Mid | Selective | Primary target | Strong fit |
| Low | Low odds | Selective | Primary target |
| Very low | Not a fit this intake | Low odds | Check subject credits |

Keep the existing tones (good, mid, tough), mapped sensibly.

### 5.3 What each band shows

Every band gets:
1. a headline that opens with what's possible;
2. one line of proof, or none if no real proof fits;
3. what we do for this student (the three bullets, adapted);
4. a band-specific button that still links to `#contact-form`.

Show "€0 service fee until you're admitted" prominently in every band, next to the button and not only in the small label. It's the strongest reason to act, especially for the top three bands.

Draft copy. Improve it, but keep the intent:

- **Top.**
  - Headline: "A {grade} puts Germany's most competitive public programmes within reach. At this level your grade isn't what decides it."
  - Proof: the existing 7.8 CGPA, 0 backlogs rejection, used as a warning. A standard SOP and unmatched ECTS sink strong grades.
  - What we do: check every course's ECTS table against your syllabus, shortlist 1–2 competitive programmes plus a strong Tier 2 core, and write the SOP by hand with you.
  - Button: "Plan my shortlist for top programmes"
- **Strong.**
  - Headline: "A {grade} keeps Tier 1 programmes realistic, with aptitude-scored universities as your safe core."
  - Proof: the same warning, or none.
  - Button: "Build my shortlist"
- **Mid.** Keep today's substance and the 16-backlogs proof (anonymous, worded as now).
  - Headline: "A {grade} is realistic for aptitude-scored and non-NC public universities when your shortlist and SOP do the heavy lifting."
  - Button: "See where my profile gets in"
- **Low.**
  - Headline: "A {grade} still opens German public universities. Strict 2.5 cut-offs are out, so the shortlist matters more than anything."
  - What we do: filter for public programmes without strict grade cut-offs whose subject credits you meet. Most consultancies push private colleges here because they earn commission on them.
  - Qualifier: "In the review we'll tell you honestly whether this route is realistic for {intake}."
  - Button: "Find the public programmes that accept me"
- **Very low.**
  - Headline: "With a {grade}, the route is narrower but real: open-admission public programmes whose subject requirements you meet."
  - Qualifier: "In the review we check your transcript against them and tell you plainly whether {intake} is realistic, or what to fix first."
  - Button: "Check if my route is realistic"
- **No valid grade yet.** Keep a neutral prompt and no button pitch.

Don't promise outcomes to the low bands. "We'll tell you honestly" is the promise.

### 5.4 Profile details adjust the copy within a band; they never change the band

- **Backlogs.**
  - **0:** no extra line.
  - **1–5:** one line saying backlogs are explained once and plainly in the SOP (the home page SOP section shows this).
  - **6+:** a stronger version, and for the top and strong bands, frame it as "your grade still carries you".
  - Never move a student to a lower band because of backlogs.
- **Degree length.**
  - **3-year (180 ECTS):** keep today's bullet. For the top and strong bands, add that some competitive programmes need 210–240 ECTS, so the shortlist filters for ones that accept 180 or offer bridge credits.
  - **4-year:** keep today's bullet.
- **APS.** Keep both bullets. "No APS yet" adds urgency for `{intake}` in every band.

### 5.5 Make the bands measurable without tracking

Add the band name to the snapshot attached to the form request (for example, `Band: Strong · German grade 1.8 (8.4 / 10, pass 4) · …`). The team can then see which bands actually send requests, with no analytics. Update the form's snapshot chip and the UX test to match.

### 5.6 Where the copy lives

All copy and band rules stay in `src/pages/Check/data.ts`, as plain data plus one function that builds the result. Keep `index.tsx` free of copy decisions.

---

## 6. Out of scope (owner decisions pending; don't touch)

- The removed hero painting on the home page.
- The default intake (Summer 2027) and anything in `siteConfig`.
- Anything on the home page or privacy page, and the visual reference.
- Which universities appear on the tier cards (beyond the fixes in 4.4).
- Adding analytics or any third-party script.

---

## 7. Verification and report

**Checks, all must pass:**
- `npm run lint`, `npm run typecheck`, `npm run build` (prerenders `build/client/check/index.html` with the default state: 7.4 / 10, pass 4, grade 2.3, Mid band).
- `npm run test:visual -- --workers=2` at 37/37.
- `npm run test:ux`, extended with:
  - the grade table in 4.1;
  - one input per band, checking that the band headline, the button label and the tier badges change, and that the badges never contradict the headline;
  - backlogs not changing the band (for example, grade 1.6 with 6+ backlogs stays Strong);
  - the band appearing in the snapshot.

**Device sweep.** Use the `device-layouts` skill on `/check` at its device sizes:
- 412×891, 891×412, 800×1280, 1280×800, 1536×730, 1280×585 and 1920×953;
- plus 320, 375 and 768 wide.

Confirm no sideways scroll, nothing cut off, and the result placement in 4.2. Take screenshots of the phone and 1440×900.

**Report.** End with a short report:
- what changed, by section;
- the final copy for each band, in a table, so the owner can review it in one place;
- the measured positions for 4.2;
- the test results;
- anything you chose differently from this plan, and why;
- anything you couldn't verify.
