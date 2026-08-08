import { strict as assert } from 'node:assert';
import { checkAnswer } from '../data/answer';
import {
  lessonExamAvailableCount,
  lessonExamQuestionCount,
  lessonExamVerbIds,
} from '../data/lesson-exam';
import { drillSize, getLessonById, lessonDrills, lessonPracticeVerbIds } from '../data/lessons';
import { PERSONS } from '../data/types';
import {
  countAvailableQuestions,
  getVerbById,
  quizAnswerVariants,
} from '../data/verbs';

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

// meure — форма mourir, а не инфинитив «двигать».
assert.equal(getVerbById('meure'), undefined);

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

// Зачёт «Четыре главных глагола» проверяет именно четыре показанных глагола,
// а не весь расширенный тренировочный список из десяти статей.
const coreLesson = getLessonById('present-etre-avoir');
assert(coreLesson);
assert.deepEqual(lessonExamVerbIds(coreLesson), ['être', 'avoir', 'aller', 'faire']);
assert.equal(lessonExamAvailableCount(coreLesson), 24);
assert.equal(lessonExamQuestionCount(coreLesson), 24);

// Третья группа на -ir не подмешивает courir: его семейство в уроке не объяснено.
const thirdIrLesson = getLessonById('present-g3-ir');
assert(thirdIrLesson);
assert.deepEqual(lessonPracticeVerbIds(thirdIrLesson), [
  'partir',
  'sortir',
  'dormir',
  'servir',
  'ouvrir',
  'offrir',
  'venir',
  'tenir',
]);

// Неправильный impératif проверяет только материал урока. У пяти глаголов
// реально 15 форм (tu/nous/vous), и счётчики тренировок обязаны это отражать.
const irregularImperative = getLessonById('imperatif-irreguliers');
assert(irregularImperative);
assert.deepEqual(lessonPracticeVerbIds(irregularImperative), [
  'être',
  'avoir',
  'savoir',
  'vouloir',
  'aller',
]);
const imperativeDrills = lessonDrills(irregularImperative);
assert.equal(drillSize(irregularImperative, imperativeDrills.find(item => item.key === 'être')!), 3);
assert.equal(drillSize(irregularImperative, imperativeDrills.find(item => item.key === '__all__')!), 15);

// Книжные темы — распознавание. Мини-подход по одному глаголу использует
// только третье лицо ед./мн. в двух книжных временах: 2 × 2 = 4 вопроса.
const literaryPast = getLessonById('litt-passe-simple');
assert(literaryPast);
const literaryPastDrill = lessonDrills(literaryPast).find(item => item.key === 'être');
assert(literaryPastDrill);
assert.equal(drillSize(literaryPast, literaryPastDrill), 4);

const literarySubj = getLessonById('litt-subjonctif-imparfait');
assert(literarySubj);
const literarySubjDrill = lessonDrills(literarySubj).find(item => item.key === 'être');
assert(literarySubjDrill);
assert.equal(drillSize(literarySubj, literarySubjDrill), 4);

// В тематических конструкциях пользователь может ввести ответ и без
// подлежащего, и с ним. Оба варианта должны засчитываться одинаково.
assert.equal(checkAnswer('va partir', 'va partir', 'strict').correct, true);
assert.equal(checkAnswer('il va partir', 'va partir', 'strict').correct, true);
assert.equal(checkAnswer('elle va partir', 'va partir', 'strict').correct, true);
assert.equal(checkAnswer('nous allons partir', 'allons partir', 'strict').correct, true);
assert.equal(checkAnswer("j'ai parlé", 'ai parlé', 'strict').correct, true);
assert.deepEqual(checkAnswer('il va etudier', 'va étudier', 'warn'), {
  correct: true,
  accentMismatch: true,
  looksLikeTypo: false,
});
assert.equal(checkAnswer('il va etudier', 'va étudier', 'strict').correct, false);

// Для одиночной формы подлежащее не подмешивается автоматически: карточка
// по-прежнему проверяет именно спряжённую форму.
assert.equal(checkAnswer('je vais', 'vais', 'strict').correct, false);

// В составных временах с être форма карточки il/elle допускает оба рода.
const allerIlPc = {
  verbId: 'aller',
  tense: 'passeCompose' as const,
  person: 'il' as const,
  correctAnswer: form('aller', 'passeCompose', 2),
};
assert.deepEqual(quizAnswerVariants(allerIlPc), ['est allé', 'est allée']);
assert(
  quizAnswerVariants(allerIlPc).some(expected =>
    checkAnswer('elle est allée', expected, 'strict').correct,
  ),
);
const allerIlsPc = {
  verbId: 'aller',
  tense: 'passeCompose' as const,
  person: 'ils' as const,
  correctAnswer: form('aller', 'passeCompose', 5),
};
assert.deepEqual(quizAnswerVariants(allerIlsPc), ['sont allés', 'sont allées']);

// С avoir и у местоименных глаголов нельзя механически добавлять женское
// согласование: там действуют другие правила.
const parlerIlPc = {
  verbId: 'parler',
  tense: 'passeCompose' as const,
  person: 'il' as const,
  correctAnswer: form('parler', 'passeCompose', 2),
};
assert.deepEqual(quizAnswerVariants(parlerIlPc), ['a parlé']);
const seLaverIlPc = {
  verbId: 'se laver',
  tense: 'passeCompose' as const,
  person: 'il' as const,
  correctAnswer: form('se laver', 'passeCompose', 2),
};
assert.deepEqual(quizAnswerVariants(seLaverIlPc), ["s'est lavé"]);

console.log('French regression checks passed');
