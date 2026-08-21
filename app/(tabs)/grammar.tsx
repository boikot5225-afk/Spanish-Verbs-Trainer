import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useLessons } from '../../context/LessonsContext';
import { GRAMMAR_LESSON_IDS } from '../../data/grammar-drills';
import { LESSONS } from '../../data/lessons';

export default function GrammarTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { passed } = useLessons();

  const grammarLessons = GRAMMAR_LESSON_IDS
    .map(id => LESSONS.find(lesson => lesson.id === id))
    .filter((lesson): lesson is NonNullable<typeof lesson> => Boolean(lesson));
  const passedCount = grammarLessons.filter(lesson => passed.has(lesson.id)).length;
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 84 : insets.bottom + 64;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        <Text style={[styles.title, { color: colors.foreground }]}>Грамматика</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Пройдено {passedCount} из {grammarLessons.length}</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}>
        <View style={[styles.intro, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.introIcon, { backgroundColor: colors.secondary }]}>
            <Ionicons name="git-branch-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.introText}>
            <Text style={[styles.introTitle, { color: colors.foreground }]}>Конструкции в контексте</Text>
            <Text style={[styles.introBody, { color: colors.mutedForeground }]}>Здесь не нужно зубрить ещё одну таблицу спряжения. Сначала разбираем смысл конструкции на понятных примерах, затем выбираем её в предложениях.</Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ОТДЕЛЬНЫЕ ТРЕНАЖЁРЫ</Text>
        <Pressable
          onPress={() => router.push('/numbers')}
          style={({ pressed }) => [
            styles.trainerCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.65 },
          ]}
        >
          <View style={[styles.trainerIcon, { backgroundColor: colors.secondary }]}>
            <Ionicons name="calculator-outline" size={24} color={colors.primary} />
          </View>
          <View style={styles.trainerText}>
            <Text style={[styles.trainerTitle, { color: colors.foreground }]}>Числительные</Text>
            <Text style={[styles.trainerSummary, { color: colors.mutedForeground }]}>0–999 999 · цифры → слова, слова → цифры и на слух</Text>
            <View style={styles.trainerBadges}>
              <View style={[styles.trainerBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.trainerBadgeText, { color: colors.primary }]}>70–99 отдельно</Text>
              </View>
              <View style={[styles.trainerBadge, { backgroundColor: colors.muted }]}>
                <Text style={[styles.trainerBadgeText, { color: colors.mutedForeground }]}>с озвучкой</Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={19} color={colors.mutedForeground} />
        </Pressable>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ОТ ПРОСТОГО К СЛОЖНОМУ</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {grammarLessons.map((lesson, index) => {
            const isPassed = passed.has(lesson.id);
            return (
              <Pressable
                key={lesson.id}
                onPress={() => router.push(`/lesson/${lesson.id}`)}
                style={({ pressed }) => [
                  styles.row,
                  index < grammarLessons.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <View
                  style={[
                    styles.number,
                    { backgroundColor: isPassed ? colors.success : colors.secondary },
                  ]}
                >
                  {isPassed ? (
                    <Ionicons name="checkmark" size={16} color={colors.background} />
                  ) : (
                    <Text style={[styles.numberText, { color: colors.primary }]}>{index + 1}</Text>
                  )}
                </View>
                <View style={styles.rowCenter}>
                  <Text style={[styles.lessonTitle, { color: colors.foreground }]}>{lesson.title}</Text>
                  <Text style={[styles.lessonSummary, { color: colors.mutedForeground }]}>{lesson.summary}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.note, { backgroundColor: colors.secondary }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={[styles.noteText, { color: colors.foreground }]}>Темы доступны сразу, но расположены по зависимостям: сначала управление глаголов, затем y/en; условные конструкции и сложное согласование стоят в конце.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  content: { padding: 16, gap: 14 },
  intro: { borderWidth: 1, borderRadius: 14, padding: 14, flexDirection: 'row', gap: 12 },
  introIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  introText: { flex: 1, gap: 4 },
  introTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  introBody: { fontSize: 13, lineHeight: 19, fontFamily: 'Inter_400Regular' },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginLeft: 4 },
  trainerCard: { borderWidth: 1, borderRadius: 14, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
  trainerIcon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  trainerText: { flex: 1, gap: 3 },
  trainerTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  trainerSummary: { fontSize: 12, lineHeight: 17, fontFamily: 'Inter_400Regular' },
  trainerBadges: { marginTop: 4, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  trainerBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  trainerBadgeText: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  card: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  number: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  rowCenter: { flex: 1, gap: 2 },
  lessonTitle: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  lessonSummary: { fontSize: 12, lineHeight: 17, fontFamily: 'Inter_400Regular' },
  note: { borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  noteText: { flex: 1, fontSize: 12, lineHeight: 18, fontFamily: 'Inter_400Regular' },
});
