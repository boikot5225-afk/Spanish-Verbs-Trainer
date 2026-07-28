import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import type { Verb } from '../data/types';
import { searchVerbResults, VERBS, type VerbSearchResult } from '../data/verbs';

interface VerbsContextValue {
  verbs: Verb[];
  filteredVerbs: Verb[];
  searchResults: VerbSearchResult[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  speak: (text: string) => void;
}

const VerbsContext = createContext<VerbsContextValue | null>(null);

export function VerbsProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => searchVerbResults(searchQuery), [searchQuery]);
  const filteredVerbs = useMemo(() => searchResults.map(result => result.verb), [searchResults]);

  const speak = useCallback((text: string) => {
    if (Platform.OS === 'web') return;
    import('expo-speech').then(Speech => {
      Speech.speak(text, { language: 'es-ES', rate: 0.85 });
    }).catch(() => {});
  }, []);

  return (
    <VerbsContext.Provider
      value={{
        verbs: VERBS,
        filteredVerbs,
        searchResults,
        searchQuery,
        setSearchQuery,
        speak,
      }}
    >
      {children}
    </VerbsContext.Provider>
  );
}

export function useVerbs(): VerbsContextValue {
  const ctx = useContext(VerbsContext);
  if (!ctx) throw new Error('useVerbs must be used inside VerbsProvider');
  return ctx;
}
