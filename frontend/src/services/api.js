import axios from "axios";
import { TOKEN_KEY } from "../context/AuthContext";

const browserHost =
  typeof window !== "undefined" ? window.location.hostname || "localhost" : "localhost";

export const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  `http://${browserHost}:${import.meta.env.VITE_API_PORT || "5000"}`;

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${API_ORIGIN}/api`;

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getErrorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.msg || error?.message || fallback;

export default api;
