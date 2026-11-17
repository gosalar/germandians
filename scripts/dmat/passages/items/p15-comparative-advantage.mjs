// Practice set, economics. Subject: comparative advantage.
import { fixed, numericOptions, p, whole } from '../lib.mjs';

// ---------- Table 1: output per worker per day on two islands ----------
const kova = { name: 'Kova', fish: 15, baskets: 5 };
const tari = { name: 'Tari', fish: 6, baskets: 3 };
const inTable = [kova.fish, kova.baskets, tari.fish, tari.baskets];
if (new Set(inTable).size !== inTable.length) throw new Error('every number in Table 1 must be different');
const costOfBasket = (x) => x.fish / x.baskets; // fish given up per basket
const costOfFish = (x) => x.baskets / x.fish; // baskets given up per fish
if (!(kova.fish > tari.fish && kova.baskets > tari.baskets)) throw new Error('Kova must have an absolute advantage in both goods');
if (!(costOfBasket(tari) < costOfBasket(kova))) throw new Error('Tari must have the comparative advantage in baskets');

// Question 5: a price of baskets in fish at which both gain lies strictly between the two costs.
const low = costOfBasket(tari);
const high = costOfBasket(kova);
const fair = (low + high) / 2;
const prices5 = [low - 0.5, fair, high + 0.5, low];
if (prices5.filter((x) => x > low && x < high).length !== 1) throw new Error('question 5 needs exactly one price between the two costs');

// Question 6: Tari's fishing improves.
const tariAfter = { ...tari, fish: 12 };
if (!(costOfBasket(tariAfter) > costOfBasket(kova) && tariAfter.fish < kova.fish)) throw new Error('question 6: the advantage must flip while Kova keeps its absolute advantage');

// Question 7: the gain from specialising. Each island has the same number of worker-days.
const days = 60;
const split = (x) => ({ fish: (days / 2) * x.fish, baskets: (days / 2) * x.baskets });
const before = { fish: split(kova).fish + split(tari).fish, baskets: split(kova).baskets + split(tari).baskets };
const tariBaskets = days * tari.baskets; // Tari makes only baskets
const kovaBasketDays = (before.baskets - tariBaskets) / kova.baskets; // Kova makes the rest
if (!Number.isInteger(kovaBasketDays) || kovaBasketDays < 0) throw new Error('question 7 needs whole worker-days');
const afterFish = (days - kovaBasketDays) * kova.fish;
const gain = afterFish - before.fish;
const kovaAllFish = days * kova.fish - before.fish;
if (!(gain > 0)) throw new Error('question 7 needs a gain');

const fish = (v) => `${Number(fixed(v, 2))} fish`;

export default {
  id: 'p15',
  set: 'practice',
  area: 'economics',
  title: 'Comparative Advantage',
  facts: [
    { claim: 'Opportunity cost is the value of the best alternative forgone when choosing between mutually exclusive options.', source: 'https://en.wikipedia.org/wiki/Opportunity_cost', read: '2026-11-16' },
    { claim: 'Absolute advantage: producing a good more efficiently than a competitor, compared through labour productivity (fewer labour hours per unit).', source: 'https://en.wikipedia.org/wiki/Absolute_advantage', read: '2026-11-16' },
    { claim: 'Comparative advantage means producing a good at a lower relative opportunity cost; a country with an absolute advantage in both goods can still gain, and comparative rather than absolute advantage explains trade.', source: 'https://en.wikipedia.org/wiki/Comparative_advantage', read: '2026-11-16' },
    { claim: 'If each country specialises according to comparative advantage, world output of both goods can rise and both can consume more.', source: 'https://en.wikipedia.org/wiki/Comparative_advantage', read: '2026-11-16' },
    { claim: 'Terms of trade that benefit both countries lie between their two opportunity costs.', source: 'https://en.wikipedia.org/wiki/Comparative_advantage', read: '2026-11-16' },
  ],
  blocks: [
    p(
      'Why do countries trade even when one of them is better at making everything?',
      'The answer rests on opportunity cost: the cost of a choice measured by the best alternative given up.',
      'A worker who spends a day making baskets cannot spend that day fishing, so the opportunity cost of the baskets is the fish that could have been caught instead.',
    ),
    p(
      'Table 1 shows what one worker can produce in a day on two islands, Kova and Tari.',
      'Kova\'s workers produce more of both goods: Kova has an absolute advantage in both, meaning it makes each good with less work.',
      'The opportunity costs, however, can tell a different story.',
      'On each island, a worker who makes one basket gives up the fish they could have caught in the same time, and that number of fish is the cost of the basket.',
      'An island has a comparative advantage in a good if it produces that good at a lower opportunity cost than the other island.',
      'Since a lower cost of baskets in fish means a higher cost of fish in baskets, each island has a comparative advantage in exactly one good, unless the costs are equal.',
    ),
    {
      type: 'table',
      caption: 'Table 1. Output of one worker in one day.',
      head: ['Island', 'Fish', 'Baskets'],
      rows: [kova, tari].map((x) => [x.name, `${x.fish}`, `${x.baskets}`]),
    },
    p(
      'If each island specialises in the good in which it has the comparative advantage and then trades, the two islands together can produce more of one good without producing less of the other.',
      'What matters is the comparison of opportunity costs, not who is faster: absolute advantage alone does not decide who should make what.',
    ),
    p(
      'For both islands to gain, the rate at which they exchange the goods, called the terms of trade, must lie between their two opportunity costs.',
      'An island will not pay more fish for a basket than a basket costs it to make at home, and it will not sell a basket for fewer fish than making it costs.',
      'Any price strictly between the two costs leaves both islands better off than producing everything themselves.',
      'This reasoning assumes that the output per worker stays the same however much is produced and that moving goods between the islands costs nothing.',
    ),
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, when does an island have a comparative advantage in a good?',
      options: [
        { text: 'When it produces that good at a lower opportunity cost than the other island.', correct: true, why: 'This is the definition in the second paragraph.' },
        { text: 'When one of its workers produces more of that good in a day than a worker on the other island.', why: 'That is an absolute advantage. Kova has it in both goods, but a comparative advantage in only one.' },
        { text: 'When it produces more of that good than of the other good.', why: 'Comparing an island\'s two outputs says nothing about the other island.' },
        { text: 'When it can sell that good at a higher price than the other island.', why: 'The definition compares opportunity costs of production, not selling prices.' },
      ],
      explanation: 'The second paragraph: an island has a comparative advantage in a good if it produces it at a lower opportunity cost than the other island. Producing more per worker is an absolute advantage.',
    },
    {
      type: 'A', level: 2,
      stem: 'According to Table 1, what is the opportunity cost of one basket on Kova?',
      options: numericOptions(
        { value: costOfBasket(kova), why: `In a day a worker makes ${kova.baskets} baskets or catches ${kova.fish} fish, so one basket costs ${kova.fish} ÷ ${kova.baskets} fish.` },
        [
          { value: costOfFish(kova), why: `This is the cost of one fish in baskets, ${kova.baskets} ÷ ${kova.fish}, not the cost of a basket in fish.` },
          { value: kova.baskets, why: 'This is the number of baskets a worker makes in a day.' },
          { value: kova.fish - kova.baskets, why: 'This subtracts the two outputs. The cost of one basket is a ratio: the fish given up per basket made.' },
        ],
        fish,
      ),
      explanation: `A Kova worker can make ${kova.baskets} baskets or catch ${kova.fish} fish in a day. Making ${kova.baskets} baskets gives up ${kova.fish} fish, so one basket gives up ${kova.fish} ÷ ${kova.baskets} = ${costOfBasket(kova)} fish.`,
    },
    {
      type: 'C', level: 2,
      stem: 'According to Table 1, which island has the comparative advantage in which good?',
      options: [
        { text: 'Kova in both goods.', why: 'Kova has the absolute advantage in both, but a lower cost in baskets means a higher cost in fish, so it cannot have the lower cost in both.' },
        { text: 'Kova in baskets, Tari in fish.', why: `A basket costs ${costOfBasket(kova)} fish on Kova but only ${costOfBasket(tari)} on Tari, so Tari has the lower cost of baskets.` },
        { text: 'Kova in fish, Tari in baskets.', correct: true, why: `A basket costs ${costOfBasket(tari)} fish on Tari against ${costOfBasket(kova)} on Kova; a fish costs ${fixed(costOfFish(kova), 2)} baskets on Kova against ${fixed(costOfFish(tari), 2)} on Tari.` },
        { text: 'Tari in both goods.', why: 'Tari\'s workers produce less of both, and as with Kova, no island can have the lower cost in both goods.' },
      ],
      explanation: `Baskets: ${kova.fish} ÷ ${kova.baskets} = ${costOfBasket(kova)} fish each on Kova, ${tari.fish} ÷ ${tari.baskets} = ${costOfBasket(tari)} on Tari, so Tari has the comparative advantage in baskets. Fish: ${kova.baskets} ÷ ${kova.fish} = ${fixed(costOfFish(kova), 2)} baskets each on Kova, ${tari.baskets} ÷ ${tari.fish} = ${fixed(costOfFish(tari), 2)} on Tari, so Kova has it in fish.`,
    },
    {
      type: 'S', level: 2,
      stem: 'Kova\'s workers produce more of both goods than Tari\'s. Which statement follows from the text?',
      options: [
        { text: 'Kova gains nothing from trading with Tari.', why: 'If Kova makes fewer baskets and buys them for less than they cost it at home, it ends up with more in total.' },
        { text: 'Tari should produce neither good.', why: 'Tari has the comparative advantage in baskets, so it should make baskets.' },
        { text: 'Tari can only gain if it becomes faster than Kova at one good.', why: 'Comparative advantage depends on opportunity costs, not on being faster.' },
        { text: 'Both islands can gain by specialising and trading.', correct: true, why: 'Each has a comparative advantage in one good, and any price between the two costs leaves both better off.' },
      ],
      explanation: 'The third and fourth paragraphs: what matters is the comparison of opportunity costs, not who is faster. Each island has a comparative advantage in one good, so both can gain from specialising and trading at a price between their costs.',
    },
    {
      type: 'T', level: 2,
      stem: 'Tari sells baskets to Kova and is paid in fish. At which of these prices per basket do both islands gain?',
      options: numericOptions(
        { value: fair, why: `This lies between Tari's cost of ${costOfBasket(tari)} fish and Kova's cost of ${costOfBasket(kova)} fish.` },
        [
          { value: low - 0.5, why: `This is below Tari's own cost of ${costOfBasket(tari)} fish per basket, so Tari would lose by selling.` },
          { value: high + 0.5, why: `This is above Kova's own cost of ${costOfBasket(kova)} fish per basket, so Kova would rather make its own baskets.` },
          { value: low, why: `This equals Tari's own cost of ${costOfBasket(tari)} fish per basket, so Tari gains nothing. For both to gain, the price must lie strictly between the two costs.` },
        ],
        fish,
      ),
      explanation: `A basket costs Tari ${costOfBasket(tari)} fish to make and Kova ${costOfBasket(kova)} fish. Tari gains if it gets more than ${costOfBasket(tari)} fish per basket; Kova gains if it pays less than ${costOfBasket(kova)}. Only ${fish(fair)} lies strictly between.`,
    },
    {
      type: 'D', level: 3,
      stem: `New boats raise the catch on Tari to ${tariAfter.fish} fish per worker per day; basket-making on both islands and fishing on Kova stay as in Table 1. Which island then has the comparative advantage in baskets?`,
      options: [
        { text: 'Tari.', why: `A basket would cost ${costOfBasket(tariAfter)} fish on Tari, more than the ${costOfBasket(kova)} on Kova.` },
        { text: 'Neither island.', why: `That would need equal costs. A basket would cost ${costOfBasket(tariAfter)} fish on Tari and ${costOfBasket(kova)} on Kova.` },
        { text: 'Kova.', correct: true, why: `A basket would cost ${costOfBasket(kova)} fish on Kova against ${costOfBasket(tariAfter)} on Tari.` },
        { text: 'Both islands.', why: 'Only one island can have the lower cost of a basket, and so the comparative advantage in it.' },
      ],
      explanation: `On Tari a basket would cost ${tariAfter.fish} ÷ ${tariAfter.baskets} = ${costOfBasket(tariAfter)} fish, more than the ${kova.fish} ÷ ${kova.baskets} = ${costOfBasket(kova)} on Kova. Kova has the lower cost, so it has the comparative advantage in baskets, although Tari's workers still catch fewer fish than Kova's.`,
    },
    {
      type: 'T', level: 3,
      stem: `Each island has ${days} worker-days. At first each spends half of them on fish and half on baskets. Then Tari makes only baskets, and Kova makes the baskets still needed to keep the total number of baskets the same, and spends the rest of its days fishing. How many more fish do the two islands catch in total?`,
      options: numericOptions(
        { value: gain, why: `Total fish rise from ${whole(before.fish)} to ${whole(afterFish)}, with ${whole(before.baskets)} baskets before and after.` },
        [
          { value: 0, why: 'Specialising by comparative advantage raises total output; it does not only move it between the islands.' },
          { value: split(tari).fish, why: `This is the ${whole(split(tari).fish)} fish Tari gives up, not the change in the total.` },
          { value: kovaAllFish, why: `This lets Kova fish all ${days} days, but then the islands would have only ${whole(tariBaskets)} baskets, fewer than before.` },
        ],
        (v) => whole(v),
      ),
      explanation: `Before: fish ${whole(split(kova).fish)} + ${whole(split(tari).fish)} = ${whole(before.fish)}; baskets ${whole(split(kova).baskets)} + ${whole(split(tari).baskets)} = ${whole(before.baskets)}. After: Tari makes ${days} × ${tari.baskets} = ${whole(tariBaskets)} baskets, so Kova needs ${whole(before.baskets - tariBaskets)} more, which take ${kovaBasketDays} days; its other ${days - kovaBasketDays} days catch ${whole(afterFish)} fish. The total rises by ${whole(gain)} fish with the same number of baskets.`,
    },
  ],
};
