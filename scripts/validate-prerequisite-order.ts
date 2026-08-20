import assert from 'node:assert/strict';
import { adaptThematicExerciseQuestions } from '../data/thematic-exercise-adapter';
import { getLessonById, LESSONS, lessonPracticeVerbIds } from '../data/lessons';
import { buildThematicQuestions } from '../data/thematic-quiz';
import { PERSONS, type QuizConfig, type QuizQuestion, type Tense } from '../data/types';

const lessonIndex = new Map(LESSONS.map((lesson, index) => [lesson.id, index]));

const INTRO_LESSON: Partial<Record<Tense, string>> = {
  passeCompose: 'passe-compose-avoir',
  imparfait: 'imparfait',
  futurSimple: 'futur-simple',
  conditionnel: 'conditionnel',
  plusQueParfait: 'plus-que-parfait',
  futurAnterieur: 'futur-anterieur',
  conditionnelPasse: 'conditionnel-passe',
  imperatifPresent: 'imperatif-present',
  imperatifPasse: 'imperatif-passe',
  subjPresent: 'subj-present-formation',
  subjPasse: 'subj-passe',
  passeSimple: 'litt-passe-simple',
  passeAnterieur: 'litt-passe-simple',
  subjImparfait: 'litt-subjonctif-imparfait',
  subjPlusQueParfait: 'litt-subjonctif-imparfait',
};

function indexOfLesson(id: string): number {
  const index = lessonIndex.get(id);
  assert.notEqual(index, undefined, `Prerequisite audit: missing lesson ${id}`);
  return index!;
}

function visibleQuestionText(question: QuizQuestion): string {
  return [
    question.prompt,
    question.context,
    question.solutionText,
    question.speechText,
    question.displayAnswer,
    question.correctAnswer,
    ...(question.options ?? []),
  ]
    .filter((value): value is string => Boolean(value))
    .join(' ');
}

// Сначала проверяем саму заявленную программу каждого урока.
for (const lesson of LESSONS) {
  const currentIndex = indexOfLesson(lesson.id);
  for (const tense of lesson.practice.tenses) {
    const introId = INTRO_LESSON[tense];
    if (!introId) continue;
    assert.ok(
      currentIndex >= indexOfLesson(introId),
      `${lesson.id}: ${tense} используется раньше урока ${introId}`,
    );
  }
}

let thematicLessons = 0;
let questionsChecked = 0;
const subjIntroIndex = indexOfLesson('subj-present-formation');

// Затем проверяем не декларации, а реальные вопросы, которые увидит пользователь.
for (const lesson of LESSONS) {
  const config: QuizConfig = {
    tenses: lesson.practice.tenses,
    persons: PERSONS,
    verbIds: lessonPracticeVerbIds(lesson),
    mode: 'input',
    maxQuestions: 5000,
    accentMode: 'warn',
    lessonId: lesson.id,
  };

  const raw = buildThematicQuestions(config);
  if (raw === null) continue;
  thematicLessons += 1;

  const questions = adaptThematicExerciseQuestions(raw, 'input', lesson.id);
  assert.ok(questions.length > 0, `${lesson.id}: thematic lesson has no in-scope questions`);

  const currentIndex = indexOfLesson(lesson.id);
  for (const question of questions) {
    questionsChecked += 1;

    assert.ok(
      lesson.practice.tenses.includes(question.tense),
      `${lesson.id}: generated ${question.tense}, but lesson declares ${lesson.practice.tenses.join(', ')}`,
    );

    const introId = INTRO_LESSON[question.tense];
    if (introId) {
      assert.ok(
        currentIndex >= indexOfLesson(introId),
        `${lesson.id}: actual question uses ${question.tense} before ${introId}`,
      );
    }

    const visible = visibleQuestionText(question);
    assert.doesNotMatch(
      visible,
      /\bil\/elle\b|\bils\/elles\b/iu,
      `${lesson.id}: service person label leaked into a French sentence: ${visible}`,
    );

    if (currentIndex < subjIntroIndex) {
      assert.doesNotMatch(
        visible,
        /\bsubjonctif\b|\bсослагатель\w*\b|\bil faut que\b/iu,
        `${lesson.id}: subjonctif leaked before it is taught: ${visible}`,
      );
    }
  }
}

const ilFaut = getLessonById('constr-il-faut');
assert.ok(ilFaut, 'Prerequisite audit: constr-il-faut missing');
assert.deepEqual(
  ilFaut.practice.tenses,
  ['present'],
  'constr-il-faut must stay present-only until the subjonctif block',
);

const ilFautConfig: QuizConfig = {
  tenses: ilFaut.practice.tenses,
  persons: PERSONS,
  verbIds: lessonPracticeVerbIds(ilFaut),
  mode: 'input',
  maxQuestions: 5000,
  accentMode: 'warn',
  lessonId: ilFaut.id,
};
const ilFautRaw = buildThematicQuestions(ilFautConfig);
assert.ok(ilFautRaw, 'constr-il-faut must use the thematic generator');
const ilFautQuestions = adaptThematicExerciseQuestions(ilFautRaw!, 'input', ilFaut.id);
assert.ok(ilFautQuestions.length > 0, 'constr-il-faut has no questions after prerequisite filtering');
assert.ok(
  ilFautQuestions.every(question => question.tense === 'present'),
  'constr-il-faut still contains a non-present question',
);
assert.ok(
  ilFautQuestions.every(question => !/\bil faut que\b|\bsubjonctif\b/iu.test(visibleQuestionText(question))),
  'constr-il-faut still exposes il faut que / subjonctif before the subjonctif block',
);

console.log(
  `Prerequisite audit OK: ${LESSONS.length} lessons, ${thematicLessons} thematic lessons, ${questionsChecked} actual questions.`,
);
