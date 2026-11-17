/**
 * The shapes the dMAT practice page works with: the tasks in the bank, a visitor's answers and what the
 * slip hands over. The bank's JSON is written to these types by `scripts/dmat/build-bank.ts`.
 */

export const CORE_SUBTESTS = ['figures', 'equations', 'latin'] as const;
export const SECTION_IDS = [...CORE_SUBTESTS, 'academic'] as const;
export const MODES = ['full', 'section', 'practice'] as const;
export const BANDS = ['low', 'medium', 'high'] as const;
export const LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;
export const COLOURS = ['yellow', 'pink', 'green', 'orange', 'black', 'white', 'blue'] as const;
export const SHAPES = ['square', 'circle', 'diamond', 'hexagon', 'triangle', 'arrow', 'angle', 'halfCircle', 'trapezoid', 'flag'] as const;
export const TEXT_SIZES = [0, 1, 2] as const;

export type CoreSubtest = (typeof CORE_SUBTESTS)[number];
export type SectionId = (typeof SECTION_IDS)[number];
export type Mode = (typeof MODES)[number];
export type Band = (typeof BANDS)[number];
export type Letter = (typeof LETTERS)[number];
export type Colour = (typeof COLOURS)[number];
export type Shape = (typeof SHAPES)[number];
export type TextSize = (typeof TEXT_SIZES)[number];

/** `pos` is zero-based in a 4×4 matrix. `orient` is 0 up, 1 right, 2 down, 3 left. */
export interface FigureState {
  pos: [row: number, column: number];
  orient: number;
  colour: Colour;
}
/** One entry per figure, in the order of the task's `shapes`. */
export type Frame = FigureState[];
/** `mistake` names the slip behind a wrong option; it is `null` on the right one. */
export interface FigureOption {
  frame: Frame;
  mistake: string | null;
}

interface TaskBase {
  id: string;
  band: Band;
  tags: string[];
}
/** `answer` holds the index of the right option under the fifth and the sixth matrix. A task has 1 to 4 figures. */
export interface FigureTask extends TaskBase {
  kind: 'figures';
  shapes: Shape[];
  shown: Frame[];
  options5: FigureOption[];
  options6: FigureOption[];
  answer: [number, number];
  explanation: string[];
}
/** 2 to 4 letters, each a whole number from 1 to 20. `steps` is the whole worked solution. */
export interface EquationTask extends TaskBase {
  kind: 'equations';
  equations: string[];
  solution: Record<string, number>;
  steps: string[];
}
/** A 5×5 square; `target` is the zero-based cell of the "?". */
export interface LatinTask extends TaskBase {
  kind: 'latin';
  givens: (Letter | null)[][];
  target: [row: number, column: number];
  answer: Letter;
  steps: string[];
}
export type CoreTask = FigureTask | EquationTask | LatinTask;

export type PassageBlock =
  | { type: 'p'; text: string }
  | { type: 'formula'; text: string }
  | { type: 'figure'; id: string; caption: string; alt: string; svg: string }
  | { type: 'table'; caption: string; head: string[]; rows: string[][] };
/** `type` is one of R, A, D, F, C, S, T and serves as the question's tag. Four options, one with `correct`. */
export interface PassageQuestion {
  id: string;
  type: string;
  level: 1 | 2 | 3;
  stem: string;
  options: { text: string; correct?: true; why: string }[];
  explanation: string;
}
export interface Passage {
  id: string;
  area: string;
  title: string;
  blocks: PassageBlock[];
  questions: PassageQuestion[];
}

/** What a section shows. In a Core subtest one screen is one task; in the academic module one screen is one passage. */
export type SectionContent =
  | { section: CoreSubtest; tasks: CoreTask[] }
  | { section: 'academic'; passages: Passage[] };

/** One answer per task id, or per question id in the academic module. */
export type Answer =
  | { kind: 'figures'; picks: [number | null, number | null] }
  | { kind: 'equations'; values: Record<string, number | null> }
  | { kind: 'latin'; letter: Letter }
  | { kind: 'question'; option: number };

/** What the slip hands over. `section` for One section and Practice; `passage` for academic practice; `tag` to practise one kind of Core task. */
export interface StartChoice {
  section?: SectionId;
  passage?: string;
  tag?: string;
}
