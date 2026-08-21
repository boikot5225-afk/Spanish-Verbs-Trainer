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

  const scopedBlock = [
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

  const finalBlock = [
    '  const lesson = getLessonById(lessonId);',
    '  const scopedQuestions =',
    "    lessonId === 'constr-il-faut'",
    '      ? basicIlFautQuestions(mode)',
    '      : lesson',
    '        ? questions.filter(question => lesson.practice.tenses.includes(question.tense))',
    '        : questions;',
    '',
    "  const adapted = lessonId === 'constr-il-faut'",
    '    ? adaptIlFaut(scopedQuestions, mode)',
    '    : buildThematicExerciseQuestions(scopedQuestions, mode, lessonId);',
    '  return naturalizeInputQuestions(adapted, mode).map(canonicalizeThematicSurface);',
  ].join('\n');

  if (!source.includes(finalBlock)) {
    if (source.includes(scopedBlock)) source = source.replace(scopedBlock, finalBlock);
    else if (source.includes(oldBlock)) source = source.replace(oldBlock, finalBlock);
    else throw new Error('Prerequisite fix: adapter final block not found');
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
      '/**',
      ' * В раннем уроке il faut тренируем только уже объяснённую модель',
      ' * il faut + infinitif. Адресное il faut que вводится позже вместе с subjonctif.',
      ' */',
      'function basicIlFautQuestions(mode: QuizMode): QuizQuestion[] {',
      "  const lesson = getLessonById('constr-il-faut');",
      '  const verbs: NonNullable<ReturnType<typeof getVerbById>>[] = [];',
      '  for (const verbId of lesson?.practice.verbIds ?? []) {',
      '    const verb = getVerbById(verbId);',
      "    if (verb && verb.id !== 'falloir') verbs.push(verb);",
      '  }',
      '',
      '  return verbs.map((verb, index) => {',
      '    const correctAnswer = `il faut ${verb.infinitive}`;',
      "    const options = mode === 'multiple-choice'",
      '      ? shuffle([',
      '          correctAnswer,',
      '          ...[1, 2, 3].map(offset => {',
      '            const other = verbs[(index + offset) % verbs.length] ?? verb;',
      '            return `il faut ${other.infinitive}`;',
      '          }),',
      '        ])',
      '      : undefined;',
      '',
      '    return {',
      '      verbId: verb.id,',
      "      tense: 'present',",
      "      person: 'il',",
      '      correctAnswer,',
      '      displayAnswer: correctAnswer,',
      '      displayInfinitive: `il faut + ${verb.infinitive}`,',
      "      displayTense: 'Il faut + infinitif',",
      '      speechText: correctAnswer,',
      "      prompt: 'Сформулируйте общую необходимость: «нужно …».',",
      '      options,',
      '    };',
      '  });',
      '}',
      '',
    ].join('\n');
    source = source.slice(0, at) + helper + source.slice(at);
  } else if (!source.includes('function basicIlFautQuestions(')) {
    const anchor = '/**\n * Единая точка адаптации тематических уроков.';
    const at = source.indexOf(anchor);
    if (at < 0) throw new Error('Prerequisite fix: adapter export comment not found for il faut helper');
    const helper = [
      '/** Ранний il faut: только il faut + infinitif, без subjonctif. */',
      'function basicIlFautQuestions(mode: QuizMode): QuizQuestion[] {',
      "  const lesson = getLessonById('constr-il-faut');",
      '  const verbs: NonNullable<ReturnType<typeof getVerbById>>[] = [];',
      '  for (const verbId of lesson?.practice.verbIds ?? []) {',
      '    const verb = getVerbById(verbId);',
      "    if (verb && verb.id !== 'falloir') verbs.push(verb);",
      '  }',
      '  return verbs.map((verb, index) => {',
      '    const correctAnswer = `il faut ${verb.infinitive}`;',
      "    const options = mode === 'multiple-choice'",
      '      ? shuffle([correctAnswer, ...[1, 2, 3].map(offset => {',
      '          const other = verbs[(index + offset) % verbs.length] ?? verb;',
      '          return `il faut ${other.infinitive}`;',
      '        })])',
      '      : undefined;',
      '    return {',
      '      verbId: verb.id,',
      "      tense: 'present',",
      "      person: 'il',",
      '      correctAnswer,',
      '      displayAnswer: correctAnswer,',
      '      displayInfinitive: `il faut + ${verb.infinitive}`,',
      "      displayTense: 'Il faut + infinitif',",
      '      speechText: correctAnswer,',
      "      prompt: 'Сформулируйте общую необходимость: «нужно …».',",
      '      options,',
      '    };',
      '  });',
      '}',
      '',
    ].join('\n');
    source = source.slice(0, at) + helper + source.slice(at);
  }

  return source;
});

// Старый аудит ожидал, что адаптер никогда не меняет число вопросов. Для il faut
// это теперь специально не так: ранний урок имеет собственный чистый банк infinitif.
edit('scripts/validate-thematic-input-answers.ts', source => {
  const oldBlock = [
    "  const adapted = adaptThematicExerciseQuestions(raw, 'input', lesson.id);",
    '  assert.equal(adapted.length, raw.length, `${lesson.id}: input adapter changed question count`);',
  ].join('\n');
  const intermediateBlock = [
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
  const newBlock = [
    '  const expectedRaw = raw.filter(question => lesson.practice.tenses.includes(question.tense));',
    "  const adapted = adaptThematicExerciseQuestions(raw, 'input', lesson.id);",
    "  if (lesson.id === 'constr-il-faut') {",
    '    assert.ok(adapted.length >= 5, `constr-il-faut: too few basic infinitive questions (${adapted.length})`);',
    '  } else {',
    '    assert.equal(',
    '      adapted.length,',
    '      expectedRaw.length,',
    '      `${lesson.id}: adapter did not respect the final lesson tense scope`,',
    '    );',
    '  }',
    '  assert.ok(',
    '    adapted.every(question => lesson.practice.tenses.includes(question.tense)),',
    '    `${lesson.id}: generated question escaped the lesson tense scope`,',
    '  );',
  ].join('\n');
  if (!source.includes(newBlock)) {
    if (source.includes(intermediateBlock)) source = source.replace(intermediateBlock, newBlock);
    else if (source.includes(oldBlock)) source = source.replace(oldBlock, newBlock);
    else throw new Error('Prerequisite fix: thematic validator block not found');
  }
  return source;
});

console.log('Enforced prerequisite boundaries for thematic questions.');
