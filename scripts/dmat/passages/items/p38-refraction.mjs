// Full mock 4, passage 3. Area: natural sciences. Subject: refraction, Snell's law and total internal reflection.
import { fixed, numericOptions, p } from '../lib.mjs';

// ---------- Table 1: refractive indices rounded to 2 decimal places (OpenStax College Physics 2e, Table 25.1) ----------
const cVacuum = 3.00; // in units of 10^8 m/s
const nAir = 1.00;
const nWater = 1.33;
const nBenzene = 1.50;
const nDiamond = 2.42;

const tableValues = [nAir, nWater, nBenzene, nDiamond];
if (new Set(tableValues).size !== tableValues.length) {
  throw new Error('every refractive index in Table 1 must be different');
}

const tableRows = [
  ['Air (0 °C, 1 atm)', fixed(nAir, 2)],
  ['Fresh water', fixed(nWater, 2)],
  ['Benzene', fixed(nBenzene, 2)],
  ['Diamond', fixed(nDiamond, 2)],
];

// Question 2: speed of light in benzene (× 10^8 m/s).
const vBenzene = cVacuum / nBenzene;
const vInverted = nBenzene / cVacuum;
const vWater = cVacuum / nWater;
const vMultiplied = cVacuum * nBenzene;

// Question 3: ray in benzene hitting diamond at 30° to the boundary surface (so θ1 = 60° to the normal).
const sin30 = 0.50;
const sin60 = 0.87; // rounded to 2 d.p. and given in the stem
const sinTheta2Right = (nBenzene * sin60) / nDiamond;
const sinTheta2UsedGrazing = (nBenzene * sin30) / nDiamond;
const sinTheta2UsedAir = (nAir * sin60) / nDiamond;
const sinTheta2SwappedOn30 = (nDiamond * sin30) / nBenzene;
if ([sinTheta2Right, sinTheta2UsedGrazing, sinTheta2UsedAir, sinTheta2SwappedOn30].some((v) => v <= 0 || v >= 1)) {
  throw new Error('question 3 sine options must all lie strictly between 0 and 1');
}

// Question 4: critical angle from ceramic (n1 = 2.40) into oil (n2 = 1.20).
const q4 = { n1: 2.40, n2: 1.20 };
const sinCrit4 = q4.n2 / q4.n1;
const critDeg4 = Math.round((Math.asin(sinCrit4) * 180) / Math.PI);
if (sinCrit4 !== 0.5 || critDeg4 !== 30) throw new Error('question 4 critical angle must be 30°');

// Question 5: critical angle of diamond in air vs in water.
const sinCritAir = nAir / nDiamond;
const sinCritWater = nWater / nDiamond;
if (!(sinCritWater > sinCritAir && sinCritWater < 1)) throw new Error('question 5 critical angle check failed');

// Question 6: parallel flat water layer between glass (n1 = 1.60) and air (n3 = 1.00) at θ1 = 30°.
const q6 = { n1: 1.60, n2: nWater, n3: nAir, sin1: sin30 };
const sinInWater6 = (q6.n1 * q6.sin1) / q6.n2;
const sinInAir6 = (q6.n2 * sinInWater6) / q6.n3;
if (Math.abs(sinInAir6 - (q6.n1 * q6.sin1) / q6.n3) > 1e-12) {
  throw new Error('parallel-layer cancellation failed');
}
const sin6StopAtWater = sinInWater6;
const sin6Keep30InWater = (q6.n2 * q6.sin1) / q6.n3;
const sin6WrongSecondIndex = (q6.n1 * Number(fixed(sinInWater6, 2))) / q6.n3;

// ---------- Figure 1: ray bending towards the normal when entering higher-index medium ----------
const deg = (d) => (d * Math.PI) / 180;
const r1 = (v) => Math.round(v * 10) / 10;
const bx = 220;
const by = 130;
const rayLen = 104;
const th1 = 50;
const th2 = 28;
const x1 = r1(bx - rayLen * Math.sin(deg(th1)));
const y1 = r1(by - rayLen * Math.cos(deg(th1)));
const x2 = r1(bx + rayLen * Math.sin(deg(th2)));
const y2 = r1(by + rayLen * Math.cos(deg(th2)));

const figure1 = `<svg viewBox="0 0 440 260" role="img" aria-labelledby="p38-fig1-alt">
  <line class="wire" x1="36" y1="${by}" x2="404" y2="${by}"/>
  <line class="curve curve-3" x1="${bx}" y1="18" x2="${bx}" y2="242"/>
  <line class="curve" x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}"/>
  <line class="curve curve-2" x1="${bx}" y1="${by}" x2="${x2}" y2="${y2}"/>
  <text class="label-3" x="${bx + 8}" y="34">Normal</text>
  <text class="label-1" x="${x1 - 6}" y="${y1 - 6}">Incident ray</text>
  <text class="label-2" x="${x2 + 8}" y="${y2 + 4}">Refracted ray</text>
  <text class="prob" x="${bx - 24}" y="${by - 42}" text-anchor="middle">θ₁</text>
  <text class="prob" x="${bx + 18}" y="${by + 58}" text-anchor="middle">θ₂</text>
  <text x="44" y="${by - 14}">Medium 1 (lower n₁)</text>
  <text x="44" y="${by + 24}">Medium 2 (higher n₂)</text>
</svg>`;

const speedFmt = (v) => `${fixed(v, 2)} × 10⁸ m/s`;
const degFmt = (v) => `${v}°`;

export default {
  id: 'p38',
  set: 'mock',
  mock: 4,
  area: 'natural sciences',
  title: 'Refraction and Total Internal Reflection',
  facts: [
    { claim: 'The refractive index of a medium is n = c ÷ v, where c = 3.00 × 10⁸ m/s is the speed of light in a vacuum and v is its speed in the medium.', source: 'https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction', read: '2026-11-18' },
    { claim: 'Snell’s law of refraction states n₁ sin θ₁ = n₂ sin θ₂, where θ₁ and θ₂ are measured relative to the normal (perpendicular) to the boundary; entering a higher-index medium bends the ray towards the normal.', source: 'https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction', read: '2026-11-18' },
    { claim: 'Refractive indices rounded to two decimal places from OpenStax Table 25.1: air 1.00, fresh water 1.33, benzene 1.50, diamond 2.42.', source: 'https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction', read: '2026-11-18' },
    { claim: 'Total internal reflection occurs when light travels from a higher-index medium toward a lower-index medium (n₁ > n₂) at an angle of incidence greater than the critical angle θ_c given by sin θ_c = n₂ ÷ n₁ (where θ₂ = 90°); optical fibres trap light in a higher-index core surrounded by lower-index cladding.', source: 'https://openstax.org/books/college-physics-2e/pages/25-4-total-internal-reflection', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'Light travels fastest in a vacuum, at c = 3.00 × 10⁸ metres per second (m/s).',
      'In any transparent substance it travels at a slower speed v.',
      'The refractive index n of that substance is the dimensionless ratio of the two speeds, so n is at least 1:',
    ),
    { type: 'formula', text: 'n = c ÷ v' },
    p(
      'When a ray of light crosses a flat boundary between medium 1 (index n₁) and medium 2 (index n₂), this speed change usually bends the ray, an effect called refraction.',
      'In optics, angles are always measured between each ray and the normal, the dashed line drawn at 90° to the boundary in Figure 1, never to the boundary surface itself; a ray making angle α with the boundary therefore has angle 90° − α to the normal.',
      'Snell’s law links the angle of incidence θ₁ and the angle of refraction θ₂:',
    ),
    { type: 'formula', text: 'n₁ × sin θ₁ = n₂ × sin θ₂' },
    {
      type: 'figure',
      id: 'p38-fig1',
      caption: 'Figure 1. Refraction from a lower-index medium into a higher-index medium (n₂ > n₁), with angles measured from the normal.',
      alt: 'A horizontal boundary between Medium 1 above (lower n₁) and Medium 2 below (higher n₂), crossed at 90 degrees by a vertical dashed Normal. An incident ray in Medium 1 meets the boundary at angle θ₁ to the normal, and the refracted ray in Medium 2 bends closer to the normal at smaller angle θ₂.',
      svg: figure1,
    },
    p(
      'Recall that sin 0° = 0, sin 30° = 0.50 and sin 90° = 1.00, and that sin θ increases steadily from 0 to 1 as θ grows from 0° to 90°.',
      'Entering a higher-index medium (n₂ > n₁) makes sin θ₂ < sin θ₁, bending the ray towards the normal (θ₂ < θ₁); entering a lower-index medium (n₂ < n₁) bends it away from the normal (θ₂ > θ₁).',
      'Table 1 lists refractive indices of four media, rounded to two decimal places.',
    ),
    {
      type: 'table',
      caption: 'Table 1. Refractive index n of selected media, rounded to two decimal places.',
      head: ['Medium', 'Refractive index n'],
      rows: tableRows,
    },
    p(
      'When light travels from a higher-index medium toward a lower-index one (n₁ > n₂), raising θ₁ eventually brings θ₂ to 90° (sin 90° = 1.00), so the refracted ray skims the boundary.',
      'That incident angle is the critical angle θ_c:',
    ),
    { type: 'formula', text: 'sin θ_c = n₂ ÷ n₁   (only when n₁ > n₂)' },
    p(
      'For any incident angle θ₁ > θ_c, Snell’s law would require sin θ₂ > 1, which is impossible: no light refracts across, and all of it reflects back into medium 1 (total internal reflection), the principle that keeps light inside the higher-index core of optical fibres.',
    ),
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what two conditions are both required for total internal reflection at a flat boundary from medium 1 toward medium 2?',
      options: [
        { text: 'Medium 1 has a higher refractive index than medium 2 (n₁ > n₂), and the angle of incidence exceeds the critical angle (θ₁ > θ_c).', correct: true, why: 'Both conditions are given at the end of the passage: n₁ > n₂ creates a critical angle, and θ₁ > θ_c prevents any refracted ray.' },
        { text: 'Medium 1 has a lower refractive index than medium 2 (n₁ < n₂), and the angle of incidence exceeds the critical angle (θ₁ > θ_c).', why: 'When n₁ < n₂, the ray bends towards the normal (θ₂ < θ₁ < 90°), so total internal reflection cannot happen.' },
        { text: 'Medium 1 has a higher refractive index than medium 2 (n₁ > n₂), and the angle of incidence is below the critical angle (θ₁ < θ_c).', why: 'When θ₁ < θ_c, sin θ₂ remains below 1 and a refracted ray still passes into medium 2.' },
        { text: 'The incident ray travels along the normal (θ₁ = 0°), and medium 1 has a higher refractive index than medium 2.', why: 'At θ₁ = 0°, sin θ₂ = 0, so the ray passes straight into medium 2 rather than undergoing total internal reflection.' },
      ],
      explanation: 'Total internal reflection happens only when light approaches a lower-index medium from a higher-index medium (n₁ > n₂) at an angle of incidence strictly above the critical angle (θ₁ > θ_c).',
    },
    {
      type: 'F', level: 1,
      stem: 'Using Table 1 and c = 3.00 × 10⁸ m/s, what is the speed of light in benzene?',
      options: numericOptions(
        { value: vBenzene, why: `Rearranging n = c ÷ v gives v = c ÷ n = 3.00 × 10⁸ ÷ ${fixed(nBenzene, 2)} = ${speedFmt(vBenzene)}.` },
        [
          { value: vInverted, why: `This divides n by c (${fixed(nBenzene, 2)} ÷ 3.00) instead of dividing c by n.` },
          { value: vWater, why: `This divides by ${fixed(nWater, 2)}, the refractive index of fresh water from the row above.` },
          { value: vMultiplied, why: `This multiplies c by n (3.00 × ${fixed(nBenzene, 2)}), giving a speed above the vacuum speed of light.` },
        ],
        speedFmt,
      ),
      explanation: `From Table 1, benzene has n = ${fixed(nBenzene, 2)}. Rearranging n = c ÷ v gives v = c ÷ n = 3.00 × 10⁸ ÷ ${fixed(nBenzene, 2)} = ${speedFmt(vBenzene)}.`,
    },
    {
      type: 'A', level: 2,
      stem: 'A light ray in benzene strikes a flat boundary with diamond along a path making an angle of 30° with the boundary surface itself. Using Table 1 and taking sin 30° = 0.50 and sin 60° = 0.87, what is sin θ₂ for the refracted ray in the diamond?',
      options: numericOptions(
        { value: sinTheta2Right, why: `θ₁ = 90° − 30° = 60° to the normal, so sin θ₂ = (${fixed(nBenzene, 2)} × ${fixed(sin60, 2)}) ÷ ${fixed(nDiamond, 2)} = ${fixed(sinTheta2Right, 2)}.` },
        [
          { value: sinTheta2UsedGrazing, why: 'This uses the 30° angle to the boundary surface directly instead of θ₁ = 90° − 30° = 60° to the normal.' },
          { value: sinTheta2UsedAir, why: 'This uses n₁ = 1.00 (air) instead of n₁ = 1.50 (benzene) with θ₁ = 60°.' },
          { value: sinTheta2SwappedOn30, why: 'This both swaps n₁ and n₂ and uses 30° instead of 60°.' },
        ],
        (v) => fixed(v, 2),
      ),
      explanation: `Because angles in Snell’s law are measured from the normal, a 30° angle to the boundary gives θ₁ = 90° − 30° = 60°. Then sin θ₂ = (n₁ × sin θ₁) ÷ n₂ = (${fixed(nBenzene, 2)} × ${fixed(sin60, 2)}) ÷ ${fixed(nDiamond, 2)} = ${fixed(sinTheta2Right, 2)}.`,
    },
    {
      type: 'A', level: 2,
      stem: `A transparent ceramic block with refractive index n₁ = ${fixed(q4.n1, 2)} sits inside a clear oil with refractive index n₂ = ${fixed(q4.n2, 2)}. Given sin 30° = 0.50, sin 45° = 0.71, sin 60° = 0.87 and sin 90° = 1.00, what is the critical angle θ_c for light heading from the ceramic toward the oil?`,
      options: numericOptions(
        { value: critDeg4, why: `sin θ_c = n₂ ÷ n₁ = ${fixed(q4.n2, 2)} ÷ ${fixed(q4.n1, 2)} = 0.50, which corresponds to θ_c = 30°.` },
        [
          { value: 45, why: '45° has sin 45° = 0.71, not 0.50; the critical angle is not automatically halfway to 90°.' },
          { value: 60, why: '60° = 90° − 30° measures the angle to the boundary surface rather than to the normal.' },
          { value: 90, why: '90° is the angle of refraction θ₂ along the boundary at the threshold, not the incident critical angle θ_c.' },
        ],
        degFmt,
      ),
      explanation: `Apply sin θ_c = n₂ ÷ n₁ = ${fixed(q4.n2, 2)} ÷ ${fixed(q4.n1, 2)} = 0.50. Since sin 30° = 0.50, the critical angle measured from the normal is ${critDeg4}°.`,
    },
    {
      type: 'D', level: 2,
      stem: 'A cut diamond is moved from air into fresh water (Table 1). How does the critical angle θ_c at the diamond’s surface change, and what does this do to the range of incident angles (between 0° and 90°) that undergo total internal reflection?',
      options: [
        { text: 'θ_c decreases, so total internal reflection occurs over a wider range of incident angles.', why: 'Replacing air (1.00) with water (1.33) raises n₂, which increases sin θ_c = n₂ ÷ n₁ rather than decreasing it.' },
        { text: 'θ_c decreases, so total internal reflection occurs over a narrower range of incident angles.', why: 'sin θ_c rises from 1.00 ÷ 2.42 to 1.33 ÷ 2.42, so θ_c increases rather than decreases.' },
        { text: 'θ_c increases, so total internal reflection occurs over a wider range of incident angles.', why: 'θ_c increases, and because total internal reflection requires θ₁ > θ_c, a higher threshold leaves a narrower interval up to 90°.' },
        { text: 'θ_c increases, so total internal reflection occurs over a narrower range of incident angles.', correct: true, why: 'sin θ_c = n₂ ÷ n₁ rises from 1.00 ÷ 2.42 to 1.33 ÷ 2.42, raising θ_c and narrowing the range θ_c < θ₁ < 90°.' },
      ],
      explanation: 'In air, sin θ_c = 1.00 ÷ 2.42; in water, sin θ_c = 1.33 ÷ 2.42. Because sin θ increases with θ, θ_c is larger in water, leaving fewer angles between θ_c and 90° that undergo total internal reflection.',
    },
    {
      type: 'T', level: 3,
      stem: `A flat, uniform film of fresh water (n₂ = ${fixed(q6.n2, 2)}, Table 1) with parallel top and bottom surfaces lies between a flat glass block below (n₁ = ${fixed(q6.n1, 2)}) and air above (n₃ = ${fixed(q6.n3, 2)}). A ray in the glass hits the glass–water boundary at θ₁ = 30° to the normal (sin 30° = 0.50) and passes through the water into the air. What is sin θ₃ for the ray in the air?`,
      options: numericOptions(
        { value: sinInAir6, why: `Parallel boundaries share parallel normals, so n₁ × sin θ₁ = n₂ × sin θ₂ = n₃ × sin θ₃, giving sin θ₃ = (${fixed(q6.n1, 2)} × 0.50) ÷ 1.00 = ${fixed(sinInAir6, 2)}.` },
        [
          { value: sin6StopAtWater, why: `This is sin θ₂ = (${fixed(q6.n1, 2)} × 0.50) ÷ ${fixed(q6.n2, 2)} inside the water layer, before crossing into air.` },
          { value: sin6Keep30InWater, why: `This computes ${fixed(q6.n2, 2)} × 0.50 ÷ 1.00 as if the ray in the water were still at 30° to the normal.` },
          { value: sin6WrongSecondIndex, why: `At the water–air boundary this multiplies sin θ₂ ≈ 0.60 by ${fixed(q6.n1, 2)} instead of ${fixed(q6.n2, 2)}.` },
        ],
        (v) => fixed(v, 2),
      ),
      explanation: `At the first boundary, ${fixed(q6.n1, 2)} × sin 30° = ${fixed(q6.n2, 2)} × sin θ₂. Because the two boundaries are parallel, their normals are parallel, so the ray meets the water–air boundary at the same angle θ₂, giving ${fixed(q6.n2, 2)} × sin θ₂ = ${fixed(q6.n3, 2)} × sin θ₃. Thus ${fixed(q6.n2, 2)} × sin θ₂ cancels out: sin θ₃ = (${fixed(q6.n1, 2)} × 0.50) ÷ 1.00 = ${fixed(sinInAir6, 2)}.`,
    },
    {
      type: 'S', level: 3,
      stem: 'Which statement about light meeting a flat boundary between two transparent media of different refractive indices (n₁ ≠ n₂) is always true?',
      options: [
        { text: 'At θ₁ = 0° the ray continues straight without bending, so its speed in medium 2 equals its speed in medium 1.', why: 'Wave speed v = c ÷ n is set by the refractive index, so v changes whenever n₁ ≠ n₂ even though the path stays straight.' },
        { text: 'Whenever n₁ < n₂, rays with sufficiently large angles of incidence undergo total internal reflection.', why: 'When n₁ < n₂, sin θ₂ = (n₁ ÷ n₂) × sin θ₁ < 1 for every θ₁, so a refracted ray always enters medium 2.' },
        { text: 'Doubling the angle of incidence θ₁ (for 0° < θ₁ < 40°) doubles the angle of refraction θ₂.', why: 'Snell’s law makes sin θ₂ proportional to sin θ₁, not θ₂ proportional to θ₁, because sin θ is not proportional to θ.' },
        { text: 'At θ₁ = 0° the ray continues straight without bending (θ₂ = 0°), yet its speed still changes from c ÷ n₁ to c ÷ n₂.', correct: true, why: 'sin 0° = 0 gives n₂ × sin θ₂ = 0 and hence θ₂ = 0°, while v = c ÷ n changes because n₁ ≠ n₂.' },
      ],
      explanation: 'At normal incidence (θ₁ = 0°), sin θ₁ = 0, so Snell’s law gives sin θ₂ = 0 and the ray enters undeviated (θ₂ = 0°). Its speed, however, is v = c ÷ n in each medium, so it changes from c ÷ n₁ to c ÷ n₂.',
    },
  ],
};
