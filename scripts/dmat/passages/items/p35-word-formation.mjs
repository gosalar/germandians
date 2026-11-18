// Full mock 3, passage 9. Area: humanities. Subject: morphology and word formation. Text only.
import { p } from '../lib.mjs';

export default {
  id: 'p35',
  set: 'mock',
  mock: 3,
  area: 'humanities',
  title: 'Morphology and Word Formation',
  facts: [
    { claim: 'Morphology studies how words are built; a morpheme is the smallest systematic pairing of form (sound or sign) and meaning or grammatical function.', source: 'https://socialsci.libretexts.org/Bookshelves/Linguistics/Essentials_of_Linguistics_2e_(Anderson_et_al.)/05%3A_Morphology/5.01%3A_What_is_morphology', read: '2026-11-18' },
    { claim: 'Free morphemes can stand alone as words, whereas bound morphemes must attach to another morpheme; affixes (prefixes before a base, suffixes after a base, infixes inside another morpheme) are always bound, while roots are the smallest indivisible bases and are mostly free in English though some roots are bound.', source: 'https://socialsci.libretexts.org/Bookshelves/Linguistics/Essentials_of_Linguistics_2e_(Anderson_et_al.)/05%3A_Morphology/5.02%3A_Roots_bases_and_affixes', read: '2026-11-18' },
    { claim: 'Derivational affixes create new words, select the lexical category of their base, and often change lexical category (whereas English prefixes do not change category); because affixes attach to the outer edge of a base of the selected category, attachment order is constrained.', source: 'https://socialsci.libretexts.org/Bookshelves/Linguistics/Essentials_of_Linguistics_2e_(Anderson_et_al.)/05%3A_Morphology/5.06%3A_Derivational_morphology', read: '2026-11-18' },
    { claim: 'Inflectional morphology expresses grammatical information required by a language (such as plural number, tense or person agreement) and never changes the lexical category of its base.', source: 'https://socialsci.libretexts.org/Bookshelves/Linguistics/Essentials_of_Linguistics_2e_(Anderson_et_al.)/05%3A_Morphology/5.07%3A_Inflectional_morphology', read: '2026-11-18' },
    { claim: 'Compounding builds words by combining two or more roots (written solid, hyphenated or with spaces in English); endocentric compounds have a head (on the right in English) determining category and core meaning, whereas exocentric compounds lack an internal semantic head.', source: 'https://socialsci.libretexts.org/Bookshelves/Linguistics/Essentials_of_Linguistics_2e_(Anderson_et_al.)/05%3A_Morphology/5.08%3A_Compounding', read: '2026-11-18' },
  ],
  blocks: [
    p(
      'In linguistics, morphology studies the internal structure of words and how words are built.',
      'Although a word can stand on its own as an utterance, many words contain smaller meaningful parts.',
      'A morpheme is the smallest systematic pairing of a form (a spoken sound or sign) with a meaning or grammatical function.',
      'The English word "cats" contains two morphemes: "cat", naming the animal, and "-s", marking plural number.',
    ),
    p(
      'A free morpheme can stand alone as a word, such as "cat", "kind" or "teach", whereas a bound morpheme appears only when attached to another morpheme.',
      'The indivisible core morpheme of a word is its root, while any unit to which another morpheme attaches — a bare root or one already carrying other pieces — is a base.',
      'Bound morphemes that attach to a base are affixes: a prefix precedes its base ("un-" in "unkind"), a suffix follows it ("-ness" in "kindness"), and an infix is inserted inside a root.',
      'A suffix sitting between a root and a later suffix, like "-y" in "unluckiness", remains a suffix rather than an infix.',
      'Every affix is bound, though not every bound morpheme is an affix: English has bound roots such as "-whelm" in "overwhelm", and in several languages most verb roots are bound.',
    ),
    p(
      'Derivational affixes build new words and select the word category (such as noun, verb or adjective) of their base.',
      'Derivational suffixes often change category — "-ness" turns adjectives into nouns, and "-ly" turns adjectives into adverbs — whereas English derivational prefixes alter meaning without changing category.',
      'Because each affix attaches to the outer edge of a base of the category it selects, order is fixed: in "foolishly", "-ish" first turns the noun "fool" into an adjective so "-ly" has an adjective base.',
      'Inflectional affixes, by contrast, never change the word category of their base or coin a new word; they mark grammatical properties required by a sentence, such as plural "-s" or past-tense "-ed".',
    ),
    p(
      'Compounding joins two or more roots rather than a root and an affix.',
      'English spells compounds solid ("sunflower"), hyphenated ("kind-hearted") or with a space ("bus stop"), so linguists identify them by stress and syntax rather than spaces.',
      'Most English compounds are endocentric: their rightmost member is the head, fixing both word category and the kind of thing meant, so a "bluebird" is a kind of bird.',
      'Exocentric compounds lack this internal semantic head: a "spoilsport" is a person who ruins fun, not a kind of sport.',
    ),
  ],
  questions: [
    {
      type: 'R', level: 1,
      stem: 'According to the text, what distinguishes an inflectional affix from a derivational affix?',
      options: [
        { text: 'An inflectional affix can stand alone as a word, whereas a derivational affix is always bound.', why: 'All affixes attach to a base and are bound morphemes; neither inflectional nor derivational affixes stand alone.' },
        { text: 'An inflectional affix always precedes its base, whereas a derivational affix always follows it.', why: 'Preceding or following a base distinguishes prefixes from suffixes; English inflectional affixes such as "-s" and "-ed" are suffixes.' },
        { text: 'An inflectional affix expresses grammatical information and never changes the word category of its base.', correct: true, why: 'This is the contrast stated at the end of the third paragraph.' },
        { text: 'An inflectional affix joins two roots together, whereas a derivational affix attaches to one root.', why: 'Joining two or more roots together is compounding, not inflection.' },
      ],
      explanation: 'The third paragraph states that inflectional affixes express grammatical properties required by a sentence (such as plural number or past tense) and never change the word category of their base or coin a new word.',
    },
    {
      type: 'C', level: 1,
      stem: 'In which of the following English words is the named suffix an inflectional affix rather than a derivational affix?',
      options: [
        { text: 'The suffix "-ness" in "sharpness", formed from the adjective "sharp".', why: '"-ness" turns the adjective "sharp" into a noun, changing word category: a derivational suffix.' },
        { text: 'The suffix "-ish" in "childish", formed from the noun "child".', why: '"-ish" turns the noun "child" into an adjective, coining a new word of a different category: a derivational suffix.' },
        { text: 'The suffix "-er" in "teacher", formed from the verb "teach" to name a person.', why: '"-er" turns the verb "teach" into an agent noun, changing category and core meaning: a derivational suffix.' },
        { text: 'The suffix "-ed" in "painted", formed from the verb "paint" to mark past tense.', correct: true, why: 'Past-tense "-ed" adds grammatical tense while leaving "paint" a verb: an inflectional suffix.' },
      ],
      explanation: 'Inflectional affixes mark grammatical properties without changing word category. Past-tense "-ed" keeps the verb "paint" a verb, whereas "-ness", "-ish" and agentive "-er" each create a word of a new category.',
    },
    {
      type: 'C', level: 2,
      stem: 'Following the text\'s account of compounding, which of these English words is an exocentric compound?',
      options: [
        { text: '"Pickpocket", naming a thief who steals valuables from people\'s pockets, built from "pick" and "pocket".', correct: true, why: 'It joins two roots ("pick" and "pocket"), yet the whole word denotes a person rather than a subtype of its right-hand member "pocket".' },
        { text: '"Bookshelf", naming a wooden or metal shelf made for holding books, built from "book" and "shelf".', why: 'A bookshelf is a kind of shelf, so its right-hand member serves as its semantic and category head: an endocentric compound.' },
        { text: '"Greenhouse", naming a heated glass house used for growing plants, built from "green" and "house".', why: 'Although not green in colour, a greenhouse is still a kind of house (structure), so its right-hand member heads an endocentric compound.' },
        { text: '"Helpfulness", naming the personal quality of being helpful, built from "help", "-ful" and "-ness".', why: '"Helpfulness" contains one root ("help") and two derivational suffixes, so it is a derived word rather than a compound.' },
      ],
      explanation: 'A compound combines two or more roots, and it is exocentric when it lacks an internal semantic head — that is, when it does not name a subtype of its right-hand member. "Pickpocket" names a thief, not a pocket; "bookshelf" and "greenhouse" are endocentric, and "helpfulness" is formed by derivation, not compounding.',
    },
    {
      type: 'S', level: 2,
      stem: 'Which statement follows from the principles of morphological structure described in the text?',
      options: [
        { text: 'Any affix standing between a root and a later suffix inside a word, like "-ful" in "carefulness", is an infix.', why: '"-ful" attaches after the root "care" and is followed by "-ness", so it remains a suffix; an infix must be inserted inside a single root.' },
        { text: 'Every affix is a bound morpheme, whereas not every bound morpheme in a language is an affix.', correct: true, why: 'All affixes must attach to a base, while bound roots (such as "-whelm" in "overwhelm") are also bound without being affixes.' },
        { text: 'Two roots separated by a space in English spelling, such as "bus stop", cannot form a compound word.', why: 'The fourth paragraph notes that English spells some compounds with spaces, so spaces alone do not rule out compounding.' },
        { text: 'Derivational prefixes in English regularly change the word category of the base they attach to.', why: 'The third paragraph states the opposite: derivational prefixes in English alter meaning without changing the base\'s word category.' },
      ],
      explanation: 'The second paragraph explicitly distinguishes bound roots from affixes: every affix is bound because it must attach to a base, whereas bound roots (like "-whelm" in "overwhelm") are bound morphemes that are roots rather than affixes.',
    },
    {
      type: 'D', level: 2,
      stem: 'The two English noun roots "boat" and "house" form two endocentric compounds: "houseboat" and "boathouse". Under the headedness rule in the text, what changes when the order of the roots is reversed from "houseboat" to "boathouse"?',
      options: [
        { text: 'The word category shifts from a noun to an adjective, while the word still refers to a kind of boat.', why: 'Both roots are nouns, so the right-hand member remains a noun in both orders, and the head shifts from "boat" to "house".' },
        { text: 'Neither category nor core meaning changes, because an endocentric compound weights both roots equally.', why: 'In English endocentric compounds only the rightmost member is the head; the left member modifies it.' },
        { text: 'The word ceases to be a compound and becomes an inflected plural or tense form of the root "boat".', why: 'Reversing two roots still combines two roots, which is compounding rather than inflection.' },
        { text: 'The word category stays a noun, while the core meaning shifts from a kind of boat to a kind of house.', correct: true, why: 'The rightmost root is the head in English: "boat" heads "houseboat" (a boat for living in), whereas "house" heads "boathouse" (a shelter for boats).' },
      ],
      explanation: 'In English endocentric compounds the head stands on the right and determines both word category and the kind of thing meant. Both "boat" and "house" are nouns, so both compounds are nouns, while reversing their order shifts the head — and thus the kind of object named — from a kind of boat ("houseboat") to a kind of house ("boathouse").',
    },
    {
      type: 'T', level: 3,
      stem: 'In English, the derivational prefix "re-" ("again") selects only verbs and forms verbs, while the derivational suffix "-able" selects only verbs and forms adjectives. Starting from the verb root "build", in what order must the pieces combine to build the adjective "rebuildable", and why?',
      options: [
        { text: '"-able" attaches to "build" first to form the adjective "buildable", and "re-" then attaches to that adjective.', why: 'Once "-able" turns "build" into the adjective "buildable", "re-" can no longer attach because "re-" selects only verbs.' },
        { text: 'Either order works, because a prefix and a suffix attach to opposite edges of the root without interacting.', why: 'Each affix selects the category of the entire base it attaches to, so changing the base from a verb to an adjective blocks "re-".' },
        { text: '"re-" attaches to "build" first to form the verb "rebuild", since "-able" first would yield an adjective "re-" cannot take.', correct: true, why: 'Attaching "re-" to the verb "build" yields the verb base "rebuild", which still satisfies "-able"\'s requirement for a verb base.' },
        { text: '"re-" and "-able" first join each other into a single affix, which then attaches to the verb root "build" at once.', why: '"re-" and "-able" are independent derivational affixes that occur separately (as in "rebuild" and "buildable"), each attaching step by step.' },
      ],
      explanation: 'Each derivational affix attaches to a base of the category it selects. Starting from the verb "build", attaching "re-" first produces the verb "rebuild", and "-able" can then select that verb base to produce the adjective "rebuildable". In the reverse order, "-able" would first turn "build" into the adjective "buildable", leaving an adjective base to which verb-selecting "re-" cannot attach.',
    },
  ],
};
