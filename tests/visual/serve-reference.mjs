// Serves the design reference for the visual tests (see playwright.config.ts).
import http from 'node:http';
import { fileURLToPath } from 'node:url';

import handler from 'serve-handler';

const root = fileURLToPath(new URL('./reference', import.meta.url));
const fontRoot = fileURLToPath(new URL('../../node_modules', import.meta.url));
const port = Number(process.env.PORT ?? 5601);

http.createServer((req, res) => {
  // Pin reference glyphs to the installed font versions, independently of the
  // production CSS. Google Fonts responses can change and require network access.
  if (req.url?.startsWith('/fonts/')) {
    req.url = req.url.slice('/fonts'.length);
    return handler(req, res, { public: fontRoot, directoryListing: false });
  }
  return handler(req, res, { public: root });
}).listen(port, () => {
  console.log(`Design reference on http://localhost:${port}`);
});
