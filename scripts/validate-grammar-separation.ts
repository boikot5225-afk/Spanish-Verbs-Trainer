import assert from 'node:assert/strict';
import fs from 'node:fs';
import { LESSONS, lessonsByBlock } from '../data/lessons';

const grammarLessons = lessonsByBlock('syntax');
const coreLessons = LESSONS.filter(lesson => lesson.block !== 'syntax');

assert.equal(grammarLessons.length, 6, `Ожидалось 6 отдельных грамматических тем, найдено ${grammarLessons.length}`);
assert.equal(coreLessons.length + grammarLessons.length, LESSONS.length, 'Грамматические темы потерялись или дублируются');

const tabs = fs.readFileSync('app/(tabs)/_layout.tsx', 'utf8');
assert(tabs.includes('name="grammar"'), 'Нет отдельной вкладки «Грамматика»');
assert(tabs.includes('<Label>Грамматика</Label>'), 'NativeTabs не показывает вкладку «Грамматика»');

const lessons = fs.readFileSync('app/(tabs)/lessons.tsx', 'utf8');
assert(lessons.includes("lesson.block !== 'syntax'"), 'Грамматика всё ещё попадает в глагольный курс');
assert(lessons.includes("block !== 'syntax'"), 'Синтаксический блок всё ещё отображается среди глагольных блоков');
assert(lessons.includes('Глагольный курс'), 'Основной экран не отделён визуально от грамматики');

const grammar = fs.readFileSync('app/(tabs)/grammar.tsx', 'utf8');
assert(grammar.includes("lessonsByBlock('syntax')"), 'Вкладка «Грамматика» не использует отдельные шесть тем');
assert(grammar.includes('Все шесть тем доступны сразу'), 'Не обозначен независимый доступ к грамматическим темам');

const context = fs.readFileSync('context/LessonsContext.tsx', 'utf8');
assert(context.includes("lesson.block !== 'syntax'"), 'Прогресс основного курса всё ещё считает грамматику');
assert(context.includes('if (grammarLessonIds.has(lessonId)) return true;'), 'Грамматические темы не открываются независимо');
assert(context.includes('if (answer.question.headerTitle) continue;'), 'Грамматические ответы всё ещё загрязняют статистику времён');

const lessonScreen = fs.readFileSync('app/lesson/[id].tsx', 'utf8');
assert(
  lessonScreen.includes('Остальные темы раздела доступны независимо'),
  'Экран грамматической темы всё ещё обещает линейную разблокировку',
);

console.log(`Grammar separation validation OK: ${coreLessons.length} verb-course lessons + ${grammarLessons.length} standalone grammar lessons.`);
