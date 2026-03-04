import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/components/ui/app-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import type { Trip } from '@/models';
import { createTrip } from '@/services/database';
import { ScreenBackground } from '@/components/ui/screen-background';
import { FormTextInput } from '@/components/ui/form-text-input';
import { LabeledSwitch } from '@/components/ui/labeled-switch';

export default function NewTripScreen() {
  const router = useRouter();
  const { t } = useTranslation();

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
      <AppHeader title={t('trips.newTitle')} />

      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.content}>
          <FormTextInput label={t('trips.fieldName')} value={title} onChangeText={setTitle} />

          <FormTextInput
            label={t('trips.fieldDescription')}
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
          />

          <FormTextInput
            label={t('trips.startDate')}
            value={startDate}
            onChangeText={setStartDate}
            style={styles.input}
          />

          <FormTextInput
            label={t('trips.endDate')}
            value={endDate}
            onChangeText={setEndDate}
            style={styles.input}
          />

          <View style={styles.row}>
            <LabeledSwitch
              label={t('trips.currentFlag')}
              value={current}
              onValueChange={setCurrent}
            />
          </View>

          <PrimaryButton
            onPress={handleSave}
            loading={saving}
            disabled={saving || !title.trim()}
          >
            {t('trips.saveTrip')}
          </PrimaryButton>
        </ScrollView>
      </ScreenBackground>
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

