import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { execPath } from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  BANDS, COLOURS, CORE_SUBTESTS, LETTERS, SHAPES,
  type CoreTask, type Frame, type Passage,
} from '../../src/utils/dmat/types.ts';
import { bankDir, generateBank, stableJson } from './build-bank.ts';
import { SHAPE_PERIOD } from './core/figures.ts';
import { checkCore } from './core/generate.ts';
import { latinSignature } from './core/latin.ts';
import { passageReport } from './passages/read.mjs';

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isTextList = (list: unknown): list is string[] =>
  Array.isArray(list) && list.length > 0 && list.every(isText);
const integerIn = (value: number, min: number, max: number) =>
  Number.isInteger(value) && value >= min && value <= max;

function checkFrame(frame: Frame, count: number, id: string) {
  assert.equal(frame.length, count, `${id}: figure count differs between frames`);
  for (const { pos, orient, colour } of frame) {
    assert(pos.length === 2 && pos.every((part) => integerIn(part, 0, 3)), `${id}: invalid figure position`);
    assert(integerIn(orient, 0, 3) && COLOURS.includes(colour), `${id}: invalid orientation or colour`);
  }
}

function checkTask(task: CoreTask): string {
  const { id } = task;
  assert(BANDS.includes(task.band) && isTextList(task.tags), `${id}: invalid band or tags`);
  if (task.kind === 'figures') {
    const { shapes, shown, options5, options6, answer, explanation } = task;
    assert(integerIn(shapes.length, 1, 4) && shapes.every((shape) => SHAPES.includes(shape)), `${id}: invalid shapes`);
    assert.equal(shown.length, 4, `${id}: expected four shown frames`);
    assert(answer.length === 2 && answer.every((index) => integerIn(index, 0, 2)), `${id}: invalid answer indices`);
    assert(isTextList(explanation), `${id}: missing explanation`);
    shown.forEach((frame) => checkFrame(frame, shapes.length, id));
    [options5, options6].forEach((options, matrix) => {
      assert.equal(options.length, 3, `${id}: expected three options per matrix`);
      options.forEach(({ frame, mistake }, index) => {
        checkFrame(frame, shapes.length, id);
        assert(index === answer[matrix] ? mistake === null : isText(mistake), `${id}: invalid option feedback`);
      });
    });
    // Identical visible prompts remain duplicates even if figure order or a symmetric turn differs.
    return stableJson(shapes.map((shape, index) => JSON.stringify([
      shape, shown.map((frame) => {
        const { pos, orient, colour } = frame[index];
        return [pos, orient % SHAPE_PERIOD[shape], colour];
      }),
    ])).sort());
  }
  if (task.kind === 'equations') {
    assert(isTextList(task.equations) && isTextList(task.steps), `${id}: invalid equations or worked solution`);
    const entries = Object.entries(task.solution);
    assert(integerIn(entries.length, 2, 4), `${id}: invalid number of equation letters`);
    assert(entries.every(([letter, value]) => /^[A-D]$/.test(letter) && integerIn(value, 1, 20)), `${id}: invalid equation key`);
    return JSON.stringify([...task.equations].sort());
  }

  const { givens, target, answer, steps } = task;
  assert(givens.length === 5 && givens.every((row) =>
    row.length === 5 && row.every((cell) => cell === null || LETTERS.includes(cell))), `${id}: invalid grid`);
  assert(target.length === 2 && target.every((part) => integerIn(part, 0, 4)), `${id}: invalid target`);
  assert(givens[target[0]][target[1]] === null && LETTERS.includes(answer) && isTextList(steps), `${id}: invalid Latin square key or steps`);
  return latinSignature(givens, target);
}

function passageBodySignature(passage: Passage): string {
  return passage.blocks
    .map((block) => (block.type === 'p' || block.type === 'formula' ? block.text : block.caption))
    .join('\n')
    .trim()
    .toLowerCase();
}

function checkPassage(
  passage: Passage,
  expectedId: string | null,
  addId: (id: string) => void,
  seenPassages: Map<string, string>,
) {
  if (expectedId !== null) assert.equal(passage.id, expectedId);
  assert(/^p\d{2,}$/.test(passage.id), `Invalid passage id: ${passage.id}`);
  addId(passage.id);
  assert(isText(passage.area) && isText(passage.title), `${passage.id}: missing area or title`);
  assert(passage.blocks.length, `${passage.id}: missing passage blocks`);
  const titleKey = `title:${passage.title.trim().toLowerCase()}`;
  const bodyKey = `body:${passageBodySignature(passage)}`;
  assert(!seenPassages.has(titleKey), `${passage.id}: shares a title with ${seenPassages.get(titleKey)}`);
  assert(!seenPassages.has(bodyKey), `${passage.id}: shares passage text with ${seenPassages.get(bodyKey)}`);
  seenPassages.set(titleKey, passage.id);
  seenPassages.set(bodyKey, passage.id);
  for (const block of passage.blocks) {
    switch (block.type) {
      case 'p':
      case 'formula':
        assert(isText(block.text), `${passage.id}: empty ${block.type} block`);
        break;
      case 'figure':
        addId(block.id);
        assert([block.caption, block.alt, block.svg].every(isText), `${passage.id}: invalid figure block`);
        break;
      case 'table':
        assert(isText(block.caption) && isTextList(block.head) && block.rows.length &&
          block.rows.every((row) => isTextList(row) && row.length === block.head.length), `${passage.id}: invalid table block`);
        break;
      default:
        assert.fail(`${passage.id}: unknown passage block`);
    }
  }
  assert(integerIn(passage.questions.length, 6, 8), `${passage.id}: invalid question count`);
  for (const question of passage.questions) {
    addId(question.id);
    assert(/^[RADFCST]$/.test(question.type) && integerIn(question.level, 1, 3), `${question.id}: invalid type or level`);
    assert(isText(question.stem) && isText(question.explanation), `${question.id}: missing stem or explanation`);
    assert.equal(question.options.length, 4, `${question.id}: expected four options`);
    assert.equal(question.options.filter((option) => option.correct === true).length, 1, `${question.id}: expected one correct option`);
    for (const option of question.options) {
      assert(isText(option.text) && isText(option.why), `${question.id}: missing option text or reason`);
      assert(!Object.hasOwn(option, 'correct') || option.correct === true, `${question.id}: invalid correct flag`);
    }
  }
}

const { files, coreBanks, completeMocks, allMockNumbers } = generateBank();
assert.ok(allMockNumbers.length >= 1, 'Expected at least one mock');
assert.deepEqual(
  allMockNumbers,
  Array.from({ length: allMockNumbers.length }, (_item, index) => index + 1),
  `Mock numbers must run without gaps: ${allMockNumbers.join(', ')}`,
);
assert.deepEqual(
  completeMocks,
  allMockNumbers,
  `Every mock must be complete (incomplete: ${allMockNumbers.filter((n) => !completeMocks.includes(n)).join(', ')})`,
);

const bankIndexSource = readFileSync(new URL('index.ts', bankDir), 'utf8');
const namedJsonFiles = new Set(
  Array.from(bankIndexSource.matchAll(/['"]\.\/([^'"]+\.json)['"]/g), (match) => match[1]),
);
for (const name of files.keys()) {
  assert(namedJsonFiles.has(name), `bank/index.ts must name ${name}`);
}
for (const name of namedJsonFiles) {
  assert(files.has(name), `bank/index.ts names unknown bank file ${name}`);
}

const differences: string[] = [];
for (const [name, data] of files) {
  try {
    if (!readFileSync(new URL(name, bankDir)).equals(Buffer.from(stableJson(data)))) differences.push(`${name}: content differs`);
  } catch (error) {
    differences.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
for (const name of readdirSync(bankDir)) {
  if (name.endsWith('.json') && !files.has(name)) differences.push(`${name}: unexpected bank file`);
}
assert.equal(differences.length, 0, `Bank does not match regeneration:\n${differences.join('\n')}`);

const ids = new Set<string>();
const addId = (id: string) => {
  assert(isText(id) && !ids.has(id), `Missing or duplicate id: ${id}`);
  ids.add(id);
};
const prompts = new Map<string, string>();
const seenPassages = new Map<string, string>();
let coreCount = 0;
for (const { set } of coreBanks) {
  const mix = set === 'practice' ? [20, 20, 20] : [6, 8, 6];
  for (const kind of CORE_SUBTESTS) {
    const name = `${kind}-${set}.json`;
    const tasks = files.get(name) as CoreTask[];
    assert(Array.isArray(tasks), `Missing Core bank file: ${name}`);
    assert.deepEqual(BANDS.map((band) => tasks.filter((task) => task.band === band).length), mix, `${name}: invalid difficulty mix`);
    for (const task of tasks) {
      assert.equal(task.kind, kind, `${task.id}: invalid task kind`);
      addId(task.id);
      const signature = `${kind}:${checkTask(task)}`;
      assert(!prompts.has(signature), `${task.id}: same prompt as ${prompts.get(signature)}`);
      prompts.set(signature, task.id);
      coreCount++;
    }
  }
}

let mockPassageTotal = 0;
for (const mockNumber of completeMocks) {
  const academicFile = mockNumber === 1 ? 'academic-mock.json' : `academic-mock-${mockNumber}.json`;
  const mock = files.get(academicFile) as Passage[];
  assert(Array.isArray(mock), `Missing academic mock file: ${academicFile}`);
  assert.equal(mock.length, 9, `${academicFile}: expected nine academic mock passages`);
  mock.forEach((passage, index) => {
    const expectedId = mockNumber === 1 ? `p0${index + 1}` : null;
    checkPassage(passage, expectedId, addId, seenPassages);
  });
  const mockQuestions = mock.flatMap(({ questions }) => questions);
  assert.equal(mockQuestions.length, 60, `${academicFile}: expected 60 academic mock questions`);
  const positions = [0, 0, 0, 0];
  for (const { options } of mockQuestions) positions[options.findIndex(({ correct }) => correct)]++;
  assert(
    positions.every((count) => count >= 12 && count <= 18),
    `${academicFile}: academic mock answers must be balanced across positions (${positions.join(', ')})`,
  );
  mockPassageTotal += mock.length;
}

const practice = Array.from({ length: 8 }, (_item, index) => {
  const id = `p${index + 10}`;
  const passage = files.get(`passage-${id}.json`) as Passage;
  checkPassage(passage, id, addId, seenPassages);
  return passage;
});
assert.deepEqual(files.get('practice-index.json'), practice.map(({ id, area, title }) => ({ id, area, title })));
const expectedFileCount = (completeMocks.length + 2) * CORE_SUBTESTS.length + completeMocks.length + practice.length + 1;
assert.equal(files.size, expectedFileCount, `Expected ${expectedFileCount} bank files for ${completeMocks.length} mock(s)`);

const auditBank = { figures: [], equations: [], latin: [] } as Pick<
  (typeof coreBanks)[number]['raw'], 'figures' | 'equations' | 'latin'
>;
let generatorChecks = 0;
for (const { set, raw, figures, equations, latin } of coreBanks) {
  generatorChecks += checkCore(raw);
  auditBank.figures.push(...figures.map((task) => ({ ...task, id: `${set}-${task.id}` })));
  auditBank.equations.push(...equations.map((task) => ({ ...task, id: `${set}-${task.id}` })));
  auditBank.latin.push(...latin.map((task) => ({ ...task, id: `${set}-${task.id}` })));
}
const auditJson = JSON.stringify(auditBank);
const failedAudits: string[] = [];
for (const name of ['latin', 'equations', 'figures', 'explanations']) {
  const script = fileURLToPath(new URL(`./audit/audit-${name}.mjs`, import.meta.url));
  const result = spawnSync(execPath, [script], { input: auditJson, encoding: 'utf8' });
  if (result.stdout) console.log(result.stdout.trimEnd());
  if (result.stderr) console.error(result.stderr.trimEnd());
  if (result.error || result.status !== 0) failedAudits.push(`${name}: ${result.error?.message ?? result.status}`);
}
assert.equal(failedAudits.length, 0, `Independent audits failed: ${failedAudits.join(', ')}`);
console.log(passageReport.join('\n'));
console.log(`Bank verified: ${files.size} files, ${coreCount} Core tasks, ${mockPassageTotal + practice.length} passages, ${generatorChecks} generator checks and four independent audits.`);
