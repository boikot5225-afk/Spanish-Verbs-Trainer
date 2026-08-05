import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QuizConfig, QuizHistoryItem, QuizSession, TenseStats } from '../data/types';

const LESSON_PROGRESS_KEY = '@svt/lesson_progress';
const TENSE_STATS_KEY = '@svt/tense_stats';
const SPEECH_KEY = '@svt/speech_enabled';
const QUIZ_CONFIG_KEY = '@svt/quiz_config';
const ACTIVE_SESSION_KEY = '@svt/active_session';
const QUIZ_HISTORY_KEY = '@svt/quiz_history';

const BACKUP_KIND = 'french-verbs-trainer-backup';
const BACKUP_SCHEMA = 1;
const BACKUP_KEYS = [
  LESSON_PROGRESS_KEY,
  TENSE_STATS_KEY,
  SPEECH_KEY,
  QUIZ_CONFIG_KEY,
  QUIZ_HISTORY_KEY,
] as const;

interface PortableBackup {
  kind: typeof BACKUP_KIND;
  schema: typeof BACKUP_SCHEMA;
  createdAt: string;
  values: Record<string, string | null>;
}

export interface BackupSummary {
  createdAt: string;
  passedLessons: number;
  trainedTenses: number;
  historyItems: number;
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

function parseStored<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function parseBackup(raw: string): PortableBackup {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error('Буфер обмена пуст.');
  if (trimmed.length > 2_000_000) throw new Error('Резервная копия слишком большая.');

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error('В буфере нет корректной резервной копии.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Некорректный формат резервной копии.');
  }

  const backup = parsed as Partial<PortableBackup>;
  if (backup.kind !== BACKUP_KIND || backup.schema !== BACKUP_SCHEMA) {
    throw new Error('Это не резервная копия French Verbs Trainer или её формат устарел.');
  }
  if (!backup.values || typeof backup.values !== 'object') {
    throw new Error('В резервной копии отсутствуют данные.');
  }

  const values: Record<string, string | null> = {};
  for (const key of BACKUP_KEYS) {
    const value = backup.values[key];
    if (value !== null && value !== undefined && typeof value !== 'string') {
      throw new Error(`Повреждено поле ${key}.`);
    }
    values[key] = value ?? null;
  }

  return {
    kind: BACKUP_KIND,
    schema: BACKUP_SCHEMA,
    createdAt:
      typeof backup.createdAt === 'string' && !Number.isNaN(Date.parse(backup.createdAt))
        ? backup.createdAt
        : new Date(0).toISOString(),
    values,
  };
}

function summarizeBackup(backup: PortableBackup): BackupSummary {
  const lessonProgress = parseStored<LessonProgress>(backup.values[LESSON_PROGRESS_KEY]);
  const tenseStats = parseStored<TenseStats>(backup.values[TENSE_STATS_KEY]);
  const history = parseStored<QuizHistoryItem[]>(backup.values[QUIZ_HISTORY_KEY]);

  return {
    createdAt: backup.createdAt,
    passedLessons: lessonProgress?.passed?.length ?? 0,
    trainedTenses: tenseStats ? Object.keys(tenseStats).length : 0,
    historyItems: Array.isArray(history) ? history.length : 0,
  };
}

export async function createBackupText(): Promise<string> {
  const entries = await AsyncStorage.multiGet([...BACKUP_KEYS]);
  const backup: PortableBackup = {
    kind: BACKUP_KIND,
    schema: BACKUP_SCHEMA,
    createdAt: new Date().toISOString(),
    values: Object.fromEntries(entries),
  };
  return JSON.stringify(backup);
}

export function inspectBackupText(raw: string): BackupSummary {
  return summarizeBackup(parseBackup(raw));
}

export async function restoreBackupText(raw: string): Promise<BackupSummary> {
  const backup = parseBackup(raw);

  // Активную незавершённую сессию намеренно не переносим: вопросы могли
  // измениться между версиями и восстановить её безопасно невозможно.
  await AsyncStorage.multiRemove([...BACKUP_KEYS, ACTIVE_SESSION_KEY]);

  const entries: [string, string][] = [];
  for (const key of BACKUP_KEYS) {
    const value = backup.values[key];
    if (typeof value === 'string') entries.push([key, value]);
  }
  if (entries.length > 0) await AsyncStorage.multiSet(entries);

  return summarizeBackup(backup);
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

export function loadLessonProgress(): Promise<LessonProgress | null> {
  return loadJson<LessonProgress>(LESSON_PROGRESS_KEY);
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
