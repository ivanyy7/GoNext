import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Switch, Text, TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppHeader } from '@/components/ui/app-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import type { Place } from '@/models';
import { deletePlace, getPlaceById, updatePlace } from '@/services/database';
import { ScreenBackground } from '@/components/ui/screen-background';
import { deleteAllPlacePhotos, resolvePhotoUri, savePlacePhoto } from '@/services/photo-storage';

export default function PlaceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const numericId = Number(id);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [place, setPlace] = useState<Place | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visitLater, setVisitLater] = useState(true);
  const [liked, setLiked] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPlaceById(numericId);
        if (!data) {
          Alert.alert('Ошибка', 'Место не найдено.');
          router.back();
          return;
        }
        setPlace(data);
        setName(data.name);
        setDescription(data.description ?? '');
        setVisitLater(data.visitLater);
        setLiked(data.liked);
        setLatitude(data.latitude != null ? String(data.latitude) : '');
        setLongitude(data.longitude != null ? String(data.longitude) : '');
        setPhotos(data.photos ?? []);
      } catch (error) {
        console.error('Не удалось загрузить место', error);
        Alert.alert('Ошибка', 'Не удалось загрузить данные места.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(numericId)) {
      load();
    }
  }, [numericId, router]);

  const parseCoordinate = (value: string): number | null => {
    if (!value.trim()) return null;
    const parsed = Number(value.replace(',', '.'));
    return Number.isNaN(parsed) ? null : parsed;
  };

  const handleSave = async () => {
    if (!place) return;

    if (!name.trim()) {
      Alert.alert('Ошибка', 'Название места обязательно.');
      return;
    }

    const lat = parseCoordinate(latitude);
    const lon = parseCoordinate(longitude);

    setSaving(true);
    try {
      await updatePlace(place.id, {
        name: name.trim(),
        description: description.trim() || null,
        visitLater,
        liked,
        latitude: lat,
        longitude: lon,
        photos,
      });
      router.back();
    } catch (error) {
      console.error('Ошибка при обновлении места', error);
      Alert.alert(
        'Ошибка',
        'Не удалось сохранить изменения. Попробуй ещё раз или проверь логи консоли.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!place) return;

    Alert.alert('Удалить место', 'Точно удалить это место?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAllPlacePhotos(place.id);
          } catch (error) {
            console.error('Не удалось удалить фото места с устройства', error);
          }

          try {
            await deletePlace(place.id);
            router.back();
          } catch (error) {
            console.error('Ошибка при удалении места', error);
            Alert.alert('Ошибка', 'Не удалось удалить место.');
          }
        },
      },
    ]);
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
      if (!place) return;

      try {
        const relativePath = await savePlacePhoto(place.id, result.assets[0].uri);
        setPhotos((prev) => [...prev, relativePath]);
      } catch (error) {
        console.error('Не удалось сохранить фото места', error);
        Alert.alert('Ошибка', 'Не удалось сохранить фото. Попробуй ещё раз.');
      }
    }
  };

  const handleOpenInMaps = () => {
    const lat = parseCoordinate(latitude);
    const lon = parseCoordinate(longitude);
    if (lat == null || lon == null) {
      Alert.alert('Нет координат', 'Сначала укажи корректные координаты места.');
      return;
    }

    const query = `${lat},${lon}`;
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?ll=${query}`
        : Platform.OS === 'android'
          ? `geo:${query}?q=${query}`
          : `https://www.google.com/maps/search/?api=1&query=${query}`;

    Linking.openURL(url).catch((error) => {
      console.error('Не удалось открыть карты', error);
      Alert.alert('Ошибка', 'Не удалось открыть навигатор.');
    });
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Место" />
        <ScreenBackground>
          <View style={styles.loadingContainer}>
            <Text>Загрузка...</Text>
          </View>
        </ScreenBackground>
      </>
    );
  }

  if (!place) {
    return null;
  }

  return (
    <>
      <AppHeader title="Место" />

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
                    'Отметь, если это место пока запланировано и ещё не посещено.'
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
                    'Отметь, если это одно из любимых мест, к которым особенно хочется возвращаться.'
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

          <PrimaryButton onPress={handleOpenInMaps}>Открыть в навигаторе</PrimaryButton>

          <View style={styles.buttonsRow}>
            <PrimaryButton
              onPress={handleDelete}
              mode="outlined"
              labelStyle={{ color: '#2A2340', fontWeight: '600' }}
              style={styles.buttonHalf}
            >
              Удалить место
            </PrimaryButton>

            <PrimaryButton
              onPress={handleSave}
              loading={saving}
              disabled={saving}
              style={styles.buttonHalf}
            >
              Сохранить
            </PrimaryButton>
          </View>
        </ScrollView>
      </ScreenBackground>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    padding: 16,
    paddingBottom: 8,
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
    flex: 1,
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
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  buttonHalf: {
    flex: 1,
  },
});

