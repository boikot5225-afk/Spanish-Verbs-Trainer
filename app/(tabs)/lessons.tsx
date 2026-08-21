import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useLessons } from '../../context/LessonsContext';
import {
  LESSONS,
  LESSON_BLOCKS,
  LESSON_BLOCK_LABELS,
  lessonsByBlock,
} from '../../data/lessons';

export default function LessonsTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { passed, isAvailable, currentLessonId } = useLessons();

  const coreLessons = LESSONS.filter(lesson => lesson.block !== 'syntax');
  const coreBlocks = LESSON_BLOCKS.filter(block => block !== 'syntax');
  const corePassedCount = coreLessons.filter(lesson => passed.has(lesson.id)).length;

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 84 : insets.bottom + 64;

  let counter = 0;

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
        <Text style={[styles.title, { color: colors.foreground }]}>Глагольный курс</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Сдано {corePassedCount} из {coreLessons.length}</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}>
        {coreBlocks.map(block => {
          const blockLessons = lessonsByBlock(block);
          if (blockLessons.length === 0) return null;

          return (
            <View key={block} style={styles.block}>
              <Text style={[styles.blockLabel, { color: colors.mutedForeground }]}>
                {LESSON_BLOCK_LABELS[block].toUpperCase()}
              </Text>

              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {blockLessons.map((lesson, index) => {
                  counter += 1;
                  const isPassed = passed.has(lesson.id);
                  const isLocked = !isAvailable(lesson.id);
                  const isCurrent = lesson.id === currentLessonId && !isLocked;
                  return (
                    <Pressable
                      key={lesson.id}
                      onPress={() => router.push(`/lesson/${lesson.id}`)}
                      style={({ pressed }) => [
                        styles.row,
                        index < blockLessons.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                        },
                        pressed && { opacity: 0.6 },
                      ]}
                    >
                      <View
                        style={[
                          styles.number,
                          {
                            backgroundColor: isPassed ? colors.success : colors.secondary,
                            opacity: isLocked ? 0.5 : 1,
                          },
                        ]}
                      >
                        {isPassed ? (
                          <Ionicons name="checkmark" size={16} color={colors.background} />
                        ) : isLocked ? (
                          <Ionicons name="lock-closed" size={13} color={colors.mutedForeground} />
                        ) : (
                          <Text style={[styles.numberText, { color: colors.primary }]}>{counter}</Text>
                        )}
                      </View>
                      <View style={styles.rowCenter}>
                        <Text
                          style={[
                            styles.lessonTitle,
                            {
                              color: isLocked ? colors.mutedForeground : colors.foreground,
                              fontFamily: isCurrent ? 'Inter_600SemiBold' : 'Inter_500Medium',
                            },
                          ]}
                        >
                          {lesson.title}
                        </Text>
                        <Text style={[styles.lessonSummary, { color: colors.mutedForeground }]}>
                          {isCurrent ? 'Текущая тема · ' : ''}{lesson.summary}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={isCurrent ? colors.primary : colors.mutedForeground}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  list: { padding: 16, gap: 4 },
  block: { marginBottom: 18 },
  blockLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    marginBottom: 7,
    marginLeft: 4,
  },
  card: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  number: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  rowCenter: { flex: 1, gap: 2 },
  lessonTitle: { fontSize: 15 },
  lessonSummary: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});
