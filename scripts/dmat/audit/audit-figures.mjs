// Independent audit of the figure sequences in bank.json.
import { readFileSync } from 'node:fs';
const bank = JSON.parse(readFileSync(process.argv[2] ?? 0, 'utf8'));
const PERIOD = { square: 1, circle: 1, diamond: 1, hexagon: 2, triangle: 4, arrow: 4, angle: 4, halfCircle: 4, trapezoid: 4, flag: 4 };
const G = 4;
const mod = (x, m) => ((x % m) + m) % m;
const inGrid = ([r, c]) => r >= 0 && r < G && c >= 0 && c < G;
const RING = [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [3, 0], [2, 0], [1, 0]];
const ringIndex = ([r, c]) => RING.findIndex(([a, b]) => a === r && b === c);

// ---------- 1. Can the right option be found by comparing the options alone? ----------
const vis = (shape, s) => `${s.pos}|${s.orient % PERIOD[shape]}|${s.colour}`;
const attrs = (shape, s) => [`${s.pos}`, `${s.orient % PERIOD[shape]}`, s.colour];
function majorityPick(item, opts, perAttribute) {
  // For each figure (or each attribute of each figure) take the value most options agree on;
  // return the options that match every majority value, or null when some value has no majority.
  const cols = [];
  item.figures.forEach((f, i) => {
    if (perAttribute) for (let a = 0; a < 3; a++) cols.push(opts.map((o) => attrs(f.shape, o.frame[i])[a]));
    else cols.push(opts.map((o) => vis(f.shape, o.frame[i])));
  });
  const fits = opts.map(() => true);
  for (const col of cols) {
    const count = {};
    for (const v of col) count[v] = (count[v] ?? 0) + 1;
    const top = Object.entries(count).sort((a, b) => b[1] - a[1]);
    if (top.length === 1) continue;
    if (top[0][1] === 1) return null; // three different values: no majority
    col.forEach((v, k) => { if (v !== top[0][0]) fits[k] = false; });
  }
  return fits.map((ok, k) => (ok ? k : -1)).filter((k) => k >= 0);
}
const blankCounts = () => ({ right: 0, wrong: 0, none: 0 });
const setNameOf = (id) => id.match(/^(.*)-F-[lmh]\d+$/)?.[1] ?? 'all';
const leak = { fig: blankCounts(), attr: blankCounts() };
const leakByN = {};
const leakBySet = { fig: {}, attr: {} };
const leakByBand = { fig: {}, attr: {} };
for (const it of bank.figures) {
  const setName = setNameOf(it.id);
  const band = it.band ?? 'unknown';
  [[it.options5, it.answer[0]], [it.options6, it.answer[1]]].forEach(([opts, ans]) => {
    for (const [name, per] of [['fig', false], ['attr', true]]) {
      const pick = majorityPick(it, opts, per);
      const res = !pick || pick.length !== 1 ? 'none' : pick[0] === ans ? 'right' : 'wrong';
      leak[name][res]++;
      leakBySet[name][setName] ??= blankCounts();
      leakBySet[name][setName][res]++;
      leakByBand[name][band] ??= blankCounts();
      leakByBand[name][band][res]++;
      if (name === 'attr') { const n = it.figures.length; leakByN[n] ??= blankCounts(); leakByN[n][res]++; }
    }
  });
}
const sets = bank.figures.length * 2;
console.log(`Figures: ${bank.figures.length} items, ${sets} option sets`);
console.log(`  "pick what most options agree on", per figure: ${JSON.stringify(leak.fig)}`);
console.log(`  same, per attribute (position, turn, colour): ${JSON.stringify(leak.attr)}`);
console.log(`  per attribute by number of figures: ${JSON.stringify(leakByN)}`);
console.log(`  per figure by set: ${JSON.stringify(leakBySet.fig)}`);
console.log(`  per attribute by set: ${JSON.stringify(leakBySet.attr)}`);
console.log(`  per figure by band: ${JSON.stringify(leakByBand.fig)}`);
console.log(`  per attribute by band: ${JSON.stringify(leakByBand.attr)}`);
for (const [method, result] of Object.entries(leak)) {
  if ((result.right + result.wrong) * 10 > sets) {
    console.error(method, 'unique choices', result.right + result.wrong, 'of', sets);
    process.exitCode = 1;
  }
}

// Odd one out: in a figure (or attribute) where two options agree, the third is the odd one out.
// If one option is the odd one out more often, or less often, than both others, "pick the option
// that never stands out" or "rule out the one that stands out most" says something without solving.
function oddCounts(item, opts, perAttribute) {
  const odd = opts.map(() => 0);
  item.figures.forEach((f, i) => {
    const cols = perAttribute
      ? [0, 1, 2].map((a) => opts.map((o) => attrs(f.shape, o.frame[i])[a]))
      : [opts.map((o) => vis(f.shape, o.frame[i]))];
    for (const col of cols) {
      if (new Set(col).size !== 2) continue;
      col.forEach((v, k) => { if (col.filter((w) => w === v).length === 1) odd[k]++; });
    }
  });
  return odd;
}
const uniqueIndex = (values, target) => (values.filter((v) => v === target).length === 1 ? values.indexOf(target) : -1);
const oddLeak = {};
for (const it of bank.figures) {
  [[it.options5, it.answer[0]], [it.options6, it.answer[1]]].forEach(([opts, ans]) => {
    for (const [level, per] of [['fig', false], ['attr', true]]) {
      const odd = oddCounts(it, opts, per);
      for (const [method, k] of [['never odd', uniqueIndex(odd, Math.min(...odd))], ['most odd', uniqueIndex(odd, Math.max(...odd))]]) {
        const name = `${method}, per ${level === 'fig' ? 'figure' : 'attribute'}`;
        oddLeak[name] ??= { points: 0, toAnswer: 0 };
        if (k >= 0 && Math.min(...odd) !== Math.max(...odd)) {
          oddLeak[name].points++;
          if (k === ans) oddLeak[name].toAnswer++;
        }
      }
    }
  });
}
console.log(`  odd one out (option sets where one option stands apart, and how many of those are the answer): ${JSON.stringify(oddLeak)}`);
for (const [method, result] of Object.entries(oddLeak)) {
  if (result.points * 10 > sets) {
    console.error(method, 'singles out an option in', result.points, 'of', sets);
    process.exitCode = 1;
  }
}

// How many features (an attribute of a figure) differ between the three options, against what the
// four matrices shown allow. Options that differ in only one feature tell the student which single
// feature to work out. Without an odd one out, two features can differ only when each can take two
// different wrong values (it shows three or more values), or three features can each take one.
const varying = {};
let narrow = 0, narrowable = 0;
for (const it of bank.figures) {
  const shownValues = it.figures.flatMap((f, i) => [0, 1, 2].map((a) => new Set(it.shown.map((fr) => attrs(f.shape, fr[i])[a])).size));
  const roomy = shownValues.filter((n) => n > 1).length >= 3 || shownValues.filter((n) => n > 2).length >= 2;
  for (const opts of [it.options5, it.options6]) {
    const differ = it.figures.reduce((sum, f, i) =>
      sum + [0, 1, 2].filter((a) => new Set(opts.map((o) => attrs(f.shape, o.frame[i])[a])).size > 1).length, 0);
    varying[differ] = (varying[differ] ?? 0) + 1;
    if (roomy) {
      narrowable++;
      if (differ < 2) narrow++;
    }
  }
}
console.log(`  features that differ between the options: ${JSON.stringify(varying)}; only one where the matrices allow more: ${narrow} of ${narrowable}`);
if (narrow * 10 > narrowable) {
  console.error('options differ in only one feature in', narrow, 'of', narrowable, 'option sets whose matrices allow more');
  process.exitCode = 1;
}

// ---------- 2. A wider family of readings than the generator checks ----------
function* movements(start) {
  yield { kind: 'static' };
  for (const dir of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, 1], [-1, -1], [1, 1], [1, -1]]) {
    for (const step of [1, 2, 3]) yield { kind: 'line', dir, step, growth: false };
    yield { kind: 'line', dir, step: 1, growth: true };
  }
  if (ringIndex(start) >= 0) for (const cw of [1, -1]) {
    for (const step of [1, 2, 3, 4, 5]) yield { kind: 'border', cw, step, growth: false };
    yield { kind: 'border', cw, step: 1, growth: true };
  }
  const D = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  // any repeating list of 2, 3 or 4 single-field moves
  for (const len of [2, 3, 4]) {
    const rec = function* (acc) {
      if (acc.length === len) { yield { kind: 'pattern', dirs: acc }; return; }
      for (const d of D) yield* rec([...acc, d]);
    };
    yield* rec([]);
  }
}
function positions(start, mv) {
  const out = [start];
  let pos = start, dir = mv.dir, ring = ringIndex(start);
  for (let t = 1; t < 6; t++) {
    if (mv.kind === 'line') {
      const steps = mv.growth ? t : mv.step;
      for (let s = 0; s < steps; s++) {
        let next = [pos[0] + dir[0], pos[1] + dir[1]];
        if (!inGrid(next)) { dir = [-dir[0], -dir[1]]; next = [pos[0] + dir[0], pos[1] + dir[1]]; }
        if (!inGrid(next)) return null;
        pos = next;
      }
    } else if (mv.kind === 'border') {
      ring = mod(ring + mv.cw * (mv.growth ? t : mv.step), 12);
      pos = RING[ring];
    } else if (mv.kind === 'pattern') {
      const d = mv.dirs[(t - 1) % mv.dirs.length];
      pos = [pos[0] + d[0], pos[1] + d[1]];
      if (!inGrid(pos)) return null;
    }
    out.push(pos);
  }
  return out;
}
let extraReadings = 0;
const extraList = [];
let unseenColour = 0;
const unseenList = [];
let colourGrowth = 0, missingKey = 0;
for (const it of bank.figures) {
  it.figures.forEach((f, i) => {
    const shown = it.shown.map((fr) => fr[i]);
    const truth = [it.options5[it.answer[0]].frame[i], it.options6[it.answer[1]].frame[i]];
    const answers = new Map();
    for (const mv of movements(shown[0].pos)) {
      const p = positions(shown[0].pos, mv);
      if (!p) continue;
      if (!p.slice(0, 4).every((x, k) => x[0] === shown[k].pos[0] && x[1] === shown[k].pos[1])) continue;
      const key = `${p[4]}|${p[5]}`;
      if (!answers.has(key)) answers.set(key, mv);
    }
    const truthKey = `${truth[0].pos}|${truth[1].pos}`;
    if (!answers.has(truthKey)) missingKey++;
    if (answers.size > 1 || !answers.has(truthKey)) {
      extraReadings++;
      extraList.push(`${it.id} ${it.band} ${f.shape} (${f.movement.kind}): shown ${shown.map((s) => s.pos.join('')).join('>')} key ${truthKey}; other readings ${[...answers].filter(([k]) => k !== truthKey).map(([k, m]) => `${k} via ${m.kind}${m.kind === 'pattern' ? `[${m.dirs.length}]` : m.kind === 'static' ? '' : `/${m.growth ? 'x+1' : m.step}`}`).join(' ; ')}`);
    }
    // colours of the rule never seen in the four matrices
    const seen = new Set(shown.map((s) => s.colour));
    if (f.colour.cycle.some((c) => !seen.has(c))) { unseenColour++; unseenList.push(`${it.id} ${f.shape} cycle ${f.colour.cycle.join('>')}${f.colour.growth ? ' x+1' : ''} shown ${shown.map((s) => s.colour).join('>')} then ${truth.map((s) => s.colour).join('>')}`); }
    if (f.colour.growth) colourGrowth++;
  });
}
console.log(`  figures with another reading of their movement (wider family: steps of 3, x+1 along a line, 2- and 3-move patterns): ${extraReadings}`);
for (const l of extraList) console.log(`    ${l}`);
console.log(`  figures whose colour rule includes a colour never shown in matrices 1–4: ${unseenColour} (colour x+1 rules in the bank: ${colourGrowth})`);
for (const l of unseenList) console.log(`    ${l}`);
if (unseenColour || missingKey) process.exitCode = 1;

// ---------- 3. How much of each wrong option differs from the right one ----------
const diffCount = {};
for (const it of bank.figures) for (const [opts, ans] of [[it.options5, it.answer[0]], [it.options6, it.answer[1]]]) {
  for (const o of opts) if (!o.correct) {
    const d = it.figures.filter((f, i) => vis(f.shape, o.frame[i]) !== vis(f.shape, opts[ans].frame[i])).length;
    diffCount[d] = (diffCount[d] ?? 0) + 1;
  }
}
console.log(`  figures that differ between a wrong option and the right one: ${JSON.stringify(diffCount)}`);

// ---------- 4. Two figures with the same colour in one matrix; white figures ----------
let sameColour = 0, white = 0;
for (const it of bank.figures) {
  if (it.shown.some((fr) => new Set(fr.map((s) => s.colour)).size !== fr.length)) sameColour++;
  if (it.figures.some((f) => f.colour.cycle.includes('white'))) white++;
}
console.log(`  items where two figures share a colour in some matrix: ${sameColour}; items using white: ${white}`);
