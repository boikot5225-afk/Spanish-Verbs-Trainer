import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuizConfig, QuizHistoryItem, QuizSession } from '../data/types';

const QUIZ_CONFIG_KEY = '@svt/quiz_config';
const ACTIVE_SESSION_KEY = '@svt/active_session';
const QUIZ_HISTORY_KEY = '@svt/quiz_history';
const COURSE_PROGRESS_KEY = '@svt/course_progress';

export interface CourseProgress {
  completedLessonIds: string[];
  bestScores: Record<string, number>;
}

async function saveJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local persistence must never crash a training session.
  }
}

async function loadJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveQuizConfig(config: QuizConfig): Promise<void> {
  return saveJson(QUIZ_CONFIG_KEY, config);
}

export function loadQuizConfig(): Promise<QuizConfig | null> {
  return loadJson<QuizConfig>(QUIZ_CONFIG_KEY);
}

export function saveActiveSession(session: QuizSession): Promise<void> {
  return saveJson(ACTIVE_SESSION_KEY, session);
}

export function loadActiveSession(): Promise<QuizSession | null> {
  return loadJson<QuizSession>(ACTIVE_SESSION_KEY);
}

export async function clearActiveSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export function loadQuizHistory(): Promise<QuizHistoryItem[] | null> {
  return loadJson<QuizHistoryItem[]>(QUIZ_HISTORY_KEY);
}

export async function appendQuizHistory(item: QuizHistoryItem): Promise<void> {
  const history = (await loadQuizHistory()) ?? [];
  const withoutDuplicate = history.filter(existing => existing.id !== item.id);
  await saveJson(QUIZ_HISTORY_KEY, [item, ...withoutDuplicate].slice(0, 50));
}

export function loadCourseProgress(): Promise<CourseProgress | null> {
  return loadJson<CourseProgress>(COURSE_PROGRESS_KEY);
}

export function saveCourseProgress(progress: CourseProgress): Promise<void> {
  return saveJson(COURSE_PROGRESS_KEY, progress);
}
