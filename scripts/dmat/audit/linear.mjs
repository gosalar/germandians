// Shared by the audits: reads an equation's coefficients by probing its printed text with numbers,
// so nothing here depends on the generator's own parser.
const fnCache = new Map();
function difference(eq) {
  if (!fnCache.has(eq)) {
    const [l, r] = eq.split('=').map((s) => s.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/'));
    if (!/^[\dA-D\s+\-*/.]+$/.test(l + r)) throw new Error(`unexpected text: ${eq}`);
    const side = (s) => s.replace(/[A-D]/g, (v) => `v.${v}`);
    fnCache.set(eq, Function('v', `return (${side(l)}) - (${side(r)});`));
  }
  return fnCache.get(eq);
}
export const holds = (eq, vals) => Math.abs(difference(eq)(vals)) < 1e-9;
export const lettersOf = (eqs) => [...new Set(eqs.join(' ').match(/[A-D]/g))].sort();

const ZERO = { A: 0, B: 0, C: 0, D: 0 };
/** Coefficient of each letter: the equations are linear, so one probe per letter is enough. */
const row = (eq, vars) => vars.map((v) => difference(eq)({ ...ZERO, [v]: 1 }) - difference(eq)(ZERO));

function rank(rows) {
  const m = rows.map((r) => [...r]);
  let r = 0;
  for (let c = 0; m.length && c < m[0].length && r < m.length; c++) {
    let p = -1;
    for (let i = r; i < m.length; i++) if (Math.abs(m[i][c]) > 1e-9) { p = i; break; }
    if (p < 0) continue;
    [m[r], m[p]] = [m[p], m[r]];
    for (let i = 0; i < m.length; i++) if (i !== r) {
      const f = m[i][c] / m[r][c];
      for (let j = 0; j < m[i].length; j++) m[i][j] -= f * m[r][j];
    }
    r++;
  }
  return r;
}

/** Equations that could be left out with every letter still fixed. Every letter is asked, so there should be none. */
export function spareEquations(eqs) {
  const vars = lettersOf(eqs);
  return eqs.filter((_, skip) => rank(eqs.filter((_, i) => i !== skip).map((e) => row(e, vars))) === vars.length);
}
