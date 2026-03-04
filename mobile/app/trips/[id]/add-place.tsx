import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, List, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppHeader } from '@/components/ui/app-header';
import type { Place, TripPlace } from '@/models';
import { addTripPlace, getAllPlaces, getTripPlaces } from '@/services/database';

export default function TripAddPlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tripId = Number(id);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<Place[]>([]);
  const [tripPlaces, setTripPlaces] = useState<TripPlace[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [allPlaces, existingTripPlaces] = await Promise.all([
          getAllPlaces(),
          getTripPlaces(tripId),
        ]);
        setPlaces(allPlaces);
        setTripPlaces(existingTripPlaces);
      } catch (error) {
        console.error('Не удалось загрузить места для добавления в поездку', error);
        Alert.alert('Ошибка', 'Не удалось загрузить список мест.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(tripId)) {
      load();
    }
  }, [tripId, router]);

  const existingPlaceIds = new Set(tripPlaces.map((tp) => tp.placeId));
  const availablePlaces = places.filter((p) => !existingPlaceIds.has(p.id));

  const handleSelectPlace = async (place: Place) => {
    try {
      const maxOrder =
        tripPlaces.length > 0
          ? Math.max(...tripPlaces.map((tp) => tp.order))
          : 0;

      await addTripPlace({
        tripId,
        placeId: place.id,
        order: maxOrder + 1,
        visited: false,
        visitDate: null,
        notes: null,
        photos: [],
      });

      router.back();
    } catch (error) {
      console.error('Не удалось добавить место в поездку', error);
      Alert.alert('Ошибка', 'Не удалось добавить место в маршрут.');
    }
  };

  return (
    <>
      <AppHeader title="Добавить место" />

      <View style={styles.container}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : availablePlaces.length === 0 ? (
          <View style={styles.center}>
            <Text>Нет доступных мест для добавления в эту поездку.</Text>
          </View>
        ) : (
          <FlatList
            data={availablePlaces}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                description={item.description ?? undefined}
                onPress={() => handleSelectPlace(item)}
                left={(props) => (
                  <List.Icon
                    {...props}
                    color="#E78A1F"
                    icon="checkbox-blank-circle-outline"
                  />
                )}
              />
            )}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});

