export type Tense =
  | 'presente'
  | 'presenteContinuo'
  | 'preteritePerfecto'
  | 'futuroProximo'
  | 'preteriteIndef'
  | 'preteriteImp'
  | 'pluscuamperfecto'
  | 'futuro'
  | 'futuroPerfecto'
  | 'condicional'
  | 'condicionalPerfecto'
  | 'subjuntivo'
  | 'subjuntivoImperfecto'
  | 'subjuntivoPerfecto'
  | 'subjuntivoPluscuamperfecto'
  | 'imperativoAfirmativo'
  | 'imperativoNegativo';

export type TenseMood = 'indicativo' | 'subjuntivo' | 'imperativo';
export type Person = 'yo' | 'tu' | 'el' | 'nosotros' | 'vosotros' | 'ellos';

export interface TenseDefinition {
  id: Tense;
  mood: TenseMood;
  label: string;
  fullLabel: string;
  description: string;
}

export const TENSE_DEFINITIONS: TenseDefinition[] = [
  {
    id: 'presente',
    mood: 'indicativo',
    label: 'Presente',
    fullLabel: 'Настоящее · Presente',
    description: 'hablo — говорю',
  },
  {
    id: 'presenteContinuo',
    mood: 'indicativo',
    label: 'Presente continuo',
    fullLabel: 'Настоящее длительное · Presente continuo',
    description: 'estoy hablando — сейчас говорю',
  },
  {
    id: 'preteritePerfecto',
    mood: 'indicativo',
    label: 'Pretérito perfecto',
    fullLabel: 'Прошедшее совершённое · Pretérito perfecto',
    description: 'he hablado — уже поговорил',
  },
  {
    id: 'futuroProximo',
    mood: 'indicativo',
    label: 'Futuro próximo',
    fullLabel: 'Ближайшее будущее · Futuro próximo',
    description: 'voy a hablar — собираюсь говорить',
  },
  {
    id: 'preteriteIndef',
    mood: 'indicativo',
    label: 'Indefinido',
    fullLabel: 'Прошедшее завершённое · Pretérito indefinido',
    description: 'hablé — поговорил',
  },
  {
    id: 'preteriteImp',
    mood: 'indicativo',
    label: 'Imperfecto',
    fullLabel: 'Прошедшее незавершённое · Pretérito imperfecto',
    description: 'hablaba — говорил / обычно говорил',
  },
  {
    id: 'pluscuamperfecto',
    mood: 'indicativo',
    label: 'Pluscuamperfecto',
    fullLabel: 'Предпрошедшее · Pluscuamperfecto',
    description: 'había hablado — уже поговорил к тому моменту',
  },
  {
    id: 'futuro',
    mood: 'indicativo',
    label: 'Futuro simple',
    fullLabel: 'Будущее · Futuro simple',
    description: 'hablaré — буду говорить',
  },
  {
    id: 'futuroPerfecto',
    mood: 'indicativo',
    label: 'Futuro perfecto',
    fullLabel: 'Будущее совершённое · Futuro perfecto',
    description: 'habré hablado — уже поговорю к моменту',
  },
  {
    id: 'condicional',
    mood: 'indicativo',
    label: 'Condicional simple',
    fullLabel: 'Условное · Condicional simple',
    description: 'hablaría — говорил бы',
  },
  {
    id: 'condicionalPerfecto',
    mood: 'indicativo',
    label: 'Condicional perfecto',
    fullLabel: 'Условное совершённое · Condicional perfecto',
    description: 'habría hablado — поговорил бы',
  },
  {
    id: 'subjuntivo',
    mood: 'subjuntivo',
    label: 'Presente',
    fullLabel: 'Настоящее сослагательное · Presente de subjuntivo',
    description: 'que hable — чтобы говорил',
  },
  {
    id: 'subjuntivoImperfecto',
    mood: 'subjuntivo',
    label: 'Imperfecto',
    fullLabel: 'Прошедшее сослагательное · Imperfecto de subjuntivo',
    description: 'que hablara / hablase — чтобы говорил',
  },
  {
    id: 'subjuntivoPerfecto',
    mood: 'subjuntivo',
    label: 'Pretérito perfecto',
    fullLabel: 'Совершённое сослагательное · Pretérito perfecto de subjuntivo',
    description: 'que haya hablado — чтобы уже поговорил',
  },
  {
    id: 'subjuntivoPluscuamperfecto',
    mood: 'subjuntivo',
    label: 'Pluscuamperfecto',
    fullLabel: 'Предпрошедшее сослагательное · Pluscuamperfecto de subjuntivo',
    description: 'que hubiera / hubiese hablado',
  },
  {
    id: 'imperativoAfirmativo',
    mood: 'imperativo',
    label: 'Afirmativo',
    fullLabel: 'Утвердительное повелительное · Imperativo afirmativo',
    description: '¡habla! — говори!',
  },
  {
    id: 'imperativoNegativo',
    mood: 'imperativo',
    label: 'Negativo',
    fullLabel: 'Отрицательное повелительное · Imperativo negativo',
    description: '¡no hables! — не говори!',
  },
];

export const TENSES: Tense[] = TENSE_DEFINITIONS.map(item => item.id);

export const TENSE_GROUPS: Array<{ mood: TenseMood; label: string; tenses: Tense[] }> = [
  {
    mood: 'indicativo',
    label: 'Изъявительное наклонение',
    tenses: TENSE_DEFINITIONS.filter(item => item.mood === 'indicativo').map(item => item.id),
  },
  {
    mood: 'subjuntivo',
    label: 'Сослагательное наклонение',
    tenses: TENSE_DEFINITIONS.filter(item => item.mood === 'subjuntivo').map(item => item.id),
  },
  {
    mood: 'imperativo',
    label: 'Повелительное наклонение',
    tenses: TENSE_DEFINITIONS.filter(item => item.mood === 'imperativo').map(item => item.id),
  },
];

export const PERSONS: Person[] = ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos'];

export const TENSE_LABELS = Object.fromEntries(
  TENSE_DEFINITIONS.map(item => [item.id, item.label]),
) as Record<Tense, string>;

export const TENSE_FULL_LABELS = Object.fromEntries(
  TENSE_DEFINITIONS.map(item => [item.id, item.fullLabel]),
) as Record<Tense, string>;

export const TENSE_DESCRIPTIONS = Object.fromEntries(
  TENSE_DEFINITIONS.map(item => [item.id, item.description]),
) as Record<Tense, string>;

export const PERSON_LABELS: Record<Person, string> = {
  yo: 'yo',
  tu: 'tú',
  el: 'él/ella/usted',
  nosotros: 'nosotros/as',
  vosotros: 'vosotros/as',
  ellos: 'ellos/ellas/ustedes',
};

const IMPERATIVE_PERSON_LABELS: Record<Person, string> = {
  yo: '—',
  tu: 'tú',
  el: 'usted',
  nosotros: 'nosotros/as',
  vosotros: 'vosotros/as',
  ellos: 'ustedes',
};

export function isImperativeTense(tense: Tense): boolean {
  return tense === 'imperativoAfirmativo' || tense === 'imperativoNegativo';
}

export function isPersonAvailableForTense(tense: Tense, person: Person): boolean {
  return !(isImperativeTense(tense) && person === 'yo');
}

export function getPersonLabel(tense: Tense, person: Person): string {
  return isImperativeTense(tense) ? IMPERATIVE_PERSON_LABELS[person] : PERSON_LABELS[person];
}

export interface ConjugationForm {
  form: string;
  irregular: boolean;
  available?: boolean;
  aliases?: string[];
}

export interface Verb {
  id: string;
  infinitive: string;
  translation: string;
  group: 'ar' | 'er' | 'ir' | 'irregular';
  conjugations: Record<Tense, ConjugationForm[]>;
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
  acceptedAnswers?: string[];
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
