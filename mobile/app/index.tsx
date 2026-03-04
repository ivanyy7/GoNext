import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/components/ui/app-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenBackground } from '@/components/ui/screen-background';
import { HintBubble } from '@/components/ui/hint-bubble';
import { useThemePreference } from '@/context/theme-preference';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { hintsEnabled } = useThemePreference();
  const [showHint, setShowHint] = React.useState(false);

  React.useEffect(() => {
    setShowHint(hintsEnabled);
  }, [hintsEnabled]);

  const handleOpenPlaces = () => {
    router.push('/places');
  };

  const handleOpenTrips = () => {
    router.push('/trips');
  };

  const handleOpenNextPlace = () => {
    router.push('/next-place');
  };

  const handleOpenHighlights = () => {
    router.push('/highlights');
  };

  const handleOpenSettings = () => {
    router.push('/settings');
  };

  return (
    <>
      <AppHeader title="GoNext" />

      <ScreenBackground>
        <View style={styles.container}>
          <Text variant="headlineSmall" style={styles.text}>
            {t('home.greeting')}
          </Text>

          <View style={styles.buttons}>
            <PrimaryButton onPress={handleOpenPlaces}>{t('home.places')}</PrimaryButton>
            <PrimaryButton onPress={handleOpenTrips}>{t('home.trips')}</PrimaryButton>
            <PrimaryButton onPress={handleOpenNextPlace}>
              {t('home.nextPlace')}
            </PrimaryButton>
            <PrimaryButton onPress={handleOpenHighlights}>
              {t('home.highlights')}
            </PrimaryButton>
            <PrimaryButton onPress={handleOpenSettings}>
              {t('home.settings')}
            </PrimaryButton>
          </View>
          <HintBubble
            visible={showHint}
            text={t(
              'hints.home',
              'Выбери один из режимов — Места, Поездки, Следующее место или Достопримечательности, чтобы начать заполнять дневник.'
            )}
            onClose={() => setShowHint(false)}
          />
        </View>
      </ScreenBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  text: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#000000',
    fontWeight: '500',
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
});

