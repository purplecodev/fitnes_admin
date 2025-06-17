import axios from "axios";
import { API_URL } from "./config";

interface ClientData {
  fullName: string;
  phoneNumber: string;
}

export const getClients = async () => {
  try {
    const response = await axios.get(`${API_URL}/clients`);
    return response.data;
  } catch (error) {
    console.log("Ошибка при получении клиентов:", error);
    throw new Error("Ошибка при получении клиентов");
  }
};

export const addClient = async (newClient: ClientData) => {
  try {
    await axios.post(`${API_URL}/clients`, newClient);
  } catch (error) {
    console.log("Ошибка при добавлении клиента:", error);
    throw new Error("Ошибка при добавлении клиента");
  }
};

export const deleteClient = async (clientId: number) => {
  try {
    await axios.delete(`${API_URL}/clients/${clientId}`);
  } catch (error) {
    console.log("Ошибка при удалении клиента:", error);
    throw new Error("Ошибка при удалении клиента");
  }
};

export const editClient = async (
  clientId: number,
  newDataClient: ClientData
) => {
  try {
    await axios.put(`${API_URL}/clients/${clientId}`, newDataClient);
  } catch (error) {
    console.log("Ошибка при изменении клиента:", error);
    throw new Error("Ошибка при изменении клиента");
  }
};

export const addTrainerToClient = async (
  clientId: number,
  trainerId: number
) => {
  try {
    await axios.put(`${API_URL}/clients/${clientId}/trainers`, {
      trainerId: trainerId,
    });
  } catch (error) {
    console.log("Ошибка при добавлении тренера клиенту:", error);
    throw new Error("Ошибка при добавлении тренера клиенту");
  }
};

export const removeTrainerFromClient = async (
  clientId: number,
  trainerId: number
) => {
  try {
    await axios.delete(`${API_URL}/clients/${clientId}/trainers/${trainerId}`);
  } catch (error) {
    console.log("Ошибка при удалении тренера клиенту:", error);
    throw new Error("Ошибка при удалении тренера клиенту");
  }
};
