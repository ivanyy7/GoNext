import React, { useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Switch, Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/components/ui/app-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import type { Place } from '@/models';
import { createPlace, updatePlace } from '@/services/database';
import { ScreenBackground } from '@/components/ui/screen-background';
import { savePlacePhoto, resolvePhotoUri } from '@/services/photo-storage';

export default function NewPlaceScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visitLater, setVisitLater] = useState(true);
  const [liked, setLiked] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const parseCoordinate = (value: string): number | null => {
    if (!value.trim()) return null;
    const parsed = Number(value.replace(',', '.'));
    return Number.isNaN(parsed) ? null : parsed;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Название места обязательно.');
      return;
    }

    const lat = parseCoordinate(latitude);
    const lon = parseCoordinate(longitude);

    setSaving(true);
    try {
      // Сначала создаём место без фотографий, чтобы получить его id.
      const baseData: Omit<Place, 'id' | 'createdAt'> = {
        name: name.trim(),
        description: description.trim() || null,
        visitLater,
        liked,
        latitude: lat,
        longitude: lon,
        photos: [],
      };

      const place = await createPlace(baseData);

      // Затем копируем выбранные фото в нашу папку и сохраняем относительные пути в БД.
      if (photos.length > 0) {
        const savedPhotoPaths: string[] = [];
        for (const uri of photos) {
          const relativePath = await savePlacePhoto(place.id, uri);
          savedPhotoPaths.push(relativePath);
        }

        if (savedPhotoPaths.length > 0) {
          await updatePlace(place.id, { photos: savedPhotoPaths });
        }
      }

      router.back();
    } catch (error) {
      console.error('Ошибка при сохранении места', error);
      Alert.alert(
        'Ошибка',
        'Не удалось сохранить место. Попробуй ещё раз или проверь логи консоли.'
      );
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
      <AppHeader title="Новое место" />

      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.content}>
          <TextInput
            label={name ? undefined : 'Название'}
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label={description ? undefined : 'Описание'}
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            style={styles.input}
            multiline
          />

          <View style={styles.flagsRow}>
            <View style={styles.flagRow}>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Посетить позже',
                    'Отметь, если это место пока в планах и ты ещё туда не добрался.'
                  )
                }
              >
                <Text style={styles.flagTitle}>Посетить позже</Text>
              </TouchableOpacity>
              <Switch value={visitLater} onValueChange={setVisitLater} />
            </View>

            <View style={styles.flagRow}>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Понравилось',
                    'Отметь, если это одно из любимых мест, к которым особенно хочется вернуться.'
                  )
                }
              >
                <Text style={styles.flagTitle}>Понравилось</Text>
              </TouchableOpacity>
              <Switch value={liked} onValueChange={setLiked} />
            </View>
          </View>

          <View style={styles.row}>
            <TextInput
              label="Широта (lat)"
              value={latitude}
              onChangeText={setLatitude}
              mode="outlined"
              style={[styles.input, styles.coordInput]}
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
            />
            <TextInput
              label="Долгота (lon)"
              value={longitude}
              onChangeText={setLongitude}
              mode="outlined"
              style={[styles.input, styles.coordInput]}
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
            />
          </View>

          <View style={styles.photosBlock}>
            <View style={styles.photosHeader}>
              <Text variant="titleSmall">Фотографии</Text>
              <PrimaryButton compact onPress={handleAddPhoto}>
                Добавить фото
              </PrimaryButton>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {photos.map((uri) => (
                <Image key={uri} source={{ uri: resolvePhotoUri(uri) }} style={styles.photo} />
              ))}
            </ScrollView>
          </View>

          <PrimaryButton onPress={handleSave} loading={saving} disabled={saving}>
            Сохранить
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
  flagsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  flagRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flagTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2A2340',
  },
  coordInput: {
    flex: 1,
    marginRight: 8,
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

