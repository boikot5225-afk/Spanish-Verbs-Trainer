export type Mood = 'indicatif' | 'subjonctif' | 'imperatif';

export type Tense =
  // Indicatif — простые
  | 'present'
  | 'imparfait'
  | 'passeSimple'
  | 'futurSimple'
  | 'conditionnel'
  // Indicatif — составные
  | 'passeCompose'
  | 'plusQueParfait'
  | 'passeAnterieur'
  | 'futurAnterieur'
  | 'conditionnelPasse'
  // Subjonctif — простые
  | 'subjPresent'
  | 'subjImparfait'
  // Subjonctif — составные
  | 'subjPasse'
  | 'subjPlusQueParfait'
  // Impératif
  | 'imperatifPresent'
  | 'imperatifPasse';

export type Person = 'je' | 'tu' | 'il' | 'nous' | 'vous' | 'ils';

export const TENSES: Tense[] = [
  'present',
  'imparfait',
  'passeSimple',
  'futurSimple',
  'conditionnel',
  'passeCompose',
  'plusQueParfait',
  'passeAnterieur',
  'futurAnterieur',
  'conditionnelPasse',
  'subjPresent',
  'subjImparfait',
  'subjPasse',
  'subjPlusQueParfait',
  'imperatifPresent',
  'imperatifPasse',
];

/** Времена живой речи — выбор по умолчанию в квизе. */
export const CORE_TENSES: Tense[] = [
  'present',
  'imparfait',
  'futurSimple',
  'conditionnel',
  'passeCompose',
  'subjPresent',
];

export const PERSONS: Person[] = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];

export const TENSE_LABELS: Record<Tense, string> = {
  present: 'Présent',
  imparfait: 'Imparfait',
  passeSimple: 'Passé simple',
  futurSimple: 'Futur simple',
  conditionnel: 'Conditionnel',
  passeCompose: 'Passé composé',
  plusQueParfait: 'Plus-que-parfait',
  passeAnterieur: 'Passé antérieur',
  futurAnterieur: 'Futur antérieur',
  conditionnelPasse: 'Conditionnel passé',
  subjPresent: 'Présent',
  subjImparfait: 'Imparfait',
  subjPasse: 'Passé',
  subjPlusQueParfait: 'Plus-que-parfait',
  imperatifPresent: 'Présent',
  imperatifPasse: 'Passé',
};

export const TENSE_FULL_LABELS: Record<Tense, string> = {
  present: 'Настоящее (Présent)',
  imparfait: 'Прош. длит. (Imparfait)',
  passeSimple: 'Прош. книжн. (Passé simple)',
  futurSimple: 'Будущее (Futur simple)',
  conditionnel: 'Условное (Conditionnel présent)',
  passeCompose: 'Прош. разг. (Passé composé)',
  plusQueParfait: 'Предпрош. (Plus-que-parfait)',
  passeAnterieur: 'Предпрош. книжн. (Passé antérieur)',
  futurAnterieur: 'Предбудущее (Futur antérieur)',
  conditionnelPasse: 'Условное прош. (Conditionnel passé)',
  subjPresent: 'Сослаг. наст. (Subjonctif présent)',
  subjImparfait: 'Сослаг. прош. книжн. (Subjonctif imparfait)',
  subjPasse: 'Сослаг. прош. (Subjonctif passé)',
  subjPlusQueParfait: 'Сослаг. предпрош. (Subjonctif plus-que-parfait)',
  imperatifPresent: 'Повелительное (Impératif présent)',
  imperatifPasse: 'Повелительное прош. (Impératif passé)',
};

export const TENSE_MOODS: Record<Tense, Mood> = {
  present: 'indicatif',
  imparfait: 'indicatif',
  passeSimple: 'indicatif',
  futurSimple: 'indicatif',
  conditionnel: 'indicatif',
  passeCompose: 'indicatif',
  plusQueParfait: 'indicatif',
  passeAnterieur: 'indicatif',
  futurAnterieur: 'indicatif',
  conditionnelPasse: 'indicatif',
  subjPresent: 'subjonctif',
  subjImparfait: 'subjonctif',
  subjPasse: 'subjonctif',
  subjPlusQueParfait: 'subjonctif',
  imperatifPresent: 'imperatif',
  imperatifPasse: 'imperatif',
};

export const MOODS: Mood[] = ['indicatif', 'subjonctif', 'imperatif'];

export const MOOD_LABELS: Record<Mood, string> = {
  indicatif: 'Indicatif · Изъявительное',
  subjonctif: 'Subjonctif · Сослагательное',
  imperatif: 'Impératif · Повелительное',
};

/** Составные времена: avoir/être + participe passé. */
export type CompoundTense = Extract<
  Tense,
  | 'passeCompose'
  | 'plusQueParfait'
  | 'passeAnterieur'
  | 'futurAnterieur'
  | 'conditionnelPasse'
  | 'subjPasse'
  | 'subjPlusQueParfait'
  | 'imperatifPasse'
>;

export const COMPOUND_TENSES: ReadonlySet<Tense> = new Set<Tense>([
  'passeCompose',
  'plusQueParfait',
  'passeAnterieur',
  'futurAnterieur',
  'conditionnelPasse',
  'subjPasse',
  'subjPlusQueParfait',
  'imperatifPasse',
]);

export const IMPERATIVE_TENSES: ReadonlySet<Tense> = new Set<Tense>([
  'imperatifPresent',
  'imperatifPasse',
]);

/** Какое простое время вспомогательного глагола берёт каждое составное. */
export const COMPOUND_AUX_TENSE: Record<CompoundTense, Tense> = {
  passeCompose: 'present',
  plusQueParfait: 'imparfait',
  passeAnterieur: 'passeSimple',
  futurAnterieur: 'futurSimple',
  conditionnelPasse: 'conditionnel',
  subjPasse: 'subjPresent',
  subjPlusQueParfait: 'subjImparfait',
  imperatifPasse: 'imperatifPresent',
};

export function tensesByMood(mood: Mood): Tense[] {
  return TENSES.filter(tense => TENSE_MOODS[tense] === mood);
}

export const PERSON_LABELS: Record<Person, string> = {
  je: 'je',
  tu: 'tu',
  il: 'il/elle',
  nous: 'nous',
  vous: 'vous',
  ils: 'ils/elles',
};

/** В императиве есть только tu, nous и vous — остальные лица отсутствуют. */
export const IMPERATIVE_PERSON_LABELS: Record<Person, string> = {
  je: '—',
  tu: 'tu',
  il: '—',
  nous: 'nous',
  vous: 'vous',
  ils: '—',
};

/** Лица, у которых есть форма императива. */
export const IMPERATIVE_PERSONS: ReadonlySet<Person> = new Set<Person>(['tu', 'nous', 'vous']);

const MOOD_PREFIX: Record<Mood, string> = {
  indicatif: '',
  subjonctif: 'Subj. ',
  imperatif: 'Impér. ',
};

/** Короткая подпись, однозначная вне группировки по наклонениям (списки, разбор ошибок). */
export function tenseQualifiedLabel(tense: Tense): string {
  const prefix = MOOD_PREFIX[TENSE_MOODS[tense]];
  return prefix ? prefix + TENSE_LABELS[tense].toLowerCase() : TENSE_LABELS[tense];
}

export function personLabels(tense: Tense): Record<Person, string> {
  return IMPERATIVE_TENSES.has(tense) ? IMPERATIVE_PERSON_LABELS : PERSON_LABELS;
}

/**
 * Местоимение с элизией перед гласной: j'ai, j'habite — но je sais.
 *
 * Придыхательное h (je hais) от немого (j'habite) по написанию не отличается;
 * среди частотных глаголов немое встречается практически всегда, поэтому h
 * считается немым.
 */
export function displayPronoun(person: Person, tense: Tense, form: string): string {
  const label = personLabels(tense)[person];
  if (person !== 'je' || IMPERATIVE_TENSES.has(tense)) return label;
  return /^[aeiouyàâéèêëîïôûùüh]/iu.test(form) ? "j'" : label;
}

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/** Ориентировочный уровень, на котором время обычно вводится в курсе французского. */
export const TENSE_LEVELS: Record<Tense, Level> = {
  present: 'A1',
  imperatifPresent: 'A1',
  passeCompose: 'A1',
  imparfait: 'A2',
  futurSimple: 'A2',
  conditionnel: 'B1',
  plusQueParfait: 'B1',
  subjPresent: 'B1',
  futurAnterieur: 'B2',
  conditionnelPasse: 'B2',
  subjPasse: 'B2',
  passeSimple: 'B2',
  passeAnterieur: 'C1',
  subjImparfait: 'C1',
  imperatifPasse: 'C2',
  subjPlusQueParfait: 'C2',
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
  /** Формы для этого лица не существует (например, «je» в императиве). */
  absent?: boolean;
}

/** Вспомогательный глагол составных времён. */
export type Auxiliary = 'avoir' | 'etre';

/**
 * Группа спряжения. Первая — на -er, вторая — на -ir с расширением -iss-,
 * третья — все остальные (-re, -oir и -ir без -iss-).
 */
export type VerbGroup = '1' | '2' | '3';

export interface Verb {
  id: string;
  infinitive: string;
  translation: string;
  group: VerbGroup;
  /** Вспомогательный глагол; «etre» тянет за собой согласование причастия. */
  aux: Auxiliary;
  /** Местоименный глагол (se laver): всегда être и всегда согласование. */
  pronominal?: boolean;
  /** Признаки неправильности из метаданных («-cer», «e→è», «prendre»…). Уроки подбирают по ним примеры. */
  types: string[];
  conjugations: Record<Tense, ConjugationForm[]>; // index = PERSONS order
  participePresent: ConjugationForm;
  participePasse: ConjugationForm;
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

export interface QuizQuestion {
  verbId: string;
  tense: Tense;
  person: Person;
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
