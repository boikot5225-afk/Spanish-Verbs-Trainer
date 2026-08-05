const fs = require('node:fs');

function replaceOnce(path, from, to) {
  const source = fs.readFileSync(path, 'utf8');
  if (source.includes(to)) return;
  if (!source.includes(from)) {
    throw new Error(`Expected source fragment was not found in ${path}`);
  }
  fs.writeFileSync(path, source.replace(from, to), 'utf8');
}

// Урок объясняет только être, avoir, aller и faire. Свободная тренировка,
// мини-подходы и зачёт не должны внезапно подмешивать ещё шесть глаголов.
replaceOnce(
  'data/lessons.ts',
  `      verbIds: [\n        'être',\n        'avoir',\n        'aller',\n        'faire',\n        'dire',\n        'pouvoir',\n        'vouloir',\n        'devoir',\n        'savoir',\n        'voir',\n      ],\n      featured: ['être', 'avoir', 'aller', 'faire'],`,
  `      verbIds: ['être', 'avoir', 'aller', 'faire'],\n      featured: ['être', 'avoir', 'aller', 'faire'],`,
);

// На экране должно быть невозможно принять свободную тренировку за зачёт.
replaceOnce(
  'app/lesson/[id].tsx',
  '              Тренировать тему',
  '              Свободная тренировка · не зачёт',
);

// Android иногда теряет autoFocus во время перехода между экранами. Повторный
// focus после завершения анимации стабильно открывает клавиатуру.
replaceOnce(
  'app/quiz-session.tsx',
  `  Animated,\n  Platform,`,
  `  Animated,\n  InteractionManager,\n  Platform,`,
);
replaceOnce(
  'app/quiz-session.tsx',
  `  }, [session?.currentIndex, flipAnim]);\n\n  // Навигация только из эффектов:`,
  `  }, [session?.currentIndex, flipAnim]);\n\n  useEffect(() => {\n    if (session?.mode !== 'input') return;\n\n    let timer: ReturnType<typeof setTimeout> | undefined;\n    const task = InteractionManager.runAfterInteractions(() => {\n      timer = setTimeout(() => inputRef.current?.focus(), 150);\n    });\n\n    return () => {\n      task.cancel();\n      if (timer) clearTimeout(timer);\n    };\n  }, [session?.currentIndex, session?.mode]);\n\n  // Навигация только из эффектов:`,
);
replaceOnce(
  'app/quiz-session.tsx',
  `        autoFocus\n        // Неконтролируемое поле:`,
  `        autoFocus\n        showSoftInputOnFocus\n        // Неконтролируемое поле:`,
);
replaceOnce(
  'app/quiz-session.tsx',
  `        Напишите форму глагола:`,
  `        {session.exam ? 'Зачёт · напишите форму глагола:' : 'Тренировка · напишите форму глагола:'}`,
);

// Уже начатая неправильная сессия 1.1.5 не должна продолжиться после обновления.
replaceOnce(
  'context/QuizContext.tsx',
  `function isValidSavedSession(session: QuizSession): boolean {\n  return (\n    session.questions.length > 0 &&\n    session.answers.length < session.questions.length &&\n    session.questions.every(question => VALID_VERB_IDS.has(question.verbId))\n  );\n}`,
  `const LESSON_SESSION_VERBS: Partial<Record<string, ReadonlySet<string>>> = {\n  'present-etre-avoir': new Set(['être', 'avoir', 'aller', 'faire']),\n};\n\nfunction isValidSavedSession(session: QuizSession): boolean {\n  const lessonLimit = session.lessonId ? LESSON_SESSION_VERBS[session.lessonId] : undefined;\n  return (\n    session.questions.length > 0 &&\n    session.answers.length < session.questions.length &&\n    session.questions.every(question => VALID_VERB_IDS.has(question.verbId)) &&\n    (!lessonLimit || session.questions.every(question => lessonLimit.has(question.verbId)))\n  );\n}`,
);

// У четырёх глаголов ровно 24 формы Présent. Валидатор не должен требовать
// искусственные 30 вопросов и тем самым заставлять курс добавлять чужой материал.
replaceOnce(
  'scripts/validate-verbs.ts',
  `  // Зачёт должен быть полноразмерным: тема без 30 доступных форм не даёт\n  // осмысленного порога «не более двух ошибок».\n  assert.equal(\n    lessonExamSize(lesson),\n    EXAM_QUESTIONS,\n    \`${'${lesson.id}'}: exam is only ${'${lessonExamSize(lesson)}'} questions, need ${'${EXAM_QUESTIONS}'}\`,\n  );`,
  `  // Обычно зачёт содержит 30 вопросов. Для темы по четырём главным глаголам\n  // полный набор — это все 24 уникальные формы Présent, без подмешивания чужих глаголов.\n  const expectedExamQuestions = lesson.id === 'present-etre-avoir' ? 24 : EXAM_QUESTIONS;\n  assert.equal(\n    lessonExamSize(lesson),\n    expectedExamQuestions,\n    \`${'${lesson.id}'}: exam is ${'${lessonExamSize(lesson)}'} questions, expected ${'${expectedExamQuestions}'}\`,\n  );`,
);

console.log('Applied French Trainer build fixes.');
