// Mock 2, passage 23. Area: economics. Subject: market equilibrium, price ceilings and price floors.
import { graph, numericOptions, p, whole } from '../lib.mjs';

// ---------- the market in Figure 1 (boxes of apples per week) ----------
const dIntercept = 1000;
const dSlope = 20; // Qd = 1000 − 20p
const sSlope = 40; // Qs = 40p − 200
const sOffset = 200;
const maxBoxes = 1000;
const maxPrice = 50;

const qd = (pr) => dIntercept - dSlope * pr;
const qs = (pr) => sSlope * pr - sOffset;
const pDemand = (q) => (dIntercept - q) / dSlope;
const pSupply = (q) => (q + sOffset) / sSlope;

const eqPrice = (dIntercept + sOffset) / (dSlope + sSlope);
const eqQty = qd(eqPrice);
if (!Number.isInteger(eqPrice) || !Number.isInteger(eqQty) || qs(eqPrice) !== eqQty) {
  throw new Error('equilibrium price and quantity must be whole numbers where Qd equals Qs');
}

const figKeyValues = [pSupply(0), eqPrice, pSupply(maxBoxes), pDemand(0), eqQty, maxBoxes];
if (new Set(figKeyValues).size !== figKeyValues.length) {
  throw new Error('key intercepts and equilibrium coordinates on Figure 1 must all differ');
}

// Question 3: binding price ceiling of €15 per box in Figure 1.
const ceiling3 = 15;
if (!(ceiling3 < eqPrice)) throw new Error('question 3 ceiling must be binding');
const qd3 = qd(ceiling3);
const qs3 = qs(ceiling3);
const shortage3 = qd3 - qs3;
const supplyDrop3 = eqQty - qs3;
if ([shortage3, supplyDrop3, qs3, qd3].includes(eqQty)) {
  throw new Error('question 3 options must not give away the equilibrium quantity in question 2');
}

// Question 4: four separate price limits compared against eqPrice.
const c4Binding = 15;
const f4Binding = 25;
const f4Higher = 30;
const c4NonBinding = 25;
if (!(c4Binding < eqPrice && f4Binding > eqPrice && f4Higher > eqPrice && c4NonBinding > eqPrice)) {
  throw new Error('question 4 needs exactly one non-binding limit');
}

// Question 5: demand shifts past an existing rent ceiling.
const rent = { oldEq: 520, cap: 560, newEq: 620 };
if (!(rent.oldEq < rent.cap && rent.cap < rent.newEq)) {
  throw new Error('question 5 needs oldEq < cap < newEq');
}

// Question 6: wooden crates of pears with linear equations and a binding price floor.
const pear = { dInt: 950, dSlope: 30, sSlope: 50, sOff: 170, floor: 22 };
const pearEqP = (pear.dInt + pear.sOff) / (pear.dSlope + pear.sSlope);
const pearEqQ = pear.dInt - pear.dSlope * pearEqP;
if (!Number.isInteger(pearEqP) || !Number.isInteger(pearEqQ) || !(pear.floor > pearEqP)) {
  throw new Error('question 6 needs whole equilibrium values and a binding floor');
}
const pearQd = pear.dInt - pear.dSlope * pear.floor;
const pearQs = pear.sSlope * pear.floor - pear.sOff;
const pearTraded = Math.min(pearQd, pearQs);
const pearSurplus = pearQs - pearQd;
const q6Values = [pearTraded, pearEqQ, pearSurplus, pearQs];
if (q6Values.some((v) => figKeyValues.includes(v) || [shortage3, supplyDrop3, qs3, qd3].includes(v))) {
  throw new Error('question 6 values must not repeat numbers from Figure 1 or earlier questions');
}

const euro = (v) => `€${whole(v)}`;
const boxes = (v) => `${whole(v)} boxes`;
const crates = (v) => `${whole(v)} crates`;

const figure1 = graph({
  id: 'p23-fig1',
  w: 480,
  left: 68,
  x: { min: 0, max: maxBoxes, grid: 100, label: 200, title: 'Boxes of apples per week', format: whole },
  y: { min: 0, max: maxPrice, grid: 5, label: 10, title: 'Price in € per box', format: euro },
  body: ({ px, py }) => `
  <line class="curve" x1="${px(0)}" y1="${py(pDemand(0))}" x2="${px(maxBoxes)}" y2="${py(pDemand(maxBoxes))}"/>
  <line class="curve curve-2" x1="${px(0)}" y1="${py(pSupply(0))}" x2="${px(maxBoxes)}" y2="${py(pSupply(maxBoxes))}"/>
  <text class="label-1" x="${px(820)}" y="${py(pDemand(820)) - 10}" text-anchor="middle">Demand</text>
  <text class="label-2" x="${px(820)}" y="${py(pSupply(820)) - 10}" text-anchor="middle">Supply</text>`,
});

export default {
  id: 'p23',
  set: 'mock',
  mock: 2,
  area: 'economics',
  title: 'Price Ceilings and Price Floors',
  facts: [
    { claim: 'Demand is the amount buyers are willing and able to purchase at each price; by the law of demand, holding other factors constant, a higher price leads to a lower quantity demanded.', source: 'https://openstax.org/books/principles-economics-3e/pages/3-1-demand-supply-and-equilibrium-in-markets-for-goods-and-services', read: '2026-11-18' },
    { claim: 'Supply is the amount sellers are willing and able to offer at each price; by the law of supply, holding other factors constant, a higher price leads to a higher quantity supplied.', source: 'https://openstax.org/books/principles-economics-3e/pages/3-1-demand-supply-and-equilibrium-in-markets-for-goods-and-services', read: '2026-11-18' },
    { claim: 'Market equilibrium occurs where the demand and supply curves cross so quantity demanded equals quantity supplied; above the equilibrium price there is excess supply (surplus) and below it excess demand (shortage).', source: 'https://openstax.org/books/principles-economics-3e/pages/3-1-demand-supply-and-equilibrium-in-markets-for-goods-and-services', read: '2026-11-18' },
    { claim: 'Price controls are legal limits on market prices: a price ceiling is a legal maximum price and a price floor is a legal minimum price.', source: 'https://openstax.org/books/principles-economics-3e/pages/3-4-price-ceilings-and-price-floors', read: '2026-11-18' },
    { claim: 'A price ceiling kept below the equilibrium price prevents the price from rising to equilibrium, so quantity demanded exceeds quantity supplied, a shortage occurs, and some buyers cannot purchase the good.', source: 'https://openstax.org/books/principles-economics-3e/pages/3-4-price-ceilings-and-price-floors', read: '2026-11-18' },
    { claim: 'A price floor held above the equilibrium price prevents the price from falling to equilibrium, so quantity supplied exceeds quantity demanded and a surplus occurs.', source: 'https://openstax.org/books/principles-economics-3e/pages/3-4-price-ceilings-and-price-floors', read: '2026-11-18' },
    { claim: 'A price floor set below the equilibrium price is non-binding and has no practical effect because the market trades at the higher equilibrium price; a price floor above equilibrium is binding, and symmetrically a price ceiling is binding below equilibrium and non-binding above it.', source: 'https://en.wikipedia.org/wiki/Price_floor', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'In a market for a good, the quantity demanded, written Qd, is the amount buyers are willing and able to purchase at a given price.',
      'By the law of demand, when other influences stay the same, a higher price lowers Qd, so the demand curve slopes downwards from left to right.',
      'The quantity supplied, written Qs, is the amount sellers are willing and able to offer at a given price.',
      'By the law of supply, when other influences stay the same, a higher price raises Qs, so the supply curve slopes upwards.',
    ),
    p(
      'Left to itself, the market settles at equilibrium, the point where the demand and supply curves cross and Qd equals Qs.',
      'The price and quantity at that crossing are the equilibrium price and the equilibrium quantity.',
      'At any price below equilibrium, buyers want more than sellers offer, creating excess demand, or a shortage:',
    ),
    { type: 'formula', text: 'shortage = Qd − Qs (when Qd > Qs)' },
    p(
      'At any price above equilibrium, sellers offer more than buyers want, creating excess supply, or a surplus:',
    ),
    { type: 'formula', text: 'surplus = Qs − Qd (when Qs > Qd)' },
    p(
      'Because neither buyers nor sellers can be forced to trade, the quantity actually bought and sold at any price, when the government itself neither buys nor sells the good, is the smaller of Qd and Qs.',
    ),
    p(
      'Governments sometimes enact price controls, legal limits on what may be charged.',
      'A price ceiling is a legal maximum price, such as a cap on housing rents.',
      'If a ceiling is set above the equilibrium price, it is non-binding: the market reaches equilibrium without breaking the law, so the ceiling has no effect unless rising demand later pushes the equilibrium price past it.',
      'If a ceiling is set below the equilibrium price, it is binding: the price cannot rise to equilibrium, so it stays at the ceiling, only Qs units are sold, and a shortage persists.',
    ),
    p(
      'A price floor is a legal minimum price, such as a support price for farm produce.',
      'A floor set below the equilibrium price is non-binding, because the market already trades above it.',
      'A floor set above the equilibrium price is binding: the price stays at the floor, private buyers purchase only Qd units, and a surplus persists.',
      'Figure 1 shows the weekly demand and supply for boxes of apples in a wholesale market.',
    ),
    {
      type: 'figure',
      id: 'p23-fig1',
      caption: 'Figure 1. Weekly demand and supply for boxes of apples in one wholesale market.',
      alt: `Two straight lines plotting price in euros per box from €0 to €${maxPrice} against boxes per week from 0 to ${whole(maxBoxes)}. Demand runs from €${pDemand(0)} at 0 boxes to €${pDemand(maxBoxes)} at ${whole(maxBoxes)} boxes. Supply runs from €${pSupply(0)} at 0 boxes to €${pSupply(maxBoxes)} at ${whole(maxBoxes)} boxes. The two lines cross at ${whole(eqQty)} boxes and ${euro(eqPrice)} per box. Grid lines appear every 100 boxes and every €5.`,
      svg: figure1,
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, when is a price ceiling binding, and what imbalance does it produce?',
      options: [
        { text: 'When it is set below the equilibrium price, producing a shortage.', correct: true, why: 'A legal maximum below the equilibrium price stops the price rising to clear the market, so Qd exceeds Qs.' },
        { text: 'When it is set above the equilibrium price, producing a shortage.', why: 'A ceiling set above the equilibrium price is non-binding, so the market reaches equilibrium without a shortage.' },
        { text: 'When it is set below the equilibrium price, producing a surplus.', why: 'Below the equilibrium price, buyers want more than sellers offer, which is a shortage rather than a surplus.' },
        { text: 'When it is set above the equilibrium price, producing a surplus.', why: 'That describes a binding price floor, a legal minimum above equilibrium, not a price ceiling.' },
      ],
      explanation: 'The fifth paragraph states that a price ceiling is a legal maximum price: it is binding when set below the equilibrium price, where it holds the price down so Qd exceeds Qs and a shortage persists.',
    },
    {
      type: 'F', level: 1,
      stem: 'According to Figure 1, what is the equilibrium quantity of apples when there are no price controls?',
      options: numericOptions(
        { value: eqQty, why: `The demand and supply lines cross at ${whole(eqQty)} boxes per week and ${euro(eqPrice)} per box.` },
        [
          { value: eqPrice, why: `${eqPrice} is the equilibrium price in euros per box on the vertical axis, not the number of boxes.` },
          { value: maxBoxes / 2, why: `At ${whole(maxBoxes / 2)} boxes demand is at ${euro(pDemand(maxBoxes / 2))} and supply at ${euro(pSupply(maxBoxes / 2))}, so the lines have not crossed yet.` },
          { value: maxBoxes, why: `${whole(maxBoxes)} boxes is where the demand line meets a price of €0, not where it crosses the supply line.` },
        ],
        boxes,
      ),
      explanation: `Equilibrium is where the demand and supply lines cross. In Figure 1 they cross at ${euro(eqPrice)} per box on the vertical axis and ${whole(eqQty)} boxes per week on the horizontal axis.`,
    },
    {
      type: 'A', level: 2,
      stem: `In the market shown in Figure 1, the government sets a price ceiling of ${euro(ceiling3)} per box. By how many boxes per week does the quantity demanded then exceed the quantity supplied?`,
      options: numericOptions(
        { value: shortage3, why: `At ${euro(ceiling3)}, Qd is ${whole(qd3)} boxes and Qs is ${whole(qs3)} boxes, so Qd − Qs = ${whole(shortage3)} boxes.` },
        [
          { value: supplyDrop3, why: `This counts only how far supply falls below the equilibrium quantity, ignoring that Qd also rises as the price is held down.` },
          { value: qs3, why: `This is Qs at ${euro(ceiling3)}, the number of boxes supplied and sold, not the excess of Qd over Qs.` },
          { value: qd3, why: `This is Qd at ${euro(ceiling3)} alone, before subtracting the ${whole(qs3)} boxes that sellers supply.` },
        ],
        boxes,
      ),
      explanation: `At ${euro(ceiling3)} per box, which is below the equilibrium price, the price ceiling is binding. Reading across at ${euro(ceiling3)} on Figure 1 gives Qs = ${whole(qs3)} boxes on the supply line and Qd = ${whole(qd3)} boxes on the demand line. The shortage is Qd − Qs = ${whole(qd3)} − ${whole(qs3)} = ${whole(shortage3)} boxes per week.`,
    },
    {
      type: 'C', level: 2,
      stem: 'In the market shown in Figure 1, the government considers four separate laws, one at a time. Which law is non-binding and leaves the market price and the quantity traded unchanged?',
      options: [
        { text: `A price ceiling of ${euro(c4Binding)} per box.`, why: `${euro(c4Binding)} is below the equilibrium price of ${euro(eqPrice)}, so this ceiling binds and pushes the price down to ${euro(c4Binding)}.` },
        { text: `A price floor of ${euro(f4Binding)} per box.`, why: `${euro(f4Binding)} is above the equilibrium price of ${euro(eqPrice)}, so a legal minimum at ${euro(f4Binding)} binds and creates a surplus.` },
        { text: `A price floor of ${euro(f4Higher)} per box.`, why: `${euro(f4Higher)} is above the equilibrium price of ${euro(eqPrice)}, so this legal minimum binds even more strongly.` },
        { text: `A price ceiling of ${euro(c4NonBinding)} per box.`, correct: true, why: `${euro(c4NonBinding)} is above the equilibrium price of ${euro(eqPrice)}, so trading at ${euro(eqPrice)} already obeys the legal maximum.` },
      ],
      explanation: `In Figure 1 the equilibrium price is ${euro(eqPrice)} per box. A price ceiling forbids prices above the limit, so a ceiling of ${euro(c4NonBinding)} allows the equilibrium price of ${euro(eqPrice)} and is non-binding. A ceiling of ${euro(c4Binding)} is below ${euro(eqPrice)}, and floors of ${euro(f4Binding)} and ${euro(f4Higher)} are above ${euro(eqPrice)}, so all three of those limits bind.`,
    },
    {
      type: 'D', level: 2,
      stem: `In a town's housing market, the equilibrium rent is ${euro(rent.oldEq)} a month, and a law sets a rent ceiling of ${euro(rent.cap)} a month. New employers then draw more residents to the town, shifting demand so that the rent where Qd equals Qs becomes ${euro(rent.newEq)} a month; the supply curve and the law stay unchanged. What happens in this market?`,
      options: [
        { text: `The monthly rent stays at ${euro(rent.oldEq)}, and a shortage of flats appears.`, why: `Nothing stops rents rising from ${euro(rent.oldEq)} up to the legal maximum of ${euro(rent.cap)}.` },
        { text: `The monthly rent rises to ${euro(rent.cap)} and stops there, and a shortage of flats appears.`, correct: true, why: `Once the new equilibrium rent of ${euro(rent.newEq)} exceeds ${euro(rent.cap)}, the ceiling binds at ${euro(rent.cap)}, where Qd exceeds Qs.` },
        { text: `The monthly rent rises to ${euro(rent.newEq)}, because the ceiling was non-binding before demand shifted.`, why: `A non-binding ceiling remains in law and becomes binding as soon as the equilibrium price rises past ${euro(rent.cap)}.` },
        { text: `The monthly rent rises to ${euro(rent.cap)} and stops there, and a surplus of flats appears.`, why: `At ${euro(rent.cap)}, below the new equilibrium of ${euro(rent.newEq)}, tenants seek more flats than landlords offer, which is a shortage.` },
      ],
      explanation: `At first ${euro(rent.cap)} is above the equilibrium rent of ${euro(rent.oldEq)}, so the ceiling is non-binding. After demand rises, the equilibrium rent of ${euro(rent.newEq)} lies above ${euro(rent.cap)}, making the ceiling binding: the rent rises until it hits ${euro(rent.cap)} and stops there, leaving Qd greater than Qs, a shortage.`,
    },
    {
      type: 'T', level: 3,
      stem: `In a wholesale market for pears, at price p (in euros per crate) the weekly quantity demanded is Qd = ${pear.dInt} − ${pear.dSlope}p and the weekly quantity supplied is Qs = ${pear.sSlope}p − ${pear.sOff}. The government sets a price floor of ${euro(pear.floor)} per crate and buys none of the fruit itself. How many crates are bought and sold per week?`,
      options: numericOptions(
        { value: pearTraded, why: `Equilibrium is at €${pearEqP}, so the ${euro(pear.floor)} floor binds. At ${euro(pear.floor)}, Qd = ${whole(pearQd)} and Qs = ${whole(pearQs)}, and buyers purchase only Qd = ${whole(pearQd)}.` },
        [
          { value: pearEqQ, why: `This is the equilibrium quantity at €${pearEqP}, which would apply only if the price floor were non-binding.` },
          { value: pearSurplus, why: `This is Qs − Qd = ${whole(pearQs)} − ${whole(pearQd)}, the unsold surplus rather than the crates bought and sold.` },
          { value: pearQs, why: `This is Qs at ${euro(pear.floor)}. Sellers offer ${whole(pearQs)} crates, but private buyers take only ${whole(pearQd)}.` },
        ],
        crates,
      ),
      explanation: `First check whether the floor binds: Qd = Qs gives ${pear.dInt} − ${pear.dSlope}p = ${pear.sSlope}p − ${pear.sOff}, so ${pear.dSlope + pear.sSlope}p = ${pear.dInt + pear.sOff} and p = €${pearEqP}. Because ${euro(pear.floor)} is above €${pearEqP}, the price floor binds and the price is ${euro(pear.floor)}. At ${euro(pear.floor)}, Qd = ${pear.dInt} − ${pear.dSlope * pear.floor} = ${whole(pearQd)} crates and Qs = ${pear.sSlope * pear.floor} − ${pear.sOff} = ${whole(pearQs)} crates. With no government purchases, the quantity traded is the smaller of Qd and Qs, which is ${whole(pearTraded)} crates.`,
    },
    {
      type: 'S', level: 3,
      stem: 'Consider a market with a downward-sloping demand curve and an upward-sloping supply curve, in which the government itself neither buys nor sells the good. Compared with the unregulated equilibrium, what do a binding price ceiling and a binding price floor have in common?',
      options: [
        { text: 'Both raise the quantity demanded above the equilibrium quantity.', why: 'A binding ceiling lowers the price and raises Qd, whereas a binding floor raises the price and lowers Qd.' },
        { text: 'Both raise the quantity supplied above the equilibrium quantity.', why: 'A binding floor raises the price and raises Qs, whereas a binding ceiling lowers the price and lowers Qs.' },
        { text: 'Both leave sellers with unsold stock at the controlled price.', why: 'Unsold stock is a surplus, which occurs under a binding floor; under a binding ceiling sellers sell all Qs units and buyers queue.' },
        { text: 'Both reduce the quantity actually bought and sold below the equilibrium quantity.', correct: true, why: 'Under a binding ceiling Qs falls below equilibrium and limits sales; under a binding floor Qd falls below equilibrium and limits sales.' },
      ],
      explanation: 'At any price, voluntary trade equals the smaller of Qd and Qs. A binding ceiling pushes the price below equilibrium, which lowers Qs below the equilibrium quantity, so fewer units are sold. A binding floor pushes the price above equilibrium, which lowers Qd below the equilibrium quantity, so again fewer units are sold.',
    },
  ],
};
