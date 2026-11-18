// Full mock 2, passage 3. Area: natural sciences. Subject: specific heat capacity and thermal equilibrium.
import { fixed, numericOptions, p, whole } from '../lib.mjs';

// ---------- Table 1: specific heat capacities in J/(kg·K) at room temperature (OpenStax Table 14.1) ----------
const cWater = 4186;
const cEthanol = 2450;
const cAluminium = 900;
const cCopper = 387;

const tableValues = [cWater, cEthanol, cAluminium, cCopper];
if (new Set(tableValues).size !== tableValues.length) {
  throw new Error('every specific heat value in Table 1 must be different');
}

const tableRows = [
  ['Water (liquid)', whole(cWater)],
  ['Ethanol (liquid)', whole(cEthanol)],
  ['Aluminium (solid)', whole(cAluminium)],
  ['Copper (solid)', whole(cCopper)],
];

// Question 2: ratio of temperature rises for equal masses and equal heat Q (copper vs aluminium).
const ratioCuToAl = cAluminium / cCopper;
const ratioAlToCu = cCopper / cAluminium;
const excessCuOverAl = (cAluminium - cCopper) / cCopper;
const sameRise = 1;

// Question 3: heat needed to warm liquid ethanol (kJ).
const q3 = { mass: 1.5, c: cEthanol, tStart: 16, tEnd: 36 };
const dT3 = q3.tEnd - q3.tStart;
const heat3kJ = (q3.mass * q3.c * dT3) / 1000;
const heat3NoMass = (q3.c * dT3) / 1000;
const heat3UseStart = (q3.mass * q3.c * q3.tStart) / 1000;
const heat3UseEnd = (q3.mass * q3.c * q3.tEnd) / 1000;
if ([heat3kJ, heat3NoMass, heat3UseStart, heat3UseEnd].some((v) => [q3.mass, dT3, q3.tStart, q3.tEnd].includes(v))) {
  throw new Error('question 3 options must not repeat raw inputs');
}

// Question 4: insulated mixing of aluminium and liquid water (all strictly between 0 °C and 100 °C).
const mix = { mAl: 1.5, tAl: 85, mW: 0.5, tW: 15 };
if (mix.tAl >= 100 || mix.tW <= 0) throw new Error('question 4 must stay away from water phase-change temperatures');
const capAl = mix.mAl * cAluminium;
const capW = mix.mW * cWater;
const tEq4 = (capAl * mix.tAl + capW * mix.tW) / (capAl + capW);
const tByCOnly = (cAluminium * mix.tAl + cWater * mix.tW) / (cAluminium + cWater);
const tMidpoint = (mix.tAl + mix.tW) / 2;
const tByMassOnly = (mix.mAl * mix.tAl + mix.mW * mix.tW) / (mix.mAl + mix.mW);

// Question 5: check numerically that doubling copper mass raises (Tf − Tw) by less than a factor of 2.
const q5Check = { mCu: 0.8, tCu: 90, mW: 0.5, tW: 20 };
const eqTemp = (m1, c1, t1, m2, c2, t2) => (m1 * c1 * t1 + m2 * c2 * t2) / (m1 * c1 + m2 * c2);
const riseBefore = eqTemp(q5Check.mCu, cCopper, q5Check.tCu, q5Check.mW, cWater, q5Check.tW) - q5Check.tW;
const riseDoubled = eqTemp(2 * q5Check.mCu, cCopper, q5Check.tCu, q5Check.mW, cWater, q5Check.tW) - q5Check.tW;
if (!(riseDoubled > riseBefore && riseDoubled < 2 * riseBefore)) {
  throw new Error('question 5 direction check failed');
}

// Question 6: finding unknown alloy specific heat from calorimetry in ethanol.
const cal = { mAlloy: 0.5, tAlloy: 95, mEth: 0.4, tEth: 20, tFinal: 35 };
const dTEth = cal.tFinal - cal.tEth;
const dTAlloy = cal.tAlloy - cal.tFinal;
const qEthanolGained = cal.mEth * cEthanol * dTEth;
const cAlloy = qEthanolGained / (cal.mAlloy * dTAlloy);
const cAlloyForgotMass = qEthanolGained / dTAlloy; // heat capacity C instead of specific heat c
const cAlloyUsedInitialT = qEthanolGained / (cal.mAlloy * cal.tAlloy);
const cAlloyOmittedBothMasses = (cEthanol * dTEth) / dTAlloy;
if (!Number.isInteger(cAlloy)) throw new Error('question 6 expected an integer specific heat for the alloy');
if ([cAlloy, Math.round(cAlloyForgotMass), Math.round(cAlloyUsedInitialT), Math.round(cAlloyOmittedBothMasses)].some((v) => tableValues.includes(v))) {
  throw new Error('question 6 options must not collide with Table 1 values');
}

const kJ = (v) => `${fixed(v, 1)} kJ`;
const degC = (v) => `${fixed(v, 1)} °C`;
const jPerKgK = (v) => `${whole(v)} J/(kg·K)`;

export default {
  id: 'p20',
  set: 'mock',
  mock: 2,
  area: 'natural sciences',
  title: 'Specific Heat Capacity and Thermal Equilibrium',
  facts: [
    { claim: 'Heat transferred without a phase change is Q = m c ΔT, where m is mass in kg, c is specific heat capacity in J/(kg·K) or J/(kg·°C), and ΔT is temperature change; a change of 1 °C equals a change of 1 K.', source: 'https://openstax.org/books/college-physics-2e/pages/14-2-temperature-change-and-heat-capacity', read: '2026-11-18' },
    { claim: 'Representative specific heat capacities at room temperature: liquid water 4,186 J/(kg·K), liquid ethanol 2,450 J/(kg·K), aluminium 900 J/(kg·K), copper 387 J/(kg·K); water has a much higher specific heat than common metals.', source: 'https://openstax.org/books/college-physics-2e/pages/14-2-temperature-change-and-heat-capacity', read: '2026-11-18' },
    { claim: 'The heat capacity of a body is C = m c (in J/K), the energy needed to raise the temperature of the whole body by 1 K.', source: 'https://openstax.org/books/chemistry-2e/pages/5-2-calorimetry', read: '2026-11-18' },
    { claim: 'In an insulated calorimeter with negligible heat transfer to the container or surroundings, heat flows from the hotter object to the colder object until both reach a common equilibrium temperature, with heat lost by the hotter object equal to heat gained by the colder object.', source: 'https://openstax.org/books/university-physics-volume-2/pages/1-4-heat-transfer-specific-heat-and-calorimetry', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'Adding the same thermal energy to equal masses of water and copper warms the copper far more than the water.',
      'This difference is captured by the specific heat capacity c of a substance: the thermal energy, in joules (J), needed to raise the temperature of 1 kilogram (kg) of that substance by 1 kelvin (K), provided no change of state such as melting or boiling occurs.',
      'Because a temperature step of 1 degree Celsius (°C) equals a step of 1 K, specific heat capacity has the same numerical value in J/(kg·K) and in J/(kg·°C).',
      'For an object of mass m whose temperature changes by ΔT = T_final − T_initial without changing state, the thermal energy Q absorbed (or released, as a magnitude) is',
    ),
    { type: 'formula', text: 'Q = m × c × ΔT' },
    p(
      'One kilojoule (kJ) is 1,000 J.',
      'While c belongs to the material, the product C = m × c (measured in J/K) is called the heat capacity of that particular object: how many joules are needed to warm the whole object by 1 K.',
      'Table 1 lists specific heat capacities of four substances at room temperature.',
      'Water has a remarkably high value, more than four times that of aluminium and more than ten times that of copper.',
    ),
    {
      type: 'table',
      caption: 'Table 1. Specific heat capacity c at room temperature, in J/(kg·K).',
      head: ['Substance', 'Specific heat capacity c in J/(kg·K)'],
      rows: tableRows,
    },
    p(
      'When a hotter object at initial temperature T₁ and a cooler object at initial temperature T₂ are placed together inside a thermally insulated container, called a calorimeter, thermal energy flows from the hotter object to the cooler one until both reach the same final equilibrium temperature T_f.',
      'If no change of state occurs and negligible heat is exchanged with the container or outside air, conservation of energy requires that the thermal energy lost by the hotter object equals the thermal energy gained by the cooler object:',
    ),
    { type: 'formula', text: 'm₁ × c₁ × (T₁ − T_f) = m₂ × c₂ × (T_f − T₂)' },
    p(
      'Solving this balance shows that T_f always lies between T₂ and T₁, closer to the starting temperature of whichever object has the larger heat capacity m × c.',
    ),
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what does the specific heat capacity c of a substance measure when no change of state occurs?',
      options: [
        { text: 'The thermal energy required to raise the temperature of 1 kg of the substance by 1 K.', correct: true, why: 'This is the definition in the first paragraph, giving the unit J/(kg·K).' },
        { text: 'The thermal energy required to raise the temperature of the entire object by 1 K, regardless of its mass.', why: 'That is the object’s heat capacity C = m × c, in J/K, which grows with mass.' },
        { text: 'The highest temperature that 1 kg of the substance can reach before melting or boiling.', why: 'Melting and boiling points are temperatures in °C or K, not energies per kilogram per kelvin.' },
        { text: 'The thermal energy transferred through the substance in 1 second.', why: 'Energy transferred per second is a rate of heat flow (power), whereas specific heat capacity contains no unit of time.' },
      ],
      explanation: 'The first paragraph defines specific heat capacity c as the thermal energy in joules required to raise the temperature of 1 kg of the substance by 1 K (or 1 °C) without a change of state.',
    },
    {
      type: 'F', level: 1,
      stem: 'Equal masses of the substances in Table 1 each absorb the same amount of thermal energy without changing state. How many times as large is the temperature rise of the copper sample as that of the aluminium sample?',
      options: numericOptions(
        { value: ratioCuToAl, why: `From Q = m × c × ΔT with equal Q and m, ΔT_Cu ÷ ΔT_Al = c_Al ÷ c_Cu = ${cAluminium} ÷ ${cCopper} = ${fixed(ratioCuToAl, 2)}.` },
        [
          { value: ratioAlToCu, why: `This inverts the ratio (${cCopper} ÷ ${cAluminium}), treating ΔT as proportional to c rather than inversely proportional.` },
          { value: sameRise, why: 'Equal masses absorbing equal heat have the same ΔT only when their specific heat capacities are equal.' },
          { value: excessCuOverAl, why: `This computes (${cAluminium} − ${cCopper}) ÷ ${cCopper}, the fractional excess rather than how many times as large ΔT_Cu is.` },
        ],
        (v) => fixed(v, 2),
      ),
      explanation: `Rearranging Q = m × c × ΔT gives ΔT = Q ÷ (m × c). With equal Q and equal m, the temperature rise is inversely proportional to c: ΔT_Cu ÷ ΔT_Al = ${cAluminium} ÷ ${cCopper} = ${fixed(ratioCuToAl, 2)}.`,
    },
    {
      type: 'A', level: 2,
      stem: `Using Table 1, how much thermal energy (in kJ) is needed to warm ${fixed(q3.mass, 1)} kg of liquid ethanol from ${q3.tStart} °C to ${q3.tEnd} °C?`,
      options: numericOptions(
        { value: heat3kJ, why: `${fixed(q3.mass, 1)} × ${whole(q3.c)} × (${q3.tEnd} − ${q3.tStart}) = ${whole(heat3kJ * 1000)} J = ${kJ(heat3kJ)}.` },
        [
          { value: heat3NoMass, why: `This calculates ${whole(q3.c)} × ${dT3} ÷ 1,000 and leaves out the mass of ${fixed(q3.mass, 1)} kg.` },
          { value: heat3UseStart, why: `This multiplies by the starting temperature ${q3.tStart} °C instead of the temperature change ΔT = ${dT3} °C.` },
          { value: heat3UseEnd, why: `This multiplies by the final temperature ${q3.tEnd} °C instead of the temperature change ΔT = ${dT3} °C.` },
        ],
        kJ,
      ),
      explanation: `The temperature rise is ΔT = ${q3.tEnd} − ${q3.tStart} = ${dT3} °C (or ${dT3} K). From Table 1, ethanol has c = ${whole(q3.c)} J/(kg·K), so Q = ${fixed(q3.mass, 1)} × ${whole(q3.c)} × ${dT3} = ${whole(heat3kJ * 1000)} J = ${kJ(heat3kJ)}.`,
    },
    {
      type: 'A', level: 2,
      stem: `Inside an insulated calorimeter with negligible heat loss, a ${fixed(mix.mAl, 1)} kg block of aluminium at ${mix.tAl} °C is placed into ${fixed(mix.mW, 2)} kg of liquid water at ${mix.tW} °C. Using Table 1, what final equilibrium temperature do they reach?`,
      options: numericOptions(
        { value: tEq4, why: `Heat capacities are ${whole(capAl)} J/K (Al) and ${whole(capW)} J/K (water), giving (${whole(capAl)} × ${mix.tAl} + ${whole(capW)} × ${mix.tW}) ÷ ${whole(capAl + capW)} = ${degC(tEq4)}.` },
        [
          { value: tByCOnly, why: 'This weights the temperatures by specific heat c alone and ignores that there is three times as much aluminium by mass as water.' },
          { value: tMidpoint, why: `This takes the unweighted average (${mix.tAl} + ${mix.tW}) ÷ 2, ignoring both mass and specific heat.` },
          { value: tByMassOnly, why: 'This weights the temperatures by mass m alone, ignoring that water has a much higher specific heat than aluminium.' },
        ],
        degC,
      ),
      explanation: `For aluminium, m₁ × c₁ = ${fixed(mix.mAl, 1)} × ${cAluminium} = ${whole(capAl)} J/K. For water, m₂ × c₂ = ${fixed(mix.mW, 2)} × ${whole(cWater)} = ${whole(capW)} J/K. Setting ${whole(capAl)} × (${mix.tAl} − T_f) = ${whole(capW)} × (T_f − ${mix.tW}) gives ${whole(capAl + capW)} × T_f = ${whole(capAl * mix.tAl + capW * mix.tW)}, so T_f = ${degC(tEq4)}.`,
    },
    {
      type: 'D', level: 2,
      stem: `In an insulated calorimeter, a hot copper block at ${q5Check.tCu} °C and cool liquid water at ${q5Check.tW} °C reach an equilibrium temperature T_f. The experiment is repeated from the same starting temperatures (${q5Check.tCu} °C and ${q5Check.tW} °C) with the same mass of water, but with a copper block of twice the mass. How does the new equilibrium temperature compare with T_f?`,
      options: [
        { text: `It is higher than T_f, and the rise above ${q5Check.tW} °C is less than twice as large as before.`, correct: true, why: 'Doubling the copper mass doubles C₁ in C₁ × (90 − 20) ÷ (C₁ + C₂), raising T_f, while C₁ + C₂ in the denominator also grows so the rise less than doubles.' },
        { text: `It is higher than T_f, and the rise above ${q5Check.tW} °C is twice as large as before.`, why: 'From m₁ c₁ (90 − T_f) = m₂ c₂ (T_f − 20), T_f − 20 = C₁ × 70 ÷ (C₁ + C₂); doubling C₁ increases the denominator as well.' },
        { text: 'It is lower than T_f, because a heavier copper block changes temperature more slowly.', why: 'A heavier hot block at 90 °C brings more thermal energy, pulling the common final temperature closer to 90 °C, not lower.' },
        { text: 'It equals T_f, because the specific heat capacity of copper does not depend on mass.', why: 'Specific heat c stays at 387 J/(kg·K), but the energy balance depends on the heat capacity m × c of each object.' },
      ],
      explanation: `Rearranging the energy balance gives T_f − ${q5Check.tW} = C_Cu × (${q5Check.tCu} − ${q5Check.tW}) ÷ (C_Cu + C_water). Doubling the copper mass replaces C_Cu with 2 C_Cu: the numerator doubles and the denominator grows by less than a factor of 2, so T_f rises, yet the water's temperature rise above ${q5Check.tW} °C less than doubles.`,
    },
    {
      type: 'T', level: 3,
      stem: `To measure the specific heat capacity of a metal alloy, a ${fixed(cal.mAlloy, 2)} kg sample of the alloy at ${cal.tAlloy} °C is placed into ${fixed(cal.mEth, 2)} kg of liquid ethanol at ${cal.tEth} °C inside an insulated calorimeter. Using Table 1 for ethanol, if they reach thermal equilibrium at ${cal.tFinal} °C with negligible heat loss and no change of state, what is the specific heat capacity of the alloy?`,
      options: numericOptions(
        { value: cAlloy, why: `Ethanol gains ${fixed(cal.mEth, 2)} × ${whole(cEthanol)} × ${dTEth} = ${whole(qEthanolGained)} J; dividing by (${fixed(cal.mAlloy, 2)} × ${dTAlloy}) gives ${jPerKgK(cAlloy)}.` },
        [
          { value: cAlloyForgotMass, why: `This computes ${whole(qEthanolGained)} ÷ ${dTAlloy} = ${whole(cAlloyForgotMass)} J/K, the sample's heat capacity C, without dividing by its ${fixed(cal.mAlloy, 2)} kg mass.` },
          { value: cAlloyUsedInitialT, why: `This divides ${whole(qEthanolGained)} J by ${fixed(cal.mAlloy, 2)} × ${cal.tAlloy}, using the starting temperature ${cal.tAlloy} °C instead of the drop ${cal.tAlloy} − ${cal.tFinal} = ${dTAlloy} °C.` },
          { value: cAlloyOmittedBothMasses, why: `This computes ${whole(cEthanol)} × ${dTEth} ÷ ${dTAlloy}, omitting the different masses ${fixed(cal.mEth, 2)} kg and ${fixed(cal.mAlloy, 2)} kg.` },
        ],
        jPerKgK,
      ),
      explanation: `Ethanol warms by ${cal.tFinal} − ${cal.tEth} = ${dTEth} K and gains Q = ${fixed(cal.mEth, 2)} × ${whole(cEthanol)} × ${dTEth} = ${whole(qEthanolGained)} J. The alloy cools by ${cal.tAlloy} − ${cal.tFinal} = ${dTAlloy} K and loses the same ${whole(qEthanolGained)} J, so c_alloy = ${whole(qEthanolGained)} ÷ (${fixed(cal.mAlloy, 2)} × ${dTAlloy}) = ${whole(qEthanolGained)} ÷ ${cal.mAlloy * dTAlloy} = ${jPerKgK(cAlloy)}.`,
    },
    {
      type: 'S', level: 3,
      stem: 'Two objects made of different materials, at different initial temperatures T₁ and T₂, are placed together inside an insulated calorimeter with negligible heat loss and no change of state. Under what condition is their final equilibrium temperature halfway between T₁ and T₂, that is, (T₁ + T₂) ÷ 2?',
      options: [
        { text: 'Whenever the two objects have the same mass, m₁ = m₂.', why: 'Different materials have different specific heat capacities c, so equal masses give unequal m × c and pull T_f toward the higher-c object.' },
        { text: 'Whenever m₁ ÷ c₁ equals m₂ ÷ c₂.', why: 'Equal temperature changes require equal products m × c in the energy balance, not equal quotients m ÷ c.' },
        { text: 'Never, because different materials have different specific heat capacities.', why: 'Choosing the masses in inverse proportion to the specific heat capacities makes m₁ × c₁ = m₂ × c₂ and places T_f at the midpoint.' },
        { text: 'Whenever the two objects have equal heat capacities, m₁ × c₁ = m₂ × c₂.', correct: true, why: 'At T_f = (T₁ + T₂) ÷ 2 both objects change temperature by |T₁ − T₂| ÷ 2, so m₁ c₁ (T₁ − T_f) = m₂ c₂ (T_f − T₂) reduces to m₁ × c₁ = m₂ × c₂.' },
      ],
      explanation: 'If T_f = (T₁ + T₂) ÷ 2, then T₁ − T_f and T_f − T₂ are both equal to (T₁ − T₂) ÷ 2. Since T₁ ≠ T₂, dividing both sides of m₁ × c₁ × (T₁ − T_f) = m₂ × c₂ × (T_f − T₂) by (T₁ − T₂) ÷ 2 leaves m₁ × c₁ = m₂ × c₂.',
    },
  ],
};
