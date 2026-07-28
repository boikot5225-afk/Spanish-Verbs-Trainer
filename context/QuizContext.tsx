import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  QuizAnswer,
  QuizConfig,
  QuizHistoryItem,
  QuizQuestion,
  QuizSession,
} from '../data/types';
import { PERSONS, TENSES } from '../data/types';
import { generateOptions, normalizeAnswer, shuffle, VERBS } from '../data/verbs';
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
  tenses: ['presente'],
  persons: ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos'],
  verbIds: 'all',
  mode: 'multiple-choice',
  maxQuestions: 20,
};

interface QuizContextValue {
  config: QuizConfig;
  setConfig: (c: Partial<QuizConfig>) => void;
  session: QuizSession | null;
  history: QuizHistoryItem[];
  isHydrated: boolean;
  buildAndStartSession: (cfg: QuizConfig, courseLessonId?: string) => QuizQuestion[];
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
        if (savedConfig) {
          setConfigState({
            ...DEFAULT_CONFIG,
            ...savedConfig,
            maxQuestions: savedConfig.maxQuestions ?? 20,
            tenses: savedConfig.tenses?.filter(tense => TENSES.includes(tense))?.length
              ? savedConfig.tenses.filter(tense => TENSES.includes(tense))
              : DEFAULT_CONFIG.tenses,
          });
        }
        if (
          savedSession &&
          savedSession.questions.length > 0 &&
          savedSession.answers.length < savedSession.questions.length
        ) {
          setSessionState(savedSession);
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
      const next = { ...previous, ...partial };
      void saveQuizConfig(next);
      return next;
    });
  }, []);

  const buildQuestions = useCallback((cfg: QuizConfig): QuizQuestion[] => {
    const targetVerbs =
      cfg.verbIds === 'all'
        ? VERBS
        : VERBS.filter(verb => cfg.verbIds.includes(verb.id));

    const questions: QuizQuestion[] = [];

    for (const verb of targetVerbs) {
      for (const tense of cfg.tenses) {
        for (const person of cfg.persons) {
          const personIndex = PERSONS.indexOf(person);
          const form = verb.conjugations[tense]?.[personIndex];
          if (!form || form.available === false || form.form === '—') continue;

          const options =
            cfg.mode === 'multiple-choice'
              ? generateOptions(verb.id, tense, personIndex, form.form)
              : undefined;

          questions.push({
            verbId: verb.id,
            tense,
            person,
            correctAnswer: form.form,
            acceptedAnswers: form.aliases,
            options,
          });
        }
      }
    }

    return shuffle(questions).slice(0, cfg.maxQuestions);
  }, []);

  const buildAndStartSession = useCallback(
    (cfg: QuizConfig, courseLessonId?: string): QuizQuestion[] => {
      const questions = buildQuestions(cfg);
      const newSession: QuizSession = {
        questions,
        currentIndex: 0,
        answers: [],
        mode: cfg.mode,
        startedAt: new Date().toISOString(),
        courseLessonId,
      };
      setSessionState(newSession);
      return questions;
    },
    [buildQuestions],
  );

  const setSession = useCallback((nextSession: QuizSession) => {
    setSessionState(nextSession);
  }, []);

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
        correct: [question.correctAnswer, ...(question.acceptedAnswers ?? [])]
          .some(answer => normalizeAnswer(userAnswer) === normalizeAnswer(answer)),
      };

      return { ...previous, answers: [...previous.answers, answer] };
    });
  }, []);

  const advanceQuestion = useCallback(() => {
    setSessionState(previous => {
      if (!previous) return previous;
      return { ...previous, currentIndex: previous.currentIndex + 1 };
    });
  }, []);

  const retryErrors = useCallback((): QuizQuestion[] => {
    if (!session) return [];

    const wrongQuestions = session.answers
      .filter(answer => !answer.correct)
      .map(answer => {
        const question = answer.question;
        const personIndex = PERSONS.indexOf(question.person);
        const options =
          session.mode === 'multiple-choice'
            ? generateOptions(question.verbId, question.tense, personIndex, question.correctAnswer)
            : undefined;
        return { ...question, options };
      });

    const retrySession: QuizSession = {
      questions: shuffle(wrongQuestions),
      currentIndex: 0,
      answers: [],
      mode: session.mode,
      startedAt: new Date().toISOString(),
      courseLessonId: session.courseLessonId,
    };
    setSessionState(retrySession);
    return retrySession.questions;
  }, [session]);

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
