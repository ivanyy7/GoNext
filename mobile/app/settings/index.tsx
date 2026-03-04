import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

import { AppHeader } from '@/components/ui/app-header';
import { ScreenBackground } from '@/components/ui/screen-background';
import { MilkCard } from '@/components/ui/milk-card';
import { useThemePreference } from '@/context/theme-preference';

export default function SettingsScreen() {
  const { mode, setMode } = useThemePreference();
  const isDark = mode === 'dark';

  return (
    <>
      <AppHeader title="Настройки" />

      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.content}>
          <MilkCard style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              О приложении
            </Text>
            <Text style={styles.sectionText}>
              GoNext — дневник путешественника. Приложение работает офлайн и хранит все данные
              локально на устройстве.
            </Text>
          </MilkCard>

          <MilkCard style={[styles.section, styles.themeSection]}>
            <Text style={styles.themeLabel}>Переключение темы</Text>
            <IconButton
              icon={isDark ? 'weather-night' : 'white-balance-sunny'}
              size={40}
              iconColor="#000000"
              onPress={() => setMode(isDark ? 'light' : 'dark')}
            />
          </MilkCard>
        </ScrollView>
      </ScreenBackground>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    marginBottom: 4,
    color: '#2A2340',
    fontWeight: '600',
  },
  sectionText: {
    color: '#3E3A4F',
  },
  themeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A2340',
  },
});

