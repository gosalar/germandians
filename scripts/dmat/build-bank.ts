import { writeFileSync } from 'node:fs';
import { generateCore } from './core/generate.ts';
import { type FState, type Option } from './core/figures.ts';
import { BANDS, type Band } from './core/rng.ts';
import { passages } from './passages/read.mjs';

export const bankDir = new URL('../../src/pages/DmatPractice/bank/', import.meta.url);

// Use the reviewed prototype seed for the full mock and separate fixed seeds for each other mode.
const seeds = { mock: 2026, section: 2027, practice: 2028 } as const;
const timedMix = { low: 6, medium: 8, high: 6 } as const;
const practiceMix = { low: 20, medium: 20, high: 20 } as const;

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
  const coreBanks = Object.entries(seeds).map(([set, seed]) => {
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

  const mock = passages.filter(({ set }) => set === 'mock').map(bankPassage);
  const practice = passages.filter(({ set }) => set === 'practice').map(bankPassage);
  files.set('academic-mock.json', mock);
  for (const passage of practice) files.set(`passage-${passage.id}.json`, passage);
  files.set('practice-index.json', practice.map(({ id, area, title }) => ({ id, area, title })));
  return { files, coreBanks };
}

if (import.meta.main) {
  const { files } = generateBank();
  for (const [name, data] of files) writeFileSync(new URL(name, bankDir), stableJson(data));
  console.log(`Wrote ${files.size} dMAT bank files.`);
}
