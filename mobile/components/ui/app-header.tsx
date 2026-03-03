import React from 'react';
import { Appbar } from 'react-native-paper';

type AppHeaderProps = {
  title: string;
};

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <Appbar.Header mode="center-aligned">
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}

