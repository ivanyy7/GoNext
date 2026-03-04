import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark';

type ThemePreferenceContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  darkAccentIndex: number;
  setDarkAccentIndex: (index: number) => void;
};

// Набор безопасных акцентных цветов для тёмной темы.
// Используются только как оттенок primary, не влияют на фон и текст.
export const DarkAccentColors: string[] = [
  '#EADDFF',
  '#FFB3C6',
  '#FFE082',
  '#C5E1A5',
  '#80DEEA',
  '#81D4FA',
  '#B39DDB',
  '#F48FB1',
  '#FFAB91',
  '#B0BEC5',
];

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | undefined>(
  undefined
);

type ThemePreferenceProviderProps = {
  children: React.ReactNode;
};

export function ThemePreferenceProvider({ children }: ThemePreferenceProviderProps) {
  const systemScheme = useSystemColorScheme() ?? 'light';
  const initialMode: ThemeMode = systemScheme === 'dark' ? 'dark' : 'light';

  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [darkAccentIndex, setDarkAccentIndex] = useState(0);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      darkAccentIndex,
      setDarkAccentIndex,
    }),
    [mode, darkAccentIndex]
  );

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const ctx = useContext(ThemePreferenceContext);
  if (!ctx) {
    throw new Error('useThemePreference должен использоваться внутри ThemePreferenceProvider');
  }
  return ctx;
}

