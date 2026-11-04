import http from 'node:http';
import path from 'node:path';
import handler from 'serve-handler';

const root = path.resolve(process.argv[2] ?? 'build/client');
const port = Number(process.argv[3] ?? 4173);
// The build includes 404.html, which serve-handler returns with HTTP 404 for unknown paths, like Pages.
http.createServer((req, res) => handler(req, res, { public: root, directoryListing: false }))
  .listen(port, () => console.log(`Serving ${root} at http://localhost:${port}`));
