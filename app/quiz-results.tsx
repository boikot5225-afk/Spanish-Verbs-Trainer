import React, { useEffect } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useQuiz } from '../context/QuizContext';
import { questionShortLabel } from '../data/types';
import { getLessonById, nextLesson } from '../data/lessons';
import { getVerbById } from '../data/verbs';

export default function QuizResults() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { session, retryErrors } = useQuiz();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  // Раньше этот переход стоял прямо в теле рендера. Обработчики звали
  // clearSession() перед router.replace, экран тут же перерисовывался с пустой
  // сессией и уводил на вкладку теста, перебивая уже начатый переход в урок.
  useEffect(() => {
    if (!session) router.replace('/(tabs)/quiz');
  }, [session]);

  if (!session) return null;

  const total = session.answers.length;
  const correct = session.answers.filter(a => a.correct).length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const wrong = session.answers.filter(a => !a.correct);

  const getGrade = () => {
    if (pct >= 90) return { label: 'Отлично!', color: colors.success };
    if (pct >= 70) return { label: 'Хорошо', color: colors.primary };
    if (pct >= 50) return { label: 'Неплохо', color: colors.accent };
    return { label: 'Нужно повторить', color: colors.destructive };
  };

  const grade = getGrade();

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const questions = retryErrors();
    if (questions.length > 0) {
      router.replace('/quiz-session');
    }
  };

  const handleNewTest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)/quiz');
  };

  // Тест из урока возвращает в этот же урок, а не в общий список.
  const lessonId = session.lessonId ?? session.exam?.lessonId ?? session.drill?.lessonId;

  const handleReference = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)/verbs');
  };

  const handleBackToLesson = () => {
    if (!lessonId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace(`/lesson/${lessonId}`);
  };

  // Score ring
  const ScoreRing = () => (
    <View style={styles.scoreContainer}>
      <View style={[styles.scoreRing, { borderColor: grade.color }]}>
        <Text style={[styles.scorePct, { color: grade.color }]}>{pct}%</Text>
        <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>
          {correct}/{total}
        </Text>
      </View>
      <Text style={[styles.gradeText, { color: grade.color }]}>{grade.label}</Text>
    </View>
  );

  // Итог зачёта: тема открывает следующую только при укладывании в лимит ошибок.
  const examVerdict = (() => {
    const exam = session.exam;
    if (!exam) return null;
    const lesson = getLessonById(exam.lessonId);
    const mistakes = wrong.length;
    const isPassed = mistakes <= exam.maxMistakes;
    const following = nextLesson(exam.lessonId);

    return (
      <View
        style={[
          styles.examBanner,
          {
            backgroundColor: colors.card,
            borderColor: isPassed ? colors.success : colors.destructive,
          },
        ]}
      >
        <Text style={[styles.examBannerTitle, { color: isPassed ? colors.success : colors.destructive }]}>
          {isPassed ? 'Зачёт сдан' : 'Зачёт не сдан'}
        </Text>
        <Text style={[styles.examBannerBody, { color: colors.mutedForeground }]}>
          {lesson ? `«${lesson.title}» · ` : ''}
          {mistakes} {mistakes === 1 ? 'ошибка' : mistakes >= 2 && mistakes <= 4 ? 'ошибки' : 'ошибок'}
          {' '}из {exam.maxMistakes} допустимых.
          {isPassed
            ? following
              ? ` Открыта следующая тема: «${following.title}».`
              : ' Это была последняя тема курса.'
            : ' Разберите ошибки ниже и попробуйте ещё раз.'}
        </Text>
      </View>
    );
  })();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Результаты</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}>
        <ScoreRing />

        {examVerdict}

        {/* Action buttons */}
        <View style={styles.actions}>
          {lessonId && (
            <Pressable
              onPress={handleBackToLesson}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: colors.primary, borderColor: colors.primary },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Ionicons name="arrow-back" size={20} color={colors.primaryForeground} />
              <Text style={[styles.actionBtnText, { color: colors.primaryForeground }]}>
                Вернуться к теме
              </Text>
            </Pressable>
          )}

          {wrong.length > 0 && (
            <Pressable
              onPress={handleRetry}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: '#FEF2F2', borderColor: colors.destructive },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons name="refresh" size={20} color={colors.destructive} />
              <Text style={[styles.actionBtnText, { color: colors.destructive }]}>
                Повторить ошибки ({wrong.length})
              </Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleNewTest}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: colors.secondary, borderColor: colors.primary },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>Новый тест</Text>
          </Pressable>

          <Pressable
            onPress={handleReference}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: colors.muted, borderColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="book-outline" size={20} color={colors.mutedForeground} />
            <Text style={[styles.actionBtnText, { color: colors.mutedForeground }]}>Справочник</Text>
          </Pressable>
        </View>

        {/* Mistakes list */}
        {wrong.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Ошибки ({wrong.length})
            </Text>
            <View style={[styles.mistakesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {wrong.map((a, idx) => {
                const verb = getVerbById(a.question.verbId);
                const isLast = idx === wrong.length - 1;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.mistakeRow,
                      !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    ]}
                  >
                    <View style={styles.mistakeLeft}>
                      <Text style={[styles.mistakeVerb, { color: colors.foreground }]}>
                        {verb?.infinitive ?? '?'}
                      </Text>
                      <Text style={[styles.mistakeMeta, { color: colors.mutedForeground }]}>
                        {questionShortLabel(a.question)}
                      </Text>
                    </View>
                    <View style={styles.mistakeRight}>
                      {a.userAnswer ? (
                        <Text style={[styles.mistakeWrong, { color: colors.destructive }]}>
                          {a.userAnswer}
                        </Text>
                      ) : null}
                      <Text style={[styles.mistakeCorrect, { color: colors.success }]}>
                        {a.question.correctAnswer}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Correct answers */}
        {correct === total && (
          <View
            style={[
              styles.perfectBanner,
              { backgroundColor: '#ECFDF5', borderColor: colors.success },
            ]}
          >
            <Ionicons name="trophy" size={28} color={colors.success} />
            <Text style={[styles.perfectText, { color: colors.success }]}>
              Все правильно! Отличный результат!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  examBanner: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 6, marginBottom: 4 },
  examBannerTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  examBannerBody: { fontSize: 13, lineHeight: 19, fontFamily: 'Inter_400Regular' },
  scoreContainer: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  scoreRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  scorePct: {
    fontSize: 38,
    fontFamily: 'Inter_700Bold',
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  gradeText: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  actions: {
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  actionBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  mistakesCard: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mistakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  mistakeLeft: {
    flex: 1,
    gap: 2,
  },
  mistakeVerb: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  mistakeMeta: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  mistakeRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  mistakeWrong: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textDecorationLine: 'line-through',
  },
  mistakeCorrect: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  perfectBanner: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  perfectText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
});
