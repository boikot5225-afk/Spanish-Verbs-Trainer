export type Mood = 'indicativo' | 'subjuntivo' | 'imperativo';

export type Tense =
  // Indicativo — простые
  | 'presente'
  | 'preteriteIndef'
  | 'preteriteImp'
  | 'futuro'
  | 'condicional'
  // Indicativo — составные
  | 'perfecto'
  | 'pluscuamperfecto'
  | 'anterior'
  | 'futuroPerfecto'
  | 'condicionalPerfecto'
  // Subjuntivo — простые
  | 'subjuntivo'
  | 'subjImperfectoRa'
  | 'subjImperfectoSe'
  | 'subjFuturo'
  // Subjuntivo — составные
  | 'subjPerfecto'
  | 'subjPluscuamRa'
  | 'subjPluscuamSe'
  | 'subjFuturoPerfecto'
  // Imperativo
  | 'imperativoAfirmativo'
  | 'imperativoNegativo';

export type Person = 'yo' | 'tu' | 'el' | 'nosotros' | 'vosotros' | 'ellos';

export const TENSES: Tense[] = [
  'presente',
  'preteriteIndef',
  'preteriteImp',
  'futuro',
  'condicional',
  'perfecto',
  'pluscuamperfecto',
  'anterior',
  'futuroPerfecto',
  'condicionalPerfecto',
  'subjuntivo',
  'subjImperfectoRa',
  'subjImperfectoSe',
  'subjFuturo',
  'subjPerfecto',
  'subjPluscuamRa',
  'subjPluscuamSe',
  'subjFuturoPerfecto',
  'imperativoAfirmativo',
  'imperativoNegativo',
];

/** Времена, которые были в приложении до расширения — выбор по умолчанию в квизе. */
export const CORE_TENSES: Tense[] = [
  'presente',
  'preteriteIndef',
  'preteriteImp',
  'futuro',
  'condicional',
  'subjuntivo',
];

export const PERSONS: Person[] = [
  'yo',
  'tu',
  'el',
  'nosotros',
  'vosotros',
  'ellos',
];

export const TENSE_LABELS: Record<Tense, string> = {
  presente: 'Presente',
  preteriteIndef: 'Indefinido',
  preteriteImp: 'Imperfecto',
  futuro: 'Futuro',
  condicional: 'Condicional',
  perfecto: 'P. perfecto',
  pluscuamperfecto: 'Pluscuamperfecto',
  anterior: 'P. anterior',
  futuroPerfecto: 'Futuro perfecto',
  condicionalPerfecto: 'Cond. perfecto',
  subjuntivo: 'Presente',
  subjImperfectoRa: 'Imperfecto -ra',
  subjImperfectoSe: 'Imperfecto -se',
  subjFuturo: 'Futuro',
  subjPerfecto: 'P. perfecto',
  subjPluscuamRa: 'Pluscuam. -ra',
  subjPluscuamSe: 'Pluscuam. -se',
  subjFuturoPerfecto: 'Futuro perfecto',
  imperativoAfirmativo: 'Afirmativo',
  imperativoNegativo: 'Negativo',
};

export const TENSE_FULL_LABELS: Record<Tense, string> = {
  presente: 'Настоящее (Presente)',
  preteriteIndef: 'Прош. законч. (Indefinido)',
  preteriteImp: 'Прош. длит. (Imperfecto)',
  futuro: 'Будущее (Futuro simple)',
  condicional: 'Условное (Condicional simple)',
  perfecto: 'Прош. связ. с наст. (Pretérito perfecto)',
  pluscuamperfecto: 'Предпрош. (Pluscuamperfecto)',
  anterior: 'Предпрош. книжн. (Pretérito anterior)',
  futuroPerfecto: 'Предбудущее (Futuro perfecto)',
  condicionalPerfecto: 'Условное прош. (Condicional perfecto)',
  subjuntivo: 'Сослаг. наст. (Presente de subjuntivo)',
  subjImperfectoRa: 'Сослаг. прош. на -ra',
  subjImperfectoSe: 'Сослаг. прош. на -se',
  subjFuturo: 'Сослаг. будущее (книжное)',
  subjPerfecto: 'Сослаг. прош. (Pretérito perfecto)',
  subjPluscuamRa: 'Сослаг. предпрош. на -ra',
  subjPluscuamSe: 'Сослаг. предпрош. на -se',
  subjFuturoPerfecto: 'Сослаг. предбудущее (книжное)',
  imperativoAfirmativo: 'Повелительное утвердительное',
  imperativoNegativo: 'Повелительное отрицательное',
};

export const TENSE_MOODS: Record<Tense, Mood> = {
  presente: 'indicativo',
  preteriteIndef: 'indicativo',
  preteriteImp: 'indicativo',
  futuro: 'indicativo',
  condicional: 'indicativo',
  perfecto: 'indicativo',
  pluscuamperfecto: 'indicativo',
  anterior: 'indicativo',
  futuroPerfecto: 'indicativo',
  condicionalPerfecto: 'indicativo',
  subjuntivo: 'subjuntivo',
  subjImperfectoRa: 'subjuntivo',
  subjImperfectoSe: 'subjuntivo',
  subjFuturo: 'subjuntivo',
  subjPerfecto: 'subjuntivo',
  subjPluscuamRa: 'subjuntivo',
  subjPluscuamSe: 'subjuntivo',
  subjFuturoPerfecto: 'subjuntivo',
  imperativoAfirmativo: 'imperativo',
  imperativoNegativo: 'imperativo',
};

export const MOODS: Mood[] = ['indicativo', 'subjuntivo', 'imperativo'];

export const MOOD_LABELS: Record<Mood, string> = {
  indicativo: 'Indicativo · Изъявительное',
  subjuntivo: 'Subjuntivo · Сослагательное',
  imperativo: 'Imperativo · Повелительное',
};

/** Составные времена: haber + причастие. */
export type CompoundTense = Extract<
  Tense,
  | 'perfecto'
  | 'pluscuamperfecto'
  | 'anterior'
  | 'futuroPerfecto'
  | 'condicionalPerfecto'
  | 'subjPerfecto'
  | 'subjPluscuamRa'
  | 'subjPluscuamSe'
  | 'subjFuturoPerfecto'
>;

export const COMPOUND_TENSES: ReadonlySet<Tense> = new Set<Tense>([
  'perfecto',
  'pluscuamperfecto',
  'anterior',
  'futuroPerfecto',
  'condicionalPerfecto',
  'subjPerfecto',
  'subjPluscuamRa',
  'subjPluscuamSe',
  'subjFuturoPerfecto',
]);

export const IMPERATIVE_TENSES: ReadonlySet<Tense> = new Set<Tense>([
  'imperativoAfirmativo',
  'imperativoNegativo',
]);

export function tensesByMood(mood: Mood): Tense[] {
  return TENSES.filter(tense => TENSE_MOODS[tense] === mood);
}

export const PERSON_LABELS: Record<Person, string> = {
  yo: 'yo',
  tu: 'tú',
  el: 'él/ella',
  nosotros: 'nosotros',
  vosotros: 'vosotros',
  ellos: 'ellos/ellas',
};

/** В императиве 3-е лицо — это вежливые формы usted/ustedes, а «yo» отсутствует. */
export const IMPERATIVE_PERSON_LABELS: Record<Person, string> = {
  yo: '—',
  tu: 'tú',
  el: 'usted',
  nosotros: 'nosotros',
  vosotros: 'vosotros',
  ellos: 'ustedes',
};

const MOOD_PREFIX: Record<Mood, string> = {
  indicativo: '',
  subjuntivo: 'Subj. ',
  imperativo: 'Imper. ',
};

/** Короткая подпись, однозначная вне группировки по наклонениям (списки, разбор ошибок). */
export function tenseQualifiedLabel(tense: Tense): string {
  const prefix = MOOD_PREFIX[TENSE_MOODS[tense]];
  return prefix ? prefix + TENSE_LABELS[tense].toLowerCase() : TENSE_LABELS[tense];
}

export function personLabels(tense: Tense): Record<Person, string> {
  return IMPERATIVE_TENSES.has(tense) ? IMPERATIVE_PERSON_LABELS : PERSON_LABELS;
}

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/** Ориентир порядка введения формы, а не оценка общего уровня владения языком. */
export const TENSE_LEVELS: Record<Tense, Level> = {
  presente: 'A1',
  imperativoAfirmativo: 'A1',
  preteriteIndef: 'A2',
  preteriteImp: 'A2',
  futuro: 'A2',
  perfecto: 'A2',
  imperativoNegativo: 'A2',
  condicional: 'B1',
  pluscuamperfecto: 'B1',
  subjuntivo: 'B1',
  futuroPerfecto: 'B1',
  subjImperfectoRa: 'B2',
  subjImperfectoSe: 'B2',
  condicionalPerfecto: 'B2',
  subjPerfecto: 'B2',
  subjPluscuamRa: 'C1',
  subjPluscuamSe: 'C1',
  anterior: 'C1',
  subjFuturo: 'C2',
  subjFuturoPerfecto: 'C2',
};

export function tensesByLevel(level: Level): Tense[] {
  return TENSES.filter(tense => TENSE_LEVELS[tense] === level);
}

/** Накопленная статистика по одному времени. */
export interface TenseStat {
  asked: number;
  correct: number;
  /** ISO-дата последней тренировки этого времени. */
  lastAt: string;
  /** Последние ответы (1 — верно, 0 — нет). Ограничены RECENT_WINDOW. */
  recent: number[];
  /** Разные глаголы, встреченные в этом времени. Ограничены COVERAGE_MEMORY. */
  verbs: string[];
}

export type TenseStats = Partial<Record<Tense, TenseStat>>;

export interface ConjugationForm {
  form: string;
  irregular: boolean;
  /** Формы для этого лица не существует (например, «yo» в императиве). */
  absent?: boolean;
}

export interface Verb {
  id: string;
  infinitive: string;
  translation: string;
  group: 'ar' | 'er' | 'ir' | 'irregular';
  /** Признаки неправильности из метаданных («o to ue», «add g», …). Уроки подбирают по ним примеры. */
  types: string[];
  conjugations: Record<Tense, ConjugationForm[]>; // index = PERSONS order
  gerundio: ConjugationForm;
  participio: ConjugationForm;
  irregularNote?: string;
}

export type QuizMode = 'input' | 'multiple-choice' | 'flashcard';

/** Отметка, что сессия — зачёт по теме, а не свободная тренировка. */
export interface QuizExam {
  lessonId: string;
  maxMistakes: number;
}

/** Пометка мини-тренировки внутри темы — по ней начисляется медаль. */
export interface QuizDrill {
  lessonId: string;
  key: string;
}

export interface QuizConfig {
  /** Строгость к диакритике при проверке ввода. */
  accentMode?: import('./answer').AccentMode;
  tenses: Tense[];
  /** Неличные формы темы — спрашиваются без лица. */
  forms?: NonFinite[];
  persons: Person[];
  verbIds: string[] | 'all';
  mode: QuizMode;
  /** Обычно 10/20/30/50, но зачёт может быть короче, если у темы мало форм. */
  maxQuestions: number;
  exam?: QuizExam;
  drill?: QuizDrill;
  /** Из какого урока запущено — нужно, чтобы вернуться туда после теста. */
  lessonId?: string;
}

/**
 * Неличные формы. Лица у них нет, поэтому в вопросе они занимают место времени,
 * а не дополняют его: спросить «герундий, tú» бессмысленно.
 */
export type NonFinite = 'gerundio' | 'participio';

export const NON_FINITE_FORMS: NonFinite[] = ['gerundio', 'participio'];

export const NON_FINITE_LABELS: Record<NonFinite, string> = {
  gerundio: 'Герундий (Gerundio)',
  participio: 'Причастие (Participio)',
};

export const NON_FINITE_SHORT_LABELS: Record<NonFinite, string> = {
  gerundio: 'Герундий',
  participio: 'Причастие',
};

export const NON_FINITE_PROMPTS: Record<NonFinite, string> = {
  gerundio: 'Напишите герундий:',
  participio: 'Напишите причастие:',
};

export interface QuizQuestion {
  verbId: string;
  /** У неличной формы времени нет. */
  tense?: Tense;
  /** У неличной формы лица нет. */
  person?: Person;
  /** Задан вместо пары «время + лицо». */
  nonFinite?: NonFinite;
  correctAnswer: string;
  options?: string[];
}

export interface QuizAnswer {
  question: QuizQuestion;
  userAnswer: string;
  correct: boolean;
}

export interface QuizSession {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: QuizAnswer[];
  mode: QuizMode;
  startedAt: string;
  exam?: QuizExam;
  drill?: QuizDrill;
  lessonId?: string;
}

export interface QuizHistoryItem {
  id: string;
  completedAt: string;
  mode: QuizMode;
  total: number;
  correct: number;
  wrongAnswers: QuizAnswer[];
}

/**
 * Подпись к вопросу. Неличная форма занимает место времени и лица не имеет,
 * поэтому разбирать вопрос по полям на каждом экране отдельно нельзя — иначе
 * «герундий, tú» рано или поздно где-нибудь да напечатается.
 */
export function questionLabels(question: QuizQuestion): { form: string; person?: string } {
  if (question.nonFinite) return { form: NON_FINITE_LABELS[question.nonFinite] };
  return {
    form: TENSE_FULL_LABELS[question.tense!],
    person: personLabels(question.tense!)[question.person!],
  };
}

/** Что просят ввести: у неличной формы своя формулировка. */
export function questionPrompt(question: QuizQuestion): string {
  return question.nonFinite ? NON_FINITE_PROMPTS[question.nonFinite] : 'Напишите форму глагола:';
}

/** Короткая подпись для разбора ошибок: «Indefinido · tú» или «Герундий». */
export function questionShortLabel(question: QuizQuestion): string {
  if (question.nonFinite) return NON_FINITE_SHORT_LABELS[question.nonFinite];
  return `${tenseQualifiedLabel(question.tense!)} · ${personLabels(question.tense!)[question.person!]}`;
}
