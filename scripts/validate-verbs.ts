import { strict as assert } from 'node:assert';
import {
  COMPOUND_TENSES,
  IMPERATIVE_TENSES,
  PERSONS,
  TENSES,
  type Tense,
} from '../data/types';
import { getVerbById, VERBS } from '../data/verbs';
import { LESSONS, lessonPracticeVerbIds } from '../data/lessons';

const EXPECTED_VERBS = 2129;
// 20 времён × 6 лиц, минус отсутствующее «yo» в двух формах императива.
const EXPECTED_FORMS = EXPECTED_VERBS * (TENSES.length * PERSONS.length - 2);

assert.equal(VERBS.length, EXPECTED_VERBS, `Expected ${EXPECTED_VERBS} verbs, got ${VERBS.length}`);
assert.equal(TENSES.length, 20, `Expected 20 tenses, got ${TENSES.length}`);

const WORD = 'a-záéíóúüñ';
const SIMPLE_RE = new RegExp(`^[${WORD}]+$`, 'u');
const COMPOUND_RE = new RegExp(`^h[${WORD}]+ [${WORD}]+$`, 'u');
const NEGATIVE_RE = new RegExp(`^no [${WORD}]+$`, 'u');

function expectedShape(tense: Tense): RegExp {
  if (COMPOUND_TENSES.has(tense)) return COMPOUND_RE;
  if (tense === 'imperativoNegativo') return NEGATIVE_RE;
  return SIMPLE_RE;
}

const ids = new Set<string>();
let formCount = 0;
let absentCount = 0;

for (const verb of VERBS) {
  assert(!ids.has(verb.id), `Duplicate verb id: ${verb.id}`);
  ids.add(verb.id);
  assert(verb.infinitive.trim(), `Empty infinitive for ${verb.id}`);
  assert(verb.translation.trim(), `Empty translation for ${verb.id}`);

  for (const nonFinite of ['gerundio', 'participio'] as const) {
    const form = verb[nonFinite].form;
    assert(SIMPLE_RE.test(form), `${verb.id}/${nonFinite}: invalid form ${form}`);
  }
  assert(verb.gerundio.form.endsWith('ndo'), `${verb.id}/gerundio: ${verb.gerundio.form}`);

  for (const tense of TENSES) {
    const forms = verb.conjugations[tense];
    assert.equal(forms.length, PERSONS.length, `${verb.id}/${tense}: expected 6 forms`);

    for (const [index, form] of forms.entries()) {
      const where = `${verb.id}/${tense}/${PERSONS[index]}`;

      if (form.absent) {
        assert(
          IMPERATIVE_TENSES.has(tense) && index === 0,
          `${where}: unexpected absent form`,
        );
        assert.equal(form.form, '', `${where}: absent form must be empty`);
        absentCount += 1;
        continue;
      }

      assert(form.form.trim(), `${where}: empty form`);
      assert(expectedShape(tense).test(form.form), `${where}: invalid form ${form.form}`);
      formCount += 1;
    }
  }

  // Императив не имеет формы 1-го лица ед. ч.
  for (const tense of IMPERATIVE_TENSES) {
    assert(verb.conjugations[tense][0]?.absent, `${verb.id}/${tense}: yo must be absent`);
  }
}

assert.equal(absentCount, EXPECTED_VERBS * 2, `Expected ${EXPECTED_VERBS * 2} absent slots, got ${absentCount}`);
assert.equal(formCount, EXPECTED_FORMS, `Expected ${EXPECTED_FORMS} forms, got ${formCount}`);

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
}

const checkCount = Object.values(expected).reduce((total, checks) => total + checks.length, 0);
console.log(
  `Validated ${VERBS.length} verbs, ${formCount} forms across ${TENSES.length} tenses, ` +
    `${checkCount} spot checks.`,
);
console.log(`Validated ${LESSONS.length} lessons with ${tableCount} embedded tables.`);
