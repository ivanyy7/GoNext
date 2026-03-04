import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { PaperProvider, Text } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

import { PaperDarkTheme, PaperLightTheme } from '@/constants/theme';
import {
  DarkAccentColors,
  ThemePreferenceProvider,
  useThemePreference,
} from '@/context/theme-preference';
import { initDatabase } from '@/services/database';
import { initI18n } from '@/i18n/config';

function Bootstrapper({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await Promise.all([initDatabase(), initI18n()]);
      } catch (error) {
        console.error('Ошибка инициализации приложения', error);
      } finally {
        setReady(true);
      }
    };

    void prepare();
  }, []);

  if (!ready) {
    return (
      <View style={styles.bootContainer}>
        <Text>Загрузка…</Text>
      </View>
    );
  }

  return <>{children}</>;
}

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

  return (
    <PaperProvider theme={theme}>
      <Bootstrapper>
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
      </Bootstrapper>
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

const styles = StyleSheet.create({
  bootContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


