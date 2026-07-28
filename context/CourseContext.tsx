import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  loadCourseProgress,
  saveCourseProgress,
  type CourseProgress,
} from '../utils/storage';

const EMPTY_PROGRESS: CourseProgress = {
  completedLessonIds: [],
  bestScores: {},
};

interface CourseContextValue {
  progress: CourseProgress;
  isHydrated: boolean;
  recordLessonResult: (lessonId: string, score: number) => void;
}

const CourseContext = createContext<CourseContextValue | null>(null);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<CourseProgress>(EMPTY_PROGRESS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    loadCourseProgress()
      .then(saved => {
        if (!saved) return;
        setProgress({
          completedLessonIds: Array.isArray(saved.completedLessonIds)
            ? saved.completedLessonIds
            : [],
          bestScores: saved.bestScores ?? {},
        });
      })
      .finally(() => setIsHydrated(true));
  }, []);

  const recordLessonResult = useCallback((lessonId: string, score: number) => {
    setProgress(previous => {
      const completed =
        score >= 70 && !previous.completedLessonIds.includes(lessonId)
          ? [...previous.completedLessonIds, lessonId]
          : previous.completedLessonIds;
      const next = {
        completedLessonIds: completed,
        bestScores: {
          ...previous.bestScores,
          [lessonId]: Math.max(score, previous.bestScores[lessonId] ?? 0),
        },
      };
      void saveCourseProgress(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ progress, isHydrated, recordLessonResult }),
    [progress, isHydrated, recordLessonResult],
  );

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export function useCourse(): CourseContextValue {
  const context = useContext(CourseContext);
  if (!context) throw new Error('useCourse must be used inside CourseProvider');
  return context;
}
