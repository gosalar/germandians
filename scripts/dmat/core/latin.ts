/**
 * Latin Squares: a 5×5 grid, letters A–E once per row and column, one cell marked "?".
 *
 * Difficulty is measured the way a person solves it without notes: the fewest other cells
 * that must be filled in your head before the "?" is forced, using only two moves:
 *   - cell: the row and column of a cell already hold four different letters;
 *   - row/column: a letter still missing from a line fits in only one of its free cells.
 */
import { type Band, type BandRanges, type Rng, int, shuffle, within } from './rng.ts';

export const LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;
export type Letter = (typeof LETTERS)[number];
export type Grid = (Letter | null)[][];
export type Pos = readonly [number, number];
export type Technique = 'cell' | 'row' | 'column';

export interface LatinStep {
  r: number;
  c: number;
  letter: Letter;
  technique: Technique;
  text: string;
}

export interface LatinAnalysis {
  solvable: boolean;
  answer: Letter | null;
  /** Cells you must fill in your head before the "?" is forced. */
  aux: number;
  steps: LatinStep[];
  techniques: Technique[];
}

export interface LatinItem {
  id: string;
  type: 'latin';
  band: Band;
  givens: Grid;
  target: Pos;
  answer: Letter;
  options: readonly Letter[];
  analysis: LatinAnalysis;
  tags: string[];
}

const N = 5;
const key = (r: number, c: number) => r * N + c;
const at = (r: number, c: number) => `row ${r + 1}, column ${c + 1}`;

interface Deduction {
  r: number;
  c: number;
  letter: Letter;
  technique: Technique;
  text: string;
}

/** Every cell the two moves can fill from this grid. One entry per cell: the plainest move wins. */
function deductions(grid: Grid): Deduction[] {
  const out = new Map<number, Deduction>();
  const inRow = (r: number, L: Letter) => grid[r].includes(L);
  const inColumn = (c: number, L: Letter) => grid.some((row) => row[c] === L);

  // A cell whose row and column already hold four different letters.
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (grid[r][c] !== null) continue;
      const missing = LETTERS.filter((L) => !inRow(r, L) && !inColumn(c, L));
      if (missing.length !== 1) continue;
      const others = LETTERS.filter((L) => L !== missing[0]);
      out.set(key(r, c), {
        r, c, letter: missing[0], technique: 'cell',
        text: `The row and column of ${at(r, c)} already hold ${others.join(', ')}, so it must be ${missing[0]}.`,
      });
    }
  }

  // A letter missing from a row (or column) that fits in only one free cell there.
  for (const technique of ['row', 'column'] as const) {
    for (let line = 0; line < N; line++) {
      for (const L of LETTERS) {
        const cells = Array.from({ length: N }, (_, i) => (technique === 'row' ? [line, i] : [i, line]) as [number, number]);
        if (cells.some(([r, c]) => grid[r][c] === L)) continue;
        const free = cells.filter(([r, c]) => grid[r][c] === null);
        const open = free.filter(([r, c]) => !(technique === 'row' ? inColumn(c, L) : inRow(r, L)));
        if (open.length !== 1) continue;
        const [r, c] = open[0];
        if (out.has(key(r, c))) continue;
        const where = technique === 'row' ? `column ${c + 1}` : `row ${r + 1}`;
        const lineName = technique === 'row' ? `Row ${r + 1}` : `Column ${c + 1}`;
        const lineOther = technique === 'row' ? 'column' : 'row';
        out.set(key(r, c), {
          r, c, letter: L, technique,
          text: free.length === 1
            ? `${lineName} has one free cell left, so ${L} goes in ${where}.`
            : `${lineName} still needs ${L}. Its other free cells already have ${L} in their ${lineOther}, so ${L} goes in ${where}.`,
        });
      }
    }
  }
  return [...out.values()];
}

const UNSOLVABLE: LatinAnalysis = { solvable: false, answer: null, aux: 0, steps: [], techniques: [] };

/**
 * The shortest route to the "?": the fewest other cells that must be filled first, found by
 * trying every order of the two moves, not just the first one that works. `maxAux` stops the
 * search early when a puzzle would need more cells than the caller wants.
 */
export function analyseLatin(givens: Grid, target: Pos, maxAux = 8): LatinAnalysis {
  const tk = key(...target);

  // Quick test first: can the two moves reach the "?" at all, and in how many rounds?
  const all: Grid = givens.map((row) => [...row]);
  let rounds = 0;
  let filledBefore = 0;
  while (all[target[0]][target[1]] === null) {
    const found = deductions(all);
    if (found.length === 0) return UNSOLVABLE;
    if (found.some((d) => key(d.r, d.c) === tk)) break;
    for (const d of found) all[d.r][d.c] = d.letter;
    filledBefore += found.length;
    rounds++;
  }
  // Each round needs at least one cell from the round before it.
  if (rounds > maxAux) return UNSOLVABLE;

  // Breadth-first over sets of filled cells, so the first hit is a shortest route.
  type State = { grid: Grid; path: Deduction[] };
  let frontier = new Map<string, State>([['', { grid: givens.map((row) => [...row]), path: [] }]]);
  for (let depth = 0; depth <= Math.min(maxAux, filledBefore); depth++) {
    const next = new Map<string, State>();
    for (const state of frontier.values()) {
      const found = deductions(state.grid);
      const hit = found.find((d) => key(d.r, d.c) === tk);
      if (hit) {
        const steps = [...state.path, hit].map((d): LatinStep => ({ r: d.r, c: d.c, letter: d.letter, technique: d.technique, text: d.text }));
        steps[steps.length - 1].text += ' That is the field with the question mark.';
        return { solvable: true, answer: hit.letter, aux: depth, steps, techniques: [...new Set(steps.map((s) => s.technique))] };
      }
      for (const d of found) {
        const cellsKey = [...state.path.map((p) => key(p.r, p.c)), key(d.r, d.c)].sort((a, b) => a - b).join(',');
        if (next.has(cellsKey)) continue;
        const grid = state.grid.map((row) => [...row]);
        grid[d.r][d.c] = d.letter;
        next.set(cellsKey, { grid, path: [...state.path, d] });
      }
    }
    frontier = next;
  }
  return UNSOLVABLE;
}

/** Calibrated against the six official exercises (see calibrate.ts). */
export function latinBand(aux: number): Band {
  if (aux === 0) return 'low';
  if (aux <= 2) return 'medium';
  return 'high';
}

/**
 * Cells to fill first, by the shortest route. Official samples: low 0, 0 · medium 1, 1 · high 3, 3.
 * A low stretch puzzle also needs one cell, but both of its steps are the plain "four letters
 * already in the row and column" move, like the second official example.
 */
export const LATIN_RANGES: BandRanges = {
  core: { low: [0, 1], medium: [1, 2], high: [3, 4] },
  stretch: { low: [1, 2], medium: [2, 3], high: [4, 6] },
};

export function randomFullSquare(rng: Rng): Letter[][] {
  const g: (Letter | null)[][] = Array.from({ length: N }, () => Array<Letter | null>(N).fill(null));
  const fill = (i: number): boolean => {
    if (i === N * N) return true;
    const r = Math.floor(i / N);
    const c = i % N;
    for (const L of shuffle(rng, LETTERS)) {
      if (g[r].includes(L) || g.some((row) => row[c] === L)) continue;
      g[r][c] = L;
      if (fill(i + 1)) return true;
      g[r][c] = null;
    }
    return false;
  };
  fill(0);
  return g as Letter[][];
}

/** `wanted`, when given, is the letter the answer should be, so a bank can use every letter equally. */
export function generateLatin(rng: Rng, band: Band, id: string, stretch = false, wanted?: Letter, maxTries = 200000): LatinItem | null {
  const range = (stretch ? LATIN_RANGES.stretch : LATIN_RANGES.core)[band];
  for (let t = 0; t < maxTries; t++) {
    const full = randomFullSquare(rng);
    const target: Pos = [int(rng, 0, N - 1), int(rng, 0, N - 1)];
    const k = int(rng, 10, 14);
    const cells = shuffle(rng, Array.from({ length: N * N }, (_, i) => i).filter((i) => i !== key(...target)));
    const shown = new Set(cells.slice(0, k));
    const givens: Grid = full.map((row, r) => row.map((L, c) => (shown.has(key(r, c)) ? L : null)));
    const analysis = analyseLatin(givens, target, range[1] - 1);
    if (!analysis.solvable || !within(analysis.aux, range)) continue;
    if (band === 'low' && stretch && analysis.techniques.some((t) => t !== 'cell')) continue;
    if (analysis.answer !== full[target[0]][target[1]]) throw new Error('Solver disagreed with the full square');
    // Rename the letters at random so every letter is the answer about equally often.
    const order = shuffle(rng, LETTERS);
    if (wanted) {
      const from = LETTERS.indexOf(analysis.answer!);
      const to = order.indexOf(wanted);
      [order[from], order[to]] = [order[to], order[from]];
    }
    const rename = (L: Letter) => order[LETTERS.indexOf(L)];
    const renamed: Grid = givens.map((row) => row.map((L) => (L ? rename(L) : null)));
    const final = analyseLatin(renamed, target);
    return {
      id, type: 'latin', band, givens: renamed, target, answer: final.answer!, options: LETTERS, analysis: final,
      tags: [
        final.aux === 0 ? 'read-the-cross' : `chain-${final.aux}`,
        ...final.techniques.map((t) => `uses-${t}`),
        ...(stretch ? ['stretch'] : []),
      ],
    };
  }
  return null;
}

/** The same puzzle with letters renamed or the grid mirrored on its diagonal gets the same signature. */
export function latinSignature(givens: Grid, target: Pos): string {
  const variants: string[] = [];
  for (const transpose of [false, true]) {
    const cellAt = (r: number, c: number) => (transpose ? givens[c][r] : givens[r][c]);
    const t = transpose ? [target[1], target[0]] : target;
    const map = new Map<string, string>();
    let s = '';
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (r === t[0] && c === t[1]) { s += '?'; continue; }
        const L = cellAt(r, c);
        if (L === null) { s += '.'; continue; }
        if (!map.has(L)) map.set(L, String(map.size));
        s += map.get(L);
      }
    }
    variants.push(s);
  }
  return variants.sort()[0];
}

export function parseRows(rows: string[]): { givens: Grid; target: Pos } {
  let target: Pos = [0, 0];
  const givens = rows.map((row, r) =>
    [...row].map((ch, c) => {
      if (ch === '?') { target = [r, c]; return null; }
      return ch === '.' ? null : (ch as Letter);
    }),
  );
  return { givens, target };
}
