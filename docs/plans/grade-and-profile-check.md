# Grade & Public University Fit Check (`/check`) — Design Spec

Scoped design for the standalone **German Grade Calculator & Public University Fit Check** page (`/check`) with tailored "sell-up" diagnostics and an embedded profile review form that auto-attaches the student's calculated snapshot.

---

## 1. Goal & Product Positioning

Indian students researching a Master's in Germany search heavily for a **Modified Bavarian Formula (CGPA to German grade) calculator** and an **admission chance check**. Existing tools fail them in two ways:
1. **Pure calculators** output a raw number (e.g. `2.4` or `2.7`) with no context, causing students with `7.x` CGPAs, backlogs, or 3-year (`180 ECTS`) degrees to self-reject before learning about aptitude-scored or open-admission (*zulassungsfrei*) public universities.
2. **Consultancy predictors** gate results behind OTP walls, push commission-paying private universities, or sell ₹30,000–₹1,20,000 upfront packages.

**What `/check` does instead:**
- Gives an instant, login-free **official KMK Modified Bavarian Formula** conversion with one-click presets for Indian grading scales (`Pass 4.0`, `Pass 5.0`, `Percentage %`) so students don't fall into the `Nmin` pass-mark trap.
- Combines the calculated grade with **3 profile toggles** a calculator misses (**Backlogs**, **Bachelor's duration: 4-year 240 ECTS vs. 3-year 180 ECTS**, and **APS status**).
- Maps the profile across **3 real German public university admission tiers** (with recognizable public university examples) and renders a **tailored "sell-up" diagnosis** explaining how Germandians turns that specific profile into an admit—with **€0 service fee until admitted**.
- Embeds the *"Antrag auf Erstberatung"* (`ProfileReviewForm`) at the bottom of the page with the student's **calculated snapshot automatically attached** to the submission.

---

## 2. Routing, Prerendering & Site Navigation

| File | Change |
| :--- | :--- |
| `src/utils/constants.ts` | Add `check: '/check'` to `ROUTES`. Add a link entry for `Grade check` in navigation constants. |
| `src/routes.ts` | Register `route('check', 'routes/check.tsx')` inside `layout('routes/site-layout.tsx', [...])` so `/check` shares `PageChromeProvider`, `SiteHeader`, `SiteFooter`, and `MobileActionBar`. |
| `src/routes/check.tsx` | Thin route module exporting `meta` (`title: 'German grade & profile check | Germandians'`, description) and rendering `src/pages/Check`. |
| `react-router.config.ts` | Add `'/check'` to `const pages = ['/', '/privacy', '/check']` so `npm run build` prerenders `build/client/check/index.html`. |
| `src/components/SiteHeader/index.tsx` | Render the `Grade check` link in both desktop nav and mobile menu (raising `$bp-nav` in `_tokens.scss` if needed so desktop links never crowd the CTA). |
| `src/components/SiteFooter/index.tsx` | Add `<Link to={ROUTES.check} className={styles.link}>Grade check</Link>` in the footer links row. |

---

## 3. Page Structure & State Model (`src/pages/Check/`)

```txt
src/pages/Check/
├── index.tsx            # Page layout: header, calculator + toggles, live diagnosis card, embedded contact section
├── data.ts              # Bavarian formula helper, Indian scale presets, tier rules, and dynamic sell-up copy builder
└── styles.module.scss   # Responsive layout using _tokens.scss and _mixins.scss (no !important)
```

### 3.1 Inputs & Defaults

1. **Step 1 — Your Marks (Modified Bavarian Formula):**
   - **Formula:**
     $$\text{German Grade} = 1 + 3 \times \frac{N_{\max} - N_d}{N_{\max} - N_{\min}}$$
     clamped to `[1.0, 4.0]` and rounded to 1 decimal place (`1.0` = best, `4.0` = lowest pass).
   - **One-click Indian Scale Presets:**
     - `CGPA / 10 (Pass 4.0)` → `max = 10`, `min = 4`, default `score = 7.4`
     - `CGPA / 10 (Pass 5.0)` → `max = 10`, `min = 5`
     - `Percentage % (Pass 40)` → `max = 100`, `min = 40`
   - **Numeric Inputs:** `Your score` ($N_d$), `Max possible` ($N_{\max}$), `Min passing` ($N_{\min}$).
   - **Validation:** Requires $N_{\min} > 0$, $N_{\max} > N_{\min}$, and $N_{\min} \le N_d \le N_{\max}$. Shows a clear inline message if out of range (specifically warning against entering `0` for `Min passing`).
   - **Pass-mark note:** Explains why checking the transcript's pass mark (`4.0` vs `5.0`) changes a `7.4 CGPA` from `2.3` to `2.5`.

2. **Step 2 — Three Things the Formula Doesn't Show:**
   - **Backlogs (cleared or active):** `'0 backlogs'` | `'1–5 backlogs'` | `'6+ backlogs'` (default: `'0 backlogs'`)
   - **Bachelor's degree duration:** `'4-year (240 ECTS)'` | `'3-year (180 ECTS)'` (default: `'4-year (240 ECTS)'`)
   - **APS status for `{siteConfig.intake}`:** `'APS ready'` | `'No APS yet'` (default: `'No APS yet'`)

### 3.2 Output Layer 1: Score Bar & 3 Public University Tiers

- **Score Bar:** Shows the large German grade (`1.0`–`4.0`), German classification (*Sehr gut* `1.0–1.5`, *Gut* `1.6–2.5`, *Befriedigend* `2.6–3.5`, *Ausreichend* `3.6–4.0`), and the worked formula equation.
- **Three Public University Admission Tier Cards:**

| Tier | Example Public Universities | Status when Grade $\le 1.9$ | Status when Grade $2.0\text{–}2.5$ | Status when Grade $> 2.5$ |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1 · Strict NC Public TUs** | *e.g. TU Munich, RWTH Aachen, KIT, TU Berlin* | `Competitive` (green) | `Reach / Selective` (orange) | `Low Odds` (red) |
| **Tier 2 · Aptitude & SOP-Scored TUs** | *e.g. TU Darmstadt, FAU Erlangen, TU Dresden, Passau* | `Strong Fit` (green) | `Primary Target` (green) | `Selective Fit` (orange) |
| **Tier 3 · Non-NC Public TUs & HAWs** | *e.g. TU Dortmund, OVGU Magdeburg, TU Chemnitz, FH Aachen* | `Strong Fit` (green) | `Strong Fit` (green) | `Primary Target` (green) |

### 3.3 Output Layer 2: Dynamic "Sell-Up" Diagnosis

Every combination produces a tailored headline and 3 specific action bullets so no student hits a dead end:
1. **Grade & Backlog Strategy Bullet:**
   - **Strong grade ($\le 1.9$) + `0 backlogs`:** Explains why high-CGPA Indian students still get rejected on ECTS subject buckets or template SOPs (referencing the Winter 2025 `7.8 CGPA / 0 backlogs → REJECTED` case) and how a mentor checks every prerequisite and writes the SOP by hand over weeks.
   - **Mid grade ($2.0\text{–}2.5$) or `1–5` / `6+ backlogs`:** Explains that German universities evaluate final transcript CGPA and subject credits, referencing the Winter 2025 `7.1 CGPA (2.4 German grade) / 16 backlogs → ADMITTED` case, and how targeting Tier 2 (aptitude/SOP-scored) and Tier 3 (non-NC) public universities avoids commission-driven private colleges.
   - **Grade $> 2.5$ (`2.6`–`4.0`):** Warns against wasting applications on strict `2.5`-cutoff courses or falling for predatory degree mills; focuses on open-admission (*zulassungsfrei*) public TUs/HAWs where subject credits qualify, plus vetted accredited options if needed—still with **€0 service fee until admitted**.
2. **Degree Length & ECTS Bullet:**
   - **`4-year (240 ECTS)`:** Notes that total credit count is met, so the review focuses on matching individual module buckets (math, core engineering/CS/business credits) to each course's admission ordinance.
   - **`3-year (180 ECTS)`:** Notes the 180-vs-240 ECTS rule and explains that Germandians shortlists public programmes that either accept 180 ECTS directly or allow 30 ECTS in bridge modules during the Master's.
3. **APS & `{siteConfig.intake}` Timeline Bullet:**
   - **`No APS yet`:** Explains starting the APS document file in Month 1 (including checking whether the Summer 2027 APS India dMAT rule applies to their degree field) so APS delays don't block portal deadlines.
   - **`APS ready`:** Notes that with APS in hand, they can move immediately into university shortlisting and multi-week handwritten SOP drafting.

---

## 4. Embedded Form & Auto-Attached Snapshot

- **`ProfileReviewForm` (`src/pages/Home/Contact/ProfileReviewForm.tsx`):**
  - Accepts an optional `snapshot?: string` prop.
  - When `snapshot` is passed, renders a dashed summary chip above the fields:
    `Auto-attached to your request: German grade 2.3 (7.4 / 10, pass 4) · 6+ backlogs · 4-year (240 ECTS) · No APS yet`
  - Registers `formRef` with `usePageChromeActions()` so `MobileActionBar` automatically hides when the form on `/check` is scrolled into view, matching the home page behavior.
- **`submitProfileReview` (`src/services/profileReview.ts`):**
  - Extends `ProfileReviewRequest` with `snapshot?: string`.
  - When `siteConfig.formEndpoint` is empty (`mailto:` fallback), includes `Profile check: ${request.snapshot}` in the email body when `snapshot` is defined.
  - When `siteConfig.formEndpoint` is configured, includes `snapshot` in the POSTed JSON payload.

---

## 5. Testing & Verification

1. **Prerendering & Hydration:** `build/client/check/index.html` contains the prerendered default calculator state (`7.4 / 10, pass 4 -> 2.3`), and hydrating `/check` produces zero console errors or hydration warnings.
2. **UX Tests (`tests/ux/interactions.spec.ts`):**
   - Changing score/presets and profile toggles on `/check` updates the German grade, tier badges, diagnosis bullets, and attached form snapshot chip.
   - Submitting the form on `/check` with invalid fields focuses the first invalid field below the sticky header.
3. **Visual Tests (`tests/visual/`):**
   - Update `tests/visual/reference/Germandians v4.dc.html` with the added nav/footer `Grade check` link so all 37 existing visual checks stay green.
