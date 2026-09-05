import axios from "axios";

export const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true
});

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function post<T>(url: string, data?: unknown) {
  try {
    const response = await api.post<ApiResponse<T>>(url, data);
    const resData = response.data;
    if (!resData.success) throw new Error(resData.error || "Request failed");
    if (!resData.data) throw new Error("No data returned from server");
    return resData.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message);
  }
}

export async function get<T>(url: string) {
  try {
    const response = await api.get<ApiResponse<T>>(url);
    const resData = response.data;
    if (!resData.success) throw new Error(resData.error || "Request failed");
    if (!resData.data) throw new Error("No data returned from server");
    return resData.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message);
  }
}
