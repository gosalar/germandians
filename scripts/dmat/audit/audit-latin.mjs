// Independent audit of the Latin squares in bank.json. Shares no code with the generator.
import { readFileSync } from 'node:fs';
const bank = JSON.parse(readFileSync(process.argv[2] ?? 0, 'utf8'));
const L = ['A', 'B', 'C', 'D', 'E'];
const N = 5;

function completions(givens, cap = 5000) {
  const g = givens.map((r) => [...r]);
  const out = [];
  const rec = (i) => {
    if (out.length >= cap) return;
    if (i === 25) { out.push(g.map((r) => r.join('')).join('')); return; }
    const r = Math.floor(i / 5), c = i % 5;
    if (g[r][c]) return rec(i + 1);
    for (const x of L) {
      if (g[r].includes(x) || g.some((row) => row[c] === x)) continue;
      g[r][c] = x; rec(i + 1); g[r][c] = null;
    }
  };
  rec(0);
  return out;
}

// Deductions available from a grid, by the two human moves.
function deductions(g) {
  const out = new Map(); // cellIndex -> letter
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (g[r][c]) continue;
    const seen = new Set([...g[r], ...g.map((row) => row[c])].filter(Boolean));
    if (seen.size === 4) out.set(r * 5 + c, L.find((x) => !seen.has(x)));
  }
  for (let line = 0; line < N; line++) for (const x of L) for (const isRow of [true, false]) {
    const cells = Array.from({ length: N }, (_, i) => (isRow ? [line, i] : [i, line]));
    if (cells.some(([r, c]) => g[r][c] === x)) continue;
    const open = cells.filter(([r, c]) => !g[r][c] && !(isRow ? g.some((row) => row[c] === x) : g[r].includes(x)));
    if (open.length === 1) out.set(open[0][0] * 5 + open[0][1], x);
  }
  return out;
}

// Exact minimum number of other cells to fill before the target is forced.
function minAux(givens, target) {
  const tk = target[0] * 5 + target[1];
  let frontier = new Map([['', givens.map((r) => [...r])]]);
  for (let depth = 0; depth <= 12; depth++) {
    const next = new Map();
    for (const [key, g] of frontier) {
      const d = deductions(g);
      if (d.has(tk)) return depth;
      for (const [k, x] of d) {
        const nk = [...(key ? key.split(',') : []), k].map(Number).sort((a, b) => a - b).join(',');
        if (next.has(nk)) continue;
        const ng = g.map((r) => [...r]);
        ng[Math.floor(k / 5)][k % 5] = x;
        next.set(nk, ng);
      }
    }
    if (next.size === 0) return -1;
    frontier = next;
  }
  return -2;
}

const rows = [];
let wrongKey = 0, notForced = 0, auxMismatch = 0, multi = 0;
const diffs = [];
const tgtPos = new Map();
for (const it of bank.latin) {
  const comps = completions(it.givens);
  const tIdx = it.target[0] * 5 + it.target[1];
  const letters = new Set(comps.map((s) => s[tIdx]));
  if (letters.size !== 1) notForced++;
  else if ([...letters][0] !== it.answer) wrongKey++;
  if (comps.length > 1) multi++;
  const exact = minAux(it.givens, it.target);
  if (exact !== it.analysis.aux) { auxMismatch++; diffs.push(`${it.id} ${it.band} reported ${it.analysis.aux} exact ${exact}`); }
  // Candidates for the target from its own row and column alone.
  const seen = new Set([...it.givens[it.target[0]], ...it.givens.map((r) => r[it.target[1]])].filter(Boolean));
  rows.push({ id: it.id, band: it.band, stretch: it.tags.includes('stretch'), aux: it.analysis.aux, exact, completions: comps.length, crossCandidates: 5 - seen.size, givens: it.givens.flat().filter(Boolean).length });
  tgtPos.set(tIdx, (tgtPos.get(tIdx) ?? 0) + 1);
}
console.log(`Latin: ${bank.latin.length} items`);
console.log(`  answer not forced by the givens: ${notForced}`);
console.log(`  key differs from the forced letter: ${wrongKey}`);
console.log(`  grids with more than one full completion (answer still forced): ${multi}`);
console.log(`  reported chain length differs from the exact minimum: ${auxMismatch}`);
for (const d of diffs) console.log(`    ${d}`);
for (const band of ['low', 'medium', 'high']) {
  const xs = rows.filter((r) => r.band === band);
  const tally = (f) => { const m = {}; for (const x of xs) m[f(x)] = (m[f(x)] ?? 0) + 1; return JSON.stringify(m); };
  console.log(`  ${band}: exact chain ${tally((x) => x.exact)} | candidates left from own row+column ${tally((x) => x.crossCandidates)} | givens ${tally((x) => x.givens)}`);
}
console.log(`  distinct target cells used: ${tgtPos.size} of 25`);
if (notForced || wrongKey || auxMismatch) process.exitCode = 1;
