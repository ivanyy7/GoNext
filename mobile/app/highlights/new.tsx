import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/components/ui/app-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import type { Highlight, Trip } from '@/models';
import { createHighlight, getActiveTrip } from '@/services/database';
import { ScreenBackground } from '@/components/ui/screen-background';

export default function NewHighlightScreen() {
  const router = useRouter();

  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString());
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getActiveTrip()
      .then(setActiveTrip)
      .catch((error) => {
        console.error('Не удалось получить текущую поездку', error);
      });
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Название обязательно.');
      return;
    }

    setSaving(true);
    try {
      const data: Omit<Highlight, 'id' | 'createdAt'> = {
        title: title.trim(),
        description: description.trim() || null,
        placeId: null,
        tripId: activeTrip ? activeTrip.id : null,
        date: date.trim() || null,
        photos,
      };

      await createHighlight(data);
      router.back();
    } catch (error) {
      console.error('Не удалось сохранить запись о достопримечательности', error);
      Alert.alert('Ошибка', 'Не удалось сохранить запись. Проверь логи консоли.');
    } finally {
      setSaving(false);
    }
  };

  const requestMediaPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нет доступа', 'Нужен доступ к фото, чтобы прикреплять изображения.');
      return false;
    }
    return true;
  };

  const handleAddPhoto = async () => {
    const hasPermission = await requestMediaPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  };

  return (
    <>
      <AppHeader title="Новая достопримечательность" />

      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.content}>
          {activeTrip ? (
            <Text style={styles.tripInfo}>Текущая поездка: {activeTrip.title}</Text>
          ) : (
            <Text style={styles.tripInfo}>Текущая поездка не выбрана.</Text>
          )}

          <TextInput
            label="Название"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Описание / заметка"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
            multiline
          />

          <TextInput
            label="Дата и время (ISO, можно отредактировать)"
            value={date}
            onChangeText={setDate}
            mode="outlined"
            style={styles.input}
          />

          <View style={styles.photosBlock}>
            <View style={styles.photosHeader}>
              <Text variant="titleSmall">Фотографии</Text>
              <PrimaryButton compact onPress={handleAddPhoto}>
                Добавить фото
              </PrimaryButton>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {photos.map((uri) => (
                <Image key={uri} source={{ uri }} style={styles.photo} />
              ))}
            </ScrollView>
          </View>

          <PrimaryButton onPress={handleSave} loading={saving} disabled={saving}>
            Сохранить запись
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
  tripInfo: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  photosBlock: {
    gap: 8,
  },
  photosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
});

