import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { AppHeader } from '@/components/ui/app-header';
import { ScreenBackground } from '@/components/ui/screen-background';
import { MilkCard } from '@/components/ui/milk-card';
import { DarkAccentColors, useThemePreference } from '@/context/theme-preference';
import { changeAppLanguage } from '@/i18n/config';

export default function SettingsScreen() {
  const { mode, setMode, darkAccentIndex, setDarkAccentIndex } = useThemePreference();
  const isDark = mode === 'dark';
  const { t, i18n } = useTranslation();

  return (
    <>
      <AppHeader title={t('settings.title')} />

      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.content}>
          <MilkCard style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('settings.aboutTitle')}
            </Text>
            <Text style={styles.sectionText}>
              {t('settings.aboutText')}
            </Text>
          </MilkCard>

          <MilkCard style={[styles.section, styles.themeSection]}>
            <Text style={styles.themeLabel}>{t('settings.themeToggle')}</Text>
            <IconButton
              icon={isDark ? 'weather-night' : 'white-balance-sunny'}
              size={40}
              iconColor="#000000"
              onPress={() => setMode(isDark ? 'light' : 'dark')}
            />
          </MilkCard>

          {isDark && (
            <MilkCard style={[styles.section, styles.accentSection]}>
              <Text style={styles.accentLabel}>{t('settings.accentLabel')}</Text>
              <View style={styles.accentRow}>
                {DarkAccentColors.map((color, index) => {
                  const selected = index === darkAccentIndex;
                  return (
                    <TouchableOpacity
                      key={color}
                      onPress={() => setDarkAccentIndex(index)}
                      style={[
                        styles.accentCircle,
                        {
                          backgroundColor: color,
                          borderColor: selected ? '#000000' : 'transparent',
                          borderWidth: selected ? 2 : 1,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            </MilkCard>
          )}

          <MilkCard style={[styles.section, styles.languageSection]}>
            <Text style={styles.languageLabel}>{t('settings.languageTitle')}</Text>
            <View style={styles.languageRow}>
              <TouchableOpacity
                style={[
                  styles.languageChip,
                  i18n.language === 'ru' && styles.languageChipActive,
                ]}
                onPress={() => changeAppLanguage('ru')}
              >
                <Text
                  style={[
                    styles.languageChipText,
                    i18n.language === 'ru' && styles.languageChipTextActive,
                  ]}
                >
                  {t('settings.languageRu')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.languageChip,
                  i18n.language === 'en' && styles.languageChipActive,
                ]}
                onPress={() => changeAppLanguage('en')}
              >
                <Text
                  style={[
                    styles.languageChipText,
                    i18n.language === 'en' && styles.languageChipTextActive,
                  ]}
                >
                  {t('settings.languageEn')}
                </Text>
              </TouchableOpacity>
            </View>
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
  accentSection: {
    gap: 12,
  },
  accentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2A2340',
    marginBottom: 4,
  },
  accentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accentCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  languageSection: {
    gap: 8,
  },
  languageLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2A2340',
  },
  languageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  languageChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  languageChipActive: {
    backgroundColor: '#2A2340',
  },
  languageChipText: {
    color: '#2A2340',
    fontWeight: '500',
  },
  languageChipTextActive: {
    color: '#FFFFFF',
  },
});

