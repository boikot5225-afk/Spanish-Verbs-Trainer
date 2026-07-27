import React, { createContext, useCallback, useContext, useState } from 'react';
import { Platform } from 'react-native';
import type { Verb } from '../data/types';
import { searchVerbs, VERBS } from '../data/verbs';

interface VerbsContextValue {
  verbs: Verb[];
  filteredVerbs: Verb[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  speak: (text: string) => void;
}

const VerbsContext = createContext<VerbsContextValue | null>(null);

export function VerbsProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVerbs = searchVerbs(searchQuery);

  const speak = useCallback((text: string) => {
    if (Platform.OS === 'web') return;
    // Dynamically import expo-speech to avoid web crashes
    import('expo-speech').then(Speech => {
      Speech.speak(text, { language: 'es-ES', rate: 0.85 });
    }).catch(() => {});
  }, []);

  return (
    <VerbsContext.Provider
      value={{
        verbs: VERBS,
        filteredVerbs,
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
