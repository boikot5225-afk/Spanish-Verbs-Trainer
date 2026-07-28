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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useCourse } from '../../context/CourseContext';
import { PRESENT_MODULE_LESSONS } from '../../data/course';

export default function LearnTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { progress } = useCourse();

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 94 : insets.bottom + 72;
  const completed = PRESENT_MODULE_LESSONS.filter(lesson =>
    progress.completedLessonIds.includes(lesson.id),
  ).length;
  const percent = Math.round((completed / PRESENT_MODULE_LESSONS.length) * 100);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPadding + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Обучение</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Правило → примеры → короткая практика
        </Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottomPadding }]}>
        <View style={[styles.moduleHero, { backgroundColor: '#1D4ED8' }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroEyebrow}>МОДУЛЬ 1</Text>
              <Text style={styles.heroTitle}>Presente I</Text>
              <Text style={styles.heroText}>
                Лица, правильные окончания, ser и estar
              </Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{percent}%</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>
          <Text style={styles.progressCaption}>
            {completed} из {PRESENT_MODULE_LESSONS.length} уроков пройдено
          </Text>
        </View>

        <View style={styles.sectionHeadingRow}>
          <Text style={[styles.sectionHeading, { color: colors.foreground }]}>
            Уроки
          </Text>
          <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>
            проходить лучше по порядку
          </Text>
        </View>

        {PRESENT_MODULE_LESSONS.map(lesson => {
          const isCompleted = progress.completedLessonIds.includes(lesson.id);
          const bestScore = progress.bestScores[lesson.id];
          return (
            <Pressable
              key={lesson.id}
              onPress={() => router.push(`/lesson/${lesson.id}`)}
              style={({ pressed }) => [
                styles.lessonCard,
                {
                  backgroundColor: colors.card,
                  borderColor: isCompleted ? colors.success : colors.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.lessonNumber,
                  {
                    backgroundColor: isCompleted ? '#ECFDF5' : colors.secondary,
                  },
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={20} color={colors.success} />
                ) : (
                  <Text style={[styles.lessonNumberText, { color: colors.primary }]}>
                    {lesson.order}
                  </Text>
                )}
              </View>
              <View style={styles.lessonText}>
                <Text style={[styles.lessonTitle, { color: colors.foreground }]}>
                  {lesson.title}
                </Text>
                <Text style={[styles.lessonSubtitle, { color: colors.mutedForeground }]}>
                  {lesson.subtitle}
                </Text>
                <View style={styles.lessonMetaRow}>
                  <Text style={[styles.lessonDuration, { color: colors.mutedForeground }]}>
                    {lesson.duration}
                  </Text>
                  {typeof bestScore === 'number' ? (
                    <Text style={[styles.bestScore, { color: isCompleted ? colors.success : colors.accent }]}>
                      лучший результат: {bestScore}%
                    </Text>
                  ) : null}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
            </Pressable>
          );
        })}

        <View style={[styles.note, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
            Никаких жизней и кредитов. Урок можно открыть заново, а ошибки — повторить отдельно.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  scroll: { padding: 16, gap: 10 },
  moduleHero: { borderRadius: 18, padding: 18, marginBottom: 8 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  heroEyebrow: { color: '#BFDBFE', fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  heroTitle: { color: '#FFFFFF', fontSize: 26, fontFamily: 'Inter_700Bold', marginTop: 3 },
  heroText: { color: '#DBEAFE', fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 4, maxWidth: 250 },
  percentBadge: { width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  percentText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
  progressTrack: { height: 7, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 4, marginTop: 18, overflow: 'hidden' },
  progressFill: { height: 7, backgroundColor: '#FFFFFF', borderRadius: 4 },
  progressCaption: { color: '#BFDBFE', fontSize: 11, fontFamily: 'Inter_500Medium', marginTop: 7 },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4, marginBottom: 2 },
  sectionHeading: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  sectionMeta: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  lessonCard: { borderWidth: 1, borderRadius: 14, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  lessonNumber: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  lessonNumberText: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  lessonText: { flex: 1 },
  lessonTitle: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  lessonSubtitle: { fontSize: 12, lineHeight: 17, fontFamily: 'Inter_400Regular', marginTop: 2 },
  lessonMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  lessonDuration: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  bestScore: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  note: { borderWidth: 1, borderRadius: 13, padding: 13, flexDirection: 'row', gap: 10, marginTop: 8 },
  noteText: { flex: 1, fontSize: 12, lineHeight: 18, fontFamily: 'Inter_400Regular' },
  pressed: { opacity: 0.65 },
});
