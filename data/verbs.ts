import type { Tense, Verb } from './types';
import { PERSONS, TENSES } from './types';
import metadata from './verbs.metadata.json';
import { conjugateMetadata, type VerbMetadata } from './conjugator';

export const VERBS: Verb[] = (metadata as VerbMetadata[]).map(conjugateMetadata);

const VERB_BY_ID = new Map(VERBS.map(verb => [verb.id, verb]));

export function getVerbById(id: string): Verb | undefined {
  return VERB_BY_ID.get(id);
}

export type VerbSearchMatchType = 'infinitive' | 'translation' | 'form' | 'fuzzy';

export interface VerbSearchResult {
  verb: Verb;
  matchType: VerbSearchMatchType;
  matchedForm?: string;
  score: number;
}

interface SearchDocument {
  verb: Verb;
  infinitive: string;
  translation: string;
  translationWords: string[];
  forms: Array<{ normalized: string; original: string }>;
}

let searchDocuments: SearchDocument[] | null = null;

export function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zа-яёñü\s-]/giu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSearchDocuments(): SearchDocument[] {
  if (searchDocuments) return searchDocuments;
  searchDocuments = VERBS.map(verb => {
    const formMap = new Map<string, string>();
    for (const tense of TENSES) {
      for (const form of verb.conjugations[tense]) {
        if (form.available === false || form.form === '—') continue;
        const normalized = normalizeSearchText(form.form);
        if (normalized && !formMap.has(normalized)) formMap.set(normalized, form.form);
        for (const alias of form.aliases ?? []) {
          const normalizedAlias = normalizeSearchText(alias);
          if (normalizedAlias && !formMap.has(normalizedAlias)) formMap.set(normalizedAlias, alias);
        }
      }
    }
    const translation = normalizeSearchText(verb.translation);
    return {
      verb,
      infinitive: normalizeSearchText(verb.infinitive),
      translation,
      translationWords: translation.split(/[\s,;/()]+/u).filter(Boolean),
      forms: Array.from(formMap, ([normalized, original]) => ({ normalized, original })),
    };
  });
  return searchDocuments;
}

function levenshteinDistance(left: string, right: string, limit: number): number {
  if (Math.abs(left.length - right.length) > limit) return limit + 1;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    const current = [row];
    let rowMinimum = current[0]!;
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      const value = Math.min(
        previous[column]! + 1,
        current[column - 1]! + 1,
        previous[column - 1]! + cost,
      );
      current[column] = value;
      rowMinimum = Math.min(rowMinimum, value);
    }
    if (rowMinimum > limit) return limit + 1;
    previous = current;
  }
  return previous[right.length]!;
}

function findBestFormMatch(
  forms: SearchDocument['forms'],
  query: string,
): { score: number; matchedForm?: string } | null {
  let best: { score: number; matchedForm?: string } | null = null;
  for (const form of forms) {
    let score: number | null = null;
    if (form.normalized === query) score = 2;
    else if (form.normalized.startsWith(query)) score = 14;
    else if (query.length >= 3 && form.normalized.includes(query)) score = 48;
    if (score !== null && (!best || score < best.score)) {
      best = { score, matchedForm: form.original };
      if (score === 2) break;
    }
  }
  return best;
}

export function searchVerbResults(query: string): VerbSearchResult[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return VERBS.map(verb => ({ verb, matchType: 'infinitive', score: 0 }));
  }

  const direct: VerbSearchResult[] = [];
  const fuzzy: VerbSearchResult[] = [];

  for (const document of buildSearchDocuments()) {
    let result: VerbSearchResult | null = null;

    if (document.infinitive === normalizedQuery) {
      result = { verb: document.verb, matchType: 'infinitive', score: 0 };
    } else {
      const formMatch = findBestFormMatch(document.forms, normalizedQuery);
      if (formMatch?.score === 2) {
        result = {
          verb: document.verb,
          matchType: 'form',
          matchedForm: formMatch.matchedForm,
          score: formMatch.score,
        };
      } else if (document.infinitive.startsWith(normalizedQuery)) {
        result = { verb: document.verb, matchType: 'infinitive', score: 8 };
      } else if (
        document.translation === normalizedQuery ||
        document.translationWords.includes(normalizedQuery)
      ) {
        result = { verb: document.verb, matchType: 'translation', score: 10 };
      } else if (document.translationWords.some(word => word.startsWith(normalizedQuery))) {
        result = { verb: document.verb, matchType: 'translation', score: 18 };
      } else if (formMatch) {
        result = {
          verb: document.verb,
          matchType: 'form',
          matchedForm: formMatch.matchedForm,
          score: formMatch.score,
        };
      } else if (document.infinitive.includes(normalizedQuery)) {
        result = { verb: document.verb, matchType: 'infinitive', score: 38 };
      } else if (document.translation.includes(normalizedQuery)) {
        result = { verb: document.verb, matchType: 'translation', score: 42 };
      }
    }

    if (result) {
      direct.push(result);
      continue;
    }

    if (normalizedQuery.length >= 4 && !normalizedQuery.includes(' ')) {
      const maxDistance = normalizedQuery.length >= 8 ? 2 : 1;
      const distance = levenshteinDistance(document.infinitive, normalizedQuery, maxDistance);
      if (distance <= maxDistance) {
        fuzzy.push({
          verb: document.verb,
          matchType: 'fuzzy',
          score: 70 + distance,
        });
      }
    }
  }

  const results = direct.length ? direct : fuzzy;
  return results.sort((left, right) => {
    if (left.score !== right.score) return left.score - right.score;
    return left.verb.infinitive.localeCompare(right.verb.infinitive, 'es');
  });
}

export function searchVerbs(query: string): Verb[] {
  return searchVerbResults(query).map(result => result.verb);
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
      const candidate = verb.conjugations[tense][index];
      if (candidate?.available !== false && candidate?.form && candidate.form !== '—' && candidate.form !== correct) {
        distractors.add(candidate.form);
      }
    }
  });

  const maxAttempts = Math.min(VERBS.length * 2, 500);
  let attempts = 0;
  while (distractors.size < 3 && attempts < maxAttempts) {
    attempts += 1;
    const candidateVerb = VERBS[Math.floor(Math.random() * VERBS.length)];
    if (!candidateVerb || candidateVerb.id === verbId) continue;
    const candidate = candidateVerb.conjugations[tense]?.[personIdx];
    if (candidate?.available !== false && candidate?.form && candidate.form !== '—' && candidate.form !== correct) {
      distractors.add(candidate.form);
    }
  }

  return shuffle([...Array.from(distractors).slice(0, 3), correct]);
}

export function normalizeAnswer(value: string): string {
  return normalizeSearchText(value);
}
