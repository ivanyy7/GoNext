import React, { useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/components/ui/app-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import type { Place } from '@/models';
import { createPlace, updatePlace } from '@/services/database';
import { ScreenBackground } from '@/components/ui/screen-background';
import { savePlacePhoto, resolvePhotoUri } from '@/services/photo-storage';
import { FormTextInput } from '@/components/ui/form-text-input';
import { LabeledSwitch } from '@/components/ui/labeled-switch';

export default function NewPlaceScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visitLater, setVisitLater] = useState(true);
  const [liked, setLiked] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handleCoordinateInput = (raw: string) => {
    const trimmed = raw.trim();
    // Пытаемся распарсить строку формата "lat, lon" или "lat lon"
    const match = trimmed.match(
      /^([+-]?\d+(?:[.,]\d+)?)\s*[, ]\s*([+-]?\d+(?:[.,]\d+)?)$/
    );

    if (match) {
      const [_, lat, lon] = match;
      setLatitude(lat.replace(',', '.'));
      setLongitude(lon.replace(',', '.'));
      return;
    }

    return trimmed;
  };

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
      const message = error instanceof Error ? error.message : String(error);
      console.error('Ошибка при сохранении места', error);
      Alert.alert(
        'Ошибка',
        `Не удалось сохранить место. ${message}`
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
      <AppHeader title={t('places.newTitle')} />

      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.content}>
          <FormTextInput
            label={t('places.fieldName')}
            value={name}
            onChangeText={setName}
          />

          <FormTextInput
            label={t('places.fieldDescription')}
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
          />

          <View style={styles.flagsRow}>
            <LabeledSwitch
              label={t('places.visitLater')}
              helperText={t('places.visitLaterHelp')}
              value={visitLater}
              onValueChange={setVisitLater}
            />

            <LabeledSwitch
              label={t('places.liked')}
              helperText={t('places.likedHelp')}
              value={liked}
              onValueChange={setLiked}
            />
          </View>

          <View style={styles.row}>
            <FormTextInput
              label={t('places.latitude')}
              value={latitude}
              onChangeText={(text) => {
                const result = handleCoordinateInput(text);
                if (typeof result === 'string') {
                  setLatitude(result);
                }
              }}
              style={[styles.input, styles.coordInput]}
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
            />
            <FormTextInput
              label={t('places.longitude')}
              value={longitude}
              onChangeText={(text) => {
                const result = handleCoordinateInput(text);
                if (typeof result === 'string') {
                  setLongitude(result);
                }
              }}
              style={[styles.input, styles.coordInput]}
              keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
            />
          </View>

          <View style={styles.photosBlock}>
            <View style={styles.photosHeader}>
              <Text variant="titleSmall">{t('places.photos')}</Text>
              <PrimaryButton compact onPress={handleAddPhoto}>
                {t('places.addPhoto')}
              </PrimaryButton>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {photos.map((uri) => (
                <Image key={uri} source={{ uri: resolvePhotoUri(uri) }} style={styles.photo} />
              ))}
            </ScrollView>
          </View>

          <PrimaryButton onPress={handleSave} loading={saving} disabled={saving}>
            {t('places.save')}
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
  input: {},
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

