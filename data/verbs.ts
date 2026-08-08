import type { NonFinite, Periphrasis, Tense, Verb } from './types';
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

// Возвратные дописаны в конец словаря, поэтому список надо упорядочить заново —
// иначе acostarse и irse встают в справочнике после zurcir. Ключ сортировки
// нормализован: у desoír иначе «í» уехал бы за «z».
export const VERBS: Verb[] = [...(metadata as VerbMetadata[]), ...REFLEXIVE_METADATA]
  .map(item => ({ verb: conjugateMetadata(item), key: normalizeSearch(item.infinitive) }))
  .sort((left, right) => (left.key < right.key ? -1 : left.key > right.key ? 1 : 0))
  .map(item => item.verb);

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

/**
 * То же, но знаки препинания превращаются в пробелы: «быть (характеристика)» →
 * «быть характеристика». Так поиск по отдельному слову перевода видит границу
 * слова и там, где стоит скобка, слэш или запятая.
 */
function normalizeWords(value: string): string {
  return normalizeSearch(value)
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

interface SearchEntry {
  verb: Verb;
  infinitive: string;
  translation: string;
  /** Первое значение без уточнения в скобках: «быть (характеристика)» → «быть». */
  head: string;
}

/** Головное значение перевода — до первого разделителя и до скобки с пояснением. */
function translationHead(value: string): string {
  const head = value.split(/[,;/(]/u)[0] ?? value;
  return normalizeWords(head);
}

// Индекс строится при первом поиске, а не при загрузке модуля: чтобы показать
// список глаголов, нормализовать две тысячи переводов не нужно. Порядок совпадает
// с VERBS, то есть алфавитный, — на этом держится раскладка по вёдрам ниже.
let searchIndex: SearchEntry[] | null = null;

function getSearchIndex(): SearchEntry[] {
  return (searchIndex ??= VERBS.map(verb => ({
    verb,
    infinitive: normalizeSearch(verb.infinitive),
    translation: normalizeWords(verb.translation),
    head: translationHead(verb.translation),
  })));
}

// Чем меньше ранг, тем выше результат в списке.
const RANK_EXACT = 0;
const RANK_INFINITIVE_PREFIX = 1;
const RANK_INFINITIVE_PART = 2;
// Без этого ранга запрос «быть» выдавал aficionar раньше ser: оба лишь содержат
// слово, а по алфавиту aficionar выше.
const RANK_TRANSLATION_HEAD = 3;
const RANK_TRANSLATION_WORD = 4;
const RANK_TRANSLATION_PART = 5;

function rankEntry(entry: SearchEntry, query: string): number | null {
  if (entry.infinitive === query) return RANK_EXACT;
  if (entry.infinitive.startsWith(query)) return RANK_INFINITIVE_PREFIX;
  if (entry.infinitive.includes(query)) return RANK_INFINITIVE_PART;
  if (entry.head === query) return RANK_TRANSLATION_HEAD;
  if (entry.translation.startsWith(query) || entry.translation.includes(` ${query}`)) {
    return RANK_TRANSLATION_WORD;
  }
  if (entry.translation.includes(query)) return RANK_TRANSLATION_PART;
  return null;
}

const RANK_COUNT = 6;

// Последний результат — чтобы «h» → «ha» → «hab» не перебирал весь словарь заново:
// продолжение запроса может совпасть только с тем, что уже совпало.
let lastQuery = '';
let lastMatches: SearchEntry[] = [];

export function searchVerbs(query: string): Verb[] {
  const normalized = normalizeSearch(query);
  if (!normalized) {
    lastQuery = '';
    lastMatches = [];
    return VERBS;
  }

  const scope =
    lastQuery && normalized.startsWith(lastQuery) ? lastMatches : getSearchIndex();

  // Рангов всего шесть, поэтому раскладываем по вёдрам за один проход вместо
  // сортировки: внутри ведра порядок остаётся алфавитным сам собой, потому что
  // индекс уже упорядочен. На Hermes это заодно убирает localeCompare с локалью —
  // на каждое нажатие клавиши он стоил тысячи вызовов в Intl.
  const buckets: SearchEntry[][] = Array.from({ length: RANK_COUNT }, () => []);
  const matched: SearchEntry[] = [];

  for (const entry of scope) {
    const rank = rankEntry(entry, normalized);
    if (rank === null) continue;
    buckets[rank]!.push(entry);
    matched.push(entry);
  }

  lastQuery = normalized;
  lastMatches = matched;

  const result: Verb[] = [];
  for (const bucket of buckets) {
    for (const entry of bucket) result.push(entry.verb);
  }
  return result;
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other]!, copy[index]!];
  }
  return copy;
}

/**
 * Варианты для пропуска. Первым делом — та же форма у глагола-соперника
 * (es против está), иначе выбор между ними не проверяется вовсе; остальное
 * добираем другими лицами правильного глагола.
 */
export function generateClozeOptions(
  verbId: string,
  rivalId: string,
  tense: Tense,
  personIndex: number,
  correct: string,
): string[] {
  const distractors = new Set<string>();

  const rival = getVerbById(rivalId)?.conjugations[tense]?.[personIndex];
  if (rival && !rival.absent && rival.form !== correct) distractors.add(rival.form);

  const verb = getVerbById(verbId);
  if (verb) {
    PERSONS.forEach((_, index) => {
      if (index === personIndex || distractors.size >= 3) return;
      const form = verb.conjugations[tense][index];
      if (form && !form.absent && form.form !== correct) distractors.add(form.form);
    });
  }

  return shuffle([...Array.from(distractors).slice(0, 3), correct]);
}

/**
 * Форма перифразы: вспомогательный глагол в нужном времени и лице плюс неличная
 * форма смыслового. Спрягается только вспомогательный — estoy comiendo,
 * estabas comiendo. Пусто, если у вспомогательного этой формы нет («yo» в императиве).
 */
export function periphrasisForm(
  periphrasis: Periphrasis,
  verb: Verb,
  tense: Tense,
  personIndex: number,
): string {
  const auxiliary = getVerbById(periphrasis.auxiliary);
  const auxForm = auxiliary?.conjugations[tense]?.[personIndex];
  if (!auxForm || auxForm.absent) return '';
  const nonFinite = verb[periphrasis.form].form;
  if (!nonFinite) return '';
  return `${auxForm.form} ${nonFinite}`;
}

/**
 * Отвлекающие варианты для перифразы: та же неличная форма, но вспомогательный
 * в других лицах — ошибка тут именно в нём, а не в герундии.
 */
export function generatePeriphrasisOptions(
  periphrasis: Periphrasis,
  verb: Verb,
  tense: Tense,
  personIndex: number,
  correct: string,
): string[] {
  const distractors = new Set<string>();
  PERSONS.forEach((_, index) => {
    if (index === personIndex) return;
    const value = periphrasisForm(periphrasis, verb, tense, index);
    if (value && value !== correct) distractors.add(value);
  });
  return shuffle([...Array.from(distractors).slice(0, 3), correct]);
}

/**
 * Отвлекающие варианты для неличной формы. Внутри одного глагола их взять негде —
 * форма ровно одна, лиц у неё нет, — поэтому берём ту же форму у других глаголов.
 */
export function generateNonFiniteOptions(
  verbId: string,
  form: NonFinite,
  correct: string,
): string[] {
  const distractors = new Set<string>();
  const maxAttempts = Math.min(VERBS.length * 2, 500);

  for (let attempt = 0; distractors.size < 3 && attempt < maxAttempts; attempt += 1) {
    const candidate = VERBS[Math.floor(Math.random() * VERBS.length)];
    if (!candidate || candidate.id === verbId) continue;
    const value = candidate[form].form;
    if (value && value !== correct) distractors.add(value);
  }

  return shuffle([...Array.from(distractors).slice(0, 3), correct]);
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
