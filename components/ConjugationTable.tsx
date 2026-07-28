import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { Tense, Verb } from '../data/types';
import { getPersonLabel, PERSONS } from '../data/types';

interface Props {
  verb: Verb;
  tense: Tense;
}

export default function ConjugationTable({ verb, tense }: Props) {
  const colors = useColors();
  const forms = verb.conjugations[tense];
  const visibleRows = PERSONS.map((person, index) => ({ person, form: forms[index] }))
    .filter(item => item.form?.available !== false && item.form?.form !== '—');

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}> 
      {visibleRows.map(({ person, form }, visibleIndex) => {
        if (!form) return null;
        const isLast = visibleIndex === visibleRows.length - 1;
        return (
          <View
            key={person}
            style={[
              styles.row,
              !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
          >
            <Text style={[styles.pronoun, { color: colors.mutedForeground }]}> 
              {getPersonLabel(tense, person)}
            </Text>
            <View style={styles.formContainer}>
              <View style={styles.formTextWrap}>
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
                {form.aliases?.length ? (
                  <Text style={[styles.alias, { color: colors.mutedForeground }]}> 
                    также: {form.aliases.join(' / ')}
                  </Text>
                ) : null}
              </View>
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
  container: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, justifyContent: 'space-between', gap: 8 },
  pronoun: { fontSize: 14, fontFamily: 'Inter_400Regular', width: 110 },
  formContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' },
  formTextWrap: { flex: 1, alignItems: 'flex-end' },
  form: { fontSize: 16, textAlign: 'right' },
  alias: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'right', marginTop: 2 },
  irregTag: { paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
  irregText: { fontSize: 10, fontFamily: 'Inter_700Bold' },
});
