import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api/v1",
  withCredentials: true
});

export async function get<T>(url: string) {
  const response = await api.get<{ success: boolean; data: T }>(url);
  return response.data.data;
}

export async function post<T>(url: string, data?: unknown) {
  const response = await api.post<{ success: boolean; data: T }>(url, data);
  return response.data.data;
}
