import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, List, Text } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';

import { AppHeader } from '@/components/ui/app-header';
import type { Trip } from '@/models';
import { getAllTrips } from '@/services/database';

export default function TripsListScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadTrips = async () => {
    try {
      const data = await getAllTrips();
      setTrips(data);
    } catch (error) {
      console.error('Не удалось загрузить список поездок', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadTrips();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadTrips();
  };

  const handleAddTrip = () => {
    router.push('/trips/new');
  };

  const handleOpenTrip = (id: number) => {
    router.push({ pathname: '/trips/[id]', params: { id: String(id) } });
  };

  const formatDates = (trip: Trip): string | undefined => {
    if (!trip.startDate && !trip.endDate) return undefined;
    if (trip.startDate && trip.endDate) {
      return `${trip.startDate} — ${trip.endDate}`;
    }
    if (trip.startDate) return `c ${trip.startDate}`;
    if (trip.endDate) return `до ${trip.endDate}`;
  };

  return (
    <>
      <AppHeader title="Поездки" />

      <View style={styles.container}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : trips.length === 0 ? (
          <View style={styles.center}>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Пока нет ни одной поездки. Нажми на кнопку «+», чтобы создать первую.
            </Text>
          </View>
        ) : (
          <FlatList
            data={trips}
            keyExtractor={(item) => String(item.id)}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            renderItem={({ item }) => (
              <List.Item
                title={item.title}
                description={formatDates(item)}
                onPress={() => handleOpenTrip(item.id)}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon={item.current ? 'airplane-takeoff' : 'calendar-range'}
                  />
                )}
              />
            )}
          />
        )}

        <FAB style={styles.fab} icon="plus" onPress={handleAddTrip} />
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
  emptyText: {
    textAlign: 'center',
    color: '#4A4A4A',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

