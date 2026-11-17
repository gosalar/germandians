// Full mock, passage 2. Area: computational sciences. Subject: linear and binary search.
import { numericOptions, p } from '../lib.mjs';

const whole = (x) => x.toLocaleString('en-GB');

// ---------- the two methods, run in code so every count below is measured, not typed ----------

/** Linear search: the items checked, in order, until `target` is found or the list ends. */
function linearChecks(list, target) {
  const checked = [];
  for (const item of list) {
    checked.push(item);
    if (item === target) break;
  }
  return checked;
}

/** Binary search as the passage describes it: the middle item, the lower of two middles. */
function binaryChecks(list, target) {
  const checked = [];
  let lo = 0;
  let hi = list.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    checked.push(list[mid]);
    if (list[mid] === target) break;
    if (list[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return checked;
}

/** The same search taking the upper of two middle items: a common slip. */
function binaryChecksUpperMiddle(list, target) {
  const checked = [];
  let lo = 0;
  let hi = list.length - 1;
  while (lo <= hi) {
    const mid = lo + Math.ceil((hi - lo) / 2);
    checked.push(list[mid]);
    if (list[mid] === target) break;
    if (list[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return checked;
}

/** Most items that can still be left after one unsuccessful check of a part with n items. */
const leftAfterCheck = (n) => { const below = Math.floor((n - 1) / 2); return Math.max(below, n - 1 - below); };
/** Most checks binary search can need on n items. */
const mostBinaryChecks = (n) => (n === 0 ? 0 : 1 + mostBinaryChecks(leftAfterCheck(n)));
// The count must agree with the published formula floor(log2 n) + 1.
for (const n of [1, 2, 3, 15, 16, 1000, 2000, 1_000_000]) {
  if (mostBinaryChecks(n) !== Math.floor(Math.log2(n)) + 1) throw new Error(`worst case for ${n} disagrees with the formula`);
}

// Table 1
const sizes = [15, 500, 1000, 1_000_000];
const thousand = 1000;
const table = sizes.map((n) => [whole(n), whole(n), whole(mostBinaryChecks(n))]);
const big = 1_000_000;
if (!sizes.includes(thousand) || !sizes.includes(thousand / 2) || !sizes.includes(big)) throw new Error('Table 1 needs the rows the text and questions use');

// Question 3: a search to trace.
const traceList = [3, 8, 12, 17, 21, 26, 30, 34, 39, 45, 51];
const traceTarget = 34;
const trace = binaryChecks(traceList, traceTarget);
const traceUpper = binaryChecksUpperMiddle(traceList, traceTarget);
const traceLinear = linearChecks(traceList, traceTarget);
const traceFromMiddle = linearChecks(traceList.slice(traceList.indexOf(trace[0])), traceTarget);
const seq = (xs) => xs.join(', ');
if (new Set([trace, traceUpper, traceLinear, traceFromMiddle].map(seq)).size !== 4) throw new Error('trace options are not all different');

// Question 4: a list twice as long as one in the table.
const doubled = 2 * thousand;

// Question 5: what is left after three unsuccessful checks.
const startSize = 64;
const unsuccessful = 3;
let left = startSize;
const leftSteps = [];
for (let i = 0; i < unsuccessful; i++) { left = leftAfterCheck(left); leftSteps.push(left); }

// Question 7: when sorting first pays off.
const listSize = thousand;
const sortCost = 10_000;
const linearEach = listSize;
const binaryEach = mostBinaryChecks(listSize);
let payOff = 1;
while (payOff * linearEach <= sortCost + payOff * binaryEach) payOff++;
const payOffIgnoringBinary = sortCost / linearEach;
if (!Number.isInteger(payOffIgnoringBinary) || payOffIgnoringBinary === payOff) throw new Error('question 7 needs different numbers');

export default {
  id: 'p02',
  set: 'mock',
  area: 'computational sciences',
  title: 'Searching a List',
  facts: [
    { claim: 'Linear search checks each element of the list in turn until a match is found or the whole list has been searched.', source: 'https://en.wikipedia.org/wiki/Linear_search', read: '2026-11-16' },
    { claim: 'For a list of n items, linear search needs one comparison in the best case and n in the worst case.', source: 'https://en.wikipedia.org/wiki/Linear_search', read: '2026-11-16' },
    { claim: 'Binary search works on a sorted array: it compares the target with the middle element and continues in the half that can still hold the target.', source: 'https://en.wikipedia.org/wiki/Binary_search', read: '2026-11-16' },
    { claim: 'The middle position is L plus the floor of (R − L) ÷ 2, which is the lower of two middle elements.', source: 'https://en.wikipedia.org/wiki/Binary_search', read: '2026-11-16' },
    { claim: 'In the worst case binary search makes floor(log2 n) + 1 iterations: 10 for 1,000 elements and 20 for 1,000,000. The code in this file measures the same counts.', source: 'https://en.wikipedia.org/wiki/Binary_search', read: '2026-11-16' },
    { claim: 'The array must be sorted before binary search can be applied; binary search is faster than linear search except for small arrays.', source: 'https://en.wikipedia.org/wiki/Binary_search', read: '2026-11-16' },
  ],
  blocks: [
    p(
      'Computers spend much of their time looking things up: a name in a customer file, a word in a dictionary, a product in a catalogue.',
      'How long a search takes depends on the method and on the length of the list.',
      'To compare methods, we count checks.',
      'One check compares the wanted item with one item of the list.',
    ),
    p(
      'Linear search is the simplest method.',
      'It checks the items one after another from the start of the list until it finds the wanted item or reaches the end.',
      'It works on any list, in any order.',
      'On a list of n items it needs one check if the wanted item comes first, and n checks if the item comes last or is not in the list at all.',
    ),
    p(
      'Binary search is usually much faster on long lists, but it only works on a sorted list, here one that runs from the smallest item to the largest, in which the computer can go straight to any position.',
      'It checks the item in the middle.',
      'If that is the wanted item, the search is over.',
      'If the wanted item is smaller, it can only lie in the lower half, so the upper half is dropped together with the item just checked; if it is larger, the lower half and the checked item are dropped.',
      'The search then repeats on the part that is left, until the item is found or nothing is left.',
      'Where a part has two middle items, the lower one is checked.',
      'After each unsuccessful check, at most half of the items are still left.',
    ),
    {
      type: 'table',
      caption: 'Table 1. The largest number of checks each method can need.',
      head: ['Items in the list', 'Linear search', 'Binary search'],
      rows: table,
    },
    p(
      'Table 1 shows what this means for long lists.',
      `Compare the rows for ${whole(thousand / 2)} and ${whole(thousand)} items: when a list becomes twice as long, the largest number of checks doubles for linear search, but grows by only one for binary search.`,
    ),
    p(
      'This speed has a price.',
      'A list must be sorted before binary search can be used, and sorting takes work.',
      'A sorted list must also be kept in order whenever items are added.',
      'For a short list, or for an unsorted list that is searched only once, linear search can therefore be the better choice.',
    ),
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'What does binary search need that linear search does not?',
      options: [
        { text: 'A list with an odd number of items.', why: 'Binary search also works on a list with an even number of items: it then checks the lower of the two middle items.' },
        { text: 'A list that is sorted.', correct: true, why: 'Dropping half the list is only safe if every item in that half is known to be smaller, or larger, than the item checked.' },
        { text: 'A list that contains the wanted item.', why: 'Both methods also work when the item is missing: the search ends when nothing is left to check.' },
        { text: 'A list that is short.', why: 'The longer the list, the greater the advantage of binary search, as Table 1 shows.' },
      ],
      explanation: 'The third paragraph says binary search only works on a sorted list. Linear search works on any list, in any order.',
    },
    {
      type: 'F', level: 1,
      stem: `A list has ${whole(big)} items. According to Table 1, how many times as many checks can linear search need as binary search?`,
      options: numericOptions(
        { value: big / mostBinaryChecks(big), why: `${whole(big)} ÷ ${mostBinaryChecks(big)}.` },
        [
          { value: mostBinaryChecks(big), why: 'This is the number of checks binary search needs, not how many times more linear search needs.' },
          { value: big - mostBinaryChecks(big), why: 'This is the difference between the two numbers. "How many times as many" asks for a division.' },
          { value: big / mostBinaryChecks(thousand), why: `This divides by ${mostBinaryChecks(thousand)}, the binary search figure for ${whole(thousand)} items, from the wrong row of the table.` },
        ],
        whole,
      ),
      explanation: `The last row of Table 1 gives ${whole(big)} checks for linear search and ${mostBinaryChecks(big)} for binary search. ${whole(big)} ÷ ${mostBinaryChecks(big)} = ${whole(big / mostBinaryChecks(big))}.`,
    },
    {
      type: 'A', level: 2,
      stem: `A sorted list holds these ${traceList.length} numbers: ${seq(traceList)}. Binary search looks for ${traceTarget}. Which numbers does it check, in this order?`,
      options: [
        { text: seq(traceFromMiddle), why: `After checking ${trace[0]}, this walks on item by item. Binary search jumps to the middle of the part that is left, which is ${trace[1]}.` },
        { text: seq(traceUpper), why: `The first two checks are right. Then two numbers are left, ${trace[2]} and ${trace[3]}, and the lower of two middle items is checked first.` },
        { text: seq(trace), correct: true, why: `Each check takes the middle of what is left: first of all ${traceList.length} numbers, then of the ${leftAfterTrace(1)} above ${trace[0]}, then of the ${leftAfterTrace(2)} below ${trace[1]}, then the one number left.` },
        { text: seq(traceLinear), why: 'This is linear search: it starts at the first number and checks every one.' },
      ],
      explanation: `The middle of the ${traceList.length} numbers is ${trace[0]}. ${traceTarget} is larger, so the search continues in ${seq(traceList.slice(traceList.indexOf(trace[0]) + 1))}, whose middle is ${trace[1]}. ${traceTarget} is smaller, so ${trace[2]} and ${trace[3]} are left. The lower of the two, ${trace[2]}, is checked; ${traceTarget} is larger, so ${trace[3]} is the only number left, and it is checked next.`,
    },
    {
      type: 'D', level: 2,
      stem: `A sorted list holds ${whole(doubled)} items. What is the largest number of checks binary search can need?`,
      options: numericOptions(
        { value: mostBinaryChecks(doubled), why: `The list is twice as long as one with ${whole(thousand)} items, so one check is added to ${mostBinaryChecks(thousand)}.` },
        [
          { value: mostBinaryChecks(thousand) + 2, why: 'This adds two checks. Doubling the list adds only one.' },
          { value: 2 * mostBinaryChecks(thousand), why: `This doubles the ${mostBinaryChecks(thousand)} checks. Doubling is what happens with linear search.` },
          { value: doubled / 2, why: 'This is half the list. Binary search does not check half the items; it drops half with each check.' },
        ],
        whole,
      ),
      explanation: `Table 1 gives ${mostBinaryChecks(thousand)} checks for ${whole(thousand)} items. A list twice as long needs one check more: ${mostBinaryChecks(doubled)}.`,
    },
    {
      type: 'A', level: 2,
      stem: `Binary search runs on a sorted list of ${startSize} items. Its first ${unsuccessful} checks are all unsuccessful. At most how many items can still be left to search?`,
      options: numericOptions(
        { value: left, why: `Each unsuccessful check leaves at most half: ${startSize} → ${leftSteps.join(' → ')}.` },
        [
          { value: leftSteps[1], why: `This is what can be left after two checks, not ${unsuccessful}.` },
          { value: leftSteps[0], why: 'This is what can be left after one check.' },
          { value: startSize - unsuccessful, why: `This removes one item per check, as linear search does: ${startSize} − ${unsuccessful}.` },
        ],
        whole,
      ),
      explanation: `After each unsuccessful check at most half of the items are still left. ${startSize} → ${leftSteps.join(' → ')}.`,
    },
    {
      type: 'C', level: 2,
      stem: 'In which of these situations is linear search the more sensible method?',
      options: [
        { text: 'A phone keeps 2,000 contacts in alphabetical order, and the owner looks up names many times a day.', why: 'The list is already sorted and searched often, which is where binary search pays off.' },
        { text: 'A clerk looks once for one invoice, by its number, in an archive of 50,000 invoices sorted by number.', why: 'The archive is searched only once, but it is already sorted, so binary search can be used straight away and needs far fewer checks.' },
        { text: 'A teacher looks once for one paper in an unsorted pile of 30 exam papers.', correct: true, why: 'The list is short and searched only once, so sorting it first would cost more than it saves.' },
        { text: 'A shop receives an unsorted list of a million article numbers and will look articles up in it thousands of times a day.', why: 'The list is unsorted, but it is long and searched very often, so sorting it once pays off many times over.' },
      ],
      explanation: 'The last paragraph names the cases: a short list, or an unsorted list searched only once. The pile of exam papers is short, unsorted and searched once. The invoice archive is searched once but is already sorted; the article list is unsorted but searched thousands of times.',
    },
    {
      type: 'T', level: 3,
      stem: `An unsorted list of ${whole(listSize)} items will be searched several times. Sorting it once costs as much work as ${whole(sortCost)} checks. Counting the largest number of checks each search can need, from which search onwards is sorting first and then using binary search less work in total than using linear search every time?`,
      options: [
        { text: 'From the 1st search.', why: `One linear search costs at most ${whole(linearEach)} checks. Sorting alone costs ${whole(sortCost)}.` },
        { text: `From the ${payOffIgnoringBinary}th search.`, why: `After ${payOffIgnoringBinary} searches linear search has cost ${whole(payOffIgnoringBinary * linearEach)} checks. Sorting plus ${payOffIgnoringBinary} binary searches costs ${whole(sortCost + payOffIgnoringBinary * binaryEach)}, which is still more.` },
        { text: `From the ${payOff}th search.`, correct: true, why: `After ${payOff} searches linear search has cost ${whole(payOff * linearEach)} checks, and sorting plus ${payOff} binary searches ${whole(sortCost + payOff * binaryEach)}.` },
        { text: 'Never.', why: `Each binary search saves ${whole(linearEach - binaryEach)} checks over a linear one, so the cost of sorting is recovered after enough searches.` },
      ],
      explanation: `Each linear search can need ${whole(linearEach)} checks, each binary search ${binaryEach} (Table 1). After k searches the totals are ${whole(linearEach)} × k and ${whole(sortCost)} + ${binaryEach} × k. For k = ${payOffIgnoringBinary}: ${whole(payOffIgnoringBinary * linearEach)} against ${whole(sortCost + payOffIgnoringBinary * binaryEach)}, so sorting has not yet paid off. For k = ${payOff}: ${whole(payOff * linearEach)} against ${whole(sortCost + payOff * binaryEach)}.`,
    },
  ],
};

/** How many numbers are still in play after the first k checks of the traced search. */
function leftAfterTrace(k) {
  let lo = 0;
  let hi = traceList.length - 1;
  for (let i = 0; i < k; i++) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (traceList[mid] < traceTarget) lo = mid + 1;
    else hi = mid - 1;
  }
  return hi - lo + 1;
}
