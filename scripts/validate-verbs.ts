import { strict as assert } from 'node:assert';
import { PERSONS, TENSES } from '../data/types';
import { getVerbById, VERBS } from '../data/verbs';

assert.equal(VERBS.length, 2129, `Expected 2129 verbs, got ${VERBS.length}`);

const ids = new Set<string>();
let formCount = 0;
for (const verb of VERBS) {
  assert(!ids.has(verb.id), `Duplicate verb id: ${verb.id}`);
  ids.add(verb.id);
  assert(verb.infinitive.trim(), `Empty infinitive for ${verb.id}`);
  assert(verb.translation.trim(), `Empty translation for ${verb.id}`);

  for (const tense of TENSES) {
    const forms = verb.conjugations[tense];
    assert.equal(forms.length, PERSONS.length, `${verb.id}/${tense}: expected 6 forms`);
    for (const [index, form] of forms.entries()) {
      assert(form.form.trim(), `${verb.id}/${tense}/${PERSONS[index]}: empty form`);
      assert(/^[a-záéíóúüñ]+$/u.test(form.form), `${verb.id}/${tense}/${PERSONS[index]}: invalid form ${form.form}`);
      formCount += 1;
    }
  }
}
assert.equal(formCount, 76644, `Expected 76644 forms, got ${formCount}`);

const expected: Record<string, Array<[string, number, string]>> = {
  ser: [['presente', 0, 'soy'], ['preteriteIndef', 5, 'fueron'], ['subjuntivo', 3, 'seamos']],
  estar: [['presente', 0, 'estoy'], ['preteriteIndef', 2, 'estuvo'], ['subjuntivo', 5, 'estén']],
  tener: [['presente', 1, 'tienes'], ['preteriteIndef', 0, 'tuve'], ['futuro', 0, 'tendré']],
  hacer: [['presente', 0, 'hago'], ['preteriteIndef', 2, 'hizo'], ['subjuntivo', 3, 'hagamos']],
  ir: [['presente', 0, 'voy'], ['preteriteIndef', 3, 'fuimos'], ['subjuntivo', 0, 'vaya']],
  venir: [['presente', 0, 'vengo'], ['preteriteIndef', 0, 'vine'], ['futuro', 0, 'vendré']],
  poder: [['presente', 0, 'puedo'], ['preteriteIndef', 0, 'pude'], ['subjuntivo', 3, 'podamos']],
  querer: [['presente', 0, 'quiero'], ['preteriteIndef', 0, 'quise'], ['subjuntivo', 4, 'queráis']],
  decir: [['presente', 0, 'digo'], ['preteriteIndef', 5, 'dijeron'], ['subjuntivo', 3, 'digamos']],
  ver: [['presente', 0, 'veo'], ['preteriteImp', 0, 'veía'], ['subjuntivo', 3, 'veamos']],
  dar: [['presente', 0, 'doy'], ['preteriteIndef', 0, 'di'], ['subjuntivo', 1, 'des']],
  saber: [['presente', 0, 'sé'], ['preteriteIndef', 0, 'supe'], ['futuro', 0, 'sabré']],
  poner: [['presente', 0, 'pongo'], ['preteriteIndef', 0, 'puse'], ['futuro', 0, 'pondré']],
  salir: [['presente', 0, 'salgo'], ['futuro', 0, 'saldré'], ['subjuntivo', 0, 'salga']],
  traer: [['presente', 0, 'traigo'], ['preteriteIndef', 5, 'trajeron'], ['subjuntivo', 0, 'traiga']],
  construir: [['presente', 1, 'construyes'], ['preteriteIndef', 2, 'construyó']],
  seguir: [['preteriteIndef', 2, 'siguió'], ['subjuntivo', 3, 'sigamos']],
  avergonzar: [['presente', 0, 'avergüenzo'], ['subjuntivo', 3, 'avergoncemos']],
  oír: [['presente', 3, 'oímos'], ['preteriteIndef', 5, 'oyeron'], ['futuro', 0, 'oiré']],
  reír: [['presente', 0, 'río'], ['preteriteIndef', 2, 'rio'], ['subjuntivo', 4, 'riais']],
  desleír: [['presente', 0, 'deslío'], ['preteriteIndef', 2, 'deslió'], ['futuro', 0, 'desleiré']],
};

for (const [verbId, checks] of Object.entries(expected)) {
  const verb = getVerbById(verbId);
  if (!verb) throw new Error(`Missing expected verb: ${verbId}`);
  for (const [tense, personIndex, form] of checks) {
    const actual = verb.conjugations[tense as keyof typeof verb.conjugations][personIndex]?.form;
    assert.equal(actual, form, `${verbId}/${tense}/${PERSONS[personIndex]}: expected ${form}, got ${actual}`);
  }
}

console.log(`Validated ${VERBS.length} verbs and ${formCount} forms.`);
