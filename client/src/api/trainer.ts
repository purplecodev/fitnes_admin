import axios from "axios";
import { API_URL } from "./config";

export const getTrainers = async () => {
  try {
    const response = await axios.get(`${API_URL}/trainers`);
    return response.data;
  } catch (error) {
    console.log("Ошибка при получении тренеров", error);
    throw new Error("Ошибка при получении тренеров");
  }
};

export const addTrainer = async (trainerData: {
  fullName: string;
  phoneNumber: string;
  sportId: number;
}) => {
  try {
    await axios.post(`${API_URL}/trainers`, trainerData);
  } catch (error) {
    console.log("Ошибка при добавлениии тренера", error);
    throw new Error("Ошибка при добавлениии тренера");
  }
};
export const editTrainer = async (
  trainerId: number,
  trainerData: {
    fullName: string;
    phoneNumber: string;
    sportId: number;
  }
) => {
  try {
    await axios.put(`${API_URL}/trainers/${trainerId}`, trainerData);
  } catch (error) {
    console.log("Ошибка при изменении тренера", error);
    throw new Error("Ошибка при изменении тренера");
  }
};
export const deleteTrainer = async (trainerId: number) => {
  try {
    await axios.delete(`${API_URL}/trainers/${trainerId}`);
  } catch (error) {
    console.log("Ошибка при добавлениии тренера", error);
    throw new Error("Ошибка при добавлениии тренера");
  }
};
