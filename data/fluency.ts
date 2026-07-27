import type { TenseStat } from './types';

/** Сколько последних ответов учитывается в точности. */
export const RECENT_WINDOW = 40;
/** Сколько разных глаголов помним для оценки охвата. */
export const COVERAGE_MEMORY = 40;
/** Столько разных глаголов нужно для полного охвата времени. */
export const COVERAGE_TARGET = 12;
/** Меньше этого числа ответов — говорить о владении рано. */
export const MIN_ANSWERS = 10;
/** Порог, с которого время считается освоенным. */
export const MASTERY_THRESHOLD = 70;
/** За сколько дней простоя показатель проседает до нижней границы. */
export const DECAY_DAYS = 90;
/** Ниже этой доли простой не опускает: выученное не исчезает полностью. */
const DECAY_FLOOR = 0.65;

export interface Fluency {
  /** Итоговый показатель владения, 0..100. */
  score: number;
  /** Доля верных среди последних ответов, 0..100. */
  accuracy: number;
  /** Насколько разнообразны глаголы, 0..100. */
  coverage: number;
  /** Множитель за свежесть, 0.65..1. */
  freshness: number;
  distinctVerbs: number;
  daysSince: number;
  /** Показатель просел из-за простоя. */
  isStale: boolean;
  /** Ответов пока слишком мало, чтобы судить. */
  isTentative: boolean;
}

export function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

/**
 * Владение временем — это не просто доля верных ответов: двадцать вопросов по
 * шести глаголам подряд ещё ничего не доказывают. Показатель складывается из
 * точности на свежих ответах, охвата разных глаголов и свежести тренировки.
 */
export function fluencyOf(stat: TenseStat | undefined): Fluency | null {
  if (!stat || stat.asked === 0) return null;

  const recent = stat.recent ?? [];
  const accuracy =
    recent.length > 0
      ? recent.reduce((total, value) => total + value, 0) / recent.length
      : stat.correct / stat.asked;

  const distinctVerbs = stat.verbs?.length ?? 0;
  const coverage = Math.min(distinctVerbs, COVERAGE_TARGET) / COVERAGE_TARGET;

  const idle = daysSince(stat.lastAt);
  const freshness = 1 - (1 - DECAY_FLOOR) * Math.min(idle / DECAY_DAYS, 1);

  const isTentative = stat.asked < MIN_ANSWERS;
  const score = Math.round(accuracy * coverage * freshness * 100);

  return {
    score,
    accuracy: Math.round(accuracy * 100),
    coverage: Math.round(coverage * 100),
    freshness,
    distinctVerbs,
    daysSince: idle,
    isStale: idle > 14,
    isTentative,
  };
}

export function isMastered(stat: TenseStat | undefined): boolean {
  const fluency = fluencyOf(stat);
  if (!fluency || fluency.isTentative) return false;
  return fluency.score >= MASTERY_THRESHOLD;
}

/** Дописывает один ответ в статистику времени, удерживая размеры в пределах. */
export function recordAnswer(
  stat: TenseStat | undefined,
  verbId: string,
  correct: boolean,
  at: string,
): TenseStat {
  const base: TenseStat = stat ?? { asked: 0, correct: 0, lastAt: at, recent: [], verbs: [] };
  const recent = [...(base.recent ?? []), correct ? 1 : 0].slice(-RECENT_WINDOW);
  const verbs = base.verbs ?? [];
  const nextVerbs = verbs.includes(verbId) ? verbs : [...verbs, verbId].slice(-COVERAGE_MEMORY);

  return {
    asked: base.asked + 1,
    correct: base.correct + (correct ? 1 : 0),
    lastAt: at,
    recent,
    verbs: nextVerbs,
  };
}
