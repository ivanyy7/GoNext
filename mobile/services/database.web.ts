import type { Highlight, Place, Trip, TripPlace } from '@/models';

// Заглушечная реализация для веба:
// Expo SQLite в этом проекте используется только на мобильных платформах.
// В веб-версии мы не работаем с реальной БД, а возвращаем пустые данные
// или бросаем понятные ошибки при попытке записи.

export async function initDatabase(): Promise<void> {
  console.warn(
    '[GoNext] initDatabase (web): SQLite не инициализируется в веб-версии, данные не сохраняются.'
  );
}

// Places
export async function getAllPlaces(): Promise<Place[]> {
  return [];
}

export async function getPlaceById(_id: number): Promise<Place | null> {
  return null;
}

export async function createPlace(_data: Omit<Place, 'id' | 'createdAt'>): Promise<Place> {
  throw new Error('Создание мест недоступно в веб-версии (SQLite только на мобильных).');
}

export async function updatePlace(
  _id: number,
  _data: Partial<Omit<Place, 'id'>>
): Promise<Place> {
  throw new Error('Редактирование мест недоступно в веб-версии (SQLite только на мобильных).');
}

export async function deletePlace(_id: number): Promise<void> {
  throw new Error('Удаление мест недоступно в веб-версии (SQLite только на мобильных).');
}

// Trips
export async function getAllTrips(): Promise<Trip[]> {
  return [];
}

export async function getActiveTrip(): Promise<Trip | null> {
  return null;
}

export async function getTripById(_id: number): Promise<Trip | null> {
  return null;
}

export async function createTrip(_data: Omit<Trip, 'id' | 'createdAt'>): Promise<Trip> {
  throw new Error('Создание поездок недоступно в веб-версии (SQLite только на мобильных).');
}

export async function updateTrip(
  _id: number,
  _data: Partial<Omit<Trip, 'id'>>
): Promise<Trip> {
  throw new Error('Редактирование поездок недоступно в веб-версии (SQLite только на мобильных).');
}

export async function deleteTrip(_id: number): Promise<void> {
  throw new Error('Удаление поездок недоступно в веб-версии (SQLite только на мобильных).');
}

// TripPlaces
export async function getTripPlaces(_tripId: number): Promise<TripPlace[]> {
  return [];
}

export async function addTripPlace(
  _data: Omit<TripPlace, 'id'>
): Promise<TripPlace> {
  throw new Error('Маршруты поездок недоступны в веб-версии (SQLite только на мобильных).');
}

export async function updateTripPlace(
  _id: number,
  _data: Partial<Omit<TripPlace, 'id' | 'tripId' | 'placeId'>>
): Promise<TripPlace> {
  throw new Error('Маршруты поездок недоступны в веб-версии (SQLite только на мобильных).');
}

export async function deleteTripPlace(_id: number): Promise<void> {
  throw new Error('Маршруты поездок недоступны в веб-версии (SQLite только на мобильных).');
}

// Highlights
export async function getAllHighlights(): Promise<Highlight[]> {
  return [];
}

export async function getHighlightsByTrip(_tripId: number): Promise<Highlight[]> {
  return [];
}

export async function getHighlightById(_id: number): Promise<Highlight | null> {
  return null;
}

export async function createHighlight(
  _data: Omit<Highlight, 'id' | 'createdAt'>
): Promise<Highlight> {
  throw new Error(
    'Создание записей о достопримечательностях недоступно в веб-версии (SQLite только на мобильных).'
  );
}

export async function deleteHighlight(_id: number): Promise<void> {
  throw new Error(
    'Удаление записей о достопримечательностях недоступно в веб-версии (SQLite только на мобильных).'
  );
}

