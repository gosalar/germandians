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
const leak = { fig: { right: 0, wrong: 0, none: 0 }, attr: { right: 0, wrong: 0, none: 0 } };
const leakByN = {};
for (const it of bank.figures) {
  [[it.options5, it.answer[0]], [it.options6, it.answer[1]]].forEach(([opts, ans]) => {
    for (const [name, per] of [['fig', false], ['attr', true]]) {
      const pick = majorityPick(it, opts, per);
      const res = !pick || pick.length !== 1 ? 'none' : pick[0] === ans ? 'right' : 'wrong';
      leak[name][res]++;
      if (name === 'attr') { const n = it.figures.length; leakByN[n] ??= { right: 0, wrong: 0, none: 0 }; leakByN[n][res]++; }
    }
  });
}
console.log(`Figures: ${bank.figures.length} items, ${bank.figures.length * 2} option sets`);
console.log(`  "pick what most options agree on", per figure: ${JSON.stringify(leak.fig)}`);
console.log(`  same, per attribute (position, turn, colour): ${JSON.stringify(leak.attr)}`);
console.log(`  per attribute by number of figures: ${JSON.stringify(leakByN)}`);

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
