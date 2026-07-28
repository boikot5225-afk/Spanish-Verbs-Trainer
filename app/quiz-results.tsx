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
import { getPersonLabel, TENSE_LABELS } from '../data/types';
import { getVerbById } from '../data/verbs';
import { getCourseLesson } from '../data/course';
import { useCourse } from '../context/CourseContext';

export default function QuizResults() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { session, retryErrors, clearSession } = useQuiz();
  const { recordLessonResult } = useCourse();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;
  const total = session?.answers.length ?? 0;
  const correct = session?.answers.filter(a => a.correct).length ?? 0;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const courseLesson = session?.courseLessonId
    ? getCourseLesson(session.courseLessonId)
    : undefined;

  useEffect(() => {
    if (!courseLesson || total === 0) return;
    recordLessonResult(courseLesson.id, pct);
  }, [courseLesson?.id, pct, recordLessonResult, total]);

  if (!session) {
    router.replace('/(tabs)/quiz');
    return null;
  }

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
    clearSession();
    if (courseLesson) {
      router.replace(`/lesson/${courseLesson.id}`);
    } else {
      router.replace('/(tabs)/quiz');
    }
  };

  const handleHome = () => {
    clearSession();
    router.replace(courseLesson ? '/(tabs)/learn' : '/(tabs)/verbs');
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

        {courseLesson ? (
          <View
            style={[
              styles.courseBanner,
              {
                backgroundColor: pct >= 70 ? '#ECFDF5' : '#FFFBEB',
                borderColor: pct >= 70 ? colors.success : colors.accent,
              },
            ]}
          >
            <Ionicons
              name={pct >= 70 ? 'checkmark-circle' : 'alert-circle'}
              size={25}
              color={pct >= 70 ? colors.success : colors.accent}
            />
            <View style={styles.courseBannerText}>
              <Text style={[styles.courseBannerTitle, { color: colors.foreground }]}>
                {pct >= 70 ? 'Урок пройден' : 'Урок пока не засчитан'}
              </Text>
              <Text style={[styles.courseBannerBody, { color: colors.mutedForeground }]}>
                {courseLesson.title} · для прохождения нужно 70%
              </Text>
            </View>
          </View>
        ) : null}

        {/* Action buttons */}
        <View style={styles.actions}>
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
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>
              {courseLesson ? 'Вернуться к уроку' : 'Новый тест'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleHome}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: colors.muted, borderColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name={courseLesson ? 'school-outline' : 'book-outline'} size={20} color={colors.mutedForeground} />
            <Text style={[styles.actionBtnText, { color: colors.mutedForeground }]}>
              {courseLesson ? 'К курсу' : 'Справочник'}
            </Text>
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
                        {TENSE_LABELS[a.question.tense]} · {getPersonLabel(a.question.tense, a.question.person)}
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
  courseBanner: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  courseBannerText: { flex: 1 },
  courseBannerTitle: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  courseBannerBody: { fontSize: 12, lineHeight: 17, fontFamily: 'Inter_400Regular', marginTop: 2 },
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
