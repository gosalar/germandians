import { writeFileSync } from 'node:fs';
import { generateCore } from './core/generate.ts';
import { type FState, type Option } from './core/figures.ts';
import { BANDS, type Band } from './core/rng.ts';
import { passages } from './passages/read.mjs';

export const bankDir = new URL('../../src/pages/DmatPractice/bank/', import.meta.url);

// Keep the existing seeds for mock 1, section and practice so existing bank files stay byte-identical;
// give each additional mock its own fixed Core seed.
const BASE_SEEDS = { mock: 2026, section: 2027, practice: 2028 } as const;
const mockCoreSeed = (mockNumber: number) => (mockNumber === 1 ? BASE_SEEDS.mock : 2027 + mockNumber);
const MOCK_PASSAGES = 9;
const timedMix = { low: 6, medium: 8, high: 6 } as const;
const practiceMix = { low: 20, medium: 20, high: 20 } as const;

type PassageWithMock = (typeof passages)[number] & { mock?: number };

function select<T extends { id: string; band: Band }>(
  tasks: T[],
  mix: Record<Band, number>,
  difficulty: (task: T) => number,
) {
  return BANDS.flatMap((band) => tasks.filter((task) => task.band === band).slice(0, mix[band])).sort(
    (a, b) => difficulty(a) - difficulty(b) || (a.id < b.id ? -1 : a.id === b.id ? 0 : 1),
  );
}

function figureFrame(frame: FState[]) {
  return frame.map(({ pos, orient, colour }) => ({ pos: [...pos], orient, colour }));
}

function figureOptions(options: Option[]) {
  return options.map(({ frame, misconception }) => ({
    frame: figureFrame(frame),
    mistake: misconception?.text ?? null,
  }));
}

function bankPassage({ id, area, title, blocks, questions }: (typeof passages)[number]) {
  return {
    id,
    area,
    title,
    blocks,
    questions: questions.map(({ id, type, level, stem, options, explanation }) => ({
      id, type, level, stem, explanation,
      options: options.map(({ text, why, correct }) =>
        correct ? { text, why, correct: true } : { text, why }),
    })),
  };
}

export function stableJson(value: unknown): string {
  return JSON.stringify(value, (_key, entry: unknown) => {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) return entry;
    return Object.fromEntries(Object.entries(entry).sort(([a], [b]) => a < b ? -1 : a === b ? 0 : 1));
  }, 2) + '\n';
}

export function generateBank() {
  const files = new Map<string, unknown>();
  const mockPassages = (passages as PassageWithMock[]).filter(({ set }) => set === 'mock');
  const allMockNumbers = [...new Set(mockPassages.map((passage) => passage.mock ?? 1))].sort((a, b) => a - b);
  const completeMocks = allMockNumbers.filter(
    (mockNumber) => mockPassages.filter((passage) => (passage.mock ?? 1) === mockNumber).length === MOCK_PASSAGES,
  );

  const coreEntries: [string, number][] = [
    ['mock', BASE_SEEDS.mock],
    ['section', BASE_SEEDS.section],
    ['practice', BASE_SEEDS.practice],
    ...completeMocks.filter((n) => n >= 2).map((n): [string, number] => [`mock-${n}`, mockCoreSeed(n)]),
  ];

  const coreBanks = coreEntries.map(([set, seed]) => {
    const raw = generateCore(seed, 20);
    const mix = set === 'practice' ? practiceMix : timedMix;
    const figures = select(raw.figures, mix, (task) => task.score);
    const equations = select(raw.equations, mix, (task) => task.analysis.score);
    const latin = select(raw.latin, mix, (task) => task.analysis.aux);

    // Prototype ids repeat across seeds. Give every task a stable id within its set.
    files.set(`figures-${set}.json`, figures.map((task) => ({
      kind: task.type, id: `${set}-${task.id}`, band: task.band, tags: task.tags,
      shapes: task.figures.map((figure) => figure.shape),
      shown: task.shown.map(figureFrame), answer: task.answer, explanation: task.explanation,
      options5: figureOptions(task.options5), options6: figureOptions(task.options6),
    })));
    files.set(`equations-${set}.json`, equations.map((task) => ({
      kind: task.type, id: `${set}-${task.id}`, band: task.band, tags: task.tags,
      equations: task.equations, solution: task.solution, steps: task.steps,
    })));
    files.set(`latin-${set}.json`, latin.map((task) => ({
      kind: task.type, id: `${set}-${task.id}`, band: task.band, tags: task.tags,
      givens: task.givens, target: task.target, answer: task.answer,
      steps: task.analysis.steps.map((step) => step.text),
    })));

    return { set, raw, figures, equations, latin };
  });

  for (const mockNumber of completeMocks) {
    const academic = mockPassages
      .filter((passage) => (passage.mock ?? 1) === mockNumber)
      .map(bankPassage);
    files.set(mockNumber === 1 ? 'academic-mock.json' : `academic-mock-${mockNumber}.json`, academic);
  }

  const practice = passages.filter(({ set }) => set === 'practice').map(bankPassage);
  for (const passage of practice) files.set(`passage-${passage.id}.json`, passage);
  files.set('practice-index.json', practice.map(({ id, area, title }) => ({ id, area, title })));
  return { files, coreBanks, completeMocks, allMockNumbers };
}

if (import.meta.main) {
  const { files } = generateBank();
  for (const [name, data] of files) writeFileSync(new URL(name, bankDir), stableJson(data));
  console.log(`Wrote ${files.size} dMAT bank files.`);
}
