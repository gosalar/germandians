// Full mock 3, passage 8. Area: social sciences. Subject: public goods, collective action and free riding.
import { p, whole } from '../lib.mjs';

// ---------- Question 6: a 10-household lane-lighting collective-action game ----------
const households = 10;
const lampCost = 80;
const benefitEach = 15;
const groupBenefitPerLamp = households * benefitEach;
const netIfAllContribute = groupBenefitPerLamp - lampCost;
const privateLossFromContributing = lampCost - benefitEach;
const thresholdLamps = Math.ceil(lampCost / benefitEach); // 6 lamps gives 6 * 15 = 90 > 80
const halfHouseholds = households / 2;

if (!(benefitEach < lampCost && groupBenefitPerLamp > lampCost)) {
  throw new Error('question 6 requires a prisoner-dilemma public-good structure');
}
const q6Numbers = [households, benefitEach, privateLossFromContributing, netIfAllContribute, lampCost, groupBenefitPerLamp];
if (new Set(q6Numbers).size !== q6Numbers.length) {
  throw new Error('question 6 payoff numbers must all be distinct');
}

const euro = (v) => `€${whole(v)}`;
const numberWord = (n) => ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'][n];

export default {
  id: 'p34',
  set: 'mock',
  mock: 3,
  area: 'social sciences',
  title: 'Public Goods and Collective Action',
  facts: [
    { claim: 'A good is rivalrous if one person\'s consumption diminishes others\' ability to consume it, and excludable if it is possible to prevent individuals who do not pay from consuming it.', source: 'https://plato.stanford.edu/entries/public-goods/', read: '2026-11-18' },
    { claim: 'Combining rivalry and excludability yields four categories: private goods (rivalrous, excludable), club goods (non-rivalrous, excludable), common-pool resources (rivalrous, non-excludable), and public goods (non-rivalrous, non-excludable).', source: 'https://plato.stanford.edu/entries/public-goods/', read: '2026-11-18' },
    { claim: 'Whether a good is a public good in this sense depends on non-rivalry and non-excludability rather than on whether the state supplies it; private firms can supply public goods (such as broadcast radio funded by advertising), and congestion can shift a good\'s classification.', source: 'https://openstax.org/books/principles-economics-3e/pages/13-3-public-goods', read: '2026-11-18' },
    { claim: 'In a collective-action free-rider problem, when the cost of one member\'s contribution exceeds the resulting private benefit to that member alone, each member has an incentive not to contribute even when universal contribution would leave everyone better off.', source: 'https://plato.stanford.edu/entries/free-rider/', read: '2026-11-18' },
    { claim: 'The free-rider problem has two manifestations: under-provision (some contribute while free riders benefit without contributing) and non-production (nobody contributes, so no public good is produced on which anyone could free ride).', source: 'https://plato.stanford.edu/entries/free-rider/', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'Social scientists classify goods and shared resources along two dimensions.',
      'A good is excludable if it is practical to stop people who have not paid, or who lack permission, from using it; it is non-excludable if, once supplied, nobody nearby can reasonably be kept from benefiting.',
      'A good is rivalrous if one person\'s use leaves less of it for others, and non-rivalrous if one person\'s use does not diminish anyone else\'s ability to use it at the same time.',
    ),
    p(
      'Crossing these two criteria produces the four categories in Table 1.',
      'A loaf of bread is a private good: a shop can withhold it until paid, and eating it leaves none for anyone else.',
      'An encrypted weather-data feed is a club good: a password keeps non-subscribers out, yet one subscriber reading the forecast takes nothing from another.',
      'Wild fish in open coastal waters are a common-pool resource: boats are hard to keep out, while every fish landed leaves one fewer in the water.',
      'Flood defences protecting a valley and street lighting are public goods: they protect or light the way for everyone there at once, payers and non-payers alike.',
    ),
    {
      type: 'table',
      caption: 'Table 1. Four categories of goods classified by excludability and rivalry.',
      head: ['Access \\ Consumption', 'Rivalrous', 'Non-rivalrous'],
      rows: [
        ['Excludable', 'Private goods', 'Club goods'],
        ['Non-excludable', 'Common-pool resources', 'Public goods'],
      ],
    },
    p(
      'In this framework, calling something a public good describes how it is consumed, not who pays for it.',
      'A city council may hand out rivalrous, excludable items such as school meals, which remain private goods, whereas a private broadcaster may supply free-to-air radio — non-excludable and non-rivalrous — by selling advertisements alongside it.',
      'Conditions also matter: an untolled highway is non-excludable and non-rivalrous late at night, when extra cars slow nobody down, whereas during a traffic jam road space becomes rivalrous, turning the same road into a common-pool resource.',
    ),
    p(
      'Providing a public good or conserving a common-pool resource requires collective action, in which group members contribute money, effort or restraint toward a shared benefit.',
      'Because a public good is non-excludable, an individual can hope to free ride: enjoy what others pay for while contributing nothing.',
      'When one member\'s contribution costs more than the extra benefit that contribution alone brings back to that member, self-interest pushes each member to hold back, even though all members would be better off if everyone contributed.',
      'This free-rider problem can end in under-provision, where some contribute and others free ride, or in non-production, where everyone holds back so the good is never produced at all and nobody has anything to free ride on.',
      'Common-pool resources face a parallel trap of overuse, because each user keeps the full gain of taking an extra unit while sharing the depletion cost with the whole group.',
      'Groups and governments address both problems through compulsory taxes, enforceable quotas, community monitoring with penalties, or tying excludable member benefits to contributions.',
    ),
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what makes a good non-rivalrous?',
      options: [
        { text: 'Once the good is provided, it is impossible or too costly to stop non-payers from benefiting.', why: 'That defines non-excludability, the access dimension, rather than non-rivalry in consumption.' },
        { text: 'The good is funded through public taxation and supplied by a local or national government.', why: 'Government funding does not define non-rivalry; governments also supply rivalrous private goods such as school meals.' },
        { text: 'Every person in the community places the same monetary value on using the good.', why: 'Non-rivalry concerns whether one person\'s use reduces availability for others, not whether everyone values it equally.' },
        { text: 'One person using the good does not diminish other people\'s ability to use it at the same time.', correct: true, why: 'This is the definition of non-rivalrous consumption in the first paragraph.' },
      ],
      explanation: 'The first paragraph defines a good as non-rivalrous when one person\'s use does not diminish anyone else\'s ability to use it at the same time.',
    },
    {
      type: 'F', level: 1,
      stem: 'According to Table 1, which category of goods is both non-excludable and rivalrous?',
      options: [
        { text: 'Common-pool resources.', correct: true, why: 'In Table 1, the "Non-excludable" row and "Rivalrous" column intersect at common-pool resources.' },
        { text: 'Club goods.', why: 'Table 1 places club goods in the excludable and non-rivalrous cell.' },
        { text: 'Public goods.', why: 'Table 1 places public goods in the non-excludable and non-rivalrous cell.' },
        { text: 'Private goods.', why: 'Table 1 places private goods in the excludable and rivalrous cell.' },
      ],
      explanation: 'Reading the "Non-excludable" row and the "Rivalrous" column of Table 1 gives common-pool resources, such as wild fish in open coastal waters.',
    },
    {
      type: 'C', level: 2,
      stem: 'Using the definitions in the text and Table 1, which of the following is an example of a club good?',
      options: [
        { text: 'Wild shellfish on an open shoreline where anyone may gather them, and every basket gathered leaves less for others.', why: 'Open access makes it non-excludable and depletion makes it rivalrous: a common-pool resource.' },
        { text: 'A coastal lighthouse beam visible to every passing ship regardless of payment, without growing dimmer as more ships look.', why: 'Ships cannot be excluded from seeing the beam and viewing is non-rivalrous: a public good.' },
        { text: 'An online journal archive behind a paid subscriber login, where one reader downloading a paper never blocks other subscribers.', correct: true, why: 'The login makes access excludable, while digital reading is non-rivalrous across subscribers: a club good.' },
        { text: 'Fresh sandwiches sold at a campus café, where only paying customers receive one and eating a sandwich leaves none for others.', why: 'Payment makes it excludable and consumption is rivalrous: a private good.' },
      ],
      explanation: 'A club good is excludable and non-rivalrous. A paid subscriber login excludes non-payers, while one subscriber reading a digital paper does not reduce availability for other subscribers.',
    },
    {
      type: 'D', level: 2,
      stem: 'A city ring road has no tolls or entry barriers. Late at night traffic is light and extra cars do not slow anyone down; at morning rush hour no tolls are added, yet every extra car slows the traffic behind it. In the terms of Table 1, how does the road shift between late night and rush hour?',
      options: [
        { text: 'From a club good at night to a private good at rush hour, as congestion creates exclusion.', why: 'No toll or barrier is added at rush hour, so the road is non-excludable at both times.' },
        { text: 'From a public good at night to a common-pool resource at rush hour, as use turns rivalrous.', correct: true, why: 'Without tolls the road stays non-excludable, while congestion changes consumption from non-rivalrous to rivalrous.' },
        { text: 'From a private good at night to a club good at rush hour, as more drivers share the lanes.', why: 'An untolled road is non-excludable, and rush-hour crowding makes use more rivalrous rather than less.' },
        { text: 'From a common-pool resource at night to a public good at rush hour, as commuters travel together.', why: 'This reverses rivalry: road space is non-rivalrous in light night traffic and rivalrous during a rush-hour jam.' },
      ],
      explanation: 'Without tolls or barriers the ring road is non-excludable at both times. Late at night one driver does not delay others (non-rivalrous: a public good); at rush hour each additional car reduces speed and space for others (rivalrous: a common-pool resource).',
    },
    {
      type: 'S', level: 2,
      stem: 'Which statement follows from the text\'s analysis of public goods and the free-rider problem?',
      options: [
        { text: 'A broadcast service provided by a private company and funded by advertisements can still be a public good.', correct: true, why: 'Public-good status depends on non-excludability and non-rivalry, not on state provision; the third paragraph gives free-to-air commercial radio as an example.' },
        { text: 'Every item a local council provides free of charge to residents, such as a packed meal, is a public good.', why: 'A packed meal is rivalrous and excludable, so it remains a private good even when a government pays for it.' },
        { text: 'When the free-rider problem causes non-production, every member of the group successfully free rides on others.', why: 'Under non-production nobody contributes and the good is not produced at all, so there is nothing on which anyone can free ride.' },
        { text: 'Common-pool resources avoid collective-action problems because rivalrous use keeps extra users out on its own.', why: 'Common-pool resources are non-excludable; rivalry causes depletion rather than exclusion, creating an overuse problem.' },
      ],
      explanation: 'The third paragraph stresses that whether something is a public good depends on non-excludability and non-rivalry rather than on who funds it, giving free-to-air commercial radio as a privately supplied public good. Meanwhile, free meals remain rivalrous private goods, non-production leaves nothing to free ride on, and common-pool resources risk overuse.',
    },
    {
      type: 'T', level: 3,
      stem: `${numberWord(households)} households live along an unlit shared lane with no gate. Installing a street lamp costs ${euro(lampCost)} per lamp, and each lamp installed gives every one of the ${whole(households)} households a benefit worth ${euro(benefitEach)}, whether that household paid or not. Each household independently chooses either to pay ${euro(lampCost)} for one lamp or to pay €0, aiming solely to maximise its own net payoff (its total benefit from all lamps installed minus what it pays itself). What happens, and why?`,
      options: [
        { text: `All ${whole(households)} lamps are installed, because ${whole(households)} lamps yield ${euro(groupBenefitPerLamp)} of benefit per household against ${euro(lampCost)} paid, a ${euro(netIfAllContribute)} net gain.`, why: `Every household would indeed be ${euro(netIfAllContribute)} better off if all ${whole(households)} were bound to pay, but without a binding agreement each household gains a further ${euro(privateLossFromContributing)} by holding back.` },
        { text: `${numberWord(thresholdLamps)} lamps are installed, because ${whole(thresholdLamps)} lamps bring each household ${euro(thresholdLamps * benefitEach)} in benefit, which first exceeds the ${euro(lampCost)} lamp cost.`, why: `The ${euro(benefitEach)} benefit from the other ${whole(thresholdLamps - 1)} lamps arrives whether or not the sixth household pays; that sixth lamp still adds only ${euro(benefitEach)} to its payer while costing ${euro(lampCost)}.` },
        { text: `${numberWord(halfHouseholds)} lamps are installed, because half the group contributes once total group benefit per lamp (${euro(groupBenefitPerLamp)}) beats the ${euro(lampCost)} cost.`, why: `Although ${euro(groupBenefitPerLamp)} across the group exceeds ${euro(lampCost)}, each individual household captures only ${euro(benefitEach)} of its own lamp's benefit and faces the same incentive to pay €0.` },
        { text: `Zero lamps are installed, because paying ${euro(lampCost)} adds only ${euro(benefitEach)} to that household's own benefit, cutting its payoff by ${euro(privateLossFromContributing)} whatever others do.`, correct: true, why: `If k other households pay, paying €0 gives ${benefitEach}k whereas paying ${euro(lampCost)} gives ${benefitEach}(k + 1) − ${lampCost} = ${benefitEach}k − ${privateLossFromContributing}; every household therefore pays €0 (non-production).` },
      ],
      explanation: `Suppose k of the other ${whole(households - 1)} households fund a lamp. If a household pays €0, its net payoff is ${euro(benefitEach)} × k. If it pays ${euro(lampCost)} for a lamp, total lamps rise to k + 1, raising its own benefit by ${euro(benefitEach)} while costing ${euro(lampCost)} — a net change of ${euro(benefitEach)} − ${euro(lampCost)} = −${euro(privateLossFromContributing)} for every possible k. Acting alone on self-interest, every household pays €0 and 0 lamps are installed (the non-production form of the free-rider problem), leaving each with €0 instead of the ${euro(netIfAllContribute)} net gain all ${whole(households)} would enjoy under a binding shared agreement.`,
    },
  ],
};
