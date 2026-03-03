export type PlaceId = number;

export interface Place {
  id: PlaceId;
  name: string;
  description: string | null;
  visitLater: boolean;
  liked: boolean;
  latitude: number | null;
  longitude: number | null;
  photos: string[]; // URI фотографий в файловой системе приложения
  createdAt: string; // ISO‑дата
}

