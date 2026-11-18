// Mock 3, passage 5. Area: business administration. Subject: critical path method and slack.
import { numericOptions, p, whole } from '../lib.mjs';

// ---------- general CPM solver in code so every schedule figure is computed ----------
function solveCpm(activities) {
  const byId = new Map(activities.map((a) => [a.id, { ...a, succ: [] }]));
  for (const a of byId.values()) {
    for (const pre of a.preds) byId.get(pre).succ.push(a.id);
  }
  // Forward pass (activities are given in topological order).
  for (const a of byId.values()) {
    a.es = a.preds.length ? Math.max(...a.preds.map((id) => byId.get(id).ef)) : 0;
    a.ef = a.es + a.d;
  }
  const projectDuration = Math.max(...[...byId.values()].map((a) => a.ef));
  // Backward pass in reverse topological order.
  for (const a of [...byId.values()].reverse()) {
    a.lf = a.succ.length ? Math.min(...a.succ.map((id) => byId.get(id).ls)) : projectDuration;
    a.ls = a.lf - a.d;
    a.slack = a.ls - a.es;
    if (a.lf - a.ef !== a.slack) throw new Error(`${a.id}: LF - EF must equal LS - ES`);
  }
  return { byId, projectDuration };
}

// ---------- Table 1 and Figure 1: a six-activity project with all six durations distinct ----------
const baseActivities = [
  { id: 'A', preds: [], d: 3 },
  { id: 'B', preds: [], d: 5 },
  { id: 'C', preds: ['A'], d: 7 },
  { id: 'D', preds: ['A', 'B'], d: 9 },
  { id: 'E', preds: ['B'], d: 6 },
  { id: 'F', preds: ['C', 'D', 'E'], d: 4 },
];
const durations = baseActivities.map((a) => a.d);
if (new Set(durations).size !== durations.length) throw new Error('every duration in Table 1 must be different');

const { byId: sched, projectDuration } = solveCpm(baseActivities);
const act = (id) => sched.get(id);

// Verify critical path is uniquely B -> D -> F and non-critical slacks are distinct.
const criticalIds = baseActivities.filter((a) => act(a.id).slack === 0).map((a) => a.id).join('');
if (criticalIds !== 'BDF') throw new Error('expected unique critical path B -> D -> F');
const nonCritSlacks = ['A', 'C', 'E'].map((id) => act(id).slack);
if (new Set(nonCritSlacks).size !== nonCritSlacks.length) throw new Error('non-critical slacks should all differ');

// Question 2: EF of Activity D.
const efD = act('D').ef;
const wrong2DurOnly = act('D').d;
const wrong2MinPred = act('A').ef + act('D').d;
const wrong2SumPreds = act('A').ef + act('B').ef + act('D').d;

// Question 3: minimum completion time of the whole project.
const pathACF = act('A').d + act('C').d + act('F').d;
const pathADF = act('A').d + act('D').d + act('F').d;
const pathBEF = act('B').d + act('E').d + act('F').d;
const sumAllDurations = durations.reduce((s, d) => s + d, 0);
if (new Set([pathACF, pathBEF, pathADF, projectDuration]).size !== 4) {
  throw new Error('all four start-to-finish path lengths must differ');
}

// Question 4: slack of Activity A (a burst node feeding both C and D).
const slackA = act('A').slack;
const wrong4DurA = act('A').d;
const wrong4OnlyPathC = projectDuration - pathACF;
const wrong4LfAsSlack = act('A').lf;

// Question 5: Activity E takes 8 days instead of 6 days.
const eDelayedDur = 8;
const eDelay = eDelayedDur - act('E').d;
const afterEDelay = solveCpm(baseActivities.map((a) => (a.id === 'E' ? { ...a, d: eDelayedDur } : a)));
if (afterEDelay.projectDuration !== projectDuration) throw new Error('delay within slack must not delay project');
if (afterEDelay.byId.get('E').slack !== act('E').slack - eDelay) throw new Error('slack of E must drop by 2 days');

// Question 6: separate four-activity project where shortening the critical task shifts the critical path.
const q6BeforeSpec = [
  { id: 'P', preds: [], d: 4 },
  { id: 'Q', preds: ['P'], d: 10 },
  { id: 'R', preds: ['P'], d: 7 },
  { id: 'S', preds: ['Q', 'R'], d: 5 },
];
const cutQ = 5;
const q6Before = solveCpm(q6BeforeSpec);
const q6After = solveCpm(q6BeforeSpec.map((a) => (a.id === 'Q' ? { ...a, d: a.d - cutQ } : a)));
const ans6 = q6After.projectDuration;
const wrong6OldPathOnly = q6Before.projectDuration - cutQ;
const wrong6Unchanged = q6Before.projectDuration;
const wrong6SumAfter = 4 + (10 - cutQ) + 7 + 5;
if (!(ans6 > wrong6OldPathOnly && ans6 < wrong6Unchanged)) {
  throw new Error('question 6 requires the parallel path P -> R -> S to take over as critical');
}

// Question 7 counter-example: longest single task (8 days) in parallel with two 5-day tasks in series (10 days).
const c7 = solveCpm([
  { id: 'X', preds: [], d: 8 },
  { id: 'Y', preds: [], d: 5 },
  { id: 'Z', preds: ['Y'], d: 5 },
]);
if (c7.byId.get('X').slack === 0) throw new Error('counter-example needs longest single task X to be non-critical');

const days = (v) => `${whole(v)} days`;

// ---------- Figure 1: activity-on-node network diagram (planar, zero crossing arrows) ----------
const bw = 96;
const bh = 42;
const pos = {
  A: { x: 24, y: 42 },
  B: { x: 24, y: 152 },
  C: { x: 186, y: 18 },
  D: { x: 186, y: 97 },
  E: { x: 186, y: 176 },
  F: { x: 348, y: 97 },
};
const box = (id) => {
  const { x, y } = pos[id];
  const d = act(id).d;
  return `<rect class="part" x="${x}" y="${y}" width="${bw}" height="${bh}" rx="4"/>
  <text class="prob" x="${x + bw / 2}" y="${y + 27}" text-anchor="middle">${id} (${d} d)</text>`;
};
const edge = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const bx = x2 - 9 * ux;
  const by = y2 - 9 * uy;
  const px = -uy * 4.5;
  const py = ux * 4.5;
  const r = (n) => Math.round(n * 10) / 10;
  return `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2 - 3 * ux)}" y2="${r(y2 - 3 * uy)}"/>
  <polygon class="dot" points="${r(x2)},${r(y2)} ${r(bx + px)},${r(by + py)} ${r(bx - px)},${r(by - py)}"/>`;
};

const figure1 = `<svg viewBox="0 0 468 236" role="img" aria-labelledby="p31-fig1-alt">
  ${edge(pos.A.x + bw, pos.A.y + 15, pos.C.x, pos.C.y + bh / 2)}
  ${edge(pos.A.x + bw, pos.A.y + 30, pos.D.x, pos.D.y + 13)}
  ${edge(pos.B.x + bw, pos.B.y + 12, pos.D.x, pos.D.y + 29)}
  ${edge(pos.B.x + bw, pos.B.y + 27, pos.E.x, pos.E.y + bh / 2)}
  ${edge(pos.C.x + bw, pos.C.y + bh / 2, pos.F.x, pos.F.y + 10)}
  ${edge(pos.D.x + bw, pos.D.y + bh / 2, pos.F.x, pos.F.y + bh / 2)}
  ${edge(pos.E.x + bw, pos.E.y + bh / 2, pos.F.x, pos.F.y + 32)}
  ${baseActivities.map((a) => box(a.id)).join('\n  ')}
</svg>`;

export default {
  id: 'p31',
  set: 'mock',
  mock: 3,
  area: 'business administration',
  title: 'Project Networks, Critical Path and Slack',
  facts: [
    { claim: 'In an activity-on-node network with finish-to-start dependencies, each activity is a node with a duration, and arrows link each predecessor to the successor activities that cannot start until it finishes.', source: 'https://biz.libretexts.org/Courses/Northeast_Wisconsin_Technical_College/Project_Management_Fundamentals_(NWTC)/03%3A_Project_Planning_and_Scope/3.05%3A_Creating_an_Activity_Network_Diagram', read: '2026-11-18' },
    { claim: 'Forward pass: starting activities begin at ES = 0, EF = ES + duration, and where multiple predecessors merge at an activity, its ES equals the highest EF among its immediate predecessors; the final EF gives the minimum project duration.', source: 'https://biz.libretexts.org/Courses/Northeast_Wisconsin_Technical_College/Project_Management_Fundamentals_(NWTC)/03%3A_Project_Planning_and_Scope/3.05%3A_Creating_an_Activity_Network_Diagram', read: '2026-11-18' },
    { claim: 'Backward pass: starting from the project completion time as LF for ending activities, LS = LF − duration, and where an activity precedes multiple successors (a burst point), its LF equals the lowest LS among its immediate successors.', source: 'https://biz.libretexts.org/Courses/Northeast_Wisconsin_Technical_College/Project_Management_Fundamentals_(NWTC)/03%3A_Project_Planning_and_Scope/3.05%3A_Creating_an_Activity_Network_Diagram', read: '2026-11-18' },
    { claim: 'Slack (also called float) equals LS − ES, which gives the same value as LF − EF, and measures how long an activity can be delayed from its early start without delaying project completion.', source: 'https://biz.libretexts.org/Bookshelves/Management/Project_Management_from_Simple_to_Complex/08%3A_Project_Time_Management/8.03%3A_Critical_Path_and_Float', read: '2026-11-18' },
    { claim: 'The critical path is the path through the network with the longest total duration; its activities have zero slack, any delay on it delays the project, and shortening project time requires shortening critical activities (which may shift the critical path).', source: 'https://biz.libretexts.org/Bookshelves/Management/Book%3A_Technical_Project_Management_in_Living_and_Geometric_Order_(Russell_Pferdehirt_and_Nelson)/01%3A_Chapters/1.07%3A_Project_Scheduling', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'Projects such as fitting out a laboratory or launching a product consist of separate activities, some of which can run in parallel while others depend on earlier work.',
      'In a finish-to-start dependency, an activity cannot begin until every one of its immediate predecessors has finished.',
      'The critical path method (CPM) maps these dependencies in an activity network — boxes for activities and arrows from predecessors to successors — to find the shortest time in which the whole project can finish and where the schedule has room for delay.',
    ),
    p(
      'With d for an activity’s duration, a forward pass works from start to finish to find each activity’s earliest start (ES) and earliest finish (EF).',
      'Activities with no predecessors start at time 0, so ES = 0.',
      'Where one or more predecessors lead into an activity, all of them must finish first, so ES equals the largest EF among its immediate predecessors.',
      'Adding the duration gives',
    ),
    { type: 'formula', text: 'EF = ES + d' },
    p(
      'The largest EF among the ending activities is the minimum completion time of the entire project.',
      'A backward pass then works from finish back to start to find each activity’s latest finish (LF) and latest start (LS) — the latest times it can finish and start without delaying that project completion time.',
      'An activity with no successors has LF equal to the project completion time; an activity followed by one or more immediate successors has LF equal to the smallest LS among those successors, and',
    ),
    { type: 'formula', text: 'LS = LF − d' },
    p(
      'The scheduling leeway of an activity is called its slack, or float:',
    ),
    { type: 'formula', text: 'slack = LS − ES = LF − EF' },
    p(
      'A path from start to finish with the longest total duration is called a critical path; a project may have one critical path or more than one tied for the longest duration.',
      'When LF at the end is set to the minimum project completion time, every activity on a critical path has zero slack: delaying it delays the whole project.',
      'Shortening the project requires shortening activities on the critical path, and cutting a critical activity far enough can make another path take over as critical.',
      'Table 1 and Figure 1 show a six-activity project whose durations are in days.',
    ),
    {
      type: 'table',
      caption: 'Table 1. Predecessors and durations of a six-activity project.',
      head: ['Activity', 'Immediate predecessors', 'Duration (days)'],
      rows: baseActivities.map((a) => [a.id, a.preds.length ? a.preds.join(', ') : 'None', `${a.d}`]),
    },
    {
      type: 'figure',
      id: 'p31-fig1',
      caption: 'Figure 1. Activity network for the project in Table 1 (durations in days).',
      alt: 'Six activity boxes with arrows from left to right: A (3 days) points to C (7 days) and D (9 days); B (5 days) points to D (9 days) and E (6 days); C, D and E all point to F (4 days).',
      svg: figure1,
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, how is the earliest start (ES) of an activity determined during the forward pass when the activity has two or more immediate predecessors?',
      options: [
        { text: 'It equals the smallest earliest finish among its immediate predecessors.', why: 'Starting at the smallest EF would begin the activity before its slower predecessors have finished.' },
        { text: 'It equals the largest earliest finish among its immediate predecessors.', correct: true, why: 'All immediate predecessors must finish before the activity can start, so the last one to finish sets ES.' },
        { text: 'It equals the sum of the earliest finishes of all its immediate predecessors.', why: 'Predecessors run on separate incoming branches; their finish times are compared by taking the maximum, not added.' },
        { text: 'It equals the smallest latest start among its immediate successors.', why: 'Taking the smallest LS of successors is the backward-pass rule for latest finish (LF), not ES.' },
      ],
      explanation: 'Under finish-to-start dependencies, an activity cannot begin until every immediate predecessor has finished. Its earliest start ES is therefore the largest earliest finish EF among its immediate predecessors.',
    },
    {
      type: 'F', level: 1,
      stem: 'In the project shown in Table 1 and Figure 1, what is the earliest finish (EF) of Activity D?',
      options: numericOptions(
        { value: efD, why: `Activity D waits for both A (EF = ${act('A').ef}) and B (EF = ${act('B').ef}), so ES = ${act('D').es} and EF = ${act('D').es} + ${act('D').d} = ${efD} days.` },
        [
          { value: wrong2DurOnly, why: `This is Activity D's own duration of ${act('D').d} days, omitting the time needed for predecessors A and B.` },
          { value: wrong2MinPred, why: `This uses Activity A's finish (${act('A').ef} days) instead of waiting for slower predecessor B (${act('B').ef} days).` },
          { value: wrong2SumPreds, why: `This adds the durations of A and B (${act('A').d} + ${act('B').d}) as if A and B ran one after the other instead of in parallel.` },
        ],
        days,
      ),
      explanation: `Activities A and B both start at day 0, so EF_A = ${act('A').ef} and EF_B = ${act('B').ef}. Activity D depends on both, giving ES_D = max(${act('A').ef}, ${act('B').ef}) = ${act('D').es} and EF_D = ${act('D').es} + ${act('D').d} = ${days(efD)}.`,
    },
    {
      type: 'A', level: 2,
      stem: 'What is the minimum completion time of the entire project in Table 1?',
      options: numericOptions(
        { value: projectDuration, why: `The longest path is B → D → F: ${act('B').d} + ${act('D').d} + ${act('F').d} = ${projectDuration} days.` },
        [
          { value: pathBEF, why: `This is the duration of path B → E → F (${act('B').d} + ${act('E').d} + ${act('F').d}), while F must also wait for D.` },
          { value: pathADF, why: `This is the duration of path A → D → F (${act('A').d} + ${act('D').d} + ${act('F').d}), overlooking that D must wait for B.` },
          { value: sumAllDurations, why: 'This adds all six durations together, ignoring that parallel branches run at the same time.' },
        ],
        days,
      ),
      explanation: `Check the four paths from start to finish: A → C → F takes ${act('A').d} + ${act('C').d} + ${act('F').d} = ${pathACF} days; B → E → F takes ${act('B').d} + ${act('E').d} + ${act('F').d} = ${pathBEF} days; A → D → F takes ${act('A').d} + ${act('D').d} + ${act('F').d} = ${pathADF} days; and B → D → F takes ${act('B').d} + ${act('D').d} + ${act('F').d} = ${days(projectDuration)}. The longest path sets the earliest completion of the whole project: ${days(projectDuration)}.`,
    },
    {
      type: 'A', level: 3,
      stem: 'Assuming the project in Table 1 is scheduled to finish in its minimum completion time, what is the slack (float) of Activity A?',
      options: numericOptions(
        { value: slackA, why: `Activity A precedes both C (LS = ${act('C').ls}) and D (LS = ${act('D').ls}), so LF_A = min(${act('C').ls}, ${act('D').ls}) = ${act('A').lf}, LS_A = ${act('A').lf} − ${act('A').d} = ${act('A').ls}, and slack = ${slackA} days.` },
        [
          { value: wrong4DurA, why: `This is Activity A's duration (${act('A').d} days), not its slack LS − ES.` },
          { value: wrong4OnlyPathC, why: `This considers only successor C (LS = ${act('C').ls}), overlooking that A also precedes D (LS = ${act('D').ls}).` },
          { value: wrong4LfAsSlack, why: `This takes LF_A = ${act('A').lf} days as the slack without subtracting EF_A = ${act('A').ef} days.` },
        ],
        days,
      ),
      explanation: `From the backward pass, F has LF = ${act('F').lf} and LS = ${act('F').ls}. Thus C has LF = ${act('C').lf} and LS = ${act('C').lf} − ${act('C').d} = ${act('C').ls}, while D has LF = ${act('D').lf} and LS = ${act('D').lf} − ${act('D').d} = ${act('D').ls}. Because A precedes both C and D, LF_A = min(${act('C').ls}, ${act('D').ls}) = ${act('A').lf}. Subtracting EF_A = ${act('A').ef} gives LF_A − EF_A = ${act('A').lf} − ${act('A').ef} = ${days(slackA)}.`,
    },
    {
      type: 'D', level: 2,
      stem: `While the project in Table 1 is running, Activity E begins at its earliest start time and takes ${eDelayedDur} days instead of its planned ${act('E').d} days. Every other activity runs as planned. What is the effect on the schedule?`,
      options: [
        { text: `The project completion time does not change, while Activity E’s slack falls by ${eDelay} days.`, correct: true, why: `Activity E had ${act('E').slack} days of slack (EF = ${act('E').ef}, LF = ${act('E').lf}); taking ${eDelay} extra days finishes on day ${act('E').es + eDelayedDur}, still ahead of LF = ${act('E').lf}.` },
        { text: `The project completion time increases by ${eDelay} days, because Activity E feeds directly into Activity F.`, why: `Activity F already waits until day ${act('F').es} for Activity D, so Activity E finishing on day ${act('E').es + eDelayedDur} does not delay F.` },
        { text: 'The project completion time increases by 1 day, because Activity E exceeds its slack by 1 day.', why: `Activity E starts on day ${act('E').es} and has LF = ${act('E').lf}, giving ${act('E').slack} days of slack, which absorbs a ${eDelay}-day extension with 1 day to spare.` },
        { text: 'The project completion time does not change, and Activity E’s slack stays the same as planned.', why: `Increasing Activity E’s duration by ${eDelay} days raises EF_E by ${eDelay} days while LF_E stays at ${act('E').lf}, reducing its slack by ${eDelay} days.` },
      ],
      explanation: `Activity E starts after B at ES_E = ${act('E').es}, so its planned EF_E is ${act('E').ef} while Activity F starts at ES_F = ${act('F').es} (waiting for D). That gives E a planned slack of ${act('E').lf} − ${act('E').ef} = ${act('E').slack} days. Taking ${eDelayedDur} days moves EF_E to ${act('E').es + eDelayedDur}, which leaves the project completion time unchanged and reduces E's slack by ${eDelay} days to ${act('E').slack - eDelay} day.`,
    },
    {
      type: 'T', level: 3,
      stem: `In a separate four-activity project with finish-to-start dependencies, Activity P (${q6BeforeSpec[0].d} days) has no predecessors and precedes both Activity Q (${q6BeforeSpec[1].d} days) and Activity R (${q6BeforeSpec[2].d} days). Activity S (${q6BeforeSpec[3].d} days) depends on both Q and R. If extra staff cut Activity Q’s duration by ${cutQ} days while P, R and S keep their durations, what is the new minimum completion time of this project?`,
      options: numericOptions(
        { value: ans6, why: `Path P → Q → S drops from ${q6Before.projectDuration} to ${wrong6OldPathOnly} days, so path P → R → S (${q6BeforeSpec[0].d} + ${q6BeforeSpec[2].d} + ${q6BeforeSpec[3].d} = ${ans6} days) becomes the new critical path.` },
        [
          { value: wrong6OldPathOnly, why: `This subtracts all ${cutQ} saved days from ${q6Before.projectDuration} days, overlooking that S must still wait for R to finish on day ${q6BeforeSpec[0].d + q6BeforeSpec[2].d}.` },
          { value: wrong6Unchanged, why: `This is the original completion time before Activity Q on the critical path was shortened.` },
          { value: wrong6SumAfter, why: 'This adds the durations of all four activities together, ignoring that Q and R run in parallel after P.' },
        ],
        days,
      ),
      explanation: `Originally P → Q → S took ${q6BeforeSpec[0].d} + ${q6BeforeSpec[1].d} + ${q6BeforeSpec[3].d} = ${q6Before.projectDuration} days and P → R → S took ${q6BeforeSpec[0].d} + ${q6BeforeSpec[2].d} + ${q6BeforeSpec[3].d} = ${ans6} days. Cutting Q by ${cutQ} days lowers P → Q → S to ${q6BeforeSpec[0].d} + ${q6BeforeSpec[1].d - cutQ} + ${q6BeforeSpec[3].d} = ${wrong6OldPathOnly} days, which is now shorter than P → R → S. Path P → R → S therefore becomes critical, setting the new minimum completion time to ${days(ans6)}.`,
    },
    {
      type: 'S', level: 2,
      stem: 'In any project network scheduled by the critical path method with finish-to-start dependencies, which statement is always true?',
      options: [
        { text: 'Every project network has one and only one critical path from start to finish.', why: 'Two or more paths can tie for the longest total duration, giving the project multiple critical paths.' },
        { text: 'Shortening the duration of any single activity always reduces the minimum completion time of the project.', why: 'Shortening an activity that is not on a critical path only increases its slack without shortening the longest path.' },
        { text: 'The single activity with the largest duration in the project must lie on a critical path.', why: 'An 8-day activity running from start to finish in parallel with two sequential 5-day activities (10 days total) is not on the critical path and has 2 days of slack.' },
        { text: 'For every activity in the project, latest finish minus earliest finish equals latest start minus earliest start.', correct: true, why: 'Because EF = ES + d and LF = LS + d, the difference LF − EF equals (LS + d) − (ES + d) = LS − ES.' },
      ],
      explanation: 'For every activity of duration d, EF = ES + d and LS = LF − d (so LF = LS + d). Subtracting EF from LF cancels d and yields LS − ES, which is why slack can be computed either from start times or from finish times.',
    },
  ],
};
