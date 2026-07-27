import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useLessons } from '../../context/LessonsContext';
import { useQuiz } from '../../context/QuizContext';
import type { Tense } from '../../data/types';
import {
  LEVELS,
  PERSONS,
  TENSES,
  TENSE_FULL_LABELS,
  TENSE_LEVELS,
  tensesByLevel,
} from '../../data/types';
import { VERBS } from '../../data/verbs';

/** Считаем время освоенным при такой доле верных ответов и не меньше стольких попыток. */
const MASTERY_PERCENT = 70;
const MASTERY_ATTEMPTS = 6;

const FREQUENT = [
  'ser', 'estar', 'tener', 'hacer', 'ir', 'poder', 'decir', 'ver', 'dar', 'saber',
  'querer', 'venir', 'poner', 'salir', 'hablar', 'comer', 'vivir', 'pensar', 'volver', 'pedir',
].filter(id => VERBS.some(verb => verb.id === id));

function daysAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'сегодня';
  if (days === 1) return 'вчера';
  if (days < 5) return `${days} дня назад`;
  if (days < 31) return `${days} дней назад`;
  return 'больше месяца назад';
}

export default function ProgressTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tenseStats } = useLessons();
  const { config, buildAndStartSession } = useQuiz();

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 84 : insets.bottom + 64;

  const percentOf = (tense: Tense): number | null => {
    const stat = tenseStats[tense];
    if (!stat || stat.asked === 0) return null;
    return Math.round((stat.correct / stat.asked) * 100);
  };

  const isMastered = (tense: Tense): boolean => {
    const stat = tenseStats[tense];
    if (!stat || stat.asked < MASTERY_ATTEMPTS) return false;
    return (stat.correct / stat.asked) * 100 >= MASTERY_PERCENT;
  };

  const started = TENSES.filter(tense => percentOf(tense) !== null);
  const untouched = TENSES.filter(tense => percentOf(tense) === null);
  // Сначала то, что уже трогали, — по убыванию владения.
  started.sort((left, right) => (percentOf(right) ?? 0) - (percentOf(left) ?? 0));

  const masteredCount = TENSES.filter(isMastered).length;

  const practiceTense = (tense: Tense) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buildAndStartSession({
      ...config,
      tenses: [tense],
      persons: PERSONS,
      verbIds: FREQUENT,
      maxQuestions: 20,
      exam: undefined,
      drill: undefined,
    });
    router.push('/quiz-session');
  };

  const barColor = (percent: number) =>
    percent >= MASTERY_PERCENT ? colors.success : percent >= 40 ? colors.primary : colors.destructive;

  const renderTense = (tense: Tense) => {
    const percent = percentOf(tense);
    const stat = tenseStats[tense];

    return (
      <Pressable
        key={tense}
        onPress={() => practiceTense(tense)}
        style={({ pressed }) => [
          styles.tenseCard,
          { backgroundColor: colors.card, borderColor: colors.border },
          pressed && { opacity: 0.7 },
        ]}
      >
        <View style={styles.tenseTop}>
          <View style={styles.tenseTitleWrap}>
            <Text style={[styles.tenseTitle, { color: colors.foreground }]}>
              {TENSE_FULL_LABELS[tense]}
            </Text>
            <Text style={[styles.tenseMeta, { color: colors.mutedForeground }]}>
              {stat
                ? `${TENSE_LEVELS[tense]} · ${percent}% · ${daysAgo(stat.lastAt)}`
                : `${TENSE_LEVELS[tense]} · ещё не тренировали`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </View>

        <View style={[styles.track, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.fill,
              {
                width: `${percent ?? 0}%` as `${number}%`,
                backgroundColor: percent === null ? colors.muted : barColor(percent),
              },
            ]}
          />
        </View>
      </Pressable>
    );
  };

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
        <Text style={[styles.title, { color: colors.foreground }]}>Прогресс</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Освоено {masteredCount} из {TENSES.length} времён
        </Text>
      </View>

      <ScrollView contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}>
        {/* Уровни: доля освоенных времён внутри каждого */}
        <View style={[styles.levelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.levelRow}>
            {LEVELS.map(level => {
              const tenses = tensesByLevel(level);
              const done = tenses.filter(isMastered).length;
              const share = tenses.length > 0 ? done / tenses.length : 0;
              return (
                <View key={level} style={styles.levelCell}>
                  <View style={[styles.levelTrack, { backgroundColor: colors.muted }]}>
                    <View
                      style={[
                        styles.levelFill,
                        {
                          width: `${Math.round(share * 100)}%` as `${number}%`,
                          backgroundColor: share === 1 ? colors.success : colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.levelLabel, { color: colors.mutedForeground }]}>{level}</Text>
                </View>
              );
            })}
          </View>
          <Text style={[styles.levelHint, { color: colors.mutedForeground }]}>
            Время считается освоенным при {MASTERY_PERCENT}% верных ответов
            и минимум {MASTERY_ATTEMPTS} попытках.
          </Text>
        </View>

        {started.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ВРЕМЕНА В РАБОТЕ</Text>
            {started.map(renderTense)}
          </>
        )}

        {untouched.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ЕЩЁ НЕ НАЧАТЫ</Text>
            {untouched.map(renderTense)}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  list: { padding: 16, gap: 8 },
  levelCard: { borderWidth: 1, borderRadius: 12, padding: 14, gap: 10 },
  levelRow: { flexDirection: 'row', gap: 6 },
  levelCell: { flex: 1, gap: 5 },
  levelTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  levelFill: { height: 8, borderRadius: 4 },
  levelLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  levelHint: { fontSize: 11, lineHeight: 16, fontFamily: 'Inter_400Regular' },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 2,
    marginLeft: 4,
  },
  tenseCard: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 9 },
  tenseTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tenseTitleWrap: { flex: 1, gap: 2 },
  tenseTitle: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  tenseMeta: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  track: { height: 7, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 7, borderRadius: 4 },
});
