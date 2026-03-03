import React, { useEffect, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';

import { AppHeader } from '@/components/ui/app-header';
import type { Place, Trip, TripPlace } from '@/models';
import { getActiveTrip, getPlaceById, getTripPlaces, updateTripPlace } from '@/services/database';
import { PrimaryButton } from '@/components/ui/primary-button';

type NextPlaceState =
  | { status: 'loading' }
  | { status: 'no-trips' }
  | { status: 'no-next-place'; trip: Trip }
  | { status: 'ready'; trip: Trip; tripPlace: TripPlace; place: Place };

export default function NextPlaceScreen() {
  const [state, setState] = useState<NextPlaceState>({ status: 'loading' });
  const [updating, setUpdating] = useState(false);

  const loadNextPlace = async () => {
    try {
      setState({ status: 'loading' });

      const trip = await getActiveTrip();
      if (!trip) {
        setState({ status: 'no-trips' });
        return;
      }

      const tripPlaces = await getTripPlaces(trip.id);
      const next = tripPlaces.find((tp) => !tp.visited);
      if (!next) {
        setState({ status: 'no-next-place', trip });
        return;
      }

      const place = await getPlaceById(next.placeId);
      if (!place) {
        setState({ status: 'no-next-place', trip });
        return;
      }

      setState({ status: 'ready', trip, tripPlace: next, place });
    } catch (error) {
      console.error('Не удалось определить следующее место', error);
      Alert.alert('Ошибка', 'Не удалось загрузить следующее место. Проверь логи консоли.');
      setState({ status: 'loading' });
    }
  };

  useEffect(() => {
    loadNextPlace();
  }, []);

  const parseCoordinate = (value: number | null): number | null => {
    if (value == null) return null;
    return Number.isNaN(value) ? null : value;
  };

  const handleOpenInMaps = () => {
    if (state.status !== 'ready') return;

    const lat = parseCoordinate(state.place.latitude);
    const lon = parseCoordinate(state.place.longitude);
    if (lat == null || lon == null) {
      Alert.alert('Нет координат', 'У этого места пока не заданы координаты.');
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

  const handleMarkVisited = async () => {
    if (state.status !== 'ready') return;

    setUpdating(true);
    try {
      await updateTripPlace(state.tripPlace.id, {
        visited: true,
        visitDate: new Date().toISOString(),
      });
      await loadNextPlace();
    } catch (error) {
      console.error('Не удалось отметить место посещённым', error);
      Alert.alert('Ошибка', 'Не удалось отметить место посещённым.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <AppHeader title="Следующее место" />

      <ScrollView contentContainerStyle={styles.content}>
        {state.status === 'loading' && (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={styles.message}>Определяем следующую точку маршрута…</Text>
          </View>
        )}

        {state.status === 'no-trips' && (
          <View style={styles.center}>
            <Text style={styles.message}>
              Пока нет ни одной поездки. Создай поездку, чтобы увидеть следующее место.
            </Text>
          </View>
        )}

        {state.status === 'no-next-place' && (
          <View style={styles.center}>
            <Text style={styles.message}>
              В текущей поездке «{state.trip.title}» больше нет непосещённых мест.
            </Text>
          </View>
        )}

        {state.status === 'ready' && (
          <>
            <Card>
              <Card.Title title={state.place.name} subtitle={state.trip.title} />
              <Card.Content>
                {state.place.description ? (
                  <Text style={styles.description}>{state.place.description}</Text>
                ) : (
                  <Text style={styles.description}>Описание не задано.</Text>
                )}

                <Text style={styles.coords}>
                  Координаты:{' '}
                  {state.place.latitude != null && state.place.longitude != null
                    ? `${state.place.latitude}, ${state.place.longitude}`
                    : 'не заданы'}
                </Text>
              </Card.Content>
            </Card>

            <PrimaryButton onPress={handleOpenInMaps}>Открыть в навигаторе</PrimaryButton>

            <PrimaryButton
              onPress={handleMarkVisited}
              loading={updating}
              disabled={updating}
            >
              Отметить как посещённое и перейти к следующему
            </PrimaryButton>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  message: {
    marginTop: 12,
    textAlign: 'center',
  },
  description: {
    marginBottom: 8,
  },
  coords: {
    color: '#666',
  },
});

