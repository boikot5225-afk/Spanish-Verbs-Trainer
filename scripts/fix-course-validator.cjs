const fs = require('node:fs');

const path = 'scripts/validate-verbs.ts';
let source = fs.readFileSync(path, 'utf8');

function indentAt(position) {
  const lineStart = source.lastIndexOf('\n', position) + 1;
  return source.slice(lineStart, position).match(/^\s*/u)?.[0] ?? '';
}

function replaceAssertByMessage(message, replacementLines) {
  const messageAt = source.indexOf(message);
  if (messageAt < 0) return false;

  const assertAt = Math.max(
    source.lastIndexOf('assert.equal(', messageAt),
    source.lastIndexOf('assert(', messageAt),
  );
  if (assertAt < 0) throw new Error(`Cannot find assert for: ${message}`);

  const lineStart = source.lastIndexOf('\n', assertAt) + 1;
  const indent = indentAt(assertAt);
  const endToken = ');';
  const assertEnd = source.indexOf(endToken, messageAt);
  if (assertEnd < 0) throw new Error(`Cannot find assert end for: ${message}`);
  const end = assertEnd + endToken.length;

  const replacement = replacementLines(indent).join('\n');
  source = source.slice(0, lineStart) + replacement + source.slice(end);
  return true;
}

// Обычные уроки требуют 6 форм в мини-подходе. У impératif существуют только
// tu/nous/vous; книжные уроки в режиме распознавания используют il/ils в двух временах.
replaceAssertByMessage(
  '`${lesson.id}/${drill.key}: drill of ${size} questions is out of range`',
  indent => [
    `${indent}const minimumDrillQuestions =`,
    `${indent}  lesson.block === 'imperatif' ? 3 : lesson.block === 'litteraire' ? 4 : PERSONS.length;`,
    `${indent}assert(`,
    `${indent}  size >= minimumDrillQuestions && size <= DRILL_QUESTIONS,`,
    `${indent}  \`${'${lesson.id}'}/${'${drill.key}'}: drill of ${'${size}'} questions is out of range\`,`,
    `${indent});`,
  ],
);

// В полном подходе неправильного impératif реально 5 глаголов × 3 лица = 15.
replaceAssertByMessage(
  '`${lesson.id}: full-set drill is only ${size} questions`',
  indent => [
    `${indent}const expectedFullDrill = lesson.id === 'imperatif-irreguliers' ? 15 : EXAM_QUESTIONS;`,
    `${indent}assert.equal(`,
    `${indent}  size,`,
    `${indent}  expectedFullDrill,`,
    `${indent}  \`${'${lesson.id}'}: full-set drill is only ${'${size}'} questions\`,`,
    `${indent});`,
  ],
);

// То же для проверки физически существующих imperative-форм.
replaceAssertByMessage(
  '`${lesson.id}: only ${real} real imperative forms, need ${EXAM_QUESTIONS}`',
  indent => [
    `${indent}const expectedImperativeForms = lesson.id === 'imperatif-irreguliers' ? 15 : EXAM_QUESTIONS;`,
    `${indent}assert(`,
    `${indent}  real >= expectedImperativeForms,`,
    `${indent}  \`${'${lesson.id}'}: only ${'${real}'} real imperative forms, need ${'${expectedImperativeForms}'}\`,`,
    `${indent});`,
  ],
);

// Если первый build-патч ещё не ввёл динамический размер зачёта, делаем это здесь.
if (!source.includes('const expectedExamQuestions =')) {
  replaceAssertByMessage(
    '`${lesson.id}: exam is only ${lessonExamSize(lesson)} questions, need ${EXAM_QUESTIONS}`',
    indent => [
      `${indent}const expectedExamQuestions =`,
      `${indent}  lesson.id === 'present-etre-avoir'`,
      `${indent}    ? 24`,
      `${indent}    : lesson.id === 'imperatif-irreguliers'`,
      `${indent}      ? 15`,
      `${indent}      : EXAM_QUESTIONS;`,
      `${indent}assert.equal(`,
      `${indent}  lessonExamSize(lesson),`,
      `${indent}  expectedExamQuestions,`,
      `${indent}  \`${'${lesson.id}'}: exam is only ${'${lessonExamSize(lesson)}'} questions, need ${'${expectedExamQuestions}'}\`,`,
      `${indent});`,
    ],
  );
} else {
  source = source.replace(
    /const expectedExamQuestions\s*=\s*lesson\.id === 'present-etre-avoir' \? 24 : EXAM_QUESTIONS;/u,
    [
      'const expectedExamQuestions =',
      "    lesson.id === 'present-etre-avoir'",
      '      ? 24',
      "      : lesson.id === 'imperatif-irreguliers'",
      '        ? 15',
      '        : EXAM_QUESTIONS;',
    ].join('\n'),
  );
}

fs.writeFileSync(path, source, 'utf8');
console.log('Aligned course validator with actual lesson question counts.');
