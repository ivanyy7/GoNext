import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
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

export default function HighlightDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const highlightId = Number(id);
  const router = useRouter();

  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const h = await getHighlightById(highlightId);
        if (!h) {
          Alert.alert('Ошибка', 'Запись не найдена.');
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
        Alert.alert('Ошибка', 'Не удалось загрузить данные.');
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

    Alert.alert('Удалить запись', 'Точно удалить эту запись?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHighlight(highlight.id);
            router.back();
          } catch (error) {
            console.error('Не удалось удалить запись', error);
            Alert.alert('Ошибка', 'Не удалось удалить запись.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Достопримечательность" />
        <View style={styles.center}>
          <Text>Загрузка…</Text>
        </View>
      </>
    );
  }

  if (!highlight) {
    return null;
  }

  return (
    <>
      <AppHeader title="Достопримечательность" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          {highlight.title}
        </Text>

        {highlight.date && (
          <Text style={styles.meta}>Дата/время: {highlight.date}</Text>
        )}

        {trip && <Text style={styles.meta}>Поездка: {trip.title}</Text>}
        {place && <Text style={styles.meta}>Место: {place.name}</Text>}

        <Text style={styles.description}>
          {highlight.description || 'Без описания. Заметка не заполнена.'}
        </Text>

        {highlight.photos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {highlight.photos.map((uri) => (
              <Image key={uri} source={{ uri }} style={styles.photo} />
            ))}
          </ScrollView>
        )}

        <PrimaryButton onPress={handleDelete} mode="outlined">
          Удалить запись
        </PrimaryButton>
      </ScrollView>
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

