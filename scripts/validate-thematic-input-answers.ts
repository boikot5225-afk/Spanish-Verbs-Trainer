import assert from 'node:assert/strict';
import { adaptThematicExerciseQuestions } from '../data/thematic-exercise-adapter';
import { LESSONS, lessonPracticeVerbIds } from '../data/lessons';
import { buildThematicQuestions } from '../data/thematic-quiz';
import {
  IMPERATIVE_TENSES,
  PERSONS,
  type Person,
  type QuizConfig,
  type QuizQuestion,
} from '../data/types';

const SUBJECT_PREFIXES: Record<Person, string[]> = {
  je: ['je ', "j'"],
  tu: ['tu '],
  il: ['il ', 'elle '],
  nous: ['nous '],
  vous: ['vous '],
  ils: ['ils ', 'elles '],
};

function norm(value: string): string {
  return value.trim().replace(/[’‘`]/gu, "'").toLocaleLowerCase('fr');
}

function hasSubject(question: QuizQuestion, answer = question.correctAnswer): boolean {
  const normalized = norm(answer);
  return SUBJECT_PREFIXES[question.person].some(prefix => normalized.startsWith(prefix));
}

let thematicLessons = 0;
let questionsChecked = 0;
let naturalized = 0;
const lessonCounts: string[] = [];

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
  const adapted = adaptThematicExerciseQuestions(raw, 'input', lesson.id);
  assert.equal(adapted.length, raw.length, `${lesson.id}: input adapter changed question count`);

  let lessonNaturalized = 0;
  for (const question of adapted) {
    questionsChecked += 1;
    const answer = question.correctAnswer.trim();
    const needsNaturalSubject =
      answer.includes(' ') &&
      !IMPERATIVE_TENSES.has(question.tense) &&
      !hasSubject(question);

    if (!needsNaturalSubject) continue;

    naturalized += 1;
    lessonNaturalized += 1;
    assert.ok(question.displayAnswer, `${lesson.id}: missing displayAnswer for ${question.person} ${answer}`);
    assert.ok(
      question.acceptedAnswers?.some(item => norm(item) === norm(question.displayAnswer!)),
      `${lesson.id}: displayed full answer is not accepted: ${question.displayAnswer}`,
    );
    assert.ok(
      hasSubject(question, question.displayAnswer),
      `${lesson.id}: displayAnswer has no natural subject: ${question.displayAnswer}`,
    );
    assert.ok(
      norm(question.displayAnswer).endsWith(norm(answer)),
      `${lesson.id}: displayAnswer no longer contains canonical construction: ${question.displayAnswer} / ${answer}`,
    );

    const prefixes = SUBJECT_PREFIXES[question.person].filter(prefix =>
      norm(question.displayAnswer!).startsWith(prefix),
    );
    assert.equal(prefixes.length, 1, `${lesson.id}: ambiguous/doubled subject: ${question.displayAnswer}`);
  }

  lessonCounts.push(`${lesson.id}=${adapted.length}/${lessonNaturalized}`);
}

assert.ok(thematicLessons >= 12, `Expected at least 12 thematic lessons, found ${thematicLessons}`);
assert.ok(questionsChecked > 0, 'No thematic input questions were audited');
assert.ok(naturalized > 0, 'Audit did not find any multiword thematic answers');

console.log(`Thematic input answer audit OK: ${thematicLessons} lessons, ${questionsChecked} questions, ${naturalized} full-subject answers.`);
console.log(lessonCounts.join(', '));
