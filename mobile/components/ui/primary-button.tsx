import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, type ButtonProps, useTheme } from 'react-native-paper';

type PrimaryButtonProps = ButtonProps;

export function PrimaryButton({
  style,
  contentStyle,
  labelStyle,
  ...rest
}: PrimaryButtonProps) {
  const theme = useTheme();
  const isDark = theme.dark;

  const gradientColors = isDark
    ? ['#4A3A86', '#5B4A9A', '#6C5BAF', '#5B4A9A', '#4A3A86']
    : ['#D3C2FF', '#D9CCFF', '#E0D6FF', '#D9CCFF', '#D3C2FF'];

  return (
    <LinearGradient
      // Мягкий градиент: в светлой теме светлее, в тёмной теме приглушённее
      colors={gradientColors}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.gradient, style]}
    >
      <Button
        mode="contained"
        style={styles.button}
        contentStyle={[styles.content, contentStyle]}
        labelStyle={[
          styles.label,
          { color: isDark ? '#1F192D' : '#2A2340' },
          labelStyle,
        ]}
        {...rest}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  content: {
    paddingVertical: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});


