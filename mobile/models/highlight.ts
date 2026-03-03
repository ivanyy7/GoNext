export type HighlightId = number;

export interface Highlight {
  id: HighlightId;
  title: string;
  description: string | null;
  placeId: number | null;
  tripId: number | null;
  date: string | null; // дата/время события
  photos: string[]; // URI фотографий, связанных с событием
  createdAt: string; // ISO‑дата создания записи
}

