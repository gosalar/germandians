// Serves the design reference for the visual tests (see playwright.config.ts).
import http from 'node:http';
import { fileURLToPath } from 'node:url';

import handler from 'serve-handler';

const root = fileURLToPath(new URL('./reference', import.meta.url));
const port = Number(process.env.PORT ?? 5601);

http.createServer((req, res) => handler(req, res, { public: root })).listen(port, () => {
  console.log(`Design reference on http://localhost:${port}`);
});
