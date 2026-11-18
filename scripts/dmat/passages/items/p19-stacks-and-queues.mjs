// Full mock 2, passage 2. Area: computational sciences. Subject: stacks (LIFO) and queues (FIFO).
import { numericOptions, p, whole } from '../lib.mjs';

// ---------- Stack and Queue implementations: every trace and answer below is executed in code ----------
function makeStack(initial = []) {
  const items = [...initial]; // bottom to top
  return {
    push: (x) => { items.push(x); },
    pop: () => { if (!items.length) throw new Error('stack underflow'); return items.pop(); },
    peek: () => { if (!items.length) throw new Error('stack empty'); return items[items.length - 1]; },
    snapshot: () => [...items],
  };
}

function makeQueue(initial = []) {
  const items = [...initial]; // front to back
  return {
    enqueue: (x) => { items.push(x); },
    dequeue: () => { if (!items.length) throw new Error('queue underflow'); return items.shift(); },
    front: () => { if (!items.length) throw new Error('queue empty'); return items[0]; },
    snapshot: () => [...items],
  };
}

const fmtList = (xs) => (xs.length ? xs.join(', ') : 'empty');

// ---------- Table 1: same six actions applied to empty Stack S and empty Queue Q ----------
const stepsSpec = [
  { op: 'add', val: 'K' },
  { op: 'add', val: 'M' },
  { op: 'add', val: 'P' },
  { op: 'remove' },
  { op: 'add', val: 'R' },
  { op: 'remove' },
];

const tStack = makeStack();
const tQueue = makeQueue();
const tableRows = stepsSpec.map((step, i) => {
  if (step.op === 'add') {
    tStack.push(step.val);
    tQueue.enqueue(step.val);
    return [`${i + 1}`, `Add ${step.val}`, '— / —', fmtList(tStack.snapshot()), fmtList(tQueue.snapshot())];
  }
  const outS = tStack.pop();
  const outQ = tQueue.dequeue();
  return [`${i + 1}`, 'Remove one', `${outS} / ${outQ}`, fmtList(tStack.snapshot()), fmtList(tQueue.snapshot())];
});

// Question 2: one further removal after Step 6.
const afterS = tStack.snapshot(); // bottom to top
const afterQ = tQueue.snapshot(); // front to back
const nextPopS = afterS[afterS.length - 1];
const bottomS = afterS[0];
const nextDeqQ = afterQ[0];
const backQ = afterQ[afterQ.length - 1];
if (new Set([nextPopS, bottomS, nextDeqQ, backQ]).size !== 4) {
  throw new Error('question 2 needs all four end items after Step 6 to be distinct');
}

// Question 3: trace an 8-step sequence on an empty stack.
const ops3 = [
  ['push', 4], ['push', 7], ['push', 2], ['pop'],
  ['push', 9], ['pop'], ['pop'], ['push', 5],
];
function runOpsAsStack(ops) {
  const s = makeStack();
  const out = [];
  for (const [kind, v] of ops) {
    if (kind === 'push') s.push(v);
    else out.push(s.pop());
  }
  return out;
}
function runOpsAsQueue(ops) {
  const q = makeQueue();
  const out = [];
  for (const [kind, v] of ops) {
    if (kind === 'push') q.enqueue(v);
    else out.push(q.dequeue());
  }
  return out;
}
function runAllPushesBeforePops(ops) {
  const s = makeStack();
  let pops = 0;
  for (const [kind, v] of ops) {
    if (kind === 'push') s.push(v);
    else pops++;
  }
  return Array.from({ length: pops }, () => s.pop());
}
const trace3Right = runOpsAsStack(ops3);
const trace3Fifo = runOpsAsQueue(ops3);
const trace3Batch = [9, 2, 7]; // pushing 4, 7, 2, 9 before popping three
const sBatchCheck = makeStack([4, 7, 2, 9]);
if (fmtList([sBatchCheck.pop(), sBatchCheck.pop(), sBatchCheck.pop()]) !== fmtList(trace3Batch)) {
  throw new Error('question 3 batch distractor mismatch');
}
const trace3BottomLast = [trace3Right[0], trace3Right[1], 4]; // taking bottom item on third pop
if (new Set([trace3Right, trace3Fifo, trace3Batch, trace3BottomLast].map(fmtList)).size !== 4) {
  throw new Error('question 3 options must all be distinct');
}
void runAllPushesBeforePops;

// Question 5: server task queue during a busy minute.
const q5 = { start: 8, normEnq: 12, deq: 15 };
const busyEnq = 2 * q5.normEnq;
const endNorm = q5.start + q5.normEnq - q5.deq;
const endBusy = q5.start + busyEnq - q5.deq;
const busyIgnoreStart = busyEnq - q5.deq;
const busyIgnoreDeq = q5.start + busyEnq;
if ([endNorm, endBusy, busyIgnoreStart, busyIgnoreDeq].some((v) => [q5.start, q5.normEnq, q5.deq, busyEnq].includes(v))) {
  throw new Error('question 5 options must not equal a raw input from the stem');
}

// Question 6: transfer between Queue Q = [1, 2, 3, 4] and empty Stack S.
function runTransfer({ popAllAtStep3 = false, drainBottomUp = false, stackIsFifo = false } = {}) {
  const q = makeQueue([1, 2, 3, 4]);
  const s = stackIsFifo ? makeQueue() : makeStack();
  const putS = (x) => (stackIsFifo ? s.enqueue(x) : s.push(x));
  const takeS = () => (stackIsFifo ? s.dequeue() : s.pop());

  // Step a: dequeue two items from Q and push each onto S.
  putS(q.dequeue());
  putS(q.dequeue());
  // Step b: pop one item (or mistakenly both) from S and enqueue onto Q.
  q.enqueue(takeS());
  if (popAllAtStep3) q.enqueue(takeS());
  // Step c: dequeue two items from Q and push each onto S.
  putS(q.dequeue());
  putS(q.dequeue());
  // Step d: pop all remaining items from S and enqueue onto Q.
  if (drainBottomUp) {
    for (const x of s.snapshot()) q.enqueue(x);
  } else {
    while (s.snapshot().length) q.enqueue(takeS());
  }
  return q.snapshot();
}
const transRight = runTransfer();
const transBothStep3 = runTransfer({ popAllAtStep3: true });
const transBottomUp = runTransfer({ drainBottomUp: true });
const transFifo = runTransfer({ stackIsFifo: true });
if (new Set([transRight, transBothStep3, transBottomUp, transFifo].map(fmtList)).size !== 4) {
  throw new Error('question 6 transfer sequences must all be distinct');
}

// Question 7: enumerate all valid push/pop output orders of [1, 2, 3].
const input7 = [1, 2, 3];
const stackOrders = new Set();
function exploreStack(nextIdx, stack, out) {
  if (out.length === input7.length) {
    stackOrders.add(fmtList(out));
    return;
  }
  if (nextIdx < input7.length) {
    exploreStack(nextIdx + 1, [...stack, input7[nextIdx]], out);
  }
  if (stack.length > 0) {
    exploreStack(nextIdx, stack.slice(0, -1), [...out, stack[stack.length - 1]]);
  }
}
exploreStack(0, [], []);
const allPerms3 = [
  [1, 2, 3], [1, 3, 2], [2, 1, 3],
  [2, 3, 1], [3, 1, 2], [3, 2, 1],
].map(fmtList);
const missingOrders = allPerms3.filter((ord) => !stackOrders.has(ord));
if (stackOrders.size !== 5 || missingOrders.length !== 1 || missingOrders[0] !== '3, 1, 2') {
  throw new Error('question 7 stack-sortable check failed');
}

export default {
  id: 'p19',
  set: 'mock',
  mock: 2,
  area: 'computational sciences',
  title: 'Stacks and Queues',
  facts: [
    { claim: 'A stack is a linear collection in which additions (push) and removals (pop) take place at one end only, the top, following last in, first out (LIFO); peek reads the top element without removing it.', source: 'https://en.wikipedia.org/wiki/Stack_(abstract_data_type)', read: '2026-11-18' },
    { claim: 'Pushing a sequence of items onto a stack and popping them all reverses their order; stacks support undo history and nested call management.', source: 'https://en.wikipedia.org/wiki/Stack_(abstract_data_type)', read: '2026-11-18' },
    { claim: 'Five of the six permutations of three elements pass through a single stack (Catalan number C₃ = 5): 2, 3, 1 cannot be sorted into 1, 2, 3, and equivalently input 1, 2, 3 can produce every output order except 3, 1, 2, as verified by exhaustive search in this file.', source: 'https://en.wikipedia.org/wiki/Stack-sortable_permutation', read: '2026-11-18' },
    { claim: 'A queue adds elements at the back (enqueue) and removes them from the front (dequeue), following first in, first out (FIFO); front reads the next element to be removed without removing it.', source: 'https://en.wikipedia.org/wiki/Queue_(abstract_data_type)', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'Many computing tasks hold items in sequence and restrict which item may be taken out next.',
      'Two standard data structures enforce opposite rules: the stack and the queue.',
      'Both store items in the order they arrive, yet they differ in where items leave.',
    ),
    p(
      'A stack allows additions and removals at one end only, called the top, like a pile of trays.',
      'The operation push(x) places item x on the top, pop() removes and returns the item currently at the top, and peek() reads that top item without removing it.',
      'Because the most recently added item is always the first to leave, a stack follows the rule last in, first out (LIFO).',
      'If several items are pushed onto an empty stack and then all popped, they come out in exact reverse order.',
      'Editors use a stack for "undo" steps, where the latest action must be undone first.',
    ),
    p(
      'A queue separates the two ends, like people waiting at a ticket window.',
      'The operation enqueue(x) adds item x at the back, dequeue() removes and returns the item at the front, and front() reads that front item without removing it.',
      'Because the earliest item still waiting is the first to leave, a queue follows first in, first out (FIFO) and keeps arrival order intact.',
      'Print jobs and incoming network requests wait in queues so each is handled in turn.',
    ),
    {
      type: 'table',
      caption: 'Table 1. Six steps applied to an initially empty stack S and an initially empty queue Q.',
      head: ['Step', 'Action', 'Returned (S / Q)', 'Stack S (bottom to top)', 'Queue Q (front to back)'],
      rows: tableRows,
    },
    p(
      'Table 1 traces the same six arrivals and removals on an empty stack S and an empty queue Q.',
      'Notice that in Stack S the rightmost item listed is the top, whereas in Queue Q the leftmost item listed is the front.',
      'Attempting to remove an item when a stack or queue is empty is an error called underflow.',
      'Whenever no underflow occurs, starting with s₀ items and carrying out a additions and r removals leaves a predictable count in either structure:',
    ),
    { type: 'formula', text: 'items held = s₀ + a − r' },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what does the peek() operation do on a non-empty stack?',
      options: [
        { text: 'It removes and returns the item at the bottom of the stack.', why: 'A stack allows access only at the top, and peek() removes nothing.' },
        { text: 'It removes and returns the item at the top of the stack.', why: 'Removing and returning the top item is pop(); peek() leaves the stack unchanged.' },
        { text: 'It places a duplicate of the top item onto the top of the stack.', why: 'Adding an item to the top is push(); peek() only inspects the top item.' },
        { text: 'It reads the item at the top of the stack without removing it.', correct: true, why: 'The second paragraph defines peek() as reading the top item without removing it.' },
      ],
      explanation: 'The second paragraph states that pop() removes and returns the top item, whereas peek() reads that top item without removing it.',
    },
    {
      type: 'F', level: 1,
      stem: 'Immediately after Step 6 of Table 1, one further removal is carried out on Stack S (pop) and one on Queue Q (dequeue). Which items are returned?',
      options: [
        { text: `${nextPopS} from S, and ${nextDeqQ} from Q.`, correct: true, why: `After Step 6, S holds ${fmtList(afterS)} (top ${nextPopS}) and Q holds ${fmtList(afterQ)} (front ${nextDeqQ}).` },
        { text: `${bottomS} from S, and ${nextDeqQ} from Q.`, why: `${nextDeqQ} is at the front of Q, but ${bottomS} sits at the bottom of S; pop() removes ${nextPopS} from the top.` },
        { text: `${nextPopS} from S, and ${backQ} from Q.`, why: `${nextPopS} is at the top of S, but ${backQ} sits at the back of Q; dequeue() removes ${nextDeqQ} from the front.` },
        { text: `${bottomS} from S, and ${backQ} from Q.`, why: 'This reads the wrong end of both structures: the bottom of S and the back of Q.' },
      ],
      explanation: `In Table 1, Step 6 leaves Stack S as ${fmtList(afterS)} from bottom to top, so its top item is ${nextPopS}. It leaves Queue Q as ${fmtList(afterQ)} from front to back, so its front item is ${nextDeqQ}.`,
    },
    {
      type: 'A', level: 2,
      stem: 'An empty stack S executes these eight operations in order: push(4), push(7), push(2), pop(), push(9), pop(), pop(), push(5). Which three numbers do the pop() operations return, in the order they are popped?',
      options: [
        { text: fmtList(trace3Fifo), why: 'This removes items in arrival order (FIFO), as a queue would, instead of from the top of the stack.' },
        { text: fmtList(trace3Right), correct: true, why: 'First pop removes 2 (leaving 4, 7); push(9) makes the stack 4, 7, 9; the next two pops remove 9 and then 7.' },
        { text: fmtList(trace3Batch), why: 'This pushes 4, 7, 2 and 9 before performing any pop, ignoring that 2 is popped before 9 is pushed.' },
        { text: fmtList(trace3BottomLast), why: 'The first two pops (2, then 9) are right, but the third pop takes 4 from the bottom instead of 7 from the top.' },
      ],
      explanation: `After push(4), push(7), push(2), the stack from bottom to top is 4, 7, 2, so the first pop returns ${trace3Right[0]}. Pushing 9 gives 4, 7, 9; the second pop returns ${trace3Right[1]} and the third returns ${trace3Right[2]}, before push(5) leaves 4, 5.`,
    },
    {
      type: 'C', level: 2,
      stem: 'A web browser has a "Back" button: whenever the user opens a new page, the address of the page just left is saved, and pressing "Back" returns to the page left most recently, then to the one before that on the next press. Which structure and operations match this behaviour?',
      options: [
        { text: 'A queue: enqueue each page left, and dequeue when "Back" is pressed.', why: 'A queue is FIFO, so pressing "Back" would jump to the oldest page from the start of the session.' },
        { text: 'A queue: enqueue each page left, and call front() when "Back" is pressed.', why: 'front() both reads the oldest page rather than the latest and leaves it in place on repeated presses.' },
        { text: 'A stack: push each page left, and call peek() when "Back" is pressed.', why: 'peek() does not remove the top address, so pressing "Back" again would stay on the same page.' },
        { text: 'A stack: push each page left, and pop when "Back" is pressed.', correct: true, why: 'Returning to the most recently left page requires LIFO, and popping exposes the earlier page underneath for the next press.' },
      ],
      explanation: 'Stepping backwards through visited pages reverses the order in which they were left (LIFO), which is a stack. Each "Back" press must also remove that top address with pop() so the next press reaches the page beneath it.',
    },
    {
      type: 'D', level: 2,
      stem: `A server's task queue begins a minute holding ${q5.start} tasks. In a normal minute, ${q5.normEnq} tasks are enqueued and ${q5.deq} are dequeued. In a busy minute starting from the same ${q5.start} tasks, twice as many tasks are enqueued as in a normal minute while ${q5.deq} are still dequeued, and the queue never becomes empty. How many tasks are in the queue at the end of the busy minute?`,
      options: numericOptions(
        { value: endBusy, why: `${q5.start} + 2 × ${q5.normEnq} − ${q5.deq} = ${q5.start} + ${busyEnq} − ${q5.deq} = ${endBusy}.` },
        [
          { value: endNorm, why: `This uses the normal ${q5.normEnq} arrivals (${q5.start} + ${q5.normEnq} − ${q5.deq}) without doubling them.` },
          { value: busyIgnoreStart, why: `This calculates ${busyEnq} − ${q5.deq} and forgets the ${q5.start} tasks already waiting at the start.` },
          { value: busyIgnoreDeq, why: `This adds ${q5.start} + ${busyEnq} without subtracting the ${q5.deq} tasks dequeued.` },
        ],
        whole,
      ),
      explanation: `Doubling the normal arrivals gives 2 × ${q5.normEnq} = ${busyEnq} tasks enqueued. Using items held = s₀ + a − r gives ${q5.start} + ${busyEnq} − ${q5.deq} = ${endBusy} tasks.`,
    },
    {
      type: 'T', level: 3,
      stem: 'Queue Q initially holds 1, 2, 3, 4 from front to back, and Stack S is empty. First, two items are dequeued from Q one by one and pushed onto S. Second, one item is popped from S and enqueued onto Q. Third, two items are dequeued from Q one by one and pushed onto S. Finally, all items in S are popped one by one and enqueued onto Q. In what order do the four items now sit in Q from front to back?',
      options: [
        { text: fmtList(transRight), correct: true, why: 'After step 1: S = 1, 2 and Q = 3, 4. Step 2 moves 2 to Q (3, 4, 2). Step 3 pushes 3, 4 onto S (1, 3, 4), leaving Q = 2. Step 4 pops 4, 3, 1 onto Q.' },
        { text: fmtList(transBothStep3), why: 'This pops both 2 and 1 in the second step instead of popping only one item.' },
        { text: fmtList(transBottomUp), why: 'In the final step this drains S = 1, 3, 4 from bottom to top instead of popping 4, 3, 1 from the top.' },
        { text: fmtList(transFifo), why: 'This treats S as a second FIFO queue rather than a LIFO stack.' },
      ],
      explanation: `Trace both structures step by step (writing S bottom to top and Q front to back). Start: Q = 1, 2, 3, 4; S = empty. Step 1: S = 1, 2; Q = 3, 4. Step 2: pop 2 from S and enqueue onto Q, giving S = 1; Q = 3, 4, 2. Step 3: dequeue 3 then 4 onto S, giving S = 1, 3, 4; Q = 2. Step 4: pop 4, then 3, then 1 onto Q, giving Q = ${fmtList(transRight)}.`,
    },
    {
      type: 'S', level: 3,
      stem: 'The numbers 1, 2, 3 arrive in that fixed order at an initially empty structure. Removals may be carried out at any point between arrivals and after the last arrival until all three numbers have left. Which statement about the possible output orders of the three removed numbers is correct?',
      options: [
        { text: 'With a stack, all six orders of 1, 2, 3 can be produced by choosing when to pop.', why: 'The order 3, 1, 2 is impossible: outputting 3 first requires pushing 1, 2 and 3 first, leaving 2 above 1.' },
        { text: 'With a stack, five of the six orders of 1, 2, 3 can be produced, and only 3, 1, 2 is impossible.', correct: true, why: 'Popping 3 first forces 1, 2, 3 onto the stack before any pop, trapping 1 under 2 so 2 must leave before 1; the other five orders work.' },
        { text: 'With a queue, choosing when to dequeue can produce both 1, 2, 3 and 3, 2, 1.', why: 'A queue is always FIFO: changing when dequeue runs never alters the output order 1, 2, 3.' },
        { text: 'With a stack, only 1, 2, 3 and 3, 2, 1 can be produced.', why: 'Interleaving pushes and pops produces five orders; for instance, push 1, pop 1, push 2, push 3, pop 3, pop 2 outputs 1, 3, 2.' },
      ],
      explanation: 'For 3 to be the first number popped from a stack, 1, 2 and 3 must all be pushed before any pop occurs. At that moment the stack from bottom to top is 1, 2, 3, so after 3 is popped, 2 sits on top of 1 and must leave before 1, giving 3, 2, 1 and ruling out 3, 1, 2. Every other order (1, 2, 3; 1, 3, 2; 2, 1, 3; 2, 3, 1; 3, 2, 1) can be achieved.',
    },
  ],
};
