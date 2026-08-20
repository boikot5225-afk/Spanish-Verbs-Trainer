const fs = require('node:fs');

function edit(path, transform) {
  const source = fs.readFileSync(path, 'utf8');
  const next = transform(source);
  if (next !== source) fs.writeFileSync(path, next, 'utf8');
}

// Тематический генератор исторически умеет строить собственный набор вопросов.
// Это удобно для конструкций, но опасно: он не должен подмешивать время/наклонение,
// которого уже нет в финальной программе урока после редакторских патчей.
edit('data/thematic-exercise-adapter.ts', source => {
  if (!source.includes("from './lessons'")) {
    const anchor = "import { getVerbById, shuffle } from './verbs';";
    if (!source.includes(anchor)) throw new Error('Prerequisite fix: adapter verb import not found');
    source = source.replace(anchor, `${anchor}\nimport { getLessonById } from './lessons';`);
  }

  const oldBlock = [
    "  const adapted = lessonId === 'constr-il-faut'",
    '    ? adaptIlFaut(questions, mode)',
    '    : buildThematicExerciseQuestions(questions, mode, lessonId);',
    '  return naturalizeInputQuestions(adapted, mode);',
  ].join('\n');

  const newBlock = [
    '  const lesson = getLessonById(lessonId);',
    '  const scopedQuestions = lesson',
    '    ? questions.filter(question => lesson.practice.tenses.includes(question.tense))',
    '    : questions;',
    '',
    "  const adapted = lessonId === 'constr-il-faut'",
    '    ? adaptIlFaut(scopedQuestions, mode)',
    '    : buildThematicExerciseQuestions(scopedQuestions, mode, lessonId);',
    '  return naturalizeInputQuestions(adapted, mode).map(canonicalizeThematicSurface);',
  ].join('\n');

  if (!source.includes(newBlock)) {
    if (!source.includes(oldBlock)) throw new Error('Prerequisite fix: adapter final block not found');
    source = source.replace(oldBlock, newBlock);
  }

  if (!source.includes('function canonicalizeThematicSurface(')) {
    const anchor = '/**\n * Единая точка адаптации тематических уроков.';
    const at = source.indexOf(anchor);
    if (at < 0) throw new Error('Prerequisite fix: adapter export comment not found');
    const helper = [
      '/** В учебной фразе не показываем служебные подписи il/elle и ils/elles. */',
      'function canonicalSurface(value: string | undefined): string | undefined {',
      '  if (!value) return value;',
      '  return value',
      "    .replace(/\\bil\\/elle\\b/gu, 'il')",
      "    .replace(/\\bils\\/elles\\b/gu, 'ils')",
      "    .replace(/\\bque il\\b/gu, \"qu'il\")",
      "    .replace(/\\bque ils\\b/gu, \"qu'ils\");",
      '}',
      '',
      'function canonicalizeThematicSurface(question: QuizQuestion): QuizQuestion {',
      '  return {',
      '    ...question,',
      '    correctAnswer: canonicalSurface(question.correctAnswer) ?? question.correctAnswer,',
      '    acceptedAnswers: question.acceptedAnswers?.map(value => canonicalSurface(value) ?? value),',
      '    displayAnswer: canonicalSurface(question.displayAnswer),',
      '    prompt: canonicalSurface(question.prompt),',
      '    context: canonicalSurface(question.context),',
      '    solutionText: canonicalSurface(question.solutionText),',
      '    speechText: canonicalSurface(question.speechText),',
      '    options: question.options?.map(value => canonicalSurface(value) ?? value),',
      '  };',
      '}',
      '',
    ].join('\n');
    source = source.slice(0, at) + helper + source.slice(at);
  }

  return source;
});

// Старый аудит ожидал, что адаптер никогда не меняет число вопросов. Теперь это
// неверно по замыслу: лишний материал должен быть отфильтрован по программе урока.
edit('scripts/validate-thematic-input-answers.ts', source => {
  const oldBlock = [
    "  const adapted = adaptThematicExerciseQuestions(raw, 'input', lesson.id);",
    '  assert.equal(adapted.length, raw.length, `${lesson.id}: input adapter changed question count`);',
  ].join('\n');
  const newBlock = [
    '  const expectedRaw = raw.filter(question => lesson.practice.tenses.includes(question.tense));',
    "  const adapted = adaptThematicExerciseQuestions(raw, 'input', lesson.id);",
    '  assert.equal(',
    '    adapted.length,',
    '    expectedRaw.length,',
    '    `${lesson.id}: adapter did not respect the final lesson tense scope`,',
    '  );',
    '  assert.ok(',
    '    adapted.every(question => lesson.practice.tenses.includes(question.tense)),',
    '    `${lesson.id}: generated question escaped the lesson tense scope`,',
    '  );',
  ].join('\n');
  if (!source.includes(newBlock)) {
    if (!source.includes(oldBlock)) throw new Error('Prerequisite fix: thematic validator block not found');
    source = source.replace(oldBlock, newBlock);
  }
  return source;
});

console.log('Enforced prerequisite boundaries for thematic questions.');
