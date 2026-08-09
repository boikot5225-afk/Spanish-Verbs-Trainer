import assert from 'node:assert/strict';
import fs from 'node:fs';
import { LESSONS } from '../data/lessons';
import {
  GRAMMAR_LESSON_IDS,
  grammarBankSize,
  grammarQuestions,
} from '../data/grammar-drills';

assert.equal(LESSONS.length, 43, `Ожидалось 43 темы, найдено ${LESSONS.length}`);

const banned = [
  'деление не декоративное',
  'приклеиваются прямо к инфинитиву',
  'насколько предсказуемо ведёт себя во всех остальных',
  'Орфография догоняет',
  'envoyer выбивается',
  'Откуда они берутся',
  'Подсказки, а не переключатели',
  'Опасная пара',
  'выбор определяется не капризом',
  'временную перспективу требует фраза',
  'несут повествование',
  'золото за без ошибок',
  'Отработка по глаголам',
] as const;

// Названия французских времён и наклонений оставляем по-французски: это нормальная
// учебная терминология, а не непереведённый метатекст.
const frenchGrammarTitle = /^(?:Imparfait|Passé|Futur|Conditionnel|Subjonctif|Impératif|Être|Savoir|Pouvoir|Y, en)/u;

let sectionCount = 0;
for (const lesson of LESSONS) {
  const parts = [
    lesson.title,
    lesson.summary,
    ...lesson.sections.flatMap(section => [
      section.heading ?? '',
      section.body ?? '',
      ...(section.bullets ?? []),
    ]),
  ];
  const text = parts.join('\n');
  assert(
    /[А-Яа-яЁё]/u.test(lesson.title) || frenchGrammarTitle.test(lesson.title),
    `${lesson.id}: странный заголовок`,
  );
  assert.match(lesson.summary, /[А-Яа-яЁё]/u, `${lesson.id}: описание темы должно быть по-русски`);
  assert(!/\b(?:causatif|verbe|invariable|antéposé|principale|hypothèse)\b/iu.test(text), `${lesson.id}: в объяснении остался французский метаязык`);
  for (const phrase of banned) {
    assert(!text.includes(phrase), `${lesson.id}: осталась корявая формулировка «${phrase}»`);
  }
  sectionCount += lesson.sections.length;
}

let grammarCount = 0;
for (const lessonId of GRAMMAR_LESSON_IDS) {
  const questions = grammarQuestions(lessonId, grammarBankSize(lessonId));
  assert.equal(questions.length, grammarBankSize(lessonId), `${lessonId}: проверены не все вопросы`);
  for (const question of questions) {
    assert.match(question.explanation, /[А-Яа-яЁё]/u, `${lessonId}: объяснение осталось не на русском: ${question.explanation}`);
    assert(!/\b(?:avec|placé|donc|après|avant|condition réelle|hypothèse|construction ciblée|pas de préposition|invariable)\b/iu.test(question.explanation), `${lessonId}: в объяснении остался французский метатекст: ${question.explanation}`);
    grammarCount += 1;
  }
}

const lessonUi = fs.readFileSync('app/lesson/[id].tsx', 'utf8');
for (const phrase of banned) {
  assert(!lessonUi.includes(phrase), `Интерфейс урока: осталась корявая формулировка «${phrase}»`);
}
assert(lessonUi.includes('Короткие тренировки'), 'Интерфейс урока: не обновлён блок коротких тренировок');
assert(lessonUi.includes('золото — 100%'), 'Интерфейс урока: пороги медалей сформулированы неестественно');

console.log(`Russian style validation OK: ${LESSONS.length} lessons, ${sectionCount} sections, ${grammarCount} grammar explanations.`);
