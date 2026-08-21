import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  QuizAnswer,
  QuizConfig,
  QuizHistoryItem,
  QuizQuestion,
  QuizSession,
} from '../data/types';
import { PERSONS } from '../data/types';
import { countAvailableQuestions, generateOptions, shuffle, VERBS } from '../data/verbs';
import { checkAnswer } from '../data/answer';
import {
  appendQuizHistory,
  clearActiveSession,
  loadActiveSession,
  loadQuizConfig,
  loadQuizHistory,
  saveActiveSession,
  saveQuizConfig,
} from '../utils/storage';

const DEFAULT_CONFIG: QuizConfig = {
  tenses: ['present'],
  persons: ['je', 'tu', 'il', 'nous', 'vous', 'ils'],
  verbIds: 'all',
  mode: 'multiple-choice',
  maxQuestions: 20,
  accentMode: 'warn',
};

const VALID_VERB_IDS = new Set(VERBS.map(verb => verb.id));

function sanitizeConfig(saved: QuizConfig): QuizConfig {
  const verbIds = saved.verbIds === 'all'
    ? 'all'
    : saved.verbIds.filter(id => VALID_VERB_IDS.has(id));

  return {
    ...DEFAULT_CONFIG,
    ...saved,
    verbIds: verbIds === 'all' || verbIds.length > 0 ? verbIds : 'all',
    maxQuestions: saved.maxQuestions ?? 20,
  };
}

function isValidSavedSession(session: QuizSession): boolean {
  return (
    session.questions.length > 0 &&
    session.answers.length < session.questions.length &&
    session.questions.every(question => VALID_VERB_IDS.has(question.verbId))
  );
}

interface QuizContextValue {
  config: QuizConfig;
  setConfig: (c: Partial<QuizConfig>) => void;
  session: QuizSession | null;
  history: QuizHistoryItem[];
  isHydrated: boolean;
  buildAndStartSession: (cfg: QuizConfig) => QuizQuestion[];
  setSession: (s: QuizSession) => void;
  submitAnswer: (answer: string) => void;
  advanceQuestion: () => void;
  retryErrors: () => QuizQuestion[];
  clearSession: () => void;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<QuizConfig>(DEFAULT_CONFIG);
  const [session, setSessionState] = useState<QuizSession | null>(null);
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    Promise.all([loadQuizConfig(), loadActiveSession(), loadQuizHistory()])
      .then(([savedConfig, savedSession, savedHistory]) => {
        if (savedConfig) setConfigState(sanitizeConfig(savedConfig));
        if (savedSession && isValidSavedSession(savedSession)) {
          setSessionState(savedSession);
        } else if (savedSession) {
          void clearActiveSession();
        }
        if (savedHistory) setHistory(savedHistory);
      })
      .finally(() => setIsHydrated(true));
  }, []);

  useEffect(() => {
    if (!isHydrated || !session) return;

    const isComplete = session.answers.length >= session.questions.length;
    if (!isComplete) {
      void saveActiveSession(session);
      return;
    }

    const correct = session.answers.filter(answer => answer.correct).length;
    const historyItem: QuizHistoryItem = {
      id: session.startedAt,
      completedAt: new Date().toISOString(),
      mode: session.mode,
      total: session.answers.length,
      correct,
      wrongAnswers: session.answers.filter(answer => !answer.correct),
    };

    setHistory(previous => {
      const next = [historyItem, ...previous.filter(item => item.id !== historyItem.id)].slice(0, 50);
      return next;
    });
    void appendQuizHistory(historyItem);
    void clearActiveSession();
  }, [isHydrated, session]);

  const setConfig = useCallback((partial: Partial<QuizConfig>) => {
    setConfigState(previous => {
      const next = sanitizeConfig({ ...previous, ...partial });
      void saveQuizConfig(next);
      return next;
    });
  }, []);

  const buildQuestions = useCallback((cfg: QuizConfig): QuizQuestion[] => {
    const targetVerbs =
      cfg.verbIds === 'all'
        ? VERBS
        : VERBS.filter(verb => cfg.verbIds.includes(verb.id));

    const combinations = targetVerbs.length * cfg.tenses.length * cfg.persons.length;
    const available = countAvailableQuestions(cfg.verbIds, cfg.tenses, cfg.persons);
    if (combinations === 0 || available === 0) return [];

    // Комбинаций много, поэтому берём случайную выборку нужного размера вместо
    // построения и перемешивания всей таблицы. target считается только по
    // существующим формам: отсутствующие лица императива его не раздувают.
    const target = Math.min(cfg.maxQuestions, available);
    const maxAttempts = target * 100 + 1000;
    const picked = new Set<number>();
    const questions: QuizQuestion[] = [];

    for (let attempt = 0; questions.length < target && attempt < maxAttempts; attempt += 1) {
      const pick = Math.floor(Math.random() * combinations);
      if (picked.has(pick)) continue;
      picked.add(pick);

      const personSlot = pick % cfg.persons.length;
      const remainder = Math.floor(pick / cfg.persons.length);
      const tense = cfg.tenses[remainder % cfg.tenses.length]!;
      const verb = targetVerbs[Math.floor(remainder / cfg.tenses.length)]!;
      const person = cfg.persons[personSlot]!;
      const personIndex = PERSONS.indexOf(person);

      const form = verb.conjugations[tense]?.[personIndex];
      if (!form || form.absent) continue;

      questions.push({
        verbId: verb.id,
        tense,
        person,
        correctAnswer: form.form,
        options:
          cfg.mode === 'multiple-choice'
            ? generateOptions(verb.id, tense, personIndex, form.form)
            : undefined,
      });
    }

    return shuffle(questions);
  }, []);

  const buildAndStartSession = useCallback(
    (cfg: QuizConfig): QuizQuestion[] => {
      const questions = buildQuestions(cfg);
      if (questions.length === 0) {
        setSessionState(null);
        void clearActiveSession();
        return [];
      }

      const newSession: QuizSession = {
        questions,
        currentIndex: 0,
        answers: [],
        mode: cfg.mode,
        accentMode: cfg.accentMode ?? 'warn',
        startedAt: new Date().toISOString(),
        exam: cfg.exam,
        drill: cfg.drill,
        lessonId: cfg.lessonId,
      };
      setSessionState(newSession);
      return questions;
    },
    [buildQuestions],
  );

  const setSession = useCallback((nextSession: QuizSession) => {
    setSessionState(nextSession);
  }, []);

  const fallbackAccentMode = config.accentMode ?? 'warn';

  const submitAnswer = useCallback((userAnswer: string) => {
    setSessionState(previous => {
      if (!previous) return previous;
      const question = previous.questions[previous.currentIndex];
      if (!question) return previous;

      const alreadyAnswered = previous.answers.length > previous.currentIndex;
      if (alreadyAnswered) return previous;

      const answer: QuizAnswer = {
        question,
        userAnswer,
        correct: checkAnswer(
          userAnswer,
          question.correctAnswer,
          previous.accentMode ?? fallbackAccentMode,
        ).correct,
      };

      return { ...previous, answers: [...previous.answers, answer] };
    });
  }, [fallbackAccentMode]);

  const advanceQuestion = useCallback(() => {
    setSessionState(previous => {
      if (!previous) return previous;
      return { ...previous, currentIndex: previous.currentIndex + 1 };
    });
  }, []);

  const retryErrors = useCallback((): QuizQuestion[] => {
    if (!session) return [];

    const wrongQuestions = session.answers
      .filter(answer => !answer.correct && VALID_VERB_IDS.has(answer.question.verbId))
      .map(answer => {
        const question = answer.question;
        const personIndex = PERSONS.indexOf(question.person);
        const options =
          session.mode === 'multiple-choice'
            ? generateOptions(question.verbId, question.tense, personIndex, question.correctAnswer)
            : undefined;
        return { ...question, options };
      });

    if (wrongQuestions.length === 0) return [];

    const retrySession: QuizSession = {
      questions: shuffle(wrongQuestions),
      currentIndex: 0,
      answers: [],
      mode: session.mode,
      accentMode: session.accentMode ?? fallbackAccentMode,
      startedAt: new Date().toISOString(),
      // Повтор ошибок не зачёт и не подход — медаль и открытие темы он не даёт,
      // но вернуться должен туда же, откуда пришли.
      lessonId: session.lessonId,
    };
    setSessionState(retrySession);
    return retrySession.questions;
  }, [session, fallbackAccentMode]);

  const clearSession = useCallback(() => {
    setSessionState(null);
    void clearActiveSession();
  }, []);

  const value = useMemo<QuizContextValue>(
    () => ({
      config,
      setConfig,
      session,
      history,
      isHydrated,
      buildAndStartSession,
      setSession,
      submitAnswer,
      advanceQuestion,
      retryErrors,
      clearSession,
    }),
    [
      config,
      session,
      history,
      isHydrated,
      setConfig,
      buildAndStartSession,
      setSession,
      submitAnswer,
      advanceQuestion,
      retryErrors,
      clearSession,
    ],
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz(): QuizContextValue {
  const context = useContext(QuizContext);
  if (!context) throw new Error('useQuiz must be used inside QuizProvider');
  return context;
}
