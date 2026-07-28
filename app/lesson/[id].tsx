import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useCourse } from '../../context/CourseContext';
import { useQuiz } from '../../context/QuizContext';
import { getCourseLesson } from '../../data/course';

export default function LessonScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson = getCourseLesson(id ?? '');
  const { progress } = useCourse();
  const { buildAndStartSession } = useQuiz();

  const topPadding = Platform.OS === 'web' ? 24 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 28 : insets.bottom;

  if (!lesson) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.background }]}>
        <Text style={[styles.missingTitle, { color: colors.foreground }]}>Урок не найден</Text>
        <Pressable onPress={() => router.replace('/(tabs)/learn')}>
          <Text style={[styles.missingLink, { color: colors.primary }]}>Вернуться к курсу</Text>
        </Pressable>
      </View>
    );
  }

  const completed = progress.completedLessonIds.includes(lesson.id);
  const bestScore = progress.bestScores[lesson.id];

  const startPractice = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const questions = buildAndStartSession(
      {
        tenses: [lesson.practice.tense],
        persons: lesson.practice.persons,
        verbIds: lesson.practice.verbIds,
        mode: lesson.practice.mode,
        maxQuestions: lesson.practice.maxQuestions,
      },
      lesson.id,
    );
    if (questions.length > 0) router.push('/quiz-session');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPadding + 8,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={[styles.headerEyebrow, { color: colors.primary }]}>
            УРОК {lesson.order}
          </Text>
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
            {lesson.title}
          </Text>
        </View>
        {completed ? (
          <Ionicons name="checkmark-circle" size={25} color={colors.success} />
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPadding + 24 }]}>
        <View style={styles.intro}>
          <Text style={[styles.lessonTitle, { color: colors.foreground }]}>{lesson.title}</Text>
          <Text style={[styles.lessonSubtitle, { color: colors.mutedForeground }]}>
            {lesson.subtitle}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.metaChip, { backgroundColor: colors.secondary }]}>
              <Ionicons name="time-outline" size={14} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.primary }]}>{lesson.duration}</Text>
            </View>
            {typeof bestScore === 'number' ? (
              <View style={[styles.metaChip, { backgroundColor: completed ? '#ECFDF5' : '#FFFBEB' }]}>
                <Ionicons name="stats-chart" size={14} color={completed ? colors.success : colors.accent} />
                <Text style={[styles.metaText, { color: completed ? colors.success : colors.accent }]}>
                  лучший результат {bestScore}%
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {lesson.sections.map((section, sectionIndex) => (
          <View
            key={`${lesson.id}-${sectionIndex}`}
            style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text>
            {section.paragraphs.map((paragraph, paragraphIndex) => (
              <Text
                key={paragraphIndex}
                style={[styles.paragraph, { color: colors.foreground }]}
              >
                {paragraph}
              </Text>
            ))}
            {section.bullets?.length ? (
              <View style={styles.bullets}>
                {section.bullets.map((bullet, bulletIndex) => (
                  <View key={bulletIndex} style={styles.bulletRow}>
                    <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.bulletText, { color: colors.foreground }]}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {section.examples?.length ? (
              <View style={[styles.examples, { borderTopColor: colors.border }]}>
                {section.examples.map((example, exampleIndex) => (
                  <View key={exampleIndex} style={[styles.example, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.exampleSpanish, { color: colors.foreground }]}>
                      {example.spanish}
                    </Text>
                    <Text style={[styles.exampleRussian, { color: colors.mutedForeground }]}>
                      {example.russian}
                    </Text>
                    {example.note ? (
                      <Text style={[styles.exampleNote, { color: colors.primary }]}>
                        {example.note}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}
            {section.warning ? (
              <View style={[styles.warning, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                <Ionicons name="warning-outline" size={19} color={colors.accent} />
                <Text style={[styles.warningText, { color: colors.foreground }]}>
                  {section.warning}
                </Text>
              </View>
            ) : null}
          </View>
        ))}

        <View style={[styles.practiceCard, { backgroundColor: '#1D4ED8' }]}>
          <Text style={styles.practiceEyebrow}>ПРАКТИКА</Text>
          <Text style={styles.practiceTitle}>
            {completed ? 'Пройти ещё раз' : 'Закрепить урок'}
          </Text>
          <Text style={styles.practiceText}>
            {lesson.practice.maxQuestions} вопросов. Урок засчитывается с 70%.
          </Text>
          <Pressable
            onPress={startPractice}
            style={({ pressed }) => [styles.practiceButton, pressed && styles.pressed]}
          >
            <Text style={styles.practiceButtonText}>Начать</Text>
            <Ionicons name="arrow-forward" size={19} color="#1D4ED8" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { minHeight: 60, paddingHorizontal: 14, paddingBottom: 10, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  headerEyebrow: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.8 },
  headerTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginTop: 1 },
  headerSpacer: { width: 25 },
  content: { padding: 16, gap: 12 },
  intro: { paddingVertical: 5 },
  lessonTitle: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  lessonSubtitle: { fontSize: 14, lineHeight: 20, fontFamily: 'Inter_400Regular', marginTop: 5 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  metaChip: { borderRadius: 18, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  sectionCard: { borderWidth: 1, borderRadius: 15, padding: 16, gap: 10 },
  sectionTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 1 },
  paragraph: { fontSize: 14, lineHeight: 21, fontFamily: 'Inter_400Regular' },
  bullets: { gap: 8, marginTop: 2 },
  bulletRow: { flexDirection: 'row', gap: 9, alignItems: 'flex-start' },
  bulletDot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 20, fontFamily: 'Inter_400Regular' },
  examples: { borderTopWidth: 1, paddingTop: 12, gap: 8, marginTop: 2 },
  example: { borderRadius: 11, padding: 12 },
  exampleSpanish: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  exampleRussian: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 3 },
  exampleNote: { fontSize: 11, fontFamily: 'Inter_600SemiBold', marginTop: 5 },
  warning: { borderWidth: 1, borderRadius: 11, padding: 11, flexDirection: 'row', gap: 9, alignItems: 'flex-start' },
  warningText: { flex: 1, fontSize: 12, lineHeight: 18, fontFamily: 'Inter_500Medium' },
  practiceCard: { borderRadius: 17, padding: 18, marginTop: 4 },
  practiceEyebrow: { color: '#BFDBFE', fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  practiceTitle: { color: '#FFFFFF', fontSize: 22, fontFamily: 'Inter_700Bold', marginTop: 4 },
  practiceText: { color: '#DBEAFE', fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 4 },
  practiceButton: { backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: 15, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  practiceButtonText: { color: '#1D4ED8', fontSize: 15, fontFamily: 'Inter_700Bold' },
  pressed: { opacity: 0.7 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  missingTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  missingLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
