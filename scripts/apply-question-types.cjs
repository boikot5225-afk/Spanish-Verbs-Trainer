const fs = require('node:fs');

function edit(path, transform) {
  const source = fs.readFileSync(path, 'utf8');
  const next = transform(source);
  if (next !== source) fs.writeFileSync(path, next, 'utf8');
}

function replaceRequired(source, from, to, label) {
  if (source.includes(to)) return source;
  if (!source.includes(from)) throw new Error(`Question types patch: missing ${label}`);
  return source.replace(from, to);
}

// ── 1. Модель данных ───────────────────────────────────────────────────────
edit('data/types.ts', source => {
  source = replaceRequired(
    source,
    "export type QuizMode = 'input' | 'multiple-choice' | 'flashcard';",
    [
      'export type QuizMode =',
      "  | 'input'",
      "  | 'multiple-choice'",
      "  | 'flashcard'",
      "  | 'fill-blank'",
      "  | 'error-correction'",
      "  | 'contrast'",
      "  | 'word-order';",
    ].join('\n'),
    'QuizMode',
  );

  if (!source.includes('contextTranslation?: string;')) {
    const match = source.match(/export interface QuizQuestion \{[\s\S]*?\n\}/u);
    if (!match) throw new Error('Question types patch: missing QuizQuestion interface');
    const additions = [
      '  /** Предложение с пропуском или намеренной ошибкой. */',
      '  context?: string;',
      '  contextTranslation?: string;',
      '  /** Правильное предложение целиком — для обратной связи и озвучки. */',
      '  solutionText?: string;',
      '  /** Намеренно неверная форма/конструкция в режиме исправления ошибки. */',
      '  wrongAnswer?: string;',
      '  /** Перемешанные блоки для сборки предложения. */',
      '  tokens?: string[];',
    ].join('\n');
    const patched = match[0].replace(/\n\}/u, `\n${additions}\n}`);
    source = source.replace(match[0], patched);
  }
  return source;
});

// ── 2. Генерация вопросов, тематические уроки и сохранённые сессии ─────────
edit('context/QuizContext.tsx', source => {
  if (!source.includes("from '../data/exercise-questions'")) {
    source = replaceRequired(
      source,
      "import { checkAnswer } from '../data/answer';",
      [
        "import { checkAnswer } from '../data/answer';",
        'import {',
        '  buildExerciseQuestion,',
        '  buildThematicExerciseQuestions,',
        '  isContextualQuizMode,',
        '  isValidExerciseQuestion,',
        "} from '../data/exercise-questions';",
      ].join('\n'),
      'QuizContext exercise imports',
    );
  }

  // Старые build 160-сессии с одним вариантом в contrast не должны оживать
  // после обновления и снова показывать сломанный вопрос.
  if (!source.includes('isValidExerciseQuestion(question, session.mode)')) {
    source = replaceRequired(
      source,
      '    session.questions.every(question => VALID_VERB_IDS.has(question.verbId)) &&',
      [
        '    session.questions.every(question => VALID_VERB_IDS.has(question.verbId)) &&',
        '    session.questions.every(question => isValidExerciseQuestion(question, session.mode)) &&',
      ].join('\n'),
      'saved contextual session validation',
    );
  }

  // Тематический генератор создаёт правильное учебное содержание (venir de,
  // aller + infinitif, être/avoir, subjonctif...). Новые режимы обязаны
  // преобразовывать ЕГО вопросы, а не обходить их.
  if (!source.includes('buildThematicExerciseQuestions(thematic, cfg.mode, thematicLessonId)')) {
    source = replaceRequired(
      source,
      [
        '    const thematic = buildThematicQuestions(cfg);',
        '    if (thematic !== null) return thematic;',
      ].join('\n'),
      [
        '    const thematicLessonId = cfg.lessonId ?? cfg.exam?.lessonId ?? cfg.drill?.lessonId;',
        '    const thematicConfig = isContextualQuizMode(cfg.mode)',
        "      ? { ...cfg, mode: 'multiple-choice' as const }",
        '      : cfg;',
        '    const thematic = buildThematicQuestions(thematicConfig);',
        '    if (thematic !== null) {',
        '      return thematicLessonId',
        '        ? buildThematicExerciseQuestions(thematic, cfg.mode, thematicLessonId)',
        '        : thematic;',
        '    }',
      ].join('\n'),
      'thematic contextual adaptation',
    );
  }

  if (!source.includes('const exerciseQuestion = buildExerciseQuestion(')) {
    const directPush = '      questions.push(buildExerciseQuestion(baseQuestion, cfg.mode, cfg.tenses, verb));';
    const oldPush = [
      '      questions.push({',
      '        verbId: verb.id,',
      '        tense,',
      '        person,',
      '        correctAnswer: form.form,',
      '        options:',
      "          cfg.mode === 'multiple-choice'",
      '            ? generateOptions(verb.id, tense, personIndex, form.form)',
      '            : undefined,',
      '      });',
    ].join('\n');

    if (source.includes(directPush)) {
      source = source.replace(
        directPush,
        [
          '      const exerciseQuestion = buildExerciseQuestion(baseQuestion, cfg.mode, cfg.tenses, verb);',
          '      if (exerciseQuestion) questions.push(exerciseQuestion);',
        ].join('\n'),
      );
    } else if (source.includes(oldPush)) {
      source = source.replace(
        oldPush,
        [
          '      const baseQuestion: QuizQuestion = {',
          '        verbId: verb.id,',
          '        tense,',
          '        person,',
          '        correctAnswer: form.form,',
          '        options:',
          "          cfg.mode === 'multiple-choice'",
          '            ? generateOptions(verb.id, tense, personIndex, form.form)',
          '            : undefined,',
          '      };',
          '      const exerciseQuestion = buildExerciseQuestion(baseQuestion, cfg.mode, cfg.tenses, verb);',
          '      if (exerciseQuestion) questions.push(exerciseQuestion);',
        ].join('\n'),
      );
    } else {
      throw new Error('Question types patch: missing QuizContext question builder');
    }
  }

  // Повтор ошибок обязан сохранять две contrast-опции. В build 160 они
  // стирались, поэтому повтор превращался в очередной вопрос с одной кнопкой.
  const auditedRetry = [
    '        const options =',
    "          session.mode === 'multiple-choice'",
    '            ? question.options',
    '              ? shuffle(question.options)',
    '              : generateOptions(question.verbId, question.tense, personIndex, question.correctAnswer)',
    '            : undefined;',
  ].join('\n');
  const robustRetry = [
    '        const options = question.options',
    '          ? shuffle(question.options)',
    "          : session.mode === 'multiple-choice'",
    '            ? generateOptions(question.verbId, question.tense, personIndex, question.correctAnswer)',
    '            : undefined;',
  ].join('\n');
  if (source.includes(auditedRetry)) {
    source = source.replace(auditedRetry, robustRetry);
  } else {
    const originalRetry = [
      '        const options =',
      "          session.mode === 'multiple-choice'",
      '            ? generateOptions(question.verbId, question.tense, personIndex, question.correctAnswer)',
      '            : undefined;',
    ].join('\n');
    if (source.includes(originalRetry)) source = source.replace(originalRetry, robustRetry);
  }

  return source;
});

// ── 3. Экран сессии ────────────────────────────────────────────────────────
edit('app/quiz-session.tsx', source => {
  if (!source.includes("from '@/components/ContextExercise'")) {
    source = replaceRequired(
      source,
      "import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';",
      [
        "import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';",
        "import { ContextExercise } from '@/components/ContextExercise';",
        "import type { ContextQuizMode } from '@/data/exercise-questions';",
      ].join('\n'),
      'quiz-session ContextExercise import',
    );
  }

  if (!source.includes('const allowTypoHint =')) {
    source = replaceRequired(
      source,
      '    if (!verdict.correct && verdict.looksLikeTypo && !typoHint) {',
      [
        "    const allowTypoHint = mode === 'input' || mode === 'fill-blank' || mode === 'error-correction';",
        '    if (!verdict.correct && verdict.looksLikeTypo && !typoHint && allowTypoHint) {',
      ].join('\n'),
      'typed-mode typo handling',
    );
  }

  if (!source.includes('<ContextExercise')) {
    source = replaceRequired(
      source,
      "      {mode === 'flashcard' && renderFlashcard()}",
      [
        "      {mode === 'flashcard' && renderFlashcard()}",
        "      {(mode === 'fill-blank' || mode === 'error-correction' || mode === 'contrast' || mode === 'word-order') && (",
        '        <ContextExercise',
        '          key={`${mode}-${currentIndex}`}',
        '          mode={mode as ContextQuizMode}',
        '          question={question}',
        '          verb={verb}',
        '          accentMode={accentMode}',
        '          isChecked={isChecked}',
        '          isCorrect={isCorrect}',
        '          accentNote={accentNote}',
        '          typoHint={typoHint}',
        '          onCheck={handleCheck}',
        '          onNext={handleNext}',
        '          isLast={isLast}',
        '        />',
        '      )}',
      ].join('\n'),
      'context exercise renderer',
    );
  }
  return source;
});

// ── 4. Конструктор «Свой тест» ─────────────────────────────────────────────
edit('app/(tabs)/quiz.tsx', source => {
  const oldModes = [
    'const MODES: { id: QuizMode; label: string; description: string }[] = [',
    "  { id: 'multiple-choice', label: 'Варианты ответа', description: 'Четыре формы на выбор' },",
    "  { id: 'input', label: 'Ввод ответа', description: 'Напечатайте форму самостоятельно' },",
    "  { id: 'flashcard', label: 'Карточки', description: 'Оцените, знали вы ответ или нет' },",
    '];',
  ].join('\n');
  const newModes = [
    'const MODES: { id: QuizMode; label: string; description: string }[] = [',
    "  { id: 'multiple-choice', label: 'Варианты ответа', description: 'Четыре формы на выбор' },",
    "  { id: 'input', label: 'Ввод ответа', description: 'Напечатайте форму самостоятельно' },",
    "  { id: 'fill-blank', label: 'Заполнить пропуск', description: 'Вставьте форму или конструкцию в контекст' },",
    "  { id: 'error-correction', label: 'Исправить ошибку', description: 'Найдите неверную форму или конструкцию' },",
    "  { id: 'contrast', label: 'Выбор по контексту', description: 'Два правдоподобных варианта — выберите подходящий' },",
    "  { id: 'word-order', label: 'Порядок слов', description: 'Соберите полноценное французское предложение' },",
    "  { id: 'flashcard', label: 'Карточки', description: 'Оцените, знали вы ответ или нет' },",
    '];',
  ].join('\n');
  return replaceRequired(source, oldModes, newModes, 'custom quiz modes');
});

// ── 5. Свободная тренировка внутри урока ───────────────────────────────────
edit('app/lesson/[id].tsx', source => {
  const oldModes = [
    'const PRACTICE_MODES: { id: QuizMode; label: string }[] = [',
    "  { id: 'input', label: 'Ввод' },",
    "  { id: 'multiple-choice', label: 'Варианты' },",
    "  { id: 'flashcard', label: 'Карточки' },",
    '];',
  ].join('\n');
  const newModes = [
    'const PRACTICE_MODES: { id: QuizMode; label: string }[] = [',
    "  { id: 'input', label: 'Ввод' },",
    "  { id: 'multiple-choice', label: 'Варианты' },",
    "  { id: 'fill-blank', label: 'Пропуск' },",
    "  { id: 'error-correction', label: 'Ошибка' },",
    "  { id: 'contrast', label: 'Контекст' },",
    "  { id: 'word-order', label: 'Порядок' },",
    "  { id: 'flashcard', label: 'Карточки' },",
    '];',
  ].join('\n');
  source = replaceRequired(source, oldModes, newModes, 'lesson practice modes');

  source = replaceRequired(
    source,
    "  modeRow: { flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 10 },",
    "  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 10 },",
    'lesson mode wrapping',
  );
  source = replaceRequired(
    source,
    [
      '  modeChip: {',
      '    flex: 1,',
      '    borderWidth: 1,',
    ].join('\n'),
    [
      '  modeChip: {',
      '    flexGrow: 1,',
      "    flexBasis: '30%',",
      '    borderWidth: 1,',
    ].join('\n'),
    'lesson mode chip sizing',
  );
  return source;
});

console.log('Applied audited contextual question types.');
