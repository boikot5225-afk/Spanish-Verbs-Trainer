const fs = require('node:fs');

function edit(path, fn) {
  const src = fs.readFileSync(path, 'utf8');
  const out = fn(src);
  if (out !== src) fs.writeFileSync(path, out, 'utf8');
}

function replace(path, from, to) {
  edit(path, src => {
    if (src.includes(to)) return src;
    if (!src.includes(from)) throw new Error(`Missing fragment in ${path}`);
    return src.replace(from, to);
  });
}

function lessonPractice(id, verbIds, featured) {
  edit('data/lessons.ts', src => {
    const start = src.indexOf(`id: '${id}'`);
    if (start < 0) throw new Error(`Missing lesson ${id}`);
    const next = src.indexOf("\n  {\n    id: '", start + 1);
    const end = next >= 0 ? next : src.indexOf('\n];', start);
    const segment = src.slice(start, end);
    const practiceAt = segment.indexOf('practice: {');
    if (practiceAt < 0) throw new Error(`Missing practice for ${id}`);
    const head = segment.slice(0, practiceAt);
    let practice = segment.slice(practiceAt);
    practice = practice.replace(
      /verbIds:\s*\[[\s\S]*?\],/,
      `verbIds: [${verbIds.map(JSON.stringify).join(', ')}],`,
    );
    practice = practice.replace(
      /featured:\s*\[[\s\S]*?\],/,
      `featured: [${featured.map(JSON.stringify).join(', ')}],`,
    );
    return src.slice(0, start) + head + practice + src.slice(end);
  });
}

lessonPractice(
  'present-g3-ir',
  ['partir', 'sortir', 'dormir', 'servir', 'ouvrir', 'offrir', 'venir', 'tenir'],
  ['partir', 'ouvrir', 'venir'],
);
lessonPractice(
  'imperatif-irreguliers',
  ['être', 'avoir', 'savoir', 'vouloir', 'aller'],
  ['être', 'avoir', 'savoir', 'vouloir', 'aller'],
);

edit('data/lessons.ts', src => {
  if (!src.includes("import { countAvailableQuestions, getVerbById, VERBS } from './verbs';")) {
    src = src.replace(
      "import { getVerbById, VERBS } from './verbs';",
      "import { countAvailableQuestions, getVerbById, VERBS } from './verbs';",
    );
  }
  const drill = `export function drillSize(lesson: Lesson, drill: LessonDrill): number {\n  if (lesson.block === 'imperatif' || lesson.block === 'litteraire') {\n    const persons = lesson.block === 'litteraire'\n      ? PERSONS.filter(person => person === 'il' || person === 'ils')\n      : PERSONS;\n    const available = countAvailableQuestions(drill.verbIds, lesson.practice.tenses, persons);\n    return Math.min(drill.isAll ? EXAM_QUESTIONS : DRILL_QUESTIONS, available);\n  }`;
  if (!src.includes(drill)) {
    src = src.replace(
      'export function drillSize(lesson: Lesson, drill: LessonDrill): number {',
      drill,
    );
  }
  const exam = `export function lessonExamSize(lesson: Lesson): number {\n  if (lesson.block === 'imperatif' || lesson.block === 'litteraire') {\n    const persons = lesson.block === 'litteraire'\n      ? PERSONS.filter(person => person === 'il' || person === 'ils')\n      : PERSONS;\n    const available = countAvailableQuestions(\n      lessonPracticeVerbIds(lesson),\n      lesson.practice.tenses,\n      persons,\n    );\n    return Math.min(EXAM_QUESTIONS, available);\n  }`;
  if (!src.includes(exam)) {
    src = src.replace('export function lessonExamSize(lesson: Lesson): number {', exam);
  }
  return src;
});

edit('data/verbs.ts', src => {
  if (src.includes('quizAnswerVariants')) return src;
  src = src
    .replace(
      "import type { ConjugationForm, Person, Tense, Verb } from './types';",
      "import type { ConjugationForm, Person, QuizQuestion, Tense, Verb } from './types';",
    )
    .replace(
      "import { IMPERATIVE_TENSES, PERSONS } from './types';",
      "import { COMPOUND_TENSES, IMPERATIVE_TENSES, PERSONS } from './types';",
    )
    .replace(
      "import { conjugateMetadata, type VerbMetadata } from './conjugator';",
      "import { conjugateMetadata, feminineCompound, type VerbMetadata } from './conjugator';",
    );
  const anchor = `export function getVerbById(id: string): Verb | undefined {\n  return VERB_BY_ID.get(id);\n}`;
  if (!src.includes(anchor)) throw new Error('Missing getVerbById');
  return src.replace(
    anchor,
    `${anchor}\n\nexport function quizAnswerVariants(question: QuizQuestion): string[] {\n  const verb = getVerbById(question.verbId);\n  if (!verb || verb.pronominal || verb.aux !== 'etre' || !COMPOUND_TENSES.has(question.tense)) {\n    return [question.correctAnswer];\n  }\n  const feminine = feminineCompound(\n    question.tense,\n    verb.aux,\n    verb.participePasse.form,\n    PERSONS.indexOf(question.person),\n  );\n  return feminine && feminine !== question.correctAnswer\n    ? [question.correctAnswer, feminine]\n    : [question.correctAnswer];\n}`,
  );
});

edit('context/QuizContext.tsx', src => {
  if (src.includes('quizAnswerVariants')) return src;
  src = src.replace(
    /import \{\s*countAvailableQuestions, generateOptions, shuffle, VERBS\s*\} from '\.\.\/data\/verbs';/u,
    "import { quizAnswerVariants, countAvailableQuestions, generateOptions, shuffle, VERBS } from '../data/verbs';",
  );
  const from = `        correct: checkAnswer(\n          userAnswer,\n          question.correctAnswer,\n          previous.accentMode ?? fallbackAccentMode,\n        ).correct,`;
  const to = `        correct: quizAnswerVariants(question).some(expected =>\n          checkAnswer(userAnswer, expected, previous.accentMode ?? fallbackAccentMode).correct,\n        ),`;
  if (!src.includes(from)) throw new Error('Missing submitAnswer check');
  return src.replace(from, to);
});

edit('app/lesson/[id].tsx', src => {
  const hasPersons = /import\s*\{[\s\S]*?\bPERSONS\b[\s\S]*?\}\s*from '\.\.\/\.\.\/data\/types';/u.test(src);
  if (!hasPersons) {
    src = src.replace(
      `import type { QuizMode } from '../../data/types';`,
      `import type { QuizMode } from '../../data/types';\nimport { PERSONS } from '../../data/types';`,
    );
  }
  if (src.includes("const recognitionOnly = lesson.block === 'litteraire';")) return src;
  const anchor = `  const practiceVerbIds = lessonPracticeVerbIds(lesson);`;
  src = src.replace(
    anchor,
    `  const recognitionOnly = lesson.block === 'litteraire';\n  const lessonPersons = recognitionOnly\n    ? PERSONS.filter(person => person === 'il' || person === 'ils')\n    : PERSONS;\n\n${anchor}`,
  );
  src = src.replace(
    `  const examAvailable = lessonExamAvailableCount(lesson);`,
    `  const examAvailable = recognitionOnly\n    ? countAvailableQuestions(examVerbIds, lesson.practice.tenses, lessonPersons)\n    : lessonExamAvailableCount(lesson);`,
  );
  src = src.replace(
    `import { getVerbById, VERBS } from '../../data/verbs';`,
    `import { countAvailableQuestions, getVerbById, VERBS } from '../../data/verbs';`,
  );
  src = src.replace(
    `  const examPersons = onlyImperative\n    ? 'tu, nous, vous'\n    : includesImperative\n      ? 'все доступные лица'\n      : 'все 6 лиц';`,
    `  const examPersons = recognitionOnly\n    ? 'il/elle, ils/elles'\n    : onlyImperative\n      ? 'tu, nous, vous'\n      : includesImperative\n        ? 'все доступные лица'\n        : 'все 6 лиц';`,
  );
  src = src.replace(`      mode: LESSON_EXAM_MODE,`, `      mode: recognitionOnly ? 'multiple-choice' : LESSON_EXAM_MODE,`);
  src = src.replaceAll(`      mode: practiceMode,`, `      mode: recognitionOnly ? 'multiple-choice' : practiceMode,`);
  src = src.replaceAll(`      persons: PERSONS,`, `      persons: lessonPersons,`);
  src = src.replace(
    `          <View style={styles.modeRow}>`,
    `          {!recognitionOnly ? (\n          <View style={styles.modeRow}>`,
  );
  src = src.replace(
    `            })}\n          </View>\n\n          <Pressable\n            onPress={startPractice}`,
    `            })}\n          </View>\n          ) : (\n            <Text style={[styles.drillHint, { color: colors.mutedForeground }]}>\n              Режим распознавания · варианты ответа · il/elle и ils/elles.\n            </Text>\n          )}\n\n          <Pressable\n            onPress={startPractice}`,
  );
  src = src.replace(
    `              Проверяет, можете ли вы воспроизвести ключевые формы без вариантов ответа и самооценки.`,
    `              {recognitionOnly\n                ? 'Проверяет, узнаёте ли вы книжные формы в третьем лице — как при чтении текста.'\n                : 'Проверяет, можете ли вы воспроизвести ключевые формы без вариантов ответа и самооценки.'}`,
  );
  return src.replace(
    `                ['Формат', 'ручной ввод · диакритика обязательна'],`,
    `                ['Формат', recognitionOnly ? 'варианты ответа · распознавание' : 'ручной ввод · диакритика обязательна'],`,
  );
});

replace(
  'scripts/validate-verbs.ts',
  `  const expectedExamQuestions = lesson.id === 'present-etre-avoir' ? 24 : EXAM_QUESTIONS;`,
  `  const expectedExamQuestions =\n    lesson.id === 'present-etre-avoir'\n      ? 24\n      : lesson.id === 'imperatif-irreguliers'\n        ? 15\n        : EXAM_QUESTIONS;`,
);
replace(
  'scripts/validate-verbs.ts',
  `    assert(\n      real >= EXAM_QUESTIONS,\n      \`${lesson.id}: only ${real} real imperative forms, need ${EXAM_QUESTIONS}\`,\n    );`,
  `    const expectedImperativeForms = lesson.id === 'imperatif-irreguliers' ? 15 : EXAM_QUESTIONS;\n    assert(\n      real >= expectedImperativeForms,\n      \`${lesson.id}: only ${real} real imperative forms, need ${expectedImperativeForms}\`,\n    );`,
);
replace(
  'scripts/validate-verbs.ts',
  `      assert(\n        size >= PERSONS.length && size <= DRILL_QUESTIONS,\n        \`${lesson.id}/${drill.key}: drill of ${size} questions is out of range\`,\n      );`,
  `      const minimumDrillQuestions =\n        lesson.block === 'imperatif' ? 3 : lesson.block === 'litteraire' ? 4 : PERSONS.length;\n      assert(\n        size >= minimumDrillQuestions && size <= DRILL_QUESTIONS,\n        \`${lesson.id}/${drill.key}: drill of ${size} questions is out of range\`,\n      );`,
);

console.log('Applied course audit fixes.');
