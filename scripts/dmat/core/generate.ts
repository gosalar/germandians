import { type Band, type BandRanges, BANDS, makeRng, shuffle, within } from './rng.ts';
import { type LatinItem, type Letter, LETTERS, generateLatin, latinSignature, analyseLatin, LATIN_RANGES } from './latin.ts';
import { type EquationItem, generateEquation, analyseEquations } from './equations.ts';
import { type FigureItem, type FState, type Figure, type MistakeKind, generateFigures, simulate, isUnambiguous, coloursAllShown, SHAPE_PERIOD } from './figures.ts';

export function generateCore(seed: number, perBand: number) {
  const rng = makeRng(seed);

  const latin: LatinItem[] = [];
  const equations: EquationItem[] = [];
  const figures: FigureItem[] = [];
  const seenLatin = new Set<string>();
  const seenEq = new Set<string>();
  const seenFig = new Set<string>();

  const mistakeUsage = new Map<MistakeKind, number>();

  /** Every fourth item in a band comes from its stretch range. */
  const stretchNext = <T extends { band: Band }>(xs: T[], band: Band) => xs.filter((x) => x.band === band).length % 4 === 3;

  for (const band of BANDS) {
    for (let i = 0; latin.filter((x) => x.band === band).length < perBand && i < perBand * 20; i++) {
      // Ask for the answer letter used least so far, so every letter is the answer equally often.
      const used = (L: Letter) => latin.filter((x) => x.answer === L).length;
      const wanted = shuffle(rng, LETTERS).sort((a, b) => used(a) - used(b))[0];
      const item = generateLatin(rng, band, `L-${band[0]}${latin.length + 1}`, stretchNext(latin, band), wanted);
      if (!item) continue;
      const sig = latinSignature(item.givens, item.target);
      if (seenLatin.has(sig)) continue;
      seenLatin.add(sig);
      latin.push(item);
    }
    // Equations: also avoid repeating the same structure more than twice in a band.
    const structures = new Map<string, number>();
    for (let i = 0; equations.filter((x) => x.band === band).length < perBand && i < perBand * 50; i++) {
      const item = generateEquation(rng, band, `E-${band[0]}${equations.length + 1}`, stretchNext(equations, band));
      if (!item) continue;
      const sig = [...item.equations].sort().join(' | ');
      if (seenEq.has(sig) || (structures.get(item.structure) ?? 0) >= 2) continue;
      seenEq.add(sig);
      structures.set(item.structure, (structures.get(item.structure) ?? 0) + 1);
      equations.push(item);
    }
    const figStructures = new Map<string, number>();
    for (let i = 0; figures.filter((x) => x.band === band).length < perBand && i < perBand * 50; i++) {
      const item = generateFigures(rng, band, `F-${band[0]}${figures.length + 1}`, stretchNext(figures, band), mistakeUsage);
      if (!item) continue;
      const sig = JSON.stringify(item.shown.map((f) => f.map((s) => [s.pos, s.orient, s.colour])));
      if (seenFig.has(sig) || (figStructures.get(item.structure) ?? 0) >= 2) {
        for (const o of [...item.options5, ...item.options6]) if (o.misconception) mistakeUsage.set(o.misconception.kind, mistakeUsage.get(o.misconception.kind)! - 1);
        continue;
      }
      seenFig.add(sig);
      figStructures.set(item.structure, (figStructures.get(item.structure) ?? 0) + 1);
      figures.push(item);
    }
  }
  // Put the right option in each position equally often, so position is never a clue.
  const slots = (n: number) => { const s: number[] = []; while (s.length < n) s.push(...[0, 1, 2]); return s; };
  const slots5 = shuffle(rng, slots(figures.length));
  const slots6 = shuffle(rng, slots(figures.length));
  figures.forEach((item, k) => {
    for (const [opts, which, slot] of [[item.options5, 0, slots5[k]], [item.options6, 1, slots6[k]]] as const) {
      const from = item.answer[which];
      [opts[from], opts[slot]] = [opts[slot], opts[from]];
      item.answer[which] = slot;
    }
  });

  return { seed, perBand, latin, equations, figures };
}

export type GeneratedCore = ReturnType<typeof generateCore>;

export function checkCore({ seed, perBand, latin, equations, figures }: GeneratedCore): number {
  type Check = { name: string; ok: boolean; detail: string };
  const checks: Check[] = [];
  const add = (name: string, failures: string[], total: number) =>
    checks.push({ name, ok: failures.length === 0, detail: failures.length ? `${failures.length} of ${total} failed: ${failures.slice(0, 5).join(', ')}` : `${total} of ${total}` });

  add('Latin: every bank item has the requested count', BANDS.filter((b) => latin.filter((x) => x.band === b).length !== perBand), 3);
  add('Latin: re-solved answer matches the key', latin.filter((x) => analyseLatin(x.givens, x.target).answer !== x.answer).map((x) => x.id), latin.length);
  add('Latin: givens obey the row and column rule', latin.filter((x) => {
    for (let i = 0; i < 5; i++) {
      const row = x.givens[i].filter(Boolean);
      const col = x.givens.map((r) => r[i]).filter(Boolean);
      if (new Set(row).size !== row.length || new Set(col).size !== col.length) return true;
    }
    return false;
  }).map((x) => x.id), latin.length);

  const inBand = (ranges: BandRanges, x: { band: Band; tags: string[] }, value: number) =>
    within(value, (x.tags.includes('stretch') ? ranges.stretch : ranges.core)[x.band]);
  add('Latin: the worked solution is the shortest route and fits the band', latin.filter((x) => {
    const a = analyseLatin(x.givens, x.target);
    return a.aux !== x.analysis.aux || x.analysis.steps.length !== a.aux + 1 || !inBand(LATIN_RANGES, x, a.aux);
  }).map((x) => x.id), latin.length);

  add('Equations: every bank item has the requested count', BANDS.filter((b) => equations.filter((x) => x.band === b).length !== perBand), 3);
  add('Equations: no step of a worked solution has a fraction or decimal', equations.filter((x) => x.analysis.fractional || /\d\.\d/.test(x.steps.join(' '))).map((x) => x.id), equations.length);
  add('Equations: the worked solution uses every equation shown', equations.filter((x) =>
    new Set(x.analysis.plan.flatMap((s) => s.equations)).size !== x.equations.length || x.steps.length !== x.analysis.plan.length).map((x) => x.id), equations.length);
  add('Equations: no two equations share a left side', equations.filter((x) => new Set(x.equations.map((e) => e.split('=')[0].trim())).size !== x.equations.length).map((x) => x.id), equations.length);
  add('Equations: exactly one solution in 1–20 (brute force)', equations.filter((x) => {
    const a = analyseEquations(x.equations);
    return !a.unique || Object.keys(a.solution!).length !== Object.keys(x.solution).length
      || Object.entries(x.solution).some(([k, v]) => a.solution![k] !== v || v < 1 || v > 20);
  }).map((x) => x.id), equations.length);
  add('Equations: worked solution reaches every letter', equations.filter((x) => x.analysis.plan.length !== Object.keys(x.solution).length).map((x) => x.id), equations.length);

  add('Figures: every bank item has the requested count', BANDS.filter((b) => figures.filter((x) => x.band === b).length !== perBand), 3);
  const vis = (f: Figure, s: FState) => `${s.pos}|${s.orient % SHAPE_PERIOD[f.shape]}|${s.colour}`;
  add('Figures: re-simulated answer matches the key', figures.filter((x) => {
    const runs = x.figures.map((f) => simulate(f)!);
    const key = (frame: FState[]) => frame.map((s, i) => vis(x.figures[i], s)).join(';');
    return key(x.options5[x.answer[0]].frame) !== key(runs.map((r) => r[4])) || key(x.options6[x.answer[1]].frame) !== key(runs.map((r) => r[5]));
  }).map((x) => x.id), figures.length);
  add('Figures: only one reading of the four matrices', figures.filter((x) => !isUnambiguous(x.figures, x.figures.map((f) => simulate(f)!))).map((x) => x.id), figures.length);
  add('Figures: every colour in a rule appears in the four matrices shown', figures.filter((x) => !coloursAllShown(x.figures, x.figures.map((f) => simulate(f)!))).map((x) => x.id), figures.length);
  add('Figures: three different options per matrix, no overlapping figures', figures.filter((x) => [x.options5, x.options6].some((opts) => {
    const keys = opts.map((o) => o.frame.map((s, i) => vis(x.figures[i], s)).join(';'));
    const overlap = opts.some((o) => new Set(o.frame.map((s) => `${s.pos}`)).size !== o.frame.length);
    return new Set(keys).size !== 3 || overlap;
  })).map((x) => x.id), figures.length);

  const failed = checks.filter((check) => !check.ok);
  if (failed.length) {
    throw new Error([`Core seed ${seed} failed:`, ...failed.map(({ name, detail }) => `${name} (${detail})`)].join('\n'));
  }
  return checks.length;
}
