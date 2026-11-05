# Design reference

The Claude Design prototype the site must match, copied from the design handoff:

- `Germandians v4.dc.html`: home page
- `Germandians Privacy.dc.html`: privacy note
- `support.js`: Claude Design's runtime that renders the two pages
- `assets/`: images the pages use

Don't edit these files to make a test pass. They change only when the design does: either replace them with a new export, or edit them by hand to match a deliberate change to the site.

The home page has been edited by hand since the export to include the UX review changes (`docs/plans/ux-review-fixes.md`). Rules it needs beyond inline styles (breakpoints, pseudo-elements) live in the `<style>` block at the top, as classes.

The runtime loads React and Babel from unpkg and fonts from Google Fonts, so running the visual tests needs an internet connection.
