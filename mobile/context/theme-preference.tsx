import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark';

type ThemePreferenceContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

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

  const value = useMemo(
    () => ({
      mode,
      setMode,
    }),
    [mode]
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

