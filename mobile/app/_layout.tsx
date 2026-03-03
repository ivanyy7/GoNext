import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';

import { PaperDarkTheme, PaperLightTheme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { initDatabase } from '@/services/database';

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colorScheme === 'dark' ? PaperDarkTheme : PaperLightTheme;

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
      </Stack>
      <StatusBar style="auto" />
    </PaperProvider>
  );
}

