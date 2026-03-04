import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, List, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useRouter } from 'expo-router';

import { AppHeader } from '@/components/ui/app-header';
import type { Place } from '@/models';
import { getAllPlaces } from '@/services/database';
import { ScreenBackground } from '@/components/ui/screen-background';
import { MilkCard } from '@/components/ui/milk-card';

export default function PlacesListScreen() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

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
      <AppHeader title={t('places.titleList')} />

      <ScreenBackground>
        <View style={styles.container}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator />
            </View>
          ) : places.length === 0 ? (
            <View style={styles.center}>
              <MilkCard>
                <Text variant="titleMedium" style={styles.emptyTitle}>
                  {t('places.emptyTitle')}
                </Text>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  {t('places.emptyText')}
                </Text>
              </MilkCard>
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
                  titleStyle={[styles.itemTitle, { color: theme.colors.onSurface }]}
                  descriptionStyle={[
                    styles.itemDescription,
                    { color: theme.colors.onSurfaceVariant ?? theme.colors.onSurface },
                  ]}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      color={item.liked ? '#FFD54F' : '#E78A1F'}
                      icon={
                        item.liked
                          ? 'star'
                          : item.visitLater
                            ? 'clock-outline'
                            : 'checkbox-blank-circle-outline'
                      }
                    />
                  )}
                />
              )}
            />
          )}

          <FAB
            style={[styles.fab, { backgroundColor: theme.colors.primary }]}
            icon="plus"
            color="#000000"
            onPress={handleAddPlace}
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
  itemTitle: {
    fontWeight: '500',
  },
  itemDescription: {},
});

