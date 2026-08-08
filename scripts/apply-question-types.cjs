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
      '  /** Намеренно неверная форма в режиме исправления ошибки. */',
      '  wrongAnswer?: string;',
      '  /** Перемешанные блоки для сборки предложения. */',
      '  tokens?: string[];',
    ].join('\n');
    const patched = match[0].replace(/\n\}/u, `\n${additions}\n}`);
    source = source.replace(match[0], patched);
  }
  return source;
});

// ── 2. Генерация вопросов и повтор ошибок ──────────────────────────────────
edit('context/QuizContext.tsx', source => {
  if (!source.includes("from '../data/exercise-questions'")) {
    source = replaceRequired(
      source,
      "import { checkAnswer } from '../data/answer';",
      "import { checkAnswer } from '../data/answer';\nimport { buildExerciseQuestion } from '../data/exercise-questions';",
      'QuizContext exercise import',
    );
  }

  if (!source.includes('buildExerciseQuestion(baseQuestion, cfg.mode, cfg.tenses, verb)')) {
    const from = [
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
    const to = [
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
      '      questions.push(buildExerciseQuestion(baseQuestion, cfg.mode, cfg.tenses, verb));',
    ].join('\n');
    source = replaceRequired(source, from, to, 'QuizContext question builder');
  }

  const oldRetry = [
    '        const options =',
    "          session.mode === 'multiple-choice'",
    '            ? generateOptions(question.verbId, question.tense, personIndex, question.correctAnswer)',
    '            : undefined;',
  ].join('\n');
  const newRetry = [
    '        const options =',
    "          session.mode === 'multiple-choice'",
    '            ? generateOptions(question.verbId, question.tense, personIndex, question.correctAnswer)',
    '            : question.options;',
  ].join('\n');
  if (source.includes(oldRetry)) source = source.replace(oldRetry, newRetry);
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

  if (!source.includes('question.solutionText ?? speechText(')) {
    source = replaceRequired(
      source,
      '    if (speechEnabled) speak(speechText(question.person, question.tense, question.correctAnswer));',
      [
        '    if (speechEnabled) {',
        '      speak(question.solutionText ?? speechText(question.person, question.tense, question.correctAnswer));',
        '    }',
      ].join('\n'),
      'context speech feedback',
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
    "  { id: 'fill-blank', label: 'Заполнить пропуск', description: 'Вставьте форму в живое предложение' },",
    "  { id: 'error-correction', label: 'Исправить ошибку', description: 'Найдите неверную форму и исправьте её' },",
    "  { id: 'contrast', label: 'Выбор по контексту', description: 'Две конкурирующие формы — выберите подходящую' },",
    "  { id: 'word-order', label: 'Порядок слов', description: 'Соберите французское предложение из блоков' },",
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

console.log('Applied Dr French-style question types.');
