// Practice set, humanities. Subject: source criticism. Text only.
import { p } from '../lib.mjs';

// The dates in the questions, kept apart so each can be checked against the definitions.
const strike = 1923;
const book = 1998;
const encyclopedia = 2010;
const review = 1953;
if (!(book > strike && encyclopedia > strike && review > strike)) throw new Error('later sources must come after the event');
const accounts = 3;
const copied = 2;
const injured = 6;
const word = (n) => ['None', 'One', 'Two', 'Three', 'Four'][n];
const paperFrom = 1960;
if (!(paperFrom > strike)) throw new Error('question 6: the paper must be later than the date on the diary');

export default {
  id: 'p17',
  set: 'practice',
  area: 'humanities',
  title: 'Source Criticism',
  facts: [
    { claim: 'A primary source is an artifact, document, diary, manuscript, recording or other source created at the time under study; letters by participants and eyewitness accounts are examples.', source: 'https://en.wikipedia.org/wiki/Primary_source', read: '2026-11-16' },
    { claim: 'Primary and secondary are relative terms that depend on the context and purpose of the study.', source: 'https://en.wikipedia.org/wiki/Primary_source', read: '2026-11-16' },
    { claim: 'A secondary source interprets and analyses original information from a later perspective.', source: 'https://en.wikipedia.org/wiki/Secondary_source', read: '2026-11-16' },
    { claim: 'A tertiary source, such as an encyclopedia or reference book, consolidates already published primary and secondary sources.', source: 'https://en.wikipedia.org/wiki/Tertiary_source', read: '2026-11-16' },
    { claim: 'A source may be forged or corrupted; the closer a source is to the event, the more it can be trusted; a source\'s motivation can bias it; if independent sources contain the same message, its credibility is strongly increased.', source: 'https://en.wikipedia.org/wiki/Source_criticism', read: '2026-11-16' },
    { claim: 'A primary source is not necessarily more authoritative than a secondary one; eyewitnesses can distort.', source: 'https://en.wikipedia.org/wiki/Primary_source', read: '2026-11-16' },
  ],
  blocks: [
    p(
      'Historians cannot observe the past; they reconstruct it from sources: letters, diaries, official records, newspapers, photographs, buildings and objects.',
      'Source criticism is the careful judging of how far a source can be trusted for a particular question.',
    ),
    p(
      'Historians mainly distinguish primary and secondary sources; reference guides often add a third kind, tertiary sources.',
      'A primary source was created at the time under study, often by people who took part in the events or saw them: the minutes of a meeting, a soldier\'s letter, a photograph.',
      'A secondary source was made later by someone looking back, who interprets and analyses primary sources; a historian\'s book is the typical example.',
      'A tertiary source, such as an encyclopedia or a reference book, collects and summarises what primary and secondary sources say.',
      'These labels depend on the question being asked.',
      'A school textbook written in the 1960s about an event in 1900 is a secondary source on that event, but a primary source for anyone studying how history was taught in the 1960s.',
    ),
    p(
      'Criticism starts with two separate questions.',
      'The first is whether the source is genuine: is it what it claims to be, made by the stated author at the stated time, or was it forged or altered later?',
      'The second is whether what it says is credible.',
      'Here the historian asks who made the source, when, and for what purpose.',
      'A source made close in time to the events, by someone who was there, is generally trusted more than one written many years later from memory.',
      'An author who had a reason to show events in a particular light, to defend themselves or to win support, may have distorted them; a record kept for a routine purpose, by people with nothing to gain from distortion, has less reason to mislead.',
    ),
    p(
      'Finally, historians compare sources.',
      'When several independent sources report the same thing, their agreement strongly raises its credibility.',
      'The sources must really be independent: if one source copied from another, their agreement adds nothing, because the claim still rests on a single origin.',
      'None of these rules works automatically.',
      'A primary source is not always right, since eyewitnesses can be mistaken or biased, and a careful secondary source that weighs many primary sources can be more accurate on some points than any one of them.',
    ),
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what is a primary source?',
      options: [
        { text: 'A source that was created at the time under study.', correct: true, why: 'This is the definition in the second paragraph; it is often made by people who took part or saw the events.' },
        { text: 'The most reliable source on a question.', why: 'The text says a primary source is not always right; eyewitnesses can be mistaken or biased.' },
        { text: 'A source written later that interprets earlier sources.', why: 'That is a secondary source.' },
        { text: 'A source that collects and summarises other sources.', why: 'That is a tertiary source, such as an encyclopedia.' },
      ],
      explanation: 'The second paragraph: a primary source was created at the time under study, often by people who took part in the events or saw them.',
    },
    {
      type: 'C', level: 1,
      stem: `A student is studying a dock strike in ${strike}. Using the text's definitions, which of these is a secondary source for that study?`,
      options: [
        { text: `The minutes of the strike committee's meetings in ${strike}.`, why: 'Made at the time by people who took part: a primary source.' },
        { text: `An encyclopedia entry from ${encyclopedia} that summarises what is known about the strike.`, why: 'Collecting and summarising what other sources say makes it a tertiary source.' },
        { text: `A historian's book from ${book} that analyses the strike using the committee's minutes and the strikers' letters.`, correct: true, why: 'Made later by someone looking back who interprets primary sources.' },
        { text: `A diary kept by one of the strikers in ${strike}.`, why: 'Made at the time by a participant: a primary source.' },
      ],
      explanation: 'The second paragraph: a secondary source was made later by someone looking back, who interprets and analyses primary sources. The historian\'s book does that. The minutes and the diary date from the strike itself; the encyclopedia entry summarises other sources, which makes it tertiary.',
    },
    {
      type: 'C', level: 3,
      stem: `A newspaper article from ${review} reviews three books about the dock strike of ${strike}. A researcher uses it to study how the strike was remembered in the 1950s. For this study, what kind of source is the article?`,
      options: [
        { text: `A secondary source, because it was written ${review - strike} years after the strike.`, why: `Written ${review - strike} years after the strike, it would not be a primary source for a study of the strike itself. This study, though, is about the 1950s.` },
        { text: 'A tertiary source, because it summarises books.', why: 'For this study the article is not a summary to rely on but a piece of evidence from the time being studied.' },
        { text: 'Not a source at all, because it only discusses other people\'s books.', why: 'It is evidence of how people in the 1950s wrote about the strike, which is exactly what the study is about.' },
        { text: 'A primary source, because it was created at the time the study is about.', correct: true, why: 'The study is about the 1950s, and the article was written then.' },
      ],
      explanation: `The second paragraph says the labels depend on the question. For a study of the strike itself, an article written ${review - strike} years later that reviews books would not be a primary source. But this study is about how the strike was remembered in the 1950s, so an article written in ${review} is a primary source for it, as the textbook example in the text shows.`,
    },
    {
      type: 'S', level: 2,
      stem: `${word(accounts)} accounts of a fire agree on the number of buildings destroyed. It turns out that ${word(copied).toLowerCase()} of them copied the figure from the third. What follows?`,
      options: [
        { text: `The figure is ${accounts} times as credible as if only one account gave it.`, why: 'Credibility is not multiplied by the number of accounts, and here the copies add nothing, because the figure has a single origin.' },
        { text: 'The figure must be wrong.', why: 'Copying does not make a figure wrong; the original account may still be right.' },
        { text: `All ${accounts} accounts must be set aside.`, why: 'The original account remains a source; only the extra weight from agreement is lost.' },
        { text: 'The agreement gives the figure no more support than the one original account does.', correct: true, why: 'The figure rests on a single origin, as the last paragraph says.' },
      ],
      explanation: 'The last paragraph: agreement raises credibility only when the sources are independent. If one source copied from another, their agreement adds nothing, because the claim still rests on a single origin.',
    },
    {
      type: 'T', level: 3,
      stem: `After a fire at a factory, the owner writes a public letter saying that no workers were hurt. The local hospital's admissions list from the same night records ${injured} workers from the factory treated for burns. For the question of whether workers were hurt, which source is more credible, and why?`,
      options: [
        { text: 'The owner\'s letter, because the owner knew the factory best.', why: 'Knowing the factory does not remove the owner\'s reason to play down injuries in a public letter.' },
        { text: 'Both equally, because both are primary sources from the same time.', why: 'Being primary and close in time is only part of the judgement; the purpose and the author\'s interests also count.' },
        { text: 'The hospital list, because it was kept to record patients, not to persuade anyone.', correct: true, why: 'The owner had a reason to show the fire in a good light; the hospital staff did not.' },
        { text: 'Neither, because primary sources cannot be trusted.', why: 'The text says primary sources are not always right, not that they can never be trusted.' },
      ],
      explanation: 'Both sources are primary and made at the time. The third paragraph adds the purpose and the author\'s interests: the owner had a reason to show the fire in a good light, while the hospital list was kept for a routine purpose by people with nothing to gain from distortion.',
    },
    {
      type: 'C', level: 2,
      stem: `A diary dated ${strike} turns out to be written on a kind of paper that was first made in ${paperFrom}. Which question does this finding mainly concern?`,
      options: [
        { text: 'Whether the source is genuine.', correct: true, why: `Paper first made in ${paperFrom} cannot carry a diary written in ${strike}: this copy is either a forgery or a later copy, which is a question of whether it is genuine.` },
        { text: 'Whether its author had a reason to distort events.', why: 'That is a question about the credibility of a genuine source\'s content.' },
        { text: 'Whether other independent sources agree with it.', why: 'That is a comparison with other sources; the finding is about the diary itself.' },
        { text: 'Whether it is a primary or a secondary source.', why: `The finding shows the diary was not made in ${strike}, which first of all means it is not what it claims to be.` },
      ],
      explanation: 'The third paragraph separates two questions: whether a source is genuine, and whether its content is credible. A diary written on paper made decades after its stated date was not made at the stated time, so the finding concerns whether it is genuine.',
    },
  ],
};
