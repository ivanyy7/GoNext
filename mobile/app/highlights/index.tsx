import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Chip, FAB, List, Text } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';

import { AppHeader } from '@/components/ui/app-header';
import type { Highlight, Trip } from '@/models';
import { getActiveTrip, getAllHighlights, getHighlightsByTrip } from '@/services/database';

type FilterMode = 'all' | 'current';

export default function HighlightsListScreen() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [mode, setMode] = useState<FilterMode>('current');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadData = async (filterMode: FilterMode) => {
    try {
      setLoading(true);
      const trip = await getActiveTrip();
      setActiveTrip(trip);

      let data: Highlight[] = [];
      if (filterMode === 'current' && trip) {
        data = await getHighlightsByTrip(trip.id);
      } else {
        data = await getAllHighlights();
      }
      setHighlights(data);
    } catch (error) {
      console.error('Не удалось загрузить достопримечательности', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData(mode);
    }, [mode])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(mode);
  };

  const handleAddHighlight = () => {
    router.push('/highlights/new');
  };

  const handleOpenHighlight = (id: number) => {
    router.push({ pathname: '/highlights/[id]', params: { id: String(id) } });
  };

  const formatDate = (highlight: Highlight): string | undefined => {
    if (highlight.date) return highlight.date;
    return undefined;
  };

  return (
    <>
      <AppHeader title="Достопримечательности" />

      <View style={styles.container}>
        <View style={styles.chipsRow}>
          <Chip
            selected={mode === 'current'}
            onPress={() => setMode('current')}
            disabled={!activeTrip}
          >
            {activeTrip ? `Текущая поездка: ${activeTrip.title}` : 'Нет текущей поездки'}
          </Chip>
          <Chip selected={mode === 'all'} onPress={() => setMode('all')}>
            Все
          </Chip>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : highlights.length === 0 ? (
          <View style={styles.center}>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Пока нет ни одной записи о достопримечательностях. Нажми «+», чтобы создать
              первую.
            </Text>
          </View>
        ) : (
          <FlatList
            data={highlights}
            keyExtractor={(item) => String(item.id)}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            renderItem={({ item }) => (
              <List.Item
                title={item.title}
                description={formatDate(item)}
                onPress={() => handleOpenHighlight(item.id)}
                left={(props) => <List.Icon {...props} icon="star" />}
              />
            )}
          />
        )}

        <FAB style={styles.fab} icon="plus" onPress={handleAddHighlight} />
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
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

