import { GRAMMAR_LESSON_IDS, grammarQuestions } from '../data/grammar-drills';
import { LESSONS } from '../data/lessons';

const expectedOrder = [
  'syntax-prepositions',
  'syntax-pronoms-y-en',
  'syntax-time-markers',
  'syntax-past-contrast',
  'syntax-si',
  'syntax-participe-cod',
] as const;

const actualOrder = [...GRAMMAR_LESSON_IDS];
if (actualOrder.join('|') !== expectedOrder.join('|')) {
  throw new Error(`Grammar pedagogy: wrong topic order: ${actualOrder.join(' → ')}`);
}

const forbidden = [
  'Интервал рассматривается как целое',
  'Точка в прошлом относительно сейчас',
  'по-разному показывают длительность и точку отсчёта',
  'временную перспективу требует фраза',
  'продуктивная группа',
];

for (const id of expectedOrder) {
  const lesson = LESSONS.find(item => item.id === id);
  if (!lesson) throw new Error(`Grammar pedagogy: lesson ${id} missing`);
  if (lesson.block !== 'syntax') throw new Error(`Grammar pedagogy: ${id} leaked outside syntax block`);

  const sectionText = lesson.sections
    .flatMap(section => [section.heading ?? '', section.body ?? '', ...(section.bullets ?? [])])
    .join('\n');
  const allText = `${lesson.title}\n${lesson.summary}\n${sectionText}`;

  if (!/[А-Яа-яЁё]/u.test(allText)) {
    throw new Error(`Grammar pedagogy: ${id} has no Russian teaching text`);
  }
  if (lesson.sections.length < 5) {
    throw new Error(`Grammar pedagogy: ${id} is too thin (${lesson.sections.length} sections)`);
  }
  if ((allText.match(/ — /gu) ?? []).length < 3) {
    throw new Error(`Grammar pedagogy: ${id} lacks translated contrast examples`);
  }
  for (const phrase of forbidden) {
    if (allText.includes(phrase)) throw new Error(`Grammar pedagogy: ${id} still contains «${phrase}»`);
  }
}

const yEnQuestions = grammarQuestions('syntax-pronoms-y-en', 100);
const premature = yEnQuestions.filter(question => /impératif|Donne-|Parle-|Prends-|Vas-|N’y va|Ne m’en parle/u.test(question.prompt));
if (premature.length > 0) {
  throw new Error(`Grammar pedagogy: y/en still asks premature impératif questions: ${premature.map(q => q.prompt).join(' | ')}`);
}

const prepQuestions = grammarQuestions('syntax-prepositions', 100);
if (prepQuestions.some(question => question.prompt.includes('continuons ___ travailler'))) {
  throw new Error('Grammar pedagogy: ambiguous continuer à/de item still present');
}

console.log(`Grammar pedagogy OK: ${expectedOrder.length} lessons, ${yEnQuestions.length + prepQuestions.length} early-section drill items checked.`);
