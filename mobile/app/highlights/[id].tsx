import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppHeader } from '@/components/ui/app-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import type { Highlight, Place, Trip } from '@/models';
import {
  deleteHighlight,
  getHighlightById,
  getPlaceById,
  getTripById,
} from '@/services/database';
import { ScreenBackground } from '@/components/ui/screen-background';
import { deleteAllHighlightPhotos, resolvePhotoUri } from '@/services/photo-storage';

export default function HighlightDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const highlightId = Number(id);
  const router = useRouter();
  const { t } = useTranslation();

  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const h = await getHighlightById(highlightId);
        if (!h) {
          Alert.alert(
            t('common.errorTitle'),
            t('highlights.errorNotFound', 'Запись не найдена.')
          );
          router.back();
          return;
        }
        setHighlight(h);

        if (h.tripId != null) {
          const t = await getTripById(h.tripId);
          setTrip(t);
        }
        if (h.placeId != null) {
          const p = await getPlaceById(h.placeId);
          setPlace(p);
        }
      } catch (error) {
        console.error('Не удалось загрузить запись о достопримечательности', error);
        Alert.alert(
          t('common.errorTitle'),
          t('highlights.errorLoadDetails', 'Не удалось загрузить данные.')
        );
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(highlightId)) {
      load();
    }
  }, [highlightId, router]);

  const handleDelete = () => {
    if (!highlight) return;

    Alert.alert(t('highlights.deleteTitle'), t('highlights.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('highlights.deleteConfirmButton', 'Удалить'),
        style: 'destructive',
        onPress: async () => {
          try {
            try {
              await deleteAllHighlightPhotos(highlight.id);
            } catch (error) {
              console.error('Не удалось удалить фото достопримечательности с устройства', error);
            }

            await deleteHighlight(highlight.id);
            router.back();
          } catch (error) {
            console.error('Не удалось удалить запись', error);
            Alert.alert(
              t('common.errorTitle'),
              t('highlights.errorDelete', 'Не удалось удалить запись.')
            );
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <>
        <AppHeader title={t('highlights.detailsTitle')} />
        <ScreenBackground>
          <View style={styles.center}>
            <Text>{t('common.loading')}</Text>
          </View>
        </ScreenBackground>
      </>
    );
  }

  if (!highlight) {
    return null;
  }

  return (
    <>
      <AppHeader title={t('highlights.detailsTitle')} />

      <ScreenBackground>
        <ScrollView contentContainerStyle={styles.content}>
          <Text variant="titleLarge" style={styles.title}>
            {highlight.title}
          </Text>

          {highlight.date && (
            <Text style={styles.meta}>
              {t('highlights.metaDate', { value: highlight.date })}
            </Text>
          )}

          {trip && (
            <Text style={styles.meta}>
              {t('highlights.metaTrip', { title: trip.title })}
            </Text>
          )}
          {place && (
            <Text style={styles.meta}>
              {t('highlights.metaPlace', { title: place.name })}
            </Text>
          )}

          <Text style={styles.description}>
            {highlight.description || t('highlights.descriptionFallback')}
          </Text>

          {highlight.photos.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {highlight.photos.map((uri) => (
                <Image
                  key={uri}
                  source={{ uri: resolvePhotoUri(uri) }}
                  style={styles.photo}
                />
              ))}
            </ScrollView>
          )}

          <PrimaryButton onPress={handleDelete} mode="outlined">
            {t('highlights.deleteButton', 'Удалить запись')}
          </PrimaryButton>
        </ScrollView>
      </ScreenBackground>
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  title: {
    marginBottom: 4,
  },
  meta: {
    color: '#666',
    marginBottom: 4,
  },
  description: {
    marginTop: 8,
    marginBottom: 8,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
});

