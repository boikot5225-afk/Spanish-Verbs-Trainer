import { EXAM_QUESTIONS, lessonPracticeVerbIds, type Lesson } from './lessons';
import { PERSONS } from './types';
import { countAvailableQuestions, getVerbById } from './verbs';

/**
 * Зачёт не наследует режим свободной тренировки. Иначе его можно было пройти
 * карточками с самооценкой или вариантами ответа, что не проверяет активное
 * воспроизведение формы.
 */
export const LESSON_EXAM_MODE = 'input' as const;
export const LESSON_EXAM_ACCENT_MODE = 'strict' as const;

/**
 * У отдельных уроков тренировочный набор шире того, что фактически объяснено
 * в тексте. Для них область зачёта задаётся явно, а не угадывается по featured:
 * featured нужен мини-подходам и не должен незаметно ослаблять все зачёты курса.
 */
const EXPLICIT_EXAM_VERBS: Partial<Record<string, string[]>> = {
  'present-etre-avoir': ['être', 'avoir', 'aller', 'faire'],
};

export function lessonExamVerbIds(lesson: Lesson): string[] {
  const practiceIds = lessonPracticeVerbIds(lesson);
  const explicit = (EXPLICIT_EXAM_VERBS[lesson.id] ?? []).filter(
    id => practiceIds.includes(id) && getVerbById(id) !== undefined,
  );
  return explicit.length > 0 ? explicit : practiceIds;
}

/** Реальное число существующих форм с учётом безличных глаголов и impératif. */
export function lessonExamAvailableCount(lesson: Lesson): number {
  return countAvailableQuestions(
    lessonExamVerbIds(lesson),
    lesson.practice.tenses,
    PERSONS,
  );
}

/** Зачёт берёт все формы, пока их не больше общего лимита. */
export function lessonExamQuestionCount(lesson: Lesson): number {
  return Math.min(EXAM_QUESTIONS, lessonExamAvailableCount(lesson));
}
