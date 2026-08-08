import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  QuizAnswer,
  QuizConfig,
  QuizHistoryItem,
  QuizQuestion,
  QuizSession,
} from '../data/types';
import { PERSONS } from '../data/types';
import {
  generateClozeOptions,
  generateNonFiniteOptions,
  generateOptions,
  generatePeriphrasisOptions,
  periphrasisForm,
  shuffle,
  VERBS,
} from '../data/verbs';
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
  tenses: ['presente'],
  persons: ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos'],
  verbIds: 'all',
  mode: 'multiple-choice',
  maxQuestions: 20,
  accentMode: 'warn',
};

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
        if (savedConfig) {
          setConfigState({
            ...DEFAULT_CONFIG,
            ...savedConfig,
            maxQuestions: savedConfig.maxQuestions ?? 20,
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

    // Неличные формы идут отдельной осью: лица у них нет, поэтому каждая даёт
    // по одной комбинации на глагол, а не по шесть.
    const forms = cfg.forms ?? [];
    const periphrasis = cfg.periphrasis;
    const periphrasisTenses = periphrasis?.tenses ?? [];
    const finite = targetVerbs.length * cfg.tenses.length * cfg.persons.length;
    const nonFinite = targetVerbs.length * forms.length;
    const periphrastic = targetVerbs.length * periphrasisTenses.length * cfg.persons.length;
    // Пропуски перечислены поимённо: каждый — ровно один вопрос. Подход по глаголу
    // берёт только свои предложения, иначе тренировка ser показывала бы estar.
    const clozeItems = (cfg.cloze ?? []).filter(
      item => cfg.verbIds === 'all' || cfg.verbIds.includes(item.verbId),
    );
    const combinations = finite + nonFinite + periphrastic + clozeItems.length;
    if (combinations === 0) return [];

    // Комбинаций может быть больше четверти миллиона, поэтому берём случайную
    // выборку нужного размера вместо построения и перемешивания всего списка.
    const target = Math.min(cfg.maxQuestions, combinations);
    const maxAttempts = target * 50 + 500;
    const picked = new Set<number>();
    const questions: QuizQuestion[] = [];

    for (let attempt = 0; questions.length < target && attempt < maxAttempts; attempt += 1) {
      const pick = Math.floor(Math.random() * combinations);
      if (picked.has(pick)) continue;
      picked.add(pick);

      if (pick >= finite + nonFinite + periphrastic) {
        const item = clozeItems[pick - finite - nonFinite - periphrastic]!;
        const tense = item.tense ?? 'presente';
        const personIndex = PERSONS.indexOf(item.person);
        const verb = VERBS.find(candidate => candidate.id === item.verbId);
        const conjugated = verb?.conjugations[tense]?.[personIndex];
        const answer = item.answer ?? (conjugated && !conjugated.absent ? conjugated.form : '');
        if (!answer) continue;

        // Соперник — второй глагол темы: именно между ними и надо выбрать.
        // Если у соперника форма безличная (hay), она одна на все лица, поэтому
        // берём её как есть, а не спрягаем по лицу этого предложения.
        const rival = (cfg.cloze ?? []).find(other => other.verbId !== item.verbId);
        const rivalForm = rival?.answer
          ? rival.answer
          : rival
          ? VERBS.find(candidate => candidate.id === rival.verbId)?.conjugations[tense]?.[
              personIndex
            ]?.form ?? ''
          : '';

        questions.push({
          verbId: item.verbId,
          tense,
          person: item.person,
          cloze: { text: item.text, translation: item.translation, reason: item.reason },
          correctAnswer: answer,
          options:
            cfg.mode === 'multiple-choice'
              ? generateClozeOptions(item.verbId, rivalForm, tense, personIndex, answer)
              : undefined,
        });
        continue;
      }

      if (pick >= finite + nonFinite) {
        const slot = pick - finite - nonFinite;
        const personSlot = slot % cfg.persons.length;
        const rest = Math.floor(slot / cfg.persons.length);
        const tense = periphrasisTenses[rest % periphrasisTenses.length]!;
        const verb = targetVerbs[Math.floor(rest / periphrasisTenses.length)]!;
        const person = cfg.persons[personSlot]!;
        const personIndex = PERSONS.indexOf(person);
        const value = periphrasisForm(periphrasis!, verb, tense, personIndex);
        if (!value) continue;

        questions.push({
          verbId: verb.id,
          tense,
          person,
          periphrasis: { auxiliary: periphrasis!.auxiliary, form: periphrasis!.form },
          correctAnswer: value,
          options:
            cfg.mode === 'multiple-choice'
              ? generatePeriphrasisOptions(periphrasis!, verb, tense, personIndex, value)
              : undefined,
        });
        continue;
      }

      if (pick >= finite) {
        const slot = pick - finite;
        const nonFiniteForm = forms[slot % forms.length]!;
        const verb = targetVerbs[Math.floor(slot / forms.length)]!;
        const value = verb[nonFiniteForm].form;
        if (!value) continue;

        questions.push({
          verbId: verb.id,
          nonFinite: nonFiniteForm,
          correctAnswer: value,
          options:
            cfg.mode === 'multiple-choice'
              ? generateNonFiniteOptions(verb.id, nonFiniteForm, value)
              : undefined,
        });
        continue;
      }

      const personSlot = pick % cfg.persons.length;
      const remainder = Math.floor(pick / cfg.persons.length);
      const tense = cfg.tenses[remainder % cfg.tenses.length]!;
      const verb = targetVerbs[Math.floor(remainder / cfg.tenses.length)]!;
      const person = cfg.persons[personSlot]!;
      const personIndex = PERSONS.indexOf(person);

      const form = verb.conjugations[tense]?.[personIndex];
      if (!form || form.absent) continue; // «yo» в императиве формы не имеет

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
      const newSession: QuizSession = {
        questions,
        currentIndex: 0,
        answers: [],
        mode: cfg.mode,
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

  const accentMode = config.accentMode ?? 'warn';

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
        correct: checkAnswer(userAnswer, question.correctAnswer, accentMode).correct,
      };

      return { ...previous, answers: [...previous.answers, answer] };
    });
  }, [accentMode]);

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
        if (session.mode !== 'multiple-choice') return { ...question, options: undefined };

        const verb = VERBS.find(v => v.id === question.verbId);
        const options = question.periphrasis && verb
          ? generatePeriphrasisOptions(
              question.periphrasis,
              verb,
              question.tense!,
              PERSONS.indexOf(question.person!),
              question.correctAnswer,
            )
          : question.nonFinite
          ? generateNonFiniteOptions(question.verbId, question.nonFinite, question.correctAnswer)
          : generateOptions(
              question.verbId,
              question.tense!,
              PERSONS.indexOf(question.person!),
              question.correctAnswer,
            );
        return { ...question, options };
      });

    const retrySession: QuizSession = {
      questions: shuffle(wrongQuestions),
      currentIndex: 0,
      answers: [],
      mode: session.mode,
      startedAt: new Date().toISOString(),
      // Повтор ошибок не зачёт и не подход — медаль и открытие темы он не даёт,
      // но вернуться должен туда же, откуда пришли.
      lessonId: session.lessonId,
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
