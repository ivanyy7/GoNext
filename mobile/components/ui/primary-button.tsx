import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, type ButtonProps } from 'react-native-paper';

type PrimaryButtonProps = ButtonProps;

export function PrimaryButton({
  style,
  contentStyle,
  labelStyle,
  ...rest
}: PrimaryButtonProps) {
  return (
    <LinearGradient
      // Мягкий градиент: края чуть светлее, общий тон немного темнее
      colors={['#D3C2FF', '#D9CCFF', '#E0D6FF', '#D9CCFF', '#D3C2FF']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.gradient, style]}
    >
      <Button
        mode="contained"
        style={styles.button}
        contentStyle={[styles.content, contentStyle]}
        labelStyle={[styles.label, labelStyle]}
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


