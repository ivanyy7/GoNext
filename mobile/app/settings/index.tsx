import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { AppHeader } from '@/components/ui/app-header';
import { ScreenBackground } from '@/components/ui/screen-background';

export default function SettingsScreen() {
  return (
    <>
      <AppHeader title="Настройки" />

      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Общие настройки
            </Text>
            <Text>
              Здесь в будущем будут располагаться настройки режима офлайн, темы оформления и
              другие опции приложения GoNext.
            </Text>
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              О приложении
            </Text>
            <Text>
              GoNext — дневник путешественника. Приложение работает офлайн и хранит все данные
              локально на устройстве.
            </Text>
          </View>
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
  },
});

