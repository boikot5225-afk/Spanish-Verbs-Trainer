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
import { useVerbs } from '../../context/VerbsContext';
import type { Tense } from '../../data/types';
import { TENSES, TENSE_LABELS } from '../../data/types';
import { getVerbById } from '../../data/verbs';

const GROUP_LABELS: Record<string, string> = {
  ar: 'Правильный -AR',
  er: 'Правильный -ER',
  ir: 'Правильный -IR',
  irregular: 'Неправильный глагол',
};

export default function VerbDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { speak } = useVerbs();
  const [selectedTense, setSelectedTense] = useState<Tense>('presente');

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

  const isIrreg = verb.group === 'irregular';

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

      {/* Tense Tabs */}
      <View style={[styles.tenseTabsOuter, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tenseTabs}
        >
          {TENSES.map(tense => {
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
        <ConjugationTable verb={verb} tense={selectedTense} />

        {/* Irregular legend */}
        <View style={[styles.legend, { backgroundColor: colors.irregularBg, borderColor: colors.irregular }]}>
          <Text style={[styles.legendText, { color: colors.irregular }]}>
            ★ — неправильная (нестандартная) форма
          </Text>
        </View>

        {/* Pronounce button */}
        <Pressable
          onPress={() => {
            const forms = verb.conjugations[selectedTense];
            const allForms = forms.map(f => f.form).join(', ');
            speak(allForms);
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
