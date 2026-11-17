// Full mock, passage 9. Area: natural sciences. Subject: Mendelian inheritance.
import { p } from '../lib.mjs';

// ---------- Mendel's rules, run in code: every expected share below comes from crossing alleles ----------
/** All offspring genotypes of two parents, each combination equally likely (law of segregation). */
const cross = (a, b) => [...a].flatMap((x) => [...b].map((y) => [x, y].sort().join('')));
const share = (kids, test) => kids.filter(test).length / kids.length;
const violet = (g) => g.includes('V');
const homozygous = (g) => g[0] === g[1];

// Table 1: counts an imagined gardener recorded. They show the expected ratios only roughly.
const table = [
  { cross: 1, parents: 'violet × white', violet: 86, white: 0 },
  { cross: 2, parents: 'violet × white', violet: 47, white: 53 },
  { cross: 3, parents: 'violet × violet', violet: 152, white: 49 },
];
const counts = table.flatMap((r) => [r.violet, r.white]);
if (new Set(counts).size !== counts.length) throw new Error('every count in Table 1 must be different');
// The genotypes that fit each row: cross 1 VV × vv, cross 2 Vv × vv, cross 3 Vv × Vv.
const fits = [cross('VV', 'vv'), cross('Vv', 'vv'), cross('Vv', 'Vv')];
table.forEach((r, i) => {
  const expectedWhite = share(fits[i], (g) => !violet(g));
  const observed = r.white / (r.violet + r.white);
  if (Math.abs(observed - expectedWhite) > 0.06) throw new Error(`row ${i + 1} is too far from its expected ratio`);
});

// Question 3: homozygous offspring in cross 3.
const homoIn3 = share(fits[2], homozygous);
// Question 4: a violet offspring of cross 3, chosen at random, is heterozygous.
const violetKids3 = fits[2].filter(violet);
const hetAmongViolet = share(violetKids3, (g) => !homozygous(g));
// Question 6: the offspring of cross 1 crossed with each other, against cross 2.
const kids1 = [...new Set(fits[0])];
if (kids1.length !== 1) throw new Error('cross 1 offspring should all share one genotype');
const whiteSelf1 = share(cross(kids1[0], kids1[0]), (g) => !violet(g));
const white2 = share(fits[1], (g) => !violet(g));
const ratio6 = whiteSelf1 / white2;
// Shares the wrong options use.
const vvShare = share(fits[2], (g) => g === 'VV');
const violetShare = share(fits[2], violet);
const hetShare = share(fits[2], (g) => !homozygous(g));
const threeKinds = 1 / new Set(fits[2]).size;
if (ratio6 !== 0.5) throw new Error('question 6 options are written for a ratio of one half');

const frac = (x) => { for (let d = 1; d <= 12; d++) { const n = Math.round(x * d); if (Math.abs(n / d - x) < 1e-9) return d === 1 ? `${n}` : `${n}/${d}`; } throw new Error(`no simple fraction for ${x}`); };

export default {
  id: 'p09',
  set: 'mock',
  area: 'natural sciences',
  title: 'Mendelian Inheritance',
  facts: [
    { claim: 'Alleles are variants of a gene; a diploid organism has two copies of each chromosome, one from each parent, so it carries two alleles of each gene.', source: 'https://openstax.org/books/biology-2e/pages/12-2-characteristics-and-traits', read: '2026-11-16' },
    { claim: 'Homozygous: two identical alleles; heterozygous: two different alleles.', source: 'https://openstax.org/books/biology-2e/pages/12-2-characteristics-and-traits', read: '2026-11-16' },
    { claim: 'Genotype is the genetic makeup; phenotype is the observable trait.', source: 'https://openstax.org/books/biology-2e/pages/12-2-characteristics-and-traits', read: '2026-11-16' },
    { claim: 'In simple dominant-recessive inheritance, homozygous dominant and heterozygous individuals look alike, and the recessive trait shows only in homozygous recessive individuals; dominance does not always hold (incomplete dominance, codominance).', source: 'https://openstax.org/books/biology-2e/pages/12-3-laws-of-inheritance', read: '2026-11-16' },
    { claim: 'Law of segregation: paired alleles separate equally into gametes, so offspring have an equal likelihood of inheriting either allele.', source: 'https://openstax.org/books/biology-2e/pages/12-3-laws-of-inheritance', read: '2026-11-16' },
    { claim: 'A cross of two heterozygotes gives genotypes 1:2:1 and, with complete dominance, phenotypes 3:1.', source: 'https://openstax.org/books/biology-2e/pages/12-2-characteristics-and-traits', read: '2026-11-16' },
    { claim: 'Test cross: a dominant-phenotype organism crossed with a homozygous recessive one; all dominant offspring indicate a homozygous dominant parent, a 1:1 ratio a heterozygous parent.', source: 'https://openstax.org/books/biology-2e/pages/12-2-characteristics-and-traits', read: '2026-11-16' },
    { claim: "In Mendel's garden peas, violet flower colour is dominant over white.", source: 'https://openstax.org/books/biology-2e/pages/12-1-mendels-experiments-and-the-laws-of-probability', read: '2026-11-16' },
  ],
  blocks: [
    p(
      'Some traits of plants and animals are passed on according to simple rules first described by Gregor Mendel, who crossed garden peas.',
      'A trait such as flower colour is controlled by a gene, which comes in different versions called alleles.',
      'A pea plant carries two alleles of each gene, one inherited from each parent.',
      'If the two are the same, the plant is homozygous for that gene; if they differ, it is heterozygous.',
      'The pair of alleles a plant carries is its genotype; the trait we can see is its phenotype.',
    ),
    p(
      'In pea flowers the allele for violet, written V, is dominant over the allele for white, written v, which is recessive.',
      'A plant with at least one V has violet flowers, so VV and Vv plants look alike.',
      'Only a vv plant has white flowers.',
      'Not every gene behaves this way, but flower colour in peas does.',
    ),
    p(
      'When a plant forms its gametes, the pollen and egg cells, its two alleles separate, and each gamete receives one of them, each with the same probability; this is called the law of segregation.',
      'Which allele an offspring receives from one parent is independent of which it receives from the other.',
      'The possible offspring of a cross can therefore be listed in a Punnett square, a grid with the alleles of one parent along the top and those of the other down the side; each of the four boxes is equally likely.',
      'For two Vv parents the boxes are VV, Vv, Vv and vv (the heterozygote fills two boxes): on average a quarter of the offspring are VV, a half Vv and a quarter vv, so three quarters have violet flowers and one quarter white.',
    ),
    p(
      'A plant with violet flowers may be VV or Vv.',
      'To find out which, it can be crossed with a white plant, which can only pass on v; this is called a test cross.',
      'If the violet plant is Vv, about half of the offspring will be white; if it is VV, none will.',
      'Real counts only come close to the expected shares, because each offspring receives its alleles by chance.',
      'Table 1 shows the results of three crosses made by a gardener.',
    ),
    {
      type: 'table',
      caption: 'Table 1. Flower colour of the offspring of three crosses of pea plants.',
      head: ['Cross', 'Parents', 'Violet offspring', 'White offspring'],
      rows: table.map((r) => [`${r.cross}`, r.parents, `${r.violet}`, `${r.white}`]),
    },
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what does it mean that a plant is heterozygous for a gene?',
      options: [
        { text: 'It has violet flowers.', why: 'Violet plants can be VV, which is homozygous, or Vv.' },
        { text: 'It carries only one allele of the gene.', why: 'Every pea plant carries two alleles of each gene, one from each parent.' },
        { text: 'Its two alleles of the gene are the same.', why: 'That is homozygous.' },
        { text: 'Its two alleles of the gene are different.', correct: true, why: 'This is the definition in the first paragraph; Vv is an example.' },
      ],
      explanation: 'The first paragraph: a plant whose two alleles differ is heterozygous; if they are the same, it is homozygous.',
    },
    {
      type: 'F', level: 2,
      stem: 'In which of the crosses in Table 1 could a violet parent be homozygous (VV)?',
      options: [
        { text: 'In cross 1 only.', correct: true, why: `A VV parent with a white one gives only violet offspring, as in cross 1. In crosses 2 and 3 white offspring appear, and each white offspring needs a v from every parent.` },
        { text: 'In cross 2 only.', why: `Cross 2 has ${table[1].white} white offspring. Each received a v from the violet parent, so that parent must be Vv.` },
        { text: 'In crosses 1 and 3.', why: `Cross 3 has ${table[2].white} white offspring, each with a v from both violet parents, so both are Vv.` },
        { text: 'In crosses 2 and 3.', why: 'Both crosses produced white offspring. A white offspring is vv, so it received a v from each parent, and a VV parent has no v to give.' },
      ],
      explanation: `A white (vv) offspring received a v from each parent. So a violet parent whose cross produced any white offspring must be Vv: that rules out crosses 2 and 3. In cross 1 all ${table[0].violet} offspring are violet, which is what a VV parent crossed with a white one gives.`,
    },
    {
      type: 'A', level: 2,
      stem: 'In cross 3, what share of the offspring is expected to be homozygous?',
      options: [
        { text: frac(vvShare), why: 'That is the share of one homozygous type only, VV or vv. Both are homozygous.' },
        { text: frac(violetShare), why: 'That is the share of violet offspring, which includes the heterozygous Vv plants.' },
        { text: frac(homoIn3), correct: true, why: `VV (${frac(vvShare)}) and vv (${frac(vvShare)}) are both homozygous.` },
        { text: frac(threeKinds), why: 'This counts three genotypes (VV, Vv, vv) as equally likely. In the Punnett square Vv fills two of the four boxes.' },
      ],
      explanation: `The white offspring show that both violet parents in cross 3 are Vv. A Vv × Vv cross gives the boxes VV, Vv, Vv and vv, each equally likely. Two of the four boxes, VV and vv, are homozygous: ${frac(homoIn3)}.`,
    },
    {
      type: 'T', level: 3,
      stem: 'One of the violet-flowered offspring of cross 3 is chosen at random. What is the probability that it is heterozygous?',
      options: [
        { text: frac(vvShare), why: 'That is the share of VV among all offspring, not the share of Vv among the violet ones.' },
        { text: frac(hetShare), why: 'That is the share of Vv among all offspring. The plant chosen is known to be violet, so the white quarter is ruled out.' },
        { text: frac(violetShare), why: 'That is the share of violet plants among all offspring.' },
        { text: frac(hetAmongViolet), correct: true, why: 'Of the three equally likely violet boxes, VV and the two Vv boxes, two are heterozygous.' },
      ],
      explanation: `Both parents are Vv, so the four boxes are VV, Vv, Vv and vv. The chosen plant is violet, which leaves three equally likely boxes: VV and two Vv. Two of them are heterozygous: ${frac(hetAmongViolet)}.`,
    },
    {
      type: 'C', level: 1,
      stem: 'A gardener has a violet-flowered pea plant and wants to find out whether it is VV or Vv. With which plant should it be crossed?',
      options: [
        { text: 'A white-flowered plant.', correct: true, why: 'A white plant can only pass on v, so any white offspring shows that the violet plant carries v.' },
        { text: 'A violet-flowered plant known to be VV.', why: 'Every offspring receives V from this plant and so has violet flowers whatever the genotype of the plant being tested.' },
        { text: 'A violet-flowered plant whose genotype is also unknown.', why: 'If that plant is VV, all offspring are violet whatever the tested plant is, so the cross may show nothing.' },
        { text: 'Any violet-flowered plant, as long as many offspring are counted.', why: 'If the partner is VV, no offspring can be white, however many are counted.' },
      ],
      explanation: 'The fourth paragraph describes this cross. The white plant passes on only v, so the offspring show which allele the violet plant passed on: about half white if it is Vv, none if it is VV.',
    },
    {
      type: 'D', level: 3,
      stem: 'The offspring of cross 1 are crossed with each other. Compared with the share expected in cross 2, what share of their offspring is expected to have white flowers?',
      options: [
        { text: 'None at all.', why: 'The offspring of cross 1 look violet, but each received v from the white parent, so they are Vv and can pass it on.' },
        { text: 'The same share.', why: `Cross 2 is Vv × vv and gives ${frac(white2)} white; Vv × Vv gives only ${frac(whiteSelf1)}.` },
        { text: 'Half the share.', correct: true, why: `${frac(whiteSelf1)} white against ${frac(white2)} in cross 2.` },
        { text: 'Twice the share.', why: `This has the two crosses the wrong way round: Vv × Vv gives ${frac(whiteSelf1)} white, Vv × vv gives ${frac(white2)}.` },
      ],
      explanation: `Every offspring of cross 1 has violet flowers, so it carries a V, and it received a v from its white parent: it is Vv. Vv × Vv gives ${frac(whiteSelf1)} white offspring. In cross 2 (Vv × vv) half the boxes are vv: ${frac(white2)}. ${frac(whiteSelf1)} is half of ${frac(white2)}.`,
    },
  ],
};
