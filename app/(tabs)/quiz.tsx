import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useQuiz } from '../../context/QuizContext';
import type { Mood, Person, QuizMode, Tense } from '../../data/types';
import {
  MOODS,
  MOOD_LABELS,
  PERSONS,
  PERSON_LABELS,
  TENSE_LABELS,
  tensesByMood,
} from '../../data/types';
import { VERBS } from '../../data/verbs';

const MODES: { id: QuizMode; label: string; description: string }[] = [
  { id: 'multiple-choice', label: 'Варианты ответа', description: 'Четыре формы на выбор' },
  { id: 'input', label: 'Ввод ответа', description: 'Напечатайте форму самостоятельно' },
  { id: 'flashcard', label: 'Карточки', description: 'Оцените, знали вы ответ или нет' },
];

const QUESTION_LIMITS = [10, 20, 30, 50] as const;
const FREQUENT_IDS = [
  'être', 'avoir', 'faire', 'dire', 'aller', 'voir', 'savoir', 'pouvoir', 'vouloir', 'venir',
  'devoir', 'prendre', 'trouver', 'donner', 'parler', 'mettre', 'passer', 'regarder', 'croire', 'aimer',
  'penser', 'demander', 'rester', 'tenir', 'porter', 'laisser', 'comprendre', 'connaître', 'partir', 'sortir',
].filter(id => VERBS.some(verb => verb.id === id));

function SelectionMark({ active, color, borderColor }: { active: boolean; color: string; borderColor: string }) {
  return (
    <View
      style={[
        styles.checkbox,
        {
          backgroundColor: active ? color : 'transparent',
          borderColor: active ? color : borderColor,
        },
      ]}
    >
      {active ? <Text style={styles.checkmark}>✓</Text> : null}
    </View>
  );
}

export default function QuizTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { config, setConfig, buildAndStartSession, session, clearSession, history } = useQuiz();
  const [verbSearch, setVerbSearch] = useState('');

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 94 : insets.bottom + 72;

  const selectedVerbIds = useMemo(
    () => (config.verbIds === 'all' ? VERBS.map(verb => verb.id) : config.verbIds),
    [config.verbIds],
  );

  const visibleVerbs = useMemo(() => {
    const query = verbSearch.trim().toLowerCase();
    if (!query) return VERBS;
    return VERBS.filter(
      verb =>
        verb.infinitive.toLowerCase().includes(query) ||
        verb.translation.toLowerCase().includes(query),
    );
  }, [verbSearch]);

  const displayedVerbs = useMemo(
    () => visibleVerbs.slice(0, verbSearch.trim() ? 100 : 40),
    [verbSearch, visibleVerbs],
  );
  const selectedVerbSet = useMemo(() => new Set(selectedVerbIds), [selectedVerbIds]);

  const possibleQuestionCount = selectedVerbIds.length * config.tenses.length * config.persons.length;
  const actualQuestionCount = Math.min(config.maxQuestions, possibleQuestionCount);
  const hasActiveSession =
    session !== null &&
    session.questions.length > 0 &&
    session.answers.length < session.questions.length;

  const toggleTense = (tense: Tense) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (config.tenses.includes(tense)) {
      if (config.tenses.length === 1) return;
      setConfig({ tenses: config.tenses.filter(item => item !== tense) });
    } else {
      setConfig({ tenses: [...config.tenses, tense] });
    }
  };

  const toggleMood = (mood: Mood) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const moodTenses = tensesByMood(mood);
    const allSelected = moodTenses.every(tense => config.tenses.includes(tense));
    if (allSelected) {
      const rest = config.tenses.filter(tense => !moodTenses.includes(tense));
      if (rest.length === 0) return; // хотя бы одно время должно остаться
      setConfig({ tenses: rest });
    } else {
      const merged = [...config.tenses];
      for (const tense of moodTenses) if (!merged.includes(tense)) merged.push(tense);
      setConfig({ tenses: merged });
    }
  };

  const togglePerson = (person: Person) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (config.persons.includes(person)) {
      if (config.persons.length === 1) return;
      setConfig({ persons: config.persons.filter(item => item !== person) });
    } else {
      setConfig({ persons: [...config.persons, person] });
    }
  };

  const setVerbGroup = (ids: string[] | 'all') => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConfig({ verbIds: ids });
  };

  const toggleVerb = (verbId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = config.verbIds === 'all' ? VERBS.map(verb => verb.id) : config.verbIds;
    const next = current.includes(verbId)
      ? current.filter(id => id !== verbId)
      : [...current, verbId];

    if (next.length === 0) return;
    setConfig({ verbIds: next.length === VERBS.length ? 'all' : next });
  };

  const handleStart = () => {
    if (actualQuestionCount === 0) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    buildAndStartSession(config);
    router.push('/quiz-session');
  };

  const handleRestart = () => {
    clearSession();
    handleStart();
  };

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
        <Text style={[styles.title, { color: colors.foreground }]}>Свой тест</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Настройте тренировку под слабые места</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPadding }]}
        keyboardShouldPersistTaps="handled"
      >
        {hasActiveSession ? (
          <View style={[styles.resumeCard, { backgroundColor: colors.secondary, borderColor: colors.primary }]}> 
            <View style={styles.resumeTextWrap}>
              <Text style={[styles.resumeTitle, { color: colors.foreground }]}>Есть незаконченный тест</Text>
              <Text style={[styles.resumeText, { color: colors.mutedForeground }]}> 
                {session.answers.length} из {session.questions.length} вопросов пройдено
              </Text>
            </View>
            <View style={styles.resumeActions}>
              <Pressable
                onPress={() => router.push('/quiz-session')}
                style={[styles.smallButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.smallButtonText, { color: colors.primaryForeground }]}>Продолжить</Text>
              </Pressable>
              <Pressable
                onPress={handleRestart}
                style={[styles.smallButton, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
              >
                <Text style={[styles.smallButtonText, { color: colors.foreground }]}>Начать заново</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ВРЕМЕНА</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {MOODS.map(mood => {
            const moodTenses = tensesByMood(mood);
            const allSelected = moodTenses.every(tense => config.tenses.includes(tense));
            return (
              <View key={mood}>
                <Pressable
                  onPress={() => toggleMood(mood)}
                  style={({ pressed }) => [
                    styles.moodHeader,
                    { backgroundColor: colors.secondary, borderBottomColor: colors.border },
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.moodHeaderText, { color: colors.mutedForeground }]}>
                    {MOOD_LABELS[mood]}
                  </Text>
                  <Text style={[styles.moodHeaderAction, { color: colors.primary }]}>
                    {allSelected ? 'снять' : 'все'}
                  </Text>
                </Pressable>

                {moodTenses.map((tense, index) => {
                  const active = config.tenses.includes(tense);
                  return (
                    <Pressable
                      key={tense}
                      onPress={() => toggleTense(tense)}
                      style={({ pressed }) => [
                        styles.row,
                        index < moodTenses.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                        },
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={[styles.rowLabel, { color: active ? colors.primary : colors.foreground }]}>
                        {TENSE_LABELS[tense]}
                      </Text>
                      <SelectionMark active={active} color={colors.primary} borderColor={colors.border} />
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ЛИЦА</Text>
        <View style={[styles.chipWrap, styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          {PERSONS.map(person => {
            const active = config.persons.includes(person);
            return (
              <Pressable
                key={person}
                onPress={() => togglePerson(person)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: active ? colors.secondary : colors.background,
                    borderColor: active ? colors.primary : colors.border,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.chipText, { color: active ? colors.primary : colors.foreground }]}> 
                  {PERSON_LABELS[person]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginBottom: 0 }]}>ГЛАГОЛЫ</Text>
          <Text style={[styles.selectedCount, { color: colors.primary }]}>{selectedVerbIds.length} выбрано</Text>
        </View>

        <View style={styles.quickGroups}>
          <Pressable onPress={() => setVerbGroup('all')} style={[styles.groupButton, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.groupButtonText, { color: colors.foreground }]}>Все</Text>
          </Pressable>
          <Pressable onPress={() => setVerbGroup(FREQUENT_IDS)} style={[styles.groupButton, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.groupButtonText, { color: colors.foreground }]}>Частотные</Text>
          </Pressable>
          <Pressable
            onPress={() => setVerbGroup(VERBS.filter(verb => verb.group === '3').map(verb => verb.id))}
            style={[styles.groupButton, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <Text style={[styles.groupButtonText, { color: colors.foreground }]}>Неправильные</Text>
          </Pressable>
          <Pressable
            onPress={() => setVerbGroup(VERBS.filter(verb => verb.group !== '3').map(verb => verb.id))}
            style={[styles.groupButton, { borderColor: colors.border, backgroundColor: colors.card }]}
          >
            <Text style={[styles.groupButtonText, { color: colors.foreground }]}>Правильные</Text>
          </Pressable>
        </View>

        <TextInput
          value={verbSearch}
          onChangeText={setVerbSearch}
          placeholder="Найти глагол..."
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          autoCorrect={false}
          style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
        />

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          {displayedVerbs.map((verb, index) => {
            const active = selectedVerbSet.has(verb.id);
            return (
              <Pressable
                key={verb.id}
                onPress={() => toggleVerb(verb.id)}
                style={({ pressed }) => [
                  styles.row,
                  index < displayedVerbs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.verbTextWrap}>
                  <Text style={[styles.rowLabel, { color: active ? colors.primary : colors.foreground }]}>{verb.infinitive}</Text>
                  <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{verb.translation}</Text>
                </View>
                <SelectionMark active={active} color={colors.primary} borderColor={colors.border} />
              </Pressable>
            );
          })}
        </View>
        {visibleVerbs.length > displayedVerbs.length ? (
          <Text style={[styles.listHint, { color: colors.mutedForeground }]}> 
            Показаны первые {displayedVerbs.length} из {visibleVerbs.length}. Уточните поиск, чтобы выбрать нужный глагол.
          </Text>
        ) : null}

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>РЕЖИМ</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          {MODES.map((mode, index) => {
            const active = config.mode === mode.id;
            return (
              <Pressable
                key={mode.id}
                onPress={() => setConfig({ mode: mode.id })}
                style={({ pressed }) => [
                  styles.row,
                  index < MODES.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.verbTextWrap}>
                  <Text style={[styles.rowLabel, { color: active ? colors.primary : colors.foreground }]}>{mode.label}</Text>
                  <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{mode.description}</Text>
                </View>
                <View style={[styles.radio, { borderColor: active ? colors.primary : colors.border }]}> 
                  {active ? <View style={[styles.radioDot, { backgroundColor: colors.primary }]} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>КОЛИЧЕСТВО ВОПРОСОВ</Text>
        <View style={styles.limitRow}>
          {QUESTION_LIMITS.map(limit => {
            const active = config.maxQuestions === limit;
            return (
              <Pressable
                key={limit}
                onPress={() => setConfig({ maxQuestions: limit })}
                style={({ pressed }) => [
                  styles.limitButton,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.limitText, { color: active ? colors.primaryForeground : colors.foreground }]}>{limit}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.startWrap}>
          <Text style={[styles.countText, { color: colors.mutedForeground }]}> 
            В тест попадёт {actualQuestionCount} из {possibleQuestionCount} доступных комбинаций
          </Text>
          <Pressable
            onPress={handleStart}
            disabled={actualQuestionCount === 0}
            style={({ pressed }) => [
              styles.startButton,
              { backgroundColor: actualQuestionCount > 0 ? colors.primary : colors.muted },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.startButtonText, { color: colors.primaryForeground }]}>Начать тест</Text>
          </Pressable>
        </View>

        {history.length > 0 ? (
          <View style={styles.historySection}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ПОСЛЕДНИЕ РЕЗУЛЬТАТЫ</Text>
            {history.slice(0, 5).map(item => {
              const percent = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
              return (
                <View key={item.id} style={[styles.historyRow, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                  <View>
                    <Text style={[styles.historyScore, { color: colors.foreground }]}>{percent}%</Text>
                    <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{new Date(item.completedAt).toLocaleDateString('ru-RU')}</Text>
                  </View>
                  <Text style={[styles.historyMeta, { color: colors.mutedForeground }]}>{item.correct}/{item.total} · ошибок {item.total - item.correct}</Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  scroll: { padding: 16 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginTop: 18, marginBottom: 7, marginLeft: 4 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 7 },
  selectedCount: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  card: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  moodHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1 },
  moodHeaderText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.6 },
  moodHeaderAction: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  row: { minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, gap: 12 },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  rowSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  verbTextWrap: { flex: 1 },
  checkbox: { width: 23, height: 23, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  checkmark: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_700Bold', lineHeight: 18 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, gap: 8, overflow: 'visible' },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8 },
  chipText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  quickGroups: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  groupButton: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 },
  groupButtonText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  searchInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, fontFamily: 'Inter_400Regular', marginBottom: 10 },
  listHint: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 8, marginHorizontal: 4, lineHeight: 17 },
  radio: { width: 23, height: 23, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 11, height: 11, borderRadius: 6 },
  limitRow: { flexDirection: 'row', gap: 9 },
  limitButton: { flex: 1, borderWidth: 1, borderRadius: 11, paddingVertical: 12, alignItems: 'center' },
  limitText: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  startWrap: { marginTop: 24, alignItems: 'center', gap: 10 },
  countText: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  startButton: { width: '100%', borderRadius: 13, paddingVertical: 15, alignItems: 'center' },
  startButtonText: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  resumeCard: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 12 },
  resumeTextWrap: { gap: 3 },
  resumeTitle: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  resumeText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  resumeActions: { flexDirection: 'row', gap: 8 },
  smallButton: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  smallButtonText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  historySection: { marginTop: 10 },
  historyRow: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  historyScore: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  historyMeta: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  pressed: { opacity: 0.65 },
});
