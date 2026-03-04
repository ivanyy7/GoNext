import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';

import { PaperDarkTheme, PaperLightTheme } from '@/constants/theme';
import {
  DarkAccentColors,
  ThemePreferenceProvider,
  useThemePreference,
} from '@/context/theme-preference';
import { initDatabase } from '@/services/database';

function RootLayoutInner() {
  const { mode, darkAccentIndex } = useThemePreference();
  const theme =
    mode === 'dark'
      ? {
          ...PaperDarkTheme,
          colors: {
            ...PaperDarkTheme.colors,
            primary: DarkAccentColors[darkAccentIndex] ?? PaperDarkTheme.colors.primary,
          },
        }
      : PaperLightTheme;

  useEffect(() => {
    initDatabase().catch((error) => {
      // На данном этапе просто логируем ошибку и продолжаем работу приложения.
      console.error('Ошибка инициализации базы данных', error);
    });
  }, []);

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="places/index" />
        <Stack.Screen name="places/new" />
        <Stack.Screen name="places/[id]" />
        <Stack.Screen name="trips/index" />
        <Stack.Screen name="trips/new" />
        <Stack.Screen name="trips/[id]" />
        <Stack.Screen name="trips/[id]/add-place" />
        <Stack.Screen name="next-place" />
        <Stack.Screen name="highlights/index" />
        <Stack.Screen name="highlights/new" />
        <Stack.Screen name="highlights/[id]" />
        <Stack.Screen name="settings/index" />
      </Stack>
      <StatusBar style="auto" />
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <RootLayoutInner />
    </ThemePreferenceProvider>
  );
}

