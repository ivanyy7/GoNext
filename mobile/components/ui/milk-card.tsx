import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

type MilkCardProps = ViewProps & {
  children: React.ReactNode;
};

export function MilkCard({ style, children, ...rest }: MilkCardProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
});

