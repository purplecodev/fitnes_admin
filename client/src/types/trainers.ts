export interface Trainer {
  id: number;
  fullName: string;
  phoneNumber: string;
  sport: {
    id: number;
    title: string;
    price: number;
  } | null;
}
