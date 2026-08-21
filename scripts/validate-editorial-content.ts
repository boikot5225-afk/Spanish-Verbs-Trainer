import assert from 'node:assert/strict';
import { EXAMPLES } from '../data/examples';
import {
  LESSONS,
  LESSON_BLOCKS,
  getLessonById,
  type Lesson,
  type LessonSection,
} from '../data/lessons';
import {
  GRAMMAR_LESSON_IDS,
  grammarQuestions,
} from '../data/grammar-drills';

const EXPECTED_BLOCKS = [
  'present',
  'constructions',
  'imperatif',
  'passe',
  'futur',
  'composes',
  'syntax',
  'subjonctif',
  'litteraire',
] as const;

assert.deepEqual(LESSON_BLOCKS, EXPECTED_BLOCKS, 'Нарушен педагогический порядок блоков');

const EXPECTED_ORDER = [
  'present-trois-groupes',
  'present-etre-avoir',
  'present-g1-cer-ger',
  'present-g1-alternance',
  'present-g1-yer',
  'present-g2',
  'present-g3-ir',

  'constr-futur-proche',
  'constr-passe-recent',
  'constr-en-train',
  'constr-modaux',
  'constr-savoir-connaitre',
  'constr-il-faut',
  'constr-pronominaux',

  'imperatif-present',
  'imperatif-irreguliers',

  'passe-compose-avoir',
  'passe-compose-etre',
  'choix-auxiliaire',
  'accord-participe',
  'imparfait',
  'imparfait-vs-passe-compose',

  'futur-simple',
  'futur-irreguliers',
  'conditionnel',

  'plus-que-parfait',
  'futur-anterieur',
  'conditionnel-passe',

  'syntax-prepositions',
  'syntax-time-markers',
  'syntax-pronoms-y-en',
  'syntax-past-contrast',
  'syntax-si',
  'syntax-participe-cod',

  'subj-present-formation',
  'subj-present-irreguliers',
  'subj-volonte',
  'subj-emotion-doute',
  'subj-conjonctions',
  'subj-passe',

  'litt-passe-simple',
  'litt-subjonctif-imparfait',
  'imperatif-passe',
];

assert.deepEqual(
  LESSONS.map(lesson => lesson.id),
  EXPECTED_ORDER,
  'Уроки идут не в утверждённом порядке',
);

function sectionText(section: LessonSection): string {
  return [section.heading, section.body, ...(section.bullets ?? [])].filter(Boolean).join(' ');
}

function lessonText(lesson: Lesson): string {
  return [lesson.title, lesson.summary, ...lesson.sections.map(sectionText)].join(' ');
}

function assertLessonDoesNotMention(id: string, pattern: RegExp, label: string): void {
  const lesson = getLessonById(id);
  assert.ok(lesson, `Не найден урок ${id}`);
  assert.ok(!pattern.test(lessonText(lesson)), `${id}: тема забегает вперёд — ${label}`);
}

// До соответствующего блока не объясняем следующую грамматику «по пути».
assertLessonDoesNotMention('present-g1-cer-ger', /imparfait|passé simple/iu, 'прошедшие времена');
assertLessonDoesNotMention('present-g1-alternance', /futur/iu, 'будущее время');
assertLessonDoesNotMention('present-g1-yer', /futur|j[’']enverrai/iu, 'неправильную основу будущего');
assertLessonDoesNotMention('constr-passe-recent', /imparfait|venais de/iu, 'imparfait');
assertLessonDoesNotMention('constr-il-faut', /subjonctif|subjPresent|que tu partes/iu, 'subjonctif');
assertLessonDoesNotMention('constr-pronominaux', /passé composé|passeCompose|impératif|imperatif/iu, 'составные времена или impératif');
assertLessonDoesNotMention('plus-que-parfait', /conditionnel passé|conditionnelPasse|je serais venu/iu, 'conditionnel passé');
assertLessonDoesNotMention('imperatif-irreguliers', /subjonctif|сослагатель/iu, 'subjonctif');

const accord = getLessonById('accord-participe');
assert.ok(accord, 'Не найден accord-participe');
assert.deepEqual(accord.practice.tenses, ['passeCompose'], 'Базовое согласование не должно тренировать ещё не пройденный plus-que-parfait');

const choix = getLessonById('choix-auxiliaire');
assert.equal(choix?.block, 'passe', 'Выбор être/avoir должен идти в блоке passé composé');
assert.equal(accord.block, 'passe', 'Базовое согласование должно идти в блоке passé composé');
assert.equal(getLessonById('imperatif-passe')?.block, 'litteraire', 'Редкий impératif passé должен быть в продвинутом блоке');

const subjVolonte = getLessonById('subj-volonte');
assert.ok(subjVolonte && /Il faut que/u.test(lessonText(subjVolonte)), 'Il faut que должен объясняться в subjonctif, а не раньше');

// Пользователь видит объяснения грамматических вопросов только на русском.
const suspiciousFrenchMeta = /\b(?:Après|Hypothèse|Principale|Irréel|Conséquence|Condition réelle|Événement|Durée|Période|Structure fixe|L’action|Le participe|La conséquence|Toute la|Pour une durée)\b/u;
let grammarCount = 0;
for (const lessonId of GRAMMAR_LESSON_IDS) {
  const questions = grammarQuestions(lessonId, 999);
  assert.ok(questions.length >= 20, `${lessonId}: слишком мало вопросов`);
  for (const question of questions) {
    grammarCount += 1;
    assert.match(question.explanation, /[А-Яа-яЁё]/u, `${lessonId}: объяснение не на русском: ${question.explanation}`);
    assert.ok(!suspiciousFrenchMeta.test(question.explanation), `${lessonId}: в объяснении остался французский метатекст: ${question.explanation}`);
    assert.ok(!/\bverbe\b/iu.test(question.explanation), `${lessonId}: осталось слово verbe`);
  }
}

for (const example of EXAMPLES) {
  assert.match(example.ru, /[А-Яа-яЁё]/u, `Нет нормального русского перевода: ${example.fr}`);
}

const awkwardPhrases = [
  'В то время у нас было время.',
  'Мы выпили вместе кофе.',
  'Они умерли в один год.',
  'Ответ ты получишь завтра.',
  'полностью супплетивно',
  'Орфография догоняет',
  'буквально только что',
  'прямой объект',
];

const allVisibleRussian = [
  ...LESSONS.map(lessonText),
  ...EXAMPLES.map(example => example.ru),
].join('\n');
for (const phrase of awkwardPhrases) {
  assert.ok(!allVisibleRussian.includes(phrase), `Редактура пропустила корявую формулировку: ${phrase}`);
}

console.log(`Editorial validation OK: ${LESSONS.length} lessons, ${grammarCount} grammar questions, ${EXAMPLES.length} examples.`);
