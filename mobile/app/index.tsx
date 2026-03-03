import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/components/ui/app-header';
import { PrimaryButton } from '@/components/ui/primary-button';

export default function HomeScreen() {
  const router = useRouter();

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

  return (
    <>
      <AppHeader title="GoNext" />

      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.text}>
          Приветствую, Иван!
        </Text>

        <View style={styles.buttons}>
          <PrimaryButton onPress={handleOpenPlaces}>Места</PrimaryButton>
          <PrimaryButton onPress={handleOpenTrips}>Поездки</PrimaryButton>
          <PrimaryButton onPress={handleOpenNextPlace}>Следующее место</PrimaryButton>
          <PrimaryButton onPress={handleOpenHighlights}>Достопримечательности</PrimaryButton>
        </View>
      </View>
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
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
});

