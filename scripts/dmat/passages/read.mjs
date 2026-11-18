import { readdirSync } from 'node:fs';

const TYPES = { R: 'Read', A: 'Apply', D: 'Direction', F: 'Figure', C: 'Classify', S: 'Statement', T: 'Transfer' };
const AREAS = ['mathematics', 'computational sciences', 'natural sciences', 'engineering', 'business administration', 'economics', 'social sciences', 'humanities'];
// The subjects of the four official samples, which we do not write about.
const OFFICIAL_SUBJECTS = [/\bvector/i, /hydrostatic/i, /optimal order quantity/i, /qualitative.*quantitative|quantitative.*qualitative/i];
const LETTERS = ['a', 'b', 'c', 'd'];

const dir = new URL('./items/', import.meta.url);
export const passages = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith('.mjs')).sort()) {
  passages.push((await import(new URL(file, dir).href)).default);
}

const words = (s) => s.toLowerCase().replace(/<[^>]+>/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
const passageText = (x) => x.blocks.map((b) => (b.type === 'p' ? b.text : b.type === 'figure' ? b.caption : b.type === 'formula' ? b.text : '')).join(' ');

const problems = [];
const report = [];
for (const x of passages) {
  const bad = (msg) => problems.push(`${x.id}: ${msg}`);
  const count = words(x.blocks.filter((b) => b.type === 'p').map((b) => b.text).join(' ')).length;
  if (!AREAS.includes(x.area)) bad(`unknown area "${x.area}"`);
  if (!['mock', 'practice'].includes(x.set)) bad(`unknown set "${x.set}"`);
  if (x.mock !== undefined && (x.set !== 'mock' || !Number.isInteger(x.mock) || x.mock < 2)) {
    bad('mock must be an integer ≥ 2 on a mock passage');
  }
  if (count < 250 || count > 500) bad(`${count} words of text (250–500 expected)`);
  if (OFFICIAL_SUBJECTS.some((re) => re.test(x.title))) bad('title matches a subject of the official samples');
  if (x.blocks.filter((b) => b.type === 'figure').length > 2) bad('more than 2 figures');
  if (x.blocks.filter((b) => b.type === 'table').length > 1) bad('more than 1 table');
  if (x.blocks.filter((b) => b.type === 'formula').length > 3) bad('more than 3 formulas');
  for (const b of x.blocks.filter((b) => b.type === 'figure')) if (!b.alt || !b.caption) bad(`figure ${b.id} needs a caption and a text alternative`);
  if (!x.facts?.length || x.facts.some((f) => !f.claim || !/^https:\/\//.test(f.source) || !/^\d{4}-\d{2}-\d{2}$/.test(f.read))) bad('every fact needs a claim, a source and the date it was read');
  if (x.questions.length < 6 || x.questions.length > 8) bad(`${x.questions.length} questions (6–8 expected)`);
  if (!x.questions.some((q) => q.level === 3)) bad('no level 3 question');
  x.questions.forEach((q, i) => {
    const n = `question ${i + 1}`;
    q.id = `${x.id}-q${i + 1}`;
    if (!TYPES[q.type]) bad(`${n}: unknown type "${q.type}"`);
    if (![1, 2, 3].includes(q.level)) bad(`${n}: level must be 1, 2 or 3`);
    if (q.options.length !== 4) bad(`${n}: ${q.options.length} options`);
    if (q.options.filter((o) => o.correct).length !== 1) bad(`${n}: needs exactly one correct option`);
    if (new Set(q.options.map((o) => o.text.trim().toLowerCase())).size !== q.options.length) bad(`${n}: two options read the same`);
    if (q.options.some((o) => !o.why || o.why.length < 15)) bad(`${n}: every option needs its reason`);
    if (!q.explanation) bad(`${n}: no explanation`);
    if (/all of the above/i.test(q.options.map((o) => o.text).join(' '))) bad(`${n}: "all of the above" is not used`);
    if (/undefined|NaN/.test(JSON.stringify(q))) bad(`${n}: a computed value is missing`);
    // The right option should not stand out by length.
    const lengths = q.options.map((o) => o.text.length);
    const right = q.options.findIndex((o) => o.correct);
    const others = lengths.filter((_, k) => k !== right);
    if (lengths[right] > 1.6 * Math.max(...others) && lengths[right] > 40) bad(`${n}: the right option is much longer than the others`);
  });
  if (/undefined|NaN/.test(passageText(x))) bad('a computed value is missing in the passage');
  const tally = (f) => { const m = {}; for (const q of x.questions) m[f(q)] = (m[f(q)] ?? 0) + 1; return Object.entries(m).sort().map(([k, v]) => `${k} ${v}`).join(' · '); };
  const setLabel = x.set === 'mock' && x.mock !== undefined ? `mock ${x.mock}` : x.set;
  report.push(`${x.id} ${x.title} (${x.area}, ${setLabel}): ${count} words, ${x.questions.length} questions · types: ${tally((q) => q.type)} · levels: ${tally((q) => q.level)} · right option: ${tally((q) => LETTERS[q.options.findIndex((o) => o.correct)])}`);
}
if (new Set(passages.map((x) => x.id)).size !== passages.length) problems.push('two passages share an id');

// Set-level balance: each full mock has 9 passages and 60 questions; the right answer sits in each
// position about equally often; levels sit near 30% / 45% / 25%; mock numbers run without gaps.
const MOCK_PASSAGES = 9;
const MOCK_QUESTIONS = 60;
const LEVEL_TARGETS = { 1: 0.3, 2: 0.45, 3: 0.25 };
const BALANCE_TOLERANCE = 0.06;

const mockPassages = passages.filter((x) => x.set === 'mock');
const mockNumbers = [...new Set(mockPassages.map((x) => x.mock ?? 1))].sort((a, b) => a - b);
for (let i = 0; i < mockNumbers.length; i++) {
  if (mockNumbers[i] !== i + 1) {
    problems.push(`mock numbers must run 1..${mockNumbers.length} without gaps (found ${mockNumbers.join(', ')})`);
    break;
  }
}

function checkSetBalance(label, ps, isMock) {
  const qs = ps.flatMap((x) => x.questions);
  if (!qs.length) return;
  const pos = Object.fromEntries(LETTERS.map((l) => [l, 0]));
  const lev = { 1: 0, 2: 0, 3: 0 };
  for (const q of qs) {
    const rightIndex = q.options.findIndex((o) => o.correct);
    if (rightIndex >= 0 && rightIndex < LETTERS.length) pos[LETTERS[rightIndex]]++;
    if (lev[q.level] !== undefined) lev[q.level]++;
  }
  const share = (n) => `${Math.round((100 * n) / qs.length)}%`;
  report.push(`\n${label}: ${ps.length} passages, ${qs.length} questions · right option: ${LETTERS.map((l) => `${l} ${pos[l]}`).join(' · ')} · levels: ${[1, 2, 3].map((k) => `${k} ${lev[k]} (${share(lev[k])})`).join(' · ')}`);
  if (isMock && ps.length > MOCK_PASSAGES) {
    problems.push(`${label} has ${ps.length} passages, not ${MOCK_PASSAGES}`);
  }
  if (isMock ? ps.length === MOCK_PASSAGES : ps.length >= 8) {
    if (isMock && qs.length !== MOCK_QUESTIONS) {
      problems.push(`${label} has ${qs.length} questions, not ${MOCK_QUESTIONS}`);
    }
    if (LETTERS.some((l) => Math.abs(pos[l] / qs.length - 0.25) > BALANCE_TOLERANCE)) {
      problems.push(`${label}: right answers are not spread across a to d (${LETTERS.map((l) => `${l} ${pos[l]}`).join(', ')})`);
    }
    if ([1, 2, 3].some((k) => Math.abs(lev[k] / qs.length - LEVEL_TARGETS[k]) > BALANCE_TOLERANCE)) {
      problems.push(`${label}: levels must sit near 30%, 45% and 25% (${[1, 2, 3].map((k) => `${k} ${share(lev[k])}`).join(', ')})`);
    }
  }
}

for (const mockNumber of mockNumbers) {
  checkSetBalance(`mock ${mockNumber}`, mockPassages.filter((x) => (x.mock ?? 1) === mockNumber), true);
}
checkSetBalance('practice', passages.filter((x) => x.set === 'practice'), false);

if (problems.length) throw new Error(problems.join('\n'));
export const passageReport = report;
