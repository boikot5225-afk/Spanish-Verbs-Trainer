import { strict as assert } from 'node:assert';
import { PERSONS } from '../data/types';
import { countAvailableQuestions, getVerbById } from '../data/verbs';

function form(verbId: string, tense: Parameters<typeof countAvailableQuestions>[1][number], personIndex: number): string {
  const verb = getVerbById(verbId);
  assert(verb, `Missing verb: ${verbId}`);
  const value = verb.conjugations[tense]?.[personIndex];
  assert(value && !value.absent, `Missing form: ${verbId}/${tense}/${personIndex}`);
  return value.form;
}

// Ложная отдельная статья не должна возвращаться: современное употребление — se souvenir.
assert.equal(getVerbById('souvenir'), undefined);
assert(getVerbById('se souvenir'));

// Вторая группа: asservir → nous asservissons, participe présent asservissant.
const asservir = getVerbById('asservir');
assert(asservir);
assert.equal(asservir.group, '2');
assert.equal(form('asservir', 'present', 3), 'asservissons');
assert.equal(asservir.participePresent.form, 'asservissant');

// s'enfuir наследует неправильную парадигму fuir и остаётся местоименным.
const senfuir = getVerbById("s'enfuir");
assert(senfuir);
assert.equal(senfuir.group, '3');
assert.equal(senfuir.aux, 'etre');
assert.equal(form("s'enfuir", 'present', 0), "m'enfuis");
assert.equal(form("s'enfuir", 'present', 3), 'nous enfuyons');
assert.equal(form("s'enfuir", 'present', 5), "s'enfuient");
assert.equal(form("s'enfuir", 'passeCompose', 0), 'me suis enfui');
assert.equal(form("s'enfuir", 'imperatifPresent', 1), 'enfuis-toi');
assert.equal(form("s'enfuir", 'imperatifPasse', 1), 'sois-toi enfui');
assert.equal(senfuir.participePresent.form, "s'enfuyant");

// В составном императиве местоимение стоит после вспомогательного глагола.
const seLaver = getVerbById('se laver');
assert(seLaver);
assert.equal(form('se laver', 'imperatifPasse', 1), 'sois-toi lavé');
assert.equal(form('se laver', 'imperatifPasse', 3), 'soyons-nous lavés');
assert.equal(seLaver.participePresent.form, 'se lavant');

// Нельзя обещать пользователю вопрос, если выбранная форма не существует.
assert.equal(
  countAvailableQuestions(['pouvoir'], ['imperatifPresent'], PERSONS),
  0,
);
assert.equal(
  countAvailableQuestions(['parler'], ['imperatifPresent'], PERSONS),
  3,
);

console.log('French regression checks passed');
