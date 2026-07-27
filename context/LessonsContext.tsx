import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LESSONS, lessonIndex } from '../data/lessons';
import { loadLessonProgress, saveLessonProgress } from '../utils/storage';
import { useQuiz } from './QuizContext';

interface LessonsContextValue {
  passed: Set<string>;
  /** Темы, открытые вручную кнопкой «Открыть без зачёта». */
  unlocked: Set<string>;
  isHydrated: boolean;
  isAvailable: (lessonId: string) => boolean;
  markPassed: (lessonId: string) => void;
  unlock: (lessonId: string) => void;
  resetProgress: () => void;
  /** Первая несданная тема — на ней стоит продолжить курс. */
  currentLessonId: string | undefined;
}

const LessonsContext = createContext<LessonsContextValue | null>(null);

export function LessonsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useQuiz();
  const [passed, setPassed] = useState<Set<string>>(new Set());
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    loadLessonProgress()
      .then(saved => {
        if (saved) {
          setPassed(new Set(saved.passed ?? []));
          setUnlocked(new Set(saved.unlocked ?? []));
        }
      })
      .finally(() => setIsHydrated(true));
  }, []);

  const persist = useCallback((nextPassed: Set<string>, nextUnlocked: Set<string>) => {
    void saveLessonProgress({ passed: [...nextPassed], unlocked: [...nextUnlocked] });
  }, []);

  const markPassed = useCallback(
    (lessonId: string) => {
      setPassed(previous => {
        if (previous.has(lessonId)) return previous;
        const next = new Set(previous).add(lessonId);
        setUnlocked(currentUnlocked => {
          persist(next, currentUnlocked);
          return currentUnlocked;
        });
        return next;
      });
    },
    [persist],
  );

  const unlock = useCallback(
    (lessonId: string) => {
      setUnlocked(previous => {
        if (previous.has(lessonId)) return previous;
        const next = new Set(previous).add(lessonId);
        setPassed(currentPassed => {
          persist(currentPassed, next);
          return currentPassed;
        });
        return next;
      });
    },
    [persist],
  );

  const resetProgress = useCallback(() => {
    setPassed(new Set());
    setUnlocked(new Set());
    void saveLessonProgress({ passed: [], unlocked: [] });
  }, []);

  // Зачёт засчитывается ровно один раз — когда сессия-экзамен дошла до конца
  // и ошибок оказалось не больше разрешённых.
  useEffect(() => {
    if (!isHydrated || !session?.exam) return;
    if (session.answers.length < session.questions.length) return;
    if (session.questions.length === 0) return;

    const mistakes = session.answers.filter(answer => !answer.correct).length;
    if (mistakes <= session.exam.maxMistakes) markPassed(session.exam.lessonId);
  }, [isHydrated, session, markPassed]);

  const isAvailable = useCallback(
    (lessonId: string) => {
      const index = lessonIndex(lessonId);
      if (index <= 0) return true; // первая тема всегда открыта
      if (passed.has(lessonId) || unlocked.has(lessonId)) return true;
      const previous = LESSONS[index - 1];
      return previous ? passed.has(previous.id) : true;
    },
    [passed, unlocked],
  );

  const currentLessonId = useMemo(
    () => LESSONS.find(lesson => !passed.has(lesson.id))?.id,
    [passed],
  );

  const value = useMemo<LessonsContextValue>(
    () => ({
      passed,
      unlocked,
      isHydrated,
      isAvailable,
      markPassed,
      unlock,
      resetProgress,
      currentLessonId,
    }),
    [passed, unlocked, isHydrated, isAvailable, markPassed, unlock, resetProgress, currentLessonId],
  );

  return <LessonsContext.Provider value={value}>{children}</LessonsContext.Provider>;
}

export function useLessons(): LessonsContextValue {
  const context = useContext(LessonsContext);
  if (!context) throw new Error('useLessons must be used inside LessonsProvider');
  return context;
}
