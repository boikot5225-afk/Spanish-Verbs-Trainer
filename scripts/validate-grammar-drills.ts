import assert from 'node:assert/strict';
import {
  GRAMMAR_EXAM_QUESTIONS,
  GRAMMAR_LESSON_IDS,
  grammarBankSize,
  grammarQuestions,
  type GrammarLessonId,
} from '../data/grammar-drills';

function bank(id: GrammarLessonId) {
  return grammarQuestions(id, 10_000);
}

for (const id of GRAMMAR_LESSON_IDS) {
  const size = grammarBankSize(id);
  assert.ok(
    size >= GRAMMAR_EXAM_QUESTIONS,
    `${id}: bank has ${size}, exam needs ${GRAMMAR_EXAM_QUESTIONS}`,
  );

  const questions = bank(id);
  assert.equal(questions.length, size, `${id}: materialized bank lost questions`);

  for (const [index, question] of questions.entries()) {
    assert.ok(question.prompt.trim().length >= 8, `${id} #${index + 1}: prompt too short`);
    assert.ok(question.headerTitle.trim(), `${id} #${index + 1}: missing header title`);
    assert.ok(question.headerSubtitle.trim(), `${id} #${index + 1}: missing header subtitle`);
    assert.ok(question.explanation.trim().length >= 12, `${id} #${index + 1}: explanation too short`);
    assert.ok(question.correctAnswer.trim(), `${id} #${index + 1}: empty answer`);

    const options = question.options ?? [];
    assert.ok(options.length >= 2 && options.length <= 4, `${id} #${index + 1}: need 2–4 options`);
    assert.equal(new Set(options).size, options.length, `${id} #${index + 1}: duplicate options`);
    assert.equal(
      options.filter(option => option === question.correctAnswer).length,
      1,
      `${id} #${index + 1}: correct answer must occur exactly once`,
    );
  }
}

const pronouns = bank('syntax-pronoms-y-en');
for (const required of ['Je le lui donne.', 'Il leur en parle.', 'Vas-y !', 'Ne m’en parle pas !']) {
  assert.ok(pronouns.some(item => item.correctAnswer === required), `pronouns: missing ${required}`);
}

const prepositions = bank('syntax-prepositions');
const prepAnswers = new Set(prepositions.map(item => item.correctAnswer));
for (const required of ['à', 'de', '—']) {
  assert.ok(prepAnswers.has(required), `prepositions: missing answer class ${required}`);
}

const agreement = bank('syntax-participe-cod');
for (const required of ['écrites', 'vue', 'lavé', 'parlé', 'rencontrées', 'fait']) {
  assert.ok(agreement.some(item => item.correctAnswer === required), `agreement: missing ${required}`);
}

const si = bank('syntax-si');
assert.ok(si.some(item => item.correctAnswer === 'avais su'), 'si: missing plus-que-parfait model');
assert.ok(si.some(item => item.correctAnswer === 'aurait réussi'), 'si: missing conditionnel passé model');
assert.ok(si.some(item => item.correctAnswer === 'viens'), 'si: missing real condition model');
for (const item of si) {
  const correctSentence = item.speechText ?? '';
  assert.ok(!/\bsi\s+[^,.!?]*\baurais\b/iu.test(correctSentence), `si: suspicious conditionnel after si: ${correctSentence}`);
  assert.ok(!/\bsi\s+[^,.!?]*\bviendras\b/iu.test(correctSentence), `si: suspicious futur after si: ${correctSentence}`);
}

const past = bank('syntax-past-contrast');
assert.ok(past.every(item => (item.options ?? []).length === 3), 'past contrast must always offer 3 tenses');
for (const required of ['allais', 'ai vu', 'avait mangé']) {
  assert.ok(past.some(item => item.correctAnswer === required), `past contrast: missing ${required}`);
}

const time = bank('syntax-time-markers');
const timeAnswers = new Set(time.map(item => item.correctAnswer));
for (const required of ['depuis', 'pendant', 'il y a', 'pour', 'Ça fait']) {
  assert.ok(timeAnswers.has(required), `time markers: missing ${required}`);
}

console.log(
  `Grammar drill validation OK: ${GRAMMAR_LESSON_IDS.map(id => `${id}=${grammarBankSize(id)}`).join(', ')}`,
);
