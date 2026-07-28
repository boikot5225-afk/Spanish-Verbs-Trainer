import { strict as assert } from 'node:assert';
import { PERSONS, TENSES } from '../data/types';
import { getVerbById, searchVerbResults, VERBS } from '../data/verbs';

assert.equal(VERBS.length, 2129, `Expected 2129 verbs, got ${VERBS.length}`);

const ids = new Set<string>();
let formCount = 0;
let activeFormCount = 0;
for (const verb of VERBS) {
  assert(!ids.has(verb.id), `Duplicate verb id: ${verb.id}`);
  ids.add(verb.id);
  assert(verb.infinitive.trim(), `Empty infinitive for ${verb.id}`);
  assert(verb.translation.trim(), `Empty translation for ${verb.id}`);

  for (const tense of TENSES) {
    const forms = verb.conjugations[tense];
    assert.equal(forms.length, PERSONS.length, `${verb.id}/${tense}: expected 6 form slots`);
    for (const [index, form] of forms.entries()) {
      assert(form.form.trim(), `${verb.id}/${tense}/${PERSONS[index]}: empty form`);
      formCount += 1;
      if (form.available !== false && form.form !== '—') {
        assert(!/[0-9]/u.test(form.form), `${verb.id}/${tense}/${PERSONS[index]}: invalid form ${form.form}`);
        activeFormCount += 1;
      }
    }
  }
}

assert.equal(formCount, VERBS.length * TENSES.length * PERSONS.length);
assert.equal(activeFormCount, VERBS.length * 100, `Expected 100 usable forms per verb, got ${activeFormCount}`);

const expected: Record<string, Array<[string, number, string]>> = {
  ser: [
    ['presente', 0, 'soy'],
    ['preteriteIndef', 5, 'fueron'],
    ['subjuntivoImperfecto', 0, 'fuera'],
    ['imperativoAfirmativo', 1, 'sé'],
  ],
  estar: [
    ['presente', 0, 'estoy'],
    ['presenteContinuo', 0, 'estoy estando'],
    ['preteritePerfecto', 0, 'he estado'],
  ],
  tener: [
    ['presente', 1, 'tienes'],
    ['preteriteIndef', 0, 'tuve'],
    ['subjuntivoImperfecto', 3, 'tuviéramos'],
    ['imperativoAfirmativo', 1, 'ten'],
  ],
  hacer: [
    ['preteritePerfecto', 0, 'he hecho'],
    ['futuroPerfecto', 0, 'habré hecho'],
    ['subjuntivoPluscuamperfecto', 0, 'hubiera hecho'],
  ],
  ir: [
    ['futuroProximo', 0, 'voy a ir'],
    ['imperativoAfirmativo', 1, 've'],
    ['imperativoNegativo', 1, 'no vayas'],
  ],
  decir: [
    ['presenteContinuo', 0, 'estoy diciendo'],
    ['condicionalPerfecto', 0, 'habría dicho'],
    ['imperativoAfirmativo', 1, 'di'],
  ],
  ver: [
    ['pluscuamperfecto', 0, 'había visto'],
    ['subjuntivoPerfecto', 0, 'haya visto'],
  ],
  hablar: [
    ['presenteContinuo', 0, 'estoy hablando'],
    ['subjuntivoImperfecto', 0, 'hablara'],
    ['imperativoNegativo', 1, 'no hables'],
  ],
};

for (const [verbId, checks] of Object.entries(expected)) {
  const verb = getVerbById(verbId);
  if (!verb) throw new Error(`Missing expected verb: ${verbId}`);
  for (const [tense, personIndex, form] of checks) {
    const actual = verb.conjugations[tense as keyof typeof verb.conjugations][personIndex]?.form;
    assert.equal(actual, form, `${verbId}/${tense}/${PERSONS[personIndex]}: expected ${form}, got ${actual}`);
  }
}

const hablar = getVerbById('hablar');
assert(hablar?.conjugations.subjuntivoImperfecto[0]?.aliases?.includes('hablase'));
assert.equal(searchVerbResults('tuvieron')[0]?.verb.id, 'tener');
assert.equal(searchVerbResults('oir')[0]?.verb.id, 'oír');
assert.equal(searchVerbResults('habria hecho')[0]?.verb.id, 'hacer');
assert.equal(searchVerbResults('desidir')[0]?.verb.id, 'decidir');

console.log(`Validated ${VERBS.length} verbs, ${activeFormCount} usable forms, and full-form search.`);
