import axios from "axios";
import { API_URL } from "./config";

export interface subscriptionType {
  clientId: number;
  sportId: number;
  type: "Разовый" | "Месячный" | "Годовой";
}

export const getSports = async () => {
  try {
    const response = await axios.get(`${API_URL}/sports`);
    return response.data;
  } catch (error) {
    console.log("Ошибка", error);
    throw new Error("Ошибка при получении видов спорта");
  }
};

export const addSport = async (dataSport: { name: string; price: number }) => {
  try {
    await axios.post(`${API_URL}/sports`, dataSport);
  } catch (error) {
    console.log("Ошибка", error);
    throw new Error("Ошибка при добавлении вида спорта");
  }
};

export const editSport = async (
  sportId: number,
  dataSport: { name: string; price: number }
) => {
  try {
    await axios.put(`${API_URL}/sports/${sportId}`, dataSport);
  } catch (error) {
    console.log("Ошибка", error);
    throw new Error("Ошибка при изменении вида спорта");
  }
};

export const deleteSport = async (sportId: number) => {
  try {
    await axios.delete(`${API_URL}/sports/${sportId}`);
  } catch (error) {
    console.log("Ошибка", error);
    throw new Error("Ошибка при удалении вида спорта");
  }
};

export const addSubscription = async (subscriptionData: subscriptionType) => {
  try {
    await axios.post(`${API_URL}/subscriptions`, subscriptionData);
  } catch (error) {
    console.log("Ошибка", error);
    throw new Error("Ошибка при добавлении абонемента");
  }
};

export const editSubscription = async (
  subscriptionId: number,
  subscriptionData: subscriptionType
) => {
  try {
    await axios.put(
      `${API_URL}/subscriptions/${subscriptionId}`,
      subscriptionData
    );
  } catch (error) {
    console.log("Ошибка", error);
    throw new Error("Ошибка при изменении абонемента");
  }
};

export const deleteSubscription = async (subscriptionId: number) => {
  try {
    await axios.delete(`${API_URL}/subscriptions/${subscriptionId}`);
  } catch (error) {
    console.log("Ошибка", error);
    throw new Error("Ошибка при удалении абонемента");
  }
};
