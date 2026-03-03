import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, type ButtonProps } from 'react-native-paper';

type PrimaryButtonProps = ButtonProps;

export function PrimaryButton({ style, contentStyle, ...rest }: PrimaryButtonProps) {
  return (
    <Button
      mode="contained"
      style={[styles.button, style]}
      contentStyle={[styles.content, contentStyle]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
  },
  content: {
    paddingVertical: 6,
  },
});


