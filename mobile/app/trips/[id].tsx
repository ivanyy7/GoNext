import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, List, Switch, Text, TextInput } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppHeader } from '@/components/ui/app-header';
import { PrimaryButton } from '@/components/ui/primary-button';
import type { Place, Trip, TripPlace } from '@/models';
import {
  deleteTrip,
  deleteTripPlace,
  getAllPlaces,
  getTripById,
  getTripPlaces,
  updateTrip,
  updateTripPlace,
} from '@/services/database';

type TripPlaceWithPlace = TripPlace & { place: Place | null };

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tripId = Number(id);
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [current, setCurrent] = useState(false);

  const [tripPlaces, setTripPlaces] = useState<TripPlaceWithPlace[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const t = await getTripById(tripId);
        if (!t) {
          Alert.alert('Ошибка', 'Поездка не найдена.');
          router.back();
          return;
        }
        setTrip(t);
        setTitle(t.title);
        setDescription(t.description ?? '');
        setStartDate(t.startDate ?? '');
        setEndDate(t.endDate ?? '');
        setCurrent(t.current);

        const tp = await getTripPlaces(tripId);
        const allPlaces = await getAllPlaces();
        const withPlaces: TripPlaceWithPlace[] = tp
          .map((item) => ({
            ...item,
            place: allPlaces.find((p) => p.id === item.placeId) ?? null,
          }))
          .sort((a, b) => a.order - b.order);

        setTripPlaces(withPlaces);
      } catch (error) {
        console.error('Не удалось загрузить поездку или места', error);
        Alert.alert('Ошибка', 'Не удалось загрузить данные поездки.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(tripId)) {
      load();
    }
  }, [tripId, router]);

  const normalizeDate = (value: string): string | null => {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  };

  const handleSaveTrip = async () => {
    if (!trip) return;
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Название поездки обязательно.');
      return;
    }

    try {
      await updateTrip(trip.id, {
        title: title.trim(),
        description: description.trim() || null,
        startDate: normalizeDate(startDate),
        endDate: normalizeDate(endDate),
        current,
      });
      Alert.alert('Сохранено', 'Изменения поездки сохранены.');
    } catch (error) {
      console.error('Не удалось обновить поездку', error);
      Alert.alert('Ошибка', 'Не удалось сохранить поездку.');
    }
  };

  const handleDeleteTrip = () => {
    if (!trip) return;

    Alert.alert('Удалить поездку', 'Точно удалить эту поездку?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTrip(trip.id);
            router.back();
          } catch (error) {
            console.error('Не удалось удалить поездку', error);
            Alert.alert('Ошибка', 'Не удалось удалить поездку.');
          }
        },
      },
    ]);
  };

  const handleAddPlace = () => {
    router.push({ pathname: '/trips/[id]/add-place', params: { id: String(tripId) } });
  };

  const handleDeleteTripPlace = (tripPlaceId: number) => {
    Alert.alert('Удалить место из маршрута', 'Точно удалить это место из поездки?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTripPlace(tripPlaceId);
            const updated = tripPlaces.filter((tp) => tp.id !== tripPlaceId);
            setTripPlaces(updated);
          } catch (error) {
            console.error('Не удалось удалить место из поездки', error);
            Alert.alert('Ошибка', 'Не удалось удалить место из маршрута.');
          }
        },
      },
    ]);
  };

  const swapOrder = async (indexA: number, indexB: number) => {
    const list = [...tripPlaces];
    const a = list[indexA];
    const b = list[indexB];
    list[indexA] = { ...b, order: a.order };
    list[indexB] = { ...a, order: b.order };
    setTripPlaces(list);

    try {
      await Promise.all([
        updateTripPlace(a.id, { order: b.order }),
        updateTripPlace(b.id, { order: a.order }),
      ]);
    } catch (error) {
      console.error('Не удалось изменить порядок мест', error);
      Alert.alert('Ошибка', 'Не удалось изменить порядок маршрута.');
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Поездка" />
        <View style={styles.loadingContainer}>
          <Text>Загрузка...</Text>
        </View>
      </>
    );
  }

  if (!trip) {
    return null;
  }

  return (
    <>
      <AppHeader title="Поездка" />

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          label="Название"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Описание"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          style={styles.input}
          multiline
        />

        <TextInput
          label="Дата начала"
          value={startDate}
          onChangeText={setStartDate}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Дата окончания"
          value={endDate}
          onChangeText={setEndDate}
          mode="outlined"
          style={styles.input}
        />

        <View style={styles.row}>
          <Text>Текущая поездка</Text>
          <Switch value={current} onValueChange={setCurrent} />
        </View>

        <PrimaryButton onPress={handleSaveTrip}>Сохранить поездку</PrimaryButton>

        <PrimaryButton onPress={handleDeleteTrip} mode="outlined">
          Удалить поездку
        </PrimaryButton>

        <View style={styles.sectionHeader}>
          <Text variant="titleMedium">Маршрут поездки</Text>
          <PrimaryButton compact onPress={handleAddPlace}>
            Добавить место
          </PrimaryButton>
        </View>

        {tripPlaces.length === 0 ? (
          <Text>Пока нет мест в маршруте.</Text>
        ) : (
          tripPlaces.map((item, index) => (
            <List.Item
              key={item.id}
              title={item.place?.name ?? 'Место'}
              description={item.place?.description ?? undefined}
              left={(props) => <List.Icon {...props} icon="map-marker" />}
              right={() => (
                <View style={styles.row}>
                  <IconButton
                    icon="arrow-up"
                    disabled={index === 0}
                    onPress={() => index > 0 && swapOrder(index, index - 1)}
                  />
                  <IconButton
                    icon="arrow-down"
                    disabled={index === tripPlaces.length - 1}
                    onPress={() =>
                      index < tripPlaces.length - 1 && swapOrder(index, index + 1)
                    }
                  />
                  <IconButton
                    icon="delete"
                    onPress={() => handleDeleteTripPlace(item.id)}
                  />
                </View>
              )}
            />
          ))
        )}
      </ScrollView>
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
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

