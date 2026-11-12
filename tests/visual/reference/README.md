# Design reference

The Claude Design prototype the site must match, copied from the design handoff:

- `Germandians v4.dc.html`: home page
- `Germandians Privacy.dc.html`: privacy note
- `support.js`: Claude Design's runtime that renders the two pages
- `assets/`: images the pages use
- `fonts.css`: independent font-face declarations using the installed Fontsource binaries

Don't edit these files to make a test pass. They change only when the design does: either replace them with a new export, or edit them by hand to match a deliberate change to the site.

The home page has been edited by hand since the export to include the UX review changes (`docs/plans/ux-review-fixes.md`). Rules it needs beyond inline styles (breakpoints, pseudo-elements) live in the `<style>` block at the top, as classes.

Phase 1 of the November 2026 review actions (grade check and enquiry flow) deliberately updates the contact intro, missing-number labels, optional email, consent, email handoff and submission states. The home reference mirrors those changes in both its markup and its `Component` validation/submission logic. The privacy reference mirrors the default email transport, optional email and checker summary disclosure, country-neutral placeholders and revised date. Other sections and the 64-pixel tolerance are unchanged.

The November 2026 typography correction deliberately aligns page headings to Archivo at 78% width, uses Hanken 500 for the home introduction, and enables genuine weight 800 for Hanken and Barlow. Navigation uses Hanken 600 in both inline and mobile layouts, and journey phase labels/choices use Barlow 700. The references mirror those changes and the mobile text-size adjustment rule. The checker has no exported prototype; its corresponding roles and responsive duplication are covered by `tests/ux/typography.spec.ts`. The 64-pixel tolerance is unchanged.

The reference server serves the pinned Fontsource binaries from `node_modules` under `/fonts/`, so font comparisons need no Google Fonts access and cannot drift with upstream font updates. Its font-face declarations and layout remain independent of the production stylesheet. The runtime still loads React and Babel from unpkg; those requests need internet on the first run and are then cached.
