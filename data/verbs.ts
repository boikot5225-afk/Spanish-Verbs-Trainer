import type { Tense, Verb } from './types';
import { PERSONS } from './types';
import metadata from './verbs.metadata.json';
import { conjugateMetadata, type VerbMetadata } from './conjugator';

export const VERBS: Verb[] = (metadata as VerbMetadata[]).map(conjugateMetadata);

const VERB_BY_ID = new Map(VERBS.map(verb => [verb.id, verb]));

export function getVerbById(id: string): Verb | undefined {
  return VERB_BY_ID.get(id);
}

export function searchVerbs(query: string): Verb[] {
  const q = query.toLocaleLowerCase('es').trim();
  if (!q) return VERBS;
  return VERBS.filter(
    verb =>
      verb.infinitive.toLocaleLowerCase('es').includes(q) ||
      verb.translation.toLocaleLowerCase().includes(q),
  );
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
    .replace(/[̀-ͯ]/gu, '');
}
