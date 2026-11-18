// Mock 3, passage 2. Area: computational sciences. Subject: deterministic finite state machines.
import { numericOptions, p } from '../lib.mjs';

// ---------- machine M, simulated in code so every trace and count is verified ----------
const STATES = ['q₀', 'q₁', 'q₂', 'q₃'];
const ALPHABET = ['0', '1'];
const START = 'q₀';
const ACCEPTING = new Set(['q₂']);
const DELTA = {
  'q₀': { '0': 'q₀', '1': 'q₁' },
  'q₁': { '0': 'q₂', '1': 'q₃' },
  'q₂': { '0': 'q₂', '1': 'q₁' },
  'q₃': { '0': 'q₃', '1': 'q₃' },
};

// Verify total deterministic transition function and that q₃ is the unique trap state.
for (const s of STATES) {
  for (const sym of ALPHABET) {
    if (!STATES.includes(DELTA[s]?.[sym])) throw new Error(`missing transition from ${s} on ${sym}`);
  }
}
const trapStates = STATES.filter((s) => !ACCEPTING.has(s) && ALPHABET.every((sym) => DELTA[s][sym] === s));
if (trapStates.length !== 1 || trapStates[0] !== 'q₃') throw new Error('q₃ must be the unique trap state');

function runMachine(str, accepting = ACCEPTING) {
  let state = START;
  const path = [state];
  for (const ch of str) {
    if (!ALPHABET.includes(ch)) throw new Error(`invalid symbol ${ch}`);
    state = DELTA[state][ch];
    path.push(state);
  }
  return { final: state, accepted: accepting.has(state), path };
}

function allStrings(len) {
  return Array.from({ length: 2 ** len }, (_, i) => i.toString(2).padStart(len, '0'));
}

// Exhaustively verify the language characterisation of M up to length 10.
for (let len = 0; len <= 10; len++) {
  const strs = len === 0 ? [''] : allStrings(len);
  for (const w of strs) {
    const expected = w.includes('1') && w.endsWith('0') && !w.includes('11');
    if (runMachine(w).accepted !== expected) throw new Error(`language mismatch on "${w}"`);
    const modAccepted = runMachine(w, new Set(['q₀', 'q₂'])).accepted;
    const onlyZeros = !w.includes('1');
    if (modAccepted !== (expected || onlyZeros)) throw new Error(`modified machine mismatch on "${w}"`);
  }
}

// Worked trace in the passage text: "101" visits q₂ but ends in q₁ (rejected); "100" ends in q₂ (accepted).
const exAccept = '100';
const exRejectAfterVisit = '101';
if (!runMachine(exAccept).accepted) throw new Error('exAccept must be accepted');
if (runMachine(exRejectAfterVisit).accepted || !runMachine(exRejectAfterVisit).path.includes('q₂')) {
  throw new Error('exRejectAfterVisit must visit q₂ and still be rejected');
}

// Question 2: trace "010110".
const q2Input = '010110';
const q2Run = runMachine(q2Input);
if (q2Run.final !== 'q₃') throw new Error('question 2 expects final state q₃');

// Question 3: four 6-symbol strings, exactly one accepted.
const q3Cases = ['010011', '101001', '010100', '110010'];
const q3Runs = q3Cases.map((s) => ({ str: s, ...runMachine(s) }));
if (q3Runs.filter((r) => r.accepted).length !== 1 || !q3Runs[2].accepted) {
  throw new Error('question 3 needs only the third string accepted');
}

// Question 6: count of accepted strings of length 5.
const len6 = 5;
const strs6 = allStrings(len6);
const ans6 = strs6.filter((w) => runMachine(w).accepted).length;
const wrong6IncludeAllZero = strs6.filter((w) => !w.includes('11') && w.endsWith('0')).length;
const wrong6IncludeQ1 = strs6.filter((w) => ['q₁', 'q₂'].includes(runMachine(w).final)).length;
const wrong6IgnoreTrap = strs6.filter((w) => w.includes('1') && w.endsWith('0')).length;
if ([len6, STATES.length, ALPHABET.length, strs6.length].includes(ans6)) {
  throw new Error('question 6 answer must not equal a number given in the stem or setup');
}

// Table 1 rows
const tableRows = STATES.map((s) => [
  s === START ? `${s} (start)` : ACCEPTING.has(s) ? `${s} (accepting)` : s,
  DELTA[s]['0'],
  DELTA[s]['1'],
]);

// ---------- Figure 1: state diagram of machine M ----------
const arrowHead = (tipX, tipY, dx, dy) => {
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const bx = tipX - 9 * ux;
  const by = tipY - 9 * uy;
  const px = -uy * 4.5;
  const py = ux * 4.5;
  const r = (n) => Math.round(n * 10) / 10;
  return `<polygon class="dot" points="${r(tipX)},${r(tipY)} ${r(bx + px)},${r(by + py)} ${r(bx - px)},${r(by - py)}"/>`;
};

const figure1 = `<svg viewBox="0 0 480 248" role="img" aria-labelledby="p28-fig1-alt">
  <line x1="22" y1="96" x2="62" y2="96"/>
  ${arrowHead(64, 96, 1, 0)}
  <path class="wire" d="M 77 73 C 65 30, 115 30, 103 73"/>
  ${arrowHead(103, 73, -12, 43)}
  <text class="prob" x="90" y="30" text-anchor="middle">0</text>
  <line x1="116" y1="96" x2="212" y2="96"/>
  ${arrowHead(214, 96, 1, 0)}
  <text class="prob" x="165" y="86" text-anchor="middle">1</text>
  <path class="wire" d="M 263 83 Q 315 54, 367 83"/>
  ${arrowHead(367, 83, 52, 29)}
  <text class="prob" x="315" y="61" text-anchor="middle">0</text>
  <path class="wire" d="M 367 109 Q 315 138, 263 109"/>
  ${arrowHead(263, 109, -52, -29)}
  <text class="prob" x="315" y="142" text-anchor="middle">1</text>
  <line x1="240" y1="122" x2="240" y2="177"/>
  ${arrowHead(240, 179, 0, 1)}
  <text class="prob" x="254" y="156">1</text>
  <path class="wire" d="M 377 73 C 365 30, 415 30, 403 73"/>
  ${arrowHead(403, 73, -12, 43)}
  <text class="prob" x="390" y="30" text-anchor="middle">0</text>
  <path class="wire" d="M 263 194 C 314 176, 314 234, 263 216"/>
  ${arrowHead(263, 216, -51, -18)}
  <text class="prob" x="308" y="211">0, 1</text>
  <circle class="part" cx="90" cy="96" r="26"/>
  <text x="90" y="102" text-anchor="middle">q₀</text>
  <circle class="part" cx="240" cy="96" r="26"/>
  <text x="240" y="102" text-anchor="middle">q₁</text>
  <circle class="part" cx="390" cy="96" r="26"/>
  <circle class="wire" cx="390" cy="96" r="20"/>
  <text x="390" y="102" text-anchor="middle">q₂</text>
  <circle class="part" cx="240" cy="205" r="26"/>
  <text x="240" y="211" text-anchor="middle">q₃</text>
</svg>`;

export default {
  id: 'p28',
  set: 'mock',
  mock: 3,
  area: 'computational sciences',
  title: 'Deterministic Finite State Machines',
  facts: [
    { claim: 'A deterministic finite state automaton consists of a finite set of states, a finite input alphabet, a start state, a subset of accepting (final) states, and a total transition function mapping each state and input symbol to one next state.', source: "https://eng.libretexts.org/Bookshelves/Computer_Science/Programming_and_Computation_Fundamentals/Foundations_of_Computation_(Critchlow_and_Eck)/03%3A_Regular_Expressions_and_FSA's/3.04%3A_Finite-State_Automata", read: '2026-11-18' },
    { claim: 'Deterministic means that for every current state and every input symbol from the alphabet, there is one and only one next state the machine can enter.', source: 'https://opendsa-server.cs.vt.edu/OpenDSA/Books/Catalog/html/DFA.html', read: '2026-11-18' },
    { claim: 'The machine starts in its start state, reads an input string symbol by symbol from left to right without modifying it, and accepts the string if and only if the state reached after the entire string has been read is an accepting state.', source: 'https://opendsa-server.cs.vt.edu/OpenDSA/Books/Catalog/html/DFA.html', read: '2026-11-18' },
    { claim: 'If no input symbols are consumed (the empty string), the machine makes no transitions and remains in the start state, so the empty string is accepted if and only if the start state is accepting.', source: "https://eng.libretexts.org/Bookshelves/Computer_Science/Programming_and_Computation_Fundamentals/Foundations_of_Computation_(Critchlow_and_Eck)/03%3A_Regular_Expressions_and_FSA's/3.04%3A_Finite-State_Automata", read: '2026-11-18' },
    { claim: 'In a transition diagram, states are drawn with circles, the start state has an incoming arrow from the left, accepting states are drawn as double circles, and a non-accepting state that cannot be escaped once entered is called a trap state.', source: "https://eng.libretexts.org/Bookshelves/Computer_Science/Programming_and_Computation_Fundamentals/Foundations_of_Computation_(Critchlow_and_Eck)/03%3A_Regular_Expressions_and_FSA's/3.04%3A_Finite-State_Automata", read: '2026-11-18' },
  ],
  blocks: [
    p(
      'Software often needs to check whether a sequence of characters, called a string, follows a pattern: whether an input holds only digits, or whether brackets open in the expected order.',
      'A deterministic finite state machine, also called a deterministic finite automaton, is a simple model that performs such checks using a fixed, finite set of states.',
      'The symbols allowed in the input form a finite set called the input alphabet.',
    ),
    p(
      'Before reading any input, the machine sits in one designated start state.',
      'It then reads the input string one symbol at a time from left to right without changing the string.',
      'A rule called the transition function tells the machine which state to enter next from its current state and the symbol just read.',
      'The machine is called deterministic because for every state and every symbol in the alphabet, the transition function specifies one and only one next state: no step is missing and no step offers a choice.',
    ),
    p(
      'Zero, one or more of the states are marked as accepting states, also called final states.',
      'Once the last symbol of the string has been read, the string is accepted if the machine finishes in an accepting state, and rejected otherwise.',
      'Passing through an accepting state earlier in the string is not enough: only the state at the very end counts.',
      'If the input is the empty string, which contains zero symbols, the machine makes no transitions at all and finishes in the start state, so the empty string is accepted if and only if the start state itself is accepting.',
    ),
    p(
      'A machine can be shown either as a transition diagram or as a transition table.',
      'In a diagram each state is a circle, an arrow entering from outside marks the start state, a double circle marks each accepting state, and labelled arrows show the transitions.',
      'A non-accepting state whose transitions for every symbol loop back to itself is called a trap state: once the machine enters it, no later symbols can lead out.',
      `Figure 1 and Table 1 show the same machine M over the alphabet {0, 1}. On ${exAccept} it moves q₀ → q₁ → q₂ → q₂ and accepts; on ${exRejectAfterVisit} it moves q₀ → q₁ → q₂ → q₁ and rejects.`,
    ),
    {
      type: 'figure',
      id: 'p28-fig1',
      caption: 'Figure 1. Transition diagram of machine M over the input alphabet {0, 1}.',
      alt: 'A state diagram with four states q₀, q₁, q₂ and q₃. Start arrow enters q₀. State q₂ has a double circle marking it as the only accepting state. Transitions: from q₀, 0 loops to q₀ and 1 goes to q₁; from q₁, 0 goes to q₂ and 1 goes to q₃; from q₂, 0 loops to q₂ and 1 goes to q₁; from q₃, both 0 and 1 loop to q₃.',
      svg: figure1,
    },
    {
      type: 'table',
      caption: 'Table 1. Transition table of machine M.',
      head: ['Current state', 'Input 0', 'Input 1'],
      rows: tableRows,
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what makes a finite state machine deterministic?',
      options: [
        { text: 'Every input string eventually brings the machine into an accepting state.', why: 'Strings that finish in a non-accepting state are rejected, as the example 101 in the text shows.' },
        { text: 'Each state and each symbol in the alphabet determine one and only one next state.', correct: true, why: 'The second paragraph defines determinism: no state-symbol pair lacks a transition or allows more than one move.' },
        { text: 'Once the machine leaves a state, no later transition can return to that state.', why: 'Transitions may loop to the same state or return to an earlier state, as q₂ returning to q₁ on input 1 shows.' },
        { text: 'The machine has exactly one accepting state and exactly one trap state.', why: 'Any number of states (including zero or several) may be accepting, and a machine need not contain a trap state.' },
      ],
      explanation: 'The second paragraph states that a finite state machine is deterministic because for every state and every symbol in its alphabet, the transition function specifies one and only one next state.',
    },
    {
      type: 'F', level: 1,
      stem: `Machine M in Figure 1 starts in ${START} and reads the input string ${q2Input}. In which state does it finish?`,
      options: STATES.map((s) => ({
        text: `State ${s}.`,
        ...(s === q2Run.final ? { correct: true } : {}),
        why: s === q2Run.final
          ? `The path is ${q2Run.path.join(' → ')}: the consecutive 1s send M from q₁ to the trap state q₃, where the final 0 keeps it.`
          : s === 'q₀'
            ? 'Only the first 0 keeps M in q₀; the next symbol is 1, which moves M out of q₀, and no arrow returns to q₀.'
            : s === 'q₁'
              ? 'M is in q₁ after reading 0101, before the final two symbols 10 are processed.'
              : 'M visits q₂ after 010, and the final symbol is 0, but the pair 11 has already trapped M in q₃ before that final 0 arrives.',
      })),
      explanation: `Follow the transitions from left to right on ${q2Input}: ${q2Run.path.join(' → ')}. Once the second of the two consecutive 1s puts M into q₃, the final 0 loops back to q₃.`,
    },
    {
      type: 'A', level: 2,
      stem: 'Which of the following 6-symbol input strings is accepted by machine M?',
      options: q3Runs.map((r) => ({
        text: r.str,
        ...(r.accepted ? { correct: true } : {}),
        why: r.accepted
          ? `Its path is ${r.path.join(' → ')}, finishing in the accepting state q₂.`
          : r.str === '010011'
            ? `Its path is ${r.path.join(' → ')}: it visits q₂ earlier, then ends in the non-accepting trap state q₃.`
            : r.str === '101001'
              ? `Its path is ${r.path.join(' → ')}: it visits q₂, then the final 1 moves it to the non-accepting state q₁.`
              : `Its path is ${r.path.join(' → ')}: the opening 11 sends M into the trap state q₃, so the ending 010 cannot reach q₂.`,
      })),
      explanation: `Trace each string from q₀. Only ${q3Runs[2].str} finishes in q₂ (${q3Runs[2].path.join(' → ')}). String 010011 enters q₃ at the end, 101001 leaves q₂ for q₁ on its last symbol, and 110010 enters the trap state q₃ on its second symbol.`,
    },
    {
      type: 'C', level: 2,
      stem: 'Which description matches the exact set of all strings over {0, 1} accepted by machine M?',
      options: [
        { text: 'Every string that contains the pair 10 at least once.', why: 'The string 101 contains 10 yet finishes in q₁, and 110 contains 10 yet is trapped in q₃; M rejects both.' },
        { text: 'Every string that contains at least one 1, ends with 0 and never contains 11.', correct: true, why: 'Leaving q₀ needs a 1, avoiding the trap state q₃ forbids 11, and finishing in q₂ rather than q₁ requires the final symbol to be 0.' },
        { text: 'Every string that ends with 0 and never contains 11.', why: 'Strings of 0s alone, such as 0 or 00, end with 0 and never contain 11, yet they never leave q₀ and are rejected.' },
        { text: 'Every string in which every 1 is followed somewhere later by at least one 0.', why: 'The string 110 has a 0 after both 1s, yet the consecutive 1s move M from q₁ into the trap state q₃.' },
      ],
      explanation: 'To leave q₀ the string must contain at least one 1. Once a 1 has been seen, reading two 1s in a row is the only way to enter the trap state q₃; otherwise every 1 puts M in q₁ and every 0 puts M in q₂. Thus M finishes in q₂ if and only if the string has at least one 1, has no 11, and ends with 0.',
    },
    {
      type: 'D', level: 2,
      stem: 'Suppose machine M is altered only by marking q₀ as a second accepting state alongside q₂, keeping q₀ as the start state and keeping every transition in Table 1 unchanged. Which strings become newly accepted?',
      options: [
        { text: 'Only the empty string, containing zero symbols.', why: 'The empty string finishes in q₀, and so does every string of 0s such as 0, 00 and 000 because 0 loops from q₀ to q₀.' },
        { text: 'Every string that starts with 0 and never contains 11.', why: 'The string 01 starts with 0 and has no 11, yet its 1 moves the machine to q₁, which remains non-accepting.' },
        { text: 'Every string that contains no 11, even if it ends with 1.', why: 'Any 1 moves the machine out of q₀, so a string ending with 1 still finishes in q₁ or q₃ and is rejected.' },
        { text: 'The empty string and every string made up solely of 0s.', correct: true, why: 'Only strings that finish in q₀ gain acceptance, and because no transition from q₁, q₂ or q₃ returns to q₀, those are exactly the strings with no 1s.' },
      ],
      explanation: 'With transitions unchanged, every string reaches the same final state as before, so the newly accepted strings are precisely those that finish in q₀. In Table 1, q₀ loops to itself on 0 and moves to q₁ on 1, while no transition from q₁, q₂ or q₃ leads back to q₀. Hence a string finishes in q₀ if and only if it contains no 1s at all: the empty string and strings of 0s only.',
    },
    {
      type: 'T', level: 3,
      stem: `There are ${2 ** len6} binary strings of length ${len6} over the alphabet {0, 1}. How many of those ${2 ** len6} strings are accepted by the unmodified machine M in Figure 1?`,
      options: numericOptions(
        { value: ans6, why: `The ${ans6} accepted strings are 00010, 00100, 01000, 01010, 10000, 10010 and 10100.` },
        [
          { value: wrong6IncludeAllZero, why: `This also counts 00000, which has no 11 and ends with 0, forgetting that without any 1 it remains in the non-accepting start state q₀.` },
          { value: wrong6IncludeQ1, why: `This counts all ${wrong6IncludeQ1} strings of length ${len6} that contain a 1 and avoid 11, including the ${wrong6IncludeQ1 - ans6} strings ending with 1 that finish in q₁.` },
          { value: wrong6IgnoreTrap, why: `This counts all ${wrong6IgnoreTrap} strings of length ${len6} that contain a 1 and end with 0, overlooking the ${wrong6IgnoreTrap - ans6} strings with 11 that get trapped in q₃.` },
        ],
        (v) => `${v}`,
      ),
      explanation: `An accepted string of length ${len6} must end with 0, so its last symbol is fixed: _ _ _ _ 0. Its first 4 symbols must contain at least one 1 and cannot contain 11 (nor can the 4th symbol create 11 with the 5th, since the 5th is 0). Among the 16 prefixes of length 4, the 8 without 11 are 0000, 0001, 0010, 0100, 0101, 1000, 1001 and 1010. Excluding 0000 (which leaves M in q₀) leaves ${ans6} accepted strings.`,
    },
    {
      type: 'S', level: 3,
      stem: 'Consider any deterministic finite state machine over a fixed input alphabet. Which statement must always be true?',
      options: [
        { text: 'Reversing which states are accepting and which are non-accepting, without changing the start state or transitions, makes the machine accept exactly the strings it previously rejected.', correct: true, why: 'Determinism gives each string one unique final state; flipping whether each state is accepting flips the verdict on every string.' },
        { text: 'Reversing the direction of every arrow in the transition diagram always produces another deterministic finite state machine.', why: 'After reversing arrows, a state may have two outgoing arrows or none for the same symbol: in M, q₂ has two incoming 0-arrows and q₀ has no incoming 1-arrow.' },
        { text: 'Adding a new symbol to the input alphabet while leaving the transitions unchanged leaves the machine deterministic.', why: 'A deterministic machine must define a next state for every state and every symbol in its alphabet; without transitions for the new symbol it is incomplete.' },
        { text: 'If the machine contains a trap state, it rejects every input string that has more symbols than the machine has states.', why: 'Machine M has 4 states and a trap state q₃, yet accepts 6-symbol strings such as 010100 that never take the transition into q₃.' },
      ],
      explanation: 'In a deterministic finite state machine, every input string over the alphabet follows a single determined path from the start state to one final state. The string is accepted if that final state is accepting and rejected if that final state is non-accepting. Swapping the accepting and non-accepting status of every state leaves every string ending in the same final state while reversing the verdict for every string.',
    },
  ],
};
