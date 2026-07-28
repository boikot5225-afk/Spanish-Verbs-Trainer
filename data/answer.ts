/**
 * Проверка введённого ответа: строгость к ударениям и распознавание опечаток.
 *
 * Ударение в испанском смыслоразличительно — hablo и habló это разные формы, —
 * но на телефонной клавиатуре набирать диакритику неудобно. Поэтому режим
 * выбирает сам пользователь.
 */

export type AccentMode = 'strict' | 'warn' | 'ignore';

export const ACCENT_MODES: AccentMode[] = ['strict', 'warn', 'ignore'];

export const ACCENT_MODE_LABELS: Record<AccentMode, string> = {
  strict: 'Строго',
  warn: 'С замечанием',
  ignore: 'Не важны',
};

export const ACCENT_MODE_HINTS: Record<AccentMode, string> = {
  strict: 'Ответ без нужного ударения считается ошибкой',
  warn: 'Ответ засчитывается, но приложение обратит внимание на ударение',
  ignore: 'Ударения при проверке не учитываются совсем',
};

/** Приводит к нижнему регистру и схлопывает пробелы, диакритику сохраняет. */
export function normalizeShape(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/gu, ' ');
}

/** То же, но со снятой диакритикой: «habló» → «hablo», «gruñir» → «grunir». */
export function stripAccents(value: string): string {
  return normalizeShape(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '');
}

/** Расстояние Левенштейна, но считаем только до предела — дальше не интересно. */
export function editDistance(left: string, right: string, limit = 2): number {
  if (Math.abs(left.length - right.length) > limit) return limit + 1;

  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    const current = [i];
    let rowBest = i;
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      const value = Math.min(
        previous[j]! + 1,
        current[j - 1]! + 1,
        previous[j - 1]! + cost,
      );
      current.push(value);
      if (value < rowBest) rowBest = value;
    }
    if (rowBest > limit) return limit + 1;
    previous = current;
  }
  return previous[right.length]!;
}

export interface AnswerVerdict {
  /** Засчитан ли ответ как верный. */
  correct: boolean;
  /** Верно по буквам, но диакритика не совпала. */
  accentMismatch: boolean;
  /**
   * Ответ неверен, но отличается на один символ — похоже на промах по клавише.
   * Такой ответ стоит предложить исправить, а не засчитывать ошибку сразу.
   */
  looksLikeTypo: boolean;
}

export function checkAnswer(
  input: string,
  expected: string,
  mode: AccentMode,
): AnswerVerdict {
  const exactMatch = normalizeShape(input) === normalizeShape(expected);
  const plainInput = stripAccents(input);
  const plainExpected = stripAccents(expected);
  const plainMatch = plainInput === plainExpected;

  // Буквы совпали, а диакритика — нет.
  const accentMismatch = plainMatch && !exactMatch;

  if (exactMatch) return { correct: true, accentMismatch: false, looksLikeTypo: false };

  if (accentMismatch) {
    return {
      correct: mode !== 'strict',
      accentMismatch: mode !== 'ignore',
      looksLikeTypo: false,
    };
  }

  // Ни с ударениями, ни без них не совпало — но, возможно, это опечатка.
  const distance = editDistance(plainInput, plainExpected);
  return {
    correct: false,
    accentMismatch: false,
    looksLikeTypo: plainInput.length > 0 && distance === 1,
  };
}
