import React, { useEffect, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Text, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import { AppHeader } from '@/components/ui/app-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import type { Highlight, Trip } from '@/models';
import { createHighlight, getActiveTrip, updateHighlight } from '@/services/database';
import { ScreenBackground } from '@/components/ui/screen-background';
import { FormTextInput } from '@/components/ui/form-text-input';
import { saveHighlightPhoto, resolvePhotoUri } from '@/services/photo-storage';

export default function NewHighlightScreen() {
  const router = useRouter();
  const { t } = useTranslation();

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
      Alert.alert(t('highlights.errorTitleRequired'), t('highlights.errorNameRequired'));
      return;
    }

    setSaving(true);
    try {
      // Сначала создаём запись без фотографий, чтобы получить её id.
      const baseData: Omit<Highlight, 'id' | 'createdAt'> = {
        title: title.trim(),
        description: description.trim() || null,
        placeId: null,
        tripId: activeTrip ? activeTrip.id : null,
        date: date.trim() || null,
        photos: [],
      };

      const highlight = await createHighlight(baseData);

      // Затем копируем выбранные фото в нашу папку и сохраняем относительные пути в БД.
      if (photos.length > 0) {
        const savedPhotoPaths: string[] = [];
        for (const uri of photos) {
          const relativePath = await saveHighlightPhoto(highlight.id, uri);
          savedPhotoPaths.push(relativePath);
        }

        if (savedPhotoPaths.length > 0) {
          await updateHighlight(highlight.id, { photos: savedPhotoPaths });
        }
      }

      router.back();
    } catch (error) {
      console.error('Не удалось сохранить запись о достопримечательности', error);
      Alert.alert(
        t('common.errorTitle'),
        t('highlights.errorSave', 'Не удалось сохранить запись. Проверь логи консоли.')
      );
    } finally {
      setSaving(false);
    }
  };

  const requestMediaPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('common.errorTitle'),
        t('highlights.noPhotoPermission', 'Нужен доступ к фото, чтобы прикреплять изображения.')
      );
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
      <AppHeader title={t('highlights.newTitle')} />

      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.content}>
          {activeTrip ? (
            <Text style={styles.tripInfo}>
              {t('highlights.tripInfoWithTrip', { title: activeTrip.title })}
            </Text>
          ) : (
            <Text style={styles.tripInfo}>{t('highlights.tripInfoNoTrip')}</Text>
          )}

          <FormTextInput label={t('highlights.fieldTitle')} value={title} onChangeText={setTitle} />

          <FormTextInput
            label={t('highlights.fieldDescription')}
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
          />

          <FormTextInput
            label={t('highlights.fieldDate')}
            value={date}
            onChangeText={setDate}
            style={styles.input}
          />

          <View style={styles.photosBlock}>
            <View style={styles.photosHeader}>
              <Text variant="titleSmall">{t('highlights.photos')}</Text>
              <PrimaryButton compact onPress={handleAddPhoto}>
                {t('highlights.addPhoto')}
              </PrimaryButton>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {photos.map((uri) => (
                <Image key={uri} source={{ uri }} style={styles.photo} />
              ))}
            </ScrollView>
          </View>

          <PrimaryButton onPress={handleSave} loading={saving} disabled={saving}>
            {t('highlights.saveHighlight')}
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

