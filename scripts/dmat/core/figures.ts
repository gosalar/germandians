/**
 * Figure Sequences: four 4×4 matrices; each figure follows its own rule (movement, rotation,
 * colour), and the test taker picks matrix 5 and matrix 6 from three options each.
 *
 * Rules follow the official description: figures move horizontally, vertically or diagonally
 * and bounce off the edge (a diagonal mover goes back the way it came), or travel along the
 * outer edge; they may rotate and change colour; any change may grow by one each step (x + 1);
 * figures never leave the grid, disappear or overlap.
 *
 * Every generated item is checked against every rule a person could reasonably read from the
 * four matrices shown: if two such rules predict different answers, the item is rejected.
 */
import { type Band, type BandRanges, type Rng, int, pick, shuffle, chance, within } from './rng.ts';

/** Score. Official samples: low 1, 1.5 · medium 6, 6.5 · high 12.5, 12. */
export const FIGURE_RANGES: BandRanges = {
  core: { low: [0, 3.5], medium: [3.5, 9], high: [9, 14] },
  stretch: { low: [3.5, 4.5], medium: [9, 10.5], high: [14, 18] },
};

export type Dir = readonly [number, number];
export type Cell = readonly [number, number];

export type Movement =
  | { kind: 'static' }
  | { kind: 'line'; dir: Dir; step: number }
  | { kind: 'border'; cw: boolean; step: number; growth: boolean }
  | { kind: 'loop'; dirs: Dir[] };

export interface Rotation { q: number; growth: boolean }
export interface Colouring { cycle: string[]; growth: boolean }

export type ShapeName = 'square' | 'circle' | 'diamond' | 'hexagon' | 'triangle' | 'arrow' | 'angle' | 'halfCircle' | 'trapezoid' | 'flag';

/** How many quarter turns before a shape looks the same again. */
export const SHAPE_PERIOD: Record<ShapeName, number> = {
  square: 1, circle: 1, diamond: 1, hexagon: 2,
  triangle: 4, arrow: 4, angle: 4, halfCircle: 4, trapezoid: 4, flag: 4,
};
export const SHAPE_LABEL: Record<ShapeName, string> = {
  square: 'square', circle: 'circle', diamond: 'diamond', hexagon: 'hexagon', triangle: 'triangle',
  arrow: 'arrow', angle: 'corner', halfCircle: 'half-circle', trapezoid: 'trapezium', flag: 'flag',
};

export interface Figure {
  shape: ShapeName;
  start: Cell;
  orient: number;
  movement: Movement;
  rotation: Rotation;
  colour: Colouring;
}

export interface FState { pos: Cell; orient: number; colour: string }

export type Misconception =
  | 'lineReverse' | 'lineSkip' | 'lineSlide' | 'diagonalStraight'
  | 'borderReverse' | 'borderStepOff' | 'borderNoGrowth' | 'borderBounce'
  | 'loopRepeat' | 'loopReverse'
  | 'rotNone' | 'rotOpposite' | 'rotNoGrowth' | 'rotGrowthOff'
  | 'colourSame' | 'colourSkip' | 'colourBack';

/** A wrong option is the right answer with one of these mistakes, or two figures swapped. */
export type MistakeKind = Misconception | 'swap';

export const MISCONCEPTION_TEXT: Record<Misconception, string> = {
  lineReverse: 'turns back before it reaches the edge',
  lineSkip: 'moves one field too far',
  lineSlide: 'slides along the edge instead of bouncing back',
  diagonalStraight: 'switches to a straight line at the edge instead of going back the way it came',
  borderReverse: 'goes round the edge the wrong way',
  borderStepOff: 'moves one field too many along the edge',
  borderNoGrowth: 'keeps the same step instead of moving one field more each time',
  borderBounce: 'bounces back at the corner instead of going round it',
  loopRepeat: 'repeats its last move instead of continuing the pattern',
  loopReverse: 'goes back the way it came instead of continuing the pattern',
  rotNone: 'stops turning',
  rotOpposite: 'turns the wrong way',
  rotNoGrowth: 'turns by the same amount instead of one quarter turn more each time',
  rotGrowthOff: 'counts its turns from the wrong start: one quarter turn too many',
  colourSame: 'keeps its colour instead of changing',
  colourSkip: 'skips a colour in its cycle',
  colourBack: 'runs through its colours in the wrong order',
};

const CORNERS = new Set([0, 3, 6, 9]);

const G = 4;
const FRAMES = 6;
const inGrid = ([r, c]: Cell) => r >= 0 && r < G && c >= 0 && c < G;
const mod = (x: number, m: number) => ((x % m) + m) % m;

/** The 12 edge cells in clockwise order, starting top left. */
export const RING: Cell[] = [
  [0, 0], [0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [3, 0], [2, 0], [1, 0],
];
const ringIndex = ([r, c]: Cell) => RING.findIndex(([a, b]) => a === r && b === c);

export const ORTHOGONAL: Dir[] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
export const DIAGONAL: Dir[] = [[-1, 1], [-1, -1], [1, 1], [1, -1]];
const CW_LOOP: Dir[] = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // right, down, left, up
export const LOOPS: Dir[][] = [
  ...[0, 1, 2, 3].map((s) => [0, 1, 2, 3].map((i) => CW_LOOP[(s + i) % 4])),
  ...[0, 1, 2, 3].map((s) => [0, 1, 2, 3].map((i) => CW_LOOP[mod(s - i, 4)])),
];

/**
 * Run a figure for six matrices. A misconception changes its behaviour from matrix 5 on.
 * `bounces`, when given, collects the steps (1–5) at which the figure turned back at an edge.
 */
export function simulate(f: Figure, mis: Misconception | null = null, bounces?: number[]): FState[] | null {
  const out: FState[] = [];
  let pos: Cell = f.start;
  let dir: Dir | null = f.movement.kind === 'line' ? f.movement.dir : null;
  let ring = f.movement.kind === 'border' ? ringIndex(f.start) : -1;
  if (f.movement.kind === 'border' && ring < 0) return null;
  let orient = f.orient;
  let ci = 0;
  out.push({ pos, orient: mod(orient, 4), colour: f.colour.cycle[0] });
  for (let t = 1; t < FRAMES; t++) {
    const m = t >= 4 ? mis : null;
    const mv = f.movement;
    if (mv.kind === 'line' && dir) {
      if (m === 'lineReverse' && t === 4) dir = [-dir[0], -dir[1]];
      const steps = mv.step + (m === 'lineSkip' ? 1 : 0);
      for (let s = 0; s < steps; s++) {
        let next: Cell = [pos[0] + dir[0], pos[1] + dir[1]];
        if (!inGrid(next)) {
          const d: Dir = dir;
          const fits = (x: Dir) => inGrid([pos[0] + x[0], pos[1] + x[1]]);
          const diagonal = d[0] !== 0 && d[1] !== 0;
          let turned: Dir | undefined;
          if (m === 'diagonalStraight' && diagonal) turned = ([[d[0], 0], [0, d[1]]] as Dir[]).find(fits);
          if (m === 'lineSlide' && !diagonal) turned = ([[d[1], -d[0]], [-d[1], d[0]]] as Dir[]).find(fits);
          dir = turned ?? [-d[0], -d[1]];
          next = [pos[0] + dir[0], pos[1] + dir[1]];
          bounces?.push(t);
        }
        pos = next;
      }
    } else if (mv.kind === 'border') {
      let amount = mv.growth ? t : mv.step;
      if (m === 'borderNoGrowth') amount = 3;
      if (m === 'borderStepOff') amount += 1;
      let d = (m === 'borderReverse' ? !mv.cw : mv.cw) ? 1 : -1;
      for (let u = 0; u < amount; u++) {
        if (m === 'borderBounce' && CORNERS.has(ring)) d = -d;
        ring = mod(ring + d, RING.length);
      }
      pos = RING[ring];
    } else if (mv.kind === 'loop') {
      const len = mv.dirs.length;
      let d = mv.dirs[(t - 1) % len];
      if (m === 'loopRepeat') d = mv.dirs[2 % len];
      if (m === 'loopReverse') { const back = mv.dirs[mod(6 - t, len)]; d = [-back[0], -back[1]]; }
      pos = [pos[0] + d[0], pos[1] + d[1]];
      if (!inGrid(pos)) return null;
    }
    let turn = f.rotation.growth ? f.rotation.q * t : f.rotation.q;
    if (m === 'rotNone') turn = 0;
    if (m === 'rotOpposite') turn = -turn;
    if (m === 'rotNoGrowth') turn = f.rotation.q * 3;
    if (m === 'rotGrowthOff') turn = f.rotation.q * (t + 1);
    orient += turn;
    const len = f.colour.cycle.length;
    if (len > 1) {
      let adv = f.colour.growth ? t : 1;
      if (m === 'colourSame') adv = 0;
      if (m === 'colourSkip') adv += 1;
      if (m === 'colourBack') adv = -adv;
      ci = mod(ci + adv, len);
    }
    out.push({ pos, orient: mod(orient, 4), colour: f.colour.cycle[ci] });
  }
  return out;
}

const visible = (shape: ShapeName, s: FState) => `${s.pos[0]},${s.pos[1]}|${s.orient % SHAPE_PERIOD[shape]}|${s.colour}`;
const frameKey = (figs: Figure[], states: FState[]) => figs.map((f, i) => visible(f.shape, states[i])).join(';');
const overlaps = (states: FState[]) => new Set(states.map((s) => `${s.pos[0]},${s.pos[1]}`)).size !== states.length;

// ---------- ambiguity check ----------

function candidateMovements(start: Cell): Movement[] {
  const out: Movement[] = [{ kind: 'static' }];
  for (const dir of [...ORTHOGONAL, ...DIAGONAL]) for (const step of [1, 2]) out.push({ kind: 'line', dir, step });
  if (ringIndex(start) >= 0) {
    for (const cw of [true, false]) {
      for (const step of [1, 2, 3]) out.push({ kind: 'border', cw, step, growth: false });
      out.push({ kind: 'border', cw, step: 1, growth: true });
    }
  }
  for (const dirs of LOOPS) out.push({ kind: 'loop', dirs });
  return out;
}

/**
 * For one figure, every rule that reproduces the four matrices shown. Returns the distinct
 * answers those rules give for matrices 5 and 6: more than one means the item is ambiguous.
 */
export function readings(f: Figure, shown: FState[]): Set<string> {
  const period = SHAPE_PERIOD[f.shape];
  const positions = new Set<string>();
  for (const movement of candidateMovements(shown[0].pos)) {
    const s = simulate({ ...f, movement, rotation: { q: 0, growth: false }, colour: { cycle: [shown[0].colour], growth: false } });
    if (!s) continue;
    if (s.slice(0, 4).every((st, i) => st.pos[0] === shown[i].pos[0] && st.pos[1] === shown[i].pos[1])) {
      positions.add(`${s[4].pos}|${s[5].pos}`);
    }
  }
  const orients = new Set<string>();
  for (const q of [0, 1, -1, 2]) {
    for (const growth of q === 0 ? [false] : [false, true]) {
      const s = simulate({ ...f, movement: { kind: 'static' }, rotation: { q, growth }, colour: { cycle: ['x'], growth: false } })!;
      if (s.slice(0, 4).every((st, i) => st.orient % period === shown[i].orient % period)) {
        orients.add(`${s[4].orient % period}|${s[5].orient % period}`);
      }
    }
  }
  const seen = [...new Set(shown.map((s) => s.colour))];
  const palette = [...seen, '?'];
  const colours = new Set<string>();
  const cycles: string[][] = [[shown[0].colour]];
  for (const b of palette) if (b !== shown[0].colour) {
    cycles.push([shown[0].colour, b]);
    for (const c of palette) if (c !== shown[0].colour && c !== b) cycles.push([shown[0].colour, b, c]);
  }
  for (const cycle of cycles) {
    for (const growth of cycle.length > 1 ? [false, true] : [false]) {
      const s = simulate({ ...f, movement: { kind: 'static' }, rotation: { q: 0, growth: false }, colour: { cycle, growth } })!;
      if (s.slice(0, 4).every((st, i) => st.colour === shown[i].colour)) colours.add(`${s[4].colour}|${s[5].colour}`);
    }
  }
  const out = new Set<string>();
  for (const p of positions) for (const o of orients) for (const c of colours) out.add(`${p}#${o}#${c}`);
  return out;
}

export function isUnambiguous(figs: Figure[], runs: FState[][]): boolean {
  return figs.every((f, i) => {
    const r = readings(f, runs[i].slice(0, 4));
    return r.size === 1 && ![...r][0].includes('?');
  });
}

// ---------- difficulty ----------

export function figureScore(f: Figure): number {
  let s = 0;
  const m = f.movement;
  if (m.kind === 'line') s += (Math.abs(m.dir[0]) + Math.abs(m.dir[1]) === 2 ? 1.5 : 1) + (m.step > 1 ? 0.5 : 0);
  if (m.kind === 'border') s += 1.5 + (m.step > 1 ? 0.5 : 0) + (m.growth ? 1.5 : 0);
  if (m.kind === 'loop') s += 2;
  if (f.rotation.q !== 0) s += 1 + (f.rotation.growth ? 1.5 : 0);
  const len = f.colour.cycle.length;
  if (len > 1) s += (len === 2 ? 0.5 : 1) + (f.colour.growth ? 1 : 0);
  return s;
}

export function itemScore(figs: Figure[]): number {
  return figs.reduce((s, f) => s + figureScore(f), 0) + 0.5 * (figs.length - 1);
}

/** Calibrated against the six official exercises (see calibrate.ts). */
export function figureBand(score: number): Band {
  if (score < 3.5) return 'low';
  if (score < 9) return 'medium';
  return 'high';
}

// ---------- explanations ----------

const DIR_NAME = (d: Dir) => {
  const v = d[0] < 0 ? 'up' : d[0] > 0 ? 'down' : '';
  const h = d[1] < 0 ? 'left' : d[1] > 0 ? 'right' : '';
  return v && h ? `diagonally ${v} and to the ${h}` : v || h;
};

export function describe(f: Figure): string {
  const name = SHAPE_LABEL[f.shape];
  const parts: string[] = [];
  const m = f.movement;
  if (m.kind === 'static') parts.push('stays in its field');
  if (m.kind === 'line') {
    const diag = Math.abs(m.dir[0]) + Math.abs(m.dir[1]) === 2;
    parts.push(`moves ${m.step === 1 ? 'one field' : `${m.step} fields`} ${DIR_NAME(m.dir)} each time and bounces off the edge${diag ? ', going back the way it came' : ''}`);
  }
  if (m.kind === 'border') {
    parts.push(m.growth
      ? `moves ${m.cw ? 'clockwise' : 'anticlockwise'} along the outer edge, one field more each time (1, 2, 3 …)`
      : `moves ${m.cw ? 'clockwise' : 'anticlockwise'} along the outer edge, ${m.step === 1 ? 'one field' : `${m.step} fields`} at a time`);
  }
  if (m.kind === 'loop') parts.push(`moves one field at a time in a repeating pattern: ${m.dirs.map(DIR_NAME).join(', ')}`);
  if (f.rotation.q !== 0) {
    const way = f.rotation.q > 0 ? 'clockwise' : 'anticlockwise';
    const deg = Math.abs(f.rotation.q) * 90;
    parts.push(f.rotation.growth
      ? `turns ${way} by one more quarter turn each time (90°, 180°, 270° …)`
      : deg === 180 ? 'turns 180° each time' : `turns ${deg}° ${way} each time`);
  }
  if (f.colour.cycle.length > 1) {
    const seen = simulate({ ...f, movement: { kind: 'static' } })!.map((s) => s.colour);
    parts.push(f.colour.growth
      ? `moves through its colours ${f.colour.cycle.join(' and ')} by one step more each time (x + 1), so the six matrices show ${seen.join(', ')}`
      : `changes colour in the order ${f.colour.cycle.join(', ')}`);
  }
  return `The ${name} ${parts.join('; it ')}.`;
}

// ---------- generation ----------

export interface Option { frame: FState[]; correct: boolean; misconception?: { figure: number; kind: MistakeKind; text: string } }

export interface FigureItem {
  id: string;
  type: 'figures';
  band: Band;
  figures: Figure[];
  shown: FState[][]; // [frame][figure]
  options5: Option[];
  options6: Option[];
  answer: [number, number];
  score: number;
  explanation: string[];
  tags: string[];
  structure: string;
}

const PALETTE = ['yellow', 'pink', 'green', 'orange', 'black', 'white', 'blue'];

function misconceptionsFor(f: Figure): Misconception[] {
  const out: Misconception[] = [];
  const m = f.movement;
  if (m.kind === 'line') out.push('lineReverse', 'lineSkip', m.dir[0] !== 0 && m.dir[1] !== 0 ? 'diagonalStraight' : 'lineSlide');
  if (m.kind === 'border') out.push('borderReverse', 'borderStepOff', 'borderBounce', ...(m.growth ? ['borderNoGrowth' as const] : []));
  if (m.kind === 'loop') out.push('loopRepeat', 'loopReverse');
  if (f.rotation.q !== 0) out.push('rotNone', 'rotOpposite', ...(f.rotation.growth ? ['rotNoGrowth' as const, 'rotGrowthOff' as const] : []));
  if (f.colour.cycle.length > 1) out.push('colourSame', ...(f.colour.cycle.length === 3 ? ['colourSkip' as const, 'colourBack' as const] : []));
  return out;
}

function randomFigure(rng: Rng, shape: ShapeName, band: Band, colours: string[]): Figure {
  const rotates = SHAPE_PERIOD[shape] === 4;
  const roll = rng();
  let movement: Movement;
  let start: Cell = [int(rng, 0, 3), int(rng, 0, 3)];
  // Two of the six official exercises have a figure that moves in a repeating pattern, so
  // those get a fair share here too.
  if (roll < 0.3) movement = { kind: 'line', dir: pick(rng, ORTHOGONAL), step: band !== 'low' && chance(rng, 0.15) ? 2 : 1 };
  else if (roll < 0.52) movement = { kind: 'line', dir: pick(rng, DIAGONAL), step: 1 };
  else if (roll < 0.77) {
    start = pick(rng, RING);
    const growth = band === 'high' && chance(rng, 0.4);
    movement = { kind: 'border', cw: chance(rng, 0.5), step: growth ? 1 : pick(rng, band === 'low' ? [1] : [1, 1, 2, 3]), growth };
  } else if (roll < 0.95 || !rotates) movement = { kind: 'loop', dirs: pick(rng, LOOPS) };
  else movement = { kind: 'static' };

  const rotProb = band === 'low' ? 0.1 : band === 'medium' ? 0.45 : 0.6;
  const rotation: Rotation = rotates && (movement.kind === 'static' || chance(rng, rotProb))
    ? { q: pick(rng, [1, -1, 1, -1, 2]), growth: band === 'high' && chance(rng, 0.3) }
    : { q: 0, growth: false };
  if (rotation.q === 2) rotation.growth = false;

  const colProb = band === 'low' ? 0.1 : band === 'medium' ? 0.35 : 0.5;
  const base = colours[0];
  let colour: Colouring = { cycle: [base], growth: false };
  if (chance(rng, colProb)) {
    // x + 1 only with two colours: with three, the third never appears in the four matrices shown.
    const growth = band === 'high' && chance(rng, 0.15);
    const len = band === 'low' || growth ? 2 : pick(rng, [2, 2, 3]);
    colour = { cycle: colours.slice(0, len), growth };
  }
  return { shape, start, orient: int(rng, 0, 3), movement, rotation, colour };
}

/** Every colour a figure's rule names must appear in the four matrices shown, or the rule cannot be read. */
export function coloursAllShown(figs: Figure[], runs: FState[][]): boolean {
  return figs.every((f, i) => f.colour.cycle.every((c) => runs[i].slice(0, 4).some((s) => s.colour === c)));
}

const MOVEMENT_MISTAKE = /^(line|diagonal|border|loop)/;

const COUNTS: Record<Band, number[]> = { low: [1, 1, 2], medium: [2, 3, 3], high: [3, 4, 4] };
const STRETCH_COUNTS: Record<Band, number[]> = { low: [1, 2], medium: [3], high: [4] };
const SHAPES: ShapeName[] = ['square', 'circle', 'diamond', 'hexagon', 'triangle', 'arrow', 'angle', 'halfCircle', 'trapezoid', 'flag'];

/**
 * `usage` counts how often each mistake has been used for wrong options so far in the bank;
 * the least-used ones are picked first so no single mistake dominates.
 */
export function generateFigures(rng: Rng, band: Band, id: string, stretch = false, usage = new Map<MistakeKind, number>(), maxTries = 40000): FigureItem | null {
  const range = (stretch ? FIGURE_RANGES.stretch : FIGURE_RANGES.core)[band];
  // Stretch items draw their rules from the next band up, so they can reach the range.
  const ruleBand: Band = stretch && band !== 'high' ? (band === 'low' ? 'medium' : 'high') : band;
  for (let t = 0; t < maxTries; t++) {
    const n = pick(rng, (stretch ? STRETCH_COUNTS : COUNTS)[band]);
    const shapes = shuffle(rng, SHAPES).slice(0, n);
    const figs = shapes.map((s) => randomFigure(rng, s, ruleBand, shuffle(rng, PALETTE)));
    if (figs.every((f) => f.movement.kind === 'static')) continue;
    const score = itemScore(figs);
    if (!within(score, range)) continue;
    const runs = figs.map((f) => simulate(f));
    if (runs.some((r) => !r)) continue;
    const frames = Array.from({ length: FRAMES }, (_, k) => runs.map((r) => r![k]));
    if (frames.some(overlaps)) continue;
    if (!isUnambiguous(figs, runs as FState[][])) continue;
    if (!coloursAllShown(figs, runs as FState[][])) continue;

    // Wrong options: the right answer with one figure following a common mistake.
    // Candidate wrong options for each matrix: one figure following a common mistake,
    // or two figures that have swapped places. Each matrix is chosen separately, because some
    // mistakes only show in one of them (two quarter turns either way look the same).
    type Cand = { fig: number; kind: MistakeKind; frame: FState[]; text: string };
    const label = (i: number) => SHAPE_LABEL[figs[i].shape];
    const candidates = (k: 4 | 5): Cand[] => {
      const correctKey = frameKey(figs, frames[k]);
      const out: Cand[] = [];
      const push = (c: Cand) => {
        if (c.frame.some((s) => !inGrid(s.pos)) || overlaps(c.frame) || frameKey(figs, c.frame) === correctKey) return;
        out.push(c);
      };
      figs.forEach((f, i) => {
        const usual: number[] = [];
        simulate(f, null, usual);
        const lately = (ts: number[]) => ts.filter((t) => t >= 4 && t <= k).join();
        for (const kind of misconceptionsFor(f)) {
          const bounces: number[] = [];
          const alt = simulate(f, kind, bounces);
          if (!alt) continue;
          // The note must describe what is drawn. A figure that went "too far" or "turned back"
          // and bounced because of it ends up somewhere the note does not explain, and a movement
          // mistake that leaves the figure where it was does not look like a movement at all.
          if ((kind === 'lineSkip' || kind === 'lineReverse') && lately(bounces) !== lately(usual)) continue;
          if (MOVEMENT_MISTAKE.test(kind) && alt[k].pos[0] === alt[k - 1].pos[0] && alt[k].pos[1] === alt[k - 1].pos[1]) continue;
          push({ fig: i, kind, frame: frames[k].map((s, j) => (j === i ? alt[k] : s)), text: `the ${label(i)} ${MISCONCEPTION_TEXT[kind]}` });
        }
        for (let j = i + 1; j < figs.length; j++) {
          const frame = frames[k].map((s, x) => (x === i ? { ...s, pos: frames[k][j].pos } : x === j ? { ...s, pos: frames[k][i].pos } : s));
          push({ fig: i, kind: 'swap', frame, text: `the ${label(i)} and the ${label(j)} have swapped places` });
        }
      });
      return out;
    };
    // Two per matrix: least-used mistakes first, on different figures and of different kinds where possible.
    const choose = (cands: Cand[]): Cand[] | null => {
      const order = shuffle(rng, cands).sort((a, b) => (usage.get(a.kind) ?? 0) - (usage.get(b.kind) ?? 0));
      for (const strict of [true, false]) {
        const picks: Cand[] = [];
        for (const c of order) {
          if (picks.length === 2) break;
          if (picks.some((p) => frameKey(figs, p.frame) === frameKey(figs, c.frame))) continue;
          if (strict && picks.some((p) => p.kind === c.kind || (n > 1 && p.fig === c.fig))) continue;
          picks.push(c);
        }
        if (picks.length === 2) return picks;
      }
      return null;
    };
    const picks5 = choose(candidates(4));
    if (!picks5) continue;
    for (const p of picks5) usage.set(p.kind, (usage.get(p.kind) ?? 0) + 1);
    const picks6 = choose(candidates(5));
    if (!picks6) { for (const p of picks5) usage.set(p.kind, usage.get(p.kind)! - 1); continue; }
    for (const p of picks6) usage.set(p.kind, (usage.get(p.kind) ?? 0) + 1);

    const mk = (frame: FState[], c?: Cand): Option => ({
      frame, correct: !c,
      ...(c ? { misconception: { figure: c.fig, kind: c.kind, text: c.text } } : {}),
    });
    const options5 = shuffle(rng, [mk(frames[4]), ...picks5.map((c) => mk(c.frame, c))]);
    const options6 = shuffle(rng, [mk(frames[5]), ...picks6.map((c) => mk(c.frame, c))]);
    const kinds = figs.map((f) => f.movement.kind === 'line' ? (Math.abs(f.movement.dir[0]) + Math.abs(f.movement.dir[1]) === 2 ? 'diagonal' : 'straight') : f.movement.kind);
    return {
      id, type: 'figures', band, figures: figs,
      shown: frames.slice(0, 4),
      options5, options6,
      answer: [options5.findIndex((o) => o.correct), options6.findIndex((o) => o.correct)],
      score,
      explanation: figs.map(describe),
      tags: [
        `${n}-figure${n > 1 ? 's' : ''}`,
        ...new Set(kinds.map((k) => `move-${k}`)),
        ...(figs.some((f) => f.rotation.q !== 0) ? ['rotation'] : []),
        ...(figs.some((f) => f.colour.cycle.length > 1) ? ['colour'] : []),
        ...(figs.some((f) => f.rotation.growth || f.colour.growth || (f.movement.kind === 'border' && f.movement.growth)) ? ['x-plus-1'] : []),
        ...(stretch ? ['stretch'] : []),
      ],
      structure: figs.map((f, i) => `${kinds[i]}${f.movement.kind === 'border' ? (f.movement.growth ? '+g' : `/${f.movement.step}`) : ''}${f.rotation.q ? `r${f.rotation.growth ? 'g' : ''}` : ''}${f.colour.cycle.length > 1 ? `c${f.colour.cycle.length}` : ''}`).sort().join(' '),
    };
  }
  return null;
}
