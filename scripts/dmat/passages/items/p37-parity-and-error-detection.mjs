// Full mock 4, passage 2. Area: computational sciences. Subject: parity bits and two-dimensional parity checks.
import { numericOptions, p, whole } from '../lib.mjs';

const onesCount = (bits) => bits.reduce((s, b) => s + b, 0);
const evenParityBit = (bits) => onesCount(bits) % 2;

function build2DEvenGrid(dataRows) {
  const r = dataRows.length;
  const c = dataRows[0].length;
  const withRowP = dataRows.map((row) => [...row, evenParityBit(row)]);
  const colParityRow = Array.from({ length: c + 1 }, (_, col) =>
    evenParityBit(withRowP.map((row) => row[col])),
  );
  return [...withRowP, colParityRow];
}

function failingLines(grid) {
  const badRows = [];
  const badCols = [];
  grid.forEach((row, i) => { if (onesCount(row) % 2 !== 0) badRows.push(i); });
  for (let j = 0; j < grid[0].length; j++) {
    if (onesCount(grid.map((row) => row[j])) % 2 !== 0) badCols.push(j);
  }
  return { badRows, badCols };
}

function cloneAndFlip(grid, coords) {
  const copy = grid.map((row) => [...row]);
  for (const [i, j] of coords) copy[i][j] = 1 - copy[i][j];
  return copy;
}

// ---------- Table 1: 3×4 data block sent with even parity, with one bit flipped at (Row 2, Column 3) ----------
const cleanData = [
  [1, 0, 1, 1],
  [0, 1, 0, 1],
  [1, 1, 0, 1],
];
const cleanGrid = build2DEvenGrid(cleanData);
if (failingLines(cleanGrid).badRows.length || failingLines(cleanGrid).badCols.length) {
  throw new Error('clean grid must pass every even-parity check');
}

// Exhaustively verify Q7 claims on this 4×5 grid:
// 1. Every single-bit flip (all 20 cells, including parity cells) uniquely flags its own (row, col).
const H = cleanGrid.length;
const W = cleanGrid[0].length;
for (let i = 0; i < H; i++) {
  for (let j = 0; j < W; j++) {
    const { badRows, badCols } = failingLines(cloneAndFlip(cleanGrid, [[i, j]]));
    if (badRows.length !== 1 || badCols.length !== 1 || badRows[0] !== i || badCols[0] !== j) {
      throw new Error(`single-bit flip at (${i},${j}) was not uniquely pinpointed`);
    }
  }
}
// 2. Every two-bit flip (all 190 pairs) causes at least two line checks to fail.
for (let a = 0; a < H * W; a++) {
  for (let b = a + 1; b < H * W; b++) {
    const p1 = [Math.floor(a / W), a % W];
    const p2 = [Math.floor(b / W), b % W];
    const { badRows, badCols } = failingLines(cloneAndFlip(cleanGrid, [p1, p2]));
    if (badRows.length + badCols.length === 0) throw new Error('a two-bit error went undetected');
  }
}
// 3. A 4-bit rectangle flip goes completely undetected.
const rectCheck = failingLines(cloneAndFlip(cleanGrid, [[0, 0], [0, 2], [2, 0], [2, 2]]));
if (rectCheck.badRows.length + rectCheck.badCols.length !== 0) {
  throw new Error('4-bit rectangle flip should go undetected');
}

// Corrupt Row 2, Column 3 (0-based indices [1, 2]) for Table 1.
const errRowIdx = 1;
const errColIdx = 2;
const receivedGrid = cloneAndFlip(cleanGrid, [[errRowIdx, errColIdx]]);
const rxCheck = failingLines(receivedGrid);
if (rxCheck.badRows.join(',') !== `${errRowIdx}` || rxCheck.badCols.join(',') !== `${errColIdx}`) {
  throw new Error('Table 1 error check mismatch');
}

const rowLabels = ['Row 1', 'Row 2', 'Row 3', 'Column parity'];
const tableRows = receivedGrid.map((row, i) => [rowLabels[i], ...row.map(String)]);

// Question 3: 8-bit words checked for odd parity.
const words3 = ['10110110', '10110010', '01101001', '11011011'];
const wordOnes = (s) => onesCount([...s].map(Number));
if (words3.filter((w) => w.length === 8 && wordOnes(w) % 2 === 1).length !== 1 || wordOnes(words3[0]) % 2 !== 1) {
  throw new Error('question 3 needs only the first 8-bit word to have odd parity');
}

// Question 4: parity bits added to a 6×8 data grid.
const q4 = { r: 6, c: 8 };
const q4Data = q4.r * q4.c;
const q4Total = (q4.r + 1) * (q4.c + 1);
const q4Parity = q4Total - q4Data; // r + c + 1 = 15
const q4SubCorner = q4.r + q4.c - 1;
const q4NoCorner = q4.r + q4.c;
if (q4Parity !== q4.r + q4.c + 1) throw new Error('question 4 formula mismatch');
if ([q4Parity, q4SubCorner, q4NoCorner, q4Total].some((v) => [q4.r, q4.c, q4Data].includes(v))) {
  throw new Error('question 4 options must not equal stem inputs');
}

// Question 5: reshaping 64 data bits from 4×16 to 8×8.
const q5Before = 4 + 16 + 1;
const q5After = 8 + 8 + 1;
const q5Saved = q5Before - q5After;
if (4 * 16 !== 64 || 8 * 8 !== 64 || q5Saved !== 4) throw new Error('question 5 reshape mismatch');

// Question 6: verify failure signatures of the four candidate error patterns.
const q6RightSim = failingLines(cloneAndFlip(cleanGrid, [[0, 1], [2, 1]])); // Row 1 & Row 3, same column
const q6OptBSim = failingLines(cloneAndFlip(cleanGrid, [[0, 4]])); // 1 flip in Row parity column
const q6OptCSim = failingLines(cloneAndFlip(cleanGrid, [[0, 0], [0, 2]])); // 2 flips in Row 1
const q6OptDSim = failingLines(cloneAndFlip(cleanGrid, [[0, 0], [0, 2], [2, 0], [2, 2]])); // 4-bit rectangle
if (
  q6RightSim.badRows.join(',') !== '0,2' || q6RightSim.badCols.length !== 0 ||
  q6OptBSim.badCols.length === 0 ||
  q6OptCSim.badRows.length !== 0 ||
  q6OptDSim.badRows.length + q6OptDSim.badCols.length !== 0
) {
  throw new Error('question 6 simulation check failed');
}

export default {
  id: 'p37',
  set: 'mock',
  mock: 4,
  area: 'computational sciences',
  title: 'Parity Bits and Error Detection',
  facts: [
    { claim: 'A parity bit is an extra check bit appended to binary data so the total number of 1-bits (including the parity bit) is even under even parity or odd under odd parity.', source: 'https://en.wikipedia.org/wiki/Parity_bit', read: '2026-11-18' },
    { claim: 'A single parity bit detects any odd number of bit flips (1, 3, …), fails to detect any even number of bit flips (2, 4, …), and cannot locate or correct a flipped bit on its own.', source: 'https://en.wikipedia.org/wiki/Parity_bit', read: '2026-11-18' },
    { claim: 'A two-dimensional parity check arranges r × c data bits into rows and columns with row, column and corner parity bits ((r + 1) × (c + 1) bits in total), pinpointing and correcting any single-bit error and detecting all two-bit errors, while missing four errors at the corners of a rectangle.', source: 'https://en.wikipedia.org/wiki/Multidimensional_parity-check_code', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'Electrical noise in cables and memory chips can flip a binary digit (bit), turning a 0 into a 1 or a 1 into a 0.',
      'The simplest safeguard attaches one extra check bit, called a parity bit, to every block of d data bits, sending a codeword of d + 1 bits.',
      'Under even parity, the sender chooses the parity bit (0 or 1) so that the total count of 1s across all d + 1 bits, including the parity bit itself, is even.',
      'Under odd parity, the parity bit makes the total count of 1s across all d + 1 bits odd.',
    ),
    p(
      'When the receiver checks a codeword, any single-bit flip (whether in a data bit or in the parity bit) changes the count of 1s by +1 or −1, switching it between even and odd, so the error is detected.',
      'More generally, a single parity bit detects every odd number of bit flips, yet misses every even number of flips: flipping two bits changes the count of 1s by −2, 0 or +2, leaving its evenness or oddness intact.',
      'Even when an error is detected, a single parity bit cannot tell which bit flipped, so the receiver cannot correct the block on its own.',
    ),
    p(
      'Arranging r × c data bits into r rows and c columns overcomes this limit.',
      'In a two-dimensional parity grid, one parity bit is appended to each of the r rows, one parity bit is placed at the foot of each of the c columns, and one corner parity bit at the bottom right checks the parity row and parity column:',
    ),
    { type: 'formula', text: 'transmitted bits = (r + 1) × (c + 1) = r × c + (r + c + 1)' },
    p(
      'If a single bit anywhere in the (r + 1) × (c + 1) grid flips, both its row and its column fail their parity checks, and their intersection pinpoints the exact bit to flip back.',
      'Any two-bit error also makes at least two row or column checks fail, so every two-bit error is detected, though not uniquely fixable; four flips sitting at the four corners of a rectangle, however, put two flips in each affected row and column and slip past unnoticed.',
      'Table 1 shows a 3 × 4 data block received under even parity after one bit flipped in transit.',
    ),
    {
      type: 'table',
      caption: 'Table 1. A received block under two-dimensional even parity containing one flipped bit.',
      head: ['Row', 'Column 1', 'Column 2', 'Column 3', 'Column 4', 'Row parity'],
      rows: tableRows,
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, why does a single parity bit attached to a data block miss every two-bit error in that block?',
      options: [
        { text: 'Because two flipped bits always cancel out and leave the original block unchanged.', why: 'Flipping two different positions alters both positions rather than restoring the original bits.' },
        { text: 'Because the parity check counts only the data bits and ignores the parity bit.', why: 'Parity is checked across all d + 1 bits, including the parity bit.' },
        { text: 'Because flipping two data bits automatically flips the parity bit as well.', why: 'Noise on the channel does not recompute the parity bit; two bit flips mean two flips in total.' },
        { text: 'Because flipping any two bits changes the count of 1s by −2, 0 or +2, keeping its parity the same.', correct: true, why: 'Changing a count by an even amount preserves whether it is even or odd, as the second paragraph states.' },
      ],
      explanation: 'Flipping two 1s to 0s changes the number of 1s by −2; flipping one 0 and one 1 changes it by 0; flipping two 0s to 1s changes it by +2. In all three cases an even count stays even and an odd count stays odd.',
    },
    {
      type: 'F', level: 1,
      stem: 'Table 1 was sent using even parity on every row and column and suffered one single-bit flip during transmission. Which cell in Table 1 holds the flipped bit?',
      options: [
        { text: 'Row 2, Column 4', why: 'Row 2 has three 1s (odd), but Column 4 has four 1s (even), so Column 4 passes its check.' },
        { text: 'Row 2, Column 3', correct: true, why: 'Row 2 has three 1s (0, 1, 1, 1, 0) and Column 3 has three 1s (1, 1, 0, 1); every other row and column is even.' },
        { text: 'Row 3, Column 2', why: 'This swaps the row and column numbers; Row 3 has four 1s and Column 2 has two 1s, both even.' },
        { text: 'Row 2, Row parity', why: 'Row 2 fails, but the Row parity column contains two 1s (1, 0, 1, 0), which is even.' },
      ],
      explanation: 'Count the 1s in each row of Table 1: Row 1 has 4, Row 2 has 3 (odd), Row 3 has 4, Column parity has 2. Count the 1s in each column: Column 1 has 2, Column 2 has 2, Column 3 has 3 (odd), Column 4 has 4, Row parity has 2. The failing row and column cross at Row 2, Column 3.',
    },
    {
      type: 'C', level: 2,
      stem: 'A sensor sends 7-bit readings with 1 odd-parity bit appended, forming 8-bit codewords. Which of these received 8-bit codewords passes the odd-parity check?',
      options: [
        { text: words3[0], correct: true, why: `${words3[0]} contains ${wordOnes(words3[0])} ones, which is odd, so it satisfies odd parity.` },
        { text: words3[1], why: `${words3[1]} contains ${wordOnes(words3[1])} ones, which is even, so it fails odd parity.` },
        { text: words3[2], why: `${words3[2]} contains ${wordOnes(words3[2])} ones, which is even, so it fails odd parity.` },
        { text: words3[3], why: `${words3[3]} contains ${wordOnes(words3[3])} ones, which is even, so it fails odd parity.` },
      ],
      explanation: `Under odd parity, the total number of 1s across all 8 bits must be odd. Counting 1s gives ${wordOnes(words3[0])} for ${words3[0]} (odd), against ${wordOnes(words3[1])}, ${wordOnes(words3[2])} and ${wordOnes(words3[3])} (all even) for the other three words.`,
    },
    {
      type: 'A', level: 2,
      stem: `A block of ${q4Data} data bits is arranged in ${q4.r} rows and ${q4.c} columns and sent with two-dimensional parity (row parity bits, column parity bits, and the bottom-right corner parity bit). How many parity bits are added to the ${q4Data} data bits?`,
      options: numericOptions(
        { value: q4Parity, why: `(${q4.r} + 1) × (${q4.c} + 1) − ${q4Data} = ${q4Total} − ${q4Data} = ${q4.r} + ${q4.c} + 1 = ${q4Parity}.` },
        [
          { value: q4SubCorner, why: `This calculates ${q4.r} + ${q4.c} − 1, subtracting 1 for the bottom-right corner instead of adding 1.` },
          { value: q4NoCorner, why: `This adds ${q4.r} row bits and ${q4.c} column bits (${q4.r} + ${q4.c}) and forgets the bottom-right corner parity bit.` },
          { value: q4Total, why: `This is the total number of transmitted bits (${q4.r} + 1) × (${q4.c} + 1), including the ${q4Data} data bits.` },
        ],
        whole,
      ),
      explanation: `By the formula, r × c data bits require r + c + 1 parity bits: ${q4.r} row-parity bits, ${q4.c} column-parity bits, and 1 corner parity bit, giving ${q4.r} + ${q4.c} + 1 = ${q4Parity} (or ${q4Total} − ${q4Data} = ${q4Parity}).`,
    },
    {
      type: 'D', level: 2,
      stem: 'A transmitter sends 64 data bits per block with a two-dimensional parity grid (including the corner parity bit). If the grid layout for those 64 data bits is changed from 4 rows by 16 columns to 8 rows by 8 columns, what happens to the number of parity bits sent per block?',
      options: [
        { text: 'It stays the same, because both grids hold 64 data bits.', why: 'The product r × c stays at 64, whereas the parity count r + c + 1 shrinks when r + c shrinks.' },
        { text: `It falls by ${q5Saved} bits, from ${q5Before} to ${q5After}.`, correct: true, why: `4 × 16 uses 4 + 16 + 1 = ${q5Before} parity bits, whereas 8 × 8 uses 8 + 8 + 1 = ${q5After} parity bits, saving ${q5Saved}.` },
        { text: `It rises by ${q5Saved} bits, from ${q5After} to ${q5Before}.`, why: `This reverses the two layouts: ${q5Before} is for 4 × 16 and ${q5After} is for 8 × 8.` },
        { text: 'It falls by 8 bits, from 24 to 16.', why: `Parity bits equal r + c + 1 (${q5Before} and ${q5After}), not 24 and 16.` },
      ],
      explanation: `For 4 × 16, r + c + 1 = 4 + 16 + 1 = ${q5Before} parity bits. For 8 × 8, r + c + 1 = 8 + 8 + 1 = ${q5After} parity bits. Switching to the square grid reduces the parity overhead by ${q5Before} − ${q5After} = ${q5Saved} bits.`,
    },
    {
      type: 'T', level: 3,
      stem: 'A block like Table 1 is sent using two-dimensional even parity. At the receiver, Row 1 and Row 3 both have an odd number of 1s (failing their checks), while every other row and every single column (including the Row parity column) has an even number of 1s. Which of these error patterns explains what happened?',
      options: [
        { text: 'Two bits flipped, one in Row 1 and one in Row 3, in the same column.', correct: true, why: 'Row 1 and Row 3 each suffer one flip (failing), while their shared column suffers two flips so its parity stays even.' },
        { text: 'One bit flipped, in the Row parity column of either Row 1 or Row 3.', why: 'A single flip in the Row parity column would fail only one row and would also make the Row parity column fail.' },
        { text: 'Two bits flipped, both in Row 1, in two different columns.', why: 'Two flips in Row 1 would keep Row 1 even, leave Row 3 even, and cause those two columns to fail instead.' },
        { text: 'Four bits flipped, at the intersections of Rows 1 and 3 with two different columns.', why: 'Four flips at the corners of a rectangle put two flips in Row 1 and two in Row 3, so all row and column checks pass.' },
      ],
      explanation: 'Because no column failed, every column must have suffered an even number of flips (0, 2, …). Because Rows 1 and 3 each failed, each suffered an odd number of flips. Two flips placed in Row 1 and Row 3 of the same column give 1 flip in Row 1, 1 flip in Row 3, and 2 flips in that column.',
    },
    {
      type: 'S', level: 3,
      stem: 'Comparing a single parity bit per block with a two-dimensional parity grid (including row, column and corner parity bits), which statement is always true?',
      options: [
        { text: 'A two-dimensional parity grid detects every pattern of four bit flips in the grid.', why: 'Four flips sitting at the corners of a rectangle leave two flips in each affected row and column, going undetected.' },
        { text: 'A single parity bit detects every two-bit error, and a two-dimensional grid corrects every two-bit error.', why: 'A single parity bit misses every two-bit error, and a two-dimensional grid detects two-bit errors without uniquely locating them.' },
        { text: 'A two-dimensional parity grid corrects a single-bit flip in a data cell, and fails if a parity cell flips.', why: 'Because the corner bit checks both parity edges, flipping any single parity cell still flags its unique row and column.' },
        { text: 'A two-dimensional parity grid detects every two-bit error and corrects every single-bit error, including in a parity cell.', correct: true, why: 'Any single flip uniquely flags one row and one column across the whole (r + 1) × (c + 1) grid, and any two distinct flips fail at least two line checks.' },
      ],
      explanation: 'Every cell of the (r + 1) × (c + 1) grid belongs to one checked row and one checked column, so any single flip uniquely flags its row and column. Any two distinct cells differ in row, column, or both, causing two rows, two columns, or two rows and two columns to fail.',
    },
  ],
};
