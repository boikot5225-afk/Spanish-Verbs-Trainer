import {
  buildThematicExerciseQuestions,
  isContextualQuizMode,
} from './exercise-questions';
import { getVerbById, shuffle } from './verbs';
import { PERSONS, type QuizMode, type QuizQuestion } from './types';

interface IlFautParts {
  correctPart: string;
  wrongPart: string;
  solution: string;
  blankContext: string;
  brokenContext: string;
}

function replaceLastInsensitive(source: string, target: string, replacement: string): string | null {
  const haystack = source.toLocaleLowerCase('fr');
  const needle = target.toLocaleLowerCase('fr');
  const at = haystack.lastIndexOf(needle);
  if (at < 0) return null;
  return source.slice(0, at) + replacement + source.slice(at + target.length);
}

function ilFautParts(question: QuizQuestion): IlFautParts | null {
  const verb = getVerbById(question.verbId);
  if (!verb) return null;
  const personIndex = PERSONS.indexOf(question.person);
  if (personIndex < 0) return null;

  const solution = question.speechText ?? question.correctAnswer;
  let correctPart: string;
  let wrongPart: string | null = null;

  if (question.tense === 'subjPresent') {
    const subjunctive = verb.conjugations.subjPresent?.[personIndex];
    const indicative = verb.conjugations.present?.[personIndex];
    if (!subjunctive || subjunctive.absent) return null;
    correctPart = subjunctive.form;
    if (indicative && !indicative.absent && indicative.form !== correctPart) {
      wrongPart = indicative.form;
    }
  } else {
    // «Il faut + infinitif»: проверяем именно инфинитив после faut.
    correctPart = verb.infinitive;
    const indicative = verb.conjugations.present?.[personIndex];
    if (indicative && !indicative.absent && indicative.form !== correctPart) {
      wrongPart = indicative.form;
    }
  }

  if (!wrongPart) {
    for (let index = 0; index < PERSONS.length; index += 1) {
      const candidate = verb.conjugations.present?.[index];
      if (candidate && !candidate.absent && candidate.form !== correctPart) {
        wrongPart = candidate.form;
        break;
      }
    }
  }
  if (!wrongPart) return null;

  const blankContext = replaceLastInsensitive(solution, correctPart, '___');
  const brokenContext = replaceLastInsensitive(solution, correctPart, wrongPart);
  if (!blankContext || !brokenContext || blankContext === '___' || brokenContext === solution) {
    return null;
  }

  return { correctPart, wrongPart, solution, blankContext, brokenContext };
}

function adaptIlFaut(questions: QuizQuestion[], mode: QuizMode): QuizQuestion[] {
  if (!isContextualQuizMode(mode) || mode === 'word-order') {
    return buildThematicExerciseQuestions(questions, mode, 'constr-il-faut');
  }

  const result: QuizQuestion[] = [];
  for (const question of questions) {
    const parts = ilFautParts(question);
    if (!parts) continue;

    if (mode === 'fill-blank') {
      result.push({
        ...question,
        correctAnswer: parts.correctPart,
        options: undefined,
        context: parts.blankContext,
        solutionText: parts.solution,
        speechText: parts.solution,
      });
      continue;
    }

    if (mode === 'error-correction') {
      result.push({
        ...question,
        correctAnswer: parts.correctPart,
        options: undefined,
        context: parts.brokenContext,
        solutionText: parts.solution,
        speechText: parts.solution,
        wrongAnswer: parts.wrongPart,
      });
      continue;
    }

    result.push({
      ...question,
      correctAnswer: parts.correctPart,
      context: parts.blankContext,
      solutionText: parts.solution,
      speechText: parts.solution,
      options: shuffle([parts.correctPart, parts.wrongPart]),
    });
  }
  return result;
}

/**
 * Единая точка адаптации тематических уроков. Отдельный путь для il faut
 * нужен потому, что его базовый правильный ответ — целая фраза, а в пропуске
 * и исправлении ошибки пользователь должен менять только инфинитив/subjonctif.
 */
export function adaptThematicExerciseQuestions(
  questions: QuizQuestion[],
  mode: QuizMode,
  lessonId: string,
): QuizQuestion[] {
  if (lessonId === 'constr-il-faut') return adaptIlFaut(questions, mode);
  return buildThematicExerciseQuestions(questions, mode, lessonId);
}
