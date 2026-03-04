import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { useThemePreference } from '@/context/theme-preference';

type ScreenBackgroundProps = {
  children: React.ReactNode;
};

export function ScreenBackground({ children }: ScreenBackgroundProps) {
  const { mode } = useThemePreference();
  const theme = useTheme();

  if (mode === 'dark') {
    return (
      <View style={[styles.background, { backgroundColor: theme.colors.background }]}>
        {children}
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('@/assets/backgrounds/gonext-bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});

