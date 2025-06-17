import type { Client } from "../types/client";

export const INITIAL_CLIENT: Client = {
  fullName: "",
  id: 1,
  phoneNumber: "",
  subscriptions: [
    {
      id: 1,
      expires: "0000-00-00",
      sport: { id: 1, name: "", price: 0 },
      type: "Разовый",
    },
  ],
  trainers: [
    {
      id: 1,
      fullName: "",
      phoneNumber: "",
      sport: { id: 1, title: "", price: 0 },
    },
  ],
};
