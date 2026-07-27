import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import ConjugationTable from '../../components/ConjugationTable';
import { useQuiz } from '../../context/QuizContext';
import { useLessons } from '../../context/LessonsContext';
import {
  EXAM_MAX_MISTAKES,
  getLessonById,
  lessonExamSize,
  lessonPracticeVerbIds,
  LESSON_BLOCK_LABELS,
} from '../../data/lessons';
import type { QuizMode } from '../../data/types';
import { PERSONS, TENSE_FULL_LABELS } from '../../data/types';
import { getVerbById } from '../../data/verbs';

// Тренировка по теме начинается с ручного ввода — списывать из вариантов
// сразу после разбора правила смысла мало.
const PRACTICE_MODES: { id: QuizMode; label: string }[] = [
  { id: 'input', label: 'Ввод' },
  { id: 'multiple-choice', label: 'Варианты' },
  { id: 'flashcard', label: 'Карточки' },
];

export default function LessonDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { config, buildAndStartSession } = useQuiz();
  const { isAvailable, passed, unlock } = useLessons();
  const [practiceMode, setPracticeMode] = useState<QuizMode>('input');

  const lesson = id ? getLessonById(id) : undefined;

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  if (!lesson) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.errText, { color: colors.mutedForeground }]}>Урок не найден</Text>
      </View>
    );
  }

  const practiceVerbIds = lessonPracticeVerbIds(lesson);
  const available = isAvailable(lesson.id);
  const isPassed = passed.has(lesson.id);
  const examSize = lessonExamSize(lesson);

  const startExam = () => {
    if (practiceVerbIds.length === 0) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    buildAndStartSession({
      ...config,
      mode: practiceMode,
      tenses: lesson.practice.tenses,
      persons: PERSONS,
      verbIds: practiceVerbIds,
      maxQuestions: examSize,
      exam: { lessonId: lesson.id, maxMistakes: EXAM_MAX_MISTAKES },
    });
    router.push('/quiz-session');
  };

  const startPractice = () => {
    if (practiceVerbIds.length === 0) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Длину берём из настроек пользователя, режим — из выбора на этом экране.
    // Сами настройки не трогаем: тренировка по уроку разовая и не должна
    // затирать конфигурацию своего теста.
    buildAndStartSession({
      ...config,
      mode: practiceMode,
      tenses: lesson.practice.tenses,
      persons: PERSONS,
      verbIds: practiceVerbIds,
      exam: undefined, // свободная тренировка ничего не открывает
    });
    router.push('/quiz-session');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
            {lesson.title}
          </Text>
          <Text style={[styles.headerBlock, { color: colors.mutedForeground }]}>
            {LESSON_BLOCK_LABELS[lesson.block]}
          </Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {!available ? (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}>
          <View style={[styles.lockCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={28} color={colors.mutedForeground} />
            <Text style={[styles.lockTitle, { color: colors.foreground }]}>Тема ещё закрыта</Text>
            <Text style={[styles.lockBody, { color: colors.mutedForeground }]}>
              Курс идёт по порядку: чтобы открыть эту тему, сдайте зачёт по предыдущей —
              не больше {EXAM_MAX_MISTAKES} ошибок. Если материал уже знаком, можно открыть
              её сразу.
            </Text>
            <Pressable
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                unlock(lesson.id);
              }}
              style={({ pressed }) => [
                styles.unlockBtn,
                { borderColor: colors.primary },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.unlockBtnText, { color: colors.primary }]}>
                Открыть без зачёта
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}>
        <Text style={[styles.summary, { color: colors.mutedForeground }]}>{lesson.summary}</Text>

        {lesson.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            {section.heading ? (
              <Text style={[styles.heading, { color: colors.foreground }]}>{section.heading}</Text>
            ) : null}

            {section.body ? (
              <Text style={[styles.body, { color: colors.foreground }]}>{section.body}</Text>
            ) : null}

            {section.bullets?.map((bullet, bulletIndex) => (
              <View key={bulletIndex} style={styles.bulletRow}>
                <Text style={[styles.bulletDot, { color: colors.primary }]}>•</Text>
                <Text style={[styles.bulletText, { color: colors.foreground }]}>{bullet}</Text>
              </View>
            ))}

            {section.table ? <LessonTable table={section.table} /> : null}
          </View>
        ))}

        <View style={styles.modeRow}>
          {PRACTICE_MODES.map(mode => {
            const active = practiceMode === mode.id;
            return (
              <Pressable
                key={mode.id}
                onPress={() => setPracticeMode(mode.id)}
                style={({ pressed }) => [
                  styles.modeChip,
                  {
                    backgroundColor: active ? colors.secondary : colors.background,
                    borderColor: active ? colors.primary : colors.border,
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[
                    styles.modeChipText,
                    { color: active ? colors.primary : colors.mutedForeground },
                  ]}
                >
                  {mode.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={startPractice}
          style={({ pressed }) => [
            styles.practiceBtn,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Ionicons name="create-outline" size={18} color={colors.primaryForeground} />
          <Text style={[styles.practiceBtnText, { color: colors.primaryForeground }]}>
            Тренировать тему
          </Text>
        </Pressable>
        <Text style={[styles.practiceHint, { color: colors.mutedForeground }]}>
          {practiceVerbIds.length} глаголов ·{' '}
          {lesson.practice.tenses.map(tense => TENSE_FULL_LABELS[tense]).join(', ')}
        </Text>

        <View style={[styles.examCard, { backgroundColor: colors.card, borderColor: isPassed ? colors.success : colors.border }]}>
          <View style={styles.examHeader}>
            <Ionicons
              name={isPassed ? 'checkmark-circle' : 'flag-outline'}
              size={20}
              color={isPassed ? colors.success : colors.primary}
            />
            <Text style={[styles.examTitle, { color: colors.foreground }]}>
              {isPassed ? 'Тема сдана' : 'Зачёт по теме'}
            </Text>
          </View>
          <Text style={[styles.examBody, { color: colors.mutedForeground }]}>
            {examSize} вопросов, допустимо не больше {EXAM_MAX_MISTAKES} ошибок.
            {isPassed
              ? ' Следующая тема открыта — зачёт можно пересдать для проверки.'
              : ' Сдача открывает следующую тему курса.'}
          </Text>
          <Pressable
            onPress={startExam}
            style={({ pressed }) => [
              styles.examBtn,
              { borderColor: isPassed ? colors.success : colors.primary },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.examBtnText, { color: isPassed ? colors.success : colors.primary }]}>
              {isPassed ? 'Пересдать' : 'Сдать зачёт'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
      )}
    </View>
  );
}

function LessonTable({
  table,
}: {
  table: { verbId: string; tense: import('../../data/types').Tense; caption?: string };
}) {
  const colors = useColors();
  const verb = getVerbById(table.verbId);
  if (!verb) return null;

  return (
    <View style={styles.tableWrap}>
      <Text style={[styles.tableCaption, { color: colors.mutedForeground }]}>
        {table.caption ?? verb.infinitive} · {TENSE_FULL_LABELS[table.tense]}
      </Text>
      <ConjugationTable verb={verb} tense={table.tense} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  headerBlock: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },
  content: { padding: 16, gap: 4 },
  summary: { fontSize: 14, fontFamily: 'Inter_500Medium', marginBottom: 8 },
  section: { marginBottom: 18, gap: 8 },
  heading: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  body: { fontSize: 15, lineHeight: 23, fontFamily: 'Inter_400Regular' },
  bulletRow: { flexDirection: 'row', gap: 8, paddingLeft: 2 },
  bulletDot: { fontSize: 15, lineHeight: 22, fontFamily: 'Inter_700Bold' },
  bulletText: { flex: 1, fontSize: 15, lineHeight: 22, fontFamily: 'Inter_400Regular' },
  tableWrap: { gap: 6, marginTop: 4 },
  tableCaption: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  modeRow: { flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 10 },
  modeChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  modeChipText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  practiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  practiceBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  practiceHint: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 8 },
  examCard: { borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 20, gap: 8 },
  examHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  examTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  examBody: { fontSize: 13, lineHeight: 19, fontFamily: 'Inter_400Regular' },
  examBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 2,
  },
  examBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  lockCard: { borderWidth: 1, borderRadius: 12, padding: 20, alignItems: 'center', gap: 10, marginTop: 40 },
  lockTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  lockBody: { fontSize: 14, lineHeight: 21, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  unlockBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 20,
    marginTop: 6,
  },
  unlockBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  errText: { fontSize: 16, textAlign: 'center', marginTop: 100, fontFamily: 'Inter_400Regular' },
});
