import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Switch, Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/components/ui/app-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import type { Trip } from '@/models';
import { createTrip } from '@/services/database';

export default function NewTripScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [current, setCurrent] = useState(false);
  const [saving, setSaving] = useState(false);

  const normalizeDate = (value: string): string | null => {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    setSaving(true);
    try {
      const data: Omit<Trip, 'id' | 'createdAt'> = {
        title: title.trim(),
        description: description.trim() || null,
        startDate: normalizeDate(startDate),
        endDate: normalizeDate(endDate),
        current,
      };

      await createTrip(data);
      router.back();
    } catch (error) {
      console.error('Не удалось создать поездку', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AppHeader title="Новая поездка" />

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          label="Название"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Описание"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          style={styles.input}
          multiline
        />

        <TextInput
          label="Дата начала (например, 2025-06-01)"
          value={startDate}
          onChangeText={setStartDate}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Дата окончания (например, 2025-06-10)"
          value={endDate}
          onChangeText={setEndDate}
          mode="outlined"
          style={styles.input}
        />

        <View style={styles.row}>
          <Text>Сделать текущей поездкой</Text>
          <Switch value={current} onValueChange={setCurrent} />
        </View>

        <PrimaryButton onPress={handleSave} loading={saving} disabled={saving || !title.trim()}>
          Сохранить поездку
        </PrimaryButton>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
  },
  input: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});

