import React, { useCallback } from 'react';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import SearchBar from '../../components/SearchBar';
import VerbListItem from '../../components/VerbListItem';
import { useVerbs } from '../../context/VerbsContext';
import type { VerbSearchResult } from '../../data/verbs';

export default function VerbsTab() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { searchResults, searchQuery, setSearchQuery } = useVerbs();

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPadding = Platform.OS === 'web' ? 84 : insets.bottom + 64;

  const renderVerb = useCallback(
    ({ item }: { item: VerbSearchResult }) => (
      <View style={styles.itemWrap}>
        <VerbListItem
          verb={item.verb}
          matchedForm={item.matchType === 'form' ? item.matchedForm : undefined}
          fuzzy={item.matchType === 'fuzzy'}
          onPress={() => router.push(`/verb/${item.verb.id}`)}
        />
      </View>
    ),
    [],
  );

  const hasQuery = searchQuery.trim().length > 0;

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
        <Text style={[styles.title, { color: colors.foreground }]}>Глаголы</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {hasQuery ? `${searchResults.length} результатов` : `${searchResults.length} глаголов`}
        </Text>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Инфинитив, перевод или форма..."
        />
        <Text style={[styles.searchHint, { color: colors.mutedForeground }]}>
          Например: oir, tuvieron, habría hecho, решать
        </Text>
      </View>

      <View style={[styles.legend, { backgroundColor: colors.irregularBg, borderColor: colors.irregular }]}> 
        <Text style={[styles.legendText, { color: colors.irregular }]}>★ — неправильная форма</Text>
      </View>

      <FlatList
        data={searchResults}
        renderItem={renderVerb}
        keyExtractor={item => item.verb.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={14}
        maxToRenderPerBatch={12}
        updateCellsBatchingPeriod={35}
        windowSize={9}
        removeClippedSubviews={Platform.OS === 'android'}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Ничего не найдено</Text>
            <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>Попробуйте инфинитив, перевод или другую форму</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  searchHint: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 6 },
  legend: { marginHorizontal: 16, marginTop: 10, marginBottom: 2, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start' },
  legendText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  list: { padding: 16, paddingTop: 10, flexGrow: 1 },
  itemWrap: { marginBottom: 8 },
  empty: { paddingTop: 60, alignItems: 'center', paddingHorizontal: 24 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  emptyHint: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 5, textAlign: 'center' },
});
