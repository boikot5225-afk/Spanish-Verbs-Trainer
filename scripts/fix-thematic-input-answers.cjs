const fs = require('node:fs');

function edit(path, transform) {
  const source = fs.readFileSync(path, 'utf8');
  const next = transform(source);
  if (next !== source) fs.writeFileSync(path, next, 'utf8');
}

// QuizQuestion хранит отдельно машинный эталон и то, что надо показать человеку.
edit('data/types.ts', source => {
  if (!source.includes('acceptedAnswers?: string[];')) {
    const anchor = '  correctAnswer: string;';
    if (!source.includes(anchor)) throw new Error('Thematic input fix: QuizQuestion.correctAnswer not found');
    source = source.replace(
      anchor,
      [
        anchor,
        '  /** Дополнительные полностью правильные варианты ввода. */',
        '  acceptedAnswers?: string[];',
        '  /** Человеческий эталон для обратной связи; correctAnswer остаётся машинным ключом. */',
        '  displayAnswer?: string;',
      ].join('\n'),
    );
  }
  return source;
});

// В тематическом ручном вводе многословная конструкция должна принимать и
// естественный полный ответ с подлежащим: nous sommes en train de travailler.
edit('data/thematic-exercise-adapter.ts', source => {
  source = source.replace(
    "import { PERSONS, type QuizMode, type QuizQuestion } from './types';",
    "import { IMPERATIVE_TENSES, PERSONS, speechText, type Person, type QuizMode, type QuizQuestion } from './types';",
  );

  if (!source.includes('function withNaturalSubjectAnswer(')) {
    const anchor = '/**\n * Единая точка адаптации тематических уроков.';
    const at = source.indexOf(anchor);
    if (at < 0) throw new Error('Thematic input fix: adapter export anchor not found');
    const helper = `const SUBJECT_PREFIXES: Record<Person, string[]> = {\n  je: ['je ', "j'"],\n  tu: ['tu '],\n  il: ['il ', 'elle '],\n  nous: ['nous '],\n  vous: ['vous '],\n  ils: ['ils ', 'elles '],\n};\n\nfunction normalizeSurface(value: string): string {\n  return value.trim().replace(/[’‘\u0060]/gu, "'").toLocaleLowerCase('fr');\n}\n\nfunction alreadyHasSubject(answer: string, person: Person): boolean {\n  const normalized = normalizeSurface(answer);\n  return SUBJECT_PREFIXES[person].some(prefix => normalized.startsWith(prefix));\n}\n\nfunction withNaturalSubjectAnswer(question: QuizQuestion): QuizQuestion {\n  const answer = question.correctAnswer.trim();\n  // Простая форма (sommes, viens, fasse...) остаётся именно формой. Исправляем\n  // случаи, где упражнение просит собрать конструкцию из нескольких слов.\n  if (!answer.includes(' ') || IMPERATIVE_TENSES.has(question.tense) || alreadyHasSubject(answer, question.person)) {\n    return question;\n  }\n\n  const fullAnswer = speechText(question.person, question.tense, answer);\n  if (normalizeSurface(fullAnswer) === normalizeSurface(answer)) return question;\n\n  const acceptedAnswers = Array.from(new Set([...(question.acceptedAnswers ?? []), fullAnswer]));\n  return {\n    ...question,\n    acceptedAnswers,\n    displayAnswer: fullAnswer,\n    speechText: fullAnswer,\n  };\n}\n\nfunction naturalizeInputQuestions(questions: QuizQuestion[], mode: QuizMode): QuizQuestion[] {\n  return mode === 'input' ? questions.map(withNaturalSubjectAnswer) : questions;\n}\n\n`;
    source = source.slice(0, at) + helper + source.slice(at);
  }

  const oldReturn = `  if (lessonId === 'constr-il-faut') return adaptIlFaut(questions, mode);\n  return buildThematicExerciseQuestions(questions, mode, lessonId);`;
  const newReturn = `  const adapted = lessonId === 'constr-il-faut'\n    ? adaptIlFaut(questions, mode)\n    : buildThematicExerciseQuestions(questions, mode, lessonId);\n  return naturalizeInputQuestions(adapted, mode);`;
  if (source.includes(oldReturn)) source = source.replace(oldReturn, newReturn);
  else if (!source.includes('return naturalizeInputQuestions(adapted, mode);')) {
    throw new Error('Thematic input fix: adapter return block not found');
  }
  return source;
});

// История/зачёт и экран вопроса обязаны пользоваться одинаковыми вариантами.
edit('context/QuizContext.tsx', source => {
  const audited = `        correct: quizAnswerVariants(question).some(expected =>\n          checkAnswer(userAnswer, expected, previous.accentMode ?? fallbackAccentMode).correct,\n        ),`;
  const fixed = `        correct: [...quizAnswerVariants(question), ...(question.acceptedAnswers ?? [])].some(expected =>\n          checkAnswer(userAnswer, expected, previous.accentMode ?? fallbackAccentMode).correct,\n        ),`;
  if (source.includes(audited)) source = source.replace(audited, fixed);
  else if (!source.includes('...(question.acceptedAnswers ?? [])')) {
    const direct = `        correct: checkAnswer(\n          userAnswer,\n          question.correctAnswer,\n          previous.accentMode ?? fallbackAccentMode,\n        ).correct,`;
    const directFixed = `        correct: [question.correctAnswer, ...(question.acceptedAnswers ?? [])].some(expected =>\n          checkAnswer(userAnswer, expected, previous.accentMode ?? fallbackAccentMode).correct,\n        ),`;
    if (!source.includes(direct)) throw new Error('Thematic input fix: submitAnswer check not found');
    source = source.replace(direct, directFixed);
  }
  return source;
});

edit('app/quiz-session.tsx', source => {
  const oldVerdict = '    const verdict = checkAnswer(answer, question.correctAnswer, accentMode);';
  const newVerdict = [
    '    const answerVariants = [question.correctAnswer, ...(question.acceptedAnswers ?? [])];',
    '    const verdicts = answerVariants.map(expected => checkAnswer(answer, expected, accentMode));',
    '    const verdict =',
    '      verdicts.find(item => item.correct) ??',
    '      verdicts.find(item => item.looksLikeTypo) ??',
    '      verdicts[0] ??',
    '      checkAnswer(answer, question.correctAnswer, accentMode);',
  ].join('\n');
  if (source.includes(oldVerdict)) source = source.replace(oldVerdict, newVerdict);
  else if (!source.includes('const answerVariants = [question.correctAnswer')) {
    throw new Error('Thematic input fix: UI verdict not found');
  }

  if (!source.includes('const displayedCorrectAnswer = question.displayAnswer ?? question.correctAnswer;')) {
    const anchor = "  const accentMode = session.accentMode ?? config.accentMode ?? 'warn';";
    if (!source.includes(anchor)) throw new Error('Thematic input fix: accentMode anchor not found');
    source = source.replace(anchor, `${anchor}\n  const displayedCorrectAnswer = question.displayAnswer ?? question.correctAnswer;`);
  }

  source = source.replaceAll(
    'speak(speechText(question.person, question.tense, question.correctAnswer))',
    'speak(question.displayAnswer ?? speechText(question.person, question.tense, question.correctAnswer))',
  );

  // Только блок обратной связи и оборот карточки; options продолжают сравниваться
  // с машинным correctAnswer.
  source = source.replace(
    `{isCorrect && accentNote && (\n        <Text style={[styles.correctAnswer, { color: colors.foreground }]}>\n          {question.correctAnswer}\n        </Text>\n      )}`,
    `{isCorrect && accentNote && (\n        <Text style={[styles.correctAnswer, { color: colors.foreground }]}>\n          {displayedCorrectAnswer}\n        </Text>\n      )}`,
  );
  source = source.replace(
    `<Text style={[styles.correctAnswer, { color: colors.foreground }]}>\n            {question.correctAnswer}\n          </Text>`,
    `<Text style={[styles.correctAnswer, { color: colors.foreground }]}>\n            {displayedCorrectAnswer}\n          </Text>`,
  );
  source = source.replace(
    `<Text style={[styles.cardAnswer, { color: colors.foreground }]}>\n            {question.correctAnswer}\n          </Text>`,
    `<Text style={[styles.cardAnswer, { color: colors.foreground }]}>\n            {displayedCorrectAnswer}\n          </Text>`,
  );
  return source;
});

edit('app/quiz-results.tsx', source => {
  source = source.replace(
    '{a.question.correctAnswer}',
    '{a.question.displayAnswer ?? a.question.correctAnswer}',
  );
  return source;
});

console.log('Fixed natural full answers for thematic input questions.');
