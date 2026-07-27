export type Tense =
  | 'presente'
  | 'preteriteIndef'
  | 'preteriteImp'
  | 'futuro'
  | 'condicional'
  | 'subjuntivo';

export type Person = 'yo' | 'tu' | 'el' | 'nosotros' | 'vosotros' | 'ellos';

export const TENSES: Tense[] = [
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
  subjuntivo: 'Subjuntivo',
};

export const TENSE_FULL_LABELS: Record<Tense, string> = {
  presente: 'Настоящее (Presente)',
  preteriteIndef: 'Прош. (Indefinido)',
  preteriteImp: 'Прош. (Imperfecto)',
  futuro: 'Будущее (Futuro)',
  condicional: 'Условное (Condicional)',
  subjuntivo: 'Сослагательное (Subjuntivo)',
};

export const PERSON_LABELS: Record<Person, string> = {
  yo: 'yo',
  tu: 'tú',
  el: 'él/ella',
  nosotros: 'nosotros',
  vosotros: 'vosotros',
  ellos: 'ellos/ellas',
};

export interface ConjugationForm {
  form: string;
  irregular: boolean;
}

export interface Verb {
  id: string;
  infinitive: string;
  translation: string;
  group: 'ar' | 'er' | 'ir' | 'irregular';
  conjugations: Record<Tense, ConjugationForm[]>; // index = PERSONS order
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
