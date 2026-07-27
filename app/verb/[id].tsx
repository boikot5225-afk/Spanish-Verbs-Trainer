import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import ConjugationTable from '../../components/ConjugationTable';
import { useVerbs } from '../../context/VerbsContext';
import type { Tense } from '../../data/types';
import {
  TENSE_DEFINITIONS,
  TENSE_DESCRIPTIONS,
  TENSE_FULL_LABELS,
  TENSE_GROUPS,
  TENSE_LABELS,
} from '../../data/types';
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
  const [pickerOpen, setPickerOpen] = useState(false);

  const verb = id ? getVerbById(id) : undefined;
  const selectedDefinition = useMemo(
    () => TENSE_DEFINITIONS.find(item => item.id === selectedTense),
    [selectedTense],
  );

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  if (!verb) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}> 
        <Text style={[styles.errText, { color: colors.mutedForeground }]}>Глагол не найден</Text>
      </View>
    );
  }

  const isIrreg = verb.group === 'irregular';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}> 
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerInfinitive, { color: colors.foreground }]}>{verb.infinitive}</Text>
          <Text style={[styles.headerTranslation, { color: colors.mutedForeground }]}>{verb.translation}</Text>
        </View>
        <Pressable onPress={() => speak(verb.infinitive)} style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="volume-medium" size={24} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}> 
        <View style={styles.badgeRow}>
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
        </View>

        <Pressable
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => [
            styles.tenseSelector,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.75 },
          ]}
        >
          <View style={styles.tenseSelectorText}>
            <Text style={[styles.tenseSelectorLabel, { color: colors.mutedForeground }]}>ВРЕМЯ И НАКЛОНЕНИЕ</Text>
            <Text style={[styles.tenseSelectorTitle, { color: colors.foreground }]}> 
              {TENSE_FULL_LABELS[selectedTense]}
            </Text>
            <Text style={[styles.tenseSelectorDescription, { color: colors.mutedForeground }]}> 
              {TENSE_DESCRIPTIONS[selectedTense]}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={colors.primary} />
        </Pressable>

        <ConjugationTable verb={verb} tense={selectedTense} />

        <View style={[styles.legend, { backgroundColor: colors.irregularBg, borderColor: colors.irregular }]}> 
          <Text style={[styles.legendText, { color: colors.irregular }]}>★ — форма отличается от регулярной модели</Text>
        </View>

        <Pressable
          onPress={() => {
            const allForms = verb.conjugations[selectedTense]
              .filter(form => form.available !== false && form.form !== '—')
              .map(form => form.form)
              .join(', ');
            speak(allForms);
          }}
          style={({ pressed }) => [
            styles.pronounceBtn,
            { backgroundColor: colors.secondary, borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="volume-medium" size={18} color={colors.primary} />
          <Text style={[styles.pronounceBtnText, { color: colors.primary }]}>Озвучить формы</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setPickerOpen(false)} />
          <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: bottomPad + 12 }]}> 
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Все времена</Text>
                <Text style={[styles.sheetSubtitle, { color: colors.mutedForeground }]}>17 времён и форм наклонения</Text>
              </View>
              <Pressable onPress={() => setPickerOpen(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.foreground} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.sheetContent}>
              {TENSE_GROUPS.map(group => (
                <View key={group.mood} style={styles.groupSection}>
                  <Text style={[styles.groupTitle, { color: colors.mutedForeground }]}>{group.label.toUpperCase()}</Text>
                  <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                    {group.tenses.map((tense, index) => {
                      const active = tense === selectedTense;
                      return (
                        <Pressable
                          key={tense}
                          onPress={() => {
                            setSelectedTense(tense);
                            setPickerOpen(false);
                          }}
                          style={({ pressed }) => [
                            styles.tenseRow,
                            index < group.tenses.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                            pressed && { opacity: 0.65 },
                          ]}
                        >
                          <View style={styles.tenseRowText}>
                            <Text style={[styles.tenseRowTitle, { color: active ? colors.primary : colors.foreground }]}> 
                              {TENSE_LABELS[tense]}
                            </Text>
                            <Text style={[styles.tenseRowDescription, { color: colors.mutedForeground }]}> 
                              {TENSE_DESCRIPTIONS[tense]}
                            </Text>
                          </View>
                          {active ? <Ionicons name="checkmark-circle" size={21} color={colors.primary} /> : null}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1, gap: 8 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerInfinitive: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  headerTranslation: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 1 },
  content: { padding: 16, gap: 12 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  groupBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  groupBadgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  tenseSelector: { borderWidth: 1, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  tenseSelectorText: { flex: 1 },
  tenseSelectorLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.6 },
  tenseSelectorTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginTop: 4 },
  tenseSelectorDescription: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 3 },
  legend: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  legendText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  pronounceBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  pronounceBtnText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { maxHeight: '84%', borderTopLeftRadius: 22, borderTopRightRadius: 22, overflow: 'hidden' },
  sheetHandle: { width: 42, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 9 },
  sheetHeader: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetTitle: { fontSize: 21, fontFamily: 'Inter_700Bold' },
  sheetSubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  sheetContent: { paddingHorizontal: 16, paddingBottom: 20, gap: 16 },
  groupSection: { gap: 7 },
  groupTitle: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.6 },
  groupCard: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  tenseRow: { minHeight: 58, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  tenseRowText: { flex: 1 },
  tenseRowTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  tenseRowDescription: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },
  errText: { fontSize: 16, textAlign: 'center', marginTop: 100, fontFamily: 'Inter_400Regular' },
});
