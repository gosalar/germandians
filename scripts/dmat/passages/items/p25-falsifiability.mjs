// Mock 2, passage 25. Area: humanities. Subject: falsifiability, testable predictions and ad hoc hypotheses. Text only.
import { p, whole } from '../lib.mjs';

// Scenario constants kept distinct and checked at load time.
const tLow2 = 20;
const tHigh2 = 80;
const openMins = 10;
const closedHours = 2;
const threshC = 8;
const warmC = 12;
const seenRavens = 5000;
const whiteRavens = 1;
if (!(tLow2 < tHigh2 && closedHours * 60 > openMins && threshC < warmC && seenRavens > 1000 && whiteRavens === 1)) {
  throw new Error('scenario values in p25 are inconsistent');
}
const p25Nums = [tLow2, tHigh2, openMins, closedHours, threshC, warmC, seenRavens, whiteRavens];
if (new Set(p25Nums).size !== p25Nums.length) {
  throw new Error('scenario numbers in p25 must all differ');
}

export default {
  id: 'p25',
  set: 'mock',
  mock: 2,
  area: 'humanities',
  title: 'Falsifiability and Ad Hoc Hypotheses',
  facts: [
    { claim: 'The problem of demarcation asks what distinguishes empirical scientific theories from non-scientific or pseudoscientific claims; Popper bases his answer on the logical asymmetry between verification and falsification, under which no finite number of confirming observations can conclusively verify a universal law, whereas a single genuine counter-instance refutes it.', source: 'https://plato.stanford.edu/entries/popper/', read: '2026-11-18' },
    { claim: 'Popper\'s criterion of falsifiability requires that statements or systems of statements, to rank as scientific, be capable of conflicting with possible or conceivable observations — that is, they must forbid certain observable states of affairs.', source: 'https://plato.stanford.edu/entries/pseudo-science/', read: '2026-11-18' },
    { claim: 'Surviving severe, risky predictions that might conceivably have turned out false does not prove a theory true once and for all, but counts as corroboration; fitting everyday observations when nothing could count against the theory does not.', source: 'https://plato.stanford.edu/entries/popper/', read: '2026-11-18' },
    { claim: 'Saving a theory whose predictions fail by adding ad hoc hypotheses tailored solely to accommodate conflicting facts eliminates the possibility of contrary evidence and turns an initially scientific theory into dogma.', source: 'https://plato.stanford.edu/entries/popper/', read: '2026-11-18' },
    { claim: 'Deriving a prediction from a main theory relies on auxiliary hypotheses; revising an auxiliary hypothesis after a failed prediction stays scientific only when the revised system produces new, independently falsifiable predictions, whereas permanently shielding a theory with untestable ad hoc hypotheses removes its scientific status.', source: 'https://iep.utm.edu/pop-sci/', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'In the philosophy of science, the problem of demarcation asks what separates empirical science from non-scientific or pseudoscientific claims.',
      'An early answer held that scientific statements are those that observation can verify, meaning prove true.',
      'The philosopher Karl Popper objected that verification fails for universal statements, claims that cover every instance of a kind, such as "All swans are white."',
      'However many white swans observers record, the next swan might still be black, so finite observations never prove a universal statement true.',
      'Between verification and refutation there is a logical asymmetry: one genuine black swan is enough to refute the universal claim.',
    ),
    p(
      'Popper therefore proposed falsifiability as the mark of empirical science.',
      'A statement or theory is falsifiable if it is capable of conflicting with possible, conceivable observations.',
      'To be falsifiable, a theory must rule out specific observable outcomes and make risky predictions, definite forecasts that could turn out false when checked.',
      'Falsifiable does not mean false: a well-established physical law is falsifiable because we can state clearly what observation would refute it if that observation ever occurred, even if every test so far agrees with the law.',
      'By contrast, a statement that allows every conceivable outcome — whether by covering both sides ("It will rain or it will not"), by using wording so vague that almost anything can be read as a hit, or by appealing to undetectable forces compatible with opposite behaviours — forbids nothing and is unfalsifiable.',
    ),
    p(
      'When a theory survives severe attempts to refute its risky predictions, Popper says it is corroborated, not proved forever true: it has stood up to testing so far, while remaining open to future refutation.',
      'Fitting observations carries scientific weight only when those observations could conceivably have gone against the theory.',
    ),
    p(
      'In practice, testing a theory also relies on auxiliary hypotheses, background assumptions such as that a measuring instrument is working properly or that no unknown body is disturbing the system.',
      'When an observation clashes with a prediction, the fault may lie in the main theory or in an auxiliary hypothesis.',
      'Modifying an auxiliary hypothesis stays scientific if the revised package yields new, independently testable predictions that could themselves fail.',
      'An ad hoc hypothesis, however, is an extra assumption brought in solely to explain away a failed prediction without generating any new testable consequence.',
      'Repeatedly rescuing a theory with untestable ad hoc adjustments shields it from contrary evidence and turns an initially scientific theory into unfalsifiable dogma.',
    ),
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to Popper\'s criterion as explained in the text, what makes a theory scientific?',
      options: [
        { text: 'It has been conclusively verified by a large enough collection of careful observations across different settings.', why: 'The first paragraph explains that no finite collection of observations can conclusively verify a universal scientific claim.' },
        { text: 'It has already been shown to be false by at least one controlled experiment or counter-instance.', why: 'The second paragraph distinguishes "falsifiable" from "false": a law can be falsifiable while passing every test so far.' },
        { text: 'It is broad enough to explain every possible outcome in its field without ever clashing with observation.', why: 'Accommodating every possible outcome means forbidding nothing, which makes a claim unfalsifiable rather than scientific.' },
        { text: 'It forbids specific observable outcomes, so that conceivable observations could conflict with it and refute it.', correct: true, why: 'This states Popper\'s criterion of falsifiability in the second paragraph.' },
      ],
      explanation: 'The second paragraph defines Popper\'s demarcation criterion: a theory counts as scientific if it is falsifiable, meaning it rules out specific observable states of affairs so that conceivable observations could conflict with it.',
    },
    {
      type: 'C', level: 1,
      stem: 'Four speakers put forward general claims. Using the criteria in the text, which claim is falsifiable?',
      options: [
        { text: `"Every solid metal increases in volume when heated from ${tLow2} °C to ${tHigh2} °C at standard atmospheric pressure."`, correct: true, why: `Finding one solid metal whose volume stays the same or shrinks between ${tLow2} °C and ${tHigh2} °C at standard pressure would conflict with this claim.` },
        { text: '"Tomorrow\'s midday ferry will either dock at the harbour on schedule or dock at some other time, if it docks at all."', why: 'This statement covers every conceivable outcome for the ferry and rules nothing out, so no observation can conflict with it.' },
        { text: '"Every person\'s decisions are guided by an undetectable inner current that leaves no trace and can prompt either caution or boldness."', why: 'An undetectable cause compatible with opposite behaviours forbids no observable action and takes no empirical risk.' },
        { text: '"Something noteworthy will happen to someone in this city during the coming month, though its form cannot be specified in advance."', why: 'Wording this vague allows almost any event in a city over a month to be counted as a match, so nothing definite is ruled out.' },
      ],
      explanation: `A falsifiable claim must rule out definite observable outcomes. The claim about solid metals heated from ${tLow2} °C to ${tHigh2} °C forbids any solid metal failing to expand under those stated conditions. The other three claims forbid nothing: one covers every logical case, one posits an undetectable cause compatible with opposite actions, and one is too vague to fail.`,
    },
    {
      type: 'C', level: 2,
      stem: `A botanist proposes that a plant hormone causes all alpine gentians to open their petals within ${openMins} minutes of sunrise. In a shaded valley, the gentians stay closed for ${closedHours} hours after sunrise. Which response introduces an ad hoc hypothesis in the sense of the text?`,
      options: [
        { text: `Revising the hypothesis to state that the hormone acts only above ${threshC} °C, and warming shaded gentians to ${warmC} °C before sunrise to see whether they open within ${openMins} minutes.`, why: `This revision generates a new, independently testable prediction at ${warmC} °C that observation could refute.` },
        { text: 'Checking whether the valley light meter and stopwatch malfunctioned, and repeating the valley observation the next morning with calibrated instruments.', why: 'Instrument reliability is a testable auxiliary assumption that can be checked independently on the next run.' },
        { text: 'Adding the rule that the hormone always works except whenever human observers or recording devices are present in the valley to check the petals.', correct: true, why: 'This excuse is tailored solely to explain away the valley failure while ruling out any independent way to test the exception.' },
        { text: 'Concluding that the valley observation refutes the universal claim as stated, and setting that universal wording aside in favour of a narrower claim.', why: 'Accepting that the universal statement has been refuted is the opposite of shielding it with an ad hoc excuse.' },
      ],
      explanation: 'The fourth paragraph defines an ad hoc hypothesis as an adjustment added solely to explain away a failed prediction without producing any new, independently testable consequence. Claiming that the hormone stops working whenever people or instruments look at the flowers prevents any independent check. Testing a temperature threshold or checking instruments creates fresh tests, and giving up the universal wording accepts refutation.',
    },
    {
      type: 'S', level: 2,
      stem: 'Which statement accurately expresses what the text says about falsifiability and corroboration?',
      options: [
        { text: 'Once a theory has survived many severe experimental tests without failing, it stops being falsifiable and becomes a verified certainty.', why: 'Surviving tests never removes falsifiability or proves a universal law beyond future refutation; it corroborates the theory.' },
        { text: 'A theory that repeatedly survives risky predictions remains falsifiable and is corroborated so far, yet future observations could still refute it.', correct: true, why: 'This matches the second and third paragraphs: corroboration records survival under genuine risk while leaving future refutation open.' },
        { text: 'Calling a scientific law falsifiable means that researchers have already recorded at least one observation that contradicts its predictions.', why: 'That confuses "falsifiable" (capable of being refuted by conceivable observations) with "falsified" (actually refuted).' },
        { text: 'A theory is strongly corroborated whenever everyday events can be interpreted to fit it, even if no conceivable event could count against it.', why: 'The third paragraph states that fitting observations counts as corroboration only when those observations could conceivably have gone against the theory.' },
      ],
      explanation: 'The second and third paragraphs stress two points: a law that passes every test remains falsifiable because we can still specify what observation would refute it, and passing severe, risky tests corroborates a theory rather than proving it true once and for all.',
    },
    {
      type: 'D', level: 2,
      stem: `Consider the universal statement "All ravens have black feathers." Suppose all auxiliary assumptions about species identification and lighting hold. Biologist X observes ${whole(seenRavens)} ravens across several regions, all with black feathers; later, Biologist Y observes ${whiteRavens} raven with naturally white feathers. Following the logic in the text, what do X's and Y's observations establish?`,
      options: [
        { text: `X's ${whole(seenRavens)} observations verify the universal statement beyond doubt, so Y's single white raven cannot overturn the general rule.`, why: 'No finite number of matching cases verifies a universal statement, because unexamined cases can still differ.' },
        { text: `Neither observation settles the universal statement logically, because refuting it would require at least ${whole(seenRavens)} white ravens to outweigh X's count.`, why: 'Logical refutation of an "all" claim does not weigh counts against counts; a single genuine counter-instance conflicts with "all".' },
        { text: 'X\'s observations and Y\'s observation have symmetrical weight, each moving the universal statement partway towards truth or falsehood.', why: 'The first paragraph highlights logical asymmetry, not symmetry, between confirming instances and a refuting counter-instance.' },
        { text: `X's ${whole(seenRavens)} observations cannot prove the statement true of every raven, whereas Y's ${whiteRavens} genuine white raven refutes the statement as stated.`, correct: true, why: 'This directly applies the logical asymmetry between finite confirming observations and a single counter-instance.' },
      ],
      explanation: `By the logical asymmetry in the first paragraph, ${whole(seenRavens)} black ravens cannot prove that every raven is black, though surviving checks corroborates the claim so far. Once auxiliary assumptions hold, ${whiteRavens} genuine white raven contradicts "All ravens have black feathers" and refutes that universal statement.`,
    },
    {
      type: 'T', level: 3,
      stem: 'A planet\'s measured path deviates slightly from the orbit predicted by a gravitational theory. Astronomer M proposes that an uncharted outer moon of a specified mass and orbit pulls on the planet, and calculates the exact coordinates where a telescope should spot that moon next month. Astronomer N proposes instead that gravity undergoes brief, unpredictable surges that affect no other object, leave no optical or radio trace, and always match the exact size of whatever deviation has just been measured. How does the framework in the text evaluate M\'s and N\'s proposals?',
      options: [
        { text: 'Both M and N make ad hoc moves that render the gravitational theory unscientific, because modifying any assumption after a failed prediction is illegitimate.', why: 'The fourth paragraph explicitly allows modifying an auxiliary hypothesis when the revised system generates new, independently testable predictions.' },
        { text: 'N\'s proposal is scientifically stronger because it accounts for the orbital deviation without risking a failed telescope search next month.', why: 'Eliminating the risk of contrary evidence is what turns a claim into unfalsifiable dogma, not a scientific strength.' },
        { text: 'M\'s proposal keeps the revision scientific because telescope observations can independently test the predicted moon, whereas N\'s proposal is an ad hoc adjustment that shields the theory from any independent test.', correct: true, why: 'M\'s auxiliary hypothesis yields a fresh, falsifiable forecast at stated coordinates; N\'s untestable surges exist only to absorb the discrepancy.' },
        { text: 'If a telescope spots the moon at M\'s coordinates, the gravitational theory is verified forever, whereas N\'s proposal corroborates the theory without needing a telescope.', why: 'Spotting the moon corroborates rather than permanently verifies the theory, and N\'s untestable adjustment provides no corroboration.' },
      ],
      explanation: 'The fourth paragraph contrasts two ways of revising an auxiliary hypothesis after a failed prediction. Astronomer M specifies a moon whose predicted sky coordinates create a new, independent test that could fail next month, keeping the theory scientific. Astronomer N invents untestable surges tailored solely to match the discrepancy, a textbook ad hoc hypothesis that immunises the theory against refutation.',
    },
  ],
};
