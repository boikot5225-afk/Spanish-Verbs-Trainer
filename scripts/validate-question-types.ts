import {
  buildExerciseQuestion,
  buildThematicExerciseQuestions,
  isValidExerciseQuestion,
  type ContextQuizMode,
} from '../data/exercise-questions';
import {
  PERSONS,
  TENSES,
  type QuizConfig,
  type QuizQuestion,
} from '../data/types';
import { VERBS } from '../data/verbs';
import {
  buildThematicQuestions,
  THEMATIC_LESSON_IDS,
} from '../data/thematic-quiz';

const MODES: ContextQuizMode[] = [
  'fill-blank',
  'error-correction',
  'contrast',
  'word-order',
];

const errors: string[] = [];

function fail(message: string): void {
  errors.push(message);
}

function validateShape(question: QuizQuestion, mode: ContextQuizMode, label: string): void {
  if (!isValidExerciseQuestion(question, mode)) {
    fail(`${label}: malformed ${mode} question: ${JSON.stringify(question)}`);
    return;
  }

  if (mode === 'fill-blank') {
    const blanks = question.context?.match(/___/gu)?.length ?? 0;
    if (blanks !== 1) fail(`${label}: fill-blank must have exactly one blank, got ${blanks}`);
  }

  if (mode === 'error-correction') {
    if (question.context === question.solutionText) {
      fail(`${label}: error-correction contains no actual error`);
    }
  }

  if (mode === 'contrast') {
    const options = question.options ?? [];
    const distinct = new Set(options);
    if (options.length !== 2 || distinct.size !== 2) {
      fail(`${label}: contrast must have exactly two distinct options: ${JSON.stringify(options)}`);
    }
    if (!distinct.has(question.correctAnswer)) {
      fail(`${label}: contrast lost the correct answer`);
    }
  }

  if (mode === 'word-order') {
    const tokens = question.tokens ?? [];
    if (tokens.length < 3) fail(`${label}: word-order is trivial (${tokens.length} tokens)`);
    if (tokens.join(' ') === question.solutionText?.trim().split(/\s+/u).join(' ')) {
      fail(`${label}: word-order tokens were not shuffled`);
    }
  }
}

// 1. Перебираем всю глагольную базу: никакой новый режим не имеет права
// создавать структурно сломанный вопрос на редком лице/времени.
const genericCounts: Record<ContextQuizMode, number> = {
  'fill-blank': 0,
  'error-correction': 0,
  contrast: 0,
  'word-order': 0,
};

for (const verb of VERBS) {
  for (const tense of TENSES) {
    for (let personIndex = 0; personIndex < PERSONS.length; personIndex += 1) {
      const person = PERSONS[personIndex];
      const form = verb.conjugations[tense]?.[personIndex];
      if (!form || form.absent) continue;

      const base: QuizQuestion = {
        verbId: verb.id,
        tense,
        person,
        correctAnswer: form.form,
      };

      for (const mode of MODES) {
        const question = buildExerciseQuestion(base, mode, [tense], verb);
        if (!question) continue;
        genericCounts[mode] += 1;
        validateShape(question, mode, `generic ${verb.id}/${tense}/${person}`);
      }
    }
  }
}

for (const mode of MODES) {
  if (genericCounts[mode] === 0) fail(`generic ${mode}: zero usable questions`);
}

// 2. Все тематические уроки: именно здесь build 160 обходил новый движок.
for (const lessonId of THEMATIC_LESSON_IDS) {
  const sourceConfig: QuizConfig = {
    lessonId,
    verbIds: 'all',
    persons: PERSONS,
    tenses: TENSES,
    mode: 'multiple-choice',
    maxQuestions: 500,
    accentMode: 'warn',
  };
  const source = buildThematicQuestions(sourceConfig);
  if (!source || source.length === 0) {
    fail(`${lessonId}: thematic generator returned no source questions`);
    continue;
  }

  for (const mode of MODES) {
    const questions = buildThematicExerciseQuestions(source, mode, lessonId);
    if (questions.length === 0) {
      fail(`${lessonId}/${mode}: zero usable questions after adaptation`);
      continue;
    }
    for (const question of questions) {
      validateShape(question, mode, `${lessonId}/${question.verbId}/${question.person}`);
      if (!question.displayInfinitive || !question.displayTense) {
        fail(`${lessonId}/${mode}: thematic display metadata was lost`);
      }
      if (!question.speechText && !question.solutionText) {
        fail(`${lessonId}/${mode}: thematic speech/solution text was lost`);
      }
    }
  }
}

// 3. Регрессия по реальному багу со скриншота пользователя.
const recentConfig: QuizConfig = {
  lessonId: 'constr-passe-recent',
  verbIds: ['rentrer'],
  persons: ['vous'],
  tenses: ['present'],
  mode: 'multiple-choice',
  maxQuestions: 20,
  accentMode: 'warn',
};
const recentSource = buildThematicQuestions(recentConfig) ?? [];
const recentQuestion = recentSource.find(
  question => question.verbId === 'rentrer' && question.person === 'vous',
);
if (!recentQuestion) {
  fail('regression passé récent/rentrer/vous: source question missing');
} else {
  if (recentQuestion.correctAnswer !== 'venez de rentrer') {
    fail(`regression passé récent: expected "venez de rentrer", got "${recentQuestion.correctAnswer}"`);
  }
  const contrast = buildThematicExerciseQuestions(
    [recentQuestion],
    'contrast',
    'constr-passe-recent',
  )[0];
  if (!contrast) {
    fail('regression passé récent: contrast question was filtered out');
  } else {
    validateShape(contrast, 'contrast', 'regression passé récent/rentrer/vous');
    if (!contrast.context?.includes('___')) {
      fail(`regression passé récent: no blank in context: ${contrast.context}`);
    }
    if ((contrast.options ?? []).length < 2) {
      fail(`regression passé récent: single-option question returned: ${JSON.stringify(contrast.options)}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Question type audit failed with ${errors.length} problem(s):`);
  for (const error of errors.slice(0, 80)) console.error(` - ${error}`);
  if (errors.length > 80) console.error(` ... and ${errors.length - 80} more`);
  process.exit(1);
}

console.log('Question type audit passed.');
console.log('Generic usable questions:', genericCounts);
console.log(`Thematic lessons checked: ${THEMATIC_LESSON_IDS.length}`);
