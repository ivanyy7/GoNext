import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

type ScreenBackgroundProps = {
  children: React.ReactNode;
};

export function ScreenBackground({ children }: ScreenBackgroundProps) {
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

