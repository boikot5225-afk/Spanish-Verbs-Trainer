import { strict as assert } from 'node:assert';
import {
  COMPOUND_TENSES,
  IMPERATIVE_TENSES,
  NON_FINITE_FORMS,
  PERSONS,
  TENSES,
  type Tense,
} from '../data/types';
import { getVerbById, periphrasisForm, VERBS } from '../data/verbs';
import {
  DRILL_QUESTIONS,
  EXAM_QUESTIONS,
  LESSONS,
  drillSize,
  lessonDrills,
  lessonExamSize,
  lessonPracticeVerbIds,
} from '../data/lessons';

const EXPECTED_VERBS = 2140;

assert.equal(VERBS.length, EXPECTED_VERBS, `Expected ${EXPECTED_VERBS} verbs, got ${VERBS.length}`);
assert.equal(TENSES.length, 20, `Expected 20 tenses, got ${TENSES.length}`);

const WORD = 'a-záéíóúüñ';
const SIMPLE_RE = new RegExp(`^[${WORD}]+$`, 'u');
const COMPOUND_RE = new RegExp(`^h[${WORD}]+ [${WORD}]+$`, 'u');
const NEGATIVE_RE = new RegExp(`^no [${WORD}]+$`, 'u');
const REFLEXIVE_RE = new RegExp(`^(?:me|te|se|nos|os) [${WORD}]+$`, 'u');
const REFLEXIVE_COMPOUND_RE = new RegExp(
  `^(?:me|te|se|nos|os) h[${WORD}]+ [${WORD}]+$`,
  'u',
);
const REFLEXIVE_NEGATIVE_RE = new RegExp(
  `^no (?:me|te|se|nos|os) [${WORD}]+$`,
  'u',
);

function expectedShape(tense: Tense, reflexive: boolean): RegExp {
  if (COMPOUND_TENSES.has(tense)) return reflexive ? REFLEXIVE_COMPOUND_RE : COMPOUND_RE;
  if (tense === 'imperativoNegativo') return reflexive ? REFLEXIVE_NEGATIVE_RE : NEGATIVE_RE;
  if (reflexive && tense !== 'imperativoAfirmativo') return REFLEXIVE_RE;
  return SIMPLE_RE;
}

const ids = new Set<string>();
let formCount = 0;
let absentCount = 0;

for (const verb of VERBS) {
  const reflexive = verb.infinitive.endsWith('se');
  assert(!ids.has(verb.id), `Duplicate verb id: ${verb.id}`);
  ids.add(verb.id);
  assert(verb.infinitive.trim(), `Empty infinitive for ${verb.id}`);
  assert(verb.translation.trim(), `Empty translation for ${verb.id}`);
  assert(/[А-Яа-яЁё]/u.test(verb.translation), `${verb.id}: translation is not Russian`);
  // Следы машинного перевода английской глоссы: латиница в переводе и одно
  // и то же значение, перечисленное дважды («платить, платить (за что-л.)»).
  assert(
    !/[A-Za-z]/u.test(verb.translation),
    `${verb.id}: latin letters left in translation "${verb.translation}"`,
  );
  const senses = verb.translation
    .split(/[,;/]/u)
    .map(sense => sense.replace(/\s*\(.*?\)/gu, '').trim())
    .filter(Boolean);
  assert.equal(
    new Set(senses).size,
    senses.length,
    `${verb.id}: repeated sense in translation "${verb.translation}"`,
  );

  for (const nonFinite of ['gerundio', 'participio'] as const) {
    const form = verb[nonFinite].form;
    assert(SIMPLE_RE.test(form), `${verb.id}/${nonFinite}: invalid form ${form}`);
  }
  assert(
    verb.gerundio.form.endsWith(reflexive ? 'ndose' : 'ndo'),
    `${verb.id}/gerundio: ${verb.gerundio.form}`,
  );

  for (const tense of TENSES) {
    const forms = verb.conjugations[tense];
    assert.equal(forms.length, PERSONS.length, `${verb.id}/${tense}: expected 6 forms`);

    for (const [index, form] of forms.entries()) {
      const where = `${verb.id}/${tense}/${PERSONS[index]}`;

      if (form.absent) {
        const defectAllowed =
          (verb.types.includes('defective no future conditional imperative') &&
            [
              'futuro',
              'condicional',
              'futuroPerfecto',
              'condicionalPerfecto',
              'imperativoAfirmativo',
              'imperativoNegativo',
            ].includes(tense)) ||
          (verb.types.includes('defective third person') &&
            (IMPERATIVE_TENSES.has(tense) || ![2, 5].includes(index))) ||
          (verb.types.includes('impersonal third singular') &&
            (IMPERATIVE_TENSES.has(tense) || index !== 2));
        assert(
          (IMPERATIVE_TENSES.has(tense) && index === 0) || defectAllowed,
          `${where}: unexpected absent form`,
        );
        assert.equal(form.form, '', `${where}: absent form must be empty`);
        absentCount += 1;
        continue;
      }

      assert(form.form.trim(), `${where}: empty form`);
      assert(expectedShape(tense, reflexive).test(form.form), `${where}: invalid form ${form.form}`);
      formCount += 1;
    }
  }

  // У обычного глагола императив не имеет формы 1-го лица ед. ч.;
  // у недостаточного глагола могут отсутствовать и другие формы.
  for (const tense of IMPERATIVE_TENSES) {
    assert(verb.conjugations[tense][0]?.absent, `${verb.id}/${tense}: yo must be absent`);
  }
}

assert.equal(
  formCount + absentCount,
  EXPECTED_VERBS * TENSES.length * PERSONS.length,
  'Every conjugation slot must be a form or explicitly absent',
);

type Check = [Tense | 'gerundio' | 'participio', number, string];

const expected: Record<string, Check[]> = {
  // Простые времена — регрессия относительно прежнего набора
  ser: [
    ['presente', 0, 'soy'],
    ['preteriteIndef', 5, 'fueron'],
    ['subjuntivo', 3, 'seamos'],
    ['subjImperfectoRa', 0, 'fuera'],
    ['subjImperfectoSe', 3, 'fuésemos'],
    ['imperativoAfirmativo', 1, 'sé'],
    ['perfecto', 0, 'he sido'],
    ['gerundio', 0, 'siendo'],
  ],
  estar: [
    ['presente', 0, 'estoy'],
    ['preteriteIndef', 2, 'estuvo'],
    ['subjuntivo', 5, 'estén'],
    ['subjImperfectoRa', 3, 'estuviéramos'],
    ['imperativoAfirmativo', 2, 'esté'],
    ['gerundio', 0, 'estando'],
  ],
  tener: [
    ['presente', 1, 'tienes'],
    ['preteriteIndef', 0, 'tuve'],
    ['futuro', 0, 'tendré'],
    ['subjImperfectoRa', 0, 'tuviera'],
    ['imperativoAfirmativo', 1, 'ten'],
    ['pluscuamperfecto', 0, 'había tenido'],
  ],
  hacer: [
    ['presente', 0, 'hago'],
    ['preteriteIndef', 2, 'hizo'],
    ['subjuntivo', 3, 'hagamos'],
    ['imperativoAfirmativo', 1, 'haz'],
    ['subjPluscuamRa', 0, 'hubiera hecho'],
    ['participio', 0, 'hecho'],
  ],
  ir: [
    ['presente', 0, 'voy'],
    ['preteriteIndef', 3, 'fuimos'],
    ['subjuntivo', 0, 'vaya'],
    ['subjImperfectoRa', 0, 'fuera'],
    ['imperativoAfirmativo', 1, 've'],
    ['imperativoAfirmativo', 3, 'vamos'],
    ['imperativoAfirmativo', 4, 'id'],
    ['imperativoNegativo', 1, 'no vayas'],
    ['gerundio', 0, 'yendo'],
  ],
  venir: [
    ['presente', 0, 'vengo'],
    ['preteriteIndef', 0, 'vine'],
    ['futuro', 0, 'vendré'],
    ['imperativoAfirmativo', 1, 'ven'],
    ['gerundio', 0, 'viniendo'],
  ],
  poder: [
    ['presente', 0, 'puedo'],
    ['preteriteIndef', 0, 'pude'],
    ['subjuntivo', 3, 'podamos'],
    ['subjImperfectoRa', 0, 'pudiera'],
    ['gerundio', 0, 'pudiendo'],
  ],
  querer: [
    ['presente', 0, 'quiero'],
    ['preteriteIndef', 0, 'quise'],
    ['subjuntivo', 4, 'queráis'],
    ['subjImperfectoSe', 0, 'quisiese'],
  ],
  decir: [
    ['presente', 0, 'digo'],
    ['preteriteIndef', 5, 'dijeron'],
    ['subjuntivo', 3, 'digamos'],
    ['subjImperfectoRa', 0, 'dijera'],
    ['imperativoAfirmativo', 1, 'di'],
    ['participio', 0, 'dicho'],
    ['gerundio', 0, 'diciendo'],
  ],
  ver: [
    ['presente', 0, 'veo'],
    ['preteriteImp', 0, 'veía'],
    ['subjuntivo', 3, 'veamos'],
    ['imperativoAfirmativo', 1, 've'],
    ['participio', 0, 'visto'],
  ],
  dar: [
    ['presente', 0, 'doy'],
    ['preteriteIndef', 0, 'di'],
    ['subjuntivo', 1, 'des'],
    ['subjImperfectoRa', 0, 'diera'],
    ['imperativoAfirmativo', 1, 'da'],
  ],
  saber: [
    ['presente', 0, 'sé'],
    ['preteriteIndef', 0, 'supe'],
    ['futuro', 0, 'sabré'],
    ['subjImperfectoRa', 0, 'supiera'],
    ['imperativoAfirmativo', 2, 'sepa'],
  ],
  poner: [
    ['presente', 0, 'pongo'],
    ['preteriteIndef', 0, 'puse'],
    ['futuro', 0, 'pondré'],
    ['imperativoAfirmativo', 1, 'pon'],
    ['participio', 0, 'puesto'],
  ],
  componer: [
    ['imperativoAfirmativo', 1, 'compón'],
    ['participio', 0, 'compuesto'],
    ['subjImperfectoRa', 3, 'compusiéramos'],
  ],
  salir: [
    ['presente', 0, 'salgo'],
    ['futuro', 0, 'saldré'],
    ['subjuntivo', 0, 'salga'],
    ['imperativoAfirmativo', 1, 'sal'],
  ],
  haber: [
    ['presente', 0, 'he'],
    ['subjImperfectoRa', 0, 'hubiera'],
    ['subjImperfectoSe', 3, 'hubiésemos'],
    ['subjFuturo', 0, 'hubiere'],
  ],
  traer: [
    ['presente', 0, 'traigo'],
    ['preteriteIndef', 5, 'trajeron'],
    ['subjuntivo', 0, 'traiga'],
    ['subjImperfectoRa', 0, 'trajera'],
    ['participio', 0, 'traído'],
    ['gerundio', 0, 'trayendo'],
  ],
  construir: [
    ['presente', 1, 'construyes'],
    ['preteriteIndef', 2, 'construyó'],
    ['subjImperfectoRa', 0, 'construyera'],
    ['participio', 0, 'construido'],
  ],
  conducir: [
    ['subjImperfectoRa', 0, 'condujera'],
    ['gerundio', 0, 'conduciendo'],
  ],
  seguir: [
    ['preteriteIndef', 2, 'siguió'],
    ['subjuntivo', 3, 'sigamos'],
    ['gerundio', 0, 'siguiendo'],
  ],
  avergonzar: [
    ['presente', 0, 'avergüenzo'],
    ['subjuntivo', 3, 'avergoncemos'],
  ],
  oír: [
    ['presente', 3, 'oímos'],
    ['preteriteIndef', 5, 'oyeron'],
    ['futuro', 0, 'oiré'],
    ['imperativoAfirmativo', 4, 'oíd'],
    ['participio', 0, 'oído'],
    ['gerundio', 0, 'oyendo'],
  ],
  reír: [
    ['presente', 0, 'río'],
    ['preteriteIndef', 2, 'rio'],
    ['subjuntivo', 4, 'riais'],
    ['imperativoAfirmativo', 4, 'reíd'],
    ['participio', 0, 'reído'],
    ['gerundio', 0, 'riendo'],
  ],
  desleír: [
    ['presente', 0, 'deslío'],
    ['preteriteIndef', 2, 'deslió'],
    ['futuro', 0, 'desleiré'],
  ],
  dormir: [
    ['subjImperfectoRa', 0, 'durmiera'],
    ['imperativoAfirmativo', 3, 'durmamos'],
    ['gerundio', 0, 'durmiendo'],
  ],
  morir: [
    ['participio', 0, 'muerto'],
    ['gerundio', 0, 'muriendo'],
  ],
  volver: [
    ['participio', 0, 'vuelto'],
    ['imperativoAfirmativo', 1, 'vuelve'],
  ],
  escribir: [['participio', 0, 'escrito']],
  describir: [['participio', 0, 'descrito']],
  freír: [['participio', 0, 'frito']],
  abrir: [['participio', 0, 'abierto']],
  descubrir: [['participio', 0, 'descubierto']],
  resolver: [['participio', 0, 'resuelto']],
  disolver: [['participio', 0, 'disuelto']],
  predecir: [['participio', 0, 'predicho']],
  bendecir: [
    ['participio', 0, 'bendecido'],
    ['gerundio', 0, 'bendiciendo'],
  ],
  prever: [
    ['participio', 0, 'previsto'],
    ['imperativoAfirmativo', 1, 'prevé'],
  ],
  satisfacer: [['participio', 0, 'satisfecho']],
  romper: [['participio', 0, 'roto']],
  pudrir: [['participio', 0, 'podrido']],
  leer: [
    ['subjImperfectoRa', 0, 'leyera'],
    ['participio', 0, 'leído'],
    ['gerundio', 0, 'leyendo'],
  ],
  caer: [['participio', 0, 'caído']],
  huir: [['participio', 0, 'huido']],
  gruñir: [['gerundio', 0, 'gruñendo']],
  // Полностью правильные образцы всех трёх спряжений
  hablar: [
    ['subjImperfectoRa', 3, 'habláramos'],
    ['subjImperfectoSe', 0, 'hablase'],
    ['subjFuturo', 0, 'hablare'],
    ['imperativoAfirmativo', 4, 'hablad'],
    ['imperativoNegativo', 1, 'no hables'],
    ['perfecto', 0, 'he hablado'],
    ['anterior', 0, 'hube hablado'],
    ['futuroPerfecto', 0, 'habré hablado'],
    ['condicionalPerfecto', 0, 'habría hablado'],
    ['subjPerfecto', 0, 'haya hablado'],
    ['subjPluscuamSe', 0, 'hubiese hablado'],
    ['subjFuturoPerfecto', 0, 'hubiere hablado'],
  ],
  comer: [
    ['subjImperfectoRa', 3, 'comiéramos'],
    ['imperativoAfirmativo', 4, 'comed'],
    ['imperativoNegativo', 5, 'no coman'],
  ],
  vivir: [
    ['imperativoAfirmativo', 4, 'vivid'],
    ['subjFuturo', 3, 'viviéremos'],
  ],
  levantarse: [
    ['presente', 0, 'me levanto'],
    ['perfecto', 3, 'nos hemos levantado'],
    ['imperativoAfirmativo', 1, 'levántate'],
    ['imperativoAfirmativo', 3, 'levantémonos'],
    ['imperativoAfirmativo', 4, 'levantaos'],
    ['imperativoNegativo', 1, 'no te levantes'],
    ['gerundio', 0, 'levantándose'],
  ],
  dormirse: [
    ['presente', 0, 'me duermo'],
    ['imperativoAfirmativo', 4, 'dormíos'],
    ['gerundio', 0, 'durmiéndose'],
  ],
  irse: [
    ['presente', 0, 'me voy'],
    ['imperativoAfirmativo', 1, 'vete'],
    ['imperativoAfirmativo', 3, 'vámonos'],
    ['imperativoAfirmativo', 4, 'idos'],
    ['imperativoNegativo', 5, 'no se vayan'],
  ],
  soler: [
    ['futuro', 0, ''],
    ['condicional', 0, ''],
    ['imperativoAfirmativo', 1, ''],
  ],
  sosegar: [
    ['presente', 0, 'sosiego'],
    ['subjuntivo', 0, 'sosiegue'],
  ],
  restregar: [
    ['presente', 0, 'restriego'],
    ['subjuntivo', 5, 'restrieguen'],
  ],
  cartografiar: [
    ['presente', 0, 'cartografío'],
    ['subjuntivo', 5, 'cartografíen'],
  ],
  rociar: [
    ['presente', 0, 'rocío'],
    ['subjuntivo', 2, 'rocíe'],
  ],
  rehacer: [
    ['preteriteIndef', 0, 'rehíce'],
    ['preteriteIndef', 2, 'rehízo'],
  ],
  desoír: [['presente', 3, 'desoímos']],
  fluir: [
    ['presente', 4, 'fluis'],
    ['preteriteIndef', 0, 'flui'],
  ],
  rehuir: [
    ['subjuntivo', 3, 'rehuyamos'],
    ['subjuntivo', 4, 'rehuyáis'],
  ],
  podrir: [
    ['presente', 0, 'pudro'],
    ['preteriteImp', 3, 'pudríamos'],
    ['preteriteIndef', 2, 'pudrió'],
    ['futuro', 0, 'pudriré'],
    ['subjuntivo', 4, 'pudráis'],
    ['gerundio', 0, 'pudriendo'],
    ['participio', 0, 'podrido'],
  ],
  acaecer: [
    ['presente', 0, ''],
    ['presente', 2, 'acaece'],
    ['presente', 5, 'acaecen'],
    ['imperativoAfirmativo', 2, ''],
  ],
  concernir: [
    ['presente', 0, ''],
    ['presente', 2, 'concierne'],
    ['presente', 5, 'conciernen'],
  ],
  diluviar: [
    ['presente', 0, ''],
    ['presente', 2, 'diluvia'],
    ['presente', 5, ''],
  ],
  lloviznar: [
    ['preteriteImp', 0, ''],
    ['preteriteImp', 2, 'lloviznaba'],
    ['preteriteImp', 5, ''],
  ],
};

for (const [verbId, checks] of Object.entries(expected)) {
  const verb = getVerbById(verbId);
  if (!verb) throw new Error(`Missing expected verb: ${verbId}`);
  for (const [tense, personIndex, form] of checks) {
    const actual =
      tense === 'gerundio' || tense === 'participio'
        ? verb[tense].form
        : verb.conjugations[tense][personIndex]?.form;
    assert.equal(actual, form, `${verbId}/${tense}/${personIndex}: expected ${form}, got ${actual}`);
  }
}

// ── Уроки ────────────────────────────────────────────────────────────────────
const lessonIds = new Set<string>();
let tableCount = 0;
let drillCount = 0;

/**
 * Время считается введённым тем уроком, который его и показывает таблицей,
 * и тренирует: попутная таблица в чужой теме объяснением не является.
 */
const introducedAt = new Map<Tense, number>();
LESSONS.forEach((lesson, index) => {
  for (const section of lesson.sections) {
    const tense = section.table?.tense;
    if (!tense || introducedAt.has(tense)) continue;
    if (lesson.practice.tenses.includes(tense)) introducedAt.set(tense, index);
  }
});

for (const [index, lesson] of LESSONS.entries()) {
  // Курс проходится по порядку, поэтому тема не имеет права спрашивать форму
  // времени, которое разбирается позже: зачёт открывает следующую тему, а
  // ученик такого ещё не видел. Так «Estar + герундий» гонял futuro за пять
  // уроков до того, как его объяснят.
  const clozeTenses = (lesson.practice.cloze ?? []).map(item => item.tense ?? 'presente');
  for (const tense of [
    ...lesson.practice.tenses,
    ...(lesson.practice.periphrasis?.tenses ?? []),
    ...clozeTenses,
  ]) {
    const at = introducedAt.get(tense);
    assert(
      at !== undefined && at <= index,
      `${lesson.id} (#${index}): practices ${tense}, introduced ` +
        (at === undefined ? 'nowhere' : `only at #${at} ${LESSONS[at]!.id}`),
    );
  }
}

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

  // Тема обязана что-то спрашивать, но не обязательно спряжение: тема
  // о конструкции тренирует estoy comiendo, а голый презенс comer ей ни к чему.
  assert(
    lesson.practice.tenses.length > 0 ||
      (lesson.practice.forms?.length ?? 0) > 0 ||
      (lesson.practice.periphrasis?.tenses.length ?? 0) > 0 ||
      (lesson.practice.cloze?.length ?? 0) > 0,
    `${lesson.id}: practice asks for nothing`,
  );

  // Пропуск обязан быть решаемым: пропуск на месте, глагол в базе, форма
  // непустая, а перевод и пояснение есть — без них ошибка ничему не учит.
  for (const item of lesson.practice.cloze ?? []) {
    const where = `${lesson.id}: cloze "${item.text}"`;
    assert(item.text.includes('___'), `${where} has no gap`);
    assert(item.translation.trim(), `${where} has no translation`);
    assert(item.reason.trim(), `${where} has no reason`);
    const verb = getVerbById(item.verbId);
    assert(verb, `${where} refers to unknown verb ${item.verbId}`);
    const tense = item.tense ?? 'presente';
    assert(
      lesson.practice.verbIds?.includes(item.verbId),
      `${where}: ${item.verbId} is outside the topic's verbs, so its drill would never show it`,
    );
    const form = verb!.conjugations[tense][PERSONS.indexOf(item.person)];
    assert(form && !form.absent && form.form, `${where} has no form for ${item.person}`);
  }
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
      // Подход по одному глаголу не может быть длиннее его форм: при одном
      // времени это ровно парадигма из шести лиц.
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

// Герундий и причастие приложение строит и проверяет наравне со спряжениями, но
// спросить их было нечем: вопрос описывался парой «время + лицо», а у неличной
// формы лица нет. Тема «Estar + герундий» из-за этого гоняла презенс estar и ни
// разу сам герундий. Требуем того же, что и от времён, — иначе форма снова
// окажется сгенерированной, оттестированной и никому не заданной.
// Конструкция должна быть построима на всей выборке темы: если вспомогательного
// нет в базе или у него нет нужной формы, вопрос молча выпадет из зачёта, а тема
// снова начнёт спрашивать не то, чему учит.
for (const lesson of LESSONS) {
  const periphrasis = lesson.practice.periphrasis;
  if (!periphrasis) continue;
  const auxiliary = getVerbById(periphrasis.auxiliary);
  assert(auxiliary, `${lesson.id}: periphrasis auxiliary ${periphrasis.auxiliary} is not in the database`);
  for (const tense of periphrasis.tenses) {
    for (const verbId of lessonPracticeVerbIds(lesson)) {
      const verb = getVerbById(verbId)!;
      const built = periphrasisForm(periphrasis, verb, tense, 0);
      assert(
        built.includes(' '),
        `${lesson.id}: periphrasis ${periphrasis.auxiliary}+${periphrasis.form} is empty for ${verbId}/${tense}`,
      );
    }
  }
}

// Форма считается отработанной и внутри конструкции, а не только отдельным
// вопросом: причастие живёт в каждом составном времени (he hablado), герундий —
// в перифразе (estoy comiendo). Требовать голого вопроса значило бы толкать темы
// спрашивать половину связки вместо связки — ровно ту ошибку, из-за которой
// правило и появилось.
const practicedForms = new Set(
  LESSONS.flatMap(lesson => {
    const forms = [...(lesson.practice.forms ?? [])];
    if (lesson.practice.periphrasis) forms.push(lesson.practice.periphrasis.form);
    if (lesson.practice.tenses.some(tense => COMPOUND_TENSES.has(tense))) forms.push('participio');
    return forms;
  }),
);
for (const form of NON_FINITE_FORMS) {
  assert(practicedForms.has(form), `Non-finite form ${form} is never exercised by a lesson`);
}

const checkCount = Object.values(expected).reduce((total, checks) => total + checks.length, 0);
console.log(
  `Validated ${VERBS.length} verbs, ${formCount} forms across ${TENSES.length} tense/mood forms, ` +
    `${checkCount} spot checks.`,
);
console.log(
  `Validated ${LESSONS.length} lessons with ${tableCount} embedded tables ` +
    `and ${drillCount} drills.`,
);
