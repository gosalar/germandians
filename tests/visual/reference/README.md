# Design reference

The Claude Design prototype the site must match, copied from the design handoff:

- `Germandians v4.dc.html`: home page
- `Germandians Privacy.dc.html`: privacy note
- `support.js`: Claude Design's runtime that renders the two pages
- `assets/`: images the pages use

Don't edit these files to make a test pass. If the design changes, replace them with the new export and update the site to match.

The runtime loads React and Babel from unpkg and fonts from Google Fonts, so running the visual tests needs an internet connection.
