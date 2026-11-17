// Independent audit of the equation systems in bank.json. Evaluates the printed text directly.
//   node audit/audit-equations.mjs out/bank.json
import { readFileSync } from 'node:fs';
import { holds, lettersOf, spareEquations } from './linear.mjs';
const bank = JSON.parse(readFileSync(process.argv[2] ?? 0, 'utf8'));

function solutions(eqs, vars, lo, hi) {
  const out = [];
  const vals = {};
  const rec = (i) => {
    if (i === vars.length) { if (eqs.every((e) => holds(e, vals))) out.push({ ...vals }); return; }
    for (let x = lo; x <= hi; x++) { vals[vars[i]] = x; rec(i + 1); }
  };
  rec(0);
  return out;
}

let bad = 0, rangeOnly = 0;
const rows = [];
for (const it of bank.equations) {
  const vars = lettersOf(it.equations);
  const sols = solutions(it.equations, vars, 1, 20);
  // The key is a value for every letter, as the real test asks for.
  const keyed = Object.keys(it.solution).sort().join('') === vars.join('');
  if (sols.length !== 1 || !keyed || vars.some((v) => sols[0][v] !== it.solution[v])) { bad++; console.log('  NOT UNIQUE / WRONG KEY', it.id); }
  // Still one solution in a wider window? If not, only the 1–20 limit makes it unique.
  if (solutions(it.equations, vars, -6, 26).length !== 1) rangeOnly++;
  rows.push({ id: it.id, band: it.band, n: vars.length, eqs: it.equations.length, spare: spareEquations(it.equations).length, largest: it.analysis.largest });
}
console.log(`Equations: ${bank.equations.length} items`);
console.log(`  not exactly one solution in 1–20, or the key does not give every letter correctly: ${bad}`);
console.log(`  unique only because of the 1–20 limit: ${rangeOnly}`);
console.log(`  items that show an equation no letter needs: ${rows.filter((r) => r.spare > 0).length}`);
if (bad) process.exitCode = 1;
for (const band of ['low', 'medium', 'high']) {
  const xs = rows.filter((r) => r.band === band);
  const tally = (f) => { const m = {}; for (const x of xs) m[f(x)] = (m[f(x)] ?? 0) + 1; return JSON.stringify(m); };
  console.log(`  ${band}: letters ${tally((x) => x.n)} | equations shown ${tally((x) => x.eqs)} | largest number in the head: max ${Math.max(...xs.map((x) => x.largest))}`);
}
