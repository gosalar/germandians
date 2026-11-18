// Mock 4, passage 44. Area: humanities. Subject: act-consequentialist and deontological ethical frameworks. Text only.
import { p, whole } from '../lib.mjs';

// Distinct scenario constants checked at load time.
const sealYears2 = 10;
const earlyYears2 = 2;
const scholars2 = 15;
const households3 = 4000;
const streetHomes3 = 30;
const debtEuros5 = 200;
const p44Nums = [sealYears2, earlyYears2, scholars2, households3, streetHomes3, debtEuros5];
if (new Set(p44Nums).size !== p44Nums.length || !(earlyYears2 < sealYears2 && streetHomes3 < households3)) {
  throw new Error('scenario numbers in p44 must be distinct and ordered');
}

export default {
  id: 'p44',
  set: 'mock',
  mock: 4,
  area: 'humanities',
  title: 'Consequentialist and Deontological Ethics',
  facts: [
    { claim: 'Consequentialism holds that whether an act is morally right depends solely on its consequences rather than on the intrinsic nature of the act or prior events; act-consequentialism holds that an act is morally right if and only if it produces a greater net balance of good minus bad for all than any alternative available on that occasion.', source: 'https://plato.stanford.edu/entries/consequentialism/', read: '2026-11-18' },
    { claim: 'Classic utilitarianism is the best-known version of act-consequentialism, evaluating outcomes in terms of overall well-being and counting every person\'s good impartially (agent-neutrally).', source: 'https://plato.stanford.edu/entries/consequentialism/', read: '2026-11-18' },
    { claim: 'Deontological ethics (from the Greek deon, duty) evaluates choices by whether they conform to moral duties, rules and rights — classifying acts as required, forbidden or permitted — in opposition to consequentialism.', source: 'https://plato.stanford.edu/entries/ethics-deontological/', read: '2026-11-18' },
    { claim: 'Deontological constraints forbid certain kinds of act — such as breaking a promise, deceiving others, or using a person merely as a means to a wider goal — even when performing the forbidden act would bring about a larger overall balance of good consequences.', source: 'https://plato.stanford.edu/entries/ethics-deontological/', read: '2026-11-18' },
    { claim: 'Many deontological views recognise agent-centred duties tied to an agent\'s own promises, roles or relationships, and can reach the same outward verdict as consequentialism when duty and good outcomes align while diverging when they conflict.', source: 'https://plato.stanford.edu/entries/ethics-deontological/', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'When people disagree about what someone ought to do, they often appeal to two different moral standards: the outcomes an action brings about, or the duties and rights the action respects.',
      'In moral philosophy these two standards are developed systematically as act-consequentialism and deontological ethics.',
    ),
    p(
      'Consequentialism holds that whether an action is morally right or wrong depends solely on its consequences — the states of affairs that follow from it — rather than on the intrinsic kind of act it is or on commitments made beforehand.',
      'Under act-consequentialism, an agent facing a choice ought to perform whichever available action produces the greatest net balance of good over bad outcomes overall.',
      'In its best-known version, classic utilitarianism, good is understood as well-being, and every affected person\'s gain or loss counts impartially, meaning equally regardless of who performs the act or how they are connected to the agent.',
      'Because only the net sum of consequences matters, no type of action — such as breaking a promise or withholding the truth — is ruled out in advance if, in that particular case, doing so produces a better total outcome than every alternative.',
    ),
    p(
      'Deontological ethics, named from the Greek word deon ("duty"), denies that outcomes are the whole story.',
      'It holds that certain kinds of choice are intrinsically required, permitted or forbidden by moral duties and individual rights, even when breaking a duty would yield a somewhat larger total of good results.',
      'Philosophers in this tradition, notably Immanuel Kant, emphasise moral constraints against using people merely as a means — as tools for advancing a broader goal without regard for their own consent or rights.',
      'Many deontological theories also recognise agent-centred duties: special obligations an agent owes to particular people because of a prior promise, contract or role, which cannot simply be set aside whenever strangers would gain slightly more.',
    ),
    p(
      'In everyday life the two frameworks often recommend the very same outward action, for instance honouring an agreement when doing so both keeps a promise and preserves useful cooperation.',
      'Even then, their underlying reasons differ: the consequentialist points to the future benefits of mutual trust, whereas the deontologist points to the obligation created by the agreement itself.',
      'Their verdicts pull apart in conflict cases where keeping a moral constraint, such as truthfulness or promise-keeping, produces a smaller net total of good outcomes than breaking it, or where achieving a wider benefit requires imposing an unconsented burden on one person.',
    ),
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what determines whether an action is morally right under act-consequentialism?',
      options: [
        { text: 'Whether the action honours prior promises and role obligations owed specifically by the agent.', why: 'Prior promises and agent-centred role obligations are features of deontological ethics rather than act-consequentialism.' },
        { text: 'Whether the action belongs to a category of conduct that is permitted regardless of its results.', why: 'Judging categories of conduct apart from their results is the mark of deontological constraints, not act-consequentialism.' },
        { text: 'Whether the action produces a greater net balance of good over bad outcomes overall than any available alternative.', correct: true, why: 'This states the definition of act-consequentialism in the second paragraph.' },
        { text: 'Whether the action benefits the agent\'s close associates more than it benefits strangers.', why: 'Act-consequentialism in its classic utilitarian form counts everyone\'s good impartially rather than favouring close associates.' },
      ],
      explanation: 'The second paragraph defines act-consequentialism as the view that an action is morally right when it brings about a greater net balance of good over bad outcomes across everyone affected than any alternative available on that occasion.',
    },
    {
      type: 'C', level: 1,
      stem: `A university archivist promised a retiring botanist to keep a folder of harmless personal field diaries sealed for ${sealYears2} years. Opening the folder ${earlyYears2} years early would modestly save time for ${scholars2} visiting researchers and cause the botanist no distress, yet the archivist refuses solely on the ground that a promise was given. Which ethical approach does the archivist's reasoning illustrate?`,
      options: [
        { text: 'Impartial utilitarianism, because the archivist weighs the botanist\'s comfort more heavily than the researchers\' time.', why: 'The scenario states the botanist would suffer no distress, and the archivist appeals to the promise itself rather than weighing comfort.' },
        { text: 'Act-consequentialism, because keeping the folder sealed produces the largest total time saving across everyone involved.', why: 'Keeping the folder sealed forfeits the time saving for the 15 researchers without creating a larger gain elsewhere.' },
        { text: 'Outcome maximisation, because the archivist judges the choice exclusively by the states of affairs that follow from it.', why: 'Looking back to a prior promise rather than forward to net outcomes is the opposite of outcome maximisation.' },
        { text: 'Deontological ethics, because a duty arising from a prior promise constrains the choice even when breaking it would raise net benefit.', correct: true, why: 'Refusing to break a promise despite a modest net gain in outcomes exemplifies a deontological constraint.' },
      ],
      explanation: `Opening the folder ${earlyYears2} years early would raise total net benefit slightly without harming the donor, so act-consequentialism would favour opening it. Refusing solely because a binding promise was made illustrates deontological (duty-based) reasoning.`,
    },
    {
      type: 'C', level: 2,
      stem: `A municipal water board must choose between two pipe-repair schedules across ${whole(households3)} homes. It calculates total hours without tap water across all ${whole(households3)} homes, counting every household's hour equally, and picks the schedule with the fewest total hours lost even though doing so breaks an earlier written assurance given to ${streetHomes3} homes on one street. Which framework from the text guides this decision?`,
      options: [
        { text: 'Act-consequentialism, counting every household\'s disruption impartially and letting the best net outcome override the prior assurance.', correct: true, why: 'Minimising total disruption across all households equally, even at the cost of breaking a prior promise, applies impartial act-consequentialism.' },
        { text: 'Deontological ethics, upholding an agent-centred duty owed specifically to the thirty households that received the written assurance.', why: 'An agent-centred duty to those thirty households would speak against breaking the written assurance given to them.' },
        { text: 'Kant\'s constraint against using a smaller group\'s inconvenience as a means to reduce inconvenience for a larger group.', why: 'That constraint would forbid overriding the assurance to the thirty households merely to lower the city-wide total.' },
        { text: 'A rule that treats every category of promise-breaking as unconditionally forbidden whatever the size of the disruption saved.', why: 'The board explicitly breaks its written assurance to secure fewer lost hours overall, rejecting an unconditional prohibition.' },
      ],
      explanation: `The board aggregates lost water hours impartially across all ${whole(households3)} homes and chooses the option with the best net outcome even though it breaks a prior written assurance to ${streetHomes3} homes. That directly reflects impartial act-consequentialism.`,
    },
    {
      type: 'S', level: 2,
      stem: 'Which statement accurately describes how act-consequentialism and deontological ethics compare according to the text?',
      options: [
        { text: 'The two frameworks must recommend opposite outward actions in every situation, because one looks to outcomes and the other to duties.', why: 'The fourth paragraph explicitly notes that in everyday life both frameworks often recommend the same outward action for different reasons.' },
        { text: 'Deontological ethics ignores individual rights altogether, whereas act-consequentialism treats individual rights as unbreakable limits on action.', why: 'This swaps the two views: deontological ethics treats duties and rights as constraints, while act-consequentialism allows any act that maximises net good.' },
        { text: 'Both frameworks can endorse the same outward action for different reasons, and diverge when respecting a moral constraint lowers total net good.', correct: true, why: 'This summarises the fourth paragraph on everyday convergence of actions alongside divergence in reasons and conflict cases.' },
        { text: 'Act-consequentialism gives extra weight to promises made by the agent, whereas deontological ethics counts only impartial well-being.', why: 'Special obligations from an agent\'s own promises belong to agent-centred deontology, whereas impartial well-being belongs to utilitarianism.' },
      ],
      explanation: 'The fourth paragraph explains that both frameworks frequently recommend the same outward act (such as keeping an agreement that also sustains cooperation) for different underlying reasons, while pulling apart when keeping a moral constraint yields less overall good than breaking it.',
    },
    {
      type: 'D', level: 2,
      stem: `Suppose a borrower owes €${debtEuros5} today to a prosperous neighbour who would not miss the money, while donating that €${debtEuros5} to a local food pantry today would create a larger direct gain in well-being. At first, both an act-consequentialist and a deontologist advise repaying the neighbour: the act-consequentialist because public default would damage wider neighbourhood trust, and the deontologist because the borrower promised to repay. Suppose the situation changes so that donating instead of repaying would remain completely unknown to others and cause no wider loss of trust. How do the verdicts of the two frameworks change?`,
      options: [
        { text: 'Both frameworks shift to recommending the donation, because neither counts a promise once wider trust is unaffected.', why: 'Deontological promise-keeping rests on the duty owed to the promisee, not solely on indirect effects on public trust.' },
        { text: 'Act-consequentialism shifts to recommending the donation, whereas deontological ethics continues to require repaying the neighbour.', correct: true, why: 'With indirect trust losses removed, donating maximises net good, whereas the duty to keep a promise still binds deontologically.' },
        { text: 'Deontological ethics shifts to recommending the donation, whereas act-consequentialism continues to require repaying the neighbour.', why: 'This reverses the two theories: removing negative consequences shifts the outcome-based verdict, not the duty-based constraint.' },
        { text: 'Neither framework changes its verdict, because act-consequentialism forbids breaking a debt agreement regardless of the outcomes.', why: 'The second paragraph notes that act-consequentialism never rules out breaking a promise in advance when doing so yields a better total outcome.' },
      ],
      explanation: 'Under act-consequentialism, promise-breaking was opposed at first only because of its bad ripple effects on trust; once those negative consequences vanish and the pantry donation produces greater net good, act-consequentialism favours donating. Under deontological ethics, the duty created by the promise to repay binds even when breaking it yields more net good.',
    },
    {
      type: 'T', level: 3,
      stem: 'Two editors at a consumer magazine both vote against publishing unverified battery-life figures that would boost this month\'s sales. Editor P argues: "Once buyers find that real battery life falls short of our table, cancelled subscriptions and wasted purchases will outweigh this month\'s extra sales." Editor Q argues: "Printing figures we know are unverified deceives readers and uses them merely as instruments to lift circulation, which is wrong even if nobody ever checks our table." How does the text classify P\'s and Q\'s arguments?',
      options: [
        { text: 'Both P and Q rely on act-consequentialist reasoning, because both editors reach the exact same vote against publishing the table.', why: 'The fourth paragraph stresses that reaching the same outward decision does not mean sharing the same ethical reasoning.' },
        { text: 'Both P and Q rely on deontological reasoning, because both editors oppose boosting the magazine\'s own sales.', why: 'Editor P opposes publication by weighing long-run net outcomes across buyers and subscriptions, which is consequentialist reasoning.' },
        { text: 'P relies on deontological reasoning about reader trust, whereas Q relies on act-consequentialist reasoning about circulation.', why: 'P weighs total future harms against short-term sales (consequentialism), whereas Q invokes an unconditional duty not to deceive or use readers merely as means (deontology).' },
        { text: 'They reach the same outward decision from opposite frameworks: P argues on act-consequentialist grounds and Q on deontological grounds.', correct: true, why: 'P compares net long-run consequences, while Q appeals to a constraint against deception and using readers merely as a means regardless of detection.' },
      ],
      explanation: 'Both editors vote the same way, illustrating the fourth paragraph\'s point that outward verdicts can agree while reasons differ. Editor P weighs future harms (wasted purchases, lost subscriptions) against immediate sales gains — act-consequentialist reasoning. Editor Q appeals to a duty not to deceive and not to treat readers merely as a means, explicitly independent of consequences — deontological reasoning.',
    },
  ],
};
