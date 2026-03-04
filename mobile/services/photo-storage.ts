// Заглушка для сред, отличных от native (например, web).
// В этом проекте мы фокусируемся только на мобильных платформах.

export function resolvePhotoUri(path: string): string {
  return path;
}

export async function savePlacePhoto(placeId: number, sourceUri: string): Promise<string> {
  // На не‑mobile платформах просто возвращаем исходный URI.
  return sourceUri;
}

export async function deleteAllPlacePhotos(placeId: number): Promise<void> {
  // Ничего не делаем.
}

export async function saveHighlightPhoto(highlightId: number, sourceUri: string): Promise<string> {
  // На не‑mobile платформах просто возвращаем исходный URI.
  return sourceUri;
}

export async function deleteAllHighlightPhotos(highlightId: number): Promise<void> {
  // Ничего не делаем.
}

