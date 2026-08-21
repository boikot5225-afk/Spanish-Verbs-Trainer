import React, { useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, Stack } from 'expo-router';
import * as Speech from 'expo-speech';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import {
  NUMBER_RANGES,
  formatNumber,
  frenchNumberToWords,
  normalizeFrenchNumberAnswer,
  parseNumberDigits,
  randomNumberForRange,
  type NumberRangeId,
} from '../data/french-numbers';

type ModeId = 'digits-to-words' | 'words-to-digits' | 'audio-to-digits';

type Feedback = {
  correct: boolean;
  answer: string;
};

type StoredStats = {
  bestStreak: number;
  totalCorrect: number;
  totalAttempts: number;
};

const STORAGE_KEY = 'numbers-trainer-stats-v1';

const MODES: Array<{
  id: ModeId;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}> = [
  {
    id: 'digits-to-words',
    title: 'Цифры → слова',
    subtitle: 'Напиши число по-французски',
    icon: 'create-outline',
  },
  {
    id: 'words-to-digits',
    title: 'Слова → цифры',
    subtitle: 'Распознай написанное число',
    icon: 'text-outline',
  },
  {
    id: 'audio-to-digits',
    title: 'На слух',
    subtitle: 'Прослушай и введи цифры',
    icon: 'volume-high-outline',
  },
];

const INITIAL_STATS: StoredStats = {
  bestStreak: 0,
  totalCorrect: 0,
  totalAttempts: 0,
};

export default function NumbersTrainerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<ModeId>('digits-to-words');
  const [rangeId, setRangeId] = useState<NumberRangeId>('seventy');
  const [number, setNumber] = useState(() => randomNumberForRange('seventy'));
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [inputError, setInputError] = useState('');
  const [streak, setStreak] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionAttempts, setSessionAttempts] = useState(0);
  const [stats, setStats] = useState<StoredStats>(INITIAL_STATS);

  const words = useMemo(() => frenchNumberToWords(number), [number]);
  const topPadding = Platform.OS === 'web' ? 24 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 32 : insets.bottom + 24;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as Partial<StoredStats>;
        setStats({
          bestStreak: Number(parsed.bestStreak) || 0,
          totalCorrect: Number(parsed.totalCorrect) || 0,
          totalAttempts: Number(parsed.totalAttempts) || 0,
        });
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (mode !== 'audio-to-digits') return;
    const timer = setTimeout(() => speakNumber(), 180);
    return () => clearTimeout(timer);
    // `words` changes exactly when the generated number changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, words]);

  function speakNumber() {
    void Speech.stop();
    Speech.speak(words, {
      language: 'fr-FR',
      rate: 0.82,
      pitch: 1,
    });
  }

  function persistStats(next: StoredStats) {
    setStats(next);
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function recordAttempt(correct: boolean) {
    const nextStreak = correct ? streak + 1 : 0;
    setStreak(nextStreak);
    setSessionAttempts(value => value + 1);
    if (correct) setSessionCorrect(value => value + 1);

    persistStats({
      bestStreak: Math.max(stats.bestStreak, nextStreak),
      totalCorrect: stats.totalCorrect + (correct ? 1 : 0),
      totalAttempts: stats.totalAttempts + 1,
    });
  }

  function expectedAnswer() {
    return mode === 'digits-to-words' ? words : formatNumber(number);
  }

  function isCorrectAnswer() {
    if (mode === 'digits-to-words') {
      return normalizeFrenchNumberAnswer(input) === normalizeFrenchNumberAnswer(words);
    }
    return parseNumberDigits(input) === number;
  }

  function checkAnswer() {
    if (feedback) {
      nextQuestion();
      return;
    }

    if (!input.trim()) {
      setInputError('Введи ответ.');
      return;
    }

    if (mode !== 'digits-to-words' && parseNumberDigits(input) === null) {
      setInputError('Нужны только цифры от 0 до 999 999.');
      return;
    }

    Keyboard.dismiss();
    setInputError('');
    const correct = isCorrectAnswer();
    setFeedback({ correct, answer: expectedAnswer() });
    recordAttempt(correct);
    void Haptics.notificationAsync(
      correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error,
    );
  }

  function revealAnswer() {
    if (feedback) return;
    Keyboard.dismiss();
    setInputError('');
    setFeedback({ correct: false, answer: expectedAnswer() });
    recordAttempt(false);
  }

  function nextQuestion(nextRange: NumberRangeId = rangeId) {
    setNumber(previous => randomNumberForRange(nextRange, previous));
    setInput('');
    setFeedback(null);
    setInputError('');
  }

  function changeMode(nextMode: ModeId) {
    setMode(nextMode);
    setInput('');
    setFeedback(null);
    setInputError('');
  }

  function changeRange(nextRange: NumberRangeId) {
    setRangeId(nextRange);
    nextQuestion(nextRange);
  }

  const prompt =
    mode === 'digits-to-words'
      ? formatNumber(number)
      : mode === 'words-to-digits'
        ? words
        : 'Прослушай число';

  const placeholder = mode === 'digits-to-words' ? 'например: quatre-vingt-un' : 'например: 81';
  const keyboardType = mode === 'digits-to-words' ? 'default' : 'number-pad';
  const accuracy = sessionAttempts === 0 ? 0 : Math.round((sessionCorrect / sessionAttempts) * 100);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            {
              paddingTop: topPadding + 8,
              backgroundColor: colors.background,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <Ionicons name="chevron-back" size={27} color={colors.primary} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.foreground }]}>Числительные</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>0–999 999 · три режима</Text>
          </View>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
        >
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{streak}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>серия</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{accuracy}%</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>точность</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stats.bestStreak}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>лучшая серия</Text>
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>РЕЖИМ</Text>
          <View style={styles.modeList}>
            {MODES.map(item => {
              const active = mode === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => changeMode(item.id)}
                  style={({ pressed }) => [
                    styles.modeCard,
                    {
                      backgroundColor: active ? colors.secondary : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                    pressed && { opacity: 0.72 },
                  ]}
                >
                  <View
                    style={[
                      styles.modeIcon,
                      { backgroundColor: active ? colors.card : colors.muted },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={active ? colors.primary : colors.mutedForeground}
                    />
                  </View>
                  <View style={styles.modeText}>
                    <Text style={[styles.modeTitle, { color: colors.foreground }]}>{item.title}</Text>
                    <Text style={[styles.modeSubtitle, { color: colors.mutedForeground }]}>{item.subtitle}</Text>
                  </View>
                  {active ? <Ionicons name="checkmark-circle" size={21} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ДИАПАЗОН</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rangeRow}>
            {NUMBER_RANGES.map(range => {
              const active = range.id === rangeId;
              return (
                <Pressable
                  key={range.id}
                  onPress={() => changeRange(range.id)}
                  style={({ pressed }) => [
                    styles.rangeChip,
                    {
                      backgroundColor: active ? colors.primary : colors.card,
                      borderColor: active ? colors.primary : colors.border,
                    },
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <Text
                    style={[
                      styles.rangeText,
                      { color: active ? colors.primaryForeground : colors.foreground },
                    ]}
                  >
                    {range.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.questionEyebrow, { color: colors.mutedForeground }]}>ЗАДАНИЕ</Text>

            {mode === 'audio-to-digits' ? (
              <Pressable
                onPress={speakNumber}
                style={({ pressed }) => [
                  styles.audioButton,
                  { backgroundColor: colors.secondary, borderColor: colors.primary },
                  pressed && { opacity: 0.72 },
                ]}
              >
                <Ionicons name="volume-high" size={30} color={colors.primary} />
                <Text style={[styles.audioText, { color: colors.primary }]}>Прослушать ещё раз</Text>
              </Pressable>
            ) : (
              <Text style={[styles.prompt, { color: colors.foreground }]}>{prompt}</Text>
            )}

            {mode === 'audio-to-digits' ? (
              <Text style={[styles.audioHint, { color: colors.mutedForeground }]}>Число произносится по-французски.</Text>
            ) : null}

            <TextInput
              value={input}
              onChangeText={value => {
                setInput(value);
                if (inputError) setInputError('');
              }}
              placeholder={placeholder}
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType={keyboardType}
              editable={!feedback}
              returnKeyType={feedback ? 'next' : 'done'}
              onSubmitEditing={checkAnswer}
              style={[
                styles.input,
                {
                  color: colors.foreground,
                  backgroundColor: colors.background,
                  borderColor: inputError
                    ? colors.destructive
                    : feedback?.correct
                      ? colors.success
                      : colors.input,
                },
              ]}
            />

            {inputError ? <Text style={[styles.inputError, { color: colors.destructive }]}>{inputError}</Text> : null}

            {feedback ? (
              <View
                style={[
                  styles.feedback,
                  {
                    backgroundColor: feedback.correct ? colors.secondary : colors.muted,
                    borderColor: feedback.correct ? colors.success : colors.destructive,
                  },
                ]}
              >
                <Ionicons
                  name={feedback.correct ? 'checkmark-circle' : 'close-circle'}
                  size={22}
                  color={feedback.correct ? colors.success : colors.destructive}
                />
                <View style={styles.feedbackText}>
                  <Text style={[styles.feedbackTitle, { color: colors.foreground }]}>
                    {feedback.correct ? 'Верно' : 'Неверно'}
                  </Text>
                  <Text style={[styles.feedbackAnswer, { color: colors.mutedForeground }]}>
                    {feedback.correct ? 'Ответ принят.' : `Правильно: ${feedback.answer}`}
                  </Text>
                </View>
              </View>
            ) : null}

            <Pressable
              onPress={checkAnswer}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.82 },
              ]}
            >
              <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
                {feedback ? 'Следующее число' : 'Проверить'}
              </Text>
              <Ionicons
                name={feedback ? 'arrow-forward' : 'checkmark'}
                size={19}
                color={colors.primaryForeground}
              />
            </Pressable>

            {!feedback ? (
              <Pressable
                onPress={revealAnswer}
                style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.62 }]}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.mutedForeground }]}>Не знаю — показать ответ</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={[styles.ruleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.ruleHeader}>
              <Ionicons name="bulb-outline" size={20} color={colors.accent} />
              <Text style={[styles.ruleTitle, { color: colors.foreground }]}>Где чаще всего ошибаются</Text>
            </View>
            <Text style={[styles.ruleLine, { color: colors.foreground }]}>71 — soixante et onze</Text>
            <Text style={[styles.ruleLine, { color: colors.foreground }]}>80 — quatre-vingts</Text>
            <Text style={[styles.ruleLine, { color: colors.foreground }]}>81 — quatre-vingt-un</Text>
            <Text style={[styles.ruleLine, { color: colors.foreground }]}>200 — deux cents, но 201 — deux cent un</Text>
            <Text style={[styles.ruleNote, { color: colors.mutedForeground }]}>В режиме «цифры → слова» пробелы и дефисы считаются равнозначными, диакритика тоже не мешает проверке.</Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  subtitle: { marginTop: 2, fontSize: 12, fontFamily: 'Inter_400Regular' },
  content: { padding: 16, gap: 14 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center' },
  statValue: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  statLabel: { marginTop: 2, textAlign: 'center', fontSize: 10, lineHeight: 13, fontFamily: 'Inter_400Regular' },
  sectionLabel: { marginLeft: 4, fontSize: 11, letterSpacing: 0.8, fontFamily: 'Inter_600SemiBold' },
  modeList: { gap: 8 },
  modeCard: { minHeight: 66, borderWidth: 1, borderRadius: 12, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 11 },
  modeIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modeText: { flex: 1, gap: 2 },
  modeTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  modeSubtitle: { fontSize: 11, lineHeight: 15, fontFamily: 'Inter_400Regular' },
  rangeRow: { gap: 8, paddingRight: 8 },
  rangeChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 },
  rangeText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  questionCard: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 },
  questionEyebrow: { fontSize: 10, letterSpacing: 0.9, fontFamily: 'Inter_600SemiBold' },
  prompt: { fontSize: 28, lineHeight: 37, textAlign: 'center', fontFamily: 'Inter_700Bold', paddingVertical: 12 },
  audioButton: { minHeight: 112, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 8 },
  audioText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  audioHint: { textAlign: 'center', fontSize: 11, fontFamily: 'Inter_400Regular' },
  input: { minHeight: 52, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, fontSize: 17, fontFamily: 'Inter_500Medium' },
  inputError: { marginTop: -5, fontSize: 11, fontFamily: 'Inter_400Regular' },
  feedback: { borderWidth: 1, borderRadius: 12, padding: 11, flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  feedbackText: { flex: 1, gap: 2 },
  feedbackTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  feedbackAnswer: { fontSize: 12, lineHeight: 17, fontFamily: 'Inter_400Regular' },
  primaryButton: { minHeight: 50, borderRadius: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryButtonText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  secondaryButton: { alignItems: 'center', paddingVertical: 7 },
  secondaryButtonText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  ruleCard: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 7 },
  ruleHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  ruleTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  ruleLine: { fontSize: 13, lineHeight: 19, fontFamily: 'Inter_500Medium' },
  ruleNote: { marginTop: 3, fontSize: 11, lineHeight: 16, fontFamily: 'Inter_400Regular' },
});
