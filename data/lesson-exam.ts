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
 * Зачёт проверяет ключевые глаголы, показанные в уроке и вынесенные в отдельные
 * мини-тренировки. Если у старого урока ключевые глаголы не указаны, используем
 * весь тренировочный набор как безопасный запасной вариант.
 */
export function lessonExamVerbIds(lesson: Lesson): string[] {
  const practiceIds = lessonPracticeVerbIds(lesson);
  const featured = (lesson.practice.featured ?? []).filter(
    id => practiceIds.includes(id) && getVerbById(id) !== undefined,
  );
  return featured.length > 0 ? featured : practiceIds;
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
