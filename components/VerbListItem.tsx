import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { Verb } from '../data/types';

interface Props {
  verb: Verb;
  onPress: () => void;
}

const GROUP_LABELS: Record<string, string> = {
  '1': 'I гр.',
  '2': 'II гр.',
  '3': 'III гр.',
};

export default function VerbListItem({ verb, onPress }: Props) {
  const colors = useColors();
  const isIrreg = verb.group === '3';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.left}>
        <Text style={[styles.infinitive, { color: colors.foreground }]}>
          {verb.infinitive}
        </Text>
        <Text style={[styles.translation, { color: colors.mutedForeground }]}>
          {verb.translation}
        </Text>
      </View>
      <View style={styles.right}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isIrreg ? colors.irregularBg : colors.secondary,
              borderColor: isIrreg ? colors.irregular : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isIrreg ? colors.irregular : colors.primary },
            ]}
          >
            {GROUP_LABELS[verb.group] ?? verb.group.toUpperCase()}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderRadius: 12,
    gap: 12,
  },
  left: {
    flex: 1,
    gap: 2,
  },
  infinitive: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  translation: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.3,
  },
});
