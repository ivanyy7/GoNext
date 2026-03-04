import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';

type LabeledSwitchProps = {
  label: string;
  helperText?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function LabeledSwitch({ label, helperText, value, onValueChange }: LabeledSwitchProps) {
  const handlePressLabel = () => {
    if (!helperText) return;
    Alert.alert(label, helperText);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label} onPress={handlePressLabel}>
        {label}
      </Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2A2340',
  },
});

