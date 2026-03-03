import React from 'react';
import { Button, type ButtonProps } from 'react-native-paper';

type PrimaryButtonProps = ButtonProps;

export function PrimaryButton(props: PrimaryButtonProps) {
  return <Button mode="contained" {...props} />;
}

