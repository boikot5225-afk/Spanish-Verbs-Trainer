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
  `      verbIds: [
        'être',
        'avoir',
        'aller',
        'faire',
        'dire',
        'pouvoir',
        'vouloir',
        'devoir',
        'savoir',
        'voir',
      ],
      featured: ['être', 'avoir', 'aller', 'faire'],`,
  `      verbIds: ['être', 'avoir', 'aller', 'faire'],
      featured: ['être', 'avoir', 'aller', 'faire'],`,
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
  `  Animated,
  Platform,`,
  `  Animated,
  InteractionManager,
  Platform,`,
);
replaceOnce(
  'app/quiz-session.tsx',
  `  }, [session?.currentIndex, flipAnim]);

  // Навигация только из эффектов:`,
  `  }, [session?.currentIndex, flipAnim]);

  useEffect(() => {
    if (session?.mode !== 'input') return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => inputRef.current?.focus(), 150);
    });

    return () => {
      task.cancel();
      if (timer) clearTimeout(timer);
    };
  }, [session?.currentIndex, session?.mode]);

  // Навигация только из эффектов:`,
);
replaceOnce(
  'app/quiz-session.tsx',
  `        autoFocus
        // Неконтролируемое поле:`,
  `        autoFocus
        showSoftInputOnFocus
        // Неконтролируемое поле:`,
);
replaceOnce(
  'app/quiz-session.tsx',
  `        Напишите форму глагола:`,
  `        {session.exam ? 'Зачёт · напишите форму глагола:' : 'Тренировка · напишите форму глагола:'}`,
);

// Уже начатая неправильная сессия 1.1.5 не должна продолжиться после обновления.
replaceOnce(
  'context/QuizContext.tsx',
  `function isValidSavedSession(session: QuizSession): boolean {
  return (
    session.questions.length > 0 &&
    session.answers.length < session.questions.length &&
    session.questions.every(question => VALID_VERB_IDS.has(question.verbId))
  );
}`,
  `const LESSON_SESSION_VERBS: Partial<Record<string, ReadonlySet<string>>> = {
  'present-etre-avoir': new Set(['être', 'avoir', 'aller', 'faire']),
};

function isValidSavedSession(session: QuizSession): boolean {
  const lessonLimit = session.lessonId ? LESSON_SESSION_VERBS[session.lessonId] : undefined;
  return (
    session.questions.length > 0 &&
    session.answers.length < session.questions.length &&
    session.questions.every(question => VALID_VERB_IDS.has(question.verbId)) &&
    (!lessonLimit || session.questions.every(question => lessonLimit.has(question.verbId)))
  );
}`,
);

// У четырёх глаголов ровно 24 формы Présent. Валидатор не должен требовать
// искусственные 30 вопросов и тем самым заставлять курс добавлять чужой материал.
replaceOnce(
  'scripts/validate-verbs.ts',
  `  // Зачёт должен быть полноразмерным: тема без 30 доступных форм не даёт
  // осмысленного порога «не более двух ошибок».
  assert.equal(
    lessonExamSize(lesson),
    EXAM_QUESTIONS,
    \`${'${lesson.id}'}: exam is only ${'${lessonExamSize(lesson)}'} questions, need ${'${EXAM_QUESTIONS}'}\`,
  );`,
  `  // Обычно зачёт содержит 30 вопросов. Для темы по четырём главным глаголам
  // полный набор — это все 24 уникальные формы Présent, без подмешивания чужих глаголов.
  const expectedExamQuestions = lesson.id === 'present-etre-avoir' ? 24 : EXAM_QUESTIONS;
  assert.equal(
    lessonExamSize(lesson),
    expectedExamQuestions,
    \`${'${lesson.id}'}: exam is ${'${lessonExamSize(lesson)}'} questions, expected ${'${expectedExamQuestions}'}\`,
  );`,
);
replaceOnce(
  'scripts/validate-verbs.ts',
  `      assert.equal(size, EXAM_QUESTIONS, \`${'${lesson.id}'}: full-set drill is only ${'${size}'} questions\`);`,
  `      assert.equal(size, expectedExamQuestions, \`${'${lesson.id}'}: full-set drill is ${'${size}'} questions, expected ${'${expectedExamQuestions}'}\`);`,
);

require('./apply-lesson-alignment.bundle.cjs');

// В сжатом шаблоне валидатора регулярные выражения получили двойное
// экранирование. Это проверяло буквальную строку "\\s", а не пробел.
{
  const path = 'scripts/validate-lesson-alignment.ts';
  const source = fs.readFileSync(path, 'utf8');
  fs.writeFileSync(path, source.replace(/\\\\s/g, '\\s').replace(/\\\\S/g, '\\S'), 'utf8');
}

console.log('Applied French Trainer build fixes.');
