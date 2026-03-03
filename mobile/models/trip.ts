export type TripId = number;

export interface Trip {
  id: TripId;
  title: string;
  description: string | null;
  startDate: string | null; // ISO‑дата начала
  endDate: string | null; // ISO‑дата окончания
  createdAt: string; // ISO‑дата создания
  current: boolean; // признак текущей активной поездки
}

