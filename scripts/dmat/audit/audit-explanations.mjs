// Quality of the worked solutions and wrong-option notes in bank.json.
//   node audit/audit-explanations.mjs out/bank.json
import { readFileSync } from 'node:fs';
const bank = JSON.parse(readFileSync(process.argv[2] ?? 0, 'utf8'));

const decimals = [], longRoute = [], backwards = [], readOff = [];
for (const it of bank.equations) {
  const text = [...it.analysis.plan.map((p) => p.text), ...it.steps].join(' ');
  if (/\d\.\d/.test(text)) decimals.push(it.id);
  // Every letter is asked, so the worked solution has to reach each one and quote every equation.
  const upto = it.steps.join(' ');
  const unused = it.equations.filter((e) => !upto.includes(e)).length;
  const missing = Object.entries(it.solution).filter(([k, v]) => !new RegExp(`\\b${k} = ${v}\\b`).test(upto)).map(([k]) => k);
  if (unused || missing.length) longRoute.push(`${it.id} ${it.band}: ${unused} equation(s) never quoted, letters without a stated value: ${missing.join(' ') || 'none'}`);
  // "Write X = … (from EQ)" where EQ is not already written as "… = X"
  for (const m of text.matchAll(/(?:Write|,| and) ([A-D]) = [^().]*? \(from ([^)]*)\)/g)) {
    // Turning "A ÷ 3 = D" into "A = 3 × D" is the intended way round a division, not a detour.
    const from = m[2].split(',')[0].trim();
    if (from.includes('÷')) continue;
    if (!from.endsWith(`= ${m[1]}`) && !from.startsWith(`${m[1]} =`)) { backwards.push(it.id); break; }
  }
  // two equations with the same left side: the answer can be read off
  const lefts = it.equations.map((e) => e.split('=')[0].trim());
  if (new Set(lefts).size !== lefts.length) readOff.push(it.id);
}
console.log(`Equations: worked solutions with decimals such as "1.33A": ${decimals.length} (${decimals.join(' ')})`);
console.log(`  worked solution skips an equation or does not state a letter's value: ${longRoute.length}`);
for (const l of longRoute) console.log(`    ${l}`);
console.log(`  rewrites the combining equation instead of using the ready-made "… = X" line: ${backwards.length} (${backwards.join(' ')})`);
console.log(`  two equations share a left side, so the answer can be read off: ${readOff.length} (${readOff.join(' ')})`);

// Figures: wrong-option notes that do not match what is drawn.
let sameAsFour = 0, total = 0;
const kinds = {};
for (const it of bank.figures) {
  const m4 = it.shown[3];
  for (const [opts] of [[it.options5], [it.options6]]) for (const o of opts) for (const part of o.misconception ? o.misconception.parts ?? [o.misconception] : []) if (part.kind !== 'swap') {
    total++;
    const i = part.figure;
    const s = o.frame[i];
    const k = part.kind;
    // a "moved too far / wrong way" note where the figure is drawn in the same field as in matrix 4
    if (/^(line|border|loop|diagonal)/.test(k) && opts === it.options5 && `${s.pos}` === `${m4[i].pos}`) { sameAsFour++; kinds[k] = (kinds[k] ?? 0) + 1; }
  }
}
console.log(`Figures: movement-mistake notes for matrix 5 where the figure is drawn exactly where it was in matrix 4: ${sameAsFour} of ${total} notes ${JSON.stringify(kinds)}`);
if (decimals.length || longRoute.length || backwards.length || readOff.length || sameAsFour) process.exitCode = 1;
