import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const PHOTOS_ROOT = `${FileSystem.documentDirectory}photos/`;

function isAbsoluteUri(path: string): boolean {
  return /^(file:|content:|https?:)/.test(path);
}

async function ensureDir(dir: string): Promise<void> {
  try {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  } catch (error: any) {
    // Если директория уже существует — это не ошибка.
    if (error?.code !== 'E_EXPLICIT_ABORT' && error?.code !== 'EEXIST') {
      throw error;
    }
  }
}

export function resolvePhotoUri(path: string): string {
  if (!path) return path;
  if (isAbsoluteUri(path)) {
    return path;
  }
  return `${PHOTOS_ROOT}${path}`;
}

export async function savePlacePhoto(placeId: number, sourceUri: string): Promise<string> {
  if (Platform.OS === 'web') {
    throw new Error('Хранение фото поддерживается только на мобильных платформах.');
  }

  const dir = `${PHOTOS_ROOT}places/${placeId}/`;
  await ensureDir(dir);

  const extensionMatch = sourceUri.split('?')[0].split('.').pop();
  const extension = extensionMatch && extensionMatch.length <= 5 ? extensionMatch : 'jpg';

  const fileName = `photo-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const destination = `${dir}${fileName}`;

  await FileSystem.copyAsync({ from: sourceUri, to: destination });

  // Относительный путь, который будем хранить в БД.
  return `places/${placeId}/${fileName}`;
}

export async function deleteAllPlacePhotos(placeId: number): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  const dir = `${PHOTOS_ROOT}places/${placeId}/`;
  try {
    await FileSystem.deleteAsync(dir, { idempotent: true });
  } catch {
    // Если папки нет или уже удалена — просто игнорируем.
  }
}

