export interface Client {
  fullName: string;
  id: number;
  phoneNumber: string;
  subscriptions: {
    id: number;
    expires: string;
    sport: {
      id: number;
      name: string;
      price: number;
    };
    type: "Разовый" | "Месячный" | "Годовой";
  }[];
  trainers: {
    id: number;
    fullName: string;
    phoneNumber: string;
    sport: {
      id: number;
      title: string;
      price: number;
    } | null;
  }[];
}

