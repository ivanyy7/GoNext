import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, type TextInputProps } from 'react-native-paper';

type FormTextInputProps = TextInputProps & {
  label: string;
  value: string;
};

export function FormTextInput({ label, value, style, mode, ...rest }: FormTextInputProps) {
  const effectiveLabel = value ? undefined : label;

  return (
    <TextInput
      label={effectiveLabel}
      value={value}
      mode={mode ?? 'outlined'}
      style={[styles.input, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 8,
  },
});

