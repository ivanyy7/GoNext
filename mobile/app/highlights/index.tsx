import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Chip, FAB, List, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useRouter } from 'expo-router';

import { AppHeader } from '@/components/ui/app-header';
import type { Highlight, Trip } from '@/models';
import { getActiveTrip, getAllHighlights, getHighlightsByTrip } from '@/services/database';
import { ScreenBackground } from '@/components/ui/screen-background';
import { MilkCard } from '@/components/ui/milk-card';

type FilterMode = 'all' | 'current';

export default function HighlightsListScreen() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [mode, setMode] = useState<FilterMode>('current');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

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
      <AppHeader title={t('highlights.titleList')} />

      <ScreenBackground>
        <View style={styles.container}>
          <View style={styles.chipsRow}>
            <Chip
              selected={mode === 'current'}
              onPress={() => setMode('current')}
              disabled={!activeTrip}
            textStyle={styles.chipText}
            >
              {activeTrip
                ? t('highlights.filterCurrentTripPrefix', { title: activeTrip.title })
                : t('highlights.filterNoCurrentTrip')}
            </Chip>
          <Chip
            selected={mode === 'all'}
            onPress={() => setMode('all')}
            textStyle={styles.chipTextAll}
          >
              {t('highlights.filterAll')}
            </Chip>
          </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : highlights.length === 0 ? (
          <View style={styles.center}>
            <MilkCard>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                {t('highlights.emptyTitle')}
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                {t('highlights.emptyText')}
              </Text>
            </MilkCard>
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
                  titleStyle={[styles.itemTitle, { color: theme.colors.onSurface }]}
                  descriptionStyle={[
                    styles.itemDescription,
                    { color: theme.colors.onSurfaceVariant ?? theme.colors.onSurface },
                  ]}
                  left={(props) => <List.Icon {...props} color="#E78A1F" icon="star" />}
                />
              )}
            />
          )}

          <FAB
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            icon="plus"
            color="#000000"
            onPress={handleAddHighlight}
          />
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
  emptyText: {
    textAlign: 'center',
    fontSize: 17,
    color: '#3E3A4F',
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chipText: {
    color: '#2A2340',
    fontWeight: '500',
  },
  chipTextAll: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  itemTitle: {
    fontWeight: '500',
  },
  itemDescription: {},
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
    color: '#757083',
    fontSize: 20,
  },
});

