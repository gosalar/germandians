// Mock 2, passage 26. Area: natural sciences. Subject: reversible reactions, equilibrium constant and Le Châtelier's principle.
import { fixed, numericOptions, p } from '../lib.mjs';

// ---------- Table 1: equilibrium mixtures for CO(g) + 2 H2(g) ⇌ CH3OH(g) ----------
const mix500 = { temp: 500, co: 0.2, h2: 0.5, ch3oh: 0.6 };
const mix600 = { temp: 600, co: 0.4, h2: 1.0, ch3oh: 0.8 };
const tableValues = [mix500.temp, mix500.co, mix500.h2, mix500.ch3oh, mix600.temp, mix600.co, mix600.h2, mix600.ch3oh];
if (new Set(tableValues).size !== tableValues.length) {
  throw new Error('every number in Table 1 must be distinct');
}

const kcMethanol = (m) => m.ch3oh / (m.co * m.h2 ** 2);
const kc500 = kcMethanol(mix500);
const kc600 = kcMethanol(mix600);
if (!(kc600 < kc500 && mix600.ch3oh > mix500.ch3oh)) {
  throw new Error('Table 1 is designed so Kc falls with temperature even though [CH3OH] in the second vessel is larger');
}

// Question 2: Kc at 500 K and common algebraic slips.
const noSquare2 = mix500.ch3oh / (mix500.co * mix500.h2);
const timesTwo2 = mix500.ch3oh / (mix500.co * (2 * mix500.h2));
const inverted2 = (mix500.co * mix500.h2 ** 2) / mix500.ch3oh;

// Question 6: H2(g) + I2(g) ⇌ 2 HI(g) at 700 K.
const hiSys = { temp: 700, kc: 64, h2: 0.3, i2: 1.2 };
const hiSq = hiSys.kc * hiSys.h2 * hiSys.i2;
const hiRight = Math.sqrt(hiSq);
const hiHalf = hiSq / 2;
const hiForgotRootK = hiSys.kc * Math.sqrt(hiSys.h2 * hiSys.i2);
if (Math.abs(hiRight ** 2 / (hiSys.h2 * hiSys.i2) - hiSys.kc) > 1e-9) {
  throw new Error('question 6 answer does not satisfy Kc');
}
const q6All = [hiSys.temp, hiSys.kc, hiSys.h2, hiSys.i2, hiRight, hiHalf, hiSq, hiForgotRootK];
if (q6All.some((v) => tableValues.includes(v) || [kc500, kc600, noSquare2, timesTwo2].includes(v))) {
  throw new Error('question 6 numbers must not repeat values from Table 1 or question 2');
}

const molL = (v) => `${fixed(v, 2)} mol/L`;

export default {
  id: 'p26',
  set: 'mock',
  mock: 2,
  area: 'natural sciences',
  title: 'Chemical Equilibrium',
  facts: [
    { claim: 'Reversible reactions proceed in both forward (left-to-right) and reverse (right-to-left) directions; chemical equilibrium is reached when the forward and reverse reaction rates are equal, so reactant and product concentrations stay constant over time while both reactions continue dynamically.', source: 'https://openstax.org/books/chemistry-2e/pages/13-1-chemical-equilibria', read: '2026-11-18' },
    { claim: 'For a reversible reaction aA + bB ⇌ cC + dD, the reaction quotient Qc = ([C]^c [D]^d) ÷ ([A]^a [B]^b) equals the equilibrium constant Kc at equilibrium; at a given temperature Kc is constant regardless of starting concentrations, with Kc > 1 favouring products and Kc < 1 favouring reactants.', source: 'https://openstax.org/books/chemistry-2e/pages/13-2-equilibrium-constants', read: '2026-11-18' },
    { claim: 'In heterogeneous equilibria involving two or more phases, concentration terms in Kc and Qc appear only for gaseous and dissolved species; pure solids and pure liquids are omitted.', source: 'https://openstax.org/books/chemistry-2e/pages/13-2-equilibrium-constants', read: '2026-11-18' },
    { claim: 'By Le Châtelier\'s principle, an equilibrium system disturbed by a change in concentration or temperature shifts in the direction that partly counteracts the disturbance until Qc again equals Kc.', source: 'https://openstax.org/books/chemistry-2e/pages/13-3-shifting-equilibria-le-chateliers-principle', read: '2026-11-18' },
    { claim: 'At constant temperature, adding a reactant (or removing a product) makes Qc < Kc and shifts the reaction towards products without changing Kc; adding a product (or removing a reactant) makes Qc > Kc and shifts it towards reactants.', source: 'https://openstax.org/books/chemistry-2e/pages/13-3-shifting-equilibria-le-chateliers-principle', read: '2026-11-18' },
    { claim: 'Changing the temperature alters the value of Kc: heating shifts an endothermic (heat-absorbing) reaction towards products, raising Kc, and shifts an exothermic (heat-releasing) reaction towards reactants, lowering Kc.', source: 'https://openstax.org/books/chemistry-2e/pages/13-3-shifting-equilibria-le-chateliers-principle', read: '2026-11-18' },
    { claim: 'A catalyst accelerates both the forward and reverse reactions equally, so equilibrium is reached faster without changing the equilibrium concentrations or Kc.', source: 'https://openstax.org/books/chemistry-2e/pages/13-3-shifting-equilibria-le-chateliers-principle', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'Many chemical reactions are reversible: while reactants combine to form products (the forward reaction), products also react back to form reactants (the reverse reaction), shown by a double arrow, ⇌.',
      'In a closed vessel at constant temperature, a reversible reaction reaches chemical equilibrium when the rate of the forward reaction equals the rate of the reverse reaction.',
      'Equilibrium is dynamic, meaning both reactions keep running at equal speeds; concentrations stop changing over time, though reactant and product concentrations need not be equal to each other.',
    ),
    p(
      'Concentrations of gases and dissolved substances are measured in moles per litre (mol/L) and written in square brackets, such as [A].',
      'For a balanced equation aA + bB ⇌ cC + dD involving gases or dissolved species, the equilibrium concentrations satisfy the equilibrium constant expression:',
    ),
    { type: 'formula', text: 'Kc = ([C]^c × [D]^d) ÷ ([A]^a × [B]^b)' },
    p(
      'Each concentration is raised to its coefficient in the balanced equation.',
      'Pure solids, marked (s), and pure liquids, marked (l), are left out of the expression; only gases, (g), and dissolved species, (aq), enter it.',
      'At a given temperature, Kc has a single fixed value whatever starting mixture is placed in the vessel: a large value (Kc > 1) means products predominate at equilibrium, whereas a small value (Kc < 1) means reactants predominate.',
      'Substituting the concentrations of any mixture not yet known to be at equilibrium into the same fraction gives the reaction quotient, Qc:',
    ),
    { type: 'formula', text: 'Qc < Kc: net forward shift · Qc = Kc: at equilibrium · Qc > Kc: net reverse shift' },
    p(
      'Le Châtelier\'s principle describes how an equilibrium mixture responds when disturbed: it shifts in the direction that partly counteracts the disturbance until Qc equals Kc again.',
      'Adding a reactant (or removing a product) at constant temperature lowers Qc below Kc, driving a net forward reaction that forms more product without changing Kc.',
      'Adding a catalyst speeds up the forward and reverse reactions equally, so equilibrium is reached sooner without shifting equilibrium concentrations or Kc.',
    ),
    p(
      'Temperature is the disturbance that changes Kc itself.',
      'In an endothermic reaction, which absorbs heat, heat acts like a reactant: raising the temperature shifts equilibrium towards products and increases Kc.',
      'In an exothermic reaction, which releases heat, heat acts like a product: raising the temperature shifts equilibrium towards reactants and decreases Kc.',
      'Table 1 gives measured equilibrium concentrations in two separate closed vessels for the synthesis of methanol, CO(g) + 2 H₂(g) ⇌ CH₃OH(g).',
    ),
    {
      type: 'table',
      caption: 'Table 1. Equilibrium concentrations for CO(g) + 2 H₂(g) ⇌ CH₃OH(g) at two temperatures.',
      head: ['Temperature (K)', '[CO] (mol/L)', '[H₂] (mol/L)', '[CH₃OH] (mol/L)'],
      rows: [mix500, mix600].map((m) => [`${m.temp}`, fixed(m.co, 2), fixed(m.h2, 2), fixed(m.ch3oh, 2)]),
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what is true of a reversible reaction in a closed vessel once it has reached chemical equilibrium?',
      options: [
        { text: 'Both the forward reaction and the reverse reaction have stopped completely.', why: 'Equilibrium is dynamic: both reactions keep occurring, at equal rates.' },
        { text: 'The forward and reverse reactions continue at equal rates, so concentrations remain constant.', correct: true, why: 'This is the definition of dynamic chemical equilibrium in the first paragraph.' },
        { text: 'The concentration of every reactant equals the concentration of every product.', why: 'The first paragraph notes that concentrations stay constant over time, not that reactant and product concentrations must be equal.' },
        { text: 'All reactants have been converted into products, leaving Qc equal to zero.', why: 'In a reversible reaction both reactants and products remain present at equilibrium, with Qc equal to Kc.' },
      ],
      explanation: 'The first paragraph explains that chemical equilibrium is dynamic: the forward and reverse reactions continue at equal rates, keeping the concentrations of reactants and products constant over time without requiring them to be equal to one another.',
    },
    {
      type: 'A', level: 2,
      stem: `Using Table 1, what is the numerical value of the equilibrium constant Kc for CO(g) + 2 H₂(g) ⇌ CH₃OH(g) at ${mix500.temp} K?`,
      options: numericOptions(
        { value: kc500, why: `[CH₃OH] ÷ ([CO] × [H₂]²) = ${fixed(mix500.ch3oh, 2)} ÷ (${fixed(mix500.co, 2)} × ${fixed(mix500.h2, 2)}²) = ${fixed(mix500.ch3oh, 2)} ÷ ${fixed(mix500.co * mix500.h2 ** 2, 2)} = ${fixed(kc500, 2)}.` },
        [
          { value: inverted2, why: 'This divides the reactants by the product, turning the Kc expression upside down.' },
          { value: timesTwo2, why: `This multiplies [H₂] by 2 instead of squaring [H₂]: ${fixed(mix500.ch3oh, 2)} ÷ (${fixed(mix500.co, 2)} × 2 × ${fixed(mix500.h2, 2)}).` },
          { value: noSquare2, why: `This omits the exponent 2 on [H₂]: ${fixed(mix500.ch3oh, 2)} ÷ (${fixed(mix500.co, 2)} × ${fixed(mix500.h2, 2)}).` },
        ],
      ),
      explanation: `For CO(g) + 2 H₂(g) ⇌ CH₃OH(g), the coefficient 2 in front of H₂ becomes an exponent of 2 on [H₂]: Kc = [CH₃OH] ÷ ([CO] × [H₂]²). At ${mix500.temp} K, Kc = ${fixed(mix500.ch3oh, 2)} ÷ (${fixed(mix500.co, 2)} × ${fixed(mix500.h2, 2)}²) = ${fixed(mix500.ch3oh, 2)} ÷ (${fixed(mix500.co, 2)} × ${fixed(mix500.h2 ** 2, 2)}) = ${fixed(mix500.ch3oh, 2)} ÷ ${fixed(mix500.co * mix500.h2 ** 2, 2)} = ${fixed(kc500, 2)}.`,
    },
    {
      type: 'C', level: 1,
      stem: 'Solid carbon reacts with carbon dioxide gas in a closed vessel according to C(s) + CO₂(g) ⇌ 2 CO(g). Following the rules in the text, which expression gives Kc?',
      options: [
        { text: '[CO]² ÷ [CO₂]', correct: true, why: 'Pure solid C(s) is omitted, gaseous CO has coefficient 2 so [CO] is squared, and gaseous CO₂ goes in the denominator.' },
        { text: '[CO]² ÷ ([C] × [CO₂])', why: 'C(s) is a pure solid, and pure solids are left out of the Kc expression.' },
        { text: '(2 × [CO]) ÷ [CO₂]', why: 'A stoichiometric coefficient of 2 becomes a power of 2 on [CO], not multiplication by 2.' },
        { text: '[CO₂] ÷ [CO]²', why: 'Products belong in the numerator and reactants in the denominator; this fraction is upside down.' },
      ],
      explanation: 'By the third paragraph, products go in the numerator, reactants in the denominator, each raised to its coefficient, and pure solids marked (s) are left out. Omitting C(s) and squaring [CO] leaves Kc = [CO]² ÷ [CO₂].',
    },
    {
      type: 'D', level: 2,
      stem: `A closed rigid vessel holds CO(g), H₂(g) and CH₃OH(g) at equilibrium at ${mix500.temp} K. Extra CO(g) is injected while the temperature is held at ${mix500.temp} K. Once equilibrium is restored, how have the amount of CH₃OH(g) in the vessel and the value of Kc changed compared with before the injection?`,
      options: [
        { text: 'More CH₃OH(g) is present, and Kc has increased.', why: 'Kc depends on temperature; adding a reactant at constant temperature shifts the mixture without changing Kc.' },
        { text: 'Less CH₃OH(g) is present, and Kc is unchanged.', why: 'Adding a reactant lowers Qc below Kc, which drives a net forward reaction to form more product, not less.' },
        { text: 'More CH₃OH(g) is present, and Kc is unchanged.', correct: true, why: 'Injecting CO(g) makes Qc < Kc, so a net forward shift produces more CH₃OH(g) while constant temperature keeps Kc fixed.' },
        { text: 'Neither the amount of CH₃OH(g) nor Kc has changed.', why: 'Leaving equilibrium amounts unchanged is the effect of adding a catalyst, not of injecting extra reactant.' },
      ],
      explanation: `Adding CO(g) increases a reactant concentration in the denominator of Qc, making Qc < Kc. At constant temperature (${mix500.temp} K), Kc does not change, so the reaction undergoes a net forward shift that consumes part of the added CO(g) with H₂(g) and forms more CH₃OH(g) until Qc equals Kc again.`,
    },
    {
      type: 'F', level: 2,
      stem: `What do the two equilibrium mixtures in Table 1 show about whether the forward reaction CO(g) + 2 H₂(g) → CH₃OH(g) is exothermic or endothermic?`,
      options: [
        { text: `Endothermic, because [CH₃OH] is higher in the ${mix600.temp} K vessel than in the ${mix500.temp} K vessel.`, why: 'The two vessels need not contain the same total amount of material; comparing [CH₃OH] alone ignores the larger rise in [CO] and [H₂].' },
        { text: `Endothermic, because Kc is larger at ${mix600.temp} K than at ${mix500.temp} K.`, why: `At ${mix600.temp} K, [CH₃OH] ÷ ([CO] × [H₂]²) = ${fixed(kc600, 2)}, which is smaller than Kc at ${mix500.temp} K, not larger.` },
        { text: 'Neither can be told from Table 1, because Kc does not change with temperature.', why: 'The fifth paragraph states that temperature is the disturbance that changes Kc itself.' },
        { text: `Exothermic, because Kc is smaller at ${mix600.temp} K than at ${mix500.temp} K.`, correct: true, why: `Raising the temperature from ${mix500.temp} K to ${mix600.temp} K lowers Kc (to ${fixed(kc600, 2)}), which is the mark of an exothermic forward reaction.` },
      ],
      explanation: `Whether heating favours reactants or products is told from Kc, not from a single concentration in two separate vessels. At ${mix600.temp} K, Kc = ${fixed(mix600.ch3oh, 2)} ÷ (${fixed(mix600.co, 2)} × ${fixed(mix600.h2, 2)}²) = ${fixed(kc600, 2)}, smaller than Kc at ${mix500.temp} K. By the fifth paragraph, a decrease in Kc when temperature rises means the forward reaction is exothermic.`,
    },
    {
      type: 'T', level: 3,
      stem: `For the reversible reaction H₂(g) + I₂(g) ⇌ 2 HI(g), the equilibrium constant at ${hiSys.temp} K is Kc = ${hiSys.kc}. In an equilibrium mixture at ${hiSys.temp} K, the reactant concentrations are [H₂] = ${fixed(hiSys.h2, 2)} mol/L and [I₂] = ${fixed(hiSys.i2, 2)} mol/L. What is the equilibrium concentration [HI]?`,
      options: numericOptions(
        { value: hiRight, why: `[HI]² = Kc × [H₂] × [I₂] = ${hiSys.kc} × ${fixed(hiSys.h2, 2)} × ${fixed(hiSys.i2, 2)} = ${fixed(hiSq, 2)}, and √${fixed(hiSq, 2)} = ${fixed(hiRight, 2)} mol/L.` },
        [
          { value: hiHalf, why: `This writes 2 × [HI] = ${fixed(hiSq, 2)} and divides by 2 instead of taking the square root of [HI]².` },
          { value: hiSq, why: `This is [HI]² = ${hiSys.kc} × ${fixed(hiSys.h2, 2)} × ${fixed(hiSys.i2, 2)}, before taking the square root.` },
          { value: hiForgotRootK, why: `This takes √([H₂] × [I₂]) = ${fixed(Math.sqrt(hiSys.h2 * hiSys.i2), 2)} but multiplies by ${hiSys.kc} instead of √${hiSys.kc} = ${Math.sqrt(hiSys.kc)}.` },
        ],
        molL,
      ),
      explanation: `For H₂(g) + I₂(g) ⇌ 2 HI(g), Kc = [HI]² ÷ ([H₂] × [I₂]). Rearranging gives [HI]² = Kc × [H₂] × [I₂] = ${hiSys.kc} × (${fixed(hiSys.h2, 2)} × ${fixed(hiSys.i2, 2)}) = ${hiSys.kc} × ${fixed(hiSys.h2 * hiSys.i2, 2)}. Taking square roots of both factors gives [HI] = √${hiSys.kc} × √${fixed(hiSys.h2 * hiSys.i2, 2)} = ${Math.sqrt(hiSys.kc)} × ${fixed(Math.sqrt(hiSys.h2 * hiSys.i2), 2)} = ${fixed(hiRight, 2)} mol/L.`,
    },
  ],
};
