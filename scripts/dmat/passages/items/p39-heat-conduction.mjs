// Full mock 4, passage 4. Area: engineering. Subject: steady-state heat conduction and thermal resistance in series.
import { fixed, numericOptions, p, whole } from '../lib.mjs';

// ---------- Table 1: thermal conductivities in W/(m·K) (OpenStax College Physics 2e, Table 14.3) ----------
const kSteel = 14;
const kBrick = 0.84;
const kPlaster = 0.16;
const kCork = 0.042;

const tableValues = [kSteel, kBrick, kPlaster, kCork];
if (new Set(tableValues).size !== tableValues.length) {
  throw new Error('every thermal conductivity in Table 1 must be different');
}

const tableRows = [
  ['Stainless steel', `${kSteel}`],
  ['Concrete brick', fixed(kBrick, 2)],
  ['Plasterboard', fixed(kPlaster, 2)],
  ['Cork', fixed(kCork, 3)],
];

// ---------- Figure 1: two-layer brick-and-cork wall ----------
const fig = { area: 5.0, tHot: 22, tCold: -3, lBrick: 0.42, lCork: 0.084 };
const figNums = [fig.area, fig.tHot, fig.tCold, fig.lBrick, fig.lCork];
if (new Set(figNums).size !== figNums.length) {
  throw new Error('every number on Figure 1 must be different');
}
const rBrickFig = fig.lBrick / kBrick;
const rCorkFig = fig.lCork / kCork;
const rTotalFig = rBrickFig + rCorkFig;
const dTFig = fig.tHot - fig.tCold;
const pFigWatts = (fig.area * dTFig) / rTotalFig;
if (rBrickFig !== 0.5 || rCorkFig !== 2.0 || pFigWatts !== 50) {
  throw new Error('Figure 1 arithmetic check failed');
}

// Question 2: thickness of concrete brick matching R of 0.040 m plasterboard.
const lPlaster2 = 0.040;
const rTarget2 = lPlaster2 / kPlaster;
const lBrick2 = rTarget2 * kBrick;
const lBrickInverted2 = lPlaster2 * (kPlaster / kBrick);
const lSteelWrongRow2 = rTarget2 * kSteel;

// Question 3: heat-transfer rate P through the wall in Figure 1.
const pFluxOnly3 = dTFig / rTotalFig;
const pSignSlip3 = (fig.area * (fig.tHot - Math.abs(fig.tCold))) / rTotalFig;
const pNoCork3 = (fig.area * dTFig) / rBrickFig;

// Question 4: stainless-steel plate conduction (in kW).
const q4 = { k: kSteel, area: 0.60, l: 0.035, tHot: 85, tCold: 45 };
const dT4 = q4.tHot - q4.tCold;
const p4kW = ((q4.k * q4.area * dT4) / q4.l) / 1000;
const p4ForgotL = (q4.k * q4.area * dT4) / 1000;
const p4NoArea = ((q4.k * dT4) / q4.l) / 1000;
const p4UsedHotT = ((q4.k * q4.area * q4.tHot) / q4.l) / 1000;

// Question 6: verify interface temperature shift when reversing equal-thickness brick and cork layers.
const lEqual6 = 0.10;
const rBrickEq6 = lEqual6 / kBrick;
const rCorkEq6 = lEqual6 / kCork;
const rTotEq6 = rBrickEq6 + rCorkEq6;
const tMidCorkCold = fig.tHot - dTFig * (rBrickEq6 / rTotEq6);
const tMidCorkHot = fig.tHot - dTFig * (rCorkEq6 / rTotEq6);
if (!(rCorkEq6 > rBrickEq6 && tMidCorkHot < tMidCorkCold)) {
  throw new Error('question 6 interface temperature check failed');
}

// Question 7: interface temperature in a plasterboard-and-cork partition wall.
const q7 = { lPlaster: 0.080, lCork: 0.063, tHot: 26, tCold: 6 };
const r1_7 = q7.lPlaster / kPlaster;
const r2_7 = q7.lCork / kCork;
const rTot7 = r1_7 + r2_7;
const dT7 = q7.tHot - q7.tCold;
const drop1_7 = dT7 * (r1_7 / rTot7);
const tMid7 = q7.tHot - drop1_7;
const tSwapShares7 = q7.tHot - dT7 * (r2_7 / rTot7);
const tHalfway7 = (q7.tHot + q7.tCold) / 2;

// ---------- Figure 1 SVG ----------
const figure1 = `<svg viewBox="0 0 460 245" role="img" aria-labelledby="p39-fig1-alt">
  <rect class="part" x="120" y="36" width="130" height="144"/>
  <rect class="part" x="250" y="36" width="56" height="144"/>
  <line class="curve" x1="42" y1="108" x2="108" y2="108"/>
  <polygon class="dot" points="116,108 104,102 104,114"/>
  <line class="curve" x1="316" y1="108" x2="382" y2="108"/>
  <polygon class="dot" points="390,108 378,102 378,114"/>
  <text class="title" x="185" y="96" text-anchor="middle">Concrete brick</text>
  <text x="185" y="122" text-anchor="middle">Area ${fixed(fig.area, 1)} m²</text>
  <text class="title" x="278" y="24" text-anchor="middle">Cork</text>
  <text class="big" x="64" y="78" text-anchor="middle">${fig.tHot} °C</text>
  <text x="64" y="142" text-anchor="middle">Heat flow P</text>
  <text class="big" x="398" y="78" text-anchor="middle">−${Math.abs(fig.tCold)} °C</text>
  <line x1="120" y1="194" x2="120" y2="208"/><line x1="250" y1="194" x2="250" y2="208"/><line x1="306" y1="194" x2="306" y2="208"/>
  <line x1="120" y1="201" x2="306" y2="201"/>
  <text class="prob" x="185" y="226" text-anchor="middle">${fixed(fig.lBrick, 2)} m</text>
  <text class="prob" x="292" y="226" text-anchor="start">${fixed(fig.lCork, 3)} m</text>
</svg>`;

const mFmt = (v) => `${fixed(v, 2)} m`;
const wFmt = (v) => `${whole(v)} W`;
const kwFmt = (v) => `${fixed(v, 2)} kW`;
const degCFmt = (v) => `${fixed(v, 1)} °C`;

export default {
  id: 'p39',
  set: 'mock',
  mock: 4,
  area: 'engineering',
  title: 'Steady-State Heat Conduction Through Walls',
  facts: [
    { claim: 'By Fourier’s law of steady one-dimensional heat conduction through a flat slab of area A and thickness L, the rate of heat transfer in watts is P = k A (T_hot − T_cold) ÷ L, where k is thermal conductivity in W/(m·K) or W/(m·°C).', source: 'https://openstax.org/books/university-physics-volume-2/pages/1-6-mechanisms-of-heat-transfer', read: '2026-11-18' },
    { claim: 'Thermal conductivities from OpenStax Table 14.3: stainless steel 14 W/(m·K), concrete brick 0.84 W/(m·K), plasterboard 0.16 W/(m·K), cork 0.042 W/(m·K).', source: 'https://openstax.org/books/college-physics-2e/pages/14-5-conduction', read: '2026-11-18' },
    { claim: 'The unit-area thermal resistance (R factor in SI units (m²·K)/W) of a slab is R = L ÷ k, so P = A ΔT ÷ R; larger R gives better insulation.', source: 'https://openstax.org/books/college-physics-2e/pages/14-5-conduction', read: '2026-11-18' },
    { claim: 'For plane layers in series in steady state with equal cross-sectional area and negligible contact resistance, the heat-transfer rate P is identical through every layer, unit-area thermal resistances add (R_total = R₁ + R₂ + …), and each layer’s temperature drop is proportional to its thermal resistance.', source: 'https://en.wikipedia.org/wiki/Thermal_conduction', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'When one face of a flat wall is kept at a warm temperature T_hot and the opposite face at a cooler temperature T_cold, thermal energy conducts through the solid from the warm face to the cool face.',
      'Once temperatures at every depth stop changing with time, conduction is in steady state: thermal energy enters the warm face and leaves the cool face at the same constant rate P, measured in watts (1 W = 1 joule per second; 1 kW = 1,000 W).',
    ),
    p(
      'For one-dimensional steady conduction across a uniform slab of face area A (in m²) and thickness L (in m), Fourier’s law gives:',
    ),
    { type: 'formula', text: 'P = (k × A × (T_hot − T_cold)) ÷ L' },
    p(
      'Here k is the material’s thermal conductivity, in W/(m·K).',
      'Because a temperature difference of 1 °C equals 1 K, T_hot − T_cold gives the same number in °C and in K.',
      'Table 1 gives k for four building and engineering materials; metals conduct readily, whereas porous materials such as cork have tiny values of k and act as insulators.',
    ),
    {
      type: 'table',
      caption: 'Table 1. Thermal conductivity k, in W/(m·K).',
      head: ['Material', 'Thermal conductivity k in W/(m·K)'],
      rows: tableRows,
    },
    p(
      'To analyse insulated walls, engineers define a layer’s unit-area thermal resistance R, measured in (m²·K)/W:',
    ),
    { type: 'formula', text: 'R = L ÷ k   so that   P = (A × (T_hot − T_cold)) ÷ R' },
    p(
      'When flat layers of equal area A sit side by side in series (with negligible resistance at the joint), steady state requires the exact same heat-transfer rate P to pass through every layer, while their temperature drops add up to T_hot − T_cold.',
      'Consequently, their unit-area thermal resistances add:',
    ),
    { type: 'formula', text: 'R_total = R₁ + R₂ + … = (L₁ ÷ k₁) + (L₂ ÷ k₂) + …' },
    p(
      'Because ΔT_i = (P ÷ A) × R_i across layer i, each layer takes a share of the total temperature drop proportional to its own R_i.',
      'Figure 1 shows a two-layer exterior wall.',
    ),
    {
      type: 'figure',
      id: 'p39-fig1',
      caption: `Figure 1. Steady-state conduction through a ${fixed(fig.area, 1)} m² wall of concrete brick and cork.`,
      alt: `A two-layer wall of area ${fixed(fig.area, 1)} m². Left indoor face at ${fig.tHot} °C, concrete brick layer ${fixed(fig.lBrick, 2)} m thick, joined in series to a cork layer ${fixed(fig.lCork, 3)} m thick, right outdoor face at −${Math.abs(fig.tCold)} °C, with steady heat flow P from left to right.`,
      svg: figure1,
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, which quantity is equal across every layer of a flat multi-layer wall in one-dimensional steady-state conduction?',
      options: [
        { text: 'The temperature drop ΔT across each layer.', why: 'Each layer’s temperature drop is proportional to its own thermal resistance R_i, so high-R layers drop more temperature.' },
        { text: 'The unit-area thermal resistance R of each layer.', why: 'Each layer has its own R = L ÷ k determined by its thickness and conductivity.' },
        { text: 'The rate of heat transfer P passing through each layer.', correct: true, why: 'In steady state no energy builds up inside the wall, so every watt entering Layer 1 passes on through Layer 2.' },
        { text: 'The thermal conductivity k of each layer.', why: 'Composite walls combine materials of very different conductivities, such as brick and cork.' },
      ],
      explanation: 'In steady state, temperatures inside the wall do not change with time, so thermal energy cannot accumulate at the boundary between layers; the same heat-transfer rate P (in W) flows through every layer.',
    },
    {
      type: 'F', level: 1,
      stem: `Using Table 1, what thickness of concrete brick has the same unit-area thermal resistance R as a ${fixed(lPlaster2, 3)} m layer of plasterboard?`,
      options: numericOptions(
        { value: lBrick2, why: `Plasterboard has R = ${fixed(lPlaster2, 3)} ÷ ${fixed(kPlaster, 2)} = ${fixed(rTarget2, 2)} (m²·K)/W, requiring L_brick = ${fixed(rTarget2, 2)} × ${fixed(kBrick, 2)} = ${mFmt(lBrick2)}.` },
        [
          { value: lBrickInverted2, why: `This multiplies ${fixed(lPlaster2, 3)} m by ${fixed(kPlaster, 2)} ÷ ${fixed(kBrick, 2)}, inverting the conductivity ratio.` },
          { value: rTarget2, why: `This is the unit-area thermal resistance R = ${fixed(rTarget2, 2)} (m²·K)/W itself, before multiplying by k_brick = ${fixed(kBrick, 2)}.` },
          { value: lSteelWrongRow2, why: `This multiplies R = ${fixed(rTarget2, 2)} by ${kSteel} (stainless steel) instead of ${fixed(kBrick, 2)} (concrete brick).` },
        ],
        mFmt,
      ),
      explanation: `Setting L_brick ÷ k_brick = L_plaster ÷ k_plaster gives L_brick = (${fixed(lPlaster2, 3)} ÷ ${fixed(kPlaster, 2)}) × ${fixed(kBrick, 2)} = ${fixed(rTarget2, 2)} × ${fixed(kBrick, 2)} = ${mFmt(lBrick2)}. Better conductors need proportionally greater thickness for the same insulation.`,
    },
    {
      type: 'A', level: 2,
      stem: `Using Figure 1 and Table 1, what is the steady-state rate of heat transfer P through the ${fixed(fig.area, 1)} m² wall?`,
      options: numericOptions(
        { value: pFigWatts, why: `R₁ = ${fixed(fig.lBrick, 2)} ÷ ${fixed(kBrick, 2)} = ${fixed(rBrickFig, 2)}, R₂ = ${fixed(fig.lCork, 3)} ÷ ${fixed(kCork, 3)} = ${fixed(rCorkFig, 2)}, ΔT = 22 − (−3) = ${dTFig} K, so P = (${fixed(fig.area, 1)} × ${dTFig}) ÷ ${fixed(rTotalFig, 2)} = ${wFmt(pFigWatts)}.` },
        [
          { value: pFluxOnly3, why: `This computes ΔT ÷ R_total = ${dTFig} ÷ ${fixed(rTotalFig, 2)} = ${pFluxOnly3} W/m² and omits multiplying by the ${fixed(fig.area, 1)} m² area.` },
          { value: pSignSlip3, why: `This uses 22 − 3 = 19 K instead of 22 − (−3) = ${dTFig} K, dropping the minus sign on −3 °C.` },
          { value: pNoCork3, why: `This divides by the brick resistance R₁ = ${fixed(rBrickFig, 2)} alone and leaves out the cork insulation.` },
        ],
        wFmt,
      ),
      explanation: `From Table 1, R_brick = ${fixed(fig.lBrick, 2)} ÷ ${fixed(kBrick, 2)} = ${fixed(rBrickFig, 2)} (m²·K)/W and R_cork = ${fixed(fig.lCork, 3)} ÷ ${fixed(kCork, 3)} = ${fixed(rCorkFig, 2)} (m²·K)/W, giving R_total = ${fixed(rTotalFig, 2)} (m²·K)/W. Across T_hot − T_cold = 22 − (−3) = ${dTFig} K and area ${fixed(fig.area, 1)} m², P = (${fixed(fig.area, 1)} × ${dTFig}) ÷ ${fixed(rTotalFig, 2)} = ${wFmt(pFigWatts)}.`,
    },
    {
      type: 'A', level: 2,
      stem: `A flat stainless-steel plate of face area ${fixed(q4.area, 2)} m² and thickness ${fixed(q4.l, 3)} m separates water kept at ${q4.tHot} °C on one face from water kept at ${q4.tCold} °C on the other face. Using Table 1, what is the steady-state rate of heat conduction through the plate, in kW?`,
      options: numericOptions(
        { value: p4kW, why: `P = (${q4.k} × ${fixed(q4.area, 2)} × (${q4.tHot} − ${q4.tCold})) ÷ ${fixed(q4.l, 3)} = ${whole(p4kW * 1000)} W = ${kwFmt(p4kW)}.` },
        [
          { value: p4ForgotL, why: `This calculates ${q4.k} × ${fixed(q4.area, 2)} × ${dT4} ÷ 1,000 without dividing by the ${fixed(q4.l, 3)} m thickness.` },
          { value: p4NoArea, why: `This omits multiplying by the ${fixed(q4.area, 2)} m² face area.` },
          { value: p4UsedHotT, why: `This multiplies by ${q4.tHot} °C instead of the temperature difference ${q4.tHot} − ${q4.tCold} = ${dT4} K.` },
        ],
        kwFmt,
      ),
      explanation: `With k = ${q4.k} W/(m·K) and ΔT = ${q4.tHot} − ${q4.tCold} = ${dT4} K, Fourier’s law gives P = (${q4.k} × ${fixed(q4.area, 2)} × ${dT4}) ÷ ${fixed(q4.l, 3)} = 336 ÷ ${fixed(q4.l, 3)} = ${whole(p4kW * 1000)} W = ${kwFmt(p4kW)}.`,
    },
    {
      type: 'D', level: 2,
      stem: 'A single-layer insulating panel of thickness L and face area A has unit-area thermal resistance R and steady heat-transfer rate P under a fixed temperature difference ΔT. A second panel of the same material under the same ΔT has thickness 2L and face area 3A. What are its unit-area thermal resistance and heat-transfer rate?',
      options: [
        { text: 'Unit-area thermal resistance is 2/3 × R, and heat-transfer rate is 3/2 × P.', why: 'P is 3/2 × P, whereas unit-area thermal resistance R = L ÷ k does not depend on A and doubles to 2R.' },
        { text: 'Unit-area thermal resistance is 2R, and heat-transfer rate is 2/3 × P.', why: 'R doubles to 2R, and P = (A × ΔT) ÷ R changes by 3 ÷ 2 = 3/2 rather than 2 ÷ 3.' },
        { text: 'Unit-area thermal resistance is 6R, and heat-transfer rate is 1/6 × P.', why: 'Tripling area A increases P rather than increasing unit-area thermal resistance R.' },
        { text: 'Unit-area thermal resistance is 2R, and heat-transfer rate is 3/2 × P.', correct: true, why: 'R = L ÷ k doubles when L becomes 2L, and P = (A × ΔT) ÷ R changes by 3A ÷ (2R) = 3/2 × P.' },
      ],
      explanation: 'Unit-area thermal resistance is R = L ÷ k, which depends on L and k alone, so doubling L gives 2R. Substituting 3A and 2R into P = (A × ΔT) ÷ R multiplies P by 3 ÷ 2.',
    },
    {
      type: 'S', level: 3,
      stem: 'A two-layer wall made of equal-thickness layers of concrete brick and cork (Table 1) has the brick on the warm indoor side (held at T_hot) and the cork on the cold outdoor side (held at T_cold). If the two layers are swapped so the cork sits on the warm indoor side and the brick on the cold outdoor side, with T_hot and T_cold unchanged, what happens in steady state to the heat-transfer rate P and to the interface temperature T_mid between the two layers?',
      options: [
        { text: 'P stays the same, and T_mid falls closer to T_cold.', correct: true, why: 'At equal thickness, k_cork < k_brick gives R_cork > R_brick; R_brick + R_cork is unchanged so P stays the same, while placing cork on the hot side drops most of ΔT before the interface.' },
        { text: 'P stays the same, and T_mid stays the same.', why: 'P stays the same, but at equal thickness cork has twenty times the thermal resistance of brick (0.84 ÷ 0.042), so swapping them shifts T_mid strongly.' },
        { text: 'P decreases, and T_mid falls closer to T_cold.', why: 'T_mid does fall closer to T_cold, yet R_total = R₁ + R₂ does not depend on layer order, so P is unchanged.' },
        { text: 'P increases, and T_mid rises closer to T_hot.', why: 'Swapping series resistances leaves R_total and P unchanged, and putting higher-resistance cork next to T_hot lowers T_mid rather than raising it.' },
      ],
      explanation: 'Series resistances add in either order (R_brick + R_cork = R_cork + R_brick), so R_total and P = (A × ΔT) ÷ R_total stay the same. At equal thickness L, Table 1 gives R_cork = L ÷ 0.042, which is twenty times R_brick = L ÷ 0.84; moving cork to the warm indoor side puts twenty-twenty-firsts of the temperature drop ahead of the joint, pulling T_mid down close to T_cold.',
    },
    {
      type: 'T', level: 3,
      stem: `An interior wall joins a ${fixed(q7.lPlaster, 3)} m layer of plasterboard on the warm side (face held at ${q7.tHot} °C) directly to a ${fixed(q7.lCork, 3)} m layer of cork on the cool side (outer face held at ${q7.tCold} °C). Using Table 1, what is the steady-state temperature at the interface between the plasterboard and the cork?`,
      options: numericOptions(
        { value: tMid7, why: `R₁ = ${fixed(q7.lPlaster, 3)} ÷ ${fixed(kPlaster, 2)} = ${fixed(r1_7, 2)}, R₂ = ${fixed(q7.lCork, 3)} ÷ ${fixed(kCork, 3)} = ${fixed(r2_7, 2)}; plasterboard drops (${fixed(r1_7, 2)} ÷ ${fixed(rTot7, 2)}) × ${dT7} = ${fixed(drop1_7, 1)} K from ${q7.tHot} °C to ${degCFmt(tMid7)}.` },
        [
          { value: drop1_7, why: `This is the ${fixed(drop1_7, 1)} K temperature drop across the plasterboard, before subtracting it from ${q7.tHot} °C.` },
          { value: tSwapShares7, why: `This subtracts the cork’s 15.0 K temperature drop from ${q7.tHot} °C instead of the plasterboard’s ${fixed(drop1_7, 1)} K drop.` },
          { value: tHalfway7, why: `This takes the unweighted midpoint (${q7.tHot} + ${q7.tCold}) ÷ 2, ignoring that cork has three times the thermal resistance of the plasterboard.` },
        ],
        degCFmt,
      ),
      explanation: `Find each unit-area thermal resistance: R_plaster = ${fixed(q7.lPlaster, 3)} ÷ ${fixed(kPlaster, 2)} = ${fixed(r1_7, 2)} (m²·K)/W and R_cork = ${fixed(q7.lCork, 3)} ÷ ${fixed(kCork, 3)} = ${fixed(r2_7, 2)} (m²·K)/W, so R_total = ${fixed(rTot7, 2)} (m²·K)/W. Of the total drop ${q7.tHot} − ${q7.tCold} = ${dT7} K, the plasterboard on the warm side drops (${fixed(r1_7, 2)} ÷ ${fixed(rTot7, 2)}) × ${dT7} = ${fixed(drop1_7, 1)} K, putting the interface at ${q7.tHot} − ${fixed(drop1_7, 1)} = ${degCFmt(tMid7)}.`,
    },
  ],
};
