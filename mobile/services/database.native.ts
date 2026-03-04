import * as SQLite from 'expo-sqlite';

import { Highlight, Place, Trip, TripPlace } from '@/models';

const DB_NAME = 'gonext.db';

// Открываем (или создаём) локальную базу данных приложения с помощью нового async‑API.
// Кэшируем промис, чтобы база открывалась только один раз.
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
}

type SQLResultSetRowList = {
  _array: any[];
};

type SQLResultSet = {
  rows: SQLResultSetRowList;
  insertId: number | null;
  rowsAffected: number;
};

async function executeSql(
  sql: string,
  params: (string | number | null)[] = []
): Promise<SQLResultSet> {
  const db = await getDb();
  const trimmed = sql.trim().toUpperCase();

  // Простая эвристика: SELECT → читаем все строки, остальные → команда изменения данных.
  if (trimmed.startsWith('SELECT')) {
    const rows = await db.getAllAsync<any>(sql, params);
    return {
      rows: { _array: rows },
      insertId: null,
      rowsAffected: rows.length,
    };
  }

  // На Android параметры лучше передавать по одному (variadic), иначе возможны сбои.
  const result = await db.runAsync(sql, ...params);
  const rawId = result.lastInsertRowId;
  const insertId =
    rawId == null ? null : typeof rawId === 'bigint' ? Number(rawId) : Number(rawId);
  return {
    rows: { _array: [] },
    insertId: insertId ?? null,
    rowsAffected: result.changes,
  };
}

// Создание таблиц, если они ещё не существуют.
export async function initDatabase(): Promise<void> {
  // Таблица мест
  await executeSql(
    `CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      visit_later INTEGER NOT NULL DEFAULT 0,
      liked INTEGER NOT NULL DEFAULT 0,
      latitude REAL,
      longitude REAL,
      photos_json TEXT,
      created_at TEXT NOT NULL
    );`
  );

  // Таблица поездок
  await executeSql(
    `CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      start_date TEXT,
      end_date TEXT,
      created_at TEXT NOT NULL,
      current INTEGER NOT NULL DEFAULT 0
    );`
  );

  // Таблица мест в поездке
  await executeSql(
    `CREATE TABLE IF NOT EXISTS trip_places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      place_id INTEGER NOT NULL,
      order_index INTEGER NOT NULL,
      visited INTEGER NOT NULL DEFAULT 0,
      visit_date TEXT,
      notes TEXT,
      photos_json TEXT,
      FOREIGN KEY (trip_id) REFERENCES trips(id),
      FOREIGN KEY (place_id) REFERENCES places(id)
    );`
  );

  // Таблица достопримечательностей / событий
  await executeSql(
    `CREATE TABLE IF NOT EXISTS highlights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      place_id INTEGER,
      trip_id INTEGER,
      date TEXT,
      photos_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (place_id) REFERENCES places(id),
      FOREIGN KEY (trip_id) REFERENCES trips(id)
    );`
  );
}

// Мапперы между строками БД и доменными моделями.

function parseBoolean(value: number | null): boolean {
  return value === 1;
}

function boolToInt(value: boolean): 0 | 1 {
  return value ? 1 : 0;
}

export function rowToPlace(row: any): Place {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    visitLater: parseBoolean(row.visit_later),
    liked: parseBoolean(row.liked),
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    photos: row.photos_json ? JSON.parse(row.photos_json) : [],
    createdAt: row.created_at,
  };
}

export function rowToTrip(row: any): Trip {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    startDate: row.start_date ?? null,
    endDate: row.end_date ?? null,
    createdAt: row.created_at,
    current: parseBoolean(row.current),
  };
}

export function rowToTripPlace(row: any): TripPlace {
  return {
    id: row.id,
    tripId: row.trip_id,
    placeId: row.place_id,
    order: row.order_index,
    visited: parseBoolean(row.visited),
    visitDate: row.visit_date ?? null,
    notes: row.notes ?? null,
    photos: row.photos_json ? JSON.parse(row.photos_json) : [],
  };
}

export function rowToHighlight(row: any): Highlight {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    placeId: row.place_id ?? null,
    tripId: row.trip_id ?? null,
    date: row.date ?? null,
    photos: row.photos_json ? JSON.parse(row.photos_json) : [],
    createdAt: row.created_at,
  };
}

// CRUD‑операции для сущностей.

// Places
export async function getAllPlaces(): Promise<Place[]> {
  const result = await executeSql('SELECT * FROM places ORDER BY created_at DESC;');
  const rows = result.rows._array ?? [];
  return rows.map(rowToPlace);
}

export async function getPlaceById(id: number): Promise<Place | null> {
  const result = await executeSql('SELECT * FROM places WHERE id = ?;', [id]);
  const rows = result.rows._array ?? [];
  return rows.length ? rowToPlace(rows[0]) : null;
}

export async function createPlace(data: Omit<Place, 'id' | 'createdAt'>): Promise<Place> {
  const createdAt = new Date().toISOString();
  const photosJson = JSON.stringify(data.photos ?? []);

  const result = await executeSql(
    `INSERT INTO places (name, description, visit_later, liked, latitude, longitude, photos_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      data.name,
      data.description,
      boolToInt(data.visitLater),
      boolToInt(data.liked),
      data.latitude,
      data.longitude,
      photosJson,
      createdAt,
    ]
  );

  const insertId = result.insertId;
  if (insertId == null || !Number.isInteger(insertId) || insertId < 1) {
    throw new Error(
      `Сохранение места: неверный id после INSERT (lastInsertRowId=${result.insertId})`
    );
  }
  const place = await getPlaceById(insertId);
  if (!place) {
    throw new Error('Не удалось прочитать добавленное место из базы данных');
  }
  return place;
}

export async function updatePlace(id: number, data: Partial<Omit<Place, 'id'>>): Promise<Place> {
  const current = await getPlaceById(id);
  if (!current) {
    throw new Error('Место не найдено');
  }

  const merged: Place = {
    ...current,
    ...data,
  };

  const photosJson = JSON.stringify(merged.photos ?? []);

  await executeSql(
    `UPDATE places
     SET name = ?, description = ?, visit_later = ?, liked = ?, latitude = ?, longitude = ?, photos_json = ?
     WHERE id = ?;`,
    [
      merged.name,
      merged.description,
      boolToInt(merged.visitLater),
      boolToInt(merged.liked),
      merged.latitude,
      merged.longitude,
      photosJson,
      id,
    ]
  );

  const updated = await getPlaceById(id);
  if (!updated) {
    throw new Error('Не удалось обновить место');
  }
  return updated;
}

export async function deletePlace(id: number): Promise<void> {
  await executeSql('DELETE FROM places WHERE id = ?;', [id]);
}

// Trips
export async function getAllTrips(): Promise<Trip[]> {
  const result = await executeSql('SELECT * FROM trips ORDER BY created_at DESC;');
  const rows = result.rows._array ?? [];
  return rows.map(rowToTrip);
}

export async function getActiveTrip(): Promise<Trip | null> {
  const result = await executeSql('SELECT * FROM trips WHERE current = 1 ORDER BY created_at DESC;');
  const rows = result.rows._array ?? [];
  if (rows.length > 0) {
    return rowToTrip(rows[0]);
  }

  const allTrips = await getAllTrips();
  return allTrips.length > 0 ? allTrips[0] : null;
}

export async function getTripById(id: number): Promise<Trip | null> {
  const result = await executeSql('SELECT * FROM trips WHERE id = ?;', [id]);
  const rows = result.rows._array ?? [];
  return rows.length ? rowToTrip(rows[0]) : null;
}

export async function createTrip(data: Omit<Trip, 'id' | 'createdAt'>): Promise<Trip> {
  const createdAt = new Date().toISOString();

  const result = await executeSql(
    `INSERT INTO trips (title, description, start_date, end_date, created_at, current)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [
      data.title,
      data.description,
      data.startDate,
      data.endDate,
      createdAt,
      boolToInt(data.current),
    ]
  );

  const insertId = result.insertId;
  if (insertId == null || !Number.isInteger(insertId) || insertId < 1) {
    throw new Error(
      `Сохранение поездки: неверный id после INSERT (lastInsertRowId=${result.insertId})`
    );
  }
  const trip = await getTripById(insertId);
  if (!trip) {
    throw new Error('Не удалось прочитать добавленную поездку из базы данных');
  }
  return trip;
}

export async function updateTrip(id: number, data: Partial<Omit<Trip, 'id'>>): Promise<Trip> {
  const current = await getTripById(id);
  if (!current) {
    throw new Error('Поездка не найдена');
  }

  const merged: Trip = {
    ...current,
    ...data,
  };

  await executeSql(
    `UPDATE trips
     SET title = ?, description = ?, start_date = ?, end_date = ?, created_at = ?, current = ?
     WHERE id = ?;`,
    [
      merged.title,
      merged.description,
      merged.startDate,
      merged.endDate,
      merged.createdAt,
      boolToInt(merged.current),
      id,
    ]
  );

  const updated = await getTripById(id);
  if (!updated) {
    throw new Error('Не удалось обновить поездку');
  }
  return updated;
}

export async function deleteTrip(id: number): Promise<void> {
  await executeSql('DELETE FROM trips WHERE id = ?;', [id]);
}

// TripPlaces
export async function getTripPlaces(tripId: number): Promise<TripPlace[]> {
  const result = await executeSql(
    'SELECT * FROM trip_places WHERE trip_id = ? ORDER BY order_index ASC;',
    [tripId]
  );
  const rows = result.rows._array ?? [];
  return rows.map(rowToTripPlace);
}

export async function addTripPlace(data: Omit<TripPlace, 'id'>): Promise<TripPlace> {
  const photosJson = JSON.stringify(data.photos ?? []);

  const result = await executeSql(
    `INSERT INTO trip_places (trip_id, place_id, order_index, visited, visit_date, notes, photos_json)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      data.tripId,
      data.placeId,
      data.order,
      boolToInt(data.visited),
      data.visitDate,
      data.notes,
      photosJson,
    ]
  );

  const insertId = result.insertId;
  if (insertId == null || !Number.isInteger(insertId) || insertId < 1) {
    throw new Error(
      `Добавление места в поездку: неверный id после INSERT (lastInsertRowId=${result.insertId})`
    );
  }
  const all = await getTripPlaces(data.tripId);
  const created = all.find((tp) => tp.id === insertId);
  if (!created) {
    throw new Error('Не удалось прочитать добавленное место поездки');
  }
  return created;
}

export async function updateTripPlace(
  id: number,
  data: Partial<Omit<TripPlace, 'id' | 'tripId' | 'placeId'>>
): Promise<TripPlace> {
  const result = await executeSql('SELECT * FROM trip_places WHERE id = ?;', [id]);
  const rows = result.rows._array ?? [];
  if (!rows.length) {
    throw new Error('Место в поездке не найдено');
  }
  const current = rowToTripPlace(rows[0]);

  const merged: TripPlace = {
    ...current,
    ...data,
  };

  const photosJson = JSON.stringify(merged.photos ?? []);

  await executeSql(
    `UPDATE trip_places
     SET order_index = ?, visited = ?, visit_date = ?, notes = ?, photos_json = ?
     WHERE id = ?;`,
    [
      merged.order,
      boolToInt(merged.visited),
      merged.visitDate,
      merged.notes,
      photosJson,
      id,
    ]
  );

  const updatedResult = await executeSql('SELECT * FROM trip_places WHERE id = ?;', [id]);
  const updatedRows = updatedResult.rows._array ?? [];
  if (!updatedRows.length) {
    throw new Error('Не удалось обновить место в поездке');
  }

  return rowToTripPlace(updatedRows[0]);
}

export async function deleteTripPlace(id: number): Promise<void> {
  await executeSql('DELETE FROM trip_places WHERE id = ?;', [id]);
}

// Highlights
export async function getAllHighlights(): Promise<Highlight[]> {
  const result = await executeSql('SELECT * FROM highlights ORDER BY date DESC, created_at DESC;');
  const rows = result.rows._array ?? [];
  return rows.map(rowToHighlight);
}

export async function getHighlightsByTrip(tripId: number): Promise<Highlight[]> {
  const result = await executeSql(
    'SELECT * FROM highlights WHERE trip_id = ? ORDER BY date DESC, created_at DESC;',
    [tripId]
  );
  const rows = result.rows._array ?? [];
  return rows.map(rowToHighlight);
}

export async function getHighlightById(id: number): Promise<Highlight | null> {
  const result = await executeSql('SELECT * FROM highlights WHERE id = ?;', [id]);
  const rows = result.rows._array ?? [];
  return rows.length ? rowToHighlight(rows[0]) : null;
}

export async function createHighlight(data: Omit<Highlight, 'id' | 'createdAt'>): Promise<Highlight> {
  const createdAt = new Date().toISOString();
  const photosJson = JSON.stringify(data.photos ?? []);

  const result = await executeSql(
    `INSERT INTO highlights (title, description, place_id, trip_id, date, photos_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      data.title,
      data.description,
      data.placeId,
      data.tripId,
      data.date,
      photosJson,
      createdAt,
    ]
  );

  const insertId = result.insertId;
  if (insertId == null || !Number.isInteger(insertId) || insertId < 1) {
    throw new Error(
      `Сохранение достопримечательности: неверный id после INSERT (lastInsertRowId=${result.insertId})`
    );
  }
  const highlightResult = await executeSql('SELECT * FROM highlights WHERE id = ?;', [insertId]);
  const rows = highlightResult.rows._array ?? [];
  if (!rows.length) {
    throw new Error('Не удалось прочитать добавленную достопримечательность/событие');
  }
  return rowToHighlight(rows[0]);
}

export async function updateHighlight(
  id: number,
  data: Partial<Omit<Highlight, 'id'>>
): Promise<Highlight> {
  const current = await getHighlightById(id);
  if (!current) {
    throw new Error('Достопримечательность не найдена');
  }

  const merged: Highlight = {
    ...current,
    ...data,
  };

  const photosJson = JSON.stringify(merged.photos ?? []);

  await executeSql(
    `UPDATE highlights
     SET title = ?, description = ?, place_id = ?, trip_id = ?, date = ?, photos_json = ?
     WHERE id = ?;`,
    [merged.title, merged.description, merged.placeId, merged.tripId, merged.date, photosJson, id]
  );

  const updated = await getHighlightById(id);
  if (!updated) {
    throw new Error('Не удалось обновить запись о достопримечательности');
  }
  return updated;
}

export async function deleteHighlight(id: number): Promise<void> {
  await executeSql('DELETE FROM highlights WHERE id = ?;', [id]);
}

