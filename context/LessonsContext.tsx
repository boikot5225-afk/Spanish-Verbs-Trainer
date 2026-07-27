import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LESSONS, lessonIndex, medalFor, type Medal } from '../data/lessons';
import { recordAnswer } from '../data/fluency';
import type { TenseStats } from '../data/types';
import {
  loadLessonProgress,
  loadTenseStats,
  saveLessonProgress,
  saveTenseStats,
  type LessonProgress,
} from '../utils/storage';
import { useQuiz } from './QuizContext';

const EMPTY: LessonProgress = { passed: [], unlocked: [], drills: {} };

interface LessonsContextValue {
  passed: Set<string>;
  /** Темы, открытые вручную кнопкой «Открыть без зачёта». */
  unlocked: Set<string>;
  isHydrated: boolean;
  isAvailable: (lessonId: string) => boolean;
  /** Лучший результат мини-тренировки в процентах, 0 если ещё не проходили. */
  drillScore: (lessonId: string, drillKey: string) => number;
  drillMedal: (lessonId: string, drillKey: string) => Medal;
  markPassed: (lessonId: string) => void;
  unlock: (lessonId: string) => void;
  resetProgress: () => void;
  /** Первая несданная тема — на ней стоит продолжить курс. */
  currentLessonId: string | undefined;
  /** Накопленная статистика по временам для экрана прогресса. */
  tenseStats: TenseStats;
}

const LessonsContext = createContext<LessonsContextValue | null>(null);

export function LessonsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useQuiz();
  const [progress, setProgress] = useState<LessonProgress>(EMPTY);
  const [tenseStats, setTenseStats] = useState<TenseStats>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    Promise.all([loadLessonProgress(), loadTenseStats()])
      .then(([saved, stats]) => {
        if (saved) {
          setProgress({
            passed: saved.passed ?? [],
            unlocked: saved.unlocked ?? [],
            drills: saved.drills ?? {},
          });
        }
        if (stats) setTenseStats(stats);
      })
      .finally(() => setIsHydrated(true));
  }, []);

  const update = useCallback((change: (previous: LessonProgress) => LessonProgress) => {
    setProgress(previous => {
      const next = change(previous);
      if (next === previous) return previous;
      void saveLessonProgress(next);
      return next;
    });
  }, []);

  const markPassed = useCallback(
    (lessonId: string) => {
      update(previous =>
        previous.passed.includes(lessonId)
          ? previous
          : { ...previous, passed: [...previous.passed, lessonId] },
      );
    },
    [update],
  );

  const unlock = useCallback(
    (lessonId: string) => {
      update(previous =>
        previous.unlocked.includes(lessonId)
          ? previous
          : { ...previous, unlocked: [...previous.unlocked, lessonId] },
      );
    },
    [update],
  );

  const recordDrill = useCallback(
    (lessonId: string, drillKey: string, percent: number) => {
      update(previous => {
        const drills = previous.drills ?? {};
        const best = drills[lessonId]?.[drillKey] ?? -1;
        if (percent <= best) return previous; // храним только лучший результат
        return {
          ...previous,
          drills: { ...drills, [lessonId]: { ...drills[lessonId], [drillKey]: percent } },
        };
      });
    },
    [update],
  );

  const resetProgress = useCallback(() => {
    setProgress(EMPTY);
    setTenseStats({});
    void saveLessonProgress(EMPTY);
    void saveTenseStats({});
  }, []);

  // Итоги подводятся один раз, когда сессия дошла до конца: зачёт открывает
  // следующую тему, мини-тренировка обновляет медаль.
  useEffect(() => {
    if (!isHydrated || !session) return;
    if (session.questions.length === 0) return;
    if (session.answers.length < session.questions.length) return;

    const correct = session.answers.filter(answer => answer.correct).length;
    const percent = Math.round((correct / session.answers.length) * 100);

    if (session.exam && session.answers.length - correct <= session.exam.maxMistakes) {
      markPassed(session.exam.lessonId);
    }
    if (session.drill) {
      recordDrill(session.drill.lessonId, session.drill.key, percent);
    }

    // Владение временем считаем по всем ответам — и в уроках, и в своём тесте.
    setTenseStats(previous => {
      const next: TenseStats = { ...previous };
      const now = new Date().toISOString();
      for (const answer of session.answers) {
        const { tense, verbId } = answer.question;
        next[tense] = recordAnswer(next[tense], verbId, answer.correct, now);
      }
      void saveTenseStats(next);
      return next;
    });
  }, [isHydrated, session, markPassed, recordDrill]);

  const passed = useMemo(() => new Set(progress.passed), [progress.passed]);
  const unlockedSet = useMemo(() => new Set(progress.unlocked), [progress.unlocked]);

  // Самая дальняя сданная тема. По ней и открывается следующая — так вставка
  // новых уроков в середину курса не закрывает то, что уже пройдено дальше.
  const furthestPassed = useMemo(() => {
    let furthest = -1;
    for (const lessonId of passed) furthest = Math.max(furthest, lessonIndex(lessonId));
    return furthest;
  }, [passed]);

  const isAvailable = useCallback(
    (lessonId: string) => {
      const index = lessonIndex(lessonId);
      if (index <= 0) return true; // первая тема всегда открыта
      if (passed.has(lessonId) || unlockedSet.has(lessonId)) return true;
      return index <= furthestPassed + 1;
    },
    [passed, unlockedSet, furthestPassed],
  );

  const drillScore = useCallback(
    (lessonId: string, drillKey: string) => progress.drills?.[lessonId]?.[drillKey] ?? 0,
    [progress.drills],
  );

  const drillMedal = useCallback(
    (lessonId: string, drillKey: string): Medal => {
      const score = progress.drills?.[lessonId]?.[drillKey];
      return score === undefined ? null : medalFor(score);
    },
    [progress.drills],
  );

  const currentLessonId = useMemo(
    () => LESSONS.find(lesson => !passed.has(lesson.id))?.id,
    [passed],
  );

  const value = useMemo<LessonsContextValue>(
    () => ({
      passed,
      unlocked: unlockedSet,
      isHydrated,
      isAvailable,
      drillScore,
      drillMedal,
      markPassed,
      unlock,
      resetProgress,
      currentLessonId,
      tenseStats,
    }),
    [
      passed,
      unlockedSet,
      isHydrated,
      isAvailable,
      drillScore,
      drillMedal,
      markPassed,
      unlock,
      resetProgress,
      currentLessonId,
      tenseStats,
    ],
  );

  return <LessonsContext.Provider value={value}>{children}</LessonsContext.Provider>;
}

export function useLessons(): LessonsContextValue {
  const context = useContext(LessonsContext);
  if (!context) throw new Error('useLessons must be used inside LessonsProvider');
  return context;
}
