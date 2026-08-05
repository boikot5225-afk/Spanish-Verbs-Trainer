import type { ConjugationForm, Person, Tense, Verb } from './types';
import { IMPERATIVE_TENSES, PERSONS } from './types';
import metadata from './verbs.metadata.json';
import { conjugateMetadata, type VerbMetadata } from './conjugator';

const REFLEXIVE = ['me', 'te', 'se', 'nous', 'vous', 'se'] as const;
const REFLEXIVE_IMPERATIVE = ['', 'toi', '', 'nous', 'vous', ''] as const;

function normalizeMetadata(entry: VerbMetadata): VerbMetadata | null {
  // В современном французском souvenir употребляется как местоименный
  // se souvenir. Отдельная словарная статья создавала дубликат с неверным
  // значением и вспомогательным avoir.
  if (entry.id === 'souvenir') return null;

  // asservir — правильный глагол второй группы: nous asservissons.
  if (entry.id === 'asservir') return { ...entry, group: '2' };

  // strip_pron() в генераторе превращал s'enfuir в enfuir, но список
  // исключений содержал полную форму и ошибочно относил глагол ко 2-й группе.
  if (entry.id === "s'enfuir") {
    return { ...entry, group: '3', aux: 'etre', pronominal: true };
  }

  return entry;
}

function prefixLastWord(form: string, prefix: string): string {
  const separator = form.lastIndexOf(' ');
  if (separator < 0) return `${prefix}${form}`;
  return `${form.slice(0, separator + 1)}${prefix}${form.slice(separator + 1)}`;
}

function applyPronominalForm(tense: Tense, form: string, personIndex: number): string {
  if (IMPERATIVE_TENSES.has(tense)) {
    const suffix = REFLEXIVE_IMPERATIVE[personIndex]!;
    if (!suffix) return form;

    // В impératif passé местоимение ставится после вспомогательного:
    // sois-toi lavé, soyons-nous lavés, а не «sois lavé-toi».
    if (tense === 'imperatifPasse') {
      const separator = form.indexOf(' ');
      if (separator > 0) {
        return `${form.slice(0, separator)}-${suffix}${form.slice(separator)}`;
      }
    }
    return `${form}-${suffix}`;
  }

  const pronoun = REFLEXIVE[personIndex]!;
  const elides = pronoun.length === 2 && /^[aeiouyàâéèêëîïôûùüh]/iu.test(form);
  return elides ? `${pronoun[0]}'${form}` : `${pronoun} ${form}`;
}

/**
 * s'enfuir наследует всю парадигму fuir, но с приставкой en- и возвратным
 * местоимением. Общий генератор семейств пока не умеет наследовать
 * неправильность через приставку, поэтому собираем эту статью явно.
 */
function conjugateSenfuir(entry: VerbMetadata): Verb {
  const base = conjugateMetadata({
    ...entry,
    infinitive: 'fuir',
    group: '3',
    aux: 'etre',
    pronominal: false,
  });

  const conjugations = {} as Record<Tense, ConjugationForm[]>;
  for (const [tense, forms] of Object.entries(base.conjugations) as Array<
    [Tense, ConjugationForm[]]
  >) {
    conjugations[tense] = forms.map((item, personIndex) => {
      if (item.absent) return item;
      const prefixed = prefixLastWord(item.form, 'en');
      return {
        ...item,
        form: applyPronominalForm(tense, prefixed, personIndex),
        irregular: true,
      };
    });
  }

  return {
    ...base,
    id: entry.id,
    infinitive: entry.infinitive,
    translation: entry.translation,
    group: '3',
    aux: 'etre',
    pronominal: true,
    types: Array.from(new Set([...entry.types, '-fuir'])),
    conjugations,
    participePresent: { form: "s'enfuyant", irregular: true },
    participePasse: { form: 'enfui', irregular: true },
  };
}

function fixPronominalForms(verb: Verb): Verb {
  if (!verb.pronominal) return verb;

  const imperativePast = verb.conjugations.imperatifPasse.map((item, personIndex) => {
    if (item.absent) return item;
    const suffix = REFLEXIVE_IMPERATIVE[personIndex]!;
    if (!suffix || !item.form.endsWith(`-${suffix}`)) return item;

    const withoutSuffix = item.form.slice(0, -suffix.length - 1);
    const separator = withoutSuffix.indexOf(' ');
    if (separator <= 0) return item;

    return {
      ...item,
      form: `${withoutSuffix.slice(0, separator)}-${suffix}${withoutSuffix.slice(separator)}`,
    };
  });

  const participle = verb.participePresent.form;
  const pronominalParticiple = /^[aeiouyàâéèêëîïôûùüh]/iu.test(participle)
    ? `s'${participle}`
    : `se ${participle}`;

  return {
    ...verb,
    conjugations: { ...verb.conjugations, imperatifPasse: imperativePast },
    participePresent: { ...verb.participePresent, form: pronominalParticiple },
  };
}

export const VERBS: Verb[] = (metadata as VerbMetadata[]).flatMap(entry => {
  const normalized = normalizeMetadata(entry);
  if (!normalized) return [];

  const verb = normalized.id === "s'enfuir"
    ? conjugateSenfuir(normalized)
    : conjugateMetadata(normalized);
  return [fixPronominalForms(verb)];
});

const VERB_BY_ID = new Map(VERBS.map(verb => [verb.id, verb]));

export function getVerbById(id: string): Verb | undefined {
  return VERB_BY_ID.get(id);
}

/** Приводит строку к виду без регистра и диакритики: «être» → «etre». */
export function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

interface SearchEntry {
  verb: Verb;
  infinitive: string;
  translation: string;
}

// Индекс строится один раз при загрузке, чтобы при каждом нажатии клавиши
// не нормализовать всю базу инфинитивов и переводов заново.
const SEARCH_INDEX: SearchEntry[] = VERBS.map(verb => ({
  verb,
  infinitive: normalizeSearch(verb.infinitive),
  translation: normalizeSearch(verb.translation),
}));

// Чем меньше ранг, тем выше результат в списке.
const RANK_EXACT = 0;
const RANK_INFINITIVE_PREFIX = 1;
const RANK_INFINITIVE_PART = 2;
const RANK_TRANSLATION_WORD = 3;
const RANK_TRANSLATION_PART = 4;

function rankEntry(entry: SearchEntry, query: string): number | null {
  if (entry.infinitive === query) return RANK_EXACT;
  if (entry.infinitive.startsWith(query)) return RANK_INFINITIVE_PREFIX;
  if (entry.infinitive.includes(query)) return RANK_INFINITIVE_PART;
  if (entry.translation.startsWith(query) || entry.translation.includes(` ${query}`)) {
    return RANK_TRANSLATION_WORD;
  }
  if (entry.translation.includes(query)) return RANK_TRANSLATION_PART;
  return null;
}

export function searchVerbs(query: string): Verb[] {
  const normalized = normalizeSearch(query);
  if (!normalized) return VERBS;

  const matches: Array<{ verb: Verb; rank: number; infinitive: string }> = [];
  for (const entry of SEARCH_INDEX) {
    const rank = rankEntry(entry, normalized);
    if (rank !== null) matches.push({ verb: entry.verb, rank, infinitive: entry.infinitive });
  }

  matches.sort((left, right) =>
    left.rank !== right.rank ? left.rank - right.rank : left.infinitive.localeCompare(right.infinitive, 'fr'),
  );
  return matches.map(match => match.verb);
}

export function countAvailableQuestions(
  verbIds: string[] | 'all',
  tenses: Tense[],
  persons: Person[],
): number {
  const selected = verbIds === 'all'
    ? VERBS
    : verbIds.map(id => VERB_BY_ID.get(id)).filter((verb): verb is Verb => verb !== undefined);

  let count = 0;
  for (const verb of selected) {
    for (const tense of tenses) {
      for (const person of persons) {
        const personIndex = PERSONS.indexOf(person);
        const form = personIndex >= 0 ? verb.conjugations[tense]?.[personIndex] : undefined;
        if (form && !form.absent) count += 1;
      }
    }
  }
  return count;
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other]!, copy[index]!];
  }
  return copy;
}

export function generateOptions(
  verbId: string,
  tense: Tense,
  personIdx: number,
  correct: string,
): string[] {
  const verb = getVerbById(verbId);
  if (!verb) return [correct];

  const distractors = new Set<string>();
  PERSONS.forEach((_, index) => {
    if (index !== personIdx) {
      const form = verb.conjugations[tense][index];
      if (form && !form.absent && form.form !== correct) distractors.add(form.form);
    }
  });

  const maxAttempts = Math.min(VERBS.length * 2, 500);
  let attempts = 0;
  while (distractors.size < 3 && attempts < maxAttempts) {
    attempts += 1;
    const candidate = VERBS[Math.floor(Math.random() * VERBS.length)];
    if (!candidate || candidate.id === verbId) continue;
    const form = candidate.conjugations[tense]?.[personIdx];
    if (form && !form.absent && form.form !== correct) distractors.add(form.form);
  }

  return shuffle([...Array.from(distractors).slice(0, 3), correct]);
}

export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/gu, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '');
}
