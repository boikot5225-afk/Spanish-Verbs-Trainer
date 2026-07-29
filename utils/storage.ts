import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuizConfig, QuizHistoryItem, QuizSession, TenseStats } from '../data/types';

const LESSON_PROGRESS_KEY = '@svt/lesson_progress';
const TENSE_STATS_KEY = '@svt/tense_stats';
const SPEECH_KEY = '@svt/speech_enabled';
const QUIZ_CONFIG_KEY = '@svt/quiz_config';
const ACTIVE_SESSION_KEY = '@svt/active_session';
const QUIZ_HISTORY_KEY = '@svt/quiz_history';

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

/** Сданные темы и темы, открытые вручную без зачёта. */
export interface LessonProgress {
  passed: string[];
  unlocked: string[];
  /** Лучший процент по каждой мини-тренировке: lessonId → drillKey → 0..100. */
  drills?: Record<string, Record<string, number>>;
}

export function saveLessonProgress(progress: LessonProgress): Promise<void> {
  return saveJson(LESSON_PROGRESS_KEY, progress);
}

/**
 * Урок о возвратных глаголах раньше тренировал levantar, а теперь levantarse.
 * Медали лежат под ключом-идентификатором глагола, поэтому без переноса
 * заработанное на старых подходах просто пропало бы из виду.
 */
const RENAMED_DRILL_KEYS: Record<string, string> = {
  levantar: 'levantarse',
  llamar: 'llamarse',
  despertar: 'despertarse',
  acostar: 'acostarse',
  duchar: 'ducharse',
  sentar: 'sentarse',
  vestir: 'vestirse',
  dormir: 'dormirse',
  ir: 'irse',
  poner: 'ponerse',
};

function migrateDrills(progress: LessonProgress): LessonProgress {
  const lessonDrills = progress.drills?.['reflexivos'];
  if (!lessonDrills) return progress;

  const migrated: Record<string, number> = {};
  for (const [key, percent] of Object.entries(lessonDrills)) {
    const renamed = RENAMED_DRILL_KEYS[key] ?? key;
    // Лучший результат побеждает: вдруг новый подход уже проходили.
    migrated[renamed] = Math.max(percent, migrated[renamed] ?? 0);
  }

  return { ...progress, drills: { ...progress.drills, reflexivos: migrated } };
}

export async function loadLessonProgress(): Promise<LessonProgress | null> {
  const saved = await loadJson<LessonProgress>(LESSON_PROGRESS_KEY);
  return saved ? migrateDrills(saved) : saved;
}

export function saveSpeechEnabled(enabled: boolean): Promise<void> {
  return saveJson(SPEECH_KEY, enabled);
}

export function loadSpeechEnabled(): Promise<boolean | null> {
  return loadJson<boolean>(SPEECH_KEY);
}

export function saveTenseStats(stats: TenseStats): Promise<void> {
  return saveJson(TENSE_STATS_KEY, stats);
}

export function loadTenseStats(): Promise<TenseStats | null> {
  return loadJson<TenseStats>(TENSE_STATS_KEY);
}

export async function appendQuizHistory(item: QuizHistoryItem): Promise<void> {
  const history = (await loadQuizHistory()) ?? [];
  const withoutDuplicate = history.filter(existing => existing.id !== item.id);
  await saveJson(QUIZ_HISTORY_KEY, [item, ...withoutDuplicate].slice(0, 50));
}
