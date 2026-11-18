// Full mock 4, passage 5. Area: business administration. Subject: make-or-buy decisions and relevant costs.
import { numericOptions, p, whole } from '../lib.mjs';

// ---------- Table 1: Component M cost breakdown ----------
const t1 = {
  mat: 14,
  labour: 9,
  varOh: 5,
  avoidFixed: 18000,
  unavoidFixed: 24000,
  sunkJig: 30000,
};
const t1Nums = Object.values(t1);
if (new Set(t1Nums).size !== t1Nums.length) {
  throw new Error('every number in Table 1 must be different');
}

const euro = (v) => `€${whole(v)}`;
const units = (v) => `${whole(v)} units`;

const tableRows = [
  ['Direct materials', `${euro(t1.mat)} per unit`],
  ['Direct labour', `${euro(t1.labour)} per unit`],
  ['Variable workshop overhead', `${euro(t1.varOh)} per unit`],
  ['Dedicated tooling lease (cancelled if outsourced)', `${euro(t1.avoidFixed)} per year`],
  ['Allocated factory rent (continues if outsourced)', `${euro(t1.unavoidFixed)} per year`],
  ['Purchase price of jig 3 years ago (€0 resale value)', `${euro(t1.sunkJig)} once`],
];

// Question 3: relevant annual cost of making 2,000 units of Component M.
const q3Units = 2000;
const vUnitM = t1.mat + t1.labour + t1.varOh;
const q3VarOnly = q3Units * vUnitM;
const q3RelevantMake = q3VarOnly + t1.avoidFixed;
const q3WithUnavoid = q3RelevantMake + t1.unavoidFixed;
const q3WithSunkToo = q3WithUnavoid + t1.sunkJig;

// Question 4: indifference volume q* for Component N.
const q4 = { v: 22, pb: 34, fa: 36000, fu: 15000 };
const q4Diff = q4.pb - q4.v;
const q4Indiff = q4.fa / q4Diff;
const q4UsedFu = q4.fu / q4Diff;
const q4SubFu = (q4.fa - q4.fu) / q4Diff;
const q4AddFu = (q4.fa + q4.fu) / q4Diff;
if (![q4Indiff, q4UsedFu, q4SubFu, q4AddFu].every(Number.isInteger)) {
  throw new Error('question 4 options must all be exact integers');
}

// Question 6: annual net saving from buying when freed space earns rental income R_alt.
const q6 = { qty: 1500, v: 18, fa: 20000, fu: 16000, pb: 30, rentAlt: 7000 };
const makeRel6 = q6.qty * q6.v + q6.fa;
const buyNetRel6 = q6.qty * q6.pb - q6.rentAlt;
const saveBuy6 = makeRel6 - buyNetRel6;
// Cross-check by full company cost including unavoidable F_u:
const totalCompanyMake6 = q6.qty * q6.v + q6.fa + q6.fu;
const totalCompanyBuy6 = q6.qty * q6.pb + q6.fu - q6.rentAlt;
if (totalCompanyMake6 - totalCompanyBuy6 !== saveBuy6) {
  throw new Error('relevant-cost saving disagrees with total company cost comparison');
}
const save6ForgotRent = makeRel6 - q6.qty * q6.pb;
const save6UsedFuInsteadOfFa = (q6.qty * q6.v + q6.fu) - buyNetRel6;
const save6CountedFuSaved = saveBuy6 + q6.fu;

export default {
  id: 'p40',
  set: 'mock',
  mock: 4,
  area: 'business administration',
  title: 'Make-or-Buy Decisions and Relevant Costs',
  facts: [
    { claim: 'In a make-or-buy (outsourcing) decision, only relevant costs and benefits matter: future costs and revenues that differ between making internally and buying from an external supplier.', source: 'https://openstax.org/books/principles-managerial-accounting/pages/10-3-evaluate-and-determine-whether-to-make-or-buy-a-component', read: '2026-11-18' },
    { claim: 'Sunk costs (past costs already incurred that cannot be recovered) and unavoidable fixed costs (future fixed costs that continue regardless of whether production is outsourced) are irrelevant to the make-or-buy comparison.', source: 'https://openstax.org/books/principles-managerial-accounting/pages/10-summary', read: '2026-11-18' },
    { claim: 'Relevant costs of making internally include variable production costs (direct materials, direct labour, variable overhead) plus avoidable fixed costs; if outsourcing frees capacity that earns alternative income, that opportunity benefit favours buying.', source: 'https://openstax.org/books/principles-managerial-accounting/pages/10-3-evaluate-and-determine-whether-to-make-or-buy-a-component', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'Manufacturers often have to decide whether to produce a part in-house (make) or purchase it from an outside supplier (buy, or outsource).',
      'Accounting reports usually group all factory costs together, yet not every cost in those reports changes when production stops.',
      'To compare making with buying accurately, management isolates relevant costs: future costs and benefits that differ between the two choices.',
    ),
    p(
      'Two categories of cost do not differ between the choices and must be left out of the comparison.',
      'First, a sunk cost is money already spent in the past that cannot be recovered, such as the historical purchase price of specialised equipment with zero scrap or resale value.',
      'Second, an unavoidable fixed cost, such as an allocated share of factory-wide building rent or head-office salaries, continues in full even if the component is outsourced.',
      'By contrast, unit variable costs v (direct materials, direct labour and variable overhead) and avoidable fixed costs F_a (such as a dedicated tooling lease or supervisor contract cancelled upon outsourcing) stop when buying outside, so both are relevant.',
    ),
    p(
      'For an annual requirement of q units, when the workshop space has no alternative use and an outside supplier quotes unit price p_b, the relevant annual outlays are:',
    ),
    { type: 'formula', text: 'relevant cost of making = F_a + v × q   versus   relevant cost of buying = p_b × q' },
    p(
      'When p_b > v, each unit made in-house saves p_b − v in variable outlay towards covering F_a, so the two options cost the same at the indifference volume q*:',
    ),
    { type: 'formula', text: 'q* = F_a ÷ (p_b − v)' },
    p(
      'Below q* units buying is cheaper; above q* units making is cheaper.',
      'If outsourcing also frees workshop space that can be rented out or used to earn net income R_alt, that opportunity benefit reduces the net cost of buying to p_b × q − R_alt:',
    ),
    { type: 'formula', text: 'net cost of buying with alternative space income = p_b × q − R_alt' },
    p(
      'Table 1 lists the recorded figures for Component M.',
    ),
    {
      type: 'table',
      caption: 'Table 1. Recorded cost items for in-house production of Component M.',
      head: ['Cost item for Component M', 'Recorded figure'],
      rows: tableRows,
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, why is an unavoidable allocated fixed cost left out when comparing the cost of making a part with the cost of buying it?',
      options: [
        { text: 'Because fixed costs never involve future cash outlays.', why: 'Factory rent is a future cash outlay; it is excluded only because the same outlay occurs under both options.' },
        { text: 'Because the firm pays that same cost whether it makes the part in-house or buys it outside.', correct: true, why: 'A cost that continues unchanged under both choices cancels out of the difference between them.' },
        { text: 'Because every fixed cost was paid in the past and is therefore a sunk cost.', why: 'Future leases and salaries are future fixed costs, not past sunk costs; avoidable future fixed costs are included.' },
        { text: 'Because the external supplier deducts the buyer’s factory rent from its quoted price.', why: 'Suppliers quote their own price p_b and do not reimburse the buyer’s factory rent.' },
      ],
      explanation: 'Relevant costs are future costs that differ between alternatives. An unavoidable fixed cost continues in full under both Make and Buy, so it does not affect which option costs less.',
    },
    {
      type: 'C', level: 1,
      stem: 'A printer manufacturer considers outsourcing a paper tray instead of producing it in-house. Which of these costs is relevant to the make-or-buy decision?',
      options: [
        { text: 'The salary of a dedicated line inspector whose contract ends if tray production is outsourced.', correct: true, why: 'This is a future cost incurred under Make and avoided under Buy, making it an avoidable fixed cost.' },
        { text: 'The €50,000 paid four years ago for a moulding die that now has zero resale or scrap value.', why: 'Money spent four years ago with zero resale value cannot be recovered under either option: a sunk cost.' },
        { text: 'A €15,000 allocated share of head-office property tax, which remains unchanged if trays are outsourced.', why: 'Because the property tax continues unchanged under both options, it is an unavoidable fixed cost.' },
        { text: 'The managing director’s fixed annual salary, which stays the same whether trays are made or bought.', why: 'A salary that does not differ between Make and Buy is irrelevant to the choice.' },
      ],
      explanation: 'Only future costs that differ between making and buying are relevant. Ending the dedicated inspector’s contract avoids that salary when outsourcing, whereas the past die cost is sunk and the property tax and director’s salary are unavoidable.',
    },
    {
      type: 'F', level: 2,
      stem: `Using Table 1, what is the total relevant annual cost of making ${whole(q3Units)} units of Component M in-house, assuming the workshop space has no alternative use?`,
      options: numericOptions(
        { value: q3RelevantMake, why: `Variable cost is (${t1.mat} + ${t1.labour} + ${t1.varOh}) × ${whole(q3Units)} = ${euro(q3VarOnly)}, plus avoidable lease ${euro(t1.avoidFixed)} = ${euro(q3RelevantMake)}.` },
        [
          { value: q3VarOnly, why: `This includes only the variable costs (${euro(vUnitM)} × ${whole(q3Units)}) and leaves out the ${euro(t1.avoidFixed)} avoidable tooling lease.` },
          { value: q3WithUnavoid, why: `This includes the ${euro(t1.unavoidFixed)} unavoidable allocated factory rent on top of ${euro(q3RelevantMake)}.` },
          { value: q3WithSunkToo, why: `This adds both the ${euro(t1.unavoidFixed)} unavoidable rent and the ${euro(t1.sunkJig)} past sunk jig price.` },
        ],
        euro,
      ),
      explanation: `Unit variable cost is v = ${t1.mat} + ${t1.labour} + ${t1.varOh} = ${euro(vUnitM)}. Relevant cost of making ${whole(q3Units)} units = F_a + v × q = ${euro(t1.avoidFixed)} + ${euro(vUnitM)} × ${whole(q3Units)} = ${euro(t1.avoidFixed)} + ${euro(q3VarOnly)} = ${euro(q3RelevantMake)}. Allocated factory rent (${euro(t1.unavoidFixed)}) and the past jig purchase (${euro(t1.sunkJig)}) are excluded.`,
    },
    {
      type: 'A', level: 2,
      stem: `For Component N, in-house production incurs ${euro(q4.v)} per unit in variable costs, ${euro(q4.fa)} per year in avoidable fixed costs, and ${euro(q4.fu)} per year in unavoidable allocated fixed costs, with no alternative use for the space. An external supplier quotes ${euro(q4.pb)} per unit. At what annual volume q* do making and buying have the same cost?`,
      options: numericOptions(
        { value: q4Indiff, why: `q* = F_a ÷ (p_b − v) = ${euro(q4.fa)} ÷ (${euro(q4.pb)} − ${euro(q4.v)}) = ${whole(q4.fa)} ÷ ${q4Diff} = ${units(q4Indiff)}.` },
        [
          { value: q4UsedFu, why: `This divides the unavoidable fixed cost ${euro(q4.fu)} by ${q4Diff} instead of the avoidable fixed cost ${euro(q4.fa)}.` },
          { value: q4SubFu, why: `This subtracts ${euro(q4.fu)} from ${euro(q4.fa)} before dividing by ${q4Diff}.` },
          { value: q4AddFu, why: `This adds the unavoidable fixed cost (${euro(q4.fa)} + ${euro(q4.fu)}) before dividing by ${q4Diff}.` },
        ],
        units,
      ),
      explanation: `Unavoidable fixed costs (${euro(q4.fu)}) stay on the books under both options. Setting F_a + v × q* = p_b × q* gives q* = ${whole(q4.fa)} ÷ (${q4.pb} − ${q4.v}) = ${whole(q4.fa)} ÷ ${q4Diff} = ${units(q4Indiff)}.`,
    },
    {
      type: 'D', level: 2,
      stem: 'For a component with p_b > v and no alternative use for the space, the landlord raises the factory’s unavoidable building rent F_u while the external supplier lowers its quoted unit price p_b (still keeping p_b > v). Variable cost v and avoidable fixed cost F_a stay the same. What happens to the indifference volume q*?',
      options: [
        { text: 'q* increases, solely because the lower supplier price shrinks p_b − v; the higher unavoidable rent has no effect.', correct: true, why: 'F_u does not enter q* = F_a ÷ (p_b − v), whereas lowering p_b shrinks p_b − v in the denominator, raising q*.' },
        { text: 'q* decreases, solely because the lower supplier price shrinks p_b − v; the higher unavoidable rent has no effect.', why: 'F_u has no effect, yet making the denominator p_b − v smaller increases F_a ÷ (p_b − v) rather than decreasing it.' },
        { text: 'q* increases because both the higher unavoidable rent and the lower supplier price push q* upward.', why: 'Unavoidable rent F_u continues under both Make and Buy, so changing F_u leaves q* unchanged.' },
        { text: 'q* may rise or fall depending on whether the rent increase outweighs the supplier price cut.', why: 'Because F_u cancels out completely, the direction depends on the supplier price cut alone.' },
      ],
      explanation: 'In q* = F_a ÷ (p_b − v), unavoidable rent F_u does not appear because it is paid under both options. A lower supplier price p_b reduces the per-unit saving p_b − v of making in-house, so more units are needed to cover F_a: q* increases.',
    },
    {
      type: 'T', level: 3,
      stem: `A firm needs ${whole(q6.qty)} units per year of Component K. Making it in-house requires ${euro(q6.v)} per unit in variable costs, ${euro(q6.fa)} per year in avoidable supervision, and ${euro(q6.fu)} per year in unavoidable building depreciation. An external supplier quotes ${euro(q6.pb)} per unit. Outsourcing would also allow the firm to rent the freed workshop bay to another business, earning net income of ${euro(q6.rentAlt)} per year. Compared with making in-house, how much does buying externally save per year?`,
      options: numericOptions(
        { value: saveBuy6, why: `Relevant make cost is ${whole(q6.qty)} × ${euro(q6.v)} + ${euro(q6.fa)} = ${euro(makeRel6)}; net buy cost is ${whole(q6.qty)} × ${euro(q6.pb)} − ${euro(q6.rentAlt)} = ${euro(buyNetRel6)}; buying saves ${euro(makeRel6)} − ${euro(buyNetRel6)} = ${euro(saveBuy6)}.` },
        [
          { value: save6ForgotRent, why: `This compares ${euro(makeRel6)} with ${euro(q6.qty * q6.pb)} and leaves out the ${euro(q6.rentAlt)} rental income earned when buying.` },
          { value: save6UsedFuInsteadOfFa, why: `This uses the ${euro(q6.fu)} unavoidable depreciation in place of the ${euro(q6.fa)} avoidable supervision.` },
          { value: save6CountedFuSaved, why: `This assumes the ${euro(q6.fu)} unavoidable building depreciation is also saved when outsourcing.` },
        ],
        euro,
      ),
      explanation: `Relevant cost of making = ${whole(q6.qty)} × ${q6.v} + ${whole(q6.fa)} = ${euro(makeRel6)}. Net cost of buying = ${whole(q6.qty)} × ${q6.pb} − ${whole(q6.rentAlt)} = ${euro(q6.qty * q6.pb)} − ${euro(q6.rentAlt)} = ${euro(buyNetRel6)}. Buying externally therefore saves ${euro(makeRel6)} − ${euro(buyNetRel6)} = ${euro(saveBuy6)} per year.`,
    },
    {
      type: 'S', level: 3,
      stem: 'A firm compares making q > 0 units of a part in-house (variable cost v > 0 per unit, avoidable fixed cost F_a > 0, unavoidable fixed cost F_u > 0, no alternative use for the space) with buying them at unit price p_b. On cost grounds alone, which statement is always true?',
      options: [
        { text: 'Whenever p_b is below the full in-house cost per unit v + (F_a + F_u) ÷ q, buying is cheaper than making.', why: 'Full cost per unit includes F_u ÷ q, which is not saved by buying; buying is cheaper only when p_b < v + F_a ÷ q.' },
        { text: 'Whenever p_b > v, making in-house is cheaper than buying at every positive volume q.', why: 'For volumes below q* = F_a ÷ (p_b − v), the avoidable fixed cost F_a exceeds (p_b − v) × q, so buying is cheaper.' },
        { text: 'Whenever F_u > F_a, making in-house is cheaper than buying because F_u is spread across the q units.', why: 'F_u is owed in full under both Make and Buy, so dividing it by q does not reduce the firm’s total expenditure.' },
        { text: 'Whenever p_b ≤ v, buying is cheaper than making at every positive volume q, because F_a > 0.', correct: true, why: 'When p_b ≤ v, p_b × q ≤ v × q < F_a + v × q for every q > 0, so in-house production can never recover F_a.' },
      ],
      explanation: 'Compare p_b × q (buying) with F_a + v × q (making). Whenever p_b ≤ v and q > 0, p_b × q ≤ v × q, and since F_a > 0 it follows that p_b × q < F_a + v × q at every positive volume q.',
    },
  ],
};
