import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
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
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useQuiz } from '../context/QuizContext';
import { useVerbs } from '../context/VerbsContext';
import { questionLabels, questionPrompt } from '../data/types';
import { getVerbById } from '../data/verbs';
import { ACCENT_MODE_HINTS, checkAnswer } from '../data/answer';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';

export default function QuizSession() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { session, submitAnswer, advanceQuestion, config } = useQuiz();
  const { speak, speechEnabled, toggleSpeech } = useVerbs();

  const [inputValue, setInputValue] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  /** Ответ похож на опечатку — даём поправить, ошибку пока не засчитываем. */
  const [typoHint, setTypoHint] = useState(false);
  /** Верно, но с промахом по ударению. */
  const [accentNote, setAccentNote] = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  // Сброс состояния строго при смене вопроса. Сторож по индексу не даёт эффекту
  // сработать посреди набора. Поле ввода очищать отсюда не нужно: оно
  // пересоздаётся по key и фокусируется своим autoFocus.
  const lastIndexRef = useRef<number | null>(null);
  useEffect(() => {
    const index = session?.currentIndex ?? null;
    if (index === null || lastIndexRef.current === index) return;
    lastIndexRef.current = index;

    setInputValue('');
    setIsChecked(false);
    setIsCorrect(false);
    setSelectedOption(null);
    setIsFlipped(false);
    setTypoHint(false);
    setAccentNote(false);
    flipAnim.setValue(0);
  }, [session?.currentIndex, flipAnim]);

  // Навигация только из эффектов: переход в теле рендера конфликтует с теми,
  // что запускают обработчики.
  const outOfQuestions =
    !!session && session.currentIndex >= session.questions.length;

  useEffect(() => {
    if (!session) router.replace('/(tabs)/quiz');
    else if (outOfQuestions) router.replace('/quiz-results');
  }, [session, outOfQuestions]);

  if (!session || outOfQuestions) return null;

  const { questions, currentIndex, mode } = session;
  const question = questions[currentIndex];
  if (!question) return null;

  const verb = getVerbById(question.verbId);
  if (!verb) return null;

  const progress = (currentIndex / questions.length) * 100;
  const isLast = currentIndex === questions.length - 1;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleCheck = (answer: string) => {
    const verdict = checkAnswer(answer, question.correctAnswer, config.accentMode ?? 'warn');

    // Ответ разошёлся с правильным ровно на один символ — скорее всего промах
    // по клавише, а не незнание формы. Один раз предлагаем поправить.
    if (!verdict.correct && verdict.looksLikeTypo && !typoHint) {
      setTypoHint(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setTypoHint(false);
    setAccentNote(verdict.accentMismatch);
    setIsChecked(true);
    setIsCorrect(verdict.correct);
    submitAnswer(answer);
    // Правильную форму проговариваем всегда: услышать её важнее всего именно
    // в момент, когда ответ уже дан.
    if (speechEnabled) speak(question.correctAnswer);
    if (verdict.correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleOptionSelect = (opt: string) => {
    if (isChecked) return;
    setSelectedOption(opt);
    handleCheck(opt);
  };

  // Тест, запущенный из урока, и закрывать надо в урок, а не в конструктор теста.
  const lessonId = session.lessonId ?? session.exam?.lessonId ?? session.drill?.lessonId;

  const handleClose = () => {
    if (lessonId) router.replace(`/lesson/${lessonId}`);
    else router.replace('/(tabs)/quiz');
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      router.replace('/quiz-results');
    } else {
      advanceQuestion();
    }
  };

  const handleFlip = () => {
    if (isFlipped) return;
    setIsFlipped(true);
    if (speechEnabled) speak(question.correctAnswer);
    Animated.timing(flipAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleFlashcardAnswer = (knew: boolean) => {
    const answer = knew ? question.correctAnswer : '';
    submitAnswer(answer);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isLast) {
      router.replace('/quiz-results');
    } else {
      advanceQuestion();
    }
  };

  // ─── Shared UI elements ────────────────────────────────────────────────────

  const questionHeader = (
    <View style={[styles.questionHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.verbInfinitive, { color: colors.foreground }]}>
        {verb.infinitive}
      </Text>
      <Text style={[styles.verbTranslation, { color: colors.mutedForeground }]}>
        {verb.translation}
      </Text>
      <View style={styles.tensePersonRow}>
        <View style={[styles.chip, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.chipText, { color: colors.primary }]}>
            {questionLabels(question).form}
          </Text>
        </View>
        {questionLabels(question).person !== undefined && (
          <View style={[styles.chip, { backgroundColor: colors.muted }]}>
            <Text style={[styles.chipText, { color: colors.mutedForeground }]}>
              {questionLabels(question).person}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const resultFeedback = (
    <View
      style={[
        styles.feedback,
        {
          backgroundColor: isCorrect ? '#ECFDF5' : '#FEF2F2',
          borderColor: isCorrect ? colors.success : colors.destructive,
        },
      ]}
    >
      <Text style={[styles.feedbackTitle, { color: isCorrect ? colors.success : colors.destructive }]}>
        {isCorrect ? (accentNote ? 'Верно, но следите за ударением' : 'Верно!') : 'Неверно'}
      </Text>
      {isCorrect && accentNote && (
        <Text style={[styles.correctAnswer, { color: colors.foreground }]}>
          {question.correctAnswer}
        </Text>
      )}
      {!isCorrect && (
        <View style={styles.correctAnswerRow}>
          <Text style={[styles.correctLabel, { color: colors.mutedForeground }]}>
            Правильно:{' '}
          </Text>
          <Text style={[styles.correctAnswer, { color: colors.foreground }]}>
            {question.correctAnswer}
          </Text>
        </View>
      )}
    </View>
  );

  const nextButton = (
    <Pressable
      onPress={handleNext}
      style={({ pressed }) => [
        styles.nextBtn,
        { backgroundColor: colors.primary },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={[styles.nextBtnText, { color: colors.primaryForeground }]}>
        {isLast ? 'Завершить' : 'Далее'}
      </Text>
      <Ionicons
        name={isLast ? 'checkmark-circle' : 'arrow-forward'}
        size={20}
        color={colors.primaryForeground}
      />
    </Pressable>
  );

  // ─── Mode: Multiple Choice ─────────────────────────────────────────────────

  const renderMultipleChoice = () => (
    <ScrollView
      contentContainerStyle={[styles.modeContent, { paddingBottom: bottomPad + 20 }]}
      keyboardShouldPersistTaps="handled"
    >
      {questionHeader}
      <Text style={[styles.prompt, { color: colors.mutedForeground }]}>
        Выберите правильную форму:
      </Text>
      <View style={styles.optionsGrid}>
        {(question.options ?? [question.correctAnswer]).map(opt => {
          const isSelected = selectedOption === opt;
          const isWrong = isChecked && isSelected && !isCorrect;
          const isRight = isChecked && opt === question.correctAnswer;
          return (
            <Pressable
              key={opt}
              onPress={() => handleOptionSelect(opt)}
              disabled={isChecked}
              style={({ pressed }) => [
                styles.option,
                {
                  borderColor: isRight
                    ? colors.success
                    : isWrong
                    ? colors.destructive
                    : isSelected
                    ? colors.primary
                    : colors.border,
                  backgroundColor: isRight
                    ? '#ECFDF5'
                    : isWrong
                    ? '#FEF2F2'
                    : colors.card,
                },
                pressed && !isChecked && { opacity: 0.7 },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isRight
                      ? colors.success
                      : isWrong
                      ? colors.destructive
                      : colors.foreground,
                  },
                ]}
              >
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {isChecked && (
        <>
          {resultFeedback}
          {nextButton}
        </>
      )}
    </ScrollView>
  );

  // ─── Mode: Input ───────────────────────────────────────────────────────────

  const renderInput = () => (
    <KeyboardAwareScrollViewCompat
      contentContainerStyle={[styles.modeContent, { paddingBottom: bottomPad + 20 }]}
      keyboardShouldPersistTaps="handled"
      bottomOffset={20}
    >
      {questionHeader}
      <Text style={[styles.prompt, { color: colors.mutedForeground }]}>
        {questionPrompt(question)}
      </Text>
      <TextInput
        // Новое поле на каждый вопрос. Раньше EditText переиспользовался: React
        // затирал его текст в '', а composing-сессия клавиатуры оставалась от
        // прошлого вопроса — в подсказках висело «recibimos», когда на экране
        // уже был vivir, и набранное до поля не доходило.
        key={`answer-${currentIndex}`}
        ref={inputRef}
        autoFocus
        // Неконтролируемое поле: RN не переписывает набранное своим value, так
        // что рассинхрону с клавиатурой взяться неоткуда.
        defaultValue=""
        autoComplete="off"
        importantForAutofill="no"
        spellCheck={false}
        style={[
          styles.textInput,
          {
            borderColor: isChecked
              ? isCorrect
                ? colors.success
                : colors.destructive
              : colors.border,
            backgroundColor: colors.card,
            color: colors.foreground,
          },
        ]}
        onChangeText={setInputValue}
        placeholder="Введите форму..."
        placeholderTextColor={colors.mutedForeground}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isChecked}
        returnKeyType="done"
        onSubmitEditing={() => {
          if (!isChecked && inputValue.trim()) handleCheck(inputValue.trim());
        }}
      />
      <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
        {ACCENT_MODE_HINTS[config.accentMode ?? 'warn']}
      </Text>

      {typoHint && (
        <View style={[styles.typoHint, { backgroundColor: colors.irregularBg, borderColor: colors.irregular }]}>
          <Ionicons name="alert-circle-outline" size={18} color={colors.irregular} />
          <Text style={[styles.typoHintText, { color: colors.irregular }]}>
            Похоже на опечатку — не хватает или лишний один символ. Поправьте
            и нажмите «Проверить» ещё раз; ошибка пока не засчитана.
          </Text>
        </View>
      )}
      {!isChecked && (
        <Pressable
          onPress={() => {
            if (inputValue.trim()) handleCheck(inputValue.trim());
          }}
          disabled={!inputValue.trim()}
          style={({ pressed }) => [
            styles.checkBtn,
            {
              backgroundColor: inputValue.trim() ? colors.primary : colors.muted,
            },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={[styles.checkBtnText, { color: inputValue.trim() ? colors.primaryForeground : colors.mutedForeground }]}>
            Проверить
          </Text>
        </Pressable>
      )}
      {isChecked && (
        <>
          {resultFeedback}
          {nextButton}
        </>
      )}
    </KeyboardAwareScrollViewCompat>
  );

  // ─── Mode: Flashcard ───────────────────────────────────────────────────────

  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });

  const renderFlashcard = () => (
    <ScrollView
      contentContainerStyle={[styles.modeContent, { paddingBottom: bottomPad + 20 }]}
    >
      <Pressable onPress={handleFlip} style={styles.cardContainer} disabled={isFlipped}>
        {/* Front */}
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: frontOpacity },
            !isFlipped && styles.cardAbsolute,
          ]}
          pointerEvents={isFlipped ? 'none' : 'auto'}
        >
          <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>
            {[questionLabels(question).form, questionLabels(question).person].filter(Boolean).join(' · ')}
          </Text>
          <Text style={[styles.cardVerb, { color: colors.foreground }]}>
            {verb.infinitive}
          </Text>
          <Text style={[styles.cardTranslation, { color: colors.mutedForeground }]}>
            {verb.translation}
          </Text>
          <Text style={[styles.tapHint, { color: colors.mutedForeground }]}>
            Нажмите, чтобы перевернуть
          </Text>
        </Animated.View>

        {/* Back */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            { backgroundColor: colors.secondary, borderColor: colors.primary, opacity: backOpacity },
          ]}
          pointerEvents={isFlipped ? 'auto' : 'none'}
        >
          <Text style={[styles.cardLabel, { color: colors.primary }]}>
            {[questionLabels(question).form, questionLabels(question).person].filter(Boolean).join(' · ')}
          </Text>
          <Text style={[styles.cardAnswer, { color: colors.foreground }]}>
            {question.correctAnswer}
          </Text>
          <Text style={[styles.cardTranslation, { color: colors.mutedForeground }]}>
            {verb.infinitive} — {verb.translation}
          </Text>
        </Animated.View>
      </Pressable>

      {isFlipped && (
        <View style={styles.flashcardButtons}>
          <Pressable
            onPress={() => handleFlashcardAnswer(false)}
            style={({ pressed }) => [
              styles.flashBtn,
              { backgroundColor: '#FEF2F2', borderColor: colors.destructive },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="close" size={22} color={colors.destructive} />
            <Text style={[styles.flashBtnText, { color: colors.destructive }]}>Не знал</Text>
          </Pressable>
          <Pressable
            onPress={() => handleFlashcardAnswer(true)}
            style={({ pressed }) => [
              styles.flashBtn,
              { backgroundColor: '#ECFDF5', borderColor: colors.success },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="checkmark" size={22} color={colors.success} />
            <Text style={[styles.flashBtnText, { color: colors.success }]}>Знал</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );

  // ─── Layout ────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Progress bar + header */}
      <View
        style={[
          styles.topBar,
          { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <Pressable onPress={handleClose} hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.mutedForeground} />
        </Pressable>
        <View style={styles.progressWrap}>
          <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
            <View style={[styles.progressFill, { width: `${progress}%` as any, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: colors.mutedForeground }]}>
            {currentIndex + 1} / {questions.length}
          </Text>
        </View>
        <Pressable onPress={toggleSpeech} hitSlop={8}>
          <Ionicons
            name={speechEnabled ? 'volume-medium' : 'volume-mute-outline'}
            size={22}
            color={speechEnabled ? colors.primary : colors.mutedForeground}
          />
        </Pressable>
      </View>

      {mode === 'input' && renderInput()}
      {mode === 'multiple-choice' && renderMultipleChoice()}
      {mode === 'flashcard' && renderFlashcard()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  progressWrap: {
    flex: 1,
    gap: 4,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    textAlign: 'right',
  },
  modeContent: {
    padding: 16,
    gap: 12,
  },
  questionHeader: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    gap: 6,
  },
  verbInfinitive: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
  },
  verbTranslation: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  tensePersonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  prompt: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  option: {
    width: '47%',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 20,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  typoHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  typoHintText: { flex: 1, fontSize: 13, lineHeight: 18, fontFamily: 'Inter_400Regular' },
  hintText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  checkBtn: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  feedback: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 4,
    alignItems: 'center',
  },
  feedbackTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  correctAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  correctLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  correctAnswer: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  nextBtnText: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
  },
  // Flashcard
  cardContainer: {
    height: 280,
    position: 'relative',
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 280,
  },
  cardAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  cardBack: {
    borderWidth: 2,
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  cardVerb: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  cardAnswer: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  cardTranslation: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 8,
  },
  flashcardButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  flashBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  flashBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
});
