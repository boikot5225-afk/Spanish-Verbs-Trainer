import React, {
  createContext,
  useCallback,
  useContext,
  useDeferredValue,
  useMemo,
  useState,
} from 'react';
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
  // Поле ввода обновляется сразу, пересчёт списка идёт с низким приоритетом.
  const deferredQuery = useDeferredValue(searchQuery);
  const filteredVerbs = useMemo(() => searchVerbs(deferredQuery), [deferredQuery]);

  const speak = useCallback((text: string) => {
    if (Platform.OS === 'web') return;
    // Dynamically import expo-speech to avoid web crashes
    import('expo-speech').then(Speech => {
      Speech.speak(text, { language: 'es-ES', rate: 0.85 });
    }).catch(() => {});
  }, []);

  const value = useMemo<VerbsContextValue>(
    () => ({ verbs: VERBS, filteredVerbs, searchQuery, setSearchQuery, speak }),
    [filteredVerbs, searchQuery, speak],
  );

  return <VerbsContext.Provider value={value}>{children}</VerbsContext.Provider>;
}

export function useVerbs(): VerbsContextValue {
  const ctx = useContext(VerbsContext);
  if (!ctx) throw new Error('useVerbs must be used inside VerbsProvider');
  return ctx;
}
