// Full mock 2, passage 4. Area: engineering. Subject: axial stress, strain, Hooke's law and Young's modulus.
import { fixed, graph, numericOptions, p, whole } from '../lib.mjs';

// ---------- Figure 1: linear elastic stress–strain lines (OpenStax University Physics Vol 1, Table 12.1) ----------
const eSteelGPa = 200; // GPa
const eAluminiumGPa = 70; // GPa
const maxStrain = 0.002;
const steelEndStrain = 0.0015;
const stressMPa = (eGPa, strain) => eGPa * 1000 * strain;

const steelEndStress = stressMPa(eSteelGPa, steelEndStrain); // 300 MPa
const alEndStress = stressMPa(eAluminiumGPa, maxStrain); // 140 MPa
if (steelEndStress !== 300 || alEndStress !== 140) {
  throw new Error('Figure 1 endpoints must sit on exact 20 MPa grid lines');
}

// Question 2: reading Young's modulus of aluminium from Figure 1.
const q2Right = alEndStress / (maxStrain * 1000); // GPa
const q2DecimalSlip = q2Right / 10;
const q2ReadStressOnly = alEndStress;
const q2ReadSteel = steelEndStress / (steelEndStrain * 1000);

// Question 3: axial stress in a tie rod.
const q3 = { forceKN: 45, areaMm2: 250 };
const sigma3MPa = (q3.forceKN * 1000) / q3.areaMm2;
const sigma3ForgotKilo = q3.forceKN / q3.areaMm2;
const sigma3TenSlip = sigma3MPa / 10;
const sigma3Multiply = q3.forceKN * q3.areaMm2;
if ([sigma3MPa, sigma3ForgotKilo, sigma3TenSlip, sigma3Multiply].some((v) => [q3.forceKN, q3.areaMm2].includes(v))) {
  throw new Error('question 3 options must not repeat stem inputs');
}

// Question 4: elongation of a copper wire (OpenStax Table 12.1: copper E = 110 GPa).
const q4 = { lengthM: 2.2, areaMm2: 4.0, forceN: 880, eGPa: 110 };
const sigma4MPa = q4.forceN / q4.areaMm2;
const strain4 = sigma4MPa / (q4.eGPa * 1000);
const ext4Mm = strain4 * (q4.lengthM * 1000);
const ext4OneMetre = strain4 * 1000;
const ext4NoArea = (q4.forceN / (q4.eGPa * 1000)) * (q4.lengthM * 1000);
const ext4MultArea = ((q4.forceN * q4.areaMm2) / (q4.eGPa * 1000)) * (q4.lengthM * 1000);

// Question 5: Rod Y has 2× length and 2× radius (4× area) of Rod X.
const ratioLength5 = 2;
const ratioRadius5 = 2;
const ratioArea5 = ratioRadius5 ** 2;
const ratioExt5 = ratioLength5 / ratioArea5;
if (ratioExt5 !== 0.5) throw new Error('question 5 expects extension to halve');

// Question 7: two-segment stepped brass rod in series (OpenStax Table 12.1: brass E = 90 GPa).
const q7 = { forceKN: 18, eGPa: 90, l1M: 0.9, a1Mm2: 100, l2M: 0.6, a2Mm2: 200 };
const extMm = (forceN, lenM, areaMm2, eGPa) => ((forceN / areaMm2) / (eGPa * 1000)) * (lenM * 1000);
const force7N = q7.forceKN * 1000;
const totalLen7M = q7.l1M + q7.l2M;
const ext7Seg1 = extMm(force7N, q7.l1M, q7.a1Mm2, q7.eGPa);
const ext7Seg2 = extMm(force7N, q7.l2M, q7.a2Mm2, q7.eGPa);
const ext7Total = ext7Seg1 + ext7Seg2;
const ext7SumAreas = extMm(force7N, totalLen7M, q7.a1Mm2 + q7.a2Mm2, q7.eGPa);
const ext7HalfForce = ext7Total / 2;
const ext7AvgArea = extMm(force7N, totalLen7M, (q7.a1Mm2 + q7.a2Mm2) / 2, q7.eGPa);

const gpa = (v) => `${whole(v)} GPa`;
const mpa = (v) => `${v < 1 ? fixed(v, 2) : whole(v)} MPa`;
const mm1 = (v) => `${fixed(v, 1)} mm`;
const mm2 = (v) => `${fixed(v, 2)} mm`;

const figure1 = graph({
  id: 'p21-fig1',
  w: 480,
  h: 310,
  left: 64,
  right: 28,
  x: {
    min: 0,
    max: maxStrain,
    grid: 0.0005,
    label: 0.0005,
    title: 'Axial strain ε',
    format: (v) => (v === 0 ? '0' : fixed(v, 4)),
  },
  y: {
    min: 0,
    max: 320,
    grid: 20,
    label: 40,
    title: 'Axial stress σ in MPa',
    format: whole,
  },
  body: ({ px, py }) => `
  <line class="curve" x1="${px(0)}" y1="${py(0)}" x2="${px(steelEndStrain)}" y2="${py(steelEndStress)}"/>
  <line class="curve curve-2" x1="${px(0)}" y1="${py(0)}" x2="${px(maxStrain)}" y2="${py(alEndStress)}"/>
  <text class="label-1" x="${px(steelEndStrain) + 6}" y="${py(steelEndStress) + 5}">Steel</text>
  <text class="label-2" x="${px(maxStrain) - 6}" y="${py(alEndStress) - 10}" text-anchor="end">Aluminium</text>`,
});

export default {
  id: 'p21',
  set: 'mock',
  mock: 2,
  area: 'engineering',
  title: 'Axial Stress, Strain and Young’s Modulus',
  facts: [
    { claim: 'Tensile or compressive axial stress is σ = F ÷ A, the perpendicular force per unit cross-sectional area, with SI unit pascal (1 Pa = 1 N/m², and 1 MPa = 10⁶ Pa = 1 N/mm²).', source: 'https://openstax.org/books/university-physics-volume-1/pages/12-3-stress-strain-and-elastic-modulus', read: '2026-11-18' },
    { claim: 'Axial strain is ε = ΔL ÷ L₀, the fractional change in length relative to the original length L₀, and is dimensionless.', source: 'https://openstax.org/books/university-physics-volume-1/pages/12-3-stress-strain-and-elastic-modulus', read: '2026-11-18' },
    { claim: 'Within the linear elastic region (Hooke’s law), stress is proportional to strain: σ = E × ε, where Young’s modulus E = (F × L₀) ÷ (A × ΔL) is a property of the material; beyond the elastic limit permanent deformation remains.', source: 'https://openstax.org/books/college-physics-2e/pages/5-3-elasticity-stress-and-strain', read: '2026-11-18' },
    { claim: 'Approximate Young’s moduli in OpenStax Table 12.1: steel 200 GPa (20.0 × 10¹⁰ Pa), copper 110 GPa (11.0 × 10¹⁰ Pa), brass 90 GPa (9.0 × 10¹⁰ Pa), aluminium 70 GPa (7.0 × 10¹⁰ Pa).', source: 'https://openstax.org/books/university-physics-volume-1/pages/12-3-stress-strain-and-elastic-modulus', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'How much a structural bar stretches under a pull depends on the force, on the bar’s length and thickness, and on the material.',
      'To separate geometry from material properties, engineers work with axial stress and axial strain instead of force and extension alone.',
    ),
    p(
      'When equal and opposite forces of magnitude F pull outward along the axis of a straight bar (tension) or push inward (compression), at right angles to its cross-sectional area A, the axial stress σ is the force per unit area:',
    ),
    { type: 'formula', text: 'σ = F ÷ A' },
    p(
      'With F in newtons (N) and A in square metres (m²), stress is measured in pascals (Pa), where 1 Pa = 1 N/m².',
      'One megapascal (MPa) is 10⁶ Pa; because 1 m² = 10⁶ square millimetres (mm²), 1 MPa is also 1 N/mm².',
      'For a solid circular rod of radius r, the cross-sectional area is A = π × r², so doubling the radius multiplies A by four.',
      'If a bar of unloaded length L₀ changes length by ΔL, its axial strain ε is the fractional change in length:',
    ),
    { type: 'formula', text: 'ε = ΔL ÷ L₀' },
    p(
      'Because ΔL and L₀ carry the same length unit, those units cancel and ε has no unit.',
      'At moderate loads a material behaves elastically: it returns to L₀ when unloaded, and up to its proportional limit axial stress is proportional to axial strain (Hooke’s law, σ = E × ε).',
      'Beyond the elastic limit, unloading leaves permanent deformation.',
      'The constant E is Young’s modulus, measured in pascals or gigapascals (1 GPa = 10⁹ Pa = 1,000 MPa):',
    ),
    { type: 'formula', text: 'E = σ ÷ ε = (F × L₀) ÷ (A × ΔL)' },
    p(
      'Young’s modulus belongs to the material itself, not to the size or shape of the bar.',
      'Figure 1 plots σ against ε in the linear elastic region for steel and aluminium; the slope of each line is E.',
    ),
    {
      type: 'figure',
      id: 'p21-fig1',
      caption: 'Figure 1. Axial stress against axial strain in the linear elastic region for steel and aluminium.',
      alt: `A graph with axial strain ε from 0 to ${fixed(maxStrain, 4)} on the horizontal axis (grid every 0.0005) and axial stress σ from 0 to 320 MPa on the vertical axis (grid every 20 MPa, labelled every 40 MPa). Steel is a straight line from 0 MPa at 0 strain through 200 MPa at 0.0010 strain to ${steelEndStress} MPa at ${fixed(steelEndStrain, 4)} strain. Aluminium is a straight line from 0 MPa at 0 strain to ${alEndStress} MPa at ${fixed(maxStrain, 4)} strain.`,
      svg: figure1,
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, why has axial strain ε no unit?',
      options: [
        { text: 'Because the force F and the cross-sectional area A cancel out.', why: 'Dividing force by area defines stress σ in pascals (N/m²), which does carry a unit.' },
        { text: 'Because strain is defined only while the extension ΔL is zero.', why: 'When ΔL is non-zero under load, ε = ΔL ÷ L₀ is non-zero and remains dimensionless.' },
        { text: 'Because it divides a change in length ΔL by an original length L₀, so the length units cancel.', correct: true, why: 'Dividing two lengths expressed in the same unit leaves a pure number, as stated below the second formula.' },
        { text: 'Because Young’s modulus E and axial stress σ have different units.', why: 'Since ε is dimensionless, E = σ ÷ ε carries the same pressure unit (Pa) as stress.' },
      ],
      explanation: 'Axial strain is ε = ΔL ÷ L₀. Because both numerator and denominator are lengths measured in the same unit, the units cancel out.',
    },
    {
      type: 'F', level: 1,
      stem: 'According to Figure 1, what is Young’s modulus E of aluminium, in GPa?',
      options: numericOptions(
        { value: q2Right, why: `At ε = ${fixed(maxStrain, 4)} the aluminium line reaches ${alEndStress} MPa: ${alEndStress} ÷ ${fixed(maxStrain, 4)} = ${whole(q2Right * 1000)} MPa = ${gpa(q2Right)}.` },
        [
          { value: q2DecimalSlip, why: `This divides ${alEndStress} MPa by 0.020 instead of ${fixed(maxStrain, 4)}, losing a factor of 10.` },
          { value: q2ReadStressOnly, why: `${alEndStress} is the stress in MPa at ε = ${fixed(maxStrain, 4)}, not the slope σ ÷ ε in GPa.` },
          { value: q2ReadSteel, why: `This is the slope of the steel line (${steelEndStress} MPa ÷ ${fixed(steelEndStrain, 4)} = ${gpa(q2ReadSteel)}), not aluminium.` },
        ],
        gpa,
      ),
      explanation: `On Figure 1, the aluminium line passes from (0, 0) to ε = ${fixed(maxStrain, 4)} and σ = ${alEndStress} MPa (one 20 MPa grid step above 120 MPa). Thus E = ${alEndStress} MPa ÷ ${fixed(maxStrain, 4)} = ${whole(q2Right * 1000)} MPa = ${gpa(q2Right)}.`,
    },
    {
      type: 'A', level: 2,
      stem: `A straight tie rod with cross-sectional area ${q3.areaMm2} mm² carries an axial tensile force of ${q3.forceKN} kN (1 kN = 1,000 N). What is the axial stress in the rod?`,
      options: numericOptions(
        { value: sigma3MPa, why: `${whole(q3.forceKN * 1000)} N ÷ ${q3.areaMm2} mm² = ${sigma3MPa} N/mm² = ${mpa(sigma3MPa)}.` },
        [
          { value: sigma3ForgotKilo, why: `This divides ${q3.forceKN} by ${q3.areaMm2} without converting ${q3.forceKN} kN into ${whole(q3.forceKN * 1000)} N.` },
          { value: sigma3TenSlip, why: `This drops a factor of 10 when dividing ${whole(q3.forceKN * 1000)} N by ${q3.areaMm2} mm².` },
          { value: sigma3Multiply, why: `This multiplies ${q3.forceKN} by ${q3.areaMm2} instead of dividing force by area.` },
        ],
        mpa,
      ),
      explanation: `Convert the force to newtons: ${q3.forceKN} kN = ${whole(q3.forceKN * 1000)} N. Since 1 N/mm² = 1 MPa, σ = F ÷ A = ${whole(q3.forceKN * 1000)} ÷ ${q3.areaMm2} = ${mpa(sigma3MPa)}.`,
    },
    {
      type: 'A', level: 2,
      stem: `A copper wire of unloaded length ${fixed(q4.lengthM, 1)} m and cross-sectional area ${fixed(q4.areaMm2, 1)} mm² is pulled by an axial force of ${q4.forceN} N within its linear elastic region. Copper has Young’s modulus E = ${q4.eGPa} GPa. By how many millimetres does the wire stretch?`,
      options: numericOptions(
        { value: ext4Mm, why: `σ = ${q4.forceN} ÷ ${fixed(q4.areaMm2, 1)} = ${sigma4MPa} MPa, ε = ${sigma4MPa} ÷ ${whole(q4.eGPa * 1000)} = ${strain4}, and ΔL = ${strain4} × ${whole(q4.lengthM * 1000)} mm = ${mm1(ext4Mm)}.` },
        [
          { value: ext4OneMetre, why: `This multiplies the strain ${strain4} by 1,000 mm as if L₀ were 1.0 m, omitting the ${fixed(q4.lengthM, 1)} m length.` },
          { value: ext4NoArea, why: `This omits dividing the ${q4.forceN} N force by the ${fixed(q4.areaMm2, 1)} mm² cross-sectional area.` },
          { value: ext4MultArea, why: `This multiplies by the ${fixed(q4.areaMm2, 1)} mm² cross-sectional area instead of dividing by it.` },
        ],
        mm1,
      ),
      explanation: `First find the stress: σ = ${q4.forceN} N ÷ ${fixed(q4.areaMm2, 1)} mm² = ${sigma4MPa} N/mm² = ${sigma4MPa} MPa. With E = ${q4.eGPa} GPa = ${whole(q4.eGPa * 1000)} MPa, strain is ε = ${sigma4MPa} ÷ ${whole(q4.eGPa * 1000)} = ${strain4}. Over L₀ = ${fixed(q4.lengthM, 1)} m = ${whole(q4.lengthM * 1000)} mm, ΔL = ${strain4} × ${whole(q4.lengthM * 1000)} = ${mm1(ext4Mm)}.`,
    },
    {
      type: 'D', level: 2,
      stem: 'Solid circular rods X and Y are made of the same steel and stay within the linear elastic region under the same axial pulling force F. Rod Y has twice the unloaded length of Rod X and twice the radius of Rod X. How do Young’s modulus E and the extension ΔL of Rod Y compare with those of Rod X?',
      options: [
        { text: 'E is twice as large, and ΔL is half as large.', why: 'ΔL is half as large, but Young’s modulus E is a property of steel and does not change with bar size.' },
        { text: 'E is the same, and ΔL is the same.', why: 'Doubling the radius multiplies A = π × r² by four rather than two, so the length and area changes do not cancel.' },
        { text: 'E is the same, and ΔL is twice as large.', why: 'Rearranging E = (F × L₀) ÷ (A × ΔL) gives ΔL = (F × L₀) ÷ (E × A), so 2 × L₀ divided by 4 × A gives 1/2, not 2.' },
        { text: 'E is the same, and ΔL is half as large.', correct: true, why: 'Same steel means identical E; L₀ doubles while A = π × r² quadruples, multiplying ΔL = (F × L₀) ÷ (E × A) by 2 ÷ 4 = 1/2.' },
      ],
      explanation: 'Young’s modulus E depends only on the material, so both steel rods have the same E. From ΔL = (F × L₀) ÷ (E × A), doubling L₀ multiplies ΔL by 2 while doubling r multiplies A = π × r² by 4, giving 2 ÷ 4 = 1/2.',
    },
    {
      type: 'S', level: 3,
      stem: 'A steel bar and an aluminium bar have the same unloaded length L₀ and the same cross-sectional area A, and both remain within the linear elastic region shown in Figure 1. Which statement is correct?',
      options: [
        { text: 'When stretched by the same extension ΔL, both bars have the same strain, and the steel bar carries the larger axial force.', correct: true, why: 'Equal ΔL and L₀ give equal strain ε = ΔL ÷ L₀; at any strain in Figure 1, steel has higher stress σ = E × ε and thus larger F = σ × A.' },
        { text: 'When pulled by the same axial force F, the steel bar experiences a larger axial stress than the aluminium bar.', why: 'Axial stress is σ = F ÷ A, which depends only on F and A, so equal F and equal A produce identical stress in both bars.' },
        { text: 'When pulled by the same axial force F, the steel bar stretches more than the aluminium bar because its line in Figure 1 is steeper.', why: 'A steeper slope means larger E, so at the same stress σ the steel bar has smaller strain ε = σ ÷ E and stretches less.' },
        { text: 'To reach the same axial stress, the aluminium bar requires a smaller axial force than the steel bar.', why: 'Because both bars have the same cross-sectional area A, reaching the same stress σ = F ÷ A requires the same force F.' },
      ],
      explanation: 'With equal L₀, equal extensions ΔL mean equal strains ε = ΔL ÷ L₀. In Figure 1 the steel line lies above the aluminium line at every non-zero strain, so steel develops a higher stress σ and, with equal area A, requires a larger force F = σ × A.',
    },
    {
      type: 'T', level: 3,
      stem: `A stepped brass bar consists of two straight segments joined end to end: Segment 1 has length ${fixed(q7.l1M, 2)} m and cross-sectional area ${q7.a1Mm2} mm², and Segment 2 has length ${fixed(q7.l2M, 2)} m and cross-sectional area ${q7.a2Mm2} mm². Brass has E = ${q7.eGPa} GPa. When the bar is pulled within its elastic region, each segment carries the full ${q7.forceKN} kN (18,000 N) axial force. What is the total extension of the bar?`,
      options: numericOptions(
        { value: ext7Total, why: `Segment 1 stretches ${mm2(ext7Seg1)} and Segment 2 stretches ${mm2(ext7Seg2)}, giving ${mm2(ext7Seg1)} + ${mm2(ext7Seg2)} = ${mm2(ext7Total)}.` },
        [
          { value: ext7SumAreas, why: `This adds the two areas (${q7.a1Mm2} + ${q7.a2Mm2} = ${q7.a1Mm2 + q7.a2Mm2} mm²) across the combined ${fixed(totalLen7M, 2)} m length.` },
          { value: ext7HalfForce, why: `This assigns half the load (${q7.forceKN / 2} kN) to each segment instead of the full ${q7.forceKN} kN.` },
          { value: ext7AvgArea, why: `This uses the unweighted average area (${(q7.a1Mm2 + q7.a2Mm2) / 2} mm²) across the combined ${fixed(totalLen7M, 2)} m length.` },
        ],
        mm2,
      ),
      explanation: `Work out each segment separately with E = ${q7.eGPa} GPa = ${whole(q7.eGPa * 1000)} N/mm². Segment 1: σ₁ = ${whole(force7N)} ÷ ${q7.a1Mm2} = ${force7N / q7.a1Mm2} MPa, ε₁ = ${force7N / q7.a1Mm2} ÷ ${whole(q7.eGPa * 1000)} = ${force7N / q7.a1Mm2 / (q7.eGPa * 1000)}, ΔL₁ = ${mm2(ext7Seg1)}. Segment 2: σ₂ = ${whole(force7N)} ÷ ${q7.a2Mm2} = ${force7N / q7.a2Mm2} MPa, ε₂ = ${force7N / q7.a2Mm2 / (q7.eGPa * 1000)}, ΔL₂ = ${mm2(ext7Seg2)}. Total extension: ${mm2(ext7Seg1)} + ${mm2(ext7Seg2)} = ${mm2(ext7Total)}.`,
    },
  ],
};
