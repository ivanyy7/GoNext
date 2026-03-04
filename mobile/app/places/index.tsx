import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, List, Text } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';

import { AppHeader } from '@/components/ui/app-header';
import type { Place } from '@/models';
import { getAllPlaces } from '@/services/database';
import { ScreenBackground } from '@/components/ui/screen-background';

export default function PlacesListScreen() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadPlaces = async () => {
    try {
      const data = await getAllPlaces();
      setPlaces(data);
    } catch (error) {
      console.error('Не удалось загрузить список мест', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadPlaces();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadPlaces();
  };

  const handleAddPlace = () => {
    router.push('/places/new');
  };

  const handleOpenPlace = (id: number) => {
    router.push({ pathname: '/places/[id]', params: { id: String(id) } });
  };

  return (
    <>
      <AppHeader title="Места" />

      <ScreenBackground>
        <View style={styles.container}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator />
            </View>
          ) : places.length === 0 ? (
            <View style={styles.center}>
              <View style={styles.emptyCard}>
                <Text variant="titleMedium" style={styles.emptyTitle}>
                  Пока нет ни одного места
                </Text>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  Нажми на кнопку «+», чтобы добавить первое место в свой дневник.
                </Text>
              </View>
            </View>
          ) : (
            <FlatList
              data={places}
              keyExtractor={(item) => String(item.id)}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              renderItem={({ item }) => (
                <List.Item
                  title={item.name}
                  description={item.description ?? undefined}
                  onPress={() => handleOpenPlace(item.id)}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={
                        item.liked ? 'star' : item.visitLater ? 'clock-outline' : 'map-marker'
                      }
                    />
                  )}
                />
              )}
            />
          )}

          <FAB style={styles.fab} icon="plus" onPress={handleAddPlace} />
        </View>
      </ScreenBackground>
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
  emptyCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
    color: '#757083',
    fontSize: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 17,
    color: '#827F8D',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

