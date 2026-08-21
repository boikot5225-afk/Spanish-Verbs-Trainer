import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import ConjugationTable from '../../components/ConjugationTable';
import { examplesFor } from '../../data/examples';
import { useVerbs } from '../../context/VerbsContext';
import type { Mood, Tense } from '../../data/types';
import {
  MOODS,
  MOOD_LABELS,
  speechParadigm,
  TENSE_FULL_LABELS,
  TENSE_LABELS,
  tensesByMood,
} from '../../data/types';
import { getVerbById } from '../../data/verbs';

const GROUP_LABELS: Record<string, string> = {
  '1': 'Первая группа · -ER',
  '2': 'Вторая группа · -IR (-iss-)',
  '3': 'Третья группа · неправильные',
};

export default function VerbDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { speak } = useVerbs();
  const [selectedMood, setSelectedMood] = useState<Mood>('indicatif');
  const [selectedTense, setSelectedTense] = useState<Tense>('present');

  const moodTenses = tensesByMood(selectedMood);

  const pickMood = (mood: Mood) => {
    setSelectedMood(mood);
    setSelectedTense(tensesByMood(mood)[0]!);
  };

  const verb = id ? getVerbById(id) : undefined;

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  if (!verb) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.errText, { color: colors.mutedForeground }]}>
          Глагол не найден
        </Text>
      </View>
    );
  }

  const isIrreg = verb.group === '3';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
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
          <Text style={[styles.headerInfinitive, { color: colors.foreground }]}>
            {verb.infinitive}
          </Text>
          <Text style={[styles.headerTranslation, { color: colors.mutedForeground }]}>
            {verb.translation}
          </Text>
        </View>

        <Pressable onPress={() => speak(verb.infinitive)} style={styles.ttsBtn} hitSlop={8}>
          <Ionicons name="volume-medium" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {/* Group badge */}
      <View style={[styles.badgeRow, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.groupBadge,
            {
              backgroundColor: isIrreg ? colors.irregularBg : colors.secondary,
              borderColor: isIrreg ? colors.irregular : colors.border,
            },
          ]}
        >
          <Text style={[styles.groupBadgeText, { color: isIrreg ? colors.irregular : colors.primary }]}>
            {GROUP_LABELS[verb.group] ?? verb.group}
          </Text>
        </View>
        {verb.irregularNote && (
          <Text style={[styles.noteText, { color: colors.mutedForeground }]} numberOfLines={2}>
            {verb.irregularNote}
          </Text>
        )}
      </View>

      {/* Mood selector */}
      <View style={[styles.moodRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {MOODS.map(mood => {
          const active = selectedMood === mood;
          return (
            <Pressable
              key={mood}
              onPress={() => pickMood(mood)}
              style={({ pressed }) => [
                styles.moodChip,
                {
                  backgroundColor: active ? colors.primary : colors.secondary,
                  borderColor: active ? colors.primary : colors.border,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text
                style={[
                  styles.moodChipText,
                  { color: active ? colors.background : colors.mutedForeground },
                ]}
              >
                {MOOD_LABELS[mood].split(' · ')[0]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tense Tabs */}
      <View style={[styles.tenseTabsOuter, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tenseTabs}
        >
          {moodTenses.map(tense => {
            const active = selectedTense === tense;
            return (
              <Pressable
                key={tense}
                onPress={() => setSelectedTense(tense)}
                style={({ pressed }) => [
                  styles.tenseTab,
                  active && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text
                  style={[
                    styles.tenseTabText,
                    { color: active ? colors.primary : colors.mutedForeground },
                    active && { fontFamily: 'Inter_600SemiBold' },
                  ]}
                >
                  {TENSE_LABELS[tense]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Conjugation Table */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}
      >
        <Text style={[styles.tenseCaption, { color: colors.mutedForeground }]}>
          {TENSE_FULL_LABELS[selectedTense]}
        </Text>

        <ConjugationTable verb={verb} tense={selectedTense} />

        {/* Примеры употребления — только для тех глаголов, где они есть */}
        {examplesFor(verb.id, selectedTense).length > 0 && (
          <View style={[styles.examples, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.examplesTitle, { color: colors.mutedForeground }]}>Примеры</Text>
            {examplesFor(verb.id, selectedTense).map((example, index) => (
              <View
                key={example.fr}
                style={[
                  styles.exampleRow,
                  index > 0 && { borderTopWidth: 1, borderTopColor: colors.border },
                ]}
              >
                <Pressable onPress={() => speak(example.fr)}>
                  <Text style={[styles.exampleFr, { color: colors.foreground }]}>{example.fr}</Text>
                </Pressable>
                <Text style={[styles.exampleRu, { color: colors.mutedForeground }]}>{example.ru}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Неличные формы */}
        <View style={[styles.nonFinite, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {([
            ['Participe présent', verb.participePresent],
            ['Participe passé', verb.participePasse],
          ] as const).map(([label, form], index) => (
            <View
              key={label}
              style={[
                styles.nonFiniteRow,
                index === 0 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.pronoun, { color: colors.mutedForeground }]}>{label}</Text>
              <Text
                style={[
                  styles.nonFiniteForm,
                  form.irregular
                    ? { color: colors.irregular, fontFamily: 'Inter_600SemiBold' }
                    : { color: colors.foreground, fontFamily: 'Inter_500Medium' },
                ]}
              >
                {form.form}
              </Text>
            </View>
          ))}
        </View>

        {/* Irregular legend */}
        <View style={[styles.legend, { backgroundColor: colors.irregularBg, borderColor: colors.irregular }]}>
          <Text style={[styles.legendText, { color: colors.irregular }]}>
            ★ — неправильная (нестандартная) форма
          </Text>
        </View>

        {/* Pronounce button */}
        <Pressable
          onPress={() => {
            // С местоимениями: без них лицо на слух не различить,
            // а лиезон (nous allons, ils ont) вообще не возникает.
            speak(speechParadigm(selectedTense, verb.conjugations[selectedTense]));
          }}
          style={({ pressed }) => [
            styles.pronounceBtn,
            { backgroundColor: colors.secondary, borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="volume-medium" size={18} color={colors.primary} />
          <Text style={[styles.pronounceBtnText, { color: colors.primary }]}>
            Озвучить формы
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  examples: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  examplesTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingTop: 12,
    paddingBottom: 6,
  },
  exampleRow: {
    paddingVertical: 10,
  },
  exampleFr: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    lineHeight: 21,
  },
  exampleRu: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 19,
    marginTop: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerInfinitive: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  headerTranslation: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  ttsBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    flexWrap: 'wrap',
  },
  groupBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  groupBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  noteText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  moodChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  moodChipText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  tenseCaption: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginBottom: -4,
  },
  nonFinite: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nonFiniteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  nonFiniteForm: {
    fontSize: 16,
    textAlign: 'right',
  },
  pronoun: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  tenseTabsOuter: {
    borderBottomWidth: 1,
  },
  tenseTabs: {
    paddingHorizontal: 12,
    flexDirection: 'row',
  },
  tenseTab: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tenseTabText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  legend: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  pronounceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  pronounceBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  errText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
    fontFamily: 'Inter_400Regular',
  },
});
