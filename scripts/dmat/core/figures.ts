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
  | 'lineReverse' | 'lineReverseLate' | 'lineSkip' | 'lineSkipLate' | 'lineSlide' | 'lineSlideAlt'
  | 'diagonalStraight' | 'diagonalStraightAlt' | 'diagonalReflect'
  | 'borderReverse' | 'borderStepOff' | 'borderShort' | 'borderNoGrowth' | 'borderBounce'
  | 'loopRepeat' | 'loopRepeatLate' | 'loopReverse' | 'loopReverseLate' | 'loopSkip'
  | 'rotNone' | 'rotLateStop' | 'rotOpposite' | 'rotExtra' | 'rotHalf' | 'rotHalfCcw' | 'rotNoGrowth' | 'rotGrowthOff'
  | 'colourSame' | 'colourSkip' | 'colourBack';

/** A wrong option is the right answer with one of these mistakes, or two figures swapped. */
export type MistakeKind = Misconception | 'swap';

export const MISCONCEPTION_TEXT: Record<Misconception, string> = {
  lineReverse: 'turns back before it reaches the edge',
  lineReverseLate: 'turns back after the fifth matrix before reaching the edge',
  lineSkip: 'moves one field too far',
  lineSkipLate: 'moves one field too far after the fifth matrix',
  lineSlide: 'slides along the edge instead of bouncing back',
  lineSlideAlt: 'slides along the edge instead of bouncing back',
  diagonalStraight: 'switches to a straight line at the edge instead of going back the way it came',
  diagonalStraightAlt: 'switches to a straight line at the edge instead of going back the way it came',
  diagonalReflect: 'bounces at a right angle off the edge instead of going back the way it came',
  borderReverse: 'goes round the edge the wrong way',
  borderStepOff: 'moves one field too many along the edge',
  borderShort: 'moves one field too few along the edge',
  borderNoGrowth: 'keeps the same step instead of moving one field more each time',
  borderBounce: 'bounces back at the corner instead of going round it',
  loopRepeat: 'repeats its last move instead of continuing the pattern',
  loopRepeatLate: 'repeats its fifth-matrix move instead of continuing the pattern',
  loopReverse: 'goes back the way it came instead of continuing the pattern',
  loopReverseLate: 'goes back to its fourth-matrix field instead of continuing the pattern',
  loopSkip: 'skips a step in its repeating pattern',
  rotNone: 'stops turning',
  rotLateStop: 'stops turning after the fifth matrix',
  rotOpposite: 'turns the wrong way',
  rotExtra: 'turns one quarter turn too far',
  rotHalf: 'turns 90° clockwise instead of 180°',
  rotHalfCcw: 'turns 90° anticlockwise instead of 180°',
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
 * `edgeTurns`, when given, collects the turned direction at each edge misconception from step 4 on.
 */
export function simulate(
  f: Figure,
  mis: Misconception | null = null,
  bounces?: number[],
  edgeTurns?: { step: number; dir: Dir }[],
): FState[] | null {
  const out: FState[] = [];
  let pos: Cell = f.start;
  let dir: Dir | null = f.movement.kind === 'line' ? f.movement.dir : null;
  let ring = f.movement.kind === 'border' ? ringIndex(f.start) : -1;
  if (f.movement.kind === 'border' && ring < 0) return null;
  let orient = f.orient;
  let ci = 0;
  let loopStep = 0;
  out.push({ pos, orient: mod(orient, 4), colour: f.colour.cycle[0] });
  for (let t = 1; t < FRAMES; t++) {
    const m = t >= 4 ? mis : null;
    const mv = f.movement;
    if (mv.kind === 'line' && dir) {
      if ((m === 'lineReverse' && t === 4) || (m === 'lineReverseLate' && t === 5)) dir = [-dir[0], -dir[1]];
      const steps = mv.step + (m === 'lineSkip' || (m === 'lineSkipLate' && t === 5) ? 1 : 0);
      for (let s = 0; s < steps; s++) {
        let next: Cell = [pos[0] + dir[0], pos[1] + dir[1]];
        if (!inGrid(next)) {
          const d: Dir = dir;
          const fits = (x: Dir) => inGrid([pos[0] + x[0], pos[1] + x[1]]);
          const diagonal = d[0] !== 0 && d[1] !== 0;
          let turned: Dir | undefined;
          if (m === 'diagonalStraight' && diagonal) turned = ([[d[0], 0], [0, d[1]]] as Dir[]).find(fits);
          if (m === 'diagonalStraightAlt' && diagonal) {
            const primary = ([[d[0], 0], [0, d[1]]] as Dir[]).find(fits);
            turned = ([[d[0], 0], [0, d[1]], [-d[0], 0], [0, -d[1]]] as Dir[]).find(
              (cand) => fits(cand) && (!primary || cand[0] !== primary[0] || cand[1] !== primary[1]),
            );
          }
          if (m === 'diagonalReflect' && diagonal) {
            const outRow = !inGrid([pos[0] + d[0], pos[1]]);
            const outCol = !inGrid([pos[0], pos[1] + d[1]]);
            if (outRow && !outCol) turned = [-d[0], d[1]];
            else if (outCol && !outRow) turned = [d[0], -d[1]];
          }
          if (m === 'lineSlide' && !diagonal) turned = ([[d[1], -d[0]], [-d[1], d[0]]] as Dir[]).find(fits);
          if (m === 'lineSlideAlt' && !diagonal) turned = ([[-d[1], d[0]], [d[1], -d[0]]] as Dir[]).find(fits);
          if (turned && edgeTurns) edgeTurns.push({ step: t, dir: turned });
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
      if (m === 'borderShort') {
        if (amount <= 1) return null;
        amount -= 1;
      }
      let d = (m === 'borderReverse' ? !mv.cw : mv.cw) ? 1 : -1;
      for (let u = 0; u < amount; u++) {
        if (m === 'borderBounce' && CORNERS.has(ring)) d = -d;
        ring = mod(ring + d, RING.length);
      }
      pos = RING[ring];
    } else if (mv.kind === 'loop') {
      const len = mv.dirs.length;
      if (m === 'loopSkip') {
        const count = t === 4 ? 2 : 1;
        for (let u = 0; u < count; u++) {
          const d = mv.dirs[loopStep % len];
          loopStep++;
          pos = [pos[0] + d[0], pos[1] + d[1]];
          if (!inGrid(pos)) return null;
        }
      } else {
        let d = mv.dirs[loopStep % len];
        if (m === 'loopRepeat') d = mv.dirs[2 % len];
        else if (m === 'loopRepeatLate' && t === 5) d = mv.dirs[3 % len];
        else if (m === 'loopReverse') { const back = mv.dirs[mod(6 - t, len)]; d = [-back[0], -back[1]]; }
        else if (m === 'loopReverseLate' && t === 5) { const back = mv.dirs[3 % len]; d = [-back[0], -back[1]]; }
        loopStep++;
        pos = [pos[0] + d[0], pos[1] + d[1]];
        if (!inGrid(pos)) return null;
      }
    }
    let turn = f.rotation.growth ? f.rotation.q * t : f.rotation.q;
    if (m === 'rotNone') turn = 0;
    if (m === 'rotLateStop' && t === 5) turn = 0;
    if (m === 'rotOpposite') turn = -turn;
    if (m === 'rotExtra' && t === 4) turn += f.rotation.q > 0 ? 1 : -1;
    if (m === 'rotHalf') turn = 1;
    if (m === 'rotHalfCcw') turn = -1;
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

/** One labelled mistake that a wrong option shows. */
export interface MistakePart { figure: number; kind: MistakeKind; text: string }

/**
 * `misconception` names the option's first mistake and carries the note shown to students; a wrong
 * option that combines two mistakes lists both in `parts`, and `text` describes both.
 */
export interface Option { frame: FState[]; correct: boolean; misconception?: MistakePart & { parts?: MistakePart[] } }

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

// ---------- second-pass distractor selection ----------

const ROTATION_MISTAKE = /^rot/;
const COLOUR_MISTAKE = /^colour/;
const LINE_BOUNCE_GUARD = new Set<Misconception>([
  'lineSkip', 'lineReverse', 'lineSkipLate', 'lineReverseLate',
  'lineSlide', 'lineSlideAlt', 'diagonalStraight', 'diagonalStraightAlt', 'diagonalReflect',
]);

type RevisedCand = { fig: number; kind: MistakeKind; frame: FState[]; text: string };

const cardinalName = (d: Dir) => (d[0] < 0 ? 'up' : d[0] > 0 ? 'down' : d[1] < 0 ? 'left' : 'right');

function extendedMisconceptionsFor(f: Figure, k: 4 | 5): Misconception[] {
  const out: Misconception[] = [];
  const m = f.movement;
  if (m.kind === 'line') {
    const diag = m.dir[0] !== 0 && m.dir[1] !== 0;
    out.push('lineReverse', 'lineSkip');
    if (k === 5) out.push('lineReverseLate', 'lineSkipLate');
    if (diag) out.push('diagonalStraight', 'diagonalStraightAlt', 'diagonalReflect');
    else out.push('lineSlide', 'lineSlideAlt');
  }
  if (m.kind === 'border') {
    out.push('borderReverse', 'borderStepOff', 'borderBounce');
    if (m.step > 1 || m.growth) out.push('borderShort');
    if (m.growth) out.push('borderNoGrowth');
  }
  if (m.kind === 'loop') {
    out.push('loopRepeat', 'loopReverse', 'loopSkip');
    if (k === 5) out.push('loopRepeatLate', 'loopReverseLate');
  }
  if (f.rotation.q !== 0) {
    out.push('rotNone', 'rotOpposite', 'rotExtra');
    if (k === 5) out.push('rotLateStop');
    if (Math.abs(f.rotation.q) === 2) out.push('rotHalf', 'rotHalfCcw');
    if (f.rotation.growth) out.push('rotNoGrowth', 'rotGrowthOff');
  }
  if (f.colour.cycle.length > 1) {
    out.push('colourSame', ...(f.colour.cycle.length === 3 ? ['colourSkip' as const, 'colourBack' as const] : []));
  }
  return out;
}

const canonicalFamily = (kind: MistakeKind): string => {
  if (kind === 'lineSlideAlt') return 'lineSlide';
  if (kind === 'diagonalStraightAlt') return 'diagonalStraight';
  return kind;
};

function candidateText(shape: ShapeName, kind: Misconception, edgeTurns: { step: number; dir: Dir }[], k: 4 | 5): string | null {
  const name = SHAPE_LABEL[shape];
  if (kind === 'lineSlide' || kind === 'lineSlideAlt') {
    const turns = edgeTurns.filter((entry) => entry.step >= 4 && entry.step <= k);
    if (turns.length !== 1) return null;
    return `the ${name} slides ${cardinalName(turns[0].dir)} along the edge instead of bouncing back`;
  }
  if (kind === 'diagonalStraight' || kind === 'diagonalStraightAlt') {
    const turns = edgeTurns.filter((entry) => entry.step >= 4 && entry.step <= k);
    if (turns.length !== 1) return null;
    return `the ${name} switches to moving ${cardinalName(turns[0].dir)} at the edge instead of going back the way it came`;
  }
  return `the ${name} ${MISCONCEPTION_TEXT[kind]}`;
}

function samePos(a: Cell, b: Cell): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

function drawMatchesKind(f: Figure, truth: FState, prev: FState, alt: FState, kind: Misconception, k: 4 | 5, m4: FState): boolean {
  const period = SHAPE_PERIOD[f.shape];
  if (MOVEMENT_MISTAKE.test(kind)) {
    if (samePos(alt.pos, truth.pos) || samePos(alt.pos, prev.pos)) return false;
    if (k === 4 && samePos(alt.pos, m4.pos)) return false;
    return alt.orient % period === truth.orient % period && alt.colour === truth.colour;
  }
  if (ROTATION_MISTAKE.test(kind)) {
    return samePos(alt.pos, truth.pos) && alt.colour === truth.colour && alt.orient % period !== truth.orient % period;
  }
  if (COLOUR_MISTAKE.test(kind)) {
    return samePos(alt.pos, truth.pos) && alt.orient % period === truth.orient % period &&
      alt.colour !== truth.colour && f.colour.cycle.includes(alt.colour);
  }
  return false;
}

function extendedCandidates(figs: Figure[], frames: FState[][], k: 4 | 5): RevisedCand[] {
  const correctKey = frameKey(figs, frames[k]);
  const seenFamilyFrame = new Set<string>();
  const out: RevisedCand[] = [];
  const push = (c: RevisedCand) => {
    if (c.frame.some((s) => !inGrid(s.pos)) || overlaps(c.frame)) return;
    const fk = frameKey(figs, c.frame);
    if (fk === correctKey) return;
    const famKey = `${c.fig}:${canonicalFamily(c.kind)}:${fk}`;
    if (seenFamilyFrame.has(famKey)) return;
    seenFamilyFrame.add(famKey);
    out.push(c);
  };
  figs.forEach((f, i) => {
    const usual: number[] = [];
    simulate(f, null, usual);
    const lately = (ts: number[]) => ts.filter((t) => t >= 4 && t <= k).join();
    for (const kind of extendedMisconceptionsFor(f, k)) {
      const bounces: number[] = [];
      const edgeTurns: { step: number; dir: Dir }[] = [];
      const alt = simulate(f, kind, bounces, edgeTurns);
      if (!alt) continue;
      if (LINE_BOUNCE_GUARD.has(kind) && lately(bounces) !== lately(usual)) continue;
      if (!drawMatchesKind(f, frames[k][i], alt[k - 1], alt[k], kind, k, frames[3][i])) continue;
      const text = candidateText(f.shape, kind, edgeTurns, k);
      if (!text) continue;
      push({ fig: i, kind, frame: frames[k].map((s, j) => (j === i ? alt[k] : s)), text });
    }
    for (let j = i + 1; j < figs.length; j++) {
      const frame = frames[k].map((s, x) => (x === i ? { ...s, pos: frames[k][j].pos } : x === j ? { ...s, pos: frames[k][i].pos } : s));
      push({ fig: i, kind: 'swap', frame, text: `the ${SHAPE_LABEL[f.shape]} and the ${SHAPE_LABEL[figs[j].shape]} have swapped places` });
    }
  });
  return out;
}

function figureAttrValues(shape: ShapeName, s: FState): [string, string, string] {
  return [`${s.pos[0]},${s.pos[1]}`, `${s.orient % SHAPE_PERIOD[shape]}`, s.colour];
}

/** Whether comparing the three frames alone yields a single unique consensus option. */
function hasUniqueConsensus(figs: Figure[], trio: readonly FState[][], perAttribute: boolean): boolean {
  const columns: string[][] = [];
  figs.forEach((f, i) => {
    if (perAttribute) {
      for (let a = 0; a < 3; a++) columns.push(trio.map((fr) => figureAttrValues(f.shape, fr[i])[a]));
    } else {
      columns.push(trio.map((fr) => visible(f.shape, fr[i])));
    }
  });
  const matching = trio.map(() => true);
  for (const column of columns) {
    const counts = new Map<string, number>();
    for (const value of column) counts.set(value, (counts.get(value) ?? 0) + 1);
    if (counts.size === 1) continue;
    let bestValue = '';
    let bestCount = 0;
    for (const [value, count] of counts) {
      if (count > bestCount) { bestCount = count; bestValue = value; }
    }
    if (bestCount === 1) return false;
    column.forEach((value, idx) => { if (value !== bestValue) matching[idx] = false; });
  }
  return matching.filter(Boolean).length === 1;
}

// A wrong option is the right frame with one or two labelled mistakes applied. Each mistake changes
// some "cells": one attribute (position, turn or colour) of one figure, or the positions of two
// figures that swap. A two-mistake option combines mistakes that touch different cells.
type Atom = { part: MistakePart; frame: FState[]; cells: Map<string, string> };
type Distractor = { parts: MistakePart[]; frame: FState[]; key: string };

/** Search limits per option set, so `check:bank` stays quick; the RNG decides which combinations come first. */
const MAX_STRUCTURE_TRIES = 600;
const ATTRIBUTE_ORDER: Record<string, number> = { swap: 0, movement: 0, rotation: 1, colour: 2 };

const familyOf = (kind: MistakeKind): 'swap' | 'movement' | 'rotation' | 'colour' =>
  kind === 'swap' ? 'swap' : MOVEMENT_MISTAKE.test(kind) ? 'movement' : ROTATION_MISTAKE.test(kind) ? 'rotation' : 'colour';

function atomFrom(figs: Figure[], truth: FState[], cand: RevisedCand): Atom | null {
  const cells = new Map<string, string>();
  figs.forEach((f, i) => {
    const right = figureAttrValues(f.shape, truth[i]);
    const shown = figureAttrValues(f.shape, cand.frame[i]);
    for (let a = 0; a < 3; a++) if (right[a] !== shown[a]) cells.set(`${i}:${a}`, shown[a]);
  });
  if (cells.size === 0) return null;
  return { part: { figure: cand.fig, kind: cand.kind, text: cand.text }, frame: cand.frame, cells };
}

function combine(figs: Figure[], truth: FState[], atoms: readonly Atom[]): Distractor | null {
  const taken = new Set<string>();
  for (const atom of atoms) {
    for (const cell of atom.cells.keys()) {
      if (taken.has(cell)) return null;
      taken.add(cell);
    }
  }
  const frame = truth.map((s, i): FState => {
    let { pos, orient, colour } = s;
    for (const atom of atoms) {
      if (atom.cells.has(`${i}:0`)) pos = atom.frame[i].pos;
      if (atom.cells.has(`${i}:1`)) orient = atom.frame[i].orient;
      if (atom.cells.has(`${i}:2`)) colour = atom.frame[i].colour;
    }
    return { pos, orient, colour };
  });
  if (frame.some((s) => !inGrid(s.pos)) || overlaps(frame)) return null;
  const parts = atoms
    .map((atom) => atom.part)
    .sort((x, y) => x.figure - y.figure || ATTRIBUTE_ORDER[familyOf(x.kind)] - ATTRIBUTE_ORDER[familyOf(y.kind)]);
  return { parts, frame, key: frameKey(figs, frame) };
}

/** The note for an option: one mistake as written, two joined ("the circle moves … and stops turning"). */
function joinParts(figs: Figure[], parts: readonly MistakePart[]): string {
  if (parts.length === 1) return parts[0].text;
  const [first, second] = parts;
  const prefix = `the ${SHAPE_LABEL[figs[second.figure].shape]} `;
  if (first.kind !== 'swap' && second.kind !== 'swap' && first.figure === second.figure && second.text.startsWith(prefix)) {
    return `${first.text} and ${second.text.slice(prefix.length)}`;
  }
  return `${first.text}, and ${second.text}`;
}

function columnsOf(figs: Figure[], trio: readonly FState[][], perAttribute: boolean): string[][] {
  const columns: string[][] = [];
  figs.forEach((f, i) => {
    if (perAttribute) {
      for (let a = 0; a < 3; a++) columns.push(trio.map((fr) => figureAttrValues(f.shape, fr[i])[a]));
    } else {
      columns.push(trio.map((fr) => visible(f.shape, fr[i])));
    }
  });
  return columns;
}

/**
 * How often each option is the odd one out in a column where the other two agree. When the counts
 * differ, "pick the option that is never the odd one out" or "rule out the odd one out" says
 * something about the answer without solving the task, so the counts should be equal.
 */
function oddOneOutSpread(figs: Figure[], trio: readonly FState[][], perAttribute: boolean): number {
  const odd = trio.map(() => 0);
  for (const column of columnsOf(figs, trio, perAttribute)) {
    if (new Set(column).size !== 2) continue;
    column.forEach((value, idx) => { if (column.filter((other) => other === value).length === 1) odd[idx]++; });
  }
  return Math.max(...odd) - Math.min(...odd);
}

function varyingAttributes(figs: Figure[], trio: readonly FState[][]): number {
  return columnsOf(figs, trio, true).filter((column) => new Set(column).size > 1).length;
}

function chooseDistractors(
  figs: Figure[],
  correctFrame: FState[],
  cands: RevisedCand[],
  rng: Rng,
  usage: Map<MistakeKind, number>,
  seed: number,
  itemId: string,
  matrix: 5 | 6,
): [Distractor, Distractor] {
  const correctKey = frameKey(figs, correctFrame);
  const atoms = shuffle(rng, cands.map((c) => atomFrom(figs, correctFrame, c)).filter((a): a is Atom => a !== null));
  type Scored = {
    pair: [Distractor, Distractor];
    tier: number;
    attrSpread: number;
    figSpread: number;
    varying: number;
    sameText: number;
    useScore: number;
    tie: number;
  };
  const scored: Scored[] = [];
  const consider = (a: Distractor | null, b: Distractor | null) => {
    if (!a || !b || a.key === b.key || a.key === correctKey || b.key === correctKey) return;
    const trio = [correctFrame, a.frame, b.frame];
    const leaks = hasUniqueConsensus(figs, trio, false) || hasUniqueConsensus(figs, trio, true);
    const kinds = [...a.parts, ...b.parts].map((p) => p.kind);
    scored.push({
      pair: [a, b],
      tier: leaks ? 1 : 0,
      attrSpread: oddOneOutSpread(figs, trio, true),
      figSpread: oddOneOutSpread(figs, trio, false),
      varying: Math.min(varyingAttributes(figs, trio), 3),
      sameText: joinParts(figs, a.parts) === joinParts(figs, b.parts) ? 1 : 0,
      useScore: kinds.reduce((sum, kind) => sum + (usage.get(kind) ?? 0), 0) / kinds.length,
      tie: rng(),
    });
  };

  // One mistake shared by both wrong options and one of each option's own, on separate cells: every
  // option is then the odd one out exactly once.
  let tries = 0;
  outerShared: for (const shared of atoms) {
    for (let y = 0; y < atoms.length; y++) {
      for (let z = y + 1; z < atoms.length; z++) {
        if (atoms[y] === shared || atoms[z] === shared) continue;
        if (++tries > MAX_STRUCTURE_TRIES) break outerShared;
        consider(combine(figs, correctFrame, [shared, atoms[y]]), combine(figs, correctFrame, [shared, atoms[z]]));
      }
    }
  }
  // Two mistakes per wrong option, each pair on the same cells with different results: no option is
  // ever the odd one out, and two attributes differ.
  const sameCells = (x: Atom, y: Atom) => x.cells.size === y.cells.size && [...x.cells.keys()].every((cell) => y.cells.has(cell));
  tries = 0;
  outerPaired: for (let x1 = 0; x1 < atoms.length; x1++) {
    for (let x2 = x1 + 1; x2 < atoms.length; x2++) {
      if (!sameCells(atoms[x1], atoms[x2])) continue;
      for (let y1 = 0; y1 < atoms.length; y1++) {
        for (let y2 = y1 + 1; y2 < atoms.length; y2++) {
          if (!sameCells(atoms[y1], atoms[y2]) || sameCells(atoms[x1], atoms[y1])) continue;
          if (++tries > MAX_STRUCTURE_TRIES) break outerPaired;
          consider(combine(figs, correctFrame, [atoms[x1], atoms[y1]]), combine(figs, correctFrame, [atoms[x2], atoms[y2]]));
          consider(combine(figs, correctFrame, [atoms[x1], atoms[y2]]), combine(figs, correctFrame, [atoms[x2], atoms[y1]]));
        }
      }
    }
  }
  // One mistake per wrong option: the fallback when the rule leaves too few separate cells.
  for (let a = 0; a < atoms.length; a++) {
    for (let b = a + 1; b < atoms.length; b++) {
      consider(combine(figs, correctFrame, [atoms[a]]), combine(figs, correctFrame, [atoms[b]]));
    }
  }

  if (scored.length === 0) {
    throw new Error(`Figure distractor search exhausted for seed ${seed}, task ${itemId}, matrix ${matrix} (${cands.length} candidates)`);
  }
  scored.sort((x, y) =>
    x.tier - y.tier ||
    x.attrSpread - y.attrSpread ||
    x.figSpread - y.figSpread ||
    y.varying - x.varying ||
    x.sameText - y.sameText ||
    x.useScore - y.useScore ||
    x.tie - y.tie,
  );
  return scored[0].pair;
}

function placeOptions(figs: Figure[], correctFrame: FState[], distractors: [Distractor, Distractor], answerSlot: number, rng: Rng): Option[] {
  const ordered = shuffle(rng, distractors).map((d): Option => ({
    frame: d.frame,
    correct: false,
    misconception: {
      ...d.parts[0],
      text: joinParts(figs, d.parts),
      ...(d.parts.length > 1 ? { parts: d.parts } : {}),
    },
  }));
  const options: Option[] = [];
  let wrongIndex = 0;
  for (let slot = 0; slot < 3; slot++) {
    options.push(slot === answerSlot ? { frame: correctFrame, correct: true } : ordered[wrongIndex++]);
  }
  return options;
}

/**
 * Deterministic second pass over already selected figure items using a figure-only RNG:
 * replaces distractors so comparing the options alone does not give the answer away, and so the
 * options differ in more than one feature wherever the rule allows, while preserving prompt IDs,
 * ordering, correct frames and balanced answer indices.
 */
export function reviseFigureDistractors(items: FigureItem[], rng: Rng, seed: number): void {
  const usage = new Map<MistakeKind, number>();
  const count = (pair: [Distractor, Distractor]) => {
    for (const d of pair) for (const p of d.parts) usage.set(p.kind, (usage.get(p.kind) ?? 0) + 1);
  };
  for (const item of items) {
    const runs = item.figures.map((f) => simulate(f));
    if (runs.some((r) => !r)) throw new Error(`Failed to re-simulate seed ${seed}, task ${item.id}`);
    const frames = Array.from({ length: FRAMES }, (_, k) => runs.map((r) => r![k]));
    const picks5 = chooseDistractors(item.figures, frames[4], extendedCandidates(item.figures, frames, 4), rng, usage, seed, item.id, 5);
    count(picks5);
    const picks6 = chooseDistractors(item.figures, frames[5], extendedCandidates(item.figures, frames, 5), rng, usage, seed, item.id, 6);
    count(picks6);
    item.options5 = placeOptions(item.figures, frames[4], picks5, item.answer[0], rng);
    item.options6 = placeOptions(item.figures, frames[5], picks6, item.answer[1], rng);
  }
}

/** Verify every wrong option's rendered frame is the right frame with exactly its labelled mistakes applied. */
export function verifyFigureOptionDraw(item: FigureItem): boolean {
  const runs = item.figures.map((f) => simulate(f));
  if (runs.some((r) => !r)) return false;
  const frames = Array.from({ length: FRAMES }, (_, k) => runs.map((r) => r![k]));
  const checks: [Option[], 4 | 5][] = [[item.options5, 4], [item.options6, 5]];
  for (const [opts, k] of checks) {
    const answerIdx = item.answer[k === 4 ? 0 : 1];
    for (let idx = 0; idx < opts.length; idx++) {
      const opt = opts[idx];
      if (idx === answerIdx) {
        if (!opt.correct || opt.misconception) return false;
        continue;
      }
      const mis = opt.misconception;
      if (opt.correct || !mis || !mis.text.trim()) return false;
      if (opt.frame.some((s) => !inGrid(s.pos)) || overlaps(opt.frame)) return false;
      const parts = mis.parts ?? [{ figure: mis.figure, kind: mis.kind, text: mis.text }];
      if (parts.length < 1 || parts.length > 2) return false;
      if (mis.figure !== parts[0].figure || mis.kind !== parts[0].kind) return false;
      if (mis.text !== joinParts(item.figures, parts)) return false;

      const expected = frames[k].map((s) => ({ ...s }));
      const touched = new Set<string>();
      const touch = (cell: string) => {
        if (touched.has(cell)) return false;
        touched.add(cell);
        return true;
      };
      for (const part of parts) {
        if (part.figure < 0 || part.figure >= item.figures.length) return false;
        const f = item.figures[part.figure];
        if (!part.text.includes(SHAPE_LABEL[f.shape])) return false;
        if (part.kind === 'swap') {
          const i = part.figure;
          const j = item.figures.findIndex((_, x) => x !== i &&
            samePos(opt.frame[i].pos, frames[k][x].pos) && samePos(opt.frame[x].pos, frames[k][i].pos));
          if (j < 0 || !part.text.includes(SHAPE_LABEL[item.figures[j].shape])) return false;
          if (!touch(`${i}:0`) || !touch(`${j}:0`)) return false;
          expected[i].pos = frames[k][j].pos;
          expected[j].pos = frames[k][i].pos;
          continue;
        }
        const alt = simulate(f, part.kind);
        if (!alt) return false;
        if (!drawMatchesKind(f, frames[k][part.figure], alt[k - 1], alt[k], part.kind, k, frames[3][part.figure])) return false;
        const family = familyOf(part.kind);
        if (!touch(`${part.figure}:${ATTRIBUTE_ORDER[family]}`)) return false;
        if (family === 'movement') expected[part.figure].pos = alt[k].pos;
        else if (family === 'rotation') expected[part.figure].orient = alt[k].orient;
        else expected[part.figure].colour = alt[k].colour;
      }
      for (let j = 0; j < item.figures.length; j++) {
        if (visible(item.figures[j].shape, opt.frame[j]) !== visible(item.figures[j].shape, expected[j])) return false;
      }
      if (frameKey(item.figures, opt.frame) === frameKey(item.figures, frames[k])) return false;
    }
  }
  return true;
}
