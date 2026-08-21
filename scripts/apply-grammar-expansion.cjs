const fs = require('node:fs');

function edit(path, transform) {
  const source = fs.readFileSync(path, 'utf8');
  const next = transform(source);
  if (next !== source) fs.writeFileSync(path, next, 'utf8');
}

function mustReplace(source, from, to, label) {
  if (source.includes(to)) return source;
  if (!source.includes(from)) throw new Error(`Grammar expansion: missing ${label}`);
  return source.replace(from, to);
}

const SYNTAX_LESSONS = String.raw`
  // ── Синтаксис и выбор конструкции ────────────────────────────────────────
  {
    id: 'syntax-pronoms-y-en',
    block: 'syntax',
    title: 'Y / EN и порядок местоимений',
    summary: 'J’y pense, j’en parle, je le lui donne, parle-lui-en',
    sections: [
      {
        body:
          'Французские местоимения-дополнения образуют фиксированный порядок. Здесь мало знать перевод: нужно одновременно выбрать правильное местоимение и поставить его на правильное место.',
      },
      {
        heading: 'y',
        bullets: [
          'заменяет à + вещь/идею: penser à ce problème → y penser',
          'заменяет место: aller à Paris → y aller',
          'обычно не заменяет человека: penser à Marie → penser à elle',
        ],
      },
      {
        heading: 'en',
        bullets: [
          'заменяет de + существительное: parler de ce projet → en parler',
          'с количеством сохраняется число: j’ai trois frères → j’en ai trois',
          'в сочетании с lui/leur en идёт после них: je lui en parle',
        ],
      },
      {
        heading: 'Порядок',
        body:
          'Перед обычным глаголом: me/te/se/nous/vous → le/la/les → lui/leur → y → en. В утвердительном impératif местоимения уходят вправо: donne-le-lui, parle-lui-en. В отрицательном impératif порядок снова обычный: ne le lui donne pas.',
      },
    ],
    practice: {
      tenses: ['present'],
      verbIds: ['parler', 'penser', 'donner', 'aller', 'venir'],
      featured: ['parler', 'penser', 'donner'],
    },
  },
  {
    id: 'syntax-prepositions',
    block: 'syntax',
    title: 'Глаголы с à / de / без предлога',
    summary: 'réussir à, essayer de, vouloir partir, attendre quelqu’un',
    sections: [
      {
        body:
          'Управление во французском часто нельзя вывести из русского перевода. Глагол нужно запоминать вместе с тем, как он присоединяет инфинитив или дополнение.',
      },
      {
        heading: 'à + infinitif',
        bullets: ['réussir à faire', 'apprendre à faire', 'hésiter à faire', 'aider quelqu’un à faire', 'penser à faire'],
      },
      {
        heading: 'de + infinitif',
        bullets: ['essayer de faire', 'décider de faire', 'refuser de faire', 'arrêter de faire', 'éviter de faire'],
      },
      {
        heading: 'Без предлога',
        bullets: ['vouloir partir, pouvoir venir, préférer rester', 'attendre quelqu’un, écouter quelqu’un, chercher quelque chose'],
      },
      {
        heading: 'Один глагол — разные связи',
        body:
          'parler à quelqu’un — говорить с кем-то; parler de quelque chose — говорить о чём-то. Такие пары особенно важно тренировать в контексте.',
      },
    ],
    practice: {
      tenses: ['present'],
      verbIds: ['parler', 'penser', 'vouloir', 'attendre', 'venir'],
      featured: ['parler', 'penser', 'vouloir'],
    },
  },
  {
    id: 'syntax-participe-cod',
    block: 'syntax',
    title: 'Participe passé с предшествующим COD',
    summary: 'les lettres que j’ai écrites, je les ai vues',
    sections: [
      {
        body:
          'С avoir причастие обычно не согласуется, но предшествующий прямой объект меняет правило: причастие получает его род и число.',
      },
      {
        heading: 'COD после причастия',
        body: 'J’ai écrit les lettres. Дополнение стоит после — écrit остаётся в базовой форме.',
      },
      {
        heading: 'COD перед причастием',
        body:
          'Les lettres que j’ai écrites; je les ai vues. que, le, la, les могут переносить COD перед причастием — тогда возникает согласование.',
      },
      {
        heading: 'Местоименные глаголы',
        body:
          'Нужно определить функцию se: elles se sont lavées, но elles se sont lavé les mains и elles se sont parlé. Простого правила «être = всегда согласовать» недостаточно.',
      },
      {
        heading: 'faire + infinitif',
        body: 'В causatif participe passé fait перед инфинитивом остаётся неизменным: les chansons qu’elle a fait chanter.',
      },
    ],
    practice: {
      tenses: ['passeCompose'],
      verbIds: ['écrire', 'voir', 'faire', 'prendre', 'ouvrir'],
      featured: ['écrire', 'voir', 'faire'],
    },
  },
  {
    id: 'syntax-si',
    block: 'syntax',
    title: 'Si: три условные модели',
    summary: 'si tu viens; si j’avais; si j’avais su',
    sections: [
      {
        body:
          'Главная ловушка — не отдельное время, а правильная пара времён между условием и результатом. Conditionnel после si в этих трёх базовых моделях не ставится.',
      },
      {
        heading: 'Реальное условие',
        body: 'si + présent → présent / futur / impératif: si tu viens, nous mangerons ensemble.',
      },
      {
        heading: 'Гипотеза о настоящем или будущем',
        body: 'si + imparfait → conditionnel présent: si j’avais le temps, je voyagerais.',
      },
      {
        heading: 'Несбывшееся прошлое',
        body: 'si + plus-que-parfait → conditionnel passé: si j’avais su, je serais venu.',
      },
    ],
    practice: {
      tenses: ['imparfait', 'conditionnel'],
      verbIds: ['avoir', 'venir', 'faire', 'aller', 'savoir'],
      featured: ['avoir', 'venir', 'savoir'],
    },
  },
  {
    id: 'syntax-past-contrast',
    block: 'syntax',
    title: 'Imparfait / passé composé / plus-que-parfait',
    summary: 'Фон, событие и действие до другого прошлого',
    sections: [
      {
        body:
          'Три времени становятся понятнее, когда конкурируют в одном контексте. Задача не «образовать imparfait», а решить, какую временную перспективу требует фраза.',
      },
      {
        heading: 'Imparfait',
        body: 'фон, состояние, привычка, действие в процессе: il pleuvait, je lisais.',
      },
      {
        heading: 'Passé composé',
        body: 'завершённое событие, которое двигает рассказ: la porte s’est ouverte, il est entré.',
      },
      {
        heading: 'Plus-que-parfait',
        body: 'то, что уже произошло до другого прошлого момента: quand je suis arrivé, il avait mangé.',
      },
    ],
    practice: {
      tenses: ['imparfait', 'passeCompose', 'plusQueParfait'],
      verbIds: ['être', 'avoir', 'faire', 'venir', 'prendre'],
      featured: ['être', 'venir', 'prendre'],
    },
  },
  {
    id: 'syntax-time-markers',
    block: 'syntax',
    title: 'Depuis / pendant / il y a / ça fait / pour',
    summary: 'Как французский считает длительность и точку отсчёта',
    sections: [
      {
        body:
          'Русское «уже три года», «три года назад» и «в течение трёх лет» требуют разных конструкций. Ошибка здесь часто тянет за собой и неправильное время глагола.',
      },
      {
        heading: 'depuis',
        body: 'Началось раньше и продолжается: j’habite ici depuis trois ans; depuis janvier.',
      },
      {
        heading: 'pendant',
        body: 'Интервал рассматривается как целое, часто уже завершённое: j’ai travaillé là pendant deux ans.',
      },
      {
        heading: 'il y a',
        body: 'Точка в прошлом относительно сейчас: je l’ai vu il y a deux jours.',
      },
      {
        heading: 'ça fait ... que / pour',
        bullets: ['ça fait trois ans que j’habite ici — длительность до настоящего', 'je pars pour deux semaines — запланированная длительность'],
      },
    ],
    practice: {
      tenses: ['present', 'passeCompose'],
      verbIds: ['habiter', 'travailler', 'venir', 'partir', 'voir'],
      featured: ['habiter', 'travailler', 'partir'],
    },
  },
`;

// ── 1. Новый блок курса и шесть уроков ──────────────────────────────────────
edit('data/lessons.ts', source => {
  if (!source.includes("| 'syntax'")) {
    source = mustReplace(
      source,
      "  | 'imperatif'\n  | 'litteraire';",
      "  | 'imperatif'\n  | 'syntax'\n  | 'litteraire';",
      'LessonBlock syntax',
    );
  }

  if (!source.includes("  'syntax',")) {
    source = mustReplace(
      source,
      "  'composes',\n  'subjonctif',",
      "  'composes',\n  'syntax',\n  'subjonctif',",
      'LESSON_BLOCKS syntax',
    );
  }

  if (!source.includes("syntax: 'Синтаксис и выбор конструкции'")) {
    source = mustReplace(
      source,
      "  composes: 'Составные времена',\n  subjonctif: 'Сослагательное наклонение',",
      "  composes: 'Составные времена',\n  syntax: 'Синтаксис и выбор конструкции',\n  subjonctif: 'Сослагательное наклонение',",
      'syntax block label',
    );
  }

  if (!source.includes("id: 'syntax-pronoms-y-en'")) {
    const anchor = '  // ── Сослагательное наклонение';
    const at = source.indexOf(anchor);
    if (at < 0) throw new Error('Grammar expansion: missing subjonctif insertion anchor');
    source = source.slice(0, at) + SYNTAX_LESSONS + '\n' + source.slice(at);
  }
  return source;
});

// ── 2. Метаданные вопроса для синтаксических банков ────────────────────────
edit('data/types.ts', source => {
  const match = source.match(/export interface QuizQuestion \{[\s\S]*?\n\}/u);
  if (!match) throw new Error('Grammar expansion: missing QuizQuestion');
  let block = match[0];
  const fields = [
    ['prompt?: string;', '  /** Текст контекстного задания. */\n  prompt?: string;'],
    ['speechText?: string;', '  /** Полная фраза для озвучки вместо искусственного person + form. */\n  speechText?: string;'],
    ['headerTitle?: string;', '  /** Заголовок грамматического задания вместо инфинитива. */\n  headerTitle?: string;'],
    ['headerSubtitle?: string;', '  headerSubtitle?: string;'],
    ['explanation?: string;', '  /** Короткое объяснение правила после ответа. */\n  explanation?: string;'],
  ];
  for (const [needle, addition] of fields) {
    if (!block.includes(needle)) block = block.replace(/\n\}$/u, `\n${addition}\n}`);
  }
  return source.replace(match[0], block);
});

// ── 3. Повтор ошибок не должен заменять грамматические варианты спряжениями ─
edit('context/QuizContext.tsx', source => {
  source = source.replace(
    "          session.mode === 'multiple-choice'\n            ? generateOptions(question.verbId, question.tense, personIndex, question.correctAnswer)\n            : question.options;",
    "          session.mode === 'multiple-choice' && !question.headerTitle\n            ? generateOptions(question.verbId, question.tense, personIndex, question.correctAnswer)\n            : question.options;",
  );
  return source;
});

// ── 4. Экран урока: синтаксические темы запускают собственный банк ──────────
edit('app/lesson/[id].tsx', source => {
  if (!source.includes("from '../../data/grammar-drills'")) {
    source = source.replace(
      "import { getVerbById, VERBS } from '../../data/verbs';",
      [
        "import { getVerbById, VERBS } from '../../data/verbs';",
        "import {",
        "  GRAMMAR_EXAM_QUESTIONS,",
        "  GRAMMAR_PRACTICE_QUESTIONS,",
        "  grammarBankSize,",
        "  grammarExamQuestions,",
        "  grammarQuestions,",
        "  isGrammarLessonId,",
        "} from '../../data/grammar-drills';",
      ].join('\n'),
    );
  }

  source = source.replace(
    '  const { config, buildAndStartSession } = useQuiz();',
    '  const { config, buildAndStartSession, setSession } = useQuiz();',
  );

  if (!source.includes('const grammarLesson = isGrammarLessonId(lesson.id);')) {
    source = source.replace(
      '  const practiceVerbIds = lessonPracticeVerbIds(lesson);',
      "  const grammarLesson = isGrammarLessonId(lesson.id);\n  const practiceVerbIds = lessonPracticeVerbIds(lesson);",
    );
  }

  source = source.replace(
    /  const examAvailable = recognitionOnly[\s\S]*?: lessonExamAvailableCount\(lesson\);/u,
    [
      '  const examAvailable = grammarLesson',
      '    ? grammarBankSize(lesson.id)',
      '    : recognitionOnly',
      '      ? countAvailableQuestions(examVerbIds, lesson.practice.tenses, lessonPersons)',
      '      : lessonExamAvailableCount(lesson);',
    ].join('\n'),
  );
  source = source.replace(
    '  const examSize = lessonExamQuestionCount(lesson);',
    '  const examSize = grammarLesson ? Math.min(GRAMMAR_EXAM_QUESTIONS, examAvailable) : lessonExamQuestionCount(lesson);',
  );
  source = source.replace(
    /  const examVerbNames = examVerbIds\n    \.map\(verbId => getVerbById\(verbId\)\?\.infinitive \?\? verbId\)\n    \.join\(', '\);/u,
    [
      "  const examVerbNames = grammarLesson",
      "    ? 'контекстные конструкции'",
      "    : examVerbIds.map(verbId => getVerbById(verbId)?.infinitive ?? verbId).join(', ');",
    ].join('\n'),
  );
  source = source.replace(
    '  const examCoversEveryForm = examSize === examAvailable;',
    '  const examCoversEveryForm = !grammarLesson && examSize === examAvailable;',
  );

  if (!source.includes('const questions = grammarExamQuestions(lesson.id);')) {
    source = source.replace(
      '  const startExam = () => {',
      [
        '  const startExam = () => {',
        '    if (grammarLesson) {',
        '      const questions = grammarExamQuestions(lesson.id);',
        '      if (questions.length === 0) return;',
        '      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);',
        '      setSession({',
        '        questions,',
        '        currentIndex: 0,',
        '        answers: [],',
        "        mode: 'multiple-choice',",
        "        accentMode: 'strict',",
        '        startedAt: new Date().toISOString(),',
        '        exam: { lessonId: lesson.id, maxMistakes: EXAM_MAX_MISTAKES },',
        '        lessonId: lesson.id,',
        '      });',
        "      router.push('/quiz-session');",
        '      return;',
        '    }',
      ].join('\n'),
    );
  }

  if (!source.includes('const questions = grammarQuestions(lesson.id, GRAMMAR_PRACTICE_QUESTIONS);')) {
    source = source.replace(
      '  const startPractice = () => {',
      [
        '  const startPractice = () => {',
        '    if (grammarLesson) {',
        '      const questions = grammarQuestions(lesson.id, GRAMMAR_PRACTICE_QUESTIONS);',
        '      if (questions.length === 0) return;',
        '      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);',
        '      setSession({',
        '        questions,',
        '        currentIndex: 0,',
        '        answers: [],',
        "        mode: 'multiple-choice',",
        "        accentMode: 'strict',",
        '        startedAt: new Date().toISOString(),',
        '        lessonId: lesson.id,',
        '      });',
        "      router.push('/quiz-session');",
        '      return;',
        '    }',
      ].join('\n'),
    );
  }

  // У синтаксических тем нет фиктивной «отработки по глаголам».
  if (!source.includes('Контекстная отработка')) {
    const re = /(          <Text style=\{\[styles\.drillHeading[^\n]*\}>Отработка по глаголам<\/Text>[\s\S]*?          <\/View>)\n\n(          <Text style=\{\[styles\.drillHeading[^\n]*\}>Тренировка темы<\/Text>)/u;
    const match = source.match(re);
    if (!match) throw new Error('Grammar expansion: missing drill UI block');
    source = source.replace(
      re,
      [
        '          {!grammarLesson ? (',
        '            <>',
        match[1],
        '            </>',
        '          ) : (',
        '            <>',
        '              <Text style={[styles.drillHeading, { color: colors.foreground }]}>Контекстная отработка</Text>',
        '              <Text style={[styles.drillHint, { color: colors.mutedForeground }]}>',
        '                Здесь проверяется выбор конструкции и порядок слов, а не изолированное спряжение одного глагола.',
        '              </Text>',
        '            </>',
        '          )}',
        '',
        match[2],
      ].join('\n'),
    );
  }

  // Режим у грамматического банка фиксированный: контекстный multiple choice.
  if (!source.includes('Вопросы берутся из отдельного банка')) {
    const re = /(          <Text style=\{\[styles\.drillHeading[^\n]*\}>Тренировка темы<\/Text>)\n([\s\S]*?)(\n          <Pressable\n            onPress=\{startPractice\})/u;
    const match = source.match(re);
    if (!match) throw new Error('Grammar expansion: missing practice mode UI');
    source = source.replace(
      re,
      [
        match[1],
        '          {grammarLesson ? (',
        '            <Text style={[styles.drillHint, { color: colors.mutedForeground }]}>',
        '              Вопросы берутся из отдельного банка: контекст → несколько грамматически правдоподобных вариантов.',
        '            </Text>',
        '          ) : (',
        '            <>',
        match[2],
        '            </>',
        '          )}',
        match[3],
      ].join('\n'),
    );
  }

  // «Все глаголы базы» к синтаксису не относится.
  if (!source.includes('grammarBankSize(lesson.id)} заданий в банке')) {
    const re = /(          <Pressable\n            onPress=\{\(\) => \{[\s\S]*?setAllVerbs\(previous => !previous\);[\s\S]*?          <Text style=\{\[styles\.practiceHint[\s\S]*?          <\/Text>)/u;
    const match = source.match(re);
    if (!match) throw new Error('Grammar expansion: missing all-verbs UI');
    source = source.replace(
      re,
      [
        '          {!grammarLesson ? (',
        '            <>',
        match[1],
        '            </>',
        '          ) : (',
        '            <Text style={[styles.practiceHint, { color: colors.mutedForeground }]}>',
        '              {grammarBankSize(lesson.id)} заданий в банке · {GRAMMAR_PRACTICE_QUESTIONS} за тренировку',
        '            </Text>',
        '          )}',
      ].join('\n'),
    );
  }

  // Зачёт: не врём про ручной ввод, лица и «формы».
  source = source.replace(
    /            <Text style=\{\[styles\.examLead[^>]*>\}[\s\S]*?            <\/Text>/u,
    [
      '            <Text style={[styles.examLead, { color: colors.foreground }]}>',
      "              {grammarLesson",
      "                ? 'Проверяет, выбираете ли вы правильную конструкцию в контексте — без подсказки названием правила.'",
      "                : recognitionOnly",
      "                  ? 'Проверяет, узнаёте ли вы книжные формы в третьем лице — как при чтении текста.'",
      "                  : 'Проверяет, можете ли вы воспроизвести ключевые формы без вариантов ответа и самооценки.'}",
      '            </Text>',
    ].join('\n'),
  );

  source = source.replace(
    "                ['Времена', lesson.practice.tenses.map(tense => TENSE_FULL_LABELS[tense]).join(', ')],",
    "                ['Времена', grammarLesson ? 'синтаксис / контекст' : lesson.practice.tenses.map(tense => TENSE_FULL_LABELS[tense]).join(', ')],",
  );
  source = source.replace(
    "                ['Лица', examPersons],",
    "                ['Лица', grammarLesson ? 'не применяются' : examPersons],",
  );
  source = source.replace(
    /                \['Формат',[^\n]*\],/u,
    "                ['Формат', grammarLesson ? 'выбор по контексту' : recognitionOnly ? 'варианты ответа · распознавание' : 'ручной ввод · диакритика обязательна'],",
  );

  const examBodyRe = /            <Text style=\{\[styles\.examBody[^>]*>\}[\s\S]*?            <\/Text>/u;
  if (examBodyRe.test(source)) {
    source = source.replace(
      examBodyRe,
      [
        '            <Text style={[styles.examBody, { color: colors.mutedForeground }]}>',
        '              {grammarLesson',
        '                ? `${examSize} вопросов из ${examAvailable} контекстных заданий; набор перемешивается.`',
        '                : examCoversEveryForm',
        '                  ? `${examSize} вопросов: каждая доступная форма встретится один раз.`',
        '                  : `${examSize} вопросов из ${examAvailable} доступных форм; набор перемешивается.`}',
        "              {' '}Для зачёта допустимо не больше {EXAM_MAX_MISTAKES} ошибок.",
        '            </Text>',
      ].join('\n'),
    );
  }

  return source;
});

// ── 5. Экран вопроса: честный заголовок, prompt и объяснение ───────────────
edit('app/quiz-session.tsx', source => {
  source = source.replace('{verb.infinitive}', '{question.headerTitle ?? verb.infinitive}');
  source = source.replace('{verb.translation}', '{question.headerSubtitle ?? verb.translation}');
  source = source.replace(
    '{TENSE_FULL_LABELS[question.tense]}',
    "{question.headerTitle ? 'Грамматика' : TENSE_FULL_LABELS[question.tense]}",
  );
  source = source.replace(
    '{personLabels(question.tense)[question.person]}',
    "{question.headerTitle ? 'контекст' : personLabels(question.tense)[question.person]}",
  );

  source = source.replace(
    '        Выберите правильную форму:',
    "        {question.prompt ?? 'Выберите правильную форму:'}",
  );

  source = source.replace(
    'speak(question.solutionText ?? speechText(question.person, question.tense, question.correctAnswer));',
    'speak(question.speechText ?? question.solutionText ?? speechText(question.person, question.tense, question.correctAnswer));',
  );

  if (!source.includes('styles.explanationText')) {
    const anchor = '      {!isCorrect && (\n        <View style={styles.correctAnswerRow}>';
    // Объяснение вставляется в конец общего feedback, независимо от результата.
    const feedbackEnd = '      )}\n    </View>\n  );';
    const at = source.indexOf(feedbackEnd);
    if (at < 0) throw new Error('Grammar expansion: missing resultFeedback end');
    const replacement = [
      '      )}',
      '      {question.explanation ? (',
      '        <Text style={[styles.explanationText, { color: colors.mutedForeground }]}>',
      '          {question.explanation}',
      '        </Text>',
      '      ) : null}',
      '    </View>',
      '  );',
    ].join('\n');
    source = source.slice(0, at) + replacement + source.slice(at + feedbackEnd.length);
  }

  if (!source.includes('explanationText:')) {
    source = source.replace(
      '  correctAnswer: { fontSize: 18, fontFamily:',
      "  explanationText: { fontSize: 13, lineHeight: 19, textAlign: 'center', fontFamily: 'Inter_400Regular', marginTop: 4 },\n  correctAnswer: { fontSize: 18, fontFamily:",
    );
  }
  return source;
});

// ── 6. Экран результатов: в ошибках показываем грамматику, а не dummy verb ─
edit('app/quiz-results.tsx', source => {
  source = source.replace(
    "                        {verb?.infinitive ?? '?'}",
    "                        {a.question.headerTitle ?? verb?.infinitive ?? '?'}",
  );
  source = source.replace(
    '{tenseQualifiedLabel(a.question.tense)} · {personLabels(a.question.tense)[a.question.person]}',
    "{a.question.headerTitle ? a.question.prompt : `${tenseQualifiedLabel(a.question.tense)} · ${personLabels(a.question.tense)[a.question.person]}`}",
  );
  return source;
});

console.log('Applied syntax/grammar expansion.');
