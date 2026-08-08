const fs = require('node:fs');

function replaceOnce(path, from, to) {
  const source = fs.readFileSync(path, 'utf8');
  if (source.includes(to)) return;
  if (!source.includes(from)) {
    throw new Error(`Expected source fragment was not found in ${path}`);
  }
  fs.writeFileSync(path, source.replace(from, to), 'utf8');
}

function writeIfChanged(path, transform) {
  const source = fs.readFileSync(path, 'utf8');
  const next = transform(source);
  if (next !== source) fs.writeFileSync(path, next, 'utf8');
}

function patchLessonPractice(path, lessonId, verbIds, featured) {
  writeIfChanged(path, source => {
    const marker = `id: '${lessonId}'`;
    const start = source.indexOf(marker);
    if (start < 0) throw new Error(`Lesson ${lessonId} was not found in ${path}`);
    const nextLesson = source.indexOf("\n  {\n    id: '", start + marker.length);
    const end = nextLesson >= 0 ? nextLesson : source.indexOf('\n];', start);
    if (end < 0) throw new Error(`Lesson ${lessonId} has no closing boundary in ${path}`);

    const segment = source.slice(start, end);
    const practiceAt = segment.indexOf('practice: {');
    if (practiceAt < 0) throw new Error(`Lesson ${lessonId} has no practice block`);

    const beforePractice = segment.slice(0, practiceAt);
    let practice = segment.slice(practiceAt);
    const idsText = verbIds.map(id => JSON.stringify(id)).join(', ');
    const featuredText = featured.map(id => JSON.stringify(id)).join(', ');
    practice = practice.replace(/verbIds:\s*\[[\s\S]*?\],/, `verbIds: [${idsText}],`);
    practice = practice.replace(/featured:\s*\[[\s\S]*?\],/, `featured: [${featuredText}],`);

    const nextSegment = beforePractice + practice;
    return source.slice(0, start) + nextSegment + source.slice(end);
  });
}

// ── Полный аудит организации уроков ────────────────────────────────────────

// Третья группа на -ir в теории разбирает три семейства: partir, ouvrir, venir.
// courir — отдельное четвёртое семейство, которое в этом уроке не объясняется.
patchLessonPractice(
  'data/lessons.ts',
  'present-g3-ir',
  ['partir', 'sortir', 'dormir', 'servir', 'ouvrir', 'offrir', 'venir', 'tenir'],
  ['partir', 'ouvrir', 'venir'],
);

// «Неправильный императив» должен проверять именно материал урока, а не обычные
// impératif-формы faire/dire/venir/prendre/... из предыдущей темы.
patchLessonPractice(
  'data/lessons.ts',
  'imperatif-irreguliers',
  ['être', 'avoir', 'savoir', 'vouloir', 'aller'],
  ['être', 'avoir', 'savoir', 'vouloir', 'aller'],
);

// Счётчик мини-тренировки раньше просто умножал на шесть лиц и поэтому обещал
// 6 вопросов у impératif, хотя реально существуют только tu/nous/vous.
// Книжные уроки ниже работают как распознавание в третьем лице.
writeIfChanged('data/lessons.ts', source => {
  if (!source.includes("import { countAvailableQuestions, getVerbById, VERBS } from './verbs';")) {
    source = source.replace(
      "import { getVerbById, VERBS } from './verbs';",
      "import { countAvailableQuestions, getVerbById, VERBS } from './verbs';",
    );
  }

  const oldDrill = `export function drillSize(lesson: Lesson, drill: LessonDrill): number {`;
  const auditedDrill = `export function drillSize(lesson: Lesson, drill: LessonDrill): number {\n  if (lesson.block === 'imperatif' || lesson.block === 'litteraire') {\n    const persons = lesson.block === 'litteraire'\n      ? PERSONS.filter(person => person === 'il' || person === 'ils')\n      : PERSONS;\n    const available = countAvailableQuestions(drill.verbIds, lesson.practice.tenses, persons);\n    return Math.min(drill.isAll ? EXAM_QUESTIONS : DRILL_QUESTIONS, available);\n  }`;
  if (!source.includes(auditedDrill)) {
    if (!source.includes(oldDrill)) throw new Error('drillSize was not found in data/lessons.ts');
    source = source.replace(oldDrill, auditedDrill);
  }

  const oldExam = `export function lessonExamSize(lesson: Lesson): number {`;
  const auditedExam = `export function lessonExamSize(lesson: Lesson): number {\n  if (lesson.block === 'imperatif' || lesson.block === 'litteraire') {\n    const persons = lesson.block === 'litteraire'\n      ? PERSONS.filter(person => person === 'il' || person === 'ils')\n      : PERSONS;\n    const available = countAvailableQuestions(\n      lessonPracticeVerbIds(lesson),\n      lesson.practice.tenses,\n      persons,\n    );\n    return Math.min(EXAM_QUESTIONS, available);\n  }`;
  if (!source.includes(auditedExam)) {
    if (!source.includes(oldExam)) throw new Error('lessonExamSize was not found in data/lessons.ts');
    source = source.replace(oldExam, auditedExam);
  }
  return source;
});

// Составные времена с être имеют два корректных варианта согласования. Карточка
// «il/elle» не должна помечать est partie / sont allées как ошибку только потому,
// что основной эталон базы хранится в мужском роде.
writeIfChanged('data/verbs.ts', source => {
  if (!source.includes('quizAnswerVariants')) {
    source = source
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
    const helper = `${anchor}\n\n/** Все корректные письменные варианты ответа для одной карточки. */\nexport function quizAnswerVariants(question: QuizQuestion): string[] {\n  const verb = getVerbById(question.verbId);\n  if (\n    !verb ||\n    verb.pronominal ||\n    verb.aux !== 'etre' ||\n    !COMPOUND_TENSES.has(question.tense)\n  ) {\n    return [question.correctAnswer];\n  }\n\n  const personIndex = PERSONS.indexOf(question.person);\n  const feminine = feminineCompound(\n    question.tense,\n    verb.aux,\n    verb.participePasse.form,\n    personIndex,\n  );\n  return feminine && feminine !== question.correctAnswer\n    ? [question.correctAnswer, feminine]\n    : [question.correctAnswer];\n}`;
    if (!source.includes(anchor)) throw new Error('getVerbById anchor was not found in data/verbs.ts');
    source = source.replace(anchor, helper);
  }
  return source;
});

writeIfChanged('context/QuizContext.tsx', source => {
  if (!source.includes('quizAnswerVariants')) {
    source = source.replace(
      /import \{\s*countAvailableQuestions, generateOptions, shuffle, VERBS\s*\} from '\.\.\/data\/verbs';/u,
      "import { quizAnswerVariants, countAvailableQuestions, generateOptions, shuffle, VERBS } from '../data/verbs';",
    );

    const oldCheck = `        correct: checkAnswer(\n          userAnswer,\n          question.correctAnswer,\n          previous.accentMode ?? fallbackAccentMode,\n        ).correct,`;
    const newCheck = `        correct: quizAnswerVariants(question).some(expected =>\n          checkAnswer(\n            userAnswer,\n            expected,\n            previous.accentMode ?? fallbackAccentMode,\n          ).correct,\n        ),`;
    if (!source.includes(oldCheck)) {
      throw new Error('Answer submission block was not found in context/QuizContext.tsx');
    }
    source = source.replace(oldCheck, newCheck);
  }
  return source;
});

// Два книжных урока сами говорят, что цель — распознавание при чтении. Поэтому
// там тренировка и зачёт идут с вариантами ответа и на наиболее полезных для
// повествования лицах il/elle и ils/elles, а не требуют активного производства
// всей парадигмы.
writeIfChanged('app/lesson/[id].tsx', source => {
  if (!source.includes("const recognitionOnly = lesson.block === 'litteraire';")) {
    const anchor = `  const practiceVerbIds = lessonPracticeVerbIds(lesson);`;
    const insert = `  const recognitionOnly = lesson.block === 'litteraire';\n  const lessonPersons = recognitionOnly\n    ? PERSONS.filter(person => person === 'il' || person === 'ils')\n    : PERSONS;\n\n${anchor}`;
    if (!source.includes(anchor)) throw new Error('Lesson practice anchor was not found');
    source = source.replace(anchor, insert);

    source = source.replace(
      `  const examAvailable = lessonExamAvailableCount(lesson);`,
      `  const examAvailable = recognitionOnly\n    ? countAvailableQuestions(examVerbIds, lesson.practice.tenses, lessonPersons)\n    : lessonExamAvailableCount(lesson);`,
    );
    source = source.replace(
      `import { getVerbById, VERBS } from '../../data/verbs';`,
      `import { countAvailableQuestions, getVerbById, VERBS } from '../../data/verbs';`,
    );
    source = source.replace(
      `  const examPersons = onlyImperative\n    ? 'tu, nous, vous'\n    : includesImperative\n      ? 'все доступные лица'\n      : 'все 6 лиц';`,
      `  const examPersons = recognitionOnly\n    ? 'il/elle, ils/elles'\n    : onlyImperative\n      ? 'tu, nous, vous'\n      : includesImperative\n        ? 'все доступные лица'\n        : 'все 6 лиц';`,
    );

    source = source.replace(`      mode: LESSON_EXAM_MODE,`, `      mode: recognitionOnly ? 'multiple-choice' : LESSON_EXAM_MODE,`);
    source = source.replaceAll(`      mode: practiceMode,`, `      mode: recognitionOnly ? 'multiple-choice' : practiceMode,`);
    source = source.replaceAll(`      persons: PERSONS,`, `      persons: lessonPersons,`);

    source = source.replace(
      `          <View style={styles.modeRow}>`,
      `          {!recognitionOnly ? (\n          <View style={styles.modeRow}>`,
    );
    source = source.replace(
      `            })}\n          </View>\n\n          <Pressable\n            onPress={startPractice}`,
      `            })}\n          </View>\n          ) : (\n            <Text style={[styles.drillHint, { color: colors.mutedForeground }]}>\n              Режим распознавания · варианты ответа · il/elle и ils/elles.\n            </Text>\n          )}\n\n          <Pressable\n            onPress={startPractice}`,
    );

    source = source.replace(
      `              Проверяет, можете ли вы воспроизвести ключевые формы без вариантов ответа и самооценки.`,
      `              {recognitionOnly\n                ? 'Проверяет, узнаёте ли вы книжные формы в третьем лице — как при чтении текста.'\n                : 'Проверяет, можете ли вы воспроизвести ключевые формы без вариантов ответа и самооценки.'}`,
    );
    source = source.replace(
      `                ['Формат', 'ручной ввод · диакритика обязательна'],`,
      `                ['Формат', recognitionOnly ? 'варианты ответа · распознавание' : 'ручной ввод · диакритика обязательна'],`,
    );
  }
  return source;
});

// После сужения «Неправильного императива» полный набор — 5 глаголов × 3
// реально существующих лица = 15 вопросов, а не искусственные 30.
replaceOnce(
  'scripts/validate-verbs.ts',
  `  const expectedExamQuestions = lesson.id === 'present-etre-avoir' ? 24 : EXAM_QUESTIONS;`,
  `  const expectedExamQuestions =\n    lesson.id === 'present-etre-avoir'\n      ? 24\n      : lesson.id === 'imperatif-irreguliers'\n        ? 15\n        : EXAM_QUESTIONS;`,
);

console.log('Applied course audit fixes.');
