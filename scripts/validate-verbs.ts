import { strict as assert } from 'node:assert';
import {
  COMPOUND_TENSES,
  IMPERATIVE_PERSONS,
  IMPERATIVE_TENSES,
  PERSONS,
  TENSES,
  type Tense,
} from '../data/types';
import { getVerbById, VERBS } from '../data/verbs';
import {
  DRILL_QUESTIONS,
  EXAM_QUESTIONS,
  LESSONS,
  drillSize,
  lessonDrills,
  lessonExamSize,
  lessonPracticeVerbIds,
} from '../data/lessons';

assert.equal(TENSES.length, 16, `Expected 16 tenses, got ${TENSES.length}`);
assert.equal(PERSONS.length, 6, `Expected 6 persons, got ${PERSONS.length}`);

// Буквы французского алфавита плюс апостроф (m’appelle), дефис (lave-toi)
// и пробел (составные времена: ai parlé, me suis lavé).
const FORM_RE = /^[a-zàâäçéèêëîïôöûùüÿœæ'’-]+( [a-zàâäçéèêëîïôöûùüÿœæ'’-]+)*$/u;

const ids = new Set<string>();
let formCount = 0;
let absentCount = 0;

for (const verb of VERBS) {
  assert(!ids.has(verb.id), `Duplicate verb id: ${verb.id}`);
  ids.add(verb.id);
  assert(verb.infinitive.trim(), `Empty infinitive for ${verb.id}`);
  assert(verb.translation.trim(), `Empty translation for ${verb.id}`);
  assert(['1', '2', '3'].includes(verb.group), `${verb.id}: unknown group ${verb.group}`);
  assert(['avoir', 'etre'].includes(verb.aux), `${verb.id}: unknown auxiliary ${verb.aux}`);
  if (verb.pronominal) {
    assert.equal(verb.aux, 'etre', `${verb.id}: pronominal verbs must take être`);
  }

  for (const nonFinite of ['participePresent', 'participePasse'] as const) {
    const form = verb[nonFinite].form;
    assert(form.trim(), `${verb.id}/${nonFinite}: empty form`);
  }

  const impersonal = verb.conjugations.present.filter(form => form.absent).length === 5;
  // У pouvoir императива нет вообще — это не дефект данных, а свойство глагола.
  const noImperative = verb.conjugations.imperatifPresent.every(form => form.absent);

  for (const tense of TENSES) {
    const forms = verb.conjugations[tense];
    assert.equal(forms.length, PERSONS.length, `${verb.id}/${tense}: expected 6 forms`);

    for (const [index, form] of forms.entries()) {
      const person = PERSONS[index]!;
      const where = `${verb.id}/${tense}/${person}`;

      if (form.absent) {
        const allowed =
          (IMPERATIVE_TENSES.has(tense) &&
            (!IMPERATIVE_PERSONS.has(person) || noImperative)) ||
          impersonal;
        assert(allowed, `${where}: unexpected absent form`);
        absentCount += 1;
        continue;
      }

      assert(form.form.trim(), `${where}: empty form`);
      assert(FORM_RE.test(form.form), `${where}: invalid form ${form.form}`);
      if (COMPOUND_TENSES.has(tense)) {
        assert(form.form.includes(' '), `${where}: compound tense must have an auxiliary`);
      }
      formCount += 1;
    }
  }

  // В императиве есть только tu, nous и vous — либо нет ни одного лица.
  for (const tense of IMPERATIVE_TENSES) {
    for (const [index, person] of PERSONS.entries()) {
      if (IMPERATIVE_PERSONS.has(person) && !noImperative) continue;
      assert(
        verb.conjugations[tense][index]?.absent,
        `${verb.id}/${tense}: ${person} must be absent`,
      );
    }
  }
}

type Check = [Tense | 'participePresent' | 'participePasse', number, string];

const expected: Record<string, Check[]> = {
  // Супплетивные — основа проверки всей таблицы исключений
  être: [
    ['present', 0, 'suis'],
    ['present', 4, 'êtes'],
    ['imparfait', 0, 'étais'],
    ['passeSimple', 5, 'furent'],
    ['futurSimple', 0, 'serai'],
    ['conditionnel', 0, 'serais'],
    ['subjPresent', 0, 'sois'],
    ['subjImparfait', 2, 'fût'],
    ['imperatifPresent', 1, 'sois'],
    ['passeCompose', 0, 'ai été'],
    ['participePasse', 0, 'été'],
  ],
  avoir: [
    ['present', 5, 'ont'],
    ['passeSimple', 0, 'eus'],
    ['futurSimple', 0, 'aurai'],
    ['subjPresent', 0, 'aie'],
    ['imperatifPresent', 4, 'ayez'],
    ['participePasse', 0, 'eu'],
    ['participePresent', 0, 'ayant'],
  ],
  aller: [
    ['present', 0, 'vais'],
    ['present', 5, 'vont'],
    ['futurSimple', 0, 'irai'],
    ['subjPresent', 0, 'aille'],
    ['subjPresent', 3, 'allions'],
    ['imperatifPresent', 1, 'va'],
    ['passeCompose', 0, 'suis allé'],
    ['passeCompose', 5, 'sont allés'],
  ],
  faire: [
    ['present', 4, 'faites'],
    ['present', 5, 'font'],
    ['passeSimple', 0, 'fis'],
    ['futurSimple', 0, 'ferai'],
    ['subjPresent', 0, 'fasse'],
    ['participePasse', 0, 'fait'],
  ],
  // Семейства третьей группы
  prendre: [
    ['present', 2, 'prend'],
    ['present', 3, 'prenons'],
    ['present', 5, 'prennent'],
    ['passeSimple', 0, 'pris'],
    ['subjPresent', 0, 'prenne'],
    ['subjPresent', 3, 'prenions'],
    ['participePasse', 0, 'pris'],
  ],
  mettre: [
    ['present', 0, 'mets'],
    ['present', 2, 'met'],
    ['passeSimple', 0, 'mis'],
    ['participePasse', 0, 'mis'],
  ],
  battre: [
    ['present', 2, 'bat'],
    ['participePasse', 0, 'battu'],
  ],
  attendre: [
    ['present', 2, 'attend'],
    ['participePasse', 0, 'attendu'],
  ],
  craindre: [
    ['present', 0, 'crains'],
    ['present', 3, 'craignons'],
    ['participePasse', 0, 'craint'],
  ],
  conduire: [
    ['present', 3, 'conduisons'],
    ['participePasse', 0, 'conduit'],
  ],
  connaître: [
    ['present', 2, 'connaît'],
    ['passeSimple', 0, 'connus'],
    ['participePasse', 0, 'connu'],
  ],
  venir: [
    ['present', 0, 'viens'],
    ['present', 5, 'viennent'],
    ['futurSimple', 0, 'viendrai'],
    ['passeSimple', 0, 'vins'],
    ['passeCompose', 0, 'suis venu'],
  ],
  recevoir: [
    ['present', 0, 'reçois'],
    ['present', 3, 'recevons'],
    ['passeSimple', 0, 'reçus'],
    ['futurSimple', 0, 'recevrai'],
    ['participePasse', 0, 'reçu'],
  ],
  partir: [
    ['present', 0, 'pars'],
    ['present', 3, 'partons'],
    ['passeCompose', 0, 'suis parti'],
  ],
  ouvrir: [
    ['present', 0, 'ouvre'],
    ['imperatifPresent', 1, 'ouvre'],
    ['participePasse', 0, 'ouvert'],
  ],
  // Орфографические чередования первой группы
  manger: [
    ['present', 3, 'mangeons'],
    ['imparfait', 0, 'mangeais'],
    ['imparfait', 3, 'mangions'],
    ['passeSimple', 3, 'mangeâmes'],
    ['participePresent', 0, 'mangeant'],
  ],
  commencer: [
    ['present', 3, 'commençons'],
    ['imparfait', 0, 'commençais'],
    ['imparfait', 3, 'commencions'],
    ['passeSimple', 3, 'commençâmes'],
  ],
  acheter: [
    ['present', 0, 'achète'],
    ['present', 3, 'achetons'],
    ['futurSimple', 0, 'achèterai'],
  ],
  appeler: [
    ['present', 0, 'appelle'],
    ['present', 3, 'appelons'],
    ['futurSimple', 0, 'appellerai'],
  ],
  espérer: [
    ['present', 0, 'espère'],
    // По традиционной норме é в основе будущего сохраняется.
    ['futurSimple', 0, 'espérerai'],
  ],
  nettoyer: [['present', 0, 'nettoie']],
  payer: [['present', 0, 'paye']],
  envoyer: [['futurSimple', 0, 'enverrai']],
  courir: [['futurSimple', 0, 'courrai']],
  // Составные времена и согласование
  sortir: [
    ['passeCompose', 2, 'est sorti'],
    ['passeCompose', 5, 'sont sortis'],
    ['plusQueParfait', 0, 'étais sorti'],
  ],
  mourir: [
    ['participePasse', 0, 'mort'],
    ['passeCompose', 5, 'sont morts'],
  ],
  naître: [
    ['present', 2, 'naît'],
    ['participePasse', 0, 'né'],
  ],
  devoir: [['participePasse', 0, 'dû']],
  // Модальные и безличные
  pouvoir: [
    ['present', 0, 'peux'],
    ['futurSimple', 0, 'pourrai'],
    ['subjPresent', 0, 'puisse'],
  ],
  vouloir: [
    ['present', 0, 'veux'],
    ['imperatifPresent', 4, 'veuillez'],
  ],
  savoir: [
    ['present', 0, 'sais'],
    ['imperatifPresent', 1, 'sache'],
    ['participePresent', 0, 'sachant'],
  ],
  falloir: [
    ['present', 2, 'faut'],
    ['futurSimple', 2, 'faudra'],
  ],
  boire: [
    ['present', 3, 'buvons'],
    ['present', 5, 'boivent'],
    ['passeSimple', 0, 'bus'],
  ],
  vivre: [
    ['passeSimple', 0, 'vécus'],
    ['participePasse', 0, 'vécu'],
  ],
  // Местоименные
  'se laver': [
    ['present', 0, 'me lave'],
    ['passeCompose', 0, 'me suis lavé'],
    ['imperatifPresent', 1, 'lave-toi'],
  ],
  "s'appeler": [
    ['present', 0, "m'appelle"],
    ['present', 3, 'nous appelons'],
  ],
  // Полностью правильные образцы всех трёх групп
  parler: [
    ['present', 0, 'parle'],
    ['imparfait', 0, 'parlais'],
    ['passeSimple', 0, 'parlai'],
    ['futurSimple', 0, 'parlerai'],
    ['conditionnel', 0, 'parlerais'],
    ['subjPresent', 0, 'parle'],
    ['subjImparfait', 2, 'parlât'],
    ['imperatifPresent', 1, 'parle'],
    ['passeCompose', 0, 'ai parlé'],
    ['plusQueParfait', 0, 'avais parlé'],
    ['passeAnterieur', 0, 'eus parlé'],
    ['futurAnterieur', 0, 'aurai parlé'],
    ['conditionnelPasse', 0, 'aurais parlé'],
    ['subjPasse', 0, 'aie parlé'],
    ['subjPlusQueParfait', 0, 'eusse parlé'],
    ['imperatifPasse', 1, 'aie parlé'],
  ],
  finir: [
    ['present', 0, 'finis'],
    ['present', 3, 'finissons'],
    ['imparfait', 0, 'finissais'],
    ['passeSimple', 0, 'finis'],
    ['imperatifPresent', 1, 'finis'],
    ['participePresent', 0, 'finissant'],
  ],
};

for (const [verbId, checks] of Object.entries(expected)) {
  const verb = getVerbById(verbId);
  if (!verb) throw new Error(`Missing expected verb: ${verbId}`);
  for (const [tense, personIndex, form] of checks) {
    const actual =
      tense === 'participePresent' || tense === 'participePasse'
        ? verb[tense].form
        : verb.conjugations[tense][personIndex]?.form;
    assert.equal(actual, form, `${verbId}/${tense}/${personIndex}: expected ${form}, got ${actual}`);
  }
}

// ── Уроки ────────────────────────────────────────────────────────────────────
const lessonIds = new Set<string>();
let tableCount = 0;
let drillCount = 0;

for (const lesson of LESSONS) {
  assert(!lessonIds.has(lesson.id), `Duplicate lesson id: ${lesson.id}`);
  lessonIds.add(lesson.id);
  assert(lesson.title.trim(), `${lesson.id}: empty title`);
  assert(lesson.summary.trim(), `${lesson.id}: empty summary`);
  assert(lesson.sections.length > 0, `${lesson.id}: no sections`);

  for (const [index, section] of lesson.sections.entries()) {
    assert(
      section.body || section.bullets?.length || section.table,
      `${lesson.id}/section ${index}: empty section`,
    );
    if (section.table) {
      const verb = getVerbById(section.table.verbId);
      assert(verb, `${lesson.id}/section ${index}: unknown verb ${section.table.verbId}`);
      assert(
        TENSES.includes(section.table.tense),
        `${lesson.id}/section ${index}: unknown tense ${section.table.tense}`,
      );
      tableCount += 1;
    }
  }

  assert(lesson.practice.tenses.length > 0, `${lesson.id}: practice without tenses`);
  for (const tense of lesson.practice.tenses) {
    assert(TENSES.includes(tense), `${lesson.id}: practice tense ${tense} is unknown`);
  }
  for (const verbId of lesson.practice.verbIds ?? []) {
    assert(getVerbById(verbId), `${lesson.id}: practice verb ${verbId} is unknown`);
  }

  const practiceVerbs = lessonPracticeVerbIds(lesson);
  assert(practiceVerbs.length > 0, `${lesson.id}: practice selection is empty`);

  // Зачёт должен быть полноразмерным: тема без 30 доступных форм не даёт
  // осмысленного порога «не более двух ошибок».
  assert.equal(
    lessonExamSize(lesson),
    EXAM_QUESTIONS,
    `${lesson.id}: exam is only ${lessonExamSize(lesson)} questions, need ${EXAM_QUESTIONS}`,
  );

  // У императива формы есть только у трёх лиц, поэтому темы, которые тренируют
  // только его, должны набирать 30 вопросов втрое большим числом глаголов.
  const imperativeOnly = lesson.practice.tenses.every(tense => IMPERATIVE_TENSES.has(tense));
  if (imperativeOnly) {
    const real = practiceVerbs.length * lesson.practice.tenses.length * IMPERATIVE_PERSONS.size;
    assert(
      real >= EXAM_QUESTIONS,
      `${lesson.id}: only ${real} real imperative forms, need ${EXAM_QUESTIONS}`,
    );
  }

  // Подуровни: ключевые глаголы обязаны входить в набор темы, иначе плитка
  // молча исчезнет, а каждый подход должен быть полноразмерным.
  for (const verbId of lesson.practice.featured ?? []) {
    assert(getVerbById(verbId), `${lesson.id}: featured verb ${verbId} is not in the database`);
    assert(
      practiceVerbs.includes(verbId),
      `${lesson.id}: featured verb ${verbId} is outside the practice selection`,
    );
  }

  const drills = lessonDrills(lesson);
  assert(drills.length >= 2, `${lesson.id}: expected at least one verb drill plus the full set`);
  assert(drills[drills.length - 1]?.isAll, `${lesson.id}: last drill must be the full set`);
  drillCount += drills.length;

  for (const drill of drills) {
    const size = drillSize(lesson, drill);
    if (drill.isAll) {
      assert.equal(size, EXAM_QUESTIONS, `${lesson.id}: full-set drill is only ${size} questions`);
    } else {
      assert(
        size >= PERSONS.length && size <= DRILL_QUESTIONS,
        `${lesson.id}/${drill.key}: drill of ${size} questions is out of range`,
      );
    }
  }
}

// Курс обязан покрывать всё, что умеет приложение: у каждого времени должен быть
// и урок с тренировкой, и хотя бы одна таблица в тексте.
const practicedTenses = new Set(LESSONS.flatMap(lesson => lesson.practice.tenses));
const tabledTenses = new Set(
  LESSONS.flatMap(lesson =>
    lesson.sections.flatMap(section => (section.table ? [section.table.tense] : [])),
  ),
);
for (const tense of TENSES) {
  assert(practicedTenses.has(tense), `Tense ${tense} has no lesson practice`);
  assert(tabledTenses.has(tense), `Tense ${tense} is never shown in a lesson table`);
}

const checkCount = Object.values(expected).reduce((total, checks) => total + checks.length, 0);
console.log(
  `Validated ${VERBS.length} verbs, ${formCount} forms and ${absentCount} absent slots ` +
    `across ${TENSES.length} tenses, ${checkCount} spot checks.`,
);
console.log(
  `Validated ${LESSONS.length} lessons with ${tableCount} embedded tables ` +
    `and ${drillCount} drills.`,
);
