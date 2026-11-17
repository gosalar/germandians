/**
 * Mathematical Equations: a small system of equations, every letter a whole number from 1 to 20,
 * exactly one solution. Difficulty follows what a person has to do without notes: how many
 * letters there are, how many expressions must be substituted at once, and whether a minus sign
 * has to be carried into a bracket.
 */
import { type Band, type BandRanges, type Rng, int, pick, shuffle, chance, within } from './rng.ts';

/** Score. Official samples: low 0, 1.5 · medium 2.5, 3 · high 7, 6. */
export const EQUATION_RANGES: BandRanges = {
  core: { low: [0, 2], medium: [2, 4], high: [5, 7.5] },
  stretch: { low: [2, 3], medium: [4, 5.5], high: [7.5, 9] },
};

export type Var = 'A' | 'B' | 'C' | 'D';
const ALL_VARS: readonly Var[] = ['A', 'B', 'C', 'D'];

/** Σ a[v]·v = b */
export interface Linear {
  a: Map<Var, number>;
  b: number;
  /** Each letter's sign on its own side as written: a minus in front means a bracket when substituted. */
  written: Map<Var, number>;
}

export interface PlanStep {
  kind: 'direct' | 'substitute';
  solves: Var;
  value: number;
  substituted: number;
  bracket: boolean;
  /** A coefficient that is not a whole number is left to handle. */
  fractional: boolean;
  /** Letters that must already be known, and the equations (by position) this step reads. */
  needs: Var[];
  equations: number[];
  text: string;
}

export interface EquationAnalysis {
  unique: boolean;
  solution: Record<string, number> | null;
  solvableByHand: boolean;
  plan: PlanStep[];
  unknowns: number;
  substitutions: number;
  bracket: boolean;
  division: boolean;
  /** The worked solution has a step with a coefficient that is not a whole number. */
  fractional: boolean;
  /** Largest number met while working it out in your head. */
  largest: number;
  score: number;
}

export interface EquationItem {
  id: string;
  type: 'equations';
  band: Band;
  equations: string[];
  /** The key: the real test has an input box for every letter, so every letter is asked. */
  solution: Record<string, number>;
  /** The worked solution, one step per letter. */
  steps: string[];
  analysis: EquationAnalysis;
  structure: string;
  tags: string[];
}

// ---------- parsing ----------

const EPS = 1e-9;

export function parseEquation(text: string): Linear {
  const [left, right] = text.split('=');
  if (right === undefined) throw new Error(`No "=" in ${text}`);
  const l = parseSide(left);
  const r = parseSide(right);
  const a = new Map<Var, number>();
  for (const [v, k] of l.a) a.set(v, (a.get(v) ?? 0) + k);
  for (const [v, k] of r.a) a.set(v, (a.get(v) ?? 0) - k);
  for (const [v, k] of [...a]) if (Math.abs(k) < EPS) a.delete(v);
  const written = new Map<Var, number>([...r.a, ...l.a]);
  return { a, b: r.k - l.k, written };
}

function parseSide(src: string): { a: Map<Var, number>; k: number } {
  const s = src.replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/\s+/g, '');
  const a = new Map<Var, number>();
  let k = 0;
  const terms = s.match(/[+-]?[^+-]+/g) ?? [];
  for (const raw of terms) {
    const sign = raw.startsWith('-') ? -1 : 1;
    const body = raw.replace(/^[+-]/, '');
    let coef = 1;
    let v: Var | null = null;
    // factors joined by * and /
    const parts = body.split(/(?=[*/])/);
    for (const part of parts) {
      const op = part[0] === '*' || part[0] === '/' ? part[0] : '*';
      const tok = part.replace(/^[*/]/, '');
      if (/^[A-D]$/.test(tok)) {
        if (op === '/') throw new Error(`Cannot divide by a letter: ${src}`);
        v = tok as Var;
      } else {
        const n = Number(tok);
        if (!Number.isFinite(n)) throw new Error(`Bad token ${tok} in ${src}`);
        coef = op === '*' ? coef * n : coef / n;
      }
    }
    if (v) a.set(v, (a.get(v) ?? 0) + sign * coef);
    else k += sign * coef;
  }
  return { a, k };
}

// ---------- analysis ----------

const fmtNum = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(2).replace(/\.?0+$/, ''));
const mul = (k: number, v: string) => (k === 1 ? v : k === -1 ? `−${v}` : `${fmtNum(k)}${v}`);

function fmtExpr(alpha: number, p: Var, beta: number): string {
  if (alpha < 0 && beta > 0) {
    const a = -alpha;
    const term = a === 1 ? p : Number.isInteger(a) ? `${a} × ${p}` : `${p} ÷ ${fmtNum(1 / a)}`;
    return `${fmtNum(beta)} − ${term}`;
  }
  let s: string;
  if (alpha === 1) s = p;
  else if (Number.isInteger(alpha)) s = `${alpha} × ${p}`;
  else if (Number.isInteger(1 / alpha)) s = `${p} ÷ ${1 / alpha}`;
  else s = `${fmtNum(alpha)} × ${p}`;
  if (beta > 0) s += ` + ${fmtNum(beta)}`;
  if (beta < 0) s += ` − ${fmtNum(-beta)}`;
  return s;
}

function bruteForce(eqs: Linear[], vars: Var[]): Record<string, number>[] {
  const out: Record<string, number>[] = [];
  const vals: Record<string, number> = {};
  const rec = (i: number) => {
    if (out.length > 1) return;
    if (i === vars.length) {
      if (eqs.every((e) => Math.abs([...e.a].reduce((s, [v, k]) => s + k * vals[v], 0) - e.b) < EPS)) out.push({ ...vals });
      return;
    }
    for (let x = 1; x <= 20; x++) {
      vals[vars[i]] = x;
      rec(i + 1);
    }
  };
  rec(0);
  return out;
}

const whole = (x: number) => Math.abs(x - Math.round(x)) < EPS;
/** True when the equation is already written as "… = v" or "v = …". */
const isolatedFor = (text: string, v: Var) => text.split('=').some((side) => side.trim() === v);
const list = (xs: string[]) => (xs.length < 3 ? xs.join(' and ') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

export function analyseEquations(texts: string[]): EquationAnalysis {
  const eqs = texts.map(parseEquation);
  const vars = ALL_VARS.filter((v) => eqs.some((e) => e.a.has(v)));
  const sols = bruteForce(eqs, vars);
  const unique = sols.length === 1;
  const known = new Map<Var, number>();
  const plan: PlanStep[] = [];
  let largest = 0;
  const note = (...xs: number[]) => { for (const x of xs) largest = Math.max(largest, Math.abs(x)); };

  const unknownIn = (e: Linear) => [...e.a.keys()].filter((v) => !known.has(v));
  const knownPart = (e: Linear) => [...e.a].filter(([v]) => known.has(v)).reduce((s, [v, k]) => s + k * known.get(v)!, 0);

  while (known.size < vars.length) {
    // 1. An equation with a single unknown left: the shortest one, and one where the unknown
    //    is not multiplied, as a person would pick.
    const directIdx = eqs
      .map((e, i) => {
        const u = unknownIn(e);
        const one = u.length === 1;
        return {
          i, ok: one, size: e.a.size,
          scaled: one && Math.abs(e.a.get(u[0])!) > 1 ? 1 : 0,
          rearrange: one && !isolatedFor(texts[i], u[0]) ? 1 : 0,
        };
      })
      .filter((x) => x.ok)
      .sort((x, y) => x.size - y.size || x.scaled - y.scaled || x.rearrange - y.rearrange)[0]?.i ?? -1;
    if (directIdx >= 0) {
      const e = eqs[directIdx];
      const [v] = unknownIn(e);
      const value = (e.b - knownPart(e)) / e.a.get(v)!;
      const usedKnown = [...e.a.keys()].filter((x) => known.has(x));
      known.set(v, value);
      note(value, e.b);
      plan.push({
        kind: 'direct', solves: v, value, substituted: 0, bracket: false, fractional: false,
        needs: usedKnown, equations: [directIdx],
        text: usedKnown.length
          ? `Put ${list(usedKnown.map((x) => `${x} = ${fmtNum(known.get(x)!)}`))} into ${texts[directIdx]}: ${v} = ${fmtNum(value)}.`
          : `${texts[directIdx]} has only one letter: ${v} = ${fmtNum(value)}.`,
      });
      continue;
    }
    // 2. Substitute two-letter equations ("definitions") into another equation.
    type Sub = { o: Var; di: number; alpha: number; beta: number; via?: string };
    type Cand = { cost: number; step: PlanStep };
    let best: Cand | null = null;
    eqs.forEach((E, ei) => {
      const U = unknownIn(E);
      if (U.length < 2) return;
      for (const p of U) {
        const defs: Sub[] = [];
        for (const o of U.filter((x) => x !== p)) {
          const options = eqs.map((_, j) => j).filter((j) => j !== ei && unknownIn(eqs[j]).length === 2 && eqs[j].a.has(o) && eqs[j].a.has(p));
          if (options.length === 0) break;
          // Use the line already written as "… = o" when there is one.
          const di = options.find((j) => isolatedFor(texts[j], o)) ?? options[0];
          const D = eqs[di];
          // a_o·o + a_p·p = b − known  →  o = alpha·p + beta
          defs.push({ o, di, alpha: -D.a.get(p)! / D.a.get(o)!, beta: (D.b - knownPart(D)) / D.a.get(o)! });
        }
        if (defs.length !== U.length - 1) continue;
        let ap = E.a.get(p)!;
        let rhs = E.b - knownPart(E);
        for (const d of defs) {
          ap += E.a.get(d.o)! * d.alpha;
          rhs -= E.a.get(d.o)! * d.beta;
        }
        if (Math.abs(ap) < EPS) continue;

        // A division would leave fractions to juggle. Work in the quotient letter instead:
        // if q = p ÷ k, write p = k × q and express the other letters through q.
        let pivot: Var = p;
        let subs: Sub[] = defs;
        let repivoted = false;
        if (defs.some((d) => !whole(d.alpha)) || !whole(ap)) {
          const q = defs.find((d) => Math.abs(d.beta) < EPS && d.alpha > 0 && d.alpha < 1 && whole(1 / d.alpha));
          if (q) {
            const k = Math.round(1 / q.alpha);
            const via = `${p} = ${k} × ${q.o}`;
            const moved: Sub[] = [
              { o: p, di: q.di, alpha: k, beta: 0 },
              ...defs.filter((d) => d !== q).map((d) => ({ ...d, alpha: d.alpha * k, via })),
            ];
            if (moved.every((d) => whole(d.alpha)) && whole(ap * k)) {
              pivot = q.o;
              subs = moved;
              ap *= k;
              repivoted = true;
            }
          }
        }

        let bracket = false;
        for (const d of subs) {
          const coef = E.a.get(d.o)!;
          if ((E.written.get(d.o) ?? 1) < 0 && Math.abs(d.beta) > EPS) bracket = true;
          note(coef * d.alpha, coef * d.beta);
        }
        if (ap < 0) { ap = -ap; rhs = -rhs; }
        const value = rhs / ap;
        note(ap, rhs, value);
        const fractional = subs.some((d) => !whole(d.alpha)) || !whole(ap);
        // Rearranging an equation first is more work than a bracket, unless it only undoes a
        // division ("A ÷ 3 = D" read as "A = 3 × D").
        const rewriting = subs
          .filter((d) => !isolatedFor(texts[d.di], d.o))
          .reduce((s, d) => s + (texts[d.di].includes('÷') ? 0.25 : 1.25), 0);
        // The route a person would pick: fewest substitutions, no bracket, no fractions, no rearranging.
        const cost = subs.length + (bracket ? 1 : 0) + (fractional ? 0.5 : 0) + rewriting + (repivoted ? 0.1 : 0);
        if (best && best.cost <= cost) continue;

        const rewrites = subs.map((d) => `${d.o} = ${fmtExpr(d.alpha, pivot, d.beta)} (from ${texts[d.di]}${d.via ? `, with ${d.via}` : ''})`);
        // Show the equation with the expressions put in, so the learner can follow the signs.
        const put = new Map<string, string>();
        for (const d of subs) {
          const expr = fmtExpr(d.alpha, pivot, d.beta);
          put.set(d.o, /^[A-D]$/.test(expr) || /^\d+ × [A-D]$/.test(expr) ? expr : `(${expr})`);
        }
        for (const [v, x] of known) put.set(v, fmtNum(x));
        const substitutedText = texts[ei]
          .replace(/[A-D]/g, (ch) => put.get(ch) ?? ch)
          .split('=')
          .map((side) => side.trim().replace(/^\(([^()]*)\)$/, '$1'))
          .join(' = ');
        let ending: string;
        if (fractional) {
          const m = [2, 3, 4, 5, 6, 8, 9, 10, 12].find((x) => whole(ap * x) && whole(rhs * x)) ?? 1;
          ending = `Collect the ${pivot} terms and multiply both sides by ${m} to clear the division: ${mul(Math.round(ap * m), pivot)} = ${fmtNum(rhs * m)}, so ${pivot} = ${fmtNum(value)}.`;
        } else {
          const a = Math.round(ap);
          ending = `This simplifies to ${a === 1 ? `${pivot} = ${fmtNum(value)}` : `${mul(a, pivot)} = ${fmtNum(rhs)}, so ${pivot} = ${fmtNum(value)}`}.`;
        }
        const involved = [E, ...subs.map((d) => eqs[d.di])];
        best = {
          cost,
          step: {
            kind: 'substitute', solves: pivot, value, substituted: subs.length, bracket, fractional,
            needs: [...new Set(involved.flatMap((x) => [...x.a.keys()]).filter((v) => known.has(v)))],
            equations: [...new Set([ei, ...subs.map((d) => d.di)])],
            text: `Write ${list(rewrites)}. Put ${subs.length > 1 ? 'these' : 'this'} into ${texts[ei]}: ${substitutedText}.${bracket ? ' The minus sign applies to the whole bracket.' : ''} ${ending}`,
          },
        };
      }
    });
    if (!best) break;
    const chosen: Cand = best;
    known.set(chosen.step.solves, chosen.step.value);
    plan.push(chosen.step);
  }

  const solvableByHand = known.size === vars.length && [...known.values()].every((x) => Number.isInteger(x));
  const substitutions = plan.reduce((s, p) => s + p.substituted, 0);
  const bracket = plan.some((p) => p.bracket);
  const division = texts.some((t) => t.includes('÷'));
  const score = (vars.length - 2) * 1.5 + substitutions + (bracket ? 1 : 0) + (division ? 0.5 : 0);
  return {
    unique, solution: unique ? sols[0] : null, solvableByHand, plan,
    unknowns: vars.length, substitutions, bracket, division, fractional: plan.some((p) => p.fractional), largest, score,
  };
}

/** Calibrated against the six official exercises (see calibrate.ts). */
export function equationBand(score: number): Band {
  if (score < 2) return 'low';
  if (score < 5) return 'medium';
  return 'high';
}

// ---------- generation ----------

type Def = { text: (u: Var, p: Var) => string; value: (p: number) => number | null; form: string };

/** u is defined from p. Written with the expression on the left, as in the official material. */
function randomDef(rng: Rng): Def {
  const forms: (() => Def)[] = [
    () => { const k = int(rng, 2, 5); return { form: 'mul', text: (u, p) => `${k} × ${p} = ${u}`, value: (p) => k * p }; },
    () => { const k = int(rng, 2, 4); return { form: 'div', text: (u, p) => `${p} ÷ ${k} = ${u}`, value: (p) => (p % k === 0 ? p / k : null) }; },
    () => { const k = int(rng, 1, 12); const front = chance(rng, 0.5); return { form: 'add', text: (u, p) => (front ? `${k} + ${p} = ${u}` : `${p} + ${k} = ${u}`), value: (p) => p + k }; },
    () => { const k = int(rng, 1, 9); return { form: 'sub', text: (u, p) => `${p} − ${k} = ${u}`, value: (p) => p - k }; },
    () => { const k = int(rng, 8, 21); return { form: 'rsub', text: (u, p) => `${k} − ${p} = ${u}`, value: (p) => k - p }; },
    () => {
      const k = int(rng, 2, 4); const m = int(rng, 1, 6); const plus = chance(rng, 0.5);
      return { form: 'mulAdd', text: (u, p) => `${k} × ${p} ${plus ? '+' : '−'} ${m} = ${u}`, value: (p) => k * p + (plus ? m : -m) };
    },
  ];
  return pick(rng, forms)();
}

/** Σ c·v = constant, first term positive, terms in random order. */
function combine(rng: Rng, vars: Var[], vals: Record<string, number>, signs: number[]): string | null {
  const order = shuffle(rng, vars.map((v, i) => ({ v, c: signs[i] })));
  const firstPos = order.findIndex((t) => t.c > 0);
  if (firstPos < 0) return null;
  const [first] = order.splice(firstPos, 1);
  order.unshift(first);
  const total = order.reduce((s, t) => s + t.c * vals[t.v], 0);
  if (total < 1 || total > 60) return null;
  // A sum of two letters is sometimes written as "total − x = y", as the official material does.
  if (order.length === 2 && order.every((t) => t.c === 1) && total <= 21 && chance(rng, 0.35)) return `${total} − ${order[0].v} = ${order[1].v}`;
  const term = (t: { v: Var; c: number }) => (Math.abs(t.c) === 1 ? t.v : `${Math.abs(t.c)} × ${t.v}`);
  let s = term(order[0]);
  for (const t of order.slice(1)) s += ` ${t.c > 0 ? '+' : '−'} ${term(t)}`;
  return `${s} = ${total}`;
}

function direct(rng: Rng, v: Var, x: number): { text: string; form: string } | null {
  const forms = [
    () => { const k = int(rng, 1, 12); return { form: 'd-add', text: `${k} + ${v} = ${k + x}` }; },
    () => { const k = int(rng, 1, Math.max(1, x - 1)); return x > 1 ? { form: 'd-sub', text: `${v} − ${k} = ${x - k}` } : null; },
    () => { const k = int(rng, 2, 5); return { form: 'd-mul', text: `${k} × ${v} = ${k * x}` }; },
    () => { const k = int(rng, 2, 4); return x % k === 0 ? { form: 'd-div', text: `${v} ÷ ${k} = ${x / k}` } : null; },
  ];
  return pick(rng, forms)();
}

type Template = (rng: Rng, vars: Var[]) => { equations: string[]; forms: string[] } | null;

const inRange = (x: number | null): x is number => x !== null && Number.isInteger(x) && x >= 1 && x <= 20;

/** Pick a value for p and define every other letter from p. */
function defsFrom(rng: Rng, p: Var, others: Var[]) {
  for (let t = 0; t < 50; t++) {
    const vals: Record<string, number> = { [p]: int(rng, 1, 12) };
    const defs: { u: Var; def: Def }[] = [];
    let ok = true;
    for (const u of others) {
      const def = randomDef(rng);
      const val = def.value(vals[p]);
      if (!inRange(val) || Object.values(vals).includes(val)) { ok = false; break; }
      vals[u] = val;
      defs.push({ u, def });
    }
    if (ok) return { vals, defs };
  }
  return null;
}

const SIGNS = [1, 1, 1, -1, -1, 2, -2];

const TEMPLATES: Record<string, Template> = {
  // One letter given directly, the other defined from it.
  directThenDef: (rng, [x, y]) => {
    const r = defsFrom(rng, x, [y]);
    if (!r) return null;
    const d = direct(rng, x, r.vals[x]);
    if (!d) return null;
    return { equations: [d.text, r.defs[0].def.text(y, x)], forms: [d.form, r.defs[0].def.form] };
  },
  // One definition and one equation that combines both letters.
  defPlusCombine: (rng, [x, y]) => {
    const r = defsFrom(rng, x, [y]);
    if (!r) return null;
    const c = combine(rng, [x, y], r.vals, [1, pick(rng, [1, -1])]);
    if (!c) return null;
    return { equations: [r.defs[0].def.text(y, x), c], forms: [r.defs[0].def.form, 'combine2'] };
  },
  // Two definitions from one letter, one combining equation.
  twoDefsCombine: (rng, [x, y, z]) => {
    const r = defsFrom(rng, x, [y, z]);
    if (!r) return null;
    const pairWith = pick(rng, [y, z]);
    const c = combine(rng, [x, pairWith], r.vals, [pick(rng, [1, 2]), pick(rng, [1, -1])]);
    if (!c) return null;
    return { equations: [r.defs[0].def.text(y, x), r.defs[1].def.text(z, x), c], forms: [r.defs[0].def.form, r.defs[1].def.form, 'combine2'] };
  },
  // Two definitions put into one three-letter equation at once.
  twoDefsCombineThree: (rng, [x, y, z]) => {
    const r = defsFrom(rng, x, [y, z]);
    if (!r) return null;
    const c = combine(rng, [x, y, z], r.vals, [1, ...shuffle(rng, [1, -1])]);
    if (!c) return null;
    return { equations: [r.defs[0].def.text(y, x), r.defs[1].def.text(z, x), c], forms: [r.defs[0].def.form, r.defs[1].def.form, 'combine3'] };
  },
  // A definition, a combining equation, and a third letter built from the first two.
  defCombineBuild: (rng, [x, y, z]) => {
    const r = defsFrom(rng, x, [y]);
    if (!r) return null;
    const c = combine(rng, [x, y], r.vals, [1, pick(rng, [1, -1])]);
    const k1 = int(rng, 1, 3);
    const k2 = int(rng, 1, 3);
    const zv = k1 * r.vals[x] + k2 * r.vals[y];
    if (!c || zv > 20) return null;
    const t = (k: number, v: Var) => (k === 1 ? v : `${k} × ${v}`);
    return { equations: [r.defs[0].def.text(y, x), c, `${t(k1, x)} + ${t(k2, y)} = ${z}`], forms: [r.defs[0].def.form, 'combine2', 'build'] };
  },
  // Three definitions from one letter, one equation that combines all four.
  threeDefsCombineAll: (rng, [w, x, y, z]) => {
    const r = defsFrom(rng, w, [x, y, z]);
    if (!r) return null;
    const signs = [1, ...shuffle(rng, [1, -1, pick(rng, SIGNS)])];
    if (!signs.slice(1).some((s) => s < 0)) return null;
    const c = combine(rng, [w, x, y, z], r.vals, signs);
    if (!c) return null;
    return {
      equations: [r.defs[0].def.text(x, w), r.defs[1].def.text(y, w), r.defs[2].def.text(z, w), c],
      forms: [...r.defs.map((d) => d.def.form), 'combine4'],
    };
  },
  // Two definitions into a three-letter equation; the fourth letter defined afterwards.
  twoDefsCombineThreeThenDef: (rng, [w, x, y, z]) => {
    const r = defsFrom(rng, w, [x, y, z]);
    if (!r) return null;
    const c = combine(rng, [w, x, y], r.vals, [1, ...shuffle(rng, [1, -1])]);
    if (!c) return null;
    return {
      equations: [r.defs[0].def.text(x, w), r.defs[1].def.text(y, w), r.defs[2].def.text(z, w), c],
      forms: [...r.defs.map((d) => d.def.form), 'combine3'],
    };
  },
};

const TEMPLATES_BY_SIZE: Record<number, string[]> = {
  2: ['directThenDef', 'defPlusCombine'],
  3: ['twoDefsCombine', 'defCombineBuild', 'twoDefsCombineThree'],
  4: ['threeDefsCombineAll', 'twoDefsCombineThreeThenDef'],
};

const SIZES: Record<Band, number[]> = { low: [2, 2, 2, 3], medium: [3, 3, 2], high: [4] };
const STRETCH_SIZES: Record<Band, number[]> = { low: [2, 3], medium: [3], high: [4] };

export function generateEquation(rng: Rng, band: Band, id: string, stretch = false, maxTries = 20000): EquationItem | null {
  const range = (stretch ? EQUATION_RANGES.stretch : EQUATION_RANGES.core)[band];
  for (let t = 0; t < maxTries; t++) {
    const n = pick(rng, (stretch ? STRETCH_SIZES : SIZES)[band]);
    const vars = shuffle(rng, ALL_VARS.slice(0, n));
    const name = pick(rng, TEMPLATES_BY_SIZE[n]);
    const built = TEMPLATES[name](rng, vars);
    if (!built) continue;
    const equations = shuffle(rng, built.equations);
    const analysis = analyseEquations(equations);
    if (!analysis.unique || !analysis.solvableByHand || analysis.fractional) continue;
    if (!within(analysis.score, range)) continue;
    if (analysis.largest > (stretch ? 120 : 80)) continue;
    // Two equations with the same left side give a letter away without any working.
    if (new Set(equations.map((e) => e.split('=')[0].trim())).size !== equations.length) continue;
    // Every equation has to matter: the test taker types a value for every letter.
    if (new Set(analysis.plan.flatMap((s) => s.equations)).size !== equations.length) continue;
    return {
      id, type: 'equations', band, equations, solution: analysis.solution!,
      steps: analysis.plan.map((s) => s.text), analysis,
      structure: `${name}:${[...built.forms].sort().join(',')}`,
      tags: [
        `${n}-letters`,
        analysis.substitutions === 0 ? 'step-by-step' : analysis.substitutions === 1 ? 'one-substitution' : 'multi-substitution',
        ...(analysis.bracket ? ['minus-before-bracket'] : []),
        ...(analysis.division ? ['division'] : []),
        ...(stretch ? ['stretch'] : []),
      ],
    };
  }
  return null;
}
