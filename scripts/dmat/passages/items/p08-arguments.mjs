// Full mock, passage 8. Area: humanities. Subject: arguments, validity, soundness and fallacies. Text only.
import { p } from '../lib.mjs';

// Question 2 uses a divisibility example; check its premises and conclusion really are true.
const divisor = 6;
const n2 = 12;
if (!(n2 % divisor === 0 && n2 % 2 === 0)) throw new Error('question 2: premises and conclusion must all be true');
// The counter-example: same form, true premises, false conclusion.
const counter = 4;
if (!(counter % 2 === 0 && counter % divisor !== 0)) throw new Error('question 2: the counter-example must be even and not divisible');

export default {
  id: 'p08',
  set: 'mock',
  area: 'humanities',
  title: 'Arguments, Validity and Fallacies',
  facts: [
    { claim: 'An argument consists of premises and a conclusion; the premises are intended to justify the conclusion.', source: 'https://iep.utm.edu/val-snd/', read: '2026-11-16' },
    { claim: 'A deductive argument is valid if and only if its form makes it impossible for the premises to be true and the conclusion false; validity depends on form, and valid arguments can have false premises and false conclusions.', source: 'https://iep.utm.edu/val-snd/', read: '2026-11-16' },
    { claim: 'An argument is sound if and only if it is valid and all its premises are actually true; sound arguments always have true conclusions.', source: 'https://iep.utm.edu/val-snd/', read: '2026-11-16' },
    { claim: 'An invalid argument can have true premises and a true conclusion.', source: 'https://iep.utm.edu/val-snd/', read: '2026-11-16' },
    { claim: 'Modus tollens (If P, then Q; not Q; therefore not P) is valid.', source: 'https://en.wikipedia.org/wiki/Modus_tollens', read: '2026-11-16' },
    { claim: 'Affirming the consequent is an invalid form, a formal fallacy; affirming the antecedent (modus ponens) is valid.', source: 'https://en.wikipedia.org/wiki/Affirming_the_consequent', read: '2026-11-16' },
    { claim: 'Denying the antecedent is a formal fallacy; a formal fallacy is an error in logical form.', source: 'https://en.wikipedia.org/wiki/Formal_fallacy', read: '2026-11-16' },
    { claim: 'Ad hominem: attacking the character, motive or another attribute of the person making an argument instead of the argument.', source: 'https://en.wikipedia.org/wiki/Ad_hominem', read: '2026-11-16' },
    { claim: 'Straw man: refuting a different, oversimplified or exaggerated version of the opponent\'s position.', source: 'https://en.wikipedia.org/wiki/Straw_man', read: '2026-11-16' },
    { claim: 'False dilemma: an informal fallacy that wrongly limits the options to two when others exist.', source: 'https://en.wikipedia.org/wiki/False_dilemma', read: '2026-11-16' },
  ],
  blocks: [
    p(
      'In logic, an argument is a set of statements in which some, the premises, are offered as reasons for another, the conclusion.',
      'For example: "All metals conduct electricity. Copper is a metal. So copper conducts electricity."',
      'Logic asks whether the premises really support the conclusion.',
    ),
    p(
      'A deductive argument is valid if its form makes it impossible for all its premises to be true while its conclusion is false: no argument of the same form has true premises and a false conclusion.',
      'Validity depends only on the form of the argument, that is, its structure rather than its subject matter.',
      'It does not depend on whether the premises are in fact true.',
      '"All fish can fly. A trout is a fish. So a trout can fly." is valid: if both premises were true, the conclusion would have to be true as well.',
      'It is still a poor argument, because its first premise is false.',
      'An argument is sound if it is valid and all its premises are true.',
      'The conclusion of a sound argument must therefore be true.',
      'The copper argument is sound; the trout argument is valid but not sound.',
    ),
    p(
      'Some forms are known by name.',
      'They start from a premise of the form "If P, then Q", in which P is called the antecedent and Q the consequent.',
      'Two forms are valid: modus ponens ("If P, then Q. P. So Q.") and modus tollens ("If P, then Q. Not Q. So not P.").',
      'Two forms look similar but are invalid: affirming the consequent ("If P, then Q. Q. So P.") and denying the antecedent ("If P, then Q. Not P. So not Q.").',
      'Take "If a plant gets no water, it wilts. This plant has wilted. So it got no water."',
      'The plant may have wilted from heat or disease, so the premises can be true while the conclusion is false: the argument affirms the consequent and is invalid.',
      'An invalid argument can happen to have true premises and a true conclusion; it is invalid because its premises do not guarantee its conclusion.',
    ),
    p(
      'A fallacy is a mistake in reasoning.',
      'Affirming the consequent and denying the antecedent are formal fallacies: the error lies in the form itself.',
      'Informal fallacies cannot be detected from the form alone; spotting them depends on the content and context, and three are especially common in debate.',
      'An ad hominem attacks the person who makes a claim, their character or motives, instead of the claim.',
      "A straw man misrepresents an opponent's position, usually as something more extreme or weaker than it is, and then refutes that version.",
      'A false dilemma presents two options as the only ones when there are others.',
      'Spotting a fallacy shows that an argument fails to support its conclusion; it does not show that the conclusion is false.',
    ),
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, when is an argument sound?',
      options: [
        { text: 'When its conclusion is true.', why: 'A true conclusion can come from an invalid argument or from false premises. Soundness is about the argument, not only its conclusion.' },
        { text: 'When it is valid.', why: 'Valid is not enough: the trout argument is valid but not sound, because a premise is false.' },
        { text: 'When it is valid and all its premises are true.', correct: true, why: 'This is the definition in the second paragraph.' },
        { text: 'When all its premises are true.', why: 'True premises are not enough: the premises must also guarantee the conclusion, which is validity.' },
      ],
      explanation: 'The second paragraph: an argument is sound if it is valid and all its premises are true. The copper argument is sound; the trout argument is valid but not sound.',
    },
    {
      type: 'C', level: 2,
      stem: `Consider the argument: "If a number is divisible by ${divisor}, it is even. ${n2} is even. So ${n2} is divisible by ${divisor}." Which description is correct?`,
      options: [
        { text: 'It is valid and sound.', why: 'It is not valid, so it cannot be sound.' },
        { text: 'It is valid but not sound.', why: 'It is not valid: it has the form of affirming the consequent.' },
        { text: 'It is invalid, because its conclusion is false.', why: `The conclusion is true: ${n2} ÷ ${divisor} = ${n2 / divisor}. A false conclusion is not what makes an argument invalid.` },
        { text: 'It is invalid, although its premises and its conclusion are true.', correct: true, why: `The form "If P, then Q. Q. So P." does not guarantee the conclusion: the same form with ${counter} in place of ${n2} has true premises and a false conclusion.` },
      ],
      explanation: `The argument has the form "If P, then Q. Q. So P.", affirming the consequent, which the text calls invalid. Both premises and the conclusion happen to be true, but the form does not guarantee the conclusion: put ${counter} in place of ${n2} and the premises stay true while the conclusion becomes false. The third paragraph says an invalid argument can have true premises and a true conclusion.`,
    },
    {
      type: 'C', level: 2,
      stem: 'Which form does this argument have? "If the library is open, the lights in the reading room are on. The library is not open. So the lights in the reading room are not on."',
      options: [
        { text: 'Denying the antecedent.', correct: true, why: 'The form is "If P, then Q. Not P. So not Q." The lights could be on for a cleaner even when the library is closed.' },
        { text: 'Modus ponens.', why: 'Modus ponens has the second premise "P" (the library is open). Here the second premise is "not P".' },
        { text: 'Modus tollens.', why: 'Modus tollens has the second premise "not Q" (the lights are not on). Here the second premise denies P instead.' },
        { text: 'Affirming the consequent.', why: 'That form has the second premise "Q" (the lights are on). Here the second premise is "not P".' },
      ],
      explanation: 'P is "the library is open" and Q is "the lights in the reading room are on". The second premise is "not P" and the conclusion "not Q": the third paragraph calls this form denying the antecedent, and it is invalid.',
    },
    {
      type: 'S', level: 3,
      stem: 'Which statement is true of every valid argument?',
      options: [
        { text: 'Its conclusion is true.', why: 'The trout argument is valid and its conclusion, that a trout can fly, is false.' },
        { text: 'If its conclusion is false, at least one of its premises is false.', correct: true, why: 'If all the premises were true, a valid argument could not have a false conclusion.' },
        { text: 'If one of its premises is false, its conclusion is false.', why: 'A valid argument with a false premise can still have a true conclusion, such as "All fish are mammals. A whale is a fish. So a whale is a mammal."' },
        { text: 'All its premises are true.', why: 'Validity says nothing about whether the premises are true; the trout argument is valid with a false premise.' },
      ],
      explanation: 'Valid means it is impossible for all the premises to be true and the conclusion false. So if the conclusion of a valid argument is false, the premises cannot all be true. Nothing follows the other way: false premises can lead to a true or a false conclusion.',
    },
    {
      type: 'T', level: 3,
      stem: 'Consider the argument: "If a substance is a metal, it is liquid at room temperature. Iron is not liquid at room temperature. So iron is not a metal." Which description is correct?',
      options: [
        { text: 'It is valid and sound.', why: 'Its first premise is false, since most metals, iron among them, are solid at room temperature; so it is not sound.' },
        { text: 'It is valid but not sound.', correct: true, why: 'It has the valid form of modus tollens, but its first premise is false.' },
        { text: 'It is invalid, because it denies the antecedent.', why: 'The second premise denies the consequent ("not liquid"), not the antecedent. That is modus tollens, which is valid.' },
        { text: 'It is invalid, because its conclusion is false.', why: 'A false conclusion does not make an argument invalid. Here it comes from a false premise in a valid form.' },
      ],
      explanation: 'P is "the substance is a metal" and Q is "it is liquid at room temperature". The argument runs "If P, then Q. Not Q. So not P.": modus tollens, which is valid. But the first premise is false, so the argument is not sound, and its conclusion is false too. This is the trout case from the second paragraph in another form.',
    },
    {
      type: 'C', level: 2,
      stem: 'Sam argues that the university library should stay open until midnight during the exam period. Which reply is an ad hominem?',
      options: [
        { text: '"Sam only wants this because Sam never plans ahead, so we can ignore the argument."', correct: true, why: 'This attacks Sam\'s character and motives instead of the proposal.' },
        { text: '"Sam wants the library open all night, every night of the year, and we could never pay for that."', why: 'This replaces Sam\'s proposal with a more extreme one and attacks that: a straw man.' },
        { text: '"Either we keep the present hours or we double the student fees, and nobody wants higher fees."', why: 'This offers two options as if they were the only ones: a false dilemma.' },
        { text: '"Staying open until midnight would need two more staff each night, and the budget does not cover them."', why: 'This answers the proposal itself with a reason about cost. It may be right or wrong, but it is not a fallacy of the kinds in the text.' },
      ],
      explanation: 'The fourth paragraph: an ad hominem attacks the person, their character or motives, instead of the claim. Only the first reply does that. The second is a straw man, the third a false dilemma, and the fourth addresses the proposal itself.',
    },
  ],
};
