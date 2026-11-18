// Full mock 3, passage 6. Area: economics. Subject: externalities and corrective taxes and subsidies.
import { graph, numericOptions, p, whole } from '../lib.mjs';

// ---------- Figure 1: a dye market with a negative production externality ----------
const maxTonnes = 800;
const mpc0 = 20;
const mpcSlope = 0.05;
const msc0 = 30;
const mscSlope = 0.1;
const mpb0 = 110;
const mpbSlope = 0.1;

const mpc = (q) => mpc0 + mpcSlope * q;
const msc = (q) => msc0 + mscSlope * q;
const mec = (q) => msc(q) - mpc(q);
const mpb = (q) => mpb0 - mpbSlope * q; // no external benefit in Figure 1, so MSB = MPB

const clean = (x) => Math.round(x * 1e6) / 1e6;
const qMarket = clean((mpb0 - mpc0) / (mpbSlope + mpcSlope));
const pMarket = clean(mpc(qMarket));
const qSocial = clean((mpb0 - msc0) / (mpbSlope + mscSlope));
const pSocial = clean(msc(qSocial));
const mpcAtSocial = clean(mpc(qSocial));
const mscAtMarket = clean(msc(qMarket));

if (!Number.isInteger(qMarket) || !Number.isInteger(qSocial) || !(qMarket > qSocial)) {
  throw new Error('Figure 1 crossings must be distinct positive integers with overproduction');
}
if (Math.abs(mpb(qMarket) - pMarket) > 1e-9 || Math.abs(mpb(qSocial) - pSocial) > 1e-9) {
  throw new Error('Figure 1 equilibrium prices do not match demand');
}

const taxPerTonne = mec(qSocial);
const mecAtZero = mec(0);
const mecAtMarket = mec(qMarket);
const buyerPriceRise = pSocial - pMarket;

const distinctPrices = [mecAtZero, buyerPriceRise, taxPerTonne, mpcAtSocial, pMarket, pSocial, mscAtMarket];
if (new Set(distinctPrices).size !== distinctPrices.length) {
  throw new Error('key euro figures on Figure 1 must be distinct');
}

// Question 5: positive externality in a separate market (rainwater tanks).
const tanks = { qMarket: 250, pMarket: 120, step: 50, mpbDrop: 6, mpcRise: 3, meb: 36 };
const stepsAdded = tanks.meb / (tanks.mpbDrop + tanks.mpcRise);
if (!Number.isInteger(stepsAdded)) throw new Error('question 5 needs a whole number of steps');
const qTanksSocial = tanks.qMarket + stepsAdded * tanks.step;
const qIgnoreCostRise = tanks.qMarket + (tanks.meb / tanks.mpbDrop) * tanks.step;
const qIgnoreBenefitDrop = tanks.qMarket + (tanks.meb / tanks.mpcRise) * tanks.step;
if ([tanks.qMarket, qTanksSocial, qIgnoreCostRise, qIgnoreBenefitDrop].some((q) => q === qSocial || q === qMarket)) {
  throw new Error('question 5 quantities must not share Figure 1 quantities');
}

// Question 7: weekly tax revenue in Figure 1 at the corrective tax.
const taxRevenue = taxPerTonne * qSocial;
const revFromPriceRise = buyerPriceRise * qSocial;
const revFromMarketMecAtSocialQ = mecAtMarket * qSocial;
const revFromMarketAll = mecAtMarket * qMarket;

const euro = (v) => `€${whole(v)}`;
const tonnes = (v) => `${whole(v)} tonnes`;
const tankCount = (v) => `${whole(v)} tanks`;

const figure1 = graph({
  id: 'p32-fig1',
  w: 480,
  left: 68,
  x: { min: 0, max: maxTonnes, grid: 100, label: 200, title: 'Tonnes per week', format: whole },
  y: { min: 0, max: 120, grid: 10, label: 20, title: 'Euros per tonne' },
  body: ({ px, py }) => `
  <line class="curve curve-2" x1="${px(0)}" y1="${py(msc(0))}" x2="${px(maxTonnes)}" y2="${py(msc(maxTonnes))}"/>
  <line class="curve curve-3" x1="${px(0)}" y1="${py(mpc(0))}" x2="${px(maxTonnes)}" y2="${py(mpc(maxTonnes))}"/>
  <line class="curve" x1="${px(0)}" y1="${py(mpb(0))}" x2="${px(maxTonnes)}" y2="${py(mpb(maxTonnes))}"/>
  <text class="label-2" x="${px(785)}" y="${py(msc(785)) - 10}" text-anchor="end">MSC</text>
  <text class="label-3" x="${px(785)}" y="${py(mpc(785)) - 10}" text-anchor="end">MPC</text>
  <text class="label-1" x="${px(785)}" y="${py(mpb(785)) + 22}" text-anchor="end">MSB = MPB</text>`,
});

export default {
  id: 'p32',
  set: 'mock',
  mock: 3,
  area: 'economics',
  title: 'Externalities and Corrective Taxes',
  facts: [
    { claim: 'An externality (or spillover) is an effect of a market exchange on a third party who is neither the buyer nor the seller; it can be negative or positive.', source: 'https://openstax.org/books/principles-economics-3e/pages/12-1-the-economics-of-pollution', read: '2026-11-18' },
    { claim: 'Social costs equal the private costs borne by producers plus the external costs borne by third parties; on the margin, MSC = MPC + MEC.', source: 'https://socialsci.libretexts.org/Bookshelves/Economics/Applied_Economics/Introduction_to_Economic_Analysis_(LibreTexts)/07%3A_Externalities/7.01%3A_External_Effects', read: '2026-11-18' },
    { claim: 'In an unregulated competitive market, equilibrium settles where marginal private benefit equals marginal private cost, so goods with negative externalities are overproduced and goods with positive externalities are underproduced relative to the socially efficient outcome.', source: 'https://socialsci.libretexts.org/Bookshelves/Economics/Applied_Economics/Introduction_to_Economic_Analysis_(LibreTexts)/07%3A_Externalities/7.01%3A_External_Effects', read: '2026-11-18' },
    { claim: 'A Pigouvian (corrective) tax is a per-unit tax equal to the marginal external cost evaluated at the socially efficient quantity, shifting private supply up so the competitive equilibrium reaches the socially efficient quantity even when marginal external cost varies with output.', source: 'https://socialsci.libretexts.org/Bookshelves/Economics/Applied_Economics/Introduction_to_Economic_Analysis_(LibreTexts)/07%3A_Externalities/7.02%3A_Pigouvian_Taxes', read: '2026-11-18' },
    { claim: 'For a positive externality, a per-unit subsidy equal to the marginal external benefit at the socially efficient quantity induces the efficient level of output.', source: 'https://socialsci.libretexts.org/Bookshelves/Economics/Applied_Economics/Introduction_to_Economic_Analysis_(LibreTexts)/07%3A_Externalities/7.02%3A_Pigouvian_Taxes', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'In many markets, the buyers and sellers bear all the costs and receive all the benefits of their trade.',
      'Sometimes, however, producing or consuming a good affects a third party, someone who neither buys nor sells it, without compensation.',
      'Economists call such a spillover effect an externality.',
      'A negative externality imposes a cost on third parties, as when a dye factory releases waste into a river used by downstream fisheries.',
      'A positive externality gives third parties an unpaid benefit, as when a vaccinated resident makes neighbours less likely to catch an illness.',
    ),
    p(
      'To compare what a market does on its own with what is best for everyone together, costs and benefits are measured for one additional unit, that is, on the margin.',
      'The marginal private cost (MPC) is what producers pay to make one more unit, such as wages and materials.',
      'The marginal external cost (MEC) is the damage that extra unit causes to third parties.',
      'Their sum is the marginal social cost (MSC), the full cost to society of one more unit:',
    ),
    { type: 'formula', text: 'MSC = MPC + MEC' },
    p(
      'On the demand side, the marginal private benefit (MPB) is the most buyers are willing to pay for one more unit, and the marginal external benefit (MEB) is the gain to third parties.',
      'Their sum is the marginal social benefit (MSB):',
    ),
    { type: 'formula', text: 'MSB = MPB + MEB' },
    p(
      'Left to itself, a competitive market settles where MPB equals MPC, because buyers and sellers weigh only their own gains and expenses.',
      'Society as a whole does best at the socially efficient quantity, where MSB equals MSC.',
      'When MEC is positive and MEB is zero, MSC lies above MPC while MSB equals MPB, so an unregulated market produces more than the socially efficient quantity.',
      'When MEB is positive and MEC is zero, MSB lies above MPB while MSC equals MPC, so an unregulated market produces too little.',
    ),
    p(
      'The economist Arthur Pigou proposed correcting an externality with a tax or subsidy per unit.',
      'For a negative externality, this Pigouvian (or corrective) tax is set equal to the marginal external cost at the socially efficient quantity:',
    ),
    { type: 'formula', text: 'corrective tax per unit = MEC at the socially efficient quantity' },
    p(
      'Because producers must pay this tax on every unit, their private marginal cost rises by the tax, so they internalise the external cost at the margin and the market settles where MSB equals MSC.',
      'Even when MEC grows with output, as in Figure 1, a constant per-unit tax equal to MEC at the socially efficient quantity brings the market to that quantity.',
      'For a positive externality, a corrective subsidy per unit equal to MEB at the socially efficient quantity raises output to where MSB equals MSC.',
    ),
    {
      type: 'figure',
      id: 'p32-fig1',
      caption: 'Figure 1. Weekly market for an industrial dye with a negative production externality and no external benefit (MSB = MPB).',
      alt: `A graph with tonnes per week from 0 to ${whole(maxTonnes)} on the horizontal axis and euros per tonne from 0 to 120 on the vertical axis. MPC rises linearly from ${euro(mpc(0))} at 0 tonnes to ${euro(mpc(maxTonnes))} at ${whole(maxTonnes)} tonnes. MSC rises linearly from ${euro(msc(0))} at 0 tonnes to ${euro(msc(maxTonnes))} at ${whole(maxTonnes)} tonnes. MSB = MPB falls linearly from ${euro(mpb(0))} at 0 tonnes to ${euro(mpb(maxTonnes))} at ${whole(maxTonnes)} tonnes. MSB = MPB crosses MPC at ${whole(qMarket)} tonnes and ${euro(pMarket)}, and crosses MSC at ${whole(qSocial)} tonnes and ${euro(pSocial)}, where MPC is ${euro(mpcAtSocial)}.`,
      svg: figure1,
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, when does a market transaction create a negative externality?',
      options: [
        { text: 'When it imposes an uncompensated cost on someone who is neither the buyer nor the seller.', correct: true, why: 'This matches the definition of an externality that imposes a cost on third parties in the first paragraph.' },
        { text: 'When the market price buyers pay per unit is higher than the seller\'s marginal private cost.', why: 'A price above marginal private cost on earlier units is part of ordinary trade and need not harm any third party.' },
        { text: 'When third parties receive a benefit from the transaction without paying the buyer or seller.', why: 'An unpaid benefit to third parties is a positive externality, not a negative one.' },
        { text: 'When producers pay higher wages or material prices to produce an additional unit of output.', why: 'Wages and materials paid by producers are part of marginal private cost, not an external cost on third parties.' },
      ],
      explanation: 'The first paragraph defines an externality as an uncompensated spillover effect on a third party outside the trade, and calls it negative when it imposes a cost on those third parties.',
    },
    {
      type: 'F', level: 1,
      stem: 'According to Figure 1, what quantity of dye per week does the market produce when there is no tax or regulation?',
      options: numericOptions(
        { value: qMarket, why: `Without regulation the market settles where MPB crosses MPC, at ${whole(qMarket)} tonnes per week.` },
        [
          { value: pMarket, why: `${whole(pMarket)} is the unregulated price in euros per tonne on the vertical axis, not the quantity in tonnes.` },
          { value: qMarket - qSocial, why: `This is the ${whole(qMarket - qSocial)}-tonne excess of unregulated output over the socially efficient quantity, not total output.` },
          { value: qSocial, why: `At ${whole(qSocial)} tonnes MSB crosses MSC; that is the socially efficient quantity, not the unregulated market outcome.` },
        ],
        tonnes,
      ),
      explanation: `An unregulated competitive market settles where MPB equals MPC. In Figure 1 the MSB = MPB line crosses the MPC line at ${whole(qMarket)} tonnes per week (and a price of ${euro(pMarket)} per tonne).`,
    },
    {
      type: 'A', level: 2,
      stem: 'What corrective tax per tonne moves the dye market in Figure 1 to the socially efficient quantity?',
      options: numericOptions(
        { value: taxPerTonne, why: `At the socially efficient quantity (${whole(qSocial)} tonnes), MSC is ${euro(pSocial)} and MPC is ${euro(mpcAtSocial)}, so MEC is ${euro(taxPerTonne)}.` },
        [
          { value: mecAtZero, why: `This is MSC minus MPC at 0 tonnes (${euro(msc(0))} − ${euro(mpc(0))}). Because MEC grows with output, the tax must match MEC at the socially efficient quantity.` },
          { value: buyerPriceRise, why: `This is the ${euro(buyerPriceRise)} rise in the price buyers pay (from ${euro(pMarket)} to ${euro(pSocial)}). Because MPC slopes up, MPC falls by ${euro(pMarket - mpcAtSocial)} as output drops, so the tax is larger than the price rise.` },
          { value: mecAtMarket, why: `This is MSC minus MPC at the unregulated quantity of ${whole(qMarket)} tonnes (${euro(mscAtMarket)} − ${euro(pMarket)}), rather than at the socially efficient quantity.` },
        ],
        euro,
      ),
      explanation: `The socially efficient quantity is where MSB crosses MSC, at ${whole(qSocial)} tonnes per week. At ${whole(qSocial)} tonnes, MSC = ${euro(pSocial)} and MPC = ${euro(mpcAtSocial)}, so MEC = ${euro(pSocial)} − ${euro(mpcAtSocial)} = ${euro(taxPerTonne)} per tonne. Setting the per-unit tax to ${euro(taxPerTonne)} raises producers' marginal cost at ${whole(qSocial)} tonnes from ${euro(mpcAtSocial)} to ${euro(pSocial)}, matching MPB.`,
    },
    {
      type: 'D', level: 2,
      stem: 'Homeowners who insulate their lofts lower their own heating bills and also reduce winter air pollution for people living nearby, while causing no external cost. Compared with an unregulated market, what is true of the socially efficient number of insulated lofts, and which policy can reach it?',
      options: [
        { text: 'The socially efficient number is larger, and a subsidy per loft equal to the marginal external benefit there can reach it.', correct: true, why: 'Positive MEB puts MSB above MPB while MSC equals MPC, so the market underproduces and a subsidy equal to MEB at the efficient quantity closes the gap.' },
        { text: 'The socially efficient number is smaller, and a tax per loft equal to the marginal external benefit there can reach it.', why: 'Smaller efficient output and a corrective tax apply to a negative externality, whereas cleaner neighbourhood air is a positive externality.' },
        { text: 'The socially efficient number is larger, and a tax per loft equal to the marginal private cost there can reach it.', why: 'Taxing loft insulation would raise its cost and reduce the number installed, moving the market even further below the efficient quantity.' },
        { text: 'The socially efficient number is the same, because homeowners already count their own heating savings when deciding.', why: 'Homeowners count MPB (their own bill savings) but omit MEB (cleaner air for neighbours), so MPB = MPC stops short of MSB = MSC.' },
      ],
      explanation: 'Cleaner air for neighbours is a positive externality (MEB > 0) with no external cost (MEC = 0). MSB therefore lies above MPB while MSC equals MPC, so an unregulated market produces fewer insulated lofts than the socially efficient number. A corrective subsidy per loft equal to MEB at the socially efficient quantity raises output to where MSB equals MSC.',
    },
    {
      type: 'T', level: 3,
      stem: `In a flood-prone town, an unregulated market installs ${whole(tanks.qMarket)} household rainwater tanks, where MPB and MPC both equal ${euro(tanks.pMarket)}. Each tank also reduces street runoff, giving neighbours a constant marginal external benefit of ${euro(tanks.meb)}, with no external cost. For every ${tanks.step} additional tanks above ${whole(tanks.qMarket)}, MPB falls by ${euro(tanks.mpbDrop)} and MPC rises by ${euro(tanks.mpcRise)}. What is the socially efficient number of rainwater tanks?`,
      options: numericOptions(
        { value: qTanksSocial, why: `At ${whole(tanks.qMarket)} tanks MSB exceeds MSC by ${euro(tanks.meb)}. Every ${tanks.step} extra tanks narrows that gap by ${euro(tanks.mpbDrop)} + ${euro(tanks.mpcRise)} = ${euro(tanks.mpbDrop + tanks.mpcRise)}, taking ${stepsAdded} steps (${whole(stepsAdded * tanks.step)} more tanks).` },
        [
          { value: tanks.qMarket, why: `This is the unregulated quantity where MPB = MPC = ${euro(tanks.pMarket)}, which leaves out the ${euro(tanks.meb)} marginal external benefit.` },
          { value: qIgnoreCostRise, why: `This divides ${euro(tanks.meb)} only by the ${euro(tanks.mpbDrop)} fall in MPB (${tanks.meb / tanks.mpbDrop} steps of ${tanks.step}), ignoring that MPC also rises by ${euro(tanks.mpcRise)} per step.` },
          { value: qIgnoreBenefitDrop, why: `This divides ${euro(tanks.meb)} by ${euro(tanks.mpcRise)} (${tanks.meb / tanks.mpcRise} steps of ${tanks.step}), either ignoring the fall in MPB or subtracting ${tanks.mpbDrop} − ${tanks.mpcRise} instead of adding them.` },
        ],
        tankCount,
      ),
      explanation: `At ${whole(tanks.qMarket)} tanks, MSB = ${euro(tanks.pMarket)} + ${euro(tanks.meb)} = ${euro(tanks.pMarket + tanks.meb)} while MSC = MPC = ${euro(tanks.pMarket)}, a gap of ${euro(tanks.meb)}. Each step of ${tanks.step} extra tanks lowers MSB by ${euro(tanks.mpbDrop)} (since MEB is constant) and raises MSC by ${euro(tanks.mpcRise)}, closing the gap by ${euro(tanks.mpbDrop + tanks.mpcRise)} per step. It takes ${tanks.meb} ÷ ${tanks.mpbDrop + tanks.mpcRise} = ${stepsAdded} steps, or ${whole(stepsAdded * tanks.step)} extra tanks, giving ${whole(qTanksSocial)} tanks (where MPB = ${euro(tanks.pMarket - stepsAdded * tanks.mpbDrop)}, MSB = ${euro(tanks.pMarket - stepsAdded * tanks.mpbDrop + tanks.meb)}, and MSC = ${euro(tanks.pMarket + stepsAdded * tanks.mpcRise)}).`,
    },
    {
      type: 'S', level: 2,
      stem: 'In a market with a negative externality in production and no external benefit, such as the one in Figure 1, which statement must be true of the last unit produced in the unregulated market?',
      options: [
        { text: 'Its marginal private benefit is greater than its marginal social cost.', why: `At the unregulated quantity MPB equals MPC, and with MEC > 0, MSC is higher than MPC. In Figure 1 at ${whole(qMarket)} tonnes, MPB is ${euro(pMarket)} while MSC is ${euro(mscAtMarket)}.` },
        { text: 'Its marginal private cost is greater than its marginal private benefit.', why: 'Producers would lose money on a unit whose private cost exceeded the market price; at the unregulated equilibrium MPC equals MPB.' },
        { text: 'Its marginal external cost equals its marginal private benefit.', why: `No market rule equates MEC with MPB; in Figure 1 at ${whole(qMarket)} tonnes MEC is ${euro(mecAtMarket)} while MPB is ${euro(pMarket)}.` },
        { text: 'Its marginal social cost is greater than its marginal social benefit.', correct: true, why: `At the unregulated quantity MSB = MPB = MPC, while MSC = MPC + MEC > MPC, so MSC exceeds MSB (in Figure 1, ${euro(mscAtMarket)} against ${euro(pMarket)}).` },
      ],
      explanation: `At the unregulated market quantity, MPB equals MPC. Because there is no external benefit, MSB equals MPB; because there is a negative production externality (MEC > 0), MSC = MPC + MEC is strictly greater than MPC. On that last unit, therefore, MSC exceeds MSB — in Figure 1 at ${whole(qMarket)} tonnes, ${euro(mscAtMarket)} exceeds ${euro(pMarket)}.`,
    },
    {
      type: 'A', level: 3,
      stem: 'Once the government introduces the corrective tax per tonne that moves the dye market in Figure 1 to the socially efficient quantity, how much tax revenue per week does it collect?',
      options: numericOptions(
        { value: taxRevenue, why: `At the socially efficient quantity of ${whole(qSocial)} tonnes, the corrective tax is ${euro(taxPerTonne)} per tonne, giving ${whole(qSocial)} × ${euro(taxPerTonne)} = ${euro(taxRevenue)}.` },
        [
          { value: revFromPriceRise, why: `This multiplies ${whole(qSocial)} tonnes by the ${euro(buyerPriceRise)} rise in the buyer price (${euro(pSocial)} − ${euro(pMarket)}) rather than by the full tax per tonne.` },
          { value: revFromMarketMecAtSocialQ, why: `This multiplies ${whole(qSocial)} tonnes by ${euro(mecAtMarket)}, which is MEC at the unregulated quantity (${whole(qMarket)} tonnes) instead of at ${whole(qSocial)} tonnes.` },
          { value: revFromMarketAll, why: `This multiplies the unregulated quantity (${whole(qMarket)} tonnes) by ${euro(mecAtMarket)}, ignoring both that output falls to ${whole(qSocial)} tonnes and that the tax equals MEC there.` },
        ],
        euro,
      ),
      explanation: `Weekly tax revenue equals the corrective tax per tonne multiplied by the quantity sold once the tax is in place. The tax moves output to the socially efficient quantity of ${whole(qSocial)} tonnes per week, where MEC is ${euro(pSocial)} − ${euro(mpcAtSocial)} = ${euro(taxPerTonne)} per tonne, so tax revenue is ${whole(qSocial)} × ${euro(taxPerTonne)} = ${euro(taxRevenue)} per week.`,
    },
  ],
};
