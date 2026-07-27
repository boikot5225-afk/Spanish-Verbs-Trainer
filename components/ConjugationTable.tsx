import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { Tense, Verb } from '../data/types';
import { personLabels, PERSONS } from '../data/types';

interface Props {
  verb: Verb;
  tense: Tense;
}

export default function ConjugationTable({ verb, tense }: Props) {
  const colors = useColors();
  const forms = verb.conjugations[tense];
  const labels = personLabels(tense);
  // Лица без формы (например, «yo» в императиве) в таблице не показываем.
  const visible = PERSONS.filter((_, idx) => !forms[idx]?.absent);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {visible.map((person, position) => {
        const idx = PERSONS.indexOf(person);
        const form = forms[idx];
        if (!form) return null;
        const isLast = position === visible.length - 1;
        return (
          <View
            key={person}
            style={[
              styles.row,
              !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
          >
            <Text style={[styles.pronoun, { color: colors.mutedForeground }]}>
              {labels[person]}
            </Text>
            <View style={styles.formContainer}>
              <Text
                style={[
                  styles.form,
                  form.irregular
                    ? { color: colors.irregular, fontFamily: 'Inter_600SemiBold' }
                    : { color: colors.foreground, fontFamily: 'Inter_500Medium' },
                ]}
              >
                {form.form}
              </Text>
              {form.irregular && (
                <View style={[styles.irregTag, { backgroundColor: colors.irregularBg }]}>
                  <Text style={[styles.irregText, { color: colors.irregular }]}>★</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    justifyContent: 'space-between',
  },
  pronoun: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    width: 110,
  },
  formContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
  },
  form: {
    fontSize: 16,
    textAlign: 'right',
  },
  irregTag: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  irregText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
});
