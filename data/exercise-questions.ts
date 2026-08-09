import { examplesFor } from './examples';
import { generateOptions, getVerbById, shuffle } from './verbs';
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

const THEMATIC_AUXILIARY: Readonly<Record<string, string>> = {
  'constr-futur-proche': 'aller',
  'constr-passe-recent': 'venir',
  'constr-en-train': 'être',
};

interface QuestionContext {
  solution: string;
  translation?: string;
  fromExample: boolean;
}

function normalizeApostrophes(value: string): string {
  return value.replace(/[’‘`]/gu, "'");
}

function isLetter(value: string | undefined): boolean {
  return !!value && /[\p{L}\p{M}]/u.test(value);
}

/**
 * Заменяет именно словоформу/фразу, а не случайное вхождение внутри другого слова.
 * Для коротких форм вроде a / ai / as это принципиально: старый indexOf мог найти
 * букву внутри raison и сделать из нормальной фразы кашу.
 */
function replaceExactText(source: string, target: string, replacement: string): string | null {
  if (!target.trim()) return null;

  const normalizedSource = normalizeApostrophes(source).toLowerCase();
  const normalizedTarget = normalizeApostrophes(target).toLowerCase();
  let from = 0;

  while (from <= normalizedSource.length - normalizedTarget.length) {
    const at = normalizedSource.indexOf(normalizedTarget, from);
    if (at < 0) return null;

    const before = at > 0 ? normalizedSource[at - 1] : undefined;
    const afterAt = at + normalizedTarget.length;
    const after = afterAt < normalizedSource.length ? normalizedSource[afterAt] : undefined;
    const first = normalizedTarget[0];
    const last = normalizedTarget[normalizedTarget.length - 1];
    const leftBoundaryOk = !(isLetter(first) && isLetter(before));
    const rightBoundaryOk = !(isLetter(last) && isLetter(after));

    if (leftBoundaryOk && rightBoundaryOk) {
      return source.slice(0, at) + replacement + source.slice(afterAt);
    }
    from = at + 1;
  }

  return null;
}

function promptContext(prompt?: string): string | null {
  if (!prompt || !prompt.includes('___')) return null;
  const blankAt = prompt.indexOf('___');
  const colonAt = prompt.lastIndexOf(':', blankAt);
  const context = (colonAt >= 0 ? prompt.slice(colonAt + 1) : prompt).trim();
  return context.includes('___') ? context : null;
}

function fillBlank(template: string, answer: string): string {
  return template.replace('___', answer);
}

function usefulBlank(context: string | null): context is string {
  if (!context || !context.includes('___')) return false;
  return /[\p{L}\p{M}]/u.test(context.replace('___', ''));
}

function exactContext(question: QuizQuestion): QuestionContext | null {
  const example = examplesFor(question.verbId, question.tense).find(
    item => item.person === question.person,
  );
  if (!example) return null;

  // Контекст годится только если в нём реально стоит та форма, которую проверяем.
  // Это отсеивает, например, женское allée при мужском эталоне allé.
  if (!replaceExactText(example.fr, question.correctAnswer, '___')) return null;
  return { solution: example.fr, translation: example.ru, fromExample: true };
}

function genericContext(question: QuizQuestion): QuestionContext {
  return {
    solution: speechText(question.person, question.tense, question.correctAnswer),
    fromExample: false,
  };
}

function contextForGeneric(question: QuizQuestion): QuestionContext {
  return exactContext(question) ?? genericContext(question);
}

function sameVerbPersonDistractor(
  verb: Verb,
  tense: Tense,
  person: Person,
  correctAnswer: string,
): string | null {
  const personIndex = PERSONS.indexOf(person);
  if (personIndex < 0) return null;

  const candidates: string[] = [];
  for (let offset = 1; offset < PERSONS.length; offset += 1) {
    const index = (personIndex + offset) % PERSONS.length;
    const form = verb.conjugations[tense]?.[index];
    if (form && !form.absent && form.form !== correctAnswer && !candidates.includes(form.form)) {
      candidates.push(form.form);
    }
  }
  return candidates[0] ?? null;
}

function alternateTenseDistractor(
  verb: Verb,
  tense: Tense,
  person: Person,
  selectedTenses: Tense[],
  correctAnswer: string,
): string | null {
  const personIndex = PERSONS.indexOf(person);
  if (personIndex < 0) return null;

  for (const alternativeTense of selectedTenses) {
    if (alternativeTense === tense) continue;
    const alternative = verb.conjugations[alternativeTense]?.[personIndex];
    if (alternative && !alternative.absent && alternative.form !== correctAnswer) {
      return alternative.form;
    }
  }
  return null;
}

function genericDistractor(
  verb: Verb,
  question: QuizQuestion,
  selectedTenses: Tense[],
): string | null {
  return (
    alternateTenseDistractor(
      verb,
      question.tense,
      question.person,
      selectedTenses,
      question.correctAnswer,
    )
    ?? sameVerbPersonDistractor(
      verb,
      question.tense,
      question.person,
      question.correctAnswer,
    )
    ?? generateOptions(
      verb.id,
      question.tense,
      PERSONS.indexOf(question.person),
      question.correctAnswer,
    ).find(option => option !== question.correctAnswer)
    ?? null
  );
}

function auxiliaryDistractor(question: QuizQuestion, auxiliaryId: string): string | null {
  const auxiliary = getVerbById(auxiliaryId);
  if (!auxiliary) return null;
  const correctAuxiliary = auxiliary.conjugations.present?.[PERSONS.indexOf(question.person)];
  if (!correctAuxiliary || correctAuxiliary.absent) return null;

  const wrongAuxiliary = sameVerbPersonDistractor(
    auxiliary,
    'present',
    question.person,
    correctAuxiliary.form,
  );
  if (!wrongAuxiliary) return null;

  const replaced = replaceExactText(question.correctAnswer, correctAuxiliary.form, wrongAuxiliary);
  return replaced && replaced !== question.correctAnswer ? replaced : null;
}

function oppositePastDistractor(question: QuizQuestion): string | null {
  if (question.tense !== 'imparfait' && question.tense !== 'passeCompose') return null;
  const verb = getVerbById(question.verbId);
  if (!verb) return null;
  const alternateTense: Tense = question.tense === 'imparfait' ? 'passeCompose' : 'imparfait';
  const alternative = verb.conjugations[alternateTense]?.[PERSONS.indexOf(question.person)];
  return alternative && !alternative.absent && alternative.form !== question.correctAnswer
    ? alternative.form
    : null;
}

function savoirConnaitreDistractor(question: QuizQuestion): string | null {
  const otherId = question.verbId === 'savoir'
    ? 'connaître'
    : question.verbId === 'connaître'
      ? 'savoir'
      : null;
  if (!otherId) return null;
  const other = getVerbById(otherId);
  const form = other?.conjugations.present?.[PERSONS.indexOf(question.person)];
  return form && !form.absent && form.form !== question.correctAnswer ? form.form : null;
}

function subjunctiveDistractor(question: QuizQuestion): string | null {
  const verb = getVerbById(question.verbId);
  const indicative = verb?.conjugations.present?.[PERSONS.indexOf(question.person)];
  return indicative && !indicative.absent && indicative.form !== question.correctAnswer
    ? indicative.form
    : null;
}

function auxiliaryChoiceDistractor(question: QuizQuestion): string | null {
  if (question.tense !== 'passeCompose') return null;
  const personIndex = PERSONS.indexOf(question.person);
  const etre = getVerbById('être')?.conjugations.present?.[personIndex];
  const avoir = getVerbById('avoir')?.conjugations.present?.[personIndex];
  if (!etre || etre.absent || !avoir || avoir.absent) return null;

  const firstSpace = question.correctAnswer.indexOf(' ');
  if (firstSpace < 0) return null;
  const first = question.correctAnswer.slice(0, firstSpace);
  const rest = question.correctAnswer.slice(firstSpace);
  if (normalizeApostrophes(first).toLowerCase() === normalizeApostrophes(etre.form).toLowerCase()) {
    return avoir.form + rest;
  }
  if (normalizeApostrophes(first).toLowerCase() === normalizeApostrophes(avoir.form).toLowerCase()) {
    return etre.form + rest;
  }
  return null;
}

function optionSimilarity(candidate: string, correct: string): number {
  const a = normalizeApostrophes(candidate).toLowerCase().split(/\s+/u);
  const b = normalizeApostrophes(correct).toLowerCase().split(/\s+/u);
  let score = a.length === b.length ? 10 : 0;
  const length = Math.min(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    if (a[index] === b[index]) score += 3;
  }
  for (let index = 1; index <= length; index += 1) {
    if (a[a.length - index] === b[b.length - index]) score += 2;
  }
  return score;
}

function nearestExistingOption(question: QuizQuestion): string | null {
  const candidates = Array.from(
    new Set((question.options ?? []).filter(option => option !== question.correctAnswer)),
  );
  candidates.sort((left, right) =>
    optionSimilarity(right, question.correctAnswer) - optionSimilarity(left, question.correctAnswer),
  );
  return candidates[0] ?? null;
}

/** Педагогически осмысленный неверный вариант для тематических заданий. */
function thematicDistractor(question: QuizQuestion, lessonId: string): string | null {
  const thematicAuxiliary = THEMATIC_AUXILIARY[lessonId];
  if (thematicAuxiliary) {
    const wrong = auxiliaryDistractor(question, thematicAuxiliary);
    if (wrong) return wrong;
  }

  if (lessonId === 'constr-modaux') {
    const wrong = auxiliaryDistractor(question, question.verbId);
    if (wrong) return wrong;
  }

  if (lessonId === 'imparfait-vs-passe-compose') {
    const wrong = oppositePastDistractor(question);
    if (wrong) return wrong;
  }

  if (lessonId === 'constr-savoir-connaitre') {
    const wrong = savoirConnaitreDistractor(question);
    if (wrong) return wrong;
  }

  if (lessonId === 'choix-auxiliaire') {
    const wrong = auxiliaryChoiceDistractor(question);
    if (wrong) return wrong;
  }

  if (lessonId.startsWith('subj-')) {
    const wrong = subjunctiveDistractor(question);
    if (wrong) return wrong;
  }

  return nearestExistingOption(question);
}

function shuffledTokens(sentence: string): string[] {
  const original = sentence.trim().split(/\s+/u).filter(Boolean);
  if (original.length <= 1) return original;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = shuffle(original);
    if (candidate.join(' ') !== original.join(' ')) return candidate;
  }
  return [...original].reverse();
}

function thematicSolution(question: QuizQuestion): string {
  const prompt = promptContext(question.prompt);
  if (prompt) return fillBlank(prompt, question.correctAnswer);
  return question.speechText ?? speechText(question.person, question.tense, question.correctAnswer);
}

function thematicBlank(question: QuizQuestion): string | null {
  const fromPrompt = promptContext(question.prompt);
  if (fromPrompt) return fromPrompt;
  return replaceExactText(thematicSolution(question), question.correctAnswer, '___');
}

function thematicBroken(
  question: QuizQuestion,
  wrongAnswer: string,
): { context: string; solution: string } | null {
  const fromPrompt = promptContext(question.prompt);
  if (fromPrompt) {
    return {
      context: fillBlank(fromPrompt, wrongAnswer),
      solution: fillBlank(fromPrompt, question.correctAnswer),
    };
  }

  const solution = thematicSolution(question);
  const context = replaceExactText(solution, question.correctAnswer, wrongAnswer);
  return context ? { context, solution } : null;
}

export function isContextualQuizMode(mode: QuizMode): mode is ContextQuizMode {
  return CONTEXTUAL_MODES.has(mode);
}

/**
 * Обычная карточка спряжения → контекстный тип задания.
 * Для настоящего контекста прежде всего используются EXAMPLES; стерильная
 * «je + forme» остаётся только безопасным резервом для морфологических режимов.
 */
export function buildExerciseQuestion(
  base: QuizQuestion,
  mode: QuizMode,
  selectedTenses: Tense[],
  verb: Verb,
): QuizQuestion | null {
  if (!isContextualQuizMode(mode)) return base;

  const context = contextForGeneric(base);
  const blank = replaceExactText(context.solution, base.correctAnswer, '___');

  if (mode === 'fill-blank') {
    if (!usefulBlank(blank)) return null;
    return {
      ...base,
      options: undefined,
      context: blank,
      contextTranslation: context.translation,
      solutionText: context.solution,
      speechText: context.solution,
    };
  }

  if (mode === 'error-correction') {
    const wrong = genericDistractor(verb, base, selectedTenses);
    if (!wrong) return null;
    const broken = replaceExactText(context.solution, base.correctAnswer, wrong);
    if (!broken || broken === context.solution) return null;
    return {
      ...base,
      options: undefined,
      context: broken,
      contextTranslation: context.translation,
      solutionText: context.solution,
      speechText: context.solution,
      wrongAnswer: wrong,
    };
  }

  if (mode === 'contrast') {
    const wrong = genericDistractor(verb, base, selectedTenses);
    if (!wrong || !usefulBlank(blank)) return null;
    return {
      ...base,
      context: blank,
      contextTranslation: context.translation,
      solutionText: context.solution,
      speechText: context.solution,
      options: shuffle([base.correctAnswer, wrong]),
    };
  }

  // Порядок слов без настоящего предложения не имеет учебного смысла.
  if (!context.fromExample) return null;
  const originalTokens = context.solution.trim().split(/\s+/u).filter(Boolean);
  if (originalTokens.length < 3) return null;
  const tokens = shuffledTokens(context.solution);
  if (tokens.join(' ') === originalTokens.join(' ')) return null;

  return {
    ...base,
    correctAnswer: context.solution,
    options: undefined,
    context: undefined,
    contextTranslation: context.translation,
    solutionText: context.solution,
    speechText: context.solution,
    tokens,
  };
}

/**
 * Тематические уроки (venir de, aller + infinitif, imparfait vs PC и т.д.)
 * уже имеют собственный генератор. Его нельзя обходить: мы меняем только способ
 * вопроса, сохраняя его правильный ответ, подписи, контекст и озвучку.
 */
export function buildThematicExerciseQuestions(
  questions: QuizQuestion[],
  mode: QuizMode,
  lessonId: string,
): QuizQuestion[] {
  if (!isContextualQuizMode(mode)) return questions;

  const result: QuizQuestion[] = [];
  for (const question of questions) {
    if (mode === 'fill-blank') {
      const context = thematicBlank(question);
      if (!usefulBlank(context)) continue;
      result.push({
        ...question,
        options: undefined,
        context,
        solutionText: thematicSolution(question),
      });
      continue;
    }

    if (mode === 'error-correction') {
      const wrong = thematicDistractor(question, lessonId);
      if (!wrong || wrong === question.correctAnswer) continue;
      const broken = thematicBroken(question, wrong);
      if (!broken || broken.context === broken.solution) continue;
      result.push({
        ...question,
        options: undefined,
        context: broken.context,
        solutionText: broken.solution,
        wrongAnswer: wrong,
      });
      continue;
    }

    if (mode === 'contrast') {
      const wrong = thematicDistractor(question, lessonId);
      const context = thematicBlank(question);
      if (!wrong || wrong === question.correctAnswer || !usefulBlank(context)) continue;
      result.push({
        ...question,
        context,
        solutionText: thematicSolution(question),
        options: shuffle([question.correctAnswer, wrong]),
      });
      continue;
    }

    const solution = thematicSolution(question);
    const originalTokens = solution.trim().split(/\s+/u).filter(Boolean);
    if (originalTokens.length < 3) continue;
    const tokens = shuffledTokens(solution);
    if (tokens.join(' ') === originalTokens.join(' ')) continue;
    result.push({
      ...question,
      correctAnswer: solution,
      options: undefined,
      context: undefined,
      solutionText: solution,
      speechText: solution,
      tokens,
    });
  }
  return result;
}

/** Структурная защита и для CI, и для старых сохранённых сессий. */
export function isValidExerciseQuestion(question: QuizQuestion, mode: QuizMode): boolean {
  if (!isContextualQuizMode(mode)) return true;

  if (mode === 'fill-blank') {
    return usefulBlank(question.context ?? null) && !!question.solutionText;
  }

  if (mode === 'error-correction') {
    return (
      !!question.context
      && !!question.solutionText
      && !!question.wrongAnswer
      && question.wrongAnswer !== question.correctAnswer
      && question.context !== question.solutionText
    );
  }

  if (mode === 'contrast') {
    const options = Array.from(new Set(question.options ?? []));
    return (
      usefulBlank(question.context ?? null)
      && options.length === 2
      && options.includes(question.correctAnswer)
      && options.some(option => option !== question.correctAnswer)
    );
  }

  const tokens = question.tokens ?? [];
  return (
    !!question.solutionText
    && question.correctAnswer === question.solutionText
    && tokens.length >= 3
    && tokens.join(' ') !== question.solutionText.trim().split(/\s+/u).join(' ')
  );
}
