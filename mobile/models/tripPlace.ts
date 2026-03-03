export type TripPlaceId = number;

export interface TripPlace {
  id: TripPlaceId;
  tripId: number;
  placeId: number;
  order: number; // порядок в маршруте
  visited: boolean;
  visitDate: string | null; // ISO‑дата посещения
  notes: string | null;
  photos: string[]; // URI фотографий, сделанных во время визита
}

