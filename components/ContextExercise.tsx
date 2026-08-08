import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  InteractionManager,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import { ACCENT_MODE_HINTS, type AccentMode } from '@/data/answer';
import { personLabels, TENSE_FULL_LABELS, type QuizQuestion, type Verb } from '@/data/types';
import type { ContextQuizMode } from '@/data/exercise-questions';

interface ContextExerciseProps {
  mode: ContextQuizMode;
  question: QuizQuestion;
  verb: Verb;
  accentMode: AccentMode;
  isChecked: boolean;
  isCorrect: boolean;
  accentNote: boolean;
  typoHint: boolean;
  onCheck: (answer: string) => void;
  onNext: () => void;
  isLast: boolean;
}

const INPUT_MODES: ReadonlySet<ContextQuizMode> = new Set([
  'fill-blank',
  'error-correction',
]);

export function ContextExercise({
  mode,
  question,
  verb,
  accentMode,
  isChecked,
  isCorrect,
  accentNote,
  typoHint,
  onCheck,
  onNext,
  isLast,
}: ContextExerciseProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<number[]>([]);
  const inputRef = useRef<TextInput>(null);
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  useEffect(() => {
    if (!INPUT_MODES.has(mode)) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const task = InteractionManager.runAfterInteractions(() => {
      timer = setTimeout(() => inputRef.current?.focus(), 150);
    });
    return () => {
      task.cancel();
      if (timer) clearTimeout(timer);
    };
  }, [mode]);

  const tokens = question.tokens ?? [];
  const selectedSet = useMemo(() => new Set(selectedTokens), [selectedTokens]);
  const assembled = selectedTokens.map(index => tokens[index]).filter(Boolean).join(' ');
  const expectedDisplay = mode === 'word-order'
    ? question.solutionText ?? question.correctAnswer
    : question.correctAnswer;

  const header = (
    <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.verb, { color: colors.foreground }]}>{verb.infinitive}</Text>
      <Text style={[styles.translation, { color: colors.mutedForeground }]}>{verb.translation}</Text>
      {mode === 'contrast' || mode === 'word-order' ? (
        <View style={[styles.chip, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.chipText, { color: colors.primary }]}>
            {mode === 'contrast' ? 'Контекст · выберите форму' : 'Порядок слов'}
          </Text>
        </View>
      ) : (
        <View style={styles.chipRow}>
          <View style={[styles.chip, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.chipText, { color: colors.primary }]}>
              {TENSE_FULL_LABELS[question.tense]}
            </Text>
          </View>
          <View style={[styles.chip, { backgroundColor: colors.muted }]}>
            <Text style={[styles.chipText, { color: colors.mutedForeground }]}>
              {personLabels(question.tense)[question.person]}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const context = question.context ? (
    <View style={[styles.contextCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.contextText, { color: colors.foreground }]}>{question.context}</Text>
      {question.contextTranslation ? (
        <Text style={[styles.contextTranslation, { color: colors.mutedForeground }]}>
          {question.contextTranslation}
        </Text>
      ) : null}
    </View>
  ) : null;

  const feedback = isChecked ? (
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
        {isCorrect ? (accentNote ? 'Верно, но проверьте диакритику' : 'Верно!') : 'Неверно'}
      </Text>
      {(!isCorrect || accentNote) ? (
        <Text style={[styles.correctAnswer, { color: colors.foreground }]}>{expectedDisplay}</Text>
      ) : null}
      {question.solutionText && mode !== 'word-order' ? (
        <Text style={[styles.solution, { color: colors.mutedForeground }]}>
          {question.solutionText}
        </Text>
      ) : null}
    </View>
  ) : null;

  const nextButton = isChecked ? (
    <Pressable
      onPress={onNext}
      style={({ pressed }) => [
        styles.nextButton,
        { backgroundColor: colors.primary },
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={[styles.nextButtonText, { color: colors.primaryForeground }]}>
        {isLast ? 'Завершить' : 'Далее'}
      </Text>
    </Pressable>
  ) : null;

  if (mode === 'contrast') {
    return (
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}>
        {header}
        <Text style={[styles.prompt, { color: colors.mutedForeground }]}>
          Какая форма подходит по смыслу предложения?
        </Text>
        {context}
        <View style={styles.optionsRow}>
          {(question.options ?? [question.correctAnswer]).map(option => {
            const selected = selectedOption === option;
            const right = isChecked && option === question.correctAnswer;
            const wrong = isChecked && selected && !right;
            return (
              <Pressable
                key={option}
                disabled={isChecked}
                onPress={() => {
                  setSelectedOption(option);
                  onCheck(option);
                }}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: right ? '#ECFDF5' : wrong ? '#FEF2F2' : colors.card,
                    borderColor: right
                      ? colors.success
                      : wrong
                        ? colors.destructive
                        : selected
                          ? colors.primary
                          : colors.border,
                  },
                  pressed && !isChecked && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: right ? colors.success : wrong ? colors.destructive : colors.foreground },
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {feedback}
        {nextButton}
      </ScrollView>
    );
  }

  if (mode === 'word-order') {
    return (
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}>
        {header}
        <Text style={[styles.prompt, { color: colors.mutedForeground }]}>Соберите предложение:</Text>
        {question.contextTranslation ? (
          <Text style={[styles.orderTranslation, { color: colors.mutedForeground }]}>
            {question.contextTranslation}
          </Text>
        ) : null}

        <View style={[styles.answerBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {selectedTokens.length === 0 ? (
            <Text style={[styles.answerPlaceholder, { color: colors.mutedForeground }]}>Нажимайте слова по порядку</Text>
          ) : (
            <View style={styles.tokenWrap}>
              {selectedTokens.map(index => (
                <Pressable
                  key={`selected-${index}`}
                  disabled={isChecked}
                  onPress={() => setSelectedTokens(current => current.filter(item => item !== index))}
                  style={[styles.selectedToken, { backgroundColor: colors.secondary, borderColor: colors.primary }]}
                >
                  <Text style={[styles.tokenText, { color: colors.primary }]}>{tokens[index]}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.tokenWrap}>
          {tokens.map((token, index) => selectedSet.has(index) ? null : (
            <Pressable
              key={`pool-${index}`}
              disabled={isChecked}
              onPress={() => setSelectedTokens(current => [...current, index])}
              style={({ pressed }) => [
                styles.poolToken,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { opacity: 0.65 },
              ]}
            >
              <Text style={[styles.tokenText, { color: colors.foreground }]}>{token}</Text>
            </Pressable>
          ))}
        </View>

        {!isChecked ? (
          <View style={styles.orderActions}>
            <Pressable
              onPress={() => setSelectedTokens([])}
              disabled={selectedTokens.length === 0}
              style={({ pressed }) => [
                styles.clearButton,
                { borderColor: colors.border, opacity: selectedTokens.length === 0 ? 0.45 : 1 },
                pressed && { opacity: 0.65 },
              ]}
            >
              <Text style={[styles.clearButtonText, { color: colors.mutedForeground }]}>Сбросить</Text>
            </Pressable>
            <Pressable
              onPress={() => onCheck(assembled)}
              disabled={tokens.length === 0 || selectedTokens.length !== tokens.length}
              style={({ pressed }) => [
                styles.checkButton,
                {
                  backgroundColor:
                    tokens.length > 0 && selectedTokens.length === tokens.length
                      ? colors.primary
                      : colors.muted,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text
                style={[
                  styles.checkButtonText,
                  {
                    color:
                      tokens.length > 0 && selectedTokens.length === tokens.length
                        ? colors.primaryForeground
                        : colors.mutedForeground,
                  },
                ]}
              >
                Проверить
              </Text>
            </Pressable>
          </View>
        ) : null}
        {feedback}
        {nextButton}
      </ScrollView>
    );
  }

  const prompt = mode === 'fill-blank'
    ? 'Заполните пропуск правильной формой:'
    : 'Найдите ошибочную форму и исправьте её:';

  return (
    <KeyboardAwareScrollViewCompat
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}
      keyboardShouldPersistTaps="handled"
      bottomOffset={20}
    >
      {header}
      <Text style={[styles.prompt, { color: colors.mutedForeground }]}>{prompt}</Text>
      {context}
      <TextInput
        ref={inputRef}
        autoFocus
        showSoftInputOnFocus
        defaultValue=""
        autoComplete="off"
        importantForAutofill="no"
        spellCheck={false}
        onChangeText={setInputValue}
        placeholder="Введите форму..."
        placeholderTextColor={colors.mutedForeground}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isChecked}
        returnKeyType="done"
        onSubmitEditing={() => {
          if (!isChecked && inputValue.trim()) onCheck(inputValue.trim());
        }}
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            color: colors.foreground,
            borderColor: isChecked
              ? isCorrect
                ? colors.success
                : colors.destructive
              : colors.border,
          },
        ]}
      />
      <Text style={[styles.hint, { color: colors.mutedForeground }]}>
        {ACCENT_MODE_HINTS[accentMode]}
      </Text>
      {typoHint ? (
        <View style={[styles.typo, { backgroundColor: colors.irregularBg, borderColor: colors.irregular }]}>
          <Text style={[styles.typoText, { color: colors.irregular }]}>
            Похоже на опечатку. Поправьте ответ и проверьте ещё раз — ошибка пока не засчитана.
          </Text>
        </View>
      ) : null}
      {!isChecked ? (
        <Pressable
          disabled={!inputValue.trim()}
          onPress={() => inputValue.trim() && onCheck(inputValue.trim())}
          style={({ pressed }) => [
            styles.checkButton,
            { backgroundColor: inputValue.trim() ? colors.primary : colors.muted },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text
            style={[
              styles.checkButtonText,
              { color: inputValue.trim() ? colors.primaryForeground : colors.mutedForeground },
            ]}
          >
            Проверить
          </Text>
        </Pressable>
      ) : null}
      {feedback}
      {nextButton}
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  headerCard: { borderWidth: 1, borderRadius: 14, padding: 18, alignItems: 'center', gap: 6 },
  verb: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  translation: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 4 },
  chipText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  prompt: { fontSize: 14, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  contextCard: { borderWidth: 1, borderRadius: 14, padding: 18, gap: 8 },
  contextText: { fontSize: 20, lineHeight: 29, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  contextTranslation: { fontSize: 13, lineHeight: 19, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  input: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 20, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  hint: { fontSize: 12, lineHeight: 17, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  typo: { borderWidth: 1, borderRadius: 10, padding: 10 },
  typoText: { fontSize: 13, lineHeight: 18, fontFamily: 'Inter_400Regular' },
  checkButton: { flex: 1, minHeight: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  checkButtonText: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  feedback: { borderWidth: 1, borderRadius: 12, padding: 14, alignItems: 'center', gap: 5 },
  feedbackTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  correctAnswer: { fontSize: 18, lineHeight: 25, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  solution: { fontSize: 13, lineHeight: 19, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  nextButton: { borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  nextButtonText: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  optionsRow: { flexDirection: 'row', gap: 10 },
  option: { flex: 1, borderWidth: 1.5, borderRadius: 12, paddingVertical: 17, paddingHorizontal: 10, alignItems: 'center' },
  optionText: { fontSize: 17, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  orderTranslation: { fontSize: 14, lineHeight: 20, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  answerBox: { minHeight: 92, borderWidth: 1.5, borderRadius: 14, padding: 12, justifyContent: 'center' },
  answerPlaceholder: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  tokenWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  selectedToken: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 9 },
  poolToken: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 9 },
  tokenText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  orderActions: { flexDirection: 'row', gap: 10 },
  clearButton: { minHeight: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  clearButtonText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
