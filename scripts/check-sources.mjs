import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SOURCES } from '../src/utils/applicationFacts.ts';

const DEFAULT_SNAPSHOT_PATH = fileURLToPath(new URL('./sources-snapshot.json', import.meta.url));
const TIMEOUT_MS = 20_000;
const RETRY_DELAY_MS = 1_000;
const MAX_CONCURRENCY = 4;

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; OfficialSourceCheck/1.0)',
  Accept: 'text/html,application/xhtml+xml,application/pdf,*/*;q=0.8',
  'Accept-Language': 'en-GB,en;q=0.9,de;q=0.8',
};

export function normaliseHtml(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isPdfBuffer(bytes) {
  return (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

export function isHtmlContent(contentType, bytes) {
  if (isPdfBuffer(bytes)) {
    return false;
  }
  const lower = (contentType ?? '').toLowerCase();
  if (lower.includes('application/pdf')) {
    return false;
  }
  if (lower.includes('text/html') || lower.includes('application/xhtml+xml')) {
    return true;
  }
  if (!lower) {
    const head = Buffer.from(bytes.subarray(0, 256)).toString('utf8').trimStart().toLowerCase();
    return head.startsWith('<!doctype html') || head.startsWith('<html');
  }
  return false;
}

function decodeHtmlBuffer(bytes, contentType) {
  const charsetMatch = (contentType ?? '').match(/charset=([^\s;]+)/i);
  const label = charsetMatch ? charsetMatch[1].replace(/^["']|["']$/g, '').toLowerCase() : 'utf-8';
  try {
    return new TextDecoder(label).decode(bytes);
  } catch {
    return new TextDecoder('utf-8').decode(bytes);
  }
}

export function hashResponseBody(bytes, contentType) {
  const buffer = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  if (isHtmlContent(contentType, buffer)) {
    const text = normaliseHtml(decodeHtmlBuffer(buffer, contentType));
    return createHash('sha256').update(text, 'utf8').digest('hex');
  }
  return createHash('sha256').update(buffer).digest('hex');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function describeError(error) {
  if (!error) {
    return 'request failed';
  }
  if (error.name === 'TimeoutError' || error.name === 'AbortError') {
    return `timed out after ${TIMEOUT_MS / 1000}s`;
  }
  const causeCode = error.cause && typeof error.cause === 'object' ? error.cause.code : undefined;
  if (causeCode) {
    return `${error.message} (${causeCode})`;
  }
  return error.message || String(error);
}

export async function fetchSourceOnce(url, fetchImpl = fetch, timeoutMs = TIMEOUT_MS) {
  const response = await fetchImpl(url, {
    headers: REQUEST_HEADERS,
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
  });
  const arrayBuffer = await response.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  const contentType = response.headers.get('content-type') ?? '';
  const sha256 = hashResponseBody(bytes, contentType);
  return {
    ok: response.ok,
    status: response.status,
    sha256,
    contentType,
  };
}

export async function fetchSourceWithRetry(
  url,
  { fetchImpl = fetch, timeoutMs = TIMEOUT_MS, retryDelayMs = RETRY_DELAY_MS } = {},
) {
  let firstFailure = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (attempt > 0 && retryDelayMs > 0) {
      await sleep(retryDelayMs);
    }
    try {
      const result = await fetchSourceOnce(url, fetchImpl, timeoutMs);
      if (result.ok || attempt === 1) {
        return { ...result, error: null, attempts: attempt + 1 };
      }
      firstFailure = result;
    } catch (error) {
      if (attempt === 1) {
        if (firstFailure) {
          return { ...firstFailure, error: null, attempts: 2 };
        }
        return {
          ok: false,
          status: null,
          sha256: null,
          contentType: null,
          error: describeError(error),
          attempts: 2,
        };
      }
    }
  }
  return {
    ok: false,
    status: null,
    sha256: null,
    contentType: null,
    error: 'request failed',
    attempts: 2,
  };
}

export async function fetchAllSources(sourcesMap, options = {}) {
  const uniqueUrls = [...new Set(Object.values(sourcesMap).map((entry) => entry.url))];
  const byHost = new Map();
  for (const url of uniqueUrls) {
    const host = new URL(url).host;
    if (!byHost.has(host)) {
      byHost.set(host, []);
    }
    byHost.get(host).push(url);
  }

  const hostQueues = [...byHost.values()];
  const resultsByUrl = new Map();
  let nextQueueIndex = 0;

  async function worker() {
    while (nextQueueIndex < hostQueues.length) {
      const queue = hostQueues[nextQueueIndex];
      nextQueueIndex += 1;
      for (const url of queue) {
        const result = await fetchSourceWithRetry(url, options);
        resultsByUrl.set(url, result);
      }
    }
  }

  const workerCount = Math.min(MAX_CONCURRENCY, hostQueues.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return resultsByUrl;
}

export function compareSources(sourcesMap, snapshot, resultsByUrl) {
  const recorded = snapshot?.sources ?? {};
  const unchanged = [];
  const changed = [];
  const failed = [];

  for (const [key, source] of Object.entries(sourcesMap)) {
    const live = resultsByUrl.get(source.url);
    const previous = recorded[key];

    if (!live || live.error) {
      failed.push({
        key,
        source,
        reason: live?.error ?? 'not fetched',
      });
      continue;
    }

    if (live.status < 200 || live.status >= 300) {
      const expected = previous?.status ? ` (snapshot had HTTP ${previous.status})` : '';
      failed.push({
        key,
        source,
        reason: `HTTP ${live.status}${expected}`,
      });
      continue;
    }

    if (!previous) {
      changed.push({
        key,
        source,
        reason: `not yet recorded in snapshot (HTTP ${live.status})`,
      });
      continue;
    }

    if (previous.url !== source.url) {
      changed.push({
        key,
        source,
        reason: `URL changed from ${previous.url} (HTTP ${live.status})`,
      });
      continue;
    }

    if (previous.status !== live.status) {
      changed.push({
        key,
        source,
        reason: `HTTP status changed from ${previous.status} to ${live.status}`,
      });
      continue;
    }

    if (previous.sha256 !== live.sha256) {
      changed.push({
        key,
        source,
        reason: `normalised content changed (HTTP ${live.status})`,
      });
      continue;
    }

    unchanged.push({
      key,
      source,
      status: live.status,
    });
  }

  return { unchanged, changed, failed };
}

export function formatReport(comparison, { snapshotGeneratedAt, totalSources, uniqueUrlCount }) {
  const { unchanged, changed, failed } = comparison;
  const lines = [
    '# Official source check',
    '',
    `Snapshot date: ${snapshotGeneratedAt ?? 'unknown'}`,
    `Checked: ${totalSources} source entries (${uniqueUrlCount} unique URLs)`,
    `Result: ${unchanged.length} unchanged, ${changed.length} changed, ${failed.length} failed or unreachable.`,
    '',
    `## Changed (${changed.length})`,
    '',
  ];

  if (changed.length === 0) {
    lines.push('None.');
  } else {
    for (const item of changed) {
      lines.push(
        `- \`${item.key}\` — ${item.source.label} (last reviewed: ${item.source.reviewed}) — ${item.reason} — ${item.source.url}`,
      );
    }
  }

  lines.push('', `## Failed or unreachable (${failed.length})`, '');

  if (failed.length === 0) {
    lines.push('None.');
  } else {
    for (const item of failed) {
      lines.push(
        `- \`${item.key}\` — ${item.source.label} (last reviewed: ${item.source.reviewed}) — ${item.reason} — ${item.source.url}`,
      );
    }
  }

  lines.push('', `## Unchanged (${unchanged.length})`, '');

  if (unchanged.length === 0) {
    lines.push('None.');
  } else {
    for (const item of unchanged) {
      lines.push(
        `- \`${item.key}\` — ${item.source.label} (last reviewed: ${item.source.reviewed}) — HTTP ${item.status}`,
      );
    }
  }

  return `${lines.join('\n')}\n`;
}

function parseArgs(argv) {
  let update = false;
  let strict = false;
  let snapshotPath = DEFAULT_SNAPSHOT_PATH;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--update') {
      update = true;
    } else if (arg === '--strict') {
      strict = true;
    } else if (arg === '--snapshot') {
      const next = argv[i + 1];
      if (!next) {
        throw new Error('Missing file path after --snapshot.');
      }
      snapshotPath = path.resolve(next);
      i += 1;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return { update, strict, snapshotPath };
}

async function runCli() {
  const { update, strict, snapshotPath } = parseArgs(process.argv.slice(2));
  const totalSources = Object.keys(SOURCES).length;
  const uniqueUrlCount = new Set(Object.values(SOURCES).map((entry) => entry.url)).size;

  if (!update && !existsSync(snapshotPath)) {
    console.error(
      `Snapshot file not found at ${snapshotPath}. Run "node scripts/check-sources.mjs --update" to create it.`,
    );
    process.exitCode = 1;
    return;
  }

  const existingSnapshot = existsSync(snapshotPath)
    ? JSON.parse(readFileSync(snapshotPath, 'utf8'))
    : null;

  const resultsByUrl = await fetchAllSources(SOURCES);

  if (update) {
    const nextSources = {};
    const failures = [];

    for (const [key, source] of Object.entries(SOURCES)) {
      const live = resultsByUrl.get(source.url);
      if (live && !live.error && live.status >= 200 && live.status < 300) {
        nextSources[key] = {
          url: source.url,
          status: live.status,
          sha256: live.sha256,
        };
      } else {
        const reason = live?.error ?? `HTTP ${live?.status ?? 'unknown'}`;
        failures.push({ key, source, reason });
        const previous = existingSnapshot?.sources?.[key];
        if (previous && previous.url === source.url) {
          nextSources[key] = previous;
        } else {
          nextSources[key] = {
            url: source.url,
            status: live?.status ?? null,
            sha256: live?.sha256 ?? null,
          };
        }
      }
    }

    const snapshotData = {
      generatedAt: new Date().toISOString(),
      sources: nextSources,
    };
    writeFileSync(snapshotPath, `${JSON.stringify(snapshotData, null, 2)}\n`, 'utf8');

    const recordedCount = Object.keys(nextSources).length - failures.length;
    console.log(
      `Wrote ${snapshotPath}: ${recordedCount} of ${totalSources} source entries recorded (${uniqueUrlCount} unique URLs).`,
    );
    if (failures.length > 0) {
      console.warn(`Failed or non-2xx during snapshot update (${failures.length}):`);
      for (const item of failures) {
        console.warn(`- ${item.key} (${item.source.label}): ${item.reason} — ${item.source.url}`);
      }
      if (strict) {
        process.exitCode = 1;
      }
    }
    return;
  }

  const comparison = compareSources(SOURCES, existingSnapshot, resultsByUrl);
  const report = formatReport(comparison, {
    snapshotGeneratedAt: existingSnapshot?.generatedAt,
    totalSources,
    uniqueUrlCount,
  });
  process.stdout.write(report);

  if (strict && (comparison.changed.length > 0 || comparison.failed.length > 0)) {
    process.exitCode = 1;
  }
}

const isMain =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  await runCli();
}
