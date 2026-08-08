const fs = require('node:fs');

function edit(path, transform) {
  const source = fs.readFileSync(path, 'utf8');
  const next = transform(source);
  if (next !== source) fs.writeFileSync(path, next, 'utf8');
}

function patchLessonPractice(lessonId, verbIds, featured) {
  edit('data/lessons.ts', source => {
    const marker = `id: '${lessonId}'`;
    const start = source.indexOf(marker);
    if (start < 0) throw new Error(`Missing lesson ${lessonId}`);
    const nextLesson = source.indexOf("\n  {\n    id: '", start + marker.length);
    const end = nextLesson >= 0 ? nextLesson : source.indexOf('\n];', start);
    if (end < 0) throw new Error(`Missing end of lesson ${lessonId}`);

    const segment = source.slice(start, end);
    const practiceAt = segment.indexOf('practice: {');
    if (practiceAt < 0) throw new Error(`Missing practice for ${lessonId}`);

    const head = segment.slice(0, practiceAt);
    let practice = segment.slice(practiceAt);
    const idsText = verbIds.map(id => JSON.stringify(id)).join(', ');
    const featuredText = featured.map(id => JSON.stringify(id)).join(', ');
    practice = practice.replace(/verbIds:\s*\[[\s\S]*?\],/, `verbIds: [${idsText}],`);
    practice = practice.replace(/featured:\s*\[[\s\S]*?\],/, `featured: [${featuredText}],`);
    return source.slice(0, start) + head + practice + source.slice(end);
  });
}

// ── 1. Наборы глаголов соответствуют объяснённому материалу ────────────────
patchLessonPractice(
  'present-g3-ir',
  ['partir', 'sortir', 'dormir', 'servir', 'ouvrir', 'offrir', 'venir', 'tenir'],
  ['partir', 'ouvrir', 'venir'],
);
patchLessonPractice(
  'imperatif-irreguliers',
  ['être', 'avoir', 'savoir', 'vouloir', 'aller'],
  ['être', 'avoir', 'savoir', 'vouloir', 'aller'],
);

// ── 2. Реальные размеры тренировок ─────────────────────────────────────────
edit('data/lessons.ts', source => {
  if (!source.includes("import { countAvailableQuestions, getVerbById, VERBS } from './verbs';")) {
    source = source.replace(
      "import { getVerbById, VERBS } from './verbs';",
      "import { countAvailableQuestions, getVerbById, VERBS } from './verbs';",
    );
  }

  const drillAnchor = 'export function drillSize(lesson: Lesson, drill: LessonDrill): number {';
  if (!source.includes("lesson.block === 'imperatif' || lesson.block === 'litteraire'")) {
    if (!source.includes(drillAnchor)) throw new Error('Missing drillSize');
    source = source.replace(
      drillAnchor,
      [
        drillAnchor,
        "  if (lesson.block === 'imperatif' || lesson.block === 'litteraire') {",
        "    const persons = lesson.block === 'litteraire'",
        "      ? PERSONS.filter(person => person === 'il' || person === 'ils')",
        '      : PERSONS;',
        '    const available = countAvailableQuestions(drill.verbIds, lesson.practice.tenses, persons);',
        '    return Math.min(drill.isAll ? EXAM_QUESTIONS : DRILL_QUESTIONS, available);',
        '  }',
      ].join('\n'),
    );
  }

  const examAnchor = 'export function lessonExamSize(lesson: Lesson): number {';
  const examMarker = "const persons = lesson.block === 'litteraire'";
  const examAt = source.indexOf(examAnchor);
  if (examAt >= 0 && !source.slice(examAt, examAt + 650).includes(examMarker)) {
    source = source.replace(
      examAnchor,
      [
        examAnchor,
        "  if (lesson.block === 'imperatif' || lesson.block === 'litteraire') {",
        "    const persons = lesson.block === 'litteraire'",
        "      ? PERSONS.filter(person => person === 'il' || person === 'ils')",
        '      : PERSONS;',
        '    const available = countAvailableQuestions(',
        '      lessonPracticeVerbIds(lesson),',
        '      lesson.practice.tenses,',
        '      persons,',
        '    );',
        '    return Math.min(EXAM_QUESTIONS, available);',
        '  }',
      ].join('\n'),
    );
  }
  return source;
});

// ── 3. Мужской/женский вариант в обычных карточках с être ──────────────────
edit('data/verbs.ts', source => {
  if (source.includes('export function quizAnswerVariants(')) return source;

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

  const anchor = [
    'export function getVerbById(id: string): Verb | undefined {',
    '  return VERB_BY_ID.get(id);',
    '}',
  ].join('\n');
  if (!source.includes(anchor)) throw new Error('Missing getVerbById');

  const helper = [
    anchor,
    '',
    '/** Допустимые варианты для обычной карточки спряжения. */',
    'export function quizAnswerVariants(question: QuizQuestion): string[] {',
    '  const verb = getVerbById(question.verbId);',
    "  if (!verb || verb.aux !== 'etre' || !COMPOUND_TENSES.has(question.tense)) {",
    '    return [question.correctAnswer];',
    '  }',
    '',
    '  const personIndex = PERSONS.indexOf(question.person);',
    '  const baseForm = verb.conjugations[question.tense]?.[personIndex];',
    '  if (!baseForm || baseForm.absent || baseForm.form !== question.correctAnswer) {',
    '    return [question.correctAnswer];',
    '  }',
    '',
    '  const feminine = feminineCompound(',
    '    question.tense,',
    '    verb.aux,',
    '    verb.participePasse.form,',
    '    personIndex,',
    '  );',
    '  if (!feminine) return [question.correctAnswer];',
    '',
    '  let feminineAnswer = feminine;',
    '  if (verb.pronominal) {',
    "    const feminineParts = feminine.split(' ');",
    '    const feminineParticiple = feminineParts[feminineParts.length - 1];',
    '    if (!feminineParticiple) return [question.correctAnswer];',
    "    feminineAnswer = question.correctAnswer.replace(/\\S+$/u, feminineParticiple);",
    '  }',
    '',
    '  return feminineAnswer !== question.correctAnswer',
    '    ? [question.correctAnswer, feminineAnswer]',
    '    : [question.correctAnswer];',
    '}',
  ].join('\n');

  return source.replace(anchor, helper);
});

edit('context/QuizContext.tsx', source => {
  if (source.includes('quizAnswerVariants')) return source;
  source = source.replace(
    /import \{\s*countAvailableQuestions, generateOptions, shuffle, VERBS\s*\} from '\.\.\/data\/verbs';/u,
    "import { quizAnswerVariants, countAvailableQuestions, generateOptions, shuffle, VERBS } from '../data/verbs';",
  );

  const from = [
    '        correct: checkAnswer(',
    '          userAnswer,',
    '          question.correctAnswer,',
    '          previous.accentMode ?? fallbackAccentMode,',
    '        ).correct,',
  ].join('\n');
  const to = [
    '        correct: quizAnswerVariants(question).some(expected =>',
    '          checkAnswer(userAnswer, expected, previous.accentMode ?? fallbackAccentMode).correct,',
    '        ),',
  ].join('\n');
  if (!source.includes(from)) throw new Error('Missing submitAnswer check');
  return source.replace(from, to);
});

// ── 4. Книжные времена: распознавание, а не производство шести лиц ─────────
edit('app/lesson/[id].tsx', source => {
  const personsImported = /import\s*\{[\s\S]*?\bPERSONS\b[\s\S]*?\}\s*from '\.\.\/\.\.\/data\/types';/u.test(source);
  if (!personsImported) {
    source = source.replace(
      "import type { QuizMode } from '../../data/types';",
      "import type { QuizMode } from '../../data/types';\nimport { PERSONS } from '../../data/types';",
    );
  }
  if (source.includes("const recognitionOnly = lesson.block === 'litteraire';")) return source;

  const practiceAnchor = '  const practiceVerbIds = lessonPracticeVerbIds(lesson);';
  if (!source.includes(practiceAnchor)) throw new Error('Missing lesson practice anchor');
  source = source.replace(
    practiceAnchor,
    [
      "  const recognitionOnly = lesson.block === 'litteraire';",
      '  const lessonPersons = recognitionOnly',
      "    ? PERSONS.filter(person => person === 'il' || person === 'ils')",
      '    : PERSONS;',
      '',
      practiceAnchor,
    ].join('\n'),
  );

  source = source.replace(
    '  const examAvailable = lessonExamAvailableCount(lesson);',
    [
      '  const examAvailable = recognitionOnly',
      '    ? countAvailableQuestions(examVerbIds, lesson.practice.tenses, lessonPersons)',
      '    : lessonExamAvailableCount(lesson);',
    ].join('\n'),
  );
  source = source.replace(
    "import { getVerbById, VERBS } from '../../data/verbs';",
    "import { countAvailableQuestions, getVerbById, VERBS } from '../../data/verbs';",
  );
  source = source.replace(
    /  const examPersons = onlyImperative[\s\S]*?: 'все 6 лиц';/u,
    [
      '  const examPersons = recognitionOnly',
      "    ? 'il/elle, ils/elles'",
      '    : onlyImperative',
      "      ? 'tu, nous, vous'",
      '      : includesImperative',
      "        ? 'все доступные лица'",
      "        : 'все 6 лиц';",
    ].join('\n'),
  );

  source = source.replace(
    '      mode: LESSON_EXAM_MODE,',
    "      mode: recognitionOnly ? 'multiple-choice' : LESSON_EXAM_MODE,",
  );
  source = source.replaceAll(
    '      mode: practiceMode,',
    "      mode: recognitionOnly ? 'multiple-choice' : practiceMode,",
  );
  source = source.replaceAll('      persons: PERSONS,', '      persons: lessonPersons,');

  source = source.replace(
    '          <View style={styles.modeRow}>',
    '          {!recognitionOnly ? (\n          <View style={styles.modeRow}>',
  );
  source = source.replace(
    '            })}\n          </View>\n\n          <Pressable\n            onPress={startPractice}',
    "            })}\n          </View>\n          ) : (\n            <Text style={[styles.drillHint, { color: colors.mutedForeground }]}>\n              Режим распознавания · варианты ответа · il/elle и ils/elles.\n            </Text>\n          )}\n\n          <Pressable\n            onPress={startPractice}",
  );
  source = source.replace(
    '              Проверяет, можете ли вы воспроизвести ключевые формы без вариантов ответа и самооценки.',
    "              {recognitionOnly\n                ? 'Проверяет, узнаёте ли вы книжные формы в третьем лице — как при чтении текста.'\n                : 'Проверяет, можете ли вы воспроизвести ключевые формы без вариантов ответа и самооценки.'}",
  );
  source = source.replace(
    "                ['Формат', 'ручной ввод · диакритика обязательна'],",
    "                ['Формат', recognitionOnly ? 'варианты ответа · распознавание' : 'ручной ввод · диакритика обязательна'],",
  );
  return source;
});

// ── 5. Старый валидатор переводим на фактические размеры ───────────────────
edit('scripts/validate-verbs.ts', source => {
  // build-fixes в некоторых версиях уже вводит expectedExamQuestions.
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

  // Если осталась прямая проверка на 30, тоже делаем её динамической.
  if (!source.includes('const expectedExamQuestions =')) {
    source = source.replace(
      /(\s*)assert\.equal\(\s*lessonExamSize\(lesson\),\s*EXAM_QUESTIONS,\s*`\$\{lesson\.id\}: exam is only \$\{lessonExamSize\(lesson\)\} questions, need \$\{EXAM_QUESTIONS\}`,\s*\);/u,
      (_match, indent) => [
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
      ].join('\n'),
    );
  }

  source = source.replace(
    /(\s*)assert\(\s*real >= EXAM_QUESTIONS,\s*`\$\{lesson\.id\}: only \$\{real\} real imperative forms, need \$\{EXAM_QUESTIONS\}`,\s*\);/u,
    (_match, indent) => [
      `${indent}const expectedImperativeForms = lesson.id === 'imperatif-irreguliers' ? 15 : EXAM_QUESTIONS;`,
      `${indent}assert(`,
      `${indent}  real >= expectedImperativeForms,`,
      `${indent}  \`${'${lesson.id}'}: only ${'${real}'} real imperative forms, need ${'${expectedImperativeForms}'}\`,`,
      `${indent});`,
    ].join('\n'),
  );

  source = source.replace(
    /(\s*)assert\(\s*size >= PERSONS\.length && size <= DRILL_QUESTIONS,\s*`\$\{lesson\.id\}\/\$\{drill\.key\}: drill of \$\{size\} questions is out of range`,\s*\);/u,
    (_match, indent) => [
      `${indent}const minimumDrillQuestions =`,
      `${indent}  lesson.block === 'imperatif' ? 3 : lesson.block === 'litteraire' ? 4 : PERSONS.length;`,
      `${indent}assert(`,
      `${indent}  size >= minimumDrillQuestions && size <= DRILL_QUESTIONS,`,
      `${indent}  \`${'${lesson.id}'}/${'${drill.key}'}: drill of ${'${size}'} questions is out of range\`,`,
      `${indent});`,
    ].join('\n'),
  );

  source = source.replace(
    /(\s*)assert\.equal\(size, EXAM_QUESTIONS, `\$\{lesson\.id\}: full-set drill is only \$\{size\} questions`\);/u,
    (_match, indent) => [
      `${indent}const expectedFullDrill = lesson.id === 'imperatif-irreguliers' ? 15 : EXAM_QUESTIONS;`,
      `${indent}assert.equal(`,
      `${indent}  size,`,
      `${indent}  expectedFullDrill,`,
      `${indent}  \`${'${lesson.id}'}: full-set drill is only ${'${size}'} questions\`,`,
      `${indent});`,
    ].join('\n'),
  );

  return source;
});

console.log('Applied course audit fixes.');
