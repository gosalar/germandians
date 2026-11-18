// Mock 4, passage 42. Area: computational sciences. Subject: variable-length prefix-free binary codes and code trees.
import { numericOptions, p, whole } from '../lib.mjs';

/** Check whether a list of binary codewords satisfies the prefix-free property. */
function isPrefixFree(words) {
  return words.every((w, i) => words.every((other, j) => i === j || !other.startsWith(w)));
}

/** Find one pair where `short` is a prefix of `long`. */
function findPrefixPair(words) {
  for (let i = 0; i < words.length; i++) {
    for (let j = 0; j < words.length; j++) {
      if (i !== j && words[j].startsWith(words[i])) return [words[i], words[j]];
    }
  }
  return null;
}

// ---------- Figure 1 code and Table 1 character counts ----------
const entries = [
  { ch: 'E', bits: '0', count: 95 },
  { ch: 'T', bits: '10', count: 50 },
  { ch: 'A', bits: '110', count: 25 },
  { ch: 'N', bits: '1110', count: 20 },
  { ch: 'R', bits: '1111', count: 10 },
];
if (!isPrefixFree(entries.map((e) => e.bits))) throw new Error('Figure 1 code must be prefix-free');
if (new Set(entries.map((e) => e.count)).size !== entries.length) {
  throw new Error('every count in Table 1 must be distinct');
}

const codeOf = Object.fromEntries(entries.map((e) => [e.ch, e.bits]));
const charOf = Object.fromEntries(entries.map((e) => [e.bits, e.ch]));

const encode = (word) => [...word].map((c) => codeOf[c]).join('');
function decode(stream) {
  let out = '';
  let buf = '';
  for (const bit of stream) {
    buf += bit;
    if (charOf[buf]) {
      out += charOf[buf];
      buf = '';
    }
  }
  if (buf !== '') throw new Error(`Incomplete trailing bits: ${buf}`);
  return out;
}

// Question 2: decode a bit string using Figure 1.
const words2 = ['NEAT', 'TEAR', 'RATE', 'NEAR'];
const targetWord2 = 'NEAR';
const targetBits2 = encode(targetWord2);
if (decode(targetBits2) !== targetWord2 || new Set(words2.map(encode)).size !== 4) {
  throw new Error('question 2 words must encode and decode uniquely');
}

// Question 3: four candidate codes, exactly one prefix-free.
const candidates3 = [
  ['0', '10', '110', '111'],
  ['0', '01', '10', '11'],
  ['00', '01', '10', '010'],
  ['1', '01', '001', '011'],
];
if (candidates3.filter(isPrefixFree).length !== 1 || !isPrefixFree(candidates3[0])) {
  throw new Error('question 3 needs only the first candidate to be prefix-free');
}

// Question 4: total bit length of the Table 1 message under Figure 1's code.
const totalChars = entries.reduce((s, e) => s + e.count, 0);
const totalBits4 = entries.reduce((s, e) => s + e.count * e.bits.length, 0);
const meanLenUnweighted = entries.reduce((s, e) => s + e.bits.length, 0) / entries.length;
const unweightedTotal4 = Math.round(totalChars * meanLenUnweighted);
const fixedWidth5 = Math.ceil(Math.log2(entries.length));
const fixedTotal4 = totalChars * fixedWidth5;

// Question 5: swapping the leaf labels E and R keeps the tree structure valid while raising total bits.
const swappedEntries = entries.map((e) =>
  e.ch === 'E' ? { ...e, bits: codeOf.R } : e.ch === 'R' ? { ...e, bits: codeOf.E } : e,
);
const swappedTotal5 = swappedEntries.reduce((s, e) => s + e.count * e.bits.length, 0);
if (!isPrefixFree(swappedEntries.map((e) => e.bits)) || !(swappedTotal5 > totalBits4)) {
  throw new Error('question 5 swap must stay prefix-free and increase total bit length');
}

// Question 6: weather station 6-symbol alphabet and bit savings over shortest fixed-length binary code.
const station = [
  { sym: 'S1', bits: '0', count: 240 },
  { sym: 'S2', bits: '10', count: 120 },
  { sym: 'S3', bits: '1100', count: 60 },
  { sym: 'S4', bits: '1101', count: 40 },
  { sym: 'S5', bits: '1110', count: 25 },
  { sym: 'S6', bits: '1111', count: 15 },
];
if (!isPrefixFree(station.map((s) => s.bits)) || new Set(station.map((s) => s.count)).size !== station.length) {
  throw new Error('question 6 station code must be prefix-free with distinct counts');
}
const stationChars = station.reduce((s, x) => s + x.count, 0);
const stationVarBits = station.reduce((s, x) => s + x.count * x.bits.length, 0);
const stationFixedWidth = Math.ceil(Math.log2(station.length));
const stationFixedBits = stationChars * stationFixedWidth;
const stationSaved = stationFixedBits - stationVarBits;
const stationWrongFourBitSaved = stationChars * 4 - stationVarBits;

const bitsFmt = (v) => `${whole(v)} bits`;

// ---------- Figure 1 SVG: left-to-right binary code tree ----------
const branch = (x1, y1, x2, y2, bitLabel) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><text class="prob" x="${mx}" y="${y2 < y1 ? my - 8 : my + 20}" text-anchor="middle">${bitLabel}</text>`;
};

const figure1 = `<svg viewBox="0 0 460 284" role="img" aria-labelledby="p42-fig1-alt">
  <g class="branches">
    ${branch(38, 108, 128, 46, '0')}
    ${branch(38, 108, 128, 158, '1')}
    ${branch(128, 158, 224, 96, '0')}
    ${branch(128, 158, 224, 198, '1')}
    ${branch(224, 198, 320, 140, '0')}
    ${branch(224, 198, 320, 232, '1')}
    ${branch(320, 232, 414, 194, '0')}
    ${branch(320, 232, 414, 260, '1')}
  </g>
  <g class="dots">
    <circle class="dot" cx="38" cy="108" r="4"/>
    <circle class="dot" cx="128" cy="158" r="4"/>
    <circle class="dot" cx="224" cy="198" r="4"/>
    <circle class="dot" cx="320" cy="232" r="4"/>
  </g>
  <g class="nodes">
    <text class="prob" x="138" y="52">E</text>
    <text class="prob" x="234" y="102">T</text>
    <text class="prob" x="330" y="146">A</text>
    <text class="prob" x="424" y="200">N</text>
    <text class="prob" x="424" y="266">R</text>
  </g>
</svg>`;

export default {
  id: 'p42',
  set: 'mock',
  mock: 4,
  area: 'computational sciences',
  title: 'Prefix-Free Binary Codes',
  facts: [
    { claim: 'A binary code represents each symbol of an alphabet as a codeword made of bits (0 and 1); k bits of fixed length provide 2^k distinct bit patterns.', source: 'https://en.wikipedia.org/wiki/Binary_code', read: '2026-11-18' },
    { claim: 'A prefix code (or prefix-free code) satisfies the prefix property: no whole codeword in the code is a prefix (initial segment) of any other codeword, allowing a sequence of concatenated codewords to be decoded unambiguously without markers between words.', source: 'https://en.wikipedia.org/wiki/Prefix_code', read: '2026-11-18' },
    { claim: 'In a binary code tree, internal nodes branch to two children (conventionally labelled 0 and 1) and every encoded symbol sits at a leaf node, whose depth from the root equals its codeword bit length.', source: 'https://en.wikipedia.org/wiki/Huffman_coding', read: '2026-11-18' },
    { claim: 'Representing more frequent symbols with shorter codewords and less frequent symbols with longer codewords lowers the total bit length, which equals the sum over all symbols of (symbol count × codeword bit length).', source: 'https://en.wikipedia.org/wiki/Huffman_coding', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'Computers store and transmit text by encoding each character as a binary codeword, a sequence of bits written 0 and 1.',
      'In a fixed-length code every character uses the same number of bits, k.',
      'Because k bits can form 2^k different patterns, an alphabet of m characters needs the smallest integer k with 2^k ≥ m: two bits distinguish at most four characters, while five to eight characters need three bits each.',
    ),
    p(
      'Text can often be stored in fewer bits with a variable-length code, which gives short codewords to common characters and longer codewords to rare ones.',
      'Variable lengths create a risk when codewords are joined end to end without spaces.',
      'Suppose X were encoded as 0, Y as 1 and Z as 01: the bit string 01 could then mean either "X followed by Y" or "Z alone".',
      'A code avoids this ambiguity if it is prefix-free (also called a prefix code): no codeword in the code is an initial segment, or prefix, of any other codeword.',
      'When a code is prefix-free, a receiver reading from left to right recognises the end of each codeword the instant a valid codeword is completed, with no separator needed.',
    ),
    p(
      'Every binary prefix-free code can be drawn as a binary code tree starting from a root on the left (Figure 1).',
      'Each branching point, or internal node, splits into an upper branch labelled 0 and a lower branch labelled 1.',
      'Characters are placed only at the leaves, the endpoints with no branches leaving them; that rule ensures no character\'s path is the start of another\'s.',
      'A character\'s codeword is the sequence of branch bits from the root to its leaf, so its length in bits equals the number of steps from the root.',
    ),
    {
      type: 'figure',
      id: 'p42-fig1',
      caption: 'Figure 1. A binary code tree for the five characters E, T, A, N and R.',
      alt: 'A binary tree branching from a root on the left, with upper branches labelled 0 and lower branches labelled 1. Path 0 ends at leaf E. Path 10 ends at leaf T. Path 110 ends at leaf A. Path 1110 ends at leaf N. Path 1111 ends at leaf R.',
      svg: figure1,
    },
    p(
      'For a message in which character i appears cᵢ times and has a codeword of length lᵢ bits, the total bit length is',
    ),
    { type: 'formula', text: 'total bits = Σ (cᵢ × lᵢ)' },
    p(
      `Table 1 lists the character counts in a ${whole(totalChars)}-character message written with the five letters of Figure 1.`,
    ),
    {
      type: 'table',
      caption: `Table 1. Character counts in one ${whole(totalChars)}-character message.`,
      head: ['Character', 'Occurrences in message'],
      rows: entries.map((e) => [e.ch, `${e.count}`]),
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what makes a binary code prefix-free, and what does this property allow?',
      options: [
        { text: 'Every codeword starts with the bit 0, allowing the receiver to count how many characters are in a message before decoding.', why: 'If every codeword started with 0, the tree could never use its 1 branch from the root; prefix-free forbids one whole codeword starting another.' },
        { text: 'No codeword is the initial segment of another codeword, allowing a joined bit string to be decoded uniquely from left to right without separators.', correct: true, why: 'This states the definition and the left-to-right decoding property in the second paragraph.' },
        { text: 'Every codeword has the exact same number of bits, allowing any two characters to swap codewords without changing message length.', why: 'Equal bit lengths describe a fixed-length code, whereas prefix-free codes can assign different lengths to different characters.' },
        { text: 'Characters are placed on both internal nodes and leaves of the tree, allowing more characters to share a shallow tree.', why: 'Placing a character on an internal node would make its path a prefix of every leaf beyond it, breaking unique decoding.' },
      ],
      explanation: 'The second and third paragraphs state that in a prefix-free code no codeword is an initial segment (prefix) of another codeword — achieved in a code tree by placing characters only at leaves — so a bit stream decodes uniquely from left to right without separators.',
    },
    {
      type: 'F', level: 1,
      stem: `Using the code tree in Figure 1, which word does the bit string ${targetBits2} represent?`,
      options: words2.map((w) => ({
        text: w,
        ...(w === targetWord2 ? { correct: true } : {}),
        why: w === targetWord2
          ? `Reading from the root: ${[...w].map((c) => `${codeOf[c]} = ${c}`).join(', ')}, which joins to ${targetBits2}.`
          : `${w} encodes as ${[...w].map((c) => codeOf[c]).join(' ')} (${encode(w)}), which differs from ${targetBits2}.`,
      })),
      explanation: `Follow the tree from the root each time a leaf is reached: 1110 reaches leaf N; restarting at the root, 0 reaches leaf E; 110 reaches leaf A; and 1111 reaches leaf R. Together ${targetBits2} decodes to ${targetWord2}.`,
    },
    {
      type: 'C', level: 2,
      stem: 'Four binary codes for a four-symbol alphabet are listed below. Which one is prefix-free?',
      options: candidates3.map((words) => {
        const badPair = findPrefixPair(words);
        return {
          text: words.join(', '),
          ...(badPair ? {} : { correct: true }),
          why: badPair
            ? `Not prefix-free: "${badPair[0]}" is an initial segment of "${badPair[1]}".`
            : 'No codeword in this list forms the start of any other codeword in the list.',
        };
      }),
      explanation: 'Check whether any codeword starts another. In "0, 10, 110, 111", only 0 starts with 0, and among the three starting with 1, only 10 starts with 10 while 110 and 111 differ in their third bit, so none is a prefix of another. In each of the other three lists, a shorter codeword is the start of a longer one.',
    },
    {
      type: 'A', level: 2,
      stem: `How many bits in total are required to encode the ${whole(totalChars)}-character message in Table 1 using the code tree in Figure 1?`,
      options: numericOptions(
        { value: totalBits4, why: `${entries.map((e) => `${e.count} × ${e.bits.length}`).join(' + ')} = ${whole(totalBits4)} bits.` },
        [
          { value: totalChars, why: `This is the number of characters (${whole(totalChars)}), which would equal the bit count only if every character took 1 bit.` },
          { value: unweightedTotal4, why: `This multiplies ${whole(totalChars)} characters by the unweighted mean codeword length (${meanLenUnweighted} bits), ignoring that short codewords occur far more often.` },
          { value: fixedTotal4, why: `This gives every character ${fixedWidth5} bits, as in a fixed-length code for five characters, rather than the lengths in Figure 1.` },
        ],
        bitsFmt,
      ),
      explanation: `Read each character's bit length from Figure 1: E has 1 bit (0), T has 2 (10), A has 3 (110), N has 4 (1110) and R has 4 (1111). Multiply by the counts in Table 1 and add: 95 × 1 + 50 × 2 + 25 × 3 + 20 × 4 + 10 × 4 = 95 + 100 + 75 + 80 + 40 = ${whole(totalBits4)} bits.`,
    },
    {
      type: 'D', level: 2,
      stem: 'Suppose the leaves for E and R in Figure 1 are swapped — so E receives 1111 and R receives 0, while T, A and N keep their positions — and this altered tree is used to encode the message in Table 1. What happens?',
      options: [
        { text: 'The altered code is no longer prefix-free, and the total bit length of the message increases.', why: 'Characters still sit only at the leaves of the same binary tree, so no codeword becomes a prefix of another.' },
        { text: 'The altered code remains prefix-free, and the total bit length of the message stays the same.', why: `Swapping a 1-bit codeword and a 4-bit codeword leaves total bits unchanged only if E and R appear equally often; in Table 1 E appears ${entries[0].count} times and R ${entries[4].count} times.` },
        { text: 'The altered code remains prefix-free, and the total bit length of the message increases.', correct: true, why: 'All five characters remain at leaves, while giving 4 bits instead of 1 to the commonest letter (95 occurrences) outweighs saving 3 bits on the rarest (10 occurrences).' },
        { text: 'The altered code remains prefix-free, and the total bit length of the message decreases.', why: 'Giving a longer codeword to a frequent letter and a shorter one to a rare letter raises total bits rather than lowering them.' },
      ],
      explanation: 'Relabelling two leaves of a binary code tree leaves all symbols at leaves, so the code stays prefix-free. However, E appears 95 times and R only 10 times in Table 1: lengthening E by 3 bits adds 95 × 3 = 285 bits while shortening R by 3 bits saves only 10 × 3 = 30 bits, increasing the message by 255 bits.',
    },
    {
      type: 'T', level: 3,
      stem: `A weather station transmits ${whole(stationChars)}-symbol reports built from six symbols, S1 to S6. In one report the counts are ${station.map((s) => `${s.sym}: ${s.count}`).join(', ')}. The station encodes the report with the prefix-free code ${station.map((s) => `${s.sym} = ${s.bits}`).join(', ')}. How many fewer bits does this report use than it would under the shortest fixed-length binary code that can represent all six symbols?`,
      options: numericOptions(
        { value: stationSaved, why: `Six symbols need ${stationFixedWidth} bits each in a fixed-length code (${whole(stationChars)} × ${stationFixedWidth} = ${whole(stationFixedBits)} bits); the prefix-free code uses 240 × 1 + 120 × 2 + 140 × 4 = ${whole(stationVarBits)} bits, saving ${whole(stationSaved)} bits.` },
        [
          { value: stationWrongFourBitSaved, why: `This compares against 4 bits per symbol (${whole(stationChars * 4)} bits), overlooking that 3 bits already give 2³ = 8 ≥ 6 patterns.` },
          { value: stationVarBits, why: `This is the total number of bits used by the prefix-free code (${whole(stationVarBits)}), before subtracting from ${whole(stationFixedBits)}.` },
          { value: stationFixedBits, why: `This is the total number of bits used by the ${stationFixedWidth}-bit fixed-length code (${whole(stationFixedBits)}), before subtracting ${whole(stationVarBits)}.` },
        ],
        bitsFmt,
      ),
      explanation: `First find the shortest fixed-length binary code for six symbols: 2² = 4 is too small, while 2³ = 8 ≥ 6, so fixed-length coding needs ${stationFixedWidth} bits per symbol, or ${whole(stationChars)} × ${stationFixedWidth} = ${whole(stationFixedBits)} bits. Under the prefix-free code, S1 uses 240 × 1 = 240 bits, S2 uses 120 × 2 = 240 bits, and S3 to S6 (60 + 40 + 25 + 15 = 140 symbols) each use 4 bits, or 140 × 4 = 560 bits, giving 240 + 240 + 560 = ${whole(stationVarBits)} bits. The saving is ${whole(stationFixedBits)} − ${whole(stationVarBits)} = ${whole(stationSaved)} bits.`,
    },
  ],
};
