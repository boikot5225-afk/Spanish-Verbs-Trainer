import type { Tense, Verb } from './types';
import { PERSONS } from './types';
import metadata from './verbs.metadata.json';
import { conjugateMetadata, type VerbMetadata } from './conjugator';

// Базовый словарь почти не содержит местоименных инфинитивов, хотя они нужны
// и в справочнике, и в уже существующем уроке о возвратных глаголах.
const REFLEXIVE_METADATA: VerbMetadata[] = [
  { id: 'acostarse', infinitive: 'acostarse', translation: 'ложиться спать', group: 'irregular', types: ['o to ue'] },
  { id: 'despertarse', infinitive: 'despertarse', translation: 'просыпаться', group: 'irregular', types: ['i before e'] },
  { id: 'dormirse', infinitive: 'dormirse', translation: 'засыпать', group: 'irregular', types: ['o to ue', 'o to u preterite'] },
  { id: 'ducharse', infinitive: 'ducharse', translation: 'принимать душ', group: 'ar', types: [] },
  { id: 'irse', infinitive: 'irse', translation: 'уходить / уезжать', group: 'irregular', types: ['ir'] },
  { id: 'levantarse', infinitive: 'levantarse', translation: 'вставать / подниматься', group: 'ar', types: [] },
  { id: 'llamarse', infinitive: 'llamarse', translation: 'называться / зваться', group: 'ar', types: [] },
  { id: 'ponerse', infinitive: 'ponerse', translation: 'надевать / становиться', group: 'irregular', types: ['poner', 'add g', 'd future'] },
  { id: 'sentarse', infinitive: 'sentarse', translation: 'садиться', group: 'irregular', types: ['i before e'] },
  { id: 'sentirse', infinitive: 'sentirse', translation: 'чувствовать себя', group: 'irregular', types: ['i before e', 'e to i preterite'] },
  { id: 'vestirse', infinitive: 'vestirse', translation: 'одеваться', group: 'irregular', types: ['e to i'] },
];

export const VERBS: Verb[] = [
  ...(metadata as VerbMetadata[]),
  ...REFLEXIVE_METADATA,
].map(conjugateMetadata);

const VERB_BY_ID = new Map(VERBS.map(verb => [verb.id, verb]));

export function getVerbById(id: string): Verb | undefined {
  return VERB_BY_ID.get(id);
}

/** Приводит строку к виду без регистра и диакритики: «gruñir» → «grunir», «Está» → «esta». */
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

// Индекс строится один раз при загрузке, чтобы на каждое нажатие клавиши
// не нормализовать весь словарь инфинитивов и переводов заново.
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
    left.rank !== right.rank ? left.rank - right.rank : left.infinitive.localeCompare(right.infinitive, 'es'),
  );
  return matches.map(match => match.verb);
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
