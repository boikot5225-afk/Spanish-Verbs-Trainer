import { examplesFor } from './examples';
import { generateOptions, shuffle } from './verbs';
import {
  PERSONS,
  speechText,
  type Person,
  type QuizMode,
  type QuizQuestion,
  type Tense,
  type Verb,
} from './types';

export type ContextQuizMode = Extract<
  QuizMode,
  'fill-blank' | 'error-correction' | 'contrast' | 'word-order'
>;

const CONTEXTUAL_MODES = new Set<QuizMode>([
  'fill-blank',
  'error-correction',
  'contrast',
  'word-order',
]);

interface QuestionContext {
  solution: string;
  translation?: string;
}

function replaceFirstForm(sentence: string, form: string, replacement: string): string | null {
  const normalizeApostrophe = (value: string) => value.replace(/[’‘`]/gu, "'").toLowerCase();
  const source = normalizeApostrophe(sentence);
  const target = normalizeApostrophe(form);
  const at = source.indexOf(target);
  if (at < 0) return null;
  return sentence.slice(0, at) + replacement + sentence.slice(at + form.length);
}

function exactContext(
  verbId: string,
  tense: Tense,
  person: Person,
  correctAnswer: string,
): QuestionContext {
  const example = examplesFor(verbId, tense).find(item => item.person === person);
  if (example) return { solution: example.fr, translation: example.ru };

  return { solution: speechText(person, tense, correctAnswer) };
}

function blankContext(context: QuestionContext, correctAnswer: string): string {
  return replaceFirstForm(context.solution, correctAnswer, '___')
    ?? context.solution.replace(correctAnswer, '___')
    ?? '___';
}

function wrongForm(
  verb: Verb,
  tense: Tense,
  person: Person,
  correctAnswer: string,
): string {
  const personIndex = PERSONS.indexOf(person);
  const options = generateOptions(verb.id, tense, personIndex, correctAnswer)
    .filter(option => option !== correctAnswer);
  return options[0] ?? correctAnswer;
}

function contrastOptions(
  verb: Verb,
  tense: Tense,
  person: Person,
  correctAnswer: string,
  selectedTenses: Tense[],
): string[] {
  const personIndex = PERSONS.indexOf(person);
  const alternativeTenses = shuffle(selectedTenses.filter(item => item !== tense));

  for (const alternativeTense of alternativeTenses) {
    const alternative = verb.conjugations[alternativeTense]?.[personIndex];
    if (alternative && !alternative.absent && alternative.form !== correctAnswer) {
      return shuffle([correctAnswer, alternative.form]);
    }
  }

  const generated = generateOptions(verb.id, tense, personIndex, correctAnswer)
    .filter(option => option !== correctAnswer);
  return shuffle([correctAnswer, generated[0] ?? correctAnswer]);
}

function shuffledTokens(sentence: string): string[] {
  const original = sentence.trim().split(/\s+/u).filter(Boolean);
  if (original.length <= 1) return original;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = shuffle(original);
    if (candidate.join(' ') !== original.join(' ')) return candidate;
  }

  return [...original].reverse();
}

/**
 * Превращает обычную карточку спряжения в один из контекстных типов задания.
 * Базовые режимы остаются без изменений.
 */
export function buildExerciseQuestion(
  base: QuizQuestion,
  mode: QuizMode,
  selectedTenses: Tense[],
  verb: Verb,
): QuizQuestion {
  if (!CONTEXTUAL_MODES.has(mode)) return base;

  const context = exactContext(base.verbId, base.tense, base.person, base.correctAnswer);

  if (mode === 'fill-blank') {
    return {
      ...base,
      context: blankContext(context, base.correctAnswer),
      contextTranslation: context.translation,
      solutionText: context.solution,
    };
  }

  if (mode === 'error-correction') {
    const wrong = wrongForm(verb, base.tense, base.person, base.correctAnswer);
    const broken = replaceFirstForm(context.solution, base.correctAnswer, wrong)
      ?? speechText(base.person, base.tense, wrong);
    return {
      ...base,
      context: broken,
      contextTranslation: context.translation,
      solutionText: context.solution,
      wrongAnswer: wrong,
    };
  }

  if (mode === 'contrast') {
    return {
      ...base,
      context: blankContext(context, base.correctAnswer),
      contextTranslation: context.translation,
      solutionText: context.solution,
      options: contrastOptions(
        verb,
        base.tense,
        base.person,
        base.correctAnswer,
        selectedTenses,
      ),
    };
  }

  // Порядок слов проверяет уже всё предложение, а не одну словоформу.
  return {
    ...base,
    correctAnswer: context.solution,
    contextTranslation: context.translation,
    solutionText: context.solution,
    tokens: shuffledTokens(context.solution),
  };
}
