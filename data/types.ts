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

export interface QuizConfig {
  tenses: Tense[];
  persons: Person[];
  verbIds: string[] | 'all';
  mode: QuizMode;
  maxQuestions: 10 | 20 | 30 | 50;
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
}

export interface QuizHistoryItem {
  id: string;
  completedAt: string;
  mode: QuizMode;
  total: number;
  correct: number;
  wrongAnswers: QuizAnswer[];
}
