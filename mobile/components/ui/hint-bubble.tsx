import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { MilkCard } from '@/components/ui/milk-card';
import { PrimaryButton } from '@/components/ui/primary-button';

type HintBubbleProps = {
  visible: boolean;
  text: string;
  onClose: () => void;
};

export function HintBubble({ visible, text, onClose }: HintBubbleProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.container} pointerEvents="box-none">
        <MilkCard style={styles.card}>
          <Text style={styles.text}>{text}</Text>
          <PrimaryButton compact onPress={onClose} style={styles.button}>
            Понятно
          </PrimaryButton>
        </MilkCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    justifyContent: 'flex-end',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    paddingVertical: 12,
  },
  text: {
    marginBottom: 8,
    color: '#2A2340',
  },
  button: {
    alignSelf: 'flex-end',
  },
});

